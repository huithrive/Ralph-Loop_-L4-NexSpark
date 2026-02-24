/**
 * Authentication Service
 * Handles password hashing, email/password authentication, and account linking
 */

import { generateId } from './database';
import { generateSessionToken, verifySessionToken } from './google-oauth';
import { createLogger } from '../utils/logger';
import { validateInvitationCode, markInvitationUsed } from './invitation';
import { createUser } from '../repositories/user-repository';
import {
  getAuthProviderByEmail,
  getAuthProviderWithUser,
  createAuthProvider,
  updateLastUsed,
  countAuthProvidersForUser,
  checkGoogleAuthExists,
  checkEmailAuthExists
} from '../repositories/auth-provider-repository';

const log = createLogger({ context: '[Auth]' });

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
 * Find user by email WITHOUT auto-creating
 * Returns userId if found, null otherwise
 */
export async function findUserByEmail(
  db: D1Database,
  email: string
): Promise<string | null> {
  const existing = await db.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  if (existing) {
    log.info('User found', { email, userId: existing.id });
    return existing.id as string;
  }

  return null;
}

/**
 * Find or create user by email (for account linking)
 * DEPRECATED: Use findUserByEmail + createUserWithInvitation for new registrations
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
    log.info('User found', { email });
    return existing.id as string;
  }

  // Create new user with random ID
  const userId = generateId('usr_');

  await db.prepare(`
    INSERT INTO users (id, email, name, type, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(userId, email, name, type).run();

  log.info('User created', { userId, email });
  return userId;
}

/**
 * Creates user with invitation code validation
 * Only creates user if invitation is valid
 */
export async function createUserWithInvitation(
  db: D1Database,
  email: string,
  name: string,
  invitationCode: string,
  method: 'google' | 'email',
  type: string = 'brand'
): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  // Validate invitation code
  const validation = await validateInvitationCode(db, invitationCode, email);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  // Create new user
  const registeredVia = method === 'google' ? 'invitation-google' : 'invitation-email';

  const { userId } = await createUser(db, {
    email,
    name,
    type,
    invitationCode,
    registeredVia
  });

  // Mark invitation as used
  await markInvitationUsed(db, validation.invitationId!, userId, email, method);

  log.info('User created with invitation', { userId, email, invitationCode, method });

  return {
    success: true,
    userId
  };
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
  // Check if already linked
  const existing = await checkGoogleAuthExists(db, userId, googleId);

  if (existing) {
    // Update last_used_at
    await updateLastUsed(db, existing.id);
    return;
  }

  // Create new Google auth provider
  await createAuthProvider(db, {
    userId,
    provider: 'google',
    email,
    providerUserId: googleId,
    isPrimary,
    verified: true
  });

  log.info('Google auth linked', { userId, email });
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

  // Check if email auth already exists for this user
  const existing = await checkEmailAuthExists(db, userId, email);

  if (existing) {
    throw new Error('Email/password already linked to this account');
  }

  // Create new email auth provider
  await createAuthProvider(db, {
    userId,
    provider: 'email',
    email,
    passwordHash,
    isPrimary,
    verified: false
  });

  log.info('Email/password linked', { userId, email });
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
  // Find auth provider with user data
  const authProvider = await getAuthProviderWithUser(db, 'email', email);

  if (!authProvider || !authProvider.password_hash) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Verify password
  const valid = await verifyPassword(password, authProvider.password_hash as string);

  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Update last_used_at
  await updateLastUsed(db, authProvider.id as string);

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
 * Requires invitation code for new users, allows account linking without invitation
 */
export async function registerEmailPassword(
  db: D1Database,
  email: string,
  password: string,
  name: string,
  jwtSecret: string,
  type: string = 'brand',
  invitationCode?: string
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
  const existingEmailAuth = await getAuthProviderByEmail(db, 'email', email);

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
    // No invitation code required for account linking
    userId = existingUser.id as string;
    isAccountLink = true;
    log.info('Linking email/password to existing account', { email });
  } else {
    // New user signup - requires invitation code
    if (!invitationCode) {
      return {
        success: false,
        error: 'Invitation code is required for new registrations'
      };
    }

    // Create user with invitation validation
    const result = await createUserWithInvitation(db, email, name, invitationCode, 'email', type);

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    userId = result.userId!;
    log.info('New user created with invitation', { userId, email });
  }

  // Determine if this is primary auth method
  const authCount = await countAuthProvidersForUser(db, userId);
  const isPrimary = authCount === 0;

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
