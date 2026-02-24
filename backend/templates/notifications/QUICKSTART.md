# Notification Templates — Quick Start

## Import and Use

```javascript
const { renderEmail, renderWhatsApp } = require('./templates/notifications/render');

// Render email notification
const email = renderEmail('emergency-pause', {
  brandName: 'Your Brand',
  clientName: 'John',
  issue: 'spend exceeded daily limit',
  details: 'Your campaign spent...',
  savedAmount: '$500',
  appUrl: 'https://app.auxora.com/...',
  prefsUrl: 'https://app.auxora.com/settings/notifications'
});

// Use the rendered email
sendEmail({
  to: 'customer@example.com',
  subject: email.subject,
  html: email.body
});

// Render WhatsApp notification
const whatsapp = renderWhatsApp('emergency-pause', { /* same vars */ });
sendWhatsApp({
  to: '+1234567890',
  message: whatsapp
});
```

## Available Templates

| Template | Channels | Purpose |
|----------|----------|---------|
| `emergency-pause` | email, whatsapp | Ads paused to protect budget |
| `budget-alert` | email, whatsapp | Spend approaching limit |
| `campaign-opportunity` | email, whatsapp | Growth suggestion |
| `weekly-summary` | email, whatsapp | Weekly performance |
| `monthly-report` | email only | Monthly performance |
| `milestone-celebration` | email, whatsapp | Achievement unlocked |
| `daily-digest` | email, whatsapp | Daily action summary |
| `onboarding-welcome` | email only | New user welcome |

## Required Variables

**All templates:**
- `brandName`, `clientName`, `appUrl`, `prefsUrl`

**Template-specific:** See [README.md](./README.md#template-variables) or [IMPLEMENTATION.md](./IMPLEMENTATION.md#variables-reference)

## Testing

```bash
# Test loading
node templates/notifications/test-templates.js

# Test rendering
node templates/notifications/example.js
```

## Files

- `templates.js` — Registry (loads all templates)
- `render.js` — Rendering utilities
- `README.md` — Full documentation
- `IMPLEMENTATION.md` — Implementation summary
- `email/*.html` — 8 email templates
- `whatsapp/*.txt` — 6 WhatsApp templates

---

**Quick tip:** All templates use `{{variable}}` syntax. The render functions automatically replace these with your data.
