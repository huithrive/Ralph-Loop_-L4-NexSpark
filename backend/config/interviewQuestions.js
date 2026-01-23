/**
 * Interview Questions Configuration for NexSpark Strategist
 *
 * Structured interview questions to gather brand insights, marketing history,
 * revenue goals, and personal constraints for strategic planning.
 */

const INTERVIEW_QUESTIONS = [
  {
    questionNumber: 1,
    category: 'brand_story',
    mainQuestion: "Tell me about your brand story. What motivated you to start this business, and what problem are you solving for your customers?",
    followUps: [
      "What makes your solution unique compared to alternatives?",
      "Where do you see your brand in 2-3 years?",
      "What's the core value you provide that customers can't get elsewhere?"
    ],
    extractionTargets: [
      'founding_motivation',
      'value_proposition',
      'vision',
      'differentiators',
      'problem_solving'
    ],
    timeLimit: 3, // minutes
    importance: 'critical'
  },
  {
    questionNumber: 2,
    category: 'channel_experience',
    mainQuestion: "What marketing channels have you tried before? What worked well, what didn't, and which channels are you most interested in focusing on now?",
    followUps: [
      "What was your best marketing campaign? Why do you think it worked?",
      "What's been your biggest marketing challenge or disappointment?",
      "How comfortable are you with digital marketing tools and analytics?"
    ],
    extractionTargets: [
      'channel_history',
      'successful_campaigns',
      'failed_attempts',
      'channel_preferences',
      'marketing_maturity',
      'technical_comfort'
    ],
    timeLimit: 3, // minutes
    importance: 'critical'
  },
  {
    questionNumber: 3,
    category: 'revenue_positioning',
    mainQuestion: "What are your revenue targets for the next 90 days? And how do you position your brand compared to competitors?",
    followUps: [
      "What's your current monthly revenue run rate?",
      "Who are your main competitors, and how do you differentiate?",
      "What's your pricing strategy and how did you determine it?",
      "What's your average order value or customer lifetime value?"
    ],
    extractionTargets: [
      'revenue_targets',
      'current_revenue',
      'competitive_positioning',
      'pricing_strategy',
      'customer_metrics',
      'growth_expectations'
    ],
    timeLimit: 3, // minutes
    importance: 'critical'
  },
  {
    questionNumber: 4,
    category: 'constraints_motivations',
    mainQuestion: "What does success look like for you personally? And what are your biggest concerns or constraints right now?",
    followUps: [
      "How much time can you realistically dedicate to marketing each week?",
      "What's your monthly marketing budget comfort zone?",
      "Are you working solo or do you have a team helping you?",
      "What would need to happen for you to feel this business is truly successful?"
    ],
    extractionTargets: [
      'personal_success_definition',
      'time_constraints',
      'budget_constraints',
      'team_resources',
      'primary_concerns',
      'success_metrics',
      'emotional_drivers'
    ],
    timeLimit: 3, // minutes
    importance: 'critical'
  }
];

/**
 * Interview flow configuration
 */
const INTERVIEW_CONFIG = {
  totalQuestions: 4,
  estimatedDuration: 12, // minutes
  questionTimeLimit: 3, // minutes per question
  followUpTriggers: {
    // Conditions that trigger specific follow-up questions
    short_response: 20, // words - ask follow-up if response is too brief
    generic_response: ['good', 'fine', 'okay'], // trigger deeper probing
    incomplete_answer: ['unsure', 'don\'t know', 'not sure'] // offer guidance
  },
  progressIndicators: {
    show_progress: true,
    show_time_remaining: true,
    show_question_count: true
  }
};

/**
 * Welcome and closing messages
 */
const INTERVIEW_SCRIPT = {
  welcome: {
    greeting: "Hi! I'm your NexSpark AI Strategist. I'm here to learn about your business and help create a personalized growth strategy.",
    explanation: "I'll ask you 4 strategic questions that should take about 10-12 minutes total. These questions help me understand your brand story, marketing experience, revenue goals, and current constraints.",
    instruction: "Please answer thoughtfully - the more context you provide, the better I can tailor your strategy. Ready to begin?"
  },

  transitions: {
    between_questions: [
      "Great insights! Let's move to the next area.",
      "Thanks for that context. Now I'd like to understand...",
      "That's really helpful. Let's explore another important aspect..."
    ],
    follow_up_needed: [
      "Could you tell me a bit more about that?",
      "That's interesting - can you expand on that?",
      "I'd love to hear more details about..."
    ]
  },

  closing: {
    summary_intro: "Thank you for those detailed answers! Let me summarize what I've learned:",
    next_steps: "Based on this conversation, I'll now analyze your responses and combine them with your market research to create your personalized GTM strategy report.",
    timeline: "Your complete strategy report will be ready in just a few minutes."
  }
};

