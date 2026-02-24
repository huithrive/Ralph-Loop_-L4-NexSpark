# Auxora Notification Templates

This directory contains all notification templates for the Auxora platform, supporting both email and WhatsApp channels.

## Directory Structure

```
templates/notifications/
├── templates.js              # Main template registry
├── email/                    # HTML email templates
│   ├── emergency-pause.html
│   ├── budget-alert.html
│   ├── campaign-opportunity.html
│   ├── weekly-summary.html
│   ├── monthly-report.html
│   ├── milestone-celebration.html
│   ├── daily-digest.html
│   └── onboarding-welcome.html
└── whatsapp/                 # Plain text WhatsApp templates
    ├── emergency-pause.txt
    ├── budget-alert.txt
    ├── campaign-update.txt
    ├── milestone-celebration.txt
    ├── weekly-summary.txt
    └── daily-digest.txt
```

## Usage

### Loading Templates

```javascript
const templates = require('./templates/notifications/templates');

// Get a template
const emergencyTemplate = templates['emergency-pause'];
console.log(emergencyTemplate.subject);   // Email subject
console.log(emergencyTemplate.body);      // HTML body for email
console.log(emergencyTemplate.whatsappBody); // Plain text for WhatsApp
console.log(emergencyTemplate.channels);  // ['email', 'whatsapp']
```

### Rendering Templates

Templates use `{{variable}}` placeholders. Replace them with actual values:

```javascript
function renderTemplate(template, variables) {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

// Example usage
const template = templates['emergency-pause'];
const variables = {
  brandName: 'Acme Store',
  clientName: 'John',
  issue: 'spend exceeded daily limit by 50%',
  details: 'Your Meta Ads campaign spent $1,500 in the last 2 hours, exceeding your $1,000 daily budget.',
  savedAmount: '$500',
  appUrl: 'https://app.auxora.com/campaigns/123',
  prefsUrl: 'https://app.auxora.com/settings/notifications'
};

const emailSubject = renderTemplate(template.subject, variables);
const emailBody = renderTemplate(template.body, variables);
const whatsappMessage = renderTemplate(template.whatsappBody, variables);
```

## Template Variables

All templates support these base variables:

- `{{brandName}}` — Client's brand name
- `{{clientName}}` — User's first name
- `{{appUrl}}` — Deep link to relevant app page
- `{{prefsUrl}}` — Link to notification preferences

### Template-Specific Variables

#### emergency-pause
- `{{issue}}` — Brief description of the issue (e.g., "spend exceeded daily limit")
- `{{details}}` — Detailed explanation
- `{{savedAmount}}` — Estimated money saved (e.g., "$500")

#### budget-alert
- `{{spendPercent}}` — Percentage of budget used (e.g., "85")
- `{{dailyBudget}}` — Daily budget amount (e.g., "1000")
- `{{currentSpend}}` — Current spend amount (e.g., "850")

#### campaign-opportunity
- `{{opportunityTitle}}` — Short title (e.g., "Increase budget for top performer")
- `{{opportunityBody}}` — Detailed explanation

#### weekly-summary & monthly-report
- `{{weeklyRevenue}}` / `{{monthlyRevenue}}` — Revenue amount
- `{{revenueChange}}` — Change vs previous period (e.g., "+12%")
- `{{roas}}` — Return on ad spend (e.g., "3.5")
- `{{weeklySpend}}` / `{{monthlySpend}}` — Spend amount
- `{{topCampaign}}` — Top performing campaign name
- `{{actionsCount}}` — Number of auto-actions taken
- `{{month}}` — Month name (for monthly report)
- `{{trends}}` — Trend description (for monthly report)
- `{{spendChange}}` — Spend change (for monthly report)
- `{{topCampaignRevenue}}` — Top campaign revenue (for monthly report)

#### milestone-celebration
- `{{milestoneName}}` — Milestone name (e.g., "$10K revenue milestone")
- `{{milestoneDescription}}` — Description of what was achieved
- `{{summaryStats}}` — HTML list of stats (for email) or text summary (for WhatsApp)

#### daily-digest
- `{{actionsCount}}` — Number of actions taken
- `{{actionsList}}` — HTML formatted list (for email)
- `{{actionsSummary}}` — Plain text summary (for WhatsApp)

#### onboarding-welcome
No additional variables required beyond base variables.

## Design Guidelines

### Email Templates
- **Theme:** Auxora cream/warm aesthetic
  - Background: `#FAF7F4`
  - Primary accent: `#BF6744` (rust)
  - Secondary: `#4A6741` (sage green)
  - Font: Georgia, serif
- **Structure:**
  - Inline styles only (email-safe)
  - Table-based layout
  - Logo at top ("Auxora" in rust)
  - Clear CTA button
  - Unsubscribe/preferences link in footer
- **Size:** Keep under 50KB

### WhatsApp Templates
- **Format:** Plain text, no HTML
- **Length:** Under 1024 characters
- **Style:** 
  - Use *bold* for emphasis
  - Use emojis sparingly but effectively
  - Include clear call-to-action with link
  - Keep it conversational and concise

## Testing

Run the test script to verify all templates load correctly:

```bash
node test-templates.js
```

## Adding New Templates

1. Create the HTML file in `email/` (if email support needed)
2. Create the TXT file in `whatsapp/` (if WhatsApp support needed)
3. Add an entry to `templates.js`:

```javascript
'new-template': {
  subject: '{{brandName}}: Your subject here',
  body: emailTemplates['new-template'],
  whatsappBody: whatsappTemplates['new-template'],
  channels: ['email', 'whatsapp'],
},
```

4. Test with `node test-templates.js`

## Notes

- Templates are loaded at startup (via `fs.readFileSync`), not on each send
- All user-facing text uses plain English, zero jargon
- Target audience: non-technical D2C brand owners
- Email HTML must work in Gmail, Outlook, Apple Mail
