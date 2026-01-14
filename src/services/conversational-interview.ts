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
  stage?: string;
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
    
    // Extract user answers from conversation
    const conversationHistory = context.previousMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    
    // Perform website research if URL is provided
    let websiteContext = '';
    if (context.userProfile?.websiteUrl) {
      try {
        console.log(`🔍 Researching website: ${context.userProfile.websiteUrl}`);
        const siteResponse = await fetch(context.userProfile.websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NexSpark/1.0; +https://nexspark.io)'
          }
        });
        
        if (siteResponse.ok) {
          let htmlContent = await siteResponse.text();
          // Extract meaningful content
          htmlContent = htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000); // Limit to 3000 chars
          
          websiteContext = `\n\nWebsite Content:\n${htmlContent}`;
          console.log('✅ Website content extracted successfully');
        }
      } catch (error) {
        console.warn('Website research failed, continuing with interview data only:', error);
      }
    }
    
    const systemPrompt = context.language === 'zh'
      ? `分析对话内容和网站信息，提取关键信息并生成实时摘要。

**重要**: 必须基于用户在访谈中提供的实际答案，而不是缓存的或无关的数据。

输出JSON格式：
{
  "keyPoints": ["关键点1", "关键点2", "关键点3"],
  "industry": "行业",
  "stage": "阶段（初创/增长/规模化）",
  "challenges": ["挑战1", "挑战2"],
  "opportunities": ["机会1", "机会2"],
  "nextFocus": "下一个重点关注领域"
}

保持简洁，每个要点不超过15个字。`
      : `Analyze the conversation and website information to extract key information for a real-time summary.

**IMPORTANT**: Must be based on actual answers provided by the user in this interview, not cached or unrelated data.

Output JSON format:
{
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "industry": "industry name",
  "stage": "stage (early/growth/scale)",
  "challenges": ["challenge 1", "challenge 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "nextFocus": "next area to explore"
}

Keep it concise, max 10 words per point.`;

    const userPrompt = `User's interview answers:\n${conversationHistory}${websiteContext}\n\nBrand Name: ${context.userProfile?.brandName || 'Not specified'}\nWebsite: ${context.userProfile?.websiteUrl || 'Not provided'}\n\nProvide real-time summary in JSON format based ONLY on this interview data.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = JSON.parse(data.choices[0].message.content);
    
    return {
      keyPoints: summary.keyPoints || [],
      industry: summary.industry || (context.language === 'zh' ? '待确定' : 'TBD'),
      stage: summary.stage || (context.language === 'zh' ? '增长期' : 'Growth'),
      challenges: summary.challenges || [],
      opportunities: summary.opportunities || [],
      nextFocus: summary.nextFocus || (context.language === 'zh' ? '继续探索' : 'Continue exploring')
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    return {
      keyPoints: [],
      industry: context.language === 'zh' ? '待确定' : 'TBD',
      stage: context.language === 'zh' ? '增长期' : 'Growth',
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
 * Initial interview questions by language (8 essential questions)
 */
export function getInitialQuestions(language: 'en' | 'zh'): string[] {
  if (language === 'zh') {
    return [
      '告诉我你的品牌名称和主要产品？',
      '你的网站或产品链接是什么？如果还没有，可以简单描述一下你的产品。',
      '你目前的月收入是多少？如果不确定，大概范围也可以。',
      '你现在使用哪些渠道进行增长？比如社交媒体、广告、SEO等。',
      '哪个渠道效果最好？或者你还没有开始营销？',
      '你现在最大的增长挑战是什么？',
      '你理想的客户是谁？',
      '未来6个月，你最想实现什么目标？'
    ];
  } else {
    return [
      'Tell me your brand name and what you sell?',
      'What\'s your website or product URL? If you don\'t have one yet, just describe your product.',
      'What\'s your current monthly revenue? A rough estimate is fine if you\'re not sure.',
      'Which channels are you currently using for growth? Like social media, ads, SEO, etc.',
      'What\'s your best performing channel? Or haven\'t you started marketing yet?',
      'What\'s your biggest growth challenge right now?',
      'Who is your ideal customer?',
      'What\'s your main goal for the next 6 months?'
    ];
  }
}

/**
 * Get sample answers for each question
 */
export function getSampleAnswers(language: 'en' | 'zh', questionIndex: number): string {
  const samples = {
    en: [
      'Example: "My brand is called GreenGlow, we sell organic skincare products"',
      'Example: "greenglow.com" or "We don\'t have a website yet, but we sell on Instagram"',
      'Example: "$5,000 per month" or "We haven\'t launched yet" or "I don\'t know exactly"',
      'Example: "Instagram and Facebook ads" or "Just word of mouth" or "Haven\'t started yet"',
      'Example: "Instagram gets us the most customers" or "We haven\'t tried marketing yet"',
      'Example: "Finding new customers" or "Our ads aren\'t converting well" or "I\'m not sure where to start"',
      'Example: "Women aged 25-40 who care about natural products" or "Small business owners"',
      'Example: "Reach $20K monthly revenue" or "Get 100 new customers" or "Just get started with marketing"'
    ],
    zh: [
      '例如："我的品牌叫绿光，我们销售有机护肤品"',
      '例如："greenglow.com" 或 "我们还没有网站，但在Instagram上销售"',
      '例如："每月5000美元" 或 "我们还没推出" 或 "我不太确定"',
      '例如："Instagram和Facebook广告" 或 "只靠口碑" 或 "还没开始"',
      '例如："Instagram给我们带来最多客户" 或 "我们还没试过营销"',
      '例如："找到新客户" 或 "我们的广告转化不好" 或 "我不知道从哪开始"',
      '例如："25-40岁关注天然产品的女性" 或 "小企业主"',
      '例如："月收入达到2万美元" 或 "获得100个新客户" 或 "开始做营销"'
    ]
  };
  
  return samples[language][questionIndex] || '';
}

/**
 * Get interview introduction by language
 */
export function getInterviewIntroduction(language: 'en' | 'zh'): {
  title: string;
  purpose: string[];
  guidelines: string[];
} {
  if (language === 'zh') {
    return {
      title: '让我们开始吧',
      purpose: [
        '了解您的现状和品牌背后的历史或驱动力',
        '了解您的目标，以便我们使用第三方数据制定符合您品牌和目标的策略和执行计划'
      ],
      guidelines: [
        '不需要精确答案 - 分享您的想法即可',
        '看到样例答案 - 帮助您理解问题',
        '说"我不知道"也完全可以',
        '即使是假设性的想法也很有帮助'
      ]
    };
  } else {
    return {
      title: 'Let\'s Get Started',
      purpose: [
        'Understand your status quo and the history or drives behind your brand',
        'Understand your goals so we can use third-party data to create a strategy that fits your specific needs, branding, and objectives'
      ],
      guidelines: [
        'No need for precise answers - just share what\'s on your mind',
        'See sample answers - they help you understand the questions',
        'It\'s OK to say "I don\'t know"',
        'Even hypothetical thoughts are helpful'
      ]
    };
  }
}
