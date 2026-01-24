/**
 * Shared constants for frontend
 */

const CONSTANTS = {
  // Default interview questions (6 questions)
  INTERVIEW_QUESTIONS: [
    "When and why did you start this brand? What problem were you trying to solve?",
    "How do you define your product? What core problem does it solve for customers?",
    "What marketing channels are you currently using? Why did you choose these channels, and how are they performing?",
    "What's your biggest challenge right now? What are your main goals and challenges for the next 3-6 months?",
    "Who do you consider your ideal customer? Can you describe them?",
    "Who are your main competitors? What sets you apart from them?"
  ],

  // Example answers for each question
  EXAMPLE_ANSWERS: [
    "Example: 'I started this brand in 2022 because I couldn't find affordable, sustainable packaging for my homemade products. I wanted to help other small businesses like mine.'",
    "Example: 'We make eco-friendly food storage containers that keep food fresh 3x longer than regular containers. We solve the problem of food waste and plastic pollution.'",
    "Example: 'We're using Instagram and Facebook ads. I chose social media because that's where my target audience is. Instagram is working well, but Facebook ads aren't converting yet.'",
    "Example: 'Our biggest challenge is customer acquisition cost. In 3-6 months, we want to reach $10K MRR and improve our conversion rate from 2% to 5%.'",
    "Example: 'Our ideal customer is a health-conscious mom, aged 30-45, who shops online and cares about sustainability. She's willing to pay more for quality.'",
    "Example: 'Our main competitors are GreenPack and EcoStore. We're different because we use 100% recycled materials and our products are more affordable.'"
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