/**
 * Analysis extraction prompts for Claude
 */
const ANALYSIS_PROMPTS = {
  brand_positioning: {
    prompt: "Extract brand positioning insights from the interview responses",
    fields: ['value_proposition', 'differentiators', 'brand_personality', 'positioning_clarity']
  },

  resource_constraints: {
    prompt: "Identify resource constraints and capabilities",
    fields: ['time_availability', 'budget_range', 'team_size', 'technical_capability', 'marketing_experience']
  },

  growth_priorities: {
    prompt: "Determine growth priorities and urgency levels",
    fields: ['primary_goals', 'timeline_pressure', 'revenue_urgency', 'channel_priorities']
  },

  personal_motivations: {
    prompt: "Understand personal motivations and success definitions",
    fields: ['primary_motivation', 'success_definition', 'emotional_drivers', 'fear_factors']
  }
};

/**
 * Validation rules for responses
 */
const RESPONSE_VALIDATION = {
  min_word_count: 10,
  max_word_count: 500,
  required_elements: {
    question_1: ['motivation', 'problem', 'solution'],
    question_2: ['channels', 'experience'],
    question_3: ['revenue', 'competition'],
    question_4: ['success', 'constraints']
  },
  quality_indicators: {
    specific_examples: 2, // bonus points for concrete examples
    numbers_mentioned: 1, // bonus for quantitative responses
    emotional_language: 1 // bonus for authentic personal responses
  }
};

/**
 * Helper functions
 */
const InterviewQuestionHelpers = {
  /**
   * Get question by number
   */
  getQuestion: (questionNumber) => {
    return INTERVIEW_QUESTIONS.find(q => q.questionNumber === questionNumber);
  },

  /**
   * Get all questions in order
   */
  getAllQuestions: () => {
    return [...INTERVIEW_QUESTIONS];
  },

  /**
   * Get next question number
   */
  getNextQuestion: (currentQuestion) => {
    const nextNum = currentQuestion + 1;
    return nextNum <= INTERVIEW_CONFIG.totalQuestions ? nextNum : null;
  },

  /**
   * Check if interview is complete
   */
  isComplete: (currentQuestion) => {
    return currentQuestion > INTERVIEW_CONFIG.totalQuestions;
  },

  /**
   * Get follow-up questions for a category
   */
  getFollowUps: (questionNumber) => {
    const question = InterviewQuestionHelpers.getQuestion(questionNumber);
    return question ? question.followUps : [];
  },

  /**
   * Validate response completeness
   */
  validateResponse: (questionNumber, responseText) => {
    const words = responseText.trim().split(/\s+/).length;
    const validation = RESPONSE_VALIDATION;

    const result = {
      isValid: words >= validation.min_word_count && words <= validation.max_word_count,
      wordCount: words,
      needsFollowUp: words < 20, // trigger follow-up for brief responses
      qualityScore: 0
    };

    // Calculate quality score
    if (words >= 30) result.qualityScore += 1;
    if (responseText.match(/\d+/)) result.qualityScore += 1; // contains numbers
    if (responseText.length > responseText.toLowerCase().length) result.qualityScore += 1; // proper capitalization

    return result;
  },

  /**
   * Get script message by type
   */
  getScript: (type, subtype = null) => {
    if (subtype) {
      const messages = INTERVIEW_SCRIPT[type][subtype];
      return Array.isArray(messages) ? messages[Math.floor(Math.random() * messages.length)] : messages;
    }
    return INTERVIEW_SCRIPT[type];
  }
};

module.exports = {
  INTERVIEW_QUESTIONS,
  INTERVIEW_CONFIG,
  INTERVIEW_SCRIPT,
  ANALYSIS_PROMPTS,
  RESPONSE_VALIDATION,
  InterviewQuestionHelpers
};