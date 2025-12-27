# NexSpark Growth Journey - Complete Integration Guide

## 🎯 Overview

This guide will help you set up the complete NexSpark growth journey system with:
- ✅ Google OAuth authentication
- ✅ OpenAI Whisper API for voice transcription
- ✅ GPT-4 for interview analysis and strategy generation
- ✅ Automatic growth plan creation
- ✅ Dashboard with personalized insights

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/user/webapp
npm install openai @types/node --legacy-peer-deps
```

### 2. Configure OpenAI API

You have two options:

#### Option A: Use GenSpark's API Proxy (Recommended for Sandbox)

1. Go to your project's **API Keys** tab
2. Click **"Inject"** to configure the sandbox environment
3. The system will automatically set:
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`

#### Option B: Use Your Own OpenAI API Key

1. Get your API key from: https://platform.openai.com/api-keys
2. Create `.dev.vars` file (already created):

```bash
# Edit .dev.vars file
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 3. Start Development Server

```bash
# Clean port
fuser -k 3000/tcp 2>/dev/null || true

# Build project
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Check logs
pm2 logs nexspark-landing --nostream
```

### 4. Test the System

Visit: https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai

**Test Flow:**
1. Click "GET STARTED" on landing page
2. Click "Continue with Google" (demo mode)
3. View Dashboard
4. Click "START INTERVIEW"
5. Allow microphone access
6. Answer voice questions
7. View generated growth strategy

## 📋 System Architecture

### Flow Diagram

```
Landing Page (/)
    ↓
Google OAuth (/auth/google/callback) 
    ↓
Dashboard (/dashboard)
    ↓
Voice Interview (/interview)
    ↓
OpenAI Whisper → Transcription
    ↓
GPT-4 → Analysis & Strategy
    ↓
Dashboard with Results
```

### Key Components

1. **Landing Page** (`src/index.tsx` - main route `/`)
   - LCARS/Jarvis sci-fi design
   - Brand and Agency registration forms
   - Trust indicators and value propositions

2. **Authentication** (`/auth/google/callback`)
   - Currently: Demo mode (auto-creates mock user)
   - Production: Requires Google OAuth setup

3. **Dashboard** (`/public/static/dashboard.html` + `dashboard.js`)
   - User profile display
   - Interview status tracking
   - Growth plan display
   - Analysis summary

4. **Voice Interview** (`/public/static/interview.html` + `voice-interview.js`)
   - 10 strategic questions from "Digital Leon"
   - Real-time audio recording (MediaRecorder API)
   - Text-to-Speech questions (Web Speech API)
   - Live transcription with OpenAI Whisper
   - Automatic progress saving

5. **API Services** (`src/services/voice-interview.ts`)
   - `transcribeAudio()` - Whisper API integration
   - `analyzeInterview()` - GPT-4 analysis
   - `generateGrowthStrategy()` - Custom strategy generation

## 🔑 API Endpoints

### Public Endpoints

```typescript
GET  /                          // Landing page
GET  /dashboard                 // User dashboard (auth required)
GET  /interview                 // Voice interview (auth required)
GET  /auth/google/callback      // OAuth callback
```

### API Endpoints

```typescript
POST /api/register/brand        // Brand registration
POST /api/register/agency       // Agency registration
POST /api/transcribe           // Whisper transcription
POST /api/interview/analyze     // Interview analysis
POST /api/interview/save        // Save interview data
GET  /api/interview/questions   // Get interview questions
```

### API Request/Response Examples

#### 1. Transcribe Audio

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "success": true,
  "transcript": "I run a D2C skincare brand with $50k monthly revenue...",
  "confidence": 0.95
}
```

#### 2. Analyze Interview

```bash
curl -X POST http://localhost:3000/api/interview/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "responses": [
      {
        "questionId": "q1",
        "question": "Tell me about your brand...",
        "answer": "We sell organic skincare products...",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "brandProfile": {
      "industry": "D2C Skincare",
      "stage": "growth",
      "mainChallenges": ["Scaling CAC efficiently", "Multi-channel attribution"],
      "currentChannels": ["Instagram Ads", "Influencer Marketing"]
    },
    "recommendations": {
      "priority": "Optimize Meta Ads funnel and add Google Shopping",
      "channels": ["Meta Ads", "Google Shopping", "TikTok Ads"],
      "budget": "$5,000 - $10,000/month",
      "timeline": "3-6 months"
    },
    "nextSteps": [
      "Implement proper tracking infrastructure",
      "Launch Google Shopping campaigns",
      "Test TikTok creative strategy"
    ]
  },
  "strategy": "# Executive Summary\n\nBased on your growth interview..."
}
```

## 🎙️ Voice Interview Questions

The system asks 10 strategic questions:

1. Company overview and product/service
2. Current monthly revenue
3. Marketing budget
4. Current marketing channels
5. Customer acquisition cost and LTV
6. Biggest growth challenge
7. Previous failed attempts and lessons
8. Unit economics (CAC/LTV)
9. 6-month growth goals
10. Single most important priority

Each answer is:
- Recorded via browser microphone
- Transcribed using OpenAI Whisper
- Saved to localStorage with progress tracking
- Analyzed by GPT-4 for insights

## 🧠 AI Analysis System

### Interview Analysis (`analyzeInterview`)

**Input:** Array of interview responses  
**Model:** GPT-4  
**Output:** Structured analysis with:
- Brand profile (industry, stage, challenges)
- Recommendations (channels, budget, timeline)
- Actionable next steps

