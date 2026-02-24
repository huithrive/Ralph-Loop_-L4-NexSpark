/**
 * Interview questions configuration
 */

const INTERVIEW_QUESTIONS = [
  {
    questionNumber: 1,
    questionText: 'Tell us about your brand identity and positioning. What makes your business unique, and how do you want customers to perceive you?',
    followUpPrompts: [
      'What is your brand\'s core value proposition?',
      'How would you describe your brand personality in three words?',
      'Who are your brand heroes or inspirations?'
    ],
    validationRules: {
      minLength: 20,
      maxLength: 5000,
      required: true
    }
  },
  {
    questionNumber: 2,
    questionText: 'What marketing channels are you currently using, and how are they performing? Include paid ads, social media, email, SEO, or any other channels.',
    followUpPrompts: [
      'Which channel drives the most revenue?',
      'What\'s your current monthly marketing spend?',
      'Are there channels you\'ve tried and abandoned?'
    ],
    validationRules: {
      minLength: 20,
      maxLength: 5000,
      required: true
    }
  },
  {
    questionNumber: 3,
    questionText: 'What are your revenue goals and key metrics? Share your current revenue, target revenue, and the KPIs you track most closely.',
    followUpPrompts: [
      'What\'s your target timeline for reaching this goal?',
      'What\'s your current customer acquisition cost?',
      'What\'s your customer lifetime value?'
    ],
    validationRules: {
      minLength: 20,
      maxLength: 5000,
      required: true
    }
  },
  {
    questionNumber: 4,
    questionText: 'What are your core motivations and long-term vision for this business? What impact do you want to make, and where do you see the business in 2-3 years?',
    followUpPrompts: [
      'What would success look like for you personally?',
      'Are there any constraints or non-negotiables?',
      'What\'s the biggest risk you\'re willing to take?'
    ],
    validationRules: {
      minLength: 20,
      maxLength: 5000,
      required: true
    }
  }
];

const TOTAL_QUESTIONS = INTERVIEW_QUESTIONS.length;

function getQuestion(questionNumber) {
  return INTERVIEW_QUESTIONS.find(q => q.questionNumber === questionNumber) || null;
}

module.exports = {
  INTERVIEW_QUESTIONS,
  TOTAL_QUESTIONS,
  getQuestion
};
