/**
 * @module notificationService
 * @description Out-of-app notification routing for Auxora action cards.
 * 
 * Channels: email (SendGrid), WhatsApp (Twilio), in-app (DB flag)
 * 
 * Routing rules:
 *   L1 (auto) → silent log, optional daily digest
 *   L2 (confirm) → in-app card + optional email (based on user pref)
 *   L3 (approve) → in-app + email + WhatsApp (emergency overrides quiet hours)
 *   Milestone → in-app + email (celebration)
 *   Weekly report → email only
 */

const { Pool } = require('pg');
const logger = require('../../utils/logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Optional external integrations
let sgMail = null;
let twilioClient = null;

// Initialize SendGrid if configured
try {
  if (process.env.SENDGRID_API_KEY) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logger.info('[notificationService] SendGrid initialized');
  } else {
    logger.warn('[notificationService] SENDGRID_API_KEY not set — email notifications disabled');
  }
} catch (err) {
  logger.warn('[notificationService] SendGrid initialization failed:', err.message);
}

// Initialize Twilio if configured
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('[notificationService] Twilio initialized');
  } else {
    logger.warn('[notificationService] Twilio credentials not set — WhatsApp notifications disabled');
  }
} catch (err) {
  logger.warn('[notificationService] Twilio initialization failed:', err.message);
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

function renderTemplate(templateName, data) {
  let templates;
  try {
    templates = require('../../templates/notifications/templates');
  } catch (err) {
    logger.warn(`[notificationService] Template file not found, using fallback for "${templateName}"`);
    return { 
      subject: 'Auxora Alert', 
      body: `You have a new notification.\n\n${JSON.stringify(data, null, 2)}` 
    };
  }

  const tmpl = templates[templateName];
  if (!tmpl) {
    logger.warn(`[notificationService] Template "${templateName}" not found, using fallback`);
    return { 
      subject: 'Auxora Alert', 
      body: JSON.stringify(data, null, 2) 
    };
  }

  let subject = tmpl.subject || 'Auxora Notification';
  let body = tmpl.body || '';

  // Simple string interpolation
  for (const [key, val] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, val);
    body = body.replace(regex, val);
  }

  return { subject, body };
}

// ---------------------------------------------------------------------------
// Preference management
// ---------------------------------------------------------------------------

/**
 * Get notification preferences for a client.
 * Returns defaults if no row exists.
 * 
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
async function getPreferences(clientId) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM openclaw_notification_prefs WHERE client_id = $1',
      [clientId]
    );

    if (rows.length === 0) {
      // Return defaults
      return {
        clientId,
        emailEnabled: true,
        whatsappEnabled: false,
        inAppEnabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '08:00',
        timezone: 'UTC',
        digestEnabled: true,
        weeklyReportEnabled: true,
      };
    }

    return {
      clientId: rows[0].client_id,
      emailEnabled: rows[0].email_enabled,
      whatsappEnabled: rows[0].whatsapp_enabled,
      inAppEnabled: rows[0].in_app_enabled,
      quietHoursStart: rows[0].quiet_hours_start,
      quietHoursEnd: rows[0].quiet_hours_end,
      timezone: rows[0].timezone || 'UTC',
      digestEnabled: rows[0].digest_enabled,
      weeklyReportEnabled: rows[0].weekly_report_enabled,
      email: rows[0].email,
      whatsappNumber: rows[0].whatsapp_number,
    };
  } catch (err) {
    logger.error(`[notificationService] Error fetching preferences for ${clientId}:`, err.message);
    // Return defaults on error
    return {
      clientId,
      emailEnabled: true,
      whatsappEnabled: false,
      inAppEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '08:00',
      timezone: 'UTC',
      digestEnabled: true,
      weeklyReportEnabled: true,
    };
  }
}

/**
 * Update (upsert) notification preferences for a client.
 * 
 * @param {string} clientId
 * @param {Object} prefs
 * @returns {Promise<Object>}
 */
