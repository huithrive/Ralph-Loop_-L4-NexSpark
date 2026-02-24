/**
 * Template rendering utilities
 * 
 * Usage:
 *   const { renderTemplate, renderEmail, renderWhatsApp } = require('./templates/notifications/render');
 *   
 *   const email = renderEmail('emergency-pause', {
 *     brandName: 'Acme Store',
 *     clientName: 'John',
 *     issue: 'spend exceeded daily limit',
 *     // ... other variables
 *   });
 */

const templates = require('./templates');

/**
 * Replace {{variable}} placeholders with actual values
 * @param {string} template - Template string with {{placeholders}}
 * @param {Object} variables - Key-value pairs to replace
 * @returns {string} Rendered template
 */
function renderTemplate(template, variables) {
  if (!template) return '';
  
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value || '');
  }
  
  // Warn if any placeholders remain
  const remainingPlaceholders = rendered.match(/{{[^}]+}}/g);
  if (remainingPlaceholders) {
    console.warn('⚠️ Unfilled placeholders:', remainingPlaceholders);
  }
  
  return rendered;
}

/**
 * Render an email notification
 * @param {string} templateName - Name of the template (e.g., 'emergency-pause')
 * @param {Object} variables - Template variables
 * @returns {Object} { subject, body } or null if template not found
 */
function renderEmail(templateName, variables) {
  const template = templates[templateName];
  
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  if (!template.channels.includes('email')) {
    throw new Error(`Template ${templateName} does not support email channel`);
  }
  
  return {
    subject: renderTemplate(template.subject, variables),
    body: renderTemplate(template.body, variables),
  };
}

/**
 * Render a WhatsApp notification
 * @param {string} templateName - Name of the template (e.g., 'emergency-pause')
 * @param {Object} variables - Template variables
 * @returns {string} Rendered WhatsApp message or null if not supported
 */
function renderWhatsApp(templateName, variables) {
  const template = templates[templateName];
  
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  if (!template.channels.includes('whatsapp')) {
    throw new Error(`Template ${templateName} does not support WhatsApp channel`);
  }
  
  if (!template.whatsappBody) {
    throw new Error(`Template ${templateName} has no WhatsApp body defined`);
  }
  
  const message = renderTemplate(template.whatsappBody, variables);
  
  // Validate message length (WhatsApp limit)
  if (message.length > 1024) {
    console.warn(`⚠️ WhatsApp message for ${templateName} exceeds 1024 chars (${message.length})`);
  }
  
  return message;
}

/**
 * Get list of all available template names
 * @returns {Array<string>} Template names
 */
function getAvailableTemplates() {
  return Object.keys(templates);
}

/**
 * Get template metadata
 * @param {string} templateName - Name of the template
 * @returns {Object} { subject, channels } or null if not found
 */
function getTemplateInfo(templateName) {
  const template = templates[templateName];
  
  if (!template) {
    return null;
  }
  
  return {
    name: templateName,
    subject: template.subject,
    channels: template.channels,
    hasEmail: template.channels.includes('email'),
    hasWhatsApp: template.channels.includes('whatsapp'),
  };
}

module.exports = {
  renderTemplate,
  renderEmail,
  renderWhatsApp,
  getAvailableTemplates,
  getTemplateInfo,
};
