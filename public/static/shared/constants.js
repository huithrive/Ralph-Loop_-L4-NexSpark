/**
 * Shared constants for frontend
 */

const CONSTANTS = {
  // Default interview questions
  INTERVIEW_QUESTIONS: [
    "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your brand name or the name of the product you're trying to grow?",
    "Perfect! How would you describe your product in your own words? What does it do and who is it for?",
    "When did you start this brand and what motivated you to create it? What problem were you trying to solve?",
    "What's your current monthly revenue?",
    "Which marketing channels are you currently using? For each channel, tell me roughly how much you're spending per month and what results you're seeing.",
    "What's your best performing channel and what specific metrics can you share? For example, conversion rates, ROI, or customer acquisition cost.",
    "What's the biggest challenge you're facing with growth right now?",
    "Who is your ideal customer? Describe them in detail - demographics, behaviors, pain points, and where they spend their time.",
    "Who are your top 3 competitors and what makes your brand different from them? What's your unique value proposition?",
    "What's your main goal for the next 6 months? Be specific about revenue, customer growth, or market expansion targets.",
  ],

  // Color scheme
  COLORS: {
    gold: '#FF9C00',
    blue: '#99CCFF',
    purple: '#CC99CC',
    red: '#CC3333',
    dark: '#111111',
    bg: '#000000',
  },

  // Pricing
  PRICING: {
    reportAmount: 2000, // $20.00 in cents
    currency: 'USD',
  },

  // Timeouts
  TIMEOUTS: {
    autoSave: 30000, // 30 seconds
    progressCheckAge: 86400000, // 24 hours
  },

  // Report generation states
  GENERATION_STATES: {
    NOT_STARTED: 'NOT_STARTED',
    ANALYZING: 'ANALYZING',
    PROFILE_REVIEW: 'PROFILE_REVIEW',
    RESEARCHING: 'RESEARCHING',
    PREVIEW_READY: 'PREVIEW_READY',
    PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
    GENERATING_STRATEGY: 'GENERATING_STRATEGY',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
  },
};
