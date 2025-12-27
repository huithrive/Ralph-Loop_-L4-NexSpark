# NexSpark Voice Interview - OpenAI Integration Guide

## Overview

This guide explains how to integrate OpenAI Whisper API for voice transcription in the NexSpark growth interview system.

## Current Implementation

### What's Built
- ✅ Complete voice interview UI with LCARS/Jarvis design
- ✅ Google OAuth authentication (simulated for demo)
- ✅ Dashboard with growth journey tracking
- ✅ Voice recording using MediaRecorder API
- ✅ Text-to-Speech for questions using Web Speech API
- ✅ Interview progress tracking
- ✅ Transcript display with user/AI differentiation
- ✅ Interview data persistence in localStorage

### What Needs Integration
- ⏳ OpenAI Whisper API for audio transcription
- ⏳ OpenAI Chat Completions for intelligent follow-up questions
- ⏳ Database storage (Cloudflare D1) for user data
- ⏳ Production Google OAuth flow

## OpenAI Whisper API Integration

### Step 1: Get API Configuration

The sandbox environment should have OpenAI-compatible credentials. Check if they exist:

\`\`\`bash
# Check for config file
cat ~/.genspark_llm.yaml

# Or check environment variables
echo $OPENAI_API_KEY
echo $OPENAI_BASE_URL
\`\`\`

### Step 2: Install OpenAI SDK

\`\`\`bash
cd /home/user/webapp
npm install openai js-yaml
\`\`\`

### Step 3: Create Transcription Service

Create `src/services/transcription.ts`:

\`\`\`typescript
import OpenAI from 'openai';
import fs from 'fs';
import yaml from 'js-yaml';
import os from 'os';
import path from 'path';

// Load configuration
const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
let config = null;

if (fs.existsSync(configPath)) {
  const fileContents = fs.readFileSync(configPath, 'utf8');
  config = yaml.load(fileContents);
}

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: config?.openai?.api_key || process.env.OPENAI_API_KEY,
  baseURL: config?.openai?.base_url || process.env.OPENAI_BASE_URL,
});

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert Blob to File
    const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
    
    // Call Whisper API
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
\`\`\`

### Step 4: Update API Route

Update `/api/transcribe` in `src/index.tsx`:

\`\`\`typescript
// Import the transcription service
import { transcribeAudio } from './services/transcription';

// API endpoint for OpenAI Whisper transcription
app.post('/api/transcribe', async (c) => {
  try {
    const formData = await c.req.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ success: false, message: 'No audio file provided' }, 400)
    }
    
    console.log('Audio file received for transcription');
    
    // Convert File to Blob
    const arrayBuffer = await audioFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: audioFile.type });
    
    // Transcribe using OpenAI Whisper
    const transcript = await transcribeAudio(blob);
    
    return c.json({ 
      success: true, 
      transcript: transcript,
      confidence: 0.95 // Whisper doesn't return confidence, but we can estimate
    })
  } catch (error) {
    console.error('Transcription error:', error);
    return c.json({ 
      success: false, 
      message: 'Transcription failed: ' + (error as Error).message 
    }, 500)
  }
})
\`\`\`

### Step 5: Update Frontend to Use API

Update `processAudioResponse` in `public/static/voice-interview.js`:

\`\`\`javascript
async function processAudioResponse(audioBlob) {
  try {
    document.getElementById('statusText').innerHTML = \`
      <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
        Processing...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Transcribing your response
      </div>
    \`;
    
    // Send audio to API for transcription
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const transcript = result.transcript;
    
    // Save response
    interviewState.responses.push({
      question: interviewQuestions[interviewState.currentQuestion],
      answer: transcript,
      timestamp: new Date().toISOString()
    });
    
    // Add to transcript
    addToTranscript('user', transcript);
    
    // Move to next question
    interviewState.currentQuestion++;
    
    if (interviewState.currentQuestion < interviewQuestions.length) {
      // Show next question
      setTimeout(() => {
        showQuestion(interviewState.currentQuestion);
        speakQuestion(interviewQuestions[interviewState.currentQuestion]);
        
        document.getElementById('statusText').innerHTML = \`
          <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
            Listening...
          </div>
          <div class="text-white/70 font-mono text-sm">
            Click the microphone to answer
          </div>
        \`;
      }, 1000);
    } else {
      completeInterview();
    }
    
  } catch (error) {
    console.error('Error processing audio:', error);
    alert('Failed to process audio: ' + error.message);
    
    document.getElementById('statusText').innerHTML = \`
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Error
      </div>
      <div class="text-white/70 font-mono text-sm">
        \${error.message || 'Please try recording again'}
      </div>
    \`;
  }
}
\`\`\`

## Advanced: Intelligent Follow-up Questions

To make the interview more dynamic, you can use GPT to generate contextual follow-up questions based on user responses.

### Create AI Interview Service

Create `src/services/ai-interview.ts`:

\`\`\`typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function generateFollowUpQuestion(
  conversation: Array<{question: string, answer: string}>
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: \`You are Digital Leon, an expert growth strategist who has scaled multiple $100M+ businesses. 
      You are conducting an interview to understand a brand's growth challenges. 
      Ask insightful follow-up questions based on their previous answers.
      Keep questions concise and focused on actionable insights.\`
    }
  ];
  
  // Add conversation history
  conversation.forEach(({question, answer}) => {
    messages.push({ role: 'assistant', content: question });
    messages.push({ role: 'user', content: answer });
  });
  
  // Request next question
  messages.push({
    role: 'user',
    content: 'Based on my previous answers, what\'s your next question?'
  });
  
  const completion = await client.chat.completions.create({
    model: 'gpt-5',
    messages: messages,
    max_tokens: 150,
    temperature: 0.7,
  });
  
  return completion.choices[0].message.content || 'Can you tell me more about that?';
}
\`\`\`

## Testing the Integration

### 1. Test Transcription API

\`\`\`bash
# Create a test audio file (or use existing one)
# Test the endpoint
curl -X POST http://localhost:3000/api/transcribe \\
  -F "audio=@test-audio.wav"
\`\`\`

### 2. Test in Browser

1. Click "Start Interview" on the dashboard
2. Allow microphone permissions
3. Answer a question by clicking the microphone
4. Check console for transcription results
5. Verify transcript appears in the UI

## Production Deployment Notes

### Environment Variables

Add to Cloudflare Workers:

\`\`\`bash
# Set OpenAI API key
npx wrangler secret put OPENAI_API_KEY --project-name nexspark

# Set base URL (if using proxy)
npx wrangler secret put OPENAI_BASE_URL --project-name nexspark
\`\`\`

### Update wrangler.jsonc

\`\`\`jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "nexspark",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "ENVIRONMENT": "production"
  }
}
\`\`\`

## Troubleshooting

### Issue: "API key not found"

**Solution**: Ensure environment variables are set:
\`\`\`bash
echo $OPENAI_API_KEY
echo $OPENAI_BASE_URL
\`\`\`

### Issue: "Audio format not supported"

**Solution**: Convert audio to supported format (wav, mp3, m4a, etc.):
\`\`\`javascript
const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
\`\`\`

### Issue: "File too large"

**Solution**: Whisper API has a 25MB limit. Implement chunking for longer recordings:
\`\`\`javascript
if (audioBlob.size > 25 * 1024 * 1024) {
  alert('Recording too long. Please keep responses under 2 minutes.');
  return;
}
\`\`\`

## Next Steps

1. **Test with real API keys**: Get OpenAI API key and test transcription
2. **Add error handling**: Implement retry logic and user-friendly error messages
3. **Optimize audio format**: Use compressed formats to reduce bandwidth
4. **Add confidence thresholds**: Prompt user to repeat if confidence is low
5. **Implement real-time transcription**: Use streaming API for immediate feedback
6. **Save to database**: Store interview data in Cloudflare D1 instead of localStorage
7. **Generate growth plan**: Use GPT to analyze responses and create custom strategy

## File Locations

- **Voice Interview UI**: `public/static/interview.html`
- **Interview Logic**: `public/static/voice-interview.js`
- **Dashboard**: `public/static/dashboard.html`
- **API Routes**: `src/index.tsx`
- **Transcription Service**: `src/services/transcription.ts` (to be created)

## Support

For questions about OpenAI integration:
- OpenAI Docs: https://platform.openai.com/docs/guides/speech-to-text
- Whisper API Reference: https://platform.openai.com/docs/api-reference/audio

For NexSpark-specific questions:
- Email: founders@nexspark.io
- Documentation: See README.md
\`\`\`

