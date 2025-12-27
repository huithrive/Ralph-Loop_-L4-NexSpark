# NexSpark - The Airbnb for Market Growth

> AI-Powered Operating System for the $372B Agency Economy

## 🚀 Live URLs

- **Development:** https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai
- **Production:** (To be deployed)
- **GitHub:** (To be configured)

## 📋 Project Overview

NexSpark is an AI-powered marketplace connecting D2C and SaaS brands with growth experts. Think of it as the "Airbnb" of growth services - providing trust, efficiency, and quality matching.

### For Brands (D2C & SaaS)

- **Growth Diagnosis:** AI-powered analysis with "Digital Leon" (AI growth strategist with $100M+ scaling experience)
- **Custom Playbook:** Channel strategy for next 3-6 months with budget recommendations
- **Expert Matching:** Connect with world-class growth specialists at affordable prices
- **Escrow Protection:** Money released only to experts who provide proof of work

### For Agencies & Freelancers

- **4x Capacity:** Manage 20 clients with AI automation (vs 5 manually)
- **Income Growth:** From $2,500/mo to $10,000/mo potential
- **Guaranteed Leads:** Consistent client flow through platform matching
- **Fair Recognition:** Rewarded for quality work, not just scale

## ✨ Completed Features

### 1. Landing Page (LCARS/Jarvis Sci-Fi Design)

- ✅ Hero section with trust indicators (100% retention, 300% ROAS lift, 20x scale, $372B market)
- ✅ Dual audience targeting (Brands & Agencies)
- ✅ 4-step brand journey (Diagnosis → Playbook → Matching → Escrow)
- ✅ 3 agency benefits (Capacity → Income → Recognition)
- ✅ Pricing tiers ($800/mo, $2,400/mo, Custom)
- ✅ Modal registration forms with validation

### 2. Authentication System

- ✅ Google OAuth integration (demo mode for development)
- ✅ User session management with localStorage
- ✅ Protected routes (Dashboard, Interview)
- 🔄 Production OAuth setup (pending)

### 3. Voice Interview System ⭐ NEW

- ✅ **10 Strategic Questions** from "Digital Leon" AI growth strategist
- ✅ **Real-time Voice Recording** using MediaRecorder API
- ✅ **OpenAI Whisper Integration** for accurate transcription
- ✅ **Text-to-Speech Questions** using Web Speech API
- ✅ **Live Transcript Display** with user/AI differentiation
- ✅ **Progress Tracking** with automatic save to localStorage
- ✅ **Error Handling** with retry capability
- ✅ **Completion Analysis** using GPT-4

### 4. AI-Powered Analysis ⭐ NEW

- ✅ **Interview Analysis:** GPT-4 analyzes responses to understand brand profile
- ✅ **Growth Strategy Generation:** Custom strategy based on interview insights
- ✅ **Brand Profiling:** Industry, stage, challenges, current channels
- ✅ **Recommendations:** Priority channels, budget allocation, timeline
- ✅ **Next Steps:** Actionable implementation roadmap

### 5. Dashboard

- ✅ User profile display
- ✅ Growth journey tracking (Registration → Interview → Strategy → Execution)
- ✅ Interview status with completion indicator
- ✅ **Analysis Summary Display** ⭐ NEW
- ✅ **Growth Strategy Modal** ⭐ NEW
- ✅ Quick actions (Schedule call, View docs)

### 6. API Endpoints

- ✅ `POST /api/register/brand` - Brand registration
- ✅ `POST /api/register/agency` - Agency registration  
- ✅ `GET /auth/google/callback` - OAuth callback
- ✅ `POST /api/transcribe` - **OpenAI Whisper transcription** ⭐ NEW
- ✅ `POST /api/interview/analyze` - **GPT-4 analysis & strategy** ⭐ NEW
- ✅ `POST /api/interview/save` - Save interview progress
- ✅ `GET /api/interview/questions` - Get default questions

## 🏗️ Technology Stack

- **Framework:** Hono (lightweight, fast edge framework)
- **Runtime:** Cloudflare Workers/Pages
- **Frontend:** Vanilla JavaScript, TailwindCSS (CDN)
- **AI Services:** OpenAI Whisper (transcription), GPT-4 (analysis)
- **Design:** LCARS/Jarvis-inspired sci-fi interface
- **Fonts:** Antonio, Rajdhani, JetBrains Mono
- **Icons:** FontAwesome 6.4.0
- **Build Tool:** Vite
- **Process Manager:** PM2 (development)

## 🎙️ Voice Interview Questions

The AI growth strategist "Digital Leon" asks 10 strategic questions:

1. Company overview and product/service offering
2. Current monthly revenue or sales volume
3. Monthly marketing/ad spend
4. Current marketing channels in use
5. Customer acquisition cost (CAC) and lifetime value (LTV)
6. Biggest growth challenge
7. Previous failed attempts and lessons learned
8. Detailed unit economics
9. 6-month growth goals
10. Single most important priority

