/**
 * Voice Interview Service
 * Handles OpenAI Whisper transcription and GPT-powered intelligent interviewing
 */

import OpenAI from 'openai';

// Interview questions structure
export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  followUpPrompt?: string;
}

export interface InterviewResponse {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface InterviewAnalysis {
  brandProfile: {
    industry: string;
    stage: string;
    mainChallenges: string[];
    currentChannels: string[];
  };
  recommendations: {
    priority: string;
    channels: string[];
    budget: string;
    timeline: string;
  };
  nextSteps: string[];
}

// Initialize OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your environment or use .dev.vars file.');
  }

  return new OpenAI({
    apiKey,
    baseURL: baseURL || 'https://api.openai.com/v1',
  });
}

/**
 * Transcribe audio using OpenAI Whisper
 */
export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    // Convert ArrayBuffer to File
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
    
    // Call Whisper API
    const transcription = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate intelligent follow-up question based on conversation context
 */
export async function generateFollowUpQuestion(
  responses: InterviewResponse[],
  currentCategory: string
): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    const systemPrompt = `You are Digital Leon, an expert growth strategist who has scaled multiple $100M+ businesses across D2C, SaaS, and B2B sectors. You're conducting a growth interview to understand a brand's challenges and opportunities.

Your goal is to:
1. Ask insightful follow-up questions based on their previous answers
2. Dig deeper into specific pain points or opportunities
3. Keep questions concise and focused on actionable insights
4. Maintain a professional yet conversational tone

Current interview category: ${currentCategory}

Generate ONE follow-up question that will help you better understand their growth challenges and create a tailored strategy.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history
    responses.forEach(({ question, answer }) => {
      messages.push({ role: 'assistant', content: question });
      messages.push({ role: 'user', content: answer });
    });
    
    // Request next question
    messages.push({
      role: 'user',
      content: 'Based on my previous answers, what insightful follow-up question would help you understand my growth challenges better?'
    });
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content || 'Can you tell me more about that?';
  } catch (error) {
    console.error('Follow-up question generation error:', error);
    // Return a fallback question
    return 'What specific results are you hoping to achieve in the next 3-6 months?';
  }
}

/**
 * Analyze interview responses and generate growth recommendations
 */
export async function analyzeInterview(responses: InterviewResponse[]): Promise<InterviewAnalysis> {
  try {
    const client = getOpenAIClient();
    
    const systemPrompt = `You are Digital Leon, an expert growth strategist. Analyze the following interview responses and provide:

1. Brand Profile: Industry, stage, main challenges, current channels
2. Recommendations: Priority areas, recommended channels, budget allocation, timeline
3. Next Steps: Specific actionable steps

Format your response as JSON matching this structure:
{
  "brandProfile": {
    "industry": "string",
    "stage": "string (early-stage/growth/scale)",
    "mainChallenges": ["challenge1", "challenge2"],
    "currentChannels": ["channel1", "channel2"]
  },
  "recommendations": {
    "priority": "string (description of top priority)",
    "channels": ["channel1", "channel2"],
    "budget": "string (recommended monthly budget range)",
    "timeline": "string (recommended timeline)"
  },
  "nextSteps": ["step1", "step2", "step3"]
}`;

    const conversationSummary = responses.map(r => 
      `Q: ${r.question}\nA: ${r.answer}`
    ).join('\n\n');
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Interview responses:\n\n${conversationSummary}\n\nProvide your analysis in JSON format.` }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return analysis as InterviewAnalysis;
  } catch (error) {
    console.error('Interview analysis error:', error);
    // Return default analysis
    return {
      brandProfile: {
        industry: 'Not specified',
        stage: 'growth',
        mainChallenges: ['Scaling efficiently', 'Finding right channels'],
        currentChannels: ['Organic social', 'Email']
      },
      recommendations: {
        priority: 'Test and validate paid acquisition channels',
        channels: ['Meta Ads', 'Google Ads'],
        budget: '$2,000 - $5,000/month',
        timeline: '3-6 months'
      },
      nextSteps: [
        'Complete brand audit',
        'Set up analytics infrastructure',
        'Launch initial test campaigns'
      ]
    };
  }
}

/**
 * Generate personalized growth strategy report
 */
export async function generateGrowthStrategy(analysis: InterviewAnalysis): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    const prompt = `Based on this growth analysis, create a comprehensive but concise growth strategy document (max 500 words):

Brand Profile:
- Industry: ${analysis.brandProfile.industry}
- Stage: ${analysis.brandProfile.stage}
- Challenges: ${analysis.brandProfile.mainChallenges.join(', ')}
- Current Channels: ${analysis.brandProfile.currentChannels.join(', ')}

Recommendations:
- Priority: ${analysis.recommendations.priority}
- Recommended Channels: ${analysis.recommendations.channels.join(', ')}
- Budget: ${analysis.recommendations.budget}
- Timeline: ${analysis.recommendations.timeline}

Create a strategy that includes:
1. Executive Summary
2. Channel Strategy (what, why, how)
3. Budget Allocation
4. Success Metrics
5. Implementation Timeline

Write in a professional, actionable tone.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are Digital Leon, a growth strategy expert. Create clear, actionable growth strategies.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content || 'Growth strategy will be generated after review.';
  } catch (error) {
    console.error('Strategy generation error:', error);
    return 'Your personalized growth strategy is being prepared by our team and will be ready within 24 hours.';
  }
}

// Default interview questions
export const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'Tell me about your brand. What product or service do you offer?',
    category: 'brand-overview',
  },
  {
    id: 'q2',
    question: 'Who is your target customer? Describe your ideal buyer.',
    category: 'customer-profile',
  },
  {
    id: 'q3',
    question: 'What is your current monthly revenue or sales volume?',
    category: 'business-metrics',
  },
  {
    id: 'q4',
    question: 'What marketing channels are you currently using?',
    category: 'current-marketing',
  },
  {
    id: 'q5',
    question: 'What is your current monthly ad spend across all channels?',
    category: 'budget',
  },
  {
    id: 'q6',
    question: 'What is your biggest growth challenge right now?',
    category: 'challenges',
  },
  {
    id: 'q7',
    question: 'What have you tried that didn\'t work? And why do you think it failed?',
    category: 'lessons-learned',
  },
  {
    id: 'q8',
    question: 'What is your customer acquisition cost (CAC) and lifetime value (LTV)?',
    category: 'unit-economics',
  },
  {
    id: 'q9',
    question: 'What are your growth goals for the next 6 months?',
    category: 'goals',
  },
  {
    id: 'q10',
    question: 'If you could only focus on one thing to grow your business, what would it be?',
    category: 'priorities',
  },
];
