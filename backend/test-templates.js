const templates = require('./templates/notifications/templates');

console.log('✅ Templates loaded successfully!\n');
console.log('Available templates:\n');

Object.keys(templates).forEach((key, i) => {
  const t = templates[key];
  console.log(`  ${i + 1}. ${key}`);
  console.log(`     Channels: ${t.channels.join(', ')}`);
  console.log(`     Subject: ${t.subject}`);
  console.log(`     Email body: ${t.body ? t.body.length + ' bytes' : 'N/A'}`);
  console.log(`     WhatsApp body: ${t.whatsappBody ? t.whatsappBody.length + ' bytes' : 'N/A'}`);
  console.log('');
});

console.log(`Total templates: ${Object.keys(templates).length}`);
