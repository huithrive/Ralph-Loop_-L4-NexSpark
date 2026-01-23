# Strategist Module - Voice Interview Agent

## Purpose
Conduct AI-powered voice interviews to gather brand context, goals, and constraints.

## Requirements

### Interview Flow

**Stage 1: Welcome** (30 seconds)
- AI introduces itself
- Explains the process (4 questions, 8-12 minutes)
- Tests audio

**Stage 2: Core Questions** (7-10 minutes)
Ask 4 sequential questions with follow-ups

**Stage 3: Summary** (1-2 minutes)
- AI summarizes insights
- User confirms
- Next steps

### Interview Questions

**Q1: Brand Story & Goals**
"Tell me about your brand story. What motivated you to start this business, and what problem are you solving for your customers?"

Follow-ups:
- What makes your solution unique?
- Where do you see your brand in 2-3 years?

Extract: Founding motivation, value proposition, vision

**Q2: Channel Strategy & Past Experience**
"What marketing channels have you tried before? What worked well, what didn't, and which channels are you most interested in focusing on now?"

Follow-ups:
- What was your best campaign? Why did it work?
- What's been your biggest marketing challenge?

Extract: Channel experience, successes/failures, preferences, marketing maturity

**Q3: Revenue Targets & Positioning**
"What are your revenue targets for the next 90 days? And how do you position your brand compared to competitors?"

Follow-ups:
- What's your current monthly revenue?
- Who are your main competitors?
- What's your pricing strategy?

Extract: Revenue targets, competitive differentiation, pricing positioning

**Q4: Personal Motivations & Constraints**
"What does success look like for you personally? And what are your biggest concerns or constraints right now?"

Follow-ups:
- How much time can you dedicate weekly?
- What's your budget comfort zone?
- Are you solo or have a team?

Extract: Motivations, time/budget constraints, team resources, concerns

### Output Structure

{
  "interviewId": "uuid",
  "userId": "uuid",
  "timestamp": "ISO-8601",
  "duration": "seconds",
  "transcript": [
    {
      "speaker": "ai|user",
      "timestamp": "seconds from start",
      "text": "string"
    }
  ],
  "analysis": {
    "brandPositioning": {
      "valueProposition": "string",
      "differentiators": ["string"],
      "brandPersonality": "string"
    },
    "targetMarketUnderstanding": {
      "score": "1-10",
      "clarity": "low|medium|high"
    },
    "resourceConstraints": {
      "timeAvailability": "string",
      "budgetRange": "string",
      "teamSize": "number",
      "technicalCapability": "low|medium|high"
    },
    "growthPriorities": [
      {
        "priority": "string",
        "urgency": "low|medium|high",
        "rank": "number"
      }
    ],
    "personalMotivations": {
      "primaryMotivation": "string",
      "successDefinition": "string",
      "emotionalDrivers": ["string"]
    },
    "recommendations": {
      "focusAreas": ["string"],
      "recommendedChannels": ["string"],
      "quickWins": ["string"]
    }
  }
}

## Technical Requirements

### Backend Endpoints
- POST /api/strategist/interview/start
- WS /api/strategist/interview/stream/:sessionId
- POST /api/strategist/interview/complete
- GET /api/strategist/interview/:interviewId

### APIs & Integrations
- Speech-to-Text: OpenAI Whisper API
- Text-to-Speech: ElevenLabs API
- Analysis: Claude API (Anthropic)

### Database Table: interviews
- id (UUID, primary key)
- user_id (UUID)
- session_id (UUID)
- transcript (JSONB)
- analysis (JSONB)
- duration (INTEGER seconds)
- status (ENUM: in_progress, completed, failed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Performance
- Real-time transcription: <2s latency
- AI response generation: <3s
- Total interview: 8-12 minutes
- Transcription accuracy: >95%

## Acceptance Criteria
- [ ] User can grant microphone permission
- [ ] AI voice speaks questions clearly
- [ ] User voice captured and transcribed accurately
- [ ] Interview follows 4-question structure
- [ ] Follow-up questions adapt to responses
- [ ] Transcript saved in real-time
- [ ] Analysis generates structured insights
- [ ] User can review transcript
- [ ] Works on Chrome, Firefox, Safari

## Privacy & Security
- Encrypt transcript data at rest
- Option to delete transcript after analysis
- Clear privacy notice before interview
- No audio recording stored (only transcript)

## Dependencies
- ws (WebSocket)
- @anthropic-ai/sdk (Claude)
- openai (Whisper API)
- elevenlabs (TTS API)