Each response is:
- Recorded via browser microphone
- Transcribed with OpenAI Whisper
- Analyzed by GPT-4 for insights
- Used to generate personalized growth strategy

## 📊 Data Architecture

### Current (Development)

- **Storage:** localStorage
- **User Data:** Profile, session info
- **Interview Data:** Responses, analysis, strategy, progress

### Planned (Production)

- **Database:** Cloudflare D1 (SQLite)
- **Tables:** users, interviews, interview_responses
- **Schema:** See `SETUP_GUIDE.md` for migration scripts

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
npm or yarn
OpenAI API key (get from https://platform.openai.com/api-keys)
```

### Installation

```bash
# Navigate to project
cd /home/user/webapp

# Install dependencies (already done)
npm install

# Configure OpenAI API
# Option 1: Use GenSpark API injection (click "Inject" in API Keys tab)
# Option 2: Edit .dev.vars file with your OpenAI API key

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs nexspark-landing --nostream

# Check status
pm2 list
```

### Testing the Voice Interview

1. Visit: https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai
2. Click "GET STARTED"
3. Click "Continue with Google" (demo mode)
4. On dashboard, click "START INTERVIEW"
5. Allow microphone permissions
6. Click microphone button to answer each question
7. Complete all 10 questions
8. View generated growth strategy on dashboard

## 🔧 Configuration

### Environment Variables (.dev.vars)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Google OAuth (for production)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.pages.dev/auth/google/callback

# Application Settings
ENVIRONMENT=development
```

### Wrangler Configuration (wrangler.jsonc)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "nexspark",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"]
}
```

## 🎨 Design System

### LCARS/Jarvis Theme

- **Colors:** 
  - Gold `#FF9C00` (primary actions, trust indicators)
  - Blue `#99CCFF` (tech, system messages)
  - Purple `#CC99CC` (secondary actions)
  - Red `#CC3333` (alerts, errors)
  - Black `#000000` (background)

- **Typography:**
  - Headers: Antonio (600, 700)
  - Body: Rajdhani (400, 500, 600)
  - Code/Mono: JetBrains Mono

- **Animations:**
  - Starfield background (800 particles, warp speed)
  - Holodeck grid overlay
  - Smooth fade-in transitions
  - LCARS-style bracket borders

## 📈 User Journey

```
Landing Page → Google Sign-In → Dashboard
                                    ↓
                          [Start Voice Interview]
                                    ↓
                          Digital Leon asks 10 questions
                                    ↓
                          OpenAI Whisper transcribes answers
                                    ↓
                          GPT-4 analyzes responses
                                    ↓
                          Growth strategy generated
                                    ↓
                          Dashboard displays results
                                    ↓
                   [Schedule Strategy Call with Expert]
```

## 🧪 API Testing

### Test Brand Registration

```bash
curl -X POST http://localhost:3000/api/register/brand \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "name": "John Doe",
    "email": "john@test.com",
    "businessType": "d2c",
    "adSpend": "10k-20k",
    "website": "https://test.com",
    "currentChannels": "Meta Ads, Google Ads",
    "challenge": "Scaling CAC efficiently"
  }'
```

### Test Voice Transcription

```bash
# Requires audio file
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
```

### Test Interview Analysis

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

## 📝 Next Steps

### Phase 1: Database Migration
- [ ] Set up Cloudflare D1 database
- [ ] Create migration scripts
- [ ] Migrate from localStorage to D1
- [ ] Implement server-side session management

### Phase 2: Production OAuth
- [ ] Configure Google OAuth credentials
- [ ] Implement production OAuth flow
- [ ] Add session tokens and security

### Phase 3: Expert Matching
- [ ] Build expert profiles database
- [ ] Implement matching algorithm
- [ ] Add expert recommendation system
- [ ] Create expert application flow

### Phase 4: Escrow System
- [ ] Integrate payment gateway (Stripe)
- [ ] Build escrow logic
- [ ] Add proof-of-work verification
- [ ] Implement payment release workflow

### Phase 5: Production Deployment
- [ ] Deploy to Cloudflare Pages
- [ ] Configure custom domain (nexspark.io)
- [ ] Set up monitoring and analytics
- [ ] Add email notifications (Resend/SendGrid)

## 📚 Documentation

- **Setup Guide:** See `SETUP_GUIDE.md` for complete OpenAI integration guide
- **OpenAI Integration:** See `OPENAI_INTEGRATION.md` for API details
- **Project Structure:** See file tree in repository

## 🤝 Contributing

For questions or contributions:
- **Email:** founders@nexspark.io
- **LinkedIn:** linkedin.com/company/nexspark
- **Project Location:** /home/user/webapp

## 📄 License

Copyright © 2024 NexSpark. All rights reserved.

---

**Built with ❤️ for the $372B agency economy transformation**

*Powered by OpenAI Whisper & GPT-4 | Hosted on Cloudflare Workers*
