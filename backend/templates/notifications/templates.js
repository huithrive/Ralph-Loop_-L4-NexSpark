const fs = require('fs');
const path = require('path');

// Load all email templates at startup
const emailTemplates = {
  'emergency-pause': fs.readFileSync(
    path.join(__dirname, 'email/emergency-pause.html'),
    'utf8'
  ),
  'budget-alert': fs.readFileSync(
    path.join(__dirname, 'email/budget-alert.html'),
    'utf8'
  ),
  'campaign-opportunity': fs.readFileSync(
    path.join(__dirname, 'email/campaign-opportunity.html'),
    'utf8'
  ),
  'weekly-summary': fs.readFileSync(
    path.join(__dirname, 'email/weekly-summary.html'),
    'utf8'
  ),
  'monthly-report': fs.readFileSync(
    path.join(__dirname, 'email/monthly-report.html'),
    'utf8'
  ),
  'milestone-celebration': fs.readFileSync(
    path.join(__dirname, 'email/milestone-celebration.html'),
    'utf8'
  ),
  'daily-digest': fs.readFileSync(
    path.join(__dirname, 'email/daily-digest.html'),
    'utf8'
  ),
  'onboarding-welcome': fs.readFileSync(
    path.join(__dirname, 'email/onboarding-welcome.html'),
    'utf8'
  ),
};

// Load all WhatsApp templates at startup
const whatsappTemplates = {
  'emergency-pause': fs.readFileSync(
    path.join(__dirname, 'whatsapp/emergency-pause.txt'),
    'utf8'
  ),
  'budget-alert': fs.readFileSync(
    path.join(__dirname, 'whatsapp/budget-alert.txt'),
    'utf8'
  ),
  'campaign-update': fs.readFileSync(
    path.join(__dirname, 'whatsapp/campaign-update.txt'),
    'utf8'
  ),
  'milestone-celebration': fs.readFileSync(
    path.join(__dirname, 'whatsapp/milestone-celebration.txt'),
    'utf8'
  ),
  'weekly-summary': fs.readFileSync(
    path.join(__dirname, 'whatsapp/weekly-summary.txt'),
    'utf8'
  ),
  'daily-digest': fs.readFileSync(
    path.join(__dirname, 'whatsapp/daily-digest.txt'),
    'utf8'
  ),
};

/**
 * Template registry
 * Each template has:
 *   - subject: Email subject line (with {{variable}} placeholders)
 *   - body: HTML for email or plain text for WhatsApp
 *   - channels: Array of supported channels ['email', 'whatsapp']
 */
module.exports = {
  'emergency-pause': {
    subject: '🚨 {{brandName}}: Your ads have been paused to protect your budget',
    body: emailTemplates['emergency-pause'],
    whatsappBody: whatsappTemplates['emergency-pause'],
    channels: ['email', 'whatsapp'],
  },

  'budget-alert': {
    subject: '⚠️ {{brandName}}: Budget alert — {{spendPercent}}% of daily limit used',
    body: emailTemplates['budget-alert'],
    whatsappBody: whatsappTemplates['budget-alert'],
    channels: ['email', 'whatsapp'],
  },

  'campaign-opportunity': {
    subject: '💡 {{brandName}}: Growth opportunity detected',
    body: emailTemplates['campaign-opportunity'],
    whatsappBody: whatsappTemplates['campaign-update'],
    channels: ['email', 'whatsapp'],
  },

  'weekly-summary': {
    subject: '📊 {{brandName}}: Your weekly performance report',
    body: emailTemplates['weekly-summary'],
    whatsappBody: whatsappTemplates['weekly-summary'],
    channels: ['email', 'whatsapp'],
  },

  'monthly-report': {
    subject: '📈 {{brandName}}: Monthly report — {{month}}',
    body: emailTemplates['monthly-report'],
    whatsappBody: null, // Monthly reports are email-only
    channels: ['email'],
  },

  'milestone-celebration': {
    subject: '🎉 {{brandName}}: {{milestoneName}} achieved!',
    body: emailTemplates['milestone-celebration'],
    whatsappBody: whatsappTemplates['milestone-celebration'],
    channels: ['email', 'whatsapp'],
  },

  'daily-digest': {
    subject: '📋 {{brandName}}: Today\'s automated actions',
    body: emailTemplates['daily-digest'],
    whatsappBody: whatsappTemplates['daily-digest'],
    channels: ['email', 'whatsapp'],
  },

  'onboarding-welcome': {
    subject: '👋 Welcome to Auxora, {{clientName}}!',
    body: emailTemplates['onboarding-welcome'],
    whatsappBody: null, // Onboarding is email-only
    channels: ['email'],
  },
};