### Strategy Generation (`generateGrowthStrategy`)

**Input:** Interview analysis  
**Model:** GPT-4  
**Output:** Comprehensive growth strategy document including:
- Executive summary
- Channel strategy (what, why, how)
- Budget allocation
- Success metrics
- Implementation timeline

## 🔐 Security & Best Practices

### Environment Variables

**Development (.dev.vars):**
```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Production (Cloudflare Workers):**
```bash
# Set secrets
npx wrangler secret put OPENAI_API_KEY --project-name nexspark
npx wrangler secret put GOOGLE_CLIENT_ID --project-name nexspark
npx wrangler secret put GOOGLE_CLIENT_SECRET --project-name nexspark
```

### Important Security Notes

1. **Never commit `.dev.vars`** - Already in `.gitignore`
2. **Use Cloudflare secrets** for production
3. **Validate all inputs** - Interview responses, audio files
4. **Implement rate limiting** - Prevent API abuse
5. **Add authentication** - Verify user identity before analysis

## 📊 Data Storage

### Current Implementation (localStorage)

**User Data:**
```javascript
localStorage.setItem('nexspark_user', JSON.stringify({
  id: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  created_at: '2024-01-15T10:00:00Z'
}));
```

**Interview Data:**
```javascript
localStorage.setItem('nexspark_interview', JSON.stringify({
  completed: true,
  completedAt: '2024-01-15T10:30:00Z',
  responses: [...],
  analysis: {...},
  strategy: "...",
  progress: 1.0
}));
```

### Production (Cloudflare D1)

**Recommended Schema:**

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table
CREATE TABLE interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  analysis_json TEXT,
  strategy_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Interview responses table
CREATE TABLE interview_responses (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id)
);
```

**Migration Script:** `migrations/0001_interviews.sql`

## 🚀 Production Deployment

### 1. Setup Google OAuth

1. Go to: https://console.cloud.google.com/
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://your-domain.pages.dev/auth/google/callback
   ```
4. Save client ID and secret

### 2. Configure Cloudflare Secrets

```bash
# OpenAI
npx wrangler secret put OPENAI_API_KEY
# Paste your OpenAI API key

# Google OAuth
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_REDIRECT_URI
```

### 3. Setup Database (Optional)

```bash
# Create D1 database
npx wrangler d1 create nexspark-production

# Update wrangler.jsonc with database_id

# Apply migrations
npx wrangler d1 migrations apply nexspark-production
```

### 4. Deploy to Cloudflare Pages

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name nexspark
```

### 5. Verify Deployment

1. Visit your production URL
2. Test authentication flow
3. Complete voice interview
4. Verify strategy generation

## 🧪 Testing Guide

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] Brand registration form works
- [ ] Agency registration form works
- [ ] Google sign-in creates user session
- [ ] Dashboard displays user info
- [ ] "Start Interview" button works
- [ ] Microphone permissions requested
- [ ] Audio recording starts/stops
- [ ] Whisper transcription working
- [ ] Questions progress through 10 steps
- [ ] Interview completion triggers analysis
- [ ] Dashboard shows analysis summary
- [ ] Growth strategy modal displays correctly

### API Testing

```bash
# Test brand registration
curl -X POST http://localhost:3000/api/register/brand \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Co",
    "name": "John Doe",
    "email": "john@test.com",
    "businessType": "d2c",
    "adSpend": "10k-20k"
  }'

# Test transcription (requires audio file)
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-audio.webm"
```

## 🐛 Troubleshooting

### Issue: "OPENAI_API_KEY is not configured"

**Solution:**
```bash
# Check if environment variable is set
echo $OPENAI_API_KEY

# If empty, configure it:
# Option 1: Use GenSpark API injection (click "Inject" in API Keys tab)
# Option 2: Add to .dev.vars file

# Restart server
pm2 restart nexspark-landing
```

### Issue: "Failed to transcribe audio"

**Solutions:**
1. Check API key is valid
2. Verify audio format (WebM, MP3, WAV supported)
3. Check file size < 25MB
4. Check OpenAI API status
5. View detailed error in PM2 logs:
   ```bash
   pm2 logs nexspark-landing --lines 50
   ```

### Issue: "Microphone not working"

**Solutions:**
1. Grant microphone permissions in browser
2. Use HTTPS (required for MediaRecorder)
3. Test in different browser
4. Check browser console for errors

### Issue: "Dashboard not showing analysis"

**Solutions:**
1. Check localStorage:
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('nexspark_interview'))
   ```
2. Verify interview was completed
3. Check if analysis API call succeeded (network tab)
4. Clear cache and retry interview

## 📚 Additional Resources

- **OpenAI Whisper API:** https://platform.openai.com/docs/guides/speech-to-text
- **OpenAI Chat Completions:** https://platform.openai.com/docs/api-reference/chat
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **Hono Framework:** https://hono.dev/

## 🆘 Support

For questions or issues:
- **Email:** founders@nexspark.io
- **Project:** /home/user/webapp
- **Logs:** `pm2 logs nexspark-landing --nostream`
- **Check service:** `pm2 list`

## ✅ Next Steps

1. ✅ Install OpenAI SDK - **DONE**
2. ✅ Configure API credentials - **USE .dev.vars or API injection**
3. ✅ Test voice transcription - **TEST IN BROWSER**
4. ⏳ Add Cloudflare D1 database
5. ⏳ Implement Google OAuth production flow
6. ⏳ Deploy to production
7. ⏳ Add email notifications
8. ⏳ Implement expert matching system