async function updatePreferences(clientId, prefs) {
  const sql = `
    INSERT INTO openclaw_notification_prefs 
      (client_id, email_enabled, whatsapp_enabled, in_app_enabled, 
       quiet_hours_start, quiet_hours_end, timezone, digest_enabled, 
       weekly_report_enabled, email, whatsapp_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (client_id) DO UPDATE SET
      email_enabled = EXCLUDED.email_enabled,
      whatsapp_enabled = EXCLUDED.whatsapp_enabled,
      in_app_enabled = EXCLUDED.in_app_enabled,
      quiet_hours_start = EXCLUDED.quiet_hours_start,
      quiet_hours_end = EXCLUDED.quiet_hours_end,
      timezone = EXCLUDED.timezone,
      digest_enabled = EXCLUDED.digest_enabled,
      weekly_report_enabled = EXCLUDED.weekly_report_enabled,
      email = EXCLUDED.email,
      whatsapp_number = EXCLUDED.whatsapp_number
    RETURNING *`;

  const { rows } = await pool.query(sql, [
    clientId,
    prefs.emailEnabled !== undefined ? prefs.emailEnabled : true,
    prefs.whatsappEnabled !== undefined ? prefs.whatsappEnabled : false,
    prefs.inAppEnabled !== undefined ? prefs.inAppEnabled : true,
    prefs.quietHoursStart || '23:00',
    prefs.quietHoursEnd || '08:00',
    prefs.timezone || 'UTC',
    prefs.digestEnabled !== undefined ? prefs.digestEnabled : true,
    prefs.weeklyReportEnabled !== undefined ? prefs.weeklyReportEnabled : true,
    prefs.email || null,
    prefs.whatsappNumber || null,
  ]);

  logger.info(`[notificationService] Updated preferences for client ${clientId}`);
  return rows[0];
}

// ---------------------------------------------------------------------------
// Quiet hours check
// ---------------------------------------------------------------------------

/**
 * Check if current time is within client's quiet hours.
 * Emergency notifications override quiet hours.
 * 
 * @param {string} clientId
 * @param {boolean} [emergencyOverride=false]
 * @returns {Promise<boolean>}
 */
async function isQuietHours(clientId, emergencyOverride = false) {
  if (emergencyOverride) {
    return false; // Emergency overrides quiet hours
  }

  const prefs = await getPreferences(clientId);
  const now = new Date();

  // Simple hour-based check (ignores timezone for now — TODO: add timezone support)
  const currentHour = now.getHours();
  const startHour = parseInt(prefs.quietHoursStart.split(':')[0], 10);
  const endHour = parseInt(prefs.quietHoursEnd.split(':')[0], 10);

  // Handle overnight quiet hours (e.g., 23:00-08:00)
  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }

  return currentHour >= startHour && currentHour < endHour;
}

// ---------------------------------------------------------------------------
// Notification logging
// ---------------------------------------------------------------------------

/**
 * Log a notification send event.
 * 
 * @param {string} clientId
 * @param {string} channel - 'email' | 'whatsapp' | 'in_app'
 * @param {string} template
 * @param {string} [actionId=null]
 * @returns {Promise<void>}
 */
