/**
 * Authentication Service
 * Handles password hashing, email/password authentication, and account linking
 */

import { generateId } from './database';
import { generateSessionToken, verifySessionToken } from './google-oauth';

/**
 * Hash password using Web Crypto API (PBKDF2-SHA-256)
 * Algorithm: PBKDF2, 100,000 iterations (OWASP recommended)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Generate random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive 32-byte key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );

  const hashArray = new Uint8Array(derivedBits);

  // Combine salt + hash for storage
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt, 0);
  combined.set(hashArray, salt.length);

  // Encode as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify password using constant-time comparison
 * Prevents timing attacks
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Decode stored hash
  const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const storedHashBytes = combined.slice(16);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive key using same salt
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const derivedHashBytes = new Uint8Array(derivedBits);

  // Constant-time comparison
  return constantTimeEqual(derivedHashBytes, storedHashBytes);
}

/**
 * Constant-time byte array comparison
 * Prevents timing attacks on password verification
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

/**
 * Find or create user by email (for account linking)
 */
export async function findOrCreateUser(
  db: D1Database,
  email: string,
  name: string,
  type: string = 'brand'
): Promise<string> {
  // Check if user exists with this email
  const existing = await db.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  if (existing) {
    console.log('User found:', email);
    return existing.id as string;
  }

  // Create new user with random ID
  const userId = generateId('usr_');

  await db.prepare(`
    INSERT INTO users (id, email, name, type, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(userId, email, name, type).run();

  console.log('User created:', userId, email);
  return userId;
}

/**
 * Link Google OAuth to user account
 */
export async function linkGoogleAuth(
  db: D1Database,
  userId: string,
  googleId: string,
  email: string,
  isPrimary: boolean = false
): Promise<void> {
  const authId = generateId('auth_');

  // Check if already linked
  const existing = await db.prepare(`
    SELECT id FROM auth_providers
    WHERE user_id = ? AND provider = 'google' AND provider_user_id = ?
  `).bind(userId, googleId).first();

  if (existing) {
    // Update last_used_at
    await db.prepare(`
      UPDATE auth_providers
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(existing.id).run();
    return;
  }

  // Create new Google auth provider
  await db.prepare(`
    INSERT INTO auth_providers (
      id, user_id, provider, provider_user_id, email,
      is_primary, verified, last_used_at, created_at, updated_at
    ) VALUES (?, ?, 'google', ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(authId, userId, googleId, email, isPrimary ? 1 : 0).run();

  console.log('Google auth linked:', userId, email);
}

/**
 * Link email/password to user account
 */
export async function linkEmailPassword(
  db: D1Database,
  userId: string,
  email: string,
  password: string,
  isPrimary: boolean = false
): Promise<void> {
  const passwordHash = await hashPassword(password);
  const authId = generateId('auth_');

  // Check if email auth already exists for this user
  const existing = await db.prepare(`
    SELECT id FROM auth_providers
    WHERE user_id = ? AND provider = 'email' AND email = ?
  `).bind(userId, email).first();

  if (existing) {
    throw new Error('Email/password already linked to this account');
  }

  // Create new email auth provider
  await db.prepare(`
    INSERT INTO auth_providers (
      id, user_id, provider, email, password_hash,
      is_primary, verified, created_at, updated_at
    ) VALUES (?, ?, 'email', ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(authId, userId, email, passwordHash, isPrimary ? 1 : 0).run();

  console.log('Email/password linked:', userId, email);
}

/**
 * Authenticate with email/password
 * Returns JWT token on success
 */
export async function authenticateEmailPassword(
  db: D1Database,
  email: string,
  password: string,
  jwtSecret: string
): Promise<{
  success: boolean;
  user?: any;
  sessionToken?: string;
  error?: string;
}> {
  // Find auth provider
  const authProvider = await db.prepare(`
    SELECT ap.*, u.id as user_id, u.name, u.email as user_email, u.email_verified, u.picture, u.type
    FROM auth_providers ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.provider = 'email' AND ap.email = ?
  `).bind(email).first();

  if (!authProvider || !authProvider.password_hash) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Verify password
  const valid = await verifyPassword(password, authProvider.password_hash as string);

  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Update last_used_at
  await db.prepare(`
    UPDATE auth_providers SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(authProvider.id).run();

  // Generate JWT session token
  const sessionToken = await generateSessionToken(
    authProvider.user_id as string,
    jwtSecret,
    7 * 24 * 60 * 60 * 1000 // 7 days
  );

  // Return user data
  return {
    success: true,
    user: {
      id: authProvider.user_id,
      email: authProvider.user_email,
      name: authProvider.name,
      picture: authProvider.picture,
      email_verified: Boolean(authProvider.email_verified),
      type: authProvider.type
    },
    sessionToken
  };
}

/**
 * Register new user with email/password
 */
export async function registerEmailPassword(
  db: D1Database,
  email: string,
  password: string,
  name: string,
  jwtSecret: string,
  type: string = 'brand'
): Promise<{
  success: boolean;
  user?: any;
  sessionToken?: string;
  error?: string;
  isAccountLink?: boolean;
}> {
  // Validate password strength
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  // Check if email already has email/password auth
  const existingEmailAuth = await db.prepare(`
    SELECT id FROM auth_providers WHERE provider = 'email' AND email = ?
  `).bind(email).first();

  if (existingEmailAuth) {
    return {
      success: false,
      error: 'Email already registered. Please login or reset your password.'
    };
  }

  // Check if user exists (for account linking)
  const existingUser = await db.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  let userId: string;
  let isAccountLink = false;

  if (existingUser) {
    // Account linking: User signed up with Google, now adding email/password
    userId = existingUser.id as string;
    isAccountLink = true;
    console.log('Linking email/password to existing account:', email);
  } else {
    // New user signup
    userId = await findOrCreateUser(db, email, name, type);
  }

  // Determine if this is primary auth method
  const authCount = await db.prepare(`
    SELECT COUNT(*) as count FROM auth_providers WHERE user_id = ?
  `).bind(userId).first();

  const isPrimary = (authCount?.count || 0) === 0;

  // Link email/password auth
  await linkEmailPassword(db, userId, email, password, isPrimary);

  // Generate JWT session token
  const sessionToken = await generateSessionToken(userId, jwtSecret);

  return {
    success: true,
    user: {
      id: userId,
      email: email,
      name: name,
      email_verified: false,
      type: type
    },
    sessionToken,
    isAccountLink
  };
}
