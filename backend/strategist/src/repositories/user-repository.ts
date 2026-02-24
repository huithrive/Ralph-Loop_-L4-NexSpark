/**
 * User repository - manages user and authentication operations
 * Note: Errors propagate to route layer for centralized handling
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[UserRepo]' });

/**
 * Get user by ID
 */
export async function getUserById(db: D1Database, userId: string) {
  return await db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).bind(userId).first();
}

/**
 * Create a new user
 */
export async function createUser(
  db: D1Database,
  data: {
    email: string;
    name: string;
    type?: string;
    invitationCode?: string;
    registeredVia?: string;
  }
): Promise<{ userId: string }> {
  const userId = generateId('usr_');

  await db.prepare(`
    INSERT INTO users (id, email, name, type, email_verified, invitation_code, registered_via, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    userId,
    data.email,
    data.name,
    data.type || 'brand',
    data.invitationCode || null,
    data.registeredVia || null
  ).run();

  log.info('User created', { userId, email: data.email });
  return { userId };
}

/**
 * Update user profile (picture, email_verified)
 */
export async function updateUserProfile(
  db: D1Database,
  userId: string,
  updates: {
    picture?: string;
    emailVerified?: boolean;
  }
): Promise<{ success: boolean }> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.picture !== undefined) {
    fields.push('picture = ?');
    values.push(updates.picture);
  }
  if (updates.emailVerified !== undefined) {
    fields.push('email_verified = ?');
    values.push(updates.emailVerified ? 1 : 0);
  }

  if (fields.length === 0) {
    return { success: true };
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  await db.prepare(`
    UPDATE users SET ${fields.join(', ')} WHERE id = ?
  `).bind(...values, userId).run();

  log.info('User profile updated', { userId });
  return { success: true };
}

/**
 * Atomic quota check and increment (prevents race conditions)
 * Returns { allowed: true } if quota was incremented, { allowed: false, quota } otherwise
 */
export async function checkAndIncrementQuota(
  db: D1Database,
  userId: string
): Promise<{ allowed: boolean; quota?: { used: number; max: number } }> {
  const updateResult = await db.prepare(`
    UPDATE users
    SET interviews_created = interviews_created + 1
    WHERE id = ? AND interviews_created < max_interviews
  `).bind(userId).run();

  if (updateResult.meta.changes && updateResult.meta.changes > 0) {
    return { allowed: true };
  }

  const user = await db.prepare(`
    SELECT interviews_created, max_interviews FROM users WHERE id = ?
  `).bind(userId).first<{ interviews_created: number; max_interviews: number }>();

  if (!user) {
    return { allowed: false };
  }

  return {
    allowed: false,
    quota: { used: user.interviews_created, max: user.max_interviews }
  };
}

/**
 * Get user's quota usage
 */
export async function getQuotaUsage(
  db: D1Database,
  userId: string
): Promise<{ used: number; max: number } | null> {
  const user = await db.prepare(`
    SELECT interviews_created, max_interviews FROM users WHERE id = ?
  `).bind(userId).first<{ interviews_created: number; max_interviews: number }>();

  if (!user) {
    return null;
  }

  return { used: user.interviews_created, max: user.max_interviews };
}

/**
 * Update user's maximum interview quota
 */
export async function updateUserQuota(
  db: D1Database,
  userId: string,
  maxInterviews: number
): Promise<{ success: boolean }> {
  const result = await db.prepare(`
    UPDATE users
    SET max_interviews = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(maxInterviews, userId).run();

  if (!result.meta.changes) {
    return { success: false };
  }

  log.info('User quota updated', { userId, maxInterviews });
  return { success: true };
}

/**
 * Get user by email (for account linking)
 */
export async function getUserByEmail(db: D1Database, email: string) {
  return await db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).bind(email).first();
}

/**
 * Get all authentication methods for a user
 */
export async function getUserAuthProviders(db: D1Database, userId: string) {
  const results = await db.prepare(`
    SELECT
      id,
      provider,
      email,
      provider_user_id,
      is_primary,
      verified,
      last_used_at,
      created_at
    FROM auth_providers
    WHERE user_id = ?
    ORDER BY is_primary DESC, created_at ASC
  `).bind(userId).all();

  return results.results || [];
}

/**
 * Check if user can unlink an auth method
 * Users must have at least one auth method
 */
export async function canUnlinkAuthMethod(
  db: D1Database,
  userId: string,
  _authProviderId: string
): Promise<boolean> {
  const count = await db.prepare(`
    SELECT COUNT(*) as count FROM auth_providers WHERE user_id = ?
  `).bind(userId).first<{ count: number }>();

  return (count?.count || 0) > 1;
}

/**
 * Mark interview as paid and update status
 * Updates interview: paid=TRUE, status='PAID', payment_id
 */
export async function markInterviewPaidWithStatus(
  db: D1Database,
  interviewId: string,
  paymentId: string
) {
  await db.prepare(`
    UPDATE interviews
    SET paid = 1,
        payment_id = ?,
        status = 'PAID',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(paymentId, interviewId).run();

  log.info('Marked interview as paid', { interviewId, paymentId });

  return { success: true };
}
