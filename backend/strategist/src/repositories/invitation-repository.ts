/**
 * Invitation repository - manages invitation code database operations
 * Note: Errors propagate to route layer for centralized handling
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[InvitationRepo]' });

export interface InvitationCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  is_active: number;
  assigned_email?: string;
  expires_at?: string;
  created_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationUsage {
  id: string;
  invitation_id: string;
  user_id: string;
  registration_method: string;
  email: string;
  used_at: string;
}

/**
 * Get invitation by code
 */
export async function getInvitationByCode(
  db: D1Database,
  code: string
): Promise<InvitationCode | null> {
  const normalizedCode = code.trim().toUpperCase();

  const result = await db.prepare(`
    SELECT * FROM invitation_codes WHERE code = ?
  `).bind(normalizedCode).first<InvitationCode>();

  return result || null;
}

/**
 * Get invitation by ID
 */
export async function getInvitationById(
  db: D1Database,
  invitationId: string
): Promise<InvitationCode | null> {
  const result = await db.prepare(`
    SELECT * FROM invitation_codes WHERE id = ?
  `).bind(invitationId).first<InvitationCode>();

  return result || null;
}

/**
 * Create a new invitation code
 */
export async function createInvitation(
  db: D1Database,
  data: {
    code: string;
    maxUses?: number;
    assignedEmail?: string;
    expiresAt?: string;
    createdBy?: string;
    notes?: string;
  }
): Promise<{ invitationId: string }> {
  const invitationId = generateId('inv_');

  await db.prepare(`
    INSERT INTO invitation_codes (
      id, code, max_uses, current_uses, is_active,
      assigned_email, expires_at, created_by, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, 0, 1, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    invitationId,
    data.code,
    data.maxUses ?? 1,
    data.assignedEmail || null,
    data.expiresAt || null,
    data.createdBy || null,
    data.notes || null
  ).run();

  log.info('Invitation created', { invitationId, code: data.code });
  return { invitationId };
}

/**
 * Increment invitation usage counter
 */
export async function incrementInvitationUsage(
  db: D1Database,
  invitationId: string
): Promise<{ success: boolean }> {
  await db.prepare(`
    UPDATE invitation_codes
    SET current_uses = current_uses + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(invitationId).run();

  return { success: true };
}

/**
 * Record invitation usage
 */
export async function recordInvitationUsage(
  db: D1Database,
  data: {
    invitationId: string;
    userId: string;
    email: string;
    registrationMethod: 'google' | 'email';
  }
): Promise<{ usageId: string }> {
  const usageId = generateId('inv_usage_');

  await db.prepare(`
    INSERT INTO invitation_usage (id, invitation_id, user_id, registration_method, email, used_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    usageId,
    data.invitationId,
    data.userId,
    data.registrationMethod,
    data.email
  ).run();

  log.info('Invitation usage recorded', {
    usageId,
    invitationId: data.invitationId,
    userId: data.userId
  });

  return { usageId };
}

/**
 * Check if invitation code already exists
 */
export async function checkCodeExists(
  db: D1Database,
  code: string
): Promise<boolean> {
  const result = await db.prepare(`
    SELECT id FROM invitation_codes WHERE code = ?
  `).bind(code).first();

  return !!result;
}

/**
 * Deactivate an invitation code
 */
export async function deactivateInvitation(
  db: D1Database,
  invitationId: string
): Promise<{ success: boolean }> {
  const result = await db.prepare(`
    UPDATE invitation_codes
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(invitationId).run();

  const success = (result.meta.changes || 0) > 0;

  if (success) {
    log.info('Invitation deactivated', { invitationId });
  }

  return { success };
}

/**
 * Get invitation with usage history
 */
export async function getInvitationWithUsage(
  db: D1Database,
  invitationId: string
): Promise<{
  invitation: InvitationCode;
  usageHistory: InvitationUsage[];
} | null> {
  const invitation = await db.prepare(`
    SELECT * FROM invitation_codes WHERE id = ?
  `).bind(invitationId).first<InvitationCode>();

  if (!invitation) {
    return null;
  }

  const usageResult = await db.prepare(`
    SELECT * FROM invitation_usage
    WHERE invitation_id = ?
    ORDER BY used_at DESC
  `).bind(invitationId).all();

  return {
    invitation,
    usageHistory: (usageResult.results || []) as InvitationUsage[]
  };
}

/**
 * List invitations with optional filtering
 */
export async function listInvitations(
  db: D1Database,
  filter: {
    status?: 'active' | 'used' | 'expired' | 'all';
    limit?: number;
    offset?: number;
  }
): Promise<{ invitations: InvitationCode[]; total: number }> {
  const limit = filter.limit ?? 20;
  const offset = filter.offset ?? 0;
  const status = filter.status ?? 'all';

  let whereClause = '';

  if (status === 'active') {
    whereClause = 'WHERE is_active = 1 AND current_uses < max_uses AND (expires_at IS NULL OR expires_at > datetime("now"))';
  } else if (status === 'used') {
    whereClause = 'WHERE current_uses >= max_uses';
  } else if (status === 'expired') {
    whereClause = 'WHERE expires_at IS NOT NULL AND expires_at <= datetime("now")';
  }

  const countResult = await db.prepare(`
    SELECT COUNT(*) as total FROM invitation_codes ${whereClause}
  `).first<{ total: number }>();

  const result = await db.prepare(`
    SELECT * FROM invitation_codes
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  return {
    invitations: (result.results || []) as InvitationCode[],
    total: countResult?.total || 0
  };
}

/**
 * Get invitation statistics
 */
export async function getInvitationStats(
  db: D1Database
): Promise<{
  totalCodes: number;
  activeCodes: number;
  totalUses: number;
  availableUses: number;
}> {
  const totalResult = await db.prepare(`
    SELECT COUNT(*) as count FROM invitation_codes
  `).first<{ count: number }>();

  const activeResult = await db.prepare(`
    SELECT COUNT(*) as count FROM invitation_codes
    WHERE is_active = 1
      AND current_uses < max_uses
      AND (expires_at IS NULL OR expires_at > datetime("now"))
  `).first<{ count: number }>();

  const usesResult = await db.prepare(`
    SELECT COUNT(*) as count FROM invitation_usage
  `).first<{ count: number }>();

  const availableResult = await db.prepare(`
    SELECT SUM(max_uses - current_uses) as available FROM invitation_codes
    WHERE is_active = 1
      AND current_uses < max_uses
      AND (expires_at IS NULL OR expires_at > datetime("now"))
  `).first<{ available: number }>();

  return {
    totalCodes: totalResult?.count || 0,
    activeCodes: activeResult?.count || 0,
    totalUses: usesResult?.count || 0,
    availableUses: availableResult?.available || 0
  };
}
