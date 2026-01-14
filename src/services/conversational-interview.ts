/**
 * Conversational Interview Service
 * Multilingual, empathetic AI interviewer with real-time engagement
 */

export interface ConversationMessage {
  role: 'interviewer' | 'user';
  content: string;
  language: 'en' | 'zh';
  timestamp: string;
  type: 'question' | 'acknowledgment' | 'follow-up' | 'answer';
}

export interface ConversationContext {
  language: 'en' | 'zh';
  previousMessages: ConversationMessage[];
  currentTopic: string;
  userProfile: {
    brandName?: string;
    industry?: string;
    stage?: string;
  };
}

export interface RealtimeSummary {
  keyPoints: string[];
  industry: string;
  challenges: string[];
  opportunities: string[];
  nextFocus: string;
}

/**
 * Initialize OpenAI client with multilingual support
 */
function getOpenAIClient(env?: any) {
  const apiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = env?.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return {
    apiKey,
    baseURL
  };
}

/**
 * Transcribe audio with language auto-detection
 */
export async function transcribeWithLanguage(
  audioBuffer: ArrayBuffer,
  preferredLanguage: 'en' | 'zh',
  env?: any
): Promise<{ text: string; language: 'en' | 'zh' }> {
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);
    
    // Create form data
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Auto-detect language or use preferred
    if (preferredLanguage === 'zh') {
      formData.append('language', 'zh');
    }
    formData.append('response_format', 'json');
    
    const response = await fetch(`${baseURL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Detect if response is Chinese
    const isChinese = /[\u4e00-\u9fa5]/.test(data.text);
    const detectedLanguage = isChinese ? 'zh' : 'en';
    
    return {
      text: data.text,
      language: detectedLanguage
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Generate empathetic response/acknowledgment
 * Shows understanding and encourages further engagement
 */
export async function generateAcknowledgment(
  userAnswer: string,
  context: ConversationContext,
  env?: any
): Promise<string> {
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);
    
    const systemPrompt = context.language === 'zh' 
      ? `你是一位富有同理心的增长战略顾问。用简短、温暖的方式回应用户，表现出你理解并重视他们所说的内容。

回应要求：
- 3-8个字的简短回应
- 表现出真诚的理解和共鸣
- 鼓励继续对话
- 避免过度热情或机械化

示例回应：
- "明白了"
- "这很重要"
- "继续说"
- "很有见地"
- "我理解"
- "确实如此"
- "好的"`
      : `You are an empathetic growth strategist. Respond briefly and warmly to show you understand and value what they're saying.

Requirements:
- Keep it to 2-5 words
- Show genuine understanding
- Encourage continuation
- Avoid being overly enthusiastic or robotic

Example responses:
- "Got it"
- "That's key"
- "Tell me more"
- "Great insight"
- "I see"
- "Makes sense"
- "Understood"`;

    const conversationHistory = context.previousMessages
      .slice(-4)
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'User'}: ${m.content}`)
      .join('\n');

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Recent conversation:\n${conversationHistory}\n\nUser just said: "${userAnswer}"\n\nProvide a brief, empathetic acknowledgment (${context.language === 'zh' ? '3-8个字' : '2-5 words'}).` }
        ],
        max_tokens: 20,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Acknowledgment generation error:', error);
    // Fallback acknowledgments
    return context.language === 'zh' ? '好的' : 'Got it';
  }
}

/**
 * Generate next question with context awareness
 */
export async function generateNextQuestion(
  context: ConversationContext,
  env?: any
): Promise<string> {
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);
    
    const systemPrompt = context.language === 'zh'
      ? `你是一位专业的增长战略顾问，正在进行一对一深度访谈。你的目标是：

1. 了解品牌的核心业务、目标客户、增长挑战
2. 挖掘关键的增长机会和痛点
3. 收集足够信息以制定定制化的增长策略

对话风格：
- 像真人一样自然对话，不是机械问答
- 基于之前的回答提出相关问题
- 表现出好奇心和专业性
- 用简洁、清晰的语言
- 一次只问一个问题
- 避免商业术语，使用通俗易懂的表达

当前访谈主题：${context.currentTopic}
已收集的信息：${JSON.stringify(context.userProfile, null, 2)}

基于对话历史，提出下一个最有价值的问题。`
      : `You are a professional growth strategist conducting a one-on-one deep-dive interview. Your goals:

1. Understand the brand's core business, target customers, and growth challenges
2. Uncover key growth opportunities and pain points
3. Gather enough information to create a customized growth strategy

Conversation style:
- Talk naturally like a real person, not a robot
- Ask follow-up questions based on previous answers
- Show genuine curiosity and expertise
- Use simple, clear language
- Ask one question at a time
- Avoid jargon, use conversational language

Current interview topic: ${context.currentTopic}
Information gathered: ${JSON.stringify(context.userProfile, null, 2)}

