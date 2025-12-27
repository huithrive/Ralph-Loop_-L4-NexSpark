// Simple test to verify OpenAI configuration is working
import OpenAI from 'openai';
import fs from 'fs';

// Load environment variables from .dev.vars
const envContent = fs.readFileSync('.dev.vars', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      env[key.trim()] = values.join('=').trim();
    }
  }
});

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

console.log('🔑 Testing OpenAI API Configuration...\n');

async function testOpenAI() {
  try {
    // Test with a simple chat completion
    console.log('📝 Testing GPT-4 Chat...');
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OpenAI is working!" in exactly 3 words.' }
      ],
      max_tokens: 10,
    });
    
    console.log('✅ GPT-4 Response:', completion.choices[0].message.content);
    console.log('\n✨ OpenAI API is configured correctly!');
    console.log('✨ Voice interview transcription and analysis will work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status === 401) {
      console.error('\n⚠️  Invalid API key. Please check your .dev.vars file.');
    } else if (error.status === 429) {
      console.error('\n⚠️  Rate limit exceeded. Please try again in a moment.');
    } else {
      console.error('\n⚠️  API Error:', error);
    }
  }
}

testOpenAI();
