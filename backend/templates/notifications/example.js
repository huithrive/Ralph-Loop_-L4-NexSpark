/**
 * Example usage of notification templates
 * Run: node templates/notifications/example.js
 */

const { renderEmail, renderWhatsApp, getAvailableTemplates, getTemplateInfo } = require('./render');

// Sample data for testing
const sampleData = {
  'emergency-pause': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    issue: 'spend exceeded daily limit by 50%',
    details: 'Your Meta Ads campaign spent $1,500 in the last 2 hours, exceeding your $1,000 daily budget. We paused all active campaigns to prevent further overspend.',
    savedAmount: '$500',
    appUrl: 'https://app.auxora.com/campaigns/123',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'budget-alert': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    spendPercent: '85',
    dailyBudget: '1000',
    currentSpend: '850',
    appUrl: 'https://app.auxora.com/budget',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'campaign-opportunity': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    opportunityTitle: 'Increase budget for Summer Sale campaign',
    opportunityBody: 'Your "Summer Sale 2024" campaign is performing 2.5x better than your average. Consider increasing its budget by $200/day to maximize returns during this hot period.',
    appUrl: 'https://app.auxora.com/opportunities/456',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'weekly-summary': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    weeklyRevenue: '12,450',
    revenueChange: '+18% ⬆️',
    roas: '3.8',
    weeklySpend: '3,276',
    topCampaign: 'Summer Sale 2024',
    actionsCount: '23',
    appUrl: 'https://app.auxora.com/reports/weekly',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'monthly-report': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    month: 'July 2024',
    monthlyRevenue: '54,820',
    revenueChange: '+23% ⬆️',
    roas: '4.2',
    monthlySpend: '13,052',
    spendChange: '+15% ⬆️',
    topCampaign: 'Summer Sale 2024',
    topCampaignRevenue: '22,100',
    actionsCount: '94',
    trends: 'Your ROAS improved by 15% this month. Top performing time slots: 10am-2pm and 7pm-9pm. Mobile traffic is up 28%.',
    appUrl: 'https://app.auxora.com/reports/monthly',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'milestone-celebration': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    milestoneName: '$50K Revenue Milestone',
    milestoneDescription: 'You\'ve generated over $50,000 in revenue through Auxora-managed campaigns!',
    summaryStats: '• $50,127 total revenue<br>• $12,250 ad spend<br>• 4.1x average ROAS<br>• 87 campaigns optimized',
    appUrl: 'https://app.auxora.com/achievements',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'daily-digest': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    actionsCount: '7',
    actionsList: '<div style="margin-bottom: 15px;"><strong>1. Paused underperforming ad</strong><br>Ad "Product Photo 3" in Summer Sale campaign had CTR below 0.5%. Paused to save budget.<br><em>Result: $45 saved</em></div><div style="margin-bottom: 15px;"><strong>2. Increased bid on top performer</strong><br>Raised bid for "Hero Banner" by 15% due to strong 5.2x ROAS.<br><em>Result: +$280 revenue projected</em></div><div style="margin-bottom: 15px;"><strong>3. Adjusted budget allocation</strong><br>Moved $100/day from Email Campaign to Summer Sale based on performance.<br><em>Result: Better overall ROAS</em></div>',
    actionsSummary: '• Paused underperforming ad (saved $45)\n• Increased bid on top performer (+$280 revenue)\n• Adjusted budget allocation',
    appUrl: 'https://app.auxora.com/actions/today',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
  
  'onboarding-welcome': {
    brandName: 'Acme Store',
    clientName: 'Sarah',
    appUrl: 'https://app.auxora.com/onboarding',
    prefsUrl: 'https://app.auxora.com/settings/notifications',
  },
};

// Test all templates
console.log('🧪 Testing all notification templates\n');
console.log('='.repeat(70));

const templateNames = getAvailableTemplates();

templateNames.forEach((templateName, index) => {
  console.log(`\n${index + 1}. ${templateName.toUpperCase()}`);
  console.log('-'.repeat(70));
  
  const info = getTemplateInfo(templateName);
  console.log(`Channels: ${info.channels.join(', ')}`);
  
  const data = sampleData[templateName];
  
  if (!data) {
    console.log('⚠️ No sample data defined for this template');
    return;
  }
  
  // Test email
  if (info.hasEmail) {
    try {
      const email = renderEmail(templateName, data);
      console.log(`\n📧 EMAIL:`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Body: ${email.body.length} bytes`);
      
      // Check for unfilled placeholders
      const placeholders = email.body.match(/{{[^}]+}}/g);
      if (placeholders) {
        console.log(`⚠️ Unfilled placeholders: ${placeholders.join(', ')}`);
      } else {
        console.log(`✅ All placeholders filled`);
      }
    } catch (error) {
      console.log(`❌ Email render error: ${error.message}`);
    }
  }
  
  // Test WhatsApp
  if (info.hasWhatsApp) {
    try {
      const whatsapp = renderWhatsApp(templateName, data);
      console.log(`\n💬 WHATSAPP:`);
      console.log(`Length: ${whatsapp.length} chars`);
      console.log(`Preview:\n${whatsapp.substring(0, 200)}...`);
      
      if (whatsapp.length > 1024) {
        console.log(`⚠️ Exceeds WhatsApp limit (1024 chars)`);
      } else {
        console.log(`✅ Within WhatsApp limit`);
      }
      
      // Check for unfilled placeholders
      const placeholders = whatsapp.match(/{{[^}]+}}/g);
      if (placeholders) {
        console.log(`⚠️ Unfilled placeholders: ${placeholders.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ WhatsApp render error: ${error.message}`);
    }
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\n✅ Test complete! Tested ${templateNames.length} templates.`);