Based on the conversation history, ask the next most valuable question.`;

    const conversationHistory = context.previousMessages
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'User'}: ${m.content}`)
      .join('\n');

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Conversation so far:\n${conversationHistory}\n\nWhat's the next insightful question to ask?` }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Question generation error:', error);
    // Fallback questions
    const fallbacks = {
      zh: [
        '能详细说说您的目标客户是谁吗？',
        '您目前最大的增长挑战是什么？',
        '您对未来6个月有什么具体目标？'
      ],
      en: [
        'Can you tell me more about your target customers?',
        'What\'s your biggest growth challenge right now?',
        'What are your specific goals for the next 6 months?'
      ]
    };
    
    return fallbacks[context.language][Math.floor(Math.random() * fallbacks[context.language].length)];
  }
}

/**
 * Generate real-time summary as user speaks
 */
export async function generateRealtimeSummary(
  context: ConversationContext,
  env?: any
): Promise<RealtimeSummary> {
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);
    
    const systemPrompt = context.language === 'zh'
      ? `分析对话内容，提取关键信息并生成实时摘要。

输出JSON格式：
{
  "keyPoints": ["关键点1", "关键点2", "关键点3"],
  "industry": "行业",
  "challenges": ["挑战1", "挑战2"],
  "opportunities": ["机会1", "机会2"],
  "nextFocus": "下一个重点关注领域"
}

保持简洁，每个要点不超过15个字。`
      : `Analyze the conversation and extract key information for a real-time summary.

Output JSON format:
{
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "industry": "industry name",
  "challenges": ["challenge 1", "challenge 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "nextFocus": "next area to explore"
}

Keep it concise, max 10 words per point.`;

    const conversationHistory = context.previousMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Conversation content:\n${conversationHistory}\n\nProvide real-time summary in JSON format.` }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const summary = JSON.parse(data.choices[0].message.content);
    
    return {
      keyPoints: summary.keyPoints || [],
      industry: summary.industry || (context.language === 'zh' ? '待确定' : 'TBD'),
      challenges: summary.challenges || [],
      opportunities: summary.opportunities || [],
      nextFocus: summary.nextFocus || (context.language === 'zh' ? '继续探索' : 'Continue exploring')
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    return {
      keyPoints: [],
      industry: context.language === 'zh' ? '待确定' : 'TBD',
      challenges: [],
      opportunities: [],
      nextFocus: context.language === 'zh' ? '继续对话' : 'Continue conversation'
    };
  }
}

/**
 * Text-to-Speech with language support
 */
export async function synthesizeSpeech(
  text: string,
  language: 'en' | 'zh',
  env?: any
): Promise<ArrayBuffer> {
  try {
    const { apiKey, baseURL } = getOpenAIClient(env);
    
    // Choose appropriate voice for language
    const voice = language === 'zh' ? 'nova' : 'alloy'; // nova has better multilingual support
    
    const response = await fetch(`${baseURL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error;
  }
}

/**
 * Initial interview questions by language
 */
export function getInitialQuestions(language: 'en' | 'zh'): string[] {
  if (language === 'zh') {
    return [
      '你好！我是你的AI增长战略顾问。首先，能告诉我你的品牌或产品的名字吗？',
      '很好！用你自己的话描述一下，这个产品是做什么的？是为谁服务的？',
      '你是什么时候开始做这个品牌的？当初是什么动力驱使你创建它的？',
      '目前的月收入大概是多少？',
      '你目前在用哪些营销渠道？每个渠道大概的月预算和效果如何？',
      '哪个渠道表现最好？能分享一些具体的数据吗？比如转化率、ROI等。',
      '目前增长遇到的最大挑战是什么？',
      '你的理想客户是谁？详细描述一下他们的特征、痛点、行为习惯等。',
      '你的前3个竞争对手是谁？你的品牌与他们相比有什么独特之处？',
      '未来6个月的主要目标是什么？在收入、客户增长或市场扩张方面有具体指标吗？'
    ];
  } else {
    return [
      'Hi! I\'m your AI growth strategist. Let\'s start with the basics - what\'s your brand or product name?',
      'Perfect! How would you describe your product in your own words? What does it do and who is it for?',
      'When did you start this brand and what motivated you to create it?',
      'What\'s your current monthly revenue?',
      'Which marketing channels are you currently using? For each channel, what\'s your monthly spend and results?',
      'What\'s your best performing channel? Can you share specific metrics like conversion rate or ROI?',
      'What\'s the biggest growth challenge you\'re facing right now?',
      'Who is your ideal customer? Describe them in detail - demographics, pain points, behaviors.',
      'Who are your top 3 competitors and what makes your brand different from them?',
      'What\'s your main goal for the next 6 months? Be specific about revenue, customer growth, or market targets.'
    ];
  }
}
