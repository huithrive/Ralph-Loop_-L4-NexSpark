/**
 * Invitation Service
 * Handles invitation code generation, validation, and usage tracking
 */

import { generateId } from './database';
import { createLogger } from '../utils/logger';
import {
  getInvitationByCode,
  createInvitation,
  incrementInvitationUsage,
  recordInvitationUsage,
  checkCodeExists,
  deactivateInvitation,
  getInvitationWithUsage,
  listInvitations,
  getInvitationStats as getInvitationStatsRepo
} from '../repositories/invitation-repository';

const log = createLogger({ context: '[Invitation]' });

/**
 * Generates a random invitation code in XXXX-XXXX-XXXX format
 * Uses alphanumeric characters (uppercase only) for readability
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];

  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
}

/**
 * Validates an invitation code
 * Checks: exists, active, not expired, not maxed out, email matches if assigned
 */
export async function validateInvitationCode(
  db: D1Database,
  code: string,
  email?: string
): Promise<{
  valid: boolean;
  invitationId?: string;
  error?: string;
}> {
  const normalizedCode = code.trim().toUpperCase();

  // Find invitation code via repository
  const invitation = await getInvitationByCode(db, normalizedCode);

  if (!invitation) {
    log.warn('Invalid invitation code', { code: normalizedCode });
    return { valid: false, error: 'Invalid invitation code' };
  }

  // Check if active
  if (!invitation.is_active) {
    log.warn('Invitation code is inactive', { code: normalizedCode });
    return { valid: false, error: 'This invitation code has been deactivated' };
  }

  // Check if expired
  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      log.warn('Invitation code expired', { code: normalizedCode, expiresAt });
      return { valid: false, error: 'This invitation code has expired' };
    }
  }

  // Check usage limit
  if (invitation.current_uses >= invitation.max_uses) {
    log.warn('Invitation code usage limit reached', { code: normalizedCode });
    return { valid: false, error: 'This invitation code has reached its usage limit' };
  }

  // Check email assignment
  if (invitation.assigned_email && email) {
    if (invitation.assigned_email.toLowerCase() !== email.toLowerCase()) {
      log.warn('Invitation code email mismatch', {
        code: normalizedCode,
        assignedEmail: invitation.assigned_email,
        providedEmail: email
      });
      return { valid: false, error: 'This invitation code is assigned to a different email address' };
    }
  }

  log.info('Invitation code validated', { code: normalizedCode, invitationId: invitation.id });
  return {
    valid: true,
    invitationId: invitation.id
  };
}

/**
 * Marks an invitation code as used
 * Records usage in invitation_usage table and increments current_uses counter
 */
export async function markInvitationUsed(
  db: D1Database,
  invitationId: string,
  userId: string,
  email: string,
  method: 'google' | 'email'
): Promise<void> {
  // Record usage and increment counter using repository functions
  await recordInvitationUsage(db, {
    invitationId,
    userId,
    email,
    registrationMethod: method
  });

  await incrementInvitationUsage(db, invitationId);

  log.info('Invitation marked as used', { invitationId, userId, email, method });
}

/**
 * Creates a new invitation code
 * Used by admin scripts and API endpoints
 */
export async function createInvitationCode(
  db: D1Database,
  options: {
    maxUses?: number;
    assignedEmail?: string;
    expiresInDays?: number;
    createdBy?: string;
    notes?: string;
  } = {}
): Promise<{
  id: string;
  code: string;
  maxUses: number;
  assignedEmail?: string;
  expiresAt?: string;
}> {
  let code: string = '';
  let attempts = 0;
  const maxAttempts = 10;

  // Generate unique code (retry if collision)
  while (attempts < maxAttempts) {
    code = generateInvitationCode();

    // Check if code already exists via repository
    const exists = await checkCodeExists(db, code);

    if (!exists) {
      break;
    }

    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique invitation code after multiple attempts');
  }

  const maxUses = options.maxUses ?? 1;
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  // Create invitation via repository
  const { invitationId } = await createInvitation(db, {
    code,
    maxUses,
    assignedEmail: options.assignedEmail,
    expiresAt,
    createdBy: options.createdBy,
    notes: options.notes
  });

  log.info('Invitation code created', { id: invitationId, code, maxUses, assignedEmail: options.assignedEmail });

  return {
    id: invitationId,
    code,
    maxUses,
    assignedEmail: options.assignedEmail,
    expiresAt
  };
}

/**
 * Lists invitation codes with optional filtering
 */
export async function listInvitationCodes(
  db: D1Database,
  options: {
    status?: 'active' | 'used' | 'expired' | 'all';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  invitations: any[];
  total: number;
}> {
  return listInvitations(db, options);
}

/**
 * Deactivates an invitation code
 */
export async function deactivateInvitationCode(
  db: D1Database,
  invitationId: string
): Promise<boolean> {
  const { success } = await deactivateInvitation(db, invitationId);

  if (success) {
    log.info('Invitation code deactivated', { invitationId });
  } else {
    log.warn('Invitation code not found for deactivation', { invitationId });
  }

  return success;
}

/**
 * Gets usage details for a specific invitation code
 */
export async function getInvitationUsage(
  db: D1Database,
  invitationId: string
): Promise<{
  code: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  usageHistory: any[];
} | null> {
  const result = await getInvitationWithUsage(db, invitationId);

  if (!result) {
    return null;
  }

  return {
    code: result.invitation.code,
    maxUses: result.invitation.max_uses,
    currentUses: result.invitation.current_uses,
    isActive: Boolean(result.invitation.is_active),
    usageHistory: result.usageHistory
  };
}

/**
 * Gets overall invitation statistics
 */
export async function getInvitationStats(
  db: D1Database
): Promise<{
  totalCodes: number;
  activeCodes: number;
  totalUses: number;
  availableUses: number;
}> {
  return getInvitationStatsRepo(db);
}