async function logNotification(clientId, channel, template, actionId = null) {
  try {
    await pool.query(
      `INSERT INTO openclaw_notification_log 
        (client_id, channel, template, action_id, sent_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [clientId, channel, template, actionId]
    );
  } catch (err) {
    logger.error(`[notificationService] Error logging notification:`, err.message);
  }
}

// ---------------------------------------------------------------------------
// Channel implementations
// ---------------------------------------------------------------------------

/**
 * Send email via SendGrid.
 * 
 * @param {string} to - recipient email
 * @param {string} templateName
 * @param {Object} data - template variables
 * @returns {Promise<boolean>}
 */
async function sendEmail(to, templateName, data) {
  if (!sgMail) {
    logger.warn('[notificationService] SendGrid not configured — skipping email');
    return false;
  }

  if (!to) {
    logger.warn('[notificationService] No email address provided — skipping');
    return false;
  }

  try {
    const { subject, body } = renderTemplate(templateName, data);

    const msg = {
      to,
      from: 'auxora@nexspark.ai',
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'), // Simple HTML conversion
    };

    await sgMail.send(msg);
    logger.info(`[notificationService] Email sent to ${to} (template: ${templateName})`);
    return true;
  } catch (err) {
    logger.error(`[notificationService] SendGrid error:`, err.message);
    return false;
  }
}

/**
 * Send WhatsApp message via Twilio.
 * 
 * @param {string} to - recipient phone number (E.164 format)
 * @param {string} templateName
 * @param {Object} data - template variables
 * @returns {Promise<boolean>}
 */
async function sendWhatsApp(to, templateName, data) {
  if (!twilioClient) {
    logger.warn('[notificationService] Twilio not configured — skipping WhatsApp');
    return false;
  }

  if (!to) {
    logger.warn('[notificationService] No WhatsApp number provided — skipping');
    return false;
  }

  if (!process.env.TWILIO_WHATSAPP_FROM) {
    logger.warn('[notificationService] TWILIO_WHATSAPP_FROM not set — skipping WhatsApp');
    return false;
  }

  try {
    const { body } = renderTemplate(templateName, data);

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body,
    });

    logger.info(`[notificationService] WhatsApp sent to ${to} (template: ${templateName})`);
    return true;
  } catch (err) {
    logger.error(`[notificationService] Twilio error:`, err.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main notification router
// ---------------------------------------------------------------------------

/**
 * Main notification entry point.
 * Routes notifications based on card trust level and user preferences.
 * 
 * Routing rules:
 *   L1 (auto) → silent log, optional daily digest
 *   L2 (confirm) → in-app card + optional email (based on user pref)
 *   L3 (approve) → in-app + email + WhatsApp (emergency overrides quiet hours)
 *   Milestone → in-app + email (celebration)
 * 
 * @param {string} clientId
 * @param {Object} card - ActionCard or card-like object
 * @returns {Promise<Object>} { channels: string[] }
 */
async function notify(clientId, card) {
  const prefs = await getPreferences(clientId);
  const channels = [];
  const trustLevel = card.trustLevel || card.trust_level;
  const cardType = card.cardType || card.card_type;
  const isEmergency = card.severity === 'critical' && trustLevel === 'L1';

  const templateData = {
    clientId,
    title: card.title,
    body: card.body,
    impact: card.impact,
    cardType,
    trustLevel,
    actionUrl: `https://app.nexspark.ai/actions/${card.id}`,
  };

  // Routing logic based on trust level
  switch (trustLevel) {
    case 'L1': // Auto-executed
      // Silent log only (will be included in daily digest if enabled)
      await logNotification(clientId, 'in_app', 'l1_auto_executed', card.id);
      channels.push('logged');
      break;

    case 'L2': // Confirm before action
      // Always in-app
      if (prefs.inAppEnabled) {
        await logNotification(clientId, 'in_app', 'l2_confirm', card.id);
        channels.push('in_app');
      }

      // Optional email based on preference
      if (prefs.emailEnabled && prefs.email && !(await isQuietHours(clientId))) {
        const sent = await sendEmail(prefs.email, 'l2_confirm', templateData);
        if (sent) {
          await logNotification(clientId, 'email', 'l2_confirm', card.id);
          channels.push('email');
        }
      }
      break;

    case 'L3': // Requires approval
      // Always in-app
      if (prefs.inAppEnabled) {
        await logNotification(clientId, 'in_app', 'l3_approve', card.id);
        channels.push('in_app');
      }

      // Always email (quiet hours respected unless emergency)
      if (prefs.emailEnabled && prefs.email && !(await isQuietHours(clientId, isEmergency))) {
        const sent = await sendEmail(prefs.email, 'l3_approve', templateData);
        if (sent) {
          await logNotification(clientId, 'email', 'l3_approve', card.id);
          channels.push('email');
        }
      }

      // WhatsApp for emergencies (overrides quiet hours)
      if (prefs.whatsappEnabled && prefs.whatsappNumber && isEmergency) {
        const sent = await sendWhatsApp(prefs.whatsappNumber, 'l3_emergency', templateData);
        if (sent) {
          await logNotification(clientId, 'whatsapp', 'l3_emergency', card.id);
          channels.push('whatsapp');
        }
      }
      break;

    default:
      // Milestone or informational
      if (card.severity === 'success') {
        // Milestone: in-app + email (celebration!)
        if (prefs.inAppEnabled) {
          await logNotification(clientId, 'in_app', 'milestone', card.id);
          channels.push('in_app');
        }

        if (prefs.emailEnabled && prefs.email) {
          const sent = await sendEmail(prefs.email, 'milestone', templateData);
          if (sent) {
            await logNotification(clientId, 'email', 'milestone', card.id);
            channels.push('email');
          }
        }
      }
      break;
  }

  logger.info(`[notificationService] Notified client ${clientId} via: ${channels.join(', ')}`);
  return { channels };
}

// ---------------------------------------------------------------------------
// Daily digest
// ---------------------------------------------------------------------------

/**
 * Gather today's L1 auto-executed cards for digest email.
 * 
 * @param {string} clientId
 * @returns {Promise<Object[]>}
 */
async function getDailyDigest(clientId) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM openclaw_actions 
       WHERE client_id = $1 
         AND trust_level = 'L1' 
         AND status = 'auto_executed'
         AND created_at >= CURRENT_DATE 
       ORDER BY created_at DESC`,
      [clientId]
    );
    return rows;
  } catch (err) {
    logger.error(`[notificationService] Error fetching daily digest:`, err.message);
    return [];
  }
}

/**
 * Send daily digest email (called by heartbeat at end of day).
 * 
 * @param {string} clientId
 * @returns {Promise<boolean>}
 */
async function sendDailyDigest(clientId) {
  const prefs = await getPreferences(clientId);

  if (!prefs.digestEnabled || !prefs.emailEnabled || !prefs.email) {
    logger.info(`[notificationService] Daily digest disabled for client ${clientId}`);
    return false;
  }

  const actions = await getDailyDigest(clientId);

  if (actions.length === 0) {
    logger.info(`[notificationService] No L1 actions today for client ${clientId} — skipping digest`);
    return false;
  }

  const summary = actions.map(a => `• ${a.title}`).join('\n');
  const data = {
    clientId,
    date: new Date().toLocaleDateString(),
    count: actions.length,
    summary,
  };

  const sent = await sendEmail(prefs.email, 'daily_digest', data);
  if (sent) {
    await logNotification(clientId, 'email', 'daily_digest', null);
  }

  return sent;
}

// ---------------------------------------------------------------------------
// Weekly report
// ---------------------------------------------------------------------------

/**
 * Send weekly performance summary email.
 * 
 * @param {string} clientId
 * @param {Object} reportData - { roas, spend, revenue, actionsCount, etc. }
 * @returns {Promise<boolean>}
 */
async function sendWeeklyReport(clientId, reportData) {
  const prefs = await getPreferences(clientId);

  if (!prefs.weeklyReportEnabled || !prefs.emailEnabled || !prefs.email) {
    logger.info(`[notificationService] Weekly report disabled for client ${clientId}`);
    return false;
  }

  const data = {
    clientId,
    ...reportData,
  };

  const sent = await sendEmail(prefs.email, 'weekly_report', data);
  if (sent) {
    await logNotification(clientId, 'email', 'weekly_report', null);
  }

  return sent;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  notify,
  sendEmail,
  sendWhatsApp,
  isQuietHours,
  getPreferences,
  updatePreferences,
  logNotification,
  getDailyDigest,
  sendDailyDigest,
  sendWeeklyReport,
};
