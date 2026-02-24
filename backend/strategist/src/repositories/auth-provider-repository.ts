/**
 * Auth provider repository - manages authentication provider operations
 * Note: Errors propagate to route layer for centralized handling
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[AuthProviderRepo]' });

export interface AuthProvider {
  id: string;
  user_id: string;
  provider: 'google' | 'email';
  email: string;
  provider_user_id?: string;
  password_hash?: string;
  is_primary: number;
  verified: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get auth provider by email and provider type
 */
export async function getAuthProviderByEmail(
  db: D1Database,
  provider: 'google' | 'email',
  email: string
): Promise<AuthProvider | null> {
  const result = await db.prepare(`
    SELECT * FROM auth_providers
    WHERE provider = ? AND email = ?
  `).bind(provider, email).first<AuthProvider>();

  return result || null;
}

/**
 * Get auth provider by provider user ID (e.g., Google ID)
 */
export async function getAuthProviderByProviderId(
  db: D1Database,
  provider: 'google' | 'email',
  providerUserId: string
): Promise<AuthProvider | null> {
  const result = await db.prepare(`
    SELECT * FROM auth_providers
    WHERE provider = ? AND provider_user_id = ?
  `).bind(provider, providerUserId).first<AuthProvider>();

  return result || null;
}

/**
 * Get auth provider with joined user data for login
 */
export async function getAuthProviderWithUser(
  db: D1Database,
  provider: 'google' | 'email',
  email: string
) {
  const result = await db.prepare(`
    SELECT
      ap.*,
      u.id as user_id,
      u.name,
      u.email as user_email,
      u.email_verified,
      u.picture,
      u.type
    FROM auth_providers ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.provider = ? AND ap.email = ?
  `).bind(provider, email).first();

  return result || null;
}

/**
 * Create a new auth provider
 */
export async function createAuthProvider(
  db: D1Database,
  data: {
    userId: string;
    provider: 'google' | 'email';
    email: string;
    providerUserId?: string;
    passwordHash?: string;
    isPrimary?: boolean;
    verified?: boolean;
  }
): Promise<{ authId: string }> {
  const authId = generateId('auth_');

  await db.prepare(`
    INSERT INTO auth_providers (
      id, user_id, provider, email, provider_user_id, password_hash,
      is_primary, verified, last_used_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    authId,
    data.userId,
    data.provider,
    data.email,
    data.providerUserId || null,
    data.passwordHash || null,
    data.isPrimary ? 1 : 0,
    data.verified ? 1 : 0
  ).run();

  log.info('Auth provider created', { authId, provider: data.provider, email: data.email });
  return { authId };
}

/**
 * Update last_used_at timestamp for auth provider
 */
export async function updateLastUsed(
  db: D1Database,
  authProviderId: string
): Promise<{ success: boolean }> {
  await db.prepare(`
    UPDATE auth_providers
    SET last_used_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(authProviderId).run();

  return { success: true };
}

/**
 * Count auth providers for a user
 */
export async function countAuthProvidersForUser(
  db: D1Database,
  userId: string
): Promise<number> {
  const result = await db.prepare(`
    SELECT COUNT(*) as count FROM auth_providers WHERE user_id = ?
  `).bind(userId).first<{ count: number }>();

  return result?.count || 0;
}

/**
 * Check if Google auth exists for user
 */
export async function checkGoogleAuthExists(
  db: D1Database,
  userId: string,
  googleId: string
): Promise<AuthProvider | null> {
  const result = await db.prepare(`
    SELECT * FROM auth_providers
    WHERE user_id = ? AND provider = 'google' AND provider_user_id = ?
  `).bind(userId, googleId).first<AuthProvider>();

  return result || null;
}

/**
 * Check if email auth exists for user
 */
export async function checkEmailAuthExists(
  db: D1Database,
  userId: string,
  email: string
): Promise<AuthProvider | null> {
  const result = await db.prepare(`
    SELECT * FROM auth_providers
    WHERE user_id = ? AND provider = 'email' AND email = ?
  `).bind(userId, email).first<AuthProvider>();

  return result || null;
}
