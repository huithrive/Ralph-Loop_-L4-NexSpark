// Conversational Interview - Multilingual, Empathetic AI Interviewer
// Implements real-time voice transcription, TTS, and dynamic summary generation

// Global State
const state = {
  language: null, // 'en' or 'zh'
  isRecording: false,
  isSpeaking: false,
  currentQuestionIndex: 0,
  totalQuestions: 10,
  conversationHistory: [],
  currentTranscript: '',
  recognition: null,
  synthesis: window.speechSynthesis,
  mediaRecorder: null,
  audioChunks: [],
  realtimeSummary: null,
  userId: null,
  interviewId: null
};

// Translation Dictionary
const translations = {
  en: {
    ready: 'Ready to start',
    listening: 'Listening...',
    speaking: 'Speaking...',
    processing: 'Processing...',
    keyPoints: 'Key Points',
    industry: 'Industry',
    stage: 'Stage',
    challenges: 'Challenges Identified',
    opportunities: 'Growth Opportunities',
    nextFocus: 'Next Focus Area',
    editTitle: 'Edit Your Answer',
    save: 'Save Answer',
    cancel: 'Cancel',
    timeRemaining: 'min remaining',
    questionOf: 'Question',
    of: 'of',
    industryLabel: 'Industry',
    stageLabel: 'Stage',
    summaryTitle: 'Real-time Insights',
    summarySubtitle: 'Your answers are being analyzed in real-time'
  },
  zh: {
    ready: '准备开始',
    listening: '正在聆听...',
    speaking: '正在讲话...',
    processing: '处理中...',
    keyPoints: '关键要点',
    industry: '行业',
    stage: '阶段',
    challenges: '识别的挑战',
    opportunities: '增长机会',
    nextFocus: '下一个关注领域',
    editTitle: '编辑您的回答',
    save: '保存回答',
    cancel: '取消',
    timeRemaining: '分钟剩余',
    questionOf: '问题',
    of: '共',
    industryLabel: '行业',
    stageLabel: '阶段',
    summaryTitle: '实时洞察',
    summarySubtitle: '您的回答正在实时分析中'
  }
};

// Get translated text
function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || key;
}

// Language Selection
function selectLanguage(lang) {
  state.language = lang;
  document.getElementById('languageSelection').style.display = 'none';
  document.getElementById('interviewInterface').style.display = 'block';
  
  // Update UI text based on language
  updateUILanguage();
  
  // Initialize interview
  initializeInterview();
}

// Update UI text based on selected language
function updateUILanguage() {
  document.getElementById('statusText').textContent = t('ready');
  document.getElementById('summaryTitle').textContent = t('summaryTitle');
  document.getElementById('summarySubtitle').textContent = t('summarySubtitle');
  document.getElementById('keyPointsTitle').textContent = t('keyPoints');
  document.getElementById('industryTitle').textContent = t('industry');
  document.getElementById('challengesTitle').textContent = t('challenges');
  document.getElementById('opportunitiesTitle').textContent = t('opportunitiesTitle');
  document.getElementById('nextFocusTitle').textContent = t('nextFocus');
  document.getElementById('editModalTitle').textContent = t('editTitle');
  document.getElementById('saveButtonText').textContent = t('save');
  document.getElementById('cancelButtonText').textContent = t('cancel');
  document.getElementById('industryLabel').textContent = t('industryLabel');
  document.getElementById('stageLabel').textContent = t('stageLabel');
}

// Initialize Interview
async function initializeInterview() {
  // Generate user ID if not exists
  state.userId = localStorage.getItem('nexspark_user_id') || generateUserId();
  localStorage.setItem('nexspark_user_id', state.userId);
  
  // Generate interview ID
  state.interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize Speech Recognition
  initializeSpeechRecognition();
  
  // Load first question
  await askQuestion(0);
  
  // Setup event listeners
  setupEventListeners();
}

// Initialize Speech Recognition
function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SpeechRecognition();
  
  // Configure recognition
  state.recognition.continuous = true;
  state.recognition.interimResults = true;
  state.recognition.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';
  
  // Event handlers
  state.recognition.onstart = () => {
    console.log('Speech recognition started');
    updateStatus('listening');
  };
  
  state.recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update transcript display
    if (finalTranscript) {
      state.currentTranscript += finalTranscript;
    }
    
    const displayText = state.currentTranscript + (interimTranscript ? `<span class="text-gray-400">${interimTranscript}</span>` : '');
    document.getElementById('transcriptDisplay').innerHTML = displayText || '<div class="text-gray-400 italic">Speak your answer...</div>';
  };
  
  state.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // Restart recognition
      setTimeout(() => {
        if (state.isRecording) {
          state.recognition.start();
        }
      }, 1000);
    }
  };
  
  state.recognition.onend = () => {
    console.log('Speech recognition ended');
    if (state.isRecording) {
      // Auto-restart if still recording
      setTimeout(() => {
        if (state.isRecording) {
          state.recognition.start();
        }
      }, 500);
    }
  };
}

// Ask Question
async function askQuestion(index) {
  if (index >= state.totalQuestions) {
    await completeInterview();
    return;
  }
  
  state.currentQuestionIndex = index;
  updateProgress();
  
  try {
    let questionText;
    
    if (index === 0) {
      // Use initial question from predefined list
      const initialQuestions = {
        en: [
          "Hi! I'm your AI growth strategist. Let's start with the basics - what's your brand or product name?",
          "Perfect! How would you describe your product in your own words? What does it do and who is it for?",
          "When did you start this brand and what motivated you to create it?",
          "What's your current monthly revenue?",
          "Which marketing channels are you currently using? For each channel, what's your monthly spend and results?",
          "What's your best performing channel? Can you share specific metrics like conversion rate or ROI?",
          "What's the biggest growth challenge you're facing right now?",
          "Who is your ideal customer? Describe them in detail - demographics, pain points, behaviors.",
          "Who are your top 3 competitors and what makes your brand different from them?",
          "What's your main goal for the next 6 months? Be specific about revenue, customer growth, or market targets."
        ],
        zh: [
          "你好！我是你的AI增长战略顾问。首先，能告诉我你的品牌或产品的名字吗？",
          "很好！用你自己的话描述一下，这个产品是做什么的？是为谁服务的？",
          "你是什么时候开始做这个品牌的？当初是什么动力驱使你创建它的？",
          "目前的月收入大概是多少？",
          "你目前在用哪些营销渠道？每个渠道大概的月预算和效果如何？",
          "哪个渠道表现最好？能分享一些具体的数据吗？比如转化率、ROI等。",
          "目前增长遇到的最大挑战是什么？",
          "你的理想客户是谁？详细描述一下他们的特征、痛点、行为习惯等。",
          "你的前3个竞争对手是谁？你的品牌与他们相比有什么独特之处？",
          "未来6个月的主要目标是什么？在收入、客户增长或市场扩张方面有具体指标吗？"
        ]
      };
      questionText = initialQuestions[state.language][index];
    } else {
      // Generate dynamic question based on context
      questionText = await generateNextQuestion();
    }
    
    // Display question
    document.getElementById('questionDisplay').textContent = questionText;
    
    // Save question to history
    state.conversationHistory.push({
      role: 'interviewer',
      content: questionText,
      language: state.language,
      timestamp: new Date().toISOString(),
      type: 'question'
    });
    
    // Speak question
    await speakText(questionText);
    
  } catch (error) {
    console.error('Error asking question:', error);
  }
}

// Generate Next Question (AI-powered)
async function generateNextQuestion() {
  try {
    const response = await fetch('/api/conversational-interview/next-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          language: state.language,
          previousMessages: state.conversationHistory.slice(-6), // Last 6 messages
          currentTopic: getTopicForQuestion(state.currentQuestionIndex),
          userProfile: extractUserProfile()
        }
      })
    });
    
    const data = await response.json();
    return data.question;
  } catch (error) {
    console.error('Error generating next question:', error);
    // Fallback to predefined questions
    const fallbacks = {
      en: "Can you tell me more about your target customers?",
      zh: "能详细说说您的目标客户是谁吗？"
    };
    return fallbacks[state.language];
  }
}

// Get Topic for Question Index
function getTopicForQuestion(index) {
  const topics = {
    0: 'brand_basics',
    1: 'product_description',
    2: 'brand_origin',
    3: 'revenue_metrics',
    4: 'marketing_channels',
    5: 'channel_performance',
    6: 'growth_challenges',
    7: 'customer_profile',
    8: 'competitive_landscape',
    9: 'goals_objectives'
  };
  return topics[index] || 'general';
}

// Extract User Profile from Conversation
function extractUserProfile() {
  const profile = {};
  
  // Extract brand name from first answer
  const firstAnswer = state.conversationHistory.find(m => m.role === 'user');
  if (firstAnswer) {
    profile.brandName = firstAnswer.content.split(' ')[0]; // Simplistic extraction
  }
  
  return profile;
}

// Speak Text (TTS)
async function speakText(text) {
  updateStatus('speaking');
  
  try {
    // Use OpenAI TTS for better quality
    const response = await fetch('/api/conversational-interview/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        language: state.language
      })
    });
    
    if (!response.ok) {
      throw new Error('TTS API failed');
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    state.isSpeaking = true;
    
    audio.onplay = () => {
      document.getElementById('breathingCircle').classList.add('speaking');
    };
    
    audio.onended = () => {
      state.isSpeaking = false;
      document.getElementById('breathingCircle').classList.remove('speaking');
      updateStatus('ready');
      URL.revokeObjectURL(audioUrl);
    };
    
    await audio.play();
    
  } catch (error) {
    console.error('TTS error:', error);
    // Fallback to browser TTS
    await fallbackSpeak(text);
  }
}

// Fallback to Browser TTS
function fallbackSpeak(text) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onstart = () => {
      state.isSpeaking = true;
      document.getElementById('breathingCircle').classList.add('speaking');
    };
    
    utterance.onend = () => {
      state.isSpeaking = false;
      document.getElementById('breathingCircle').classList.remove('speaking');
      updateStatus('ready');
      resolve();
    };
    
    state.synthesis.speak(utterance);
  });
}

// Start Recording
function startRecording() {
  if (state.isSpeaking) {
    alert(state.language === 'zh' ? '请等待我说完' : 'Please wait for me to finish speaking');
    return;
  }
  
  state.isRecording = true;
  state.currentTranscript = '';
  document.getElementById('transcriptDisplay').innerHTML = '<div class="text-gray-400 italic">Speak your answer...</div>';
  
  // Show stop button, hide record button
  document.getElementById('recordButton').style.display = 'none';
  document.getElementById('stopButton').style.display = 'flex';
  
  // Start speech recognition
  try {
    state.recognition.start();
    document.getElementById('breathingCircle').classList.add('listening');
  } catch (error) {
    console.error('Error starting recognition:', error);
  }
}

// Stop Recording
async function stopRecording() {
  state.isRecording = false;
  
  // Stop speech recognition
  if (state.recognition) {
    state.recognition.stop();
  }
  
  document.getElementById('breathingCircle').classList.remove('listening');
  
  // Show record button, hide stop button
  document.getElementById('recordButton').style.display = 'flex';
  document.getElementById('stopButton').style.display = 'none';
  
  // Process answer
  if (state.currentTranscript.trim()) {
    await processAnswer(state.currentTranscript.trim());
  }
}

// Process Answer
async function processAnswer(answerText) {
  updateStatus('processing');
  
  try {
    // Save answer to conversation history
    state.conversationHistory.push({
      role: 'user',
      content: answerText,
      language: state.language,
      timestamp: new Date().toISOString(),
      type: 'answer'
    });
    
    // Generate acknowledgment
    const acknowledgment = await generateAcknowledgment(answerText);
    
    // Speak acknowledgment
    await speakText(acknowledgment);
    
    // Save acknowledgment to history
    state.conversationHistory.push({
      role: 'interviewer',
      content: acknowledgment,
      language: state.language,
      timestamp: new Date().toISOString(),
      type: 'acknowledgment'
    });
    
    // Update real-time summary
    await updateRealtimeSummary();
    
    // Show next button
    document.getElementById('nextButton').style.display = 'flex';
    
  } catch (error) {
    console.error('Error processing answer:', error);
    updateStatus('ready');
  }
}

// Generate Acknowledgment
async function generateAcknowledgment(answerText) {
  try {
    const response = await fetch('/api/conversational-interview/acknowledgment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAnswer: answerText,
        context: {
          language: state.language,
          previousMessages: state.conversationHistory.slice(-4),
          currentTopic: getTopicForQuestion(state.currentQuestionIndex),
          userProfile: extractUserProfile()
        }
      })
    });
    
    const data = await response.json();
    return data.acknowledgment;
  } catch (error) {
    console.error('Error generating acknowledgment:', error);
    // Fallback acknowledgments
    const fallbacks = {
      en: ['Got it', 'I see', 'Great', 'Understood', 'Makes sense'],
      zh: ['好的', '明白了', '我理解', '很好', '继续']
    };
    const options = fallbacks[state.language];
    return options[Math.floor(Math.random() * options.length)];
  }
}

// Update Real-time Summary
async function updateRealtimeSummary() {
  try {
    const response = await fetch('/api/conversational-interview/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          language: state.language,
          previousMessages: state.conversationHistory,
          currentTopic: getTopicForQuestion(state.currentQuestionIndex),
          userProfile: extractUserProfile()
        }
      })
    });
    
    const summary = await response.json();
    state.realtimeSummary = summary;
    
    // Update UI
    updateSummaryUI(summary);
    
  } catch (error) {
    console.error('Error updating summary:', error);
  }
}

// Update Summary UI
function updateSummaryUI(summary) {
  // Update key points
  const keyPointsList = document.getElementById('keyPointsList');
  if (summary.keyPoints && summary.keyPoints.length > 0) {
    keyPointsList.innerHTML = summary.keyPoints.map(point => `<li>${point}</li>`).join('');
  }
  
  // Update industry
  if (summary.industry) {
    document.getElementById('industryValue').textContent = summary.industry;
  }
  
  // Update stage (extract from key points or set default)
  if (summary.stage) {
    document.getElementById('stageValue').textContent = summary.stage;
  }
  
  // Update challenges
  const challengesList = document.getElementById('challengesList');
  if (summary.challenges && summary.challenges.length > 0) {
    challengesList.innerHTML = summary.challenges.map(challenge => `<li>${challenge}</li>`).join('');
  }
  
  // Update opportunities
  const opportunitiesList = document.getElementById('opportunitiesList');
  if (summary.opportunities && summary.opportunities.length > 0) {
    opportunitiesList.innerHTML = summary.opportunities.map(opp => `<li>${opp}</li>`).join('');
  }
  
  // Update next focus
  if (summary.nextFocus) {
    document.getElementById('nextFocusText').textContent = summary.nextFocus;
  }
}

// Next Question
async function nextQuestion() {
  // Hide next button
  document.getElementById('nextButton').style.display = 'none';
  
  // Clear transcript
  state.currentTranscript = '';
  document.getElementById('transcriptDisplay').innerHTML = '<div class="text-gray-400 italic">Your answer will appear here...</div>';
  
  // Ask next question
  await askQuestion(state.currentQuestionIndex + 1);
}

// Update Status
function updateStatus(status) {
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  
  statusBadge.className = `status-badge ${status}`;
  statusText.textContent = t(status);
}

// Update Progress
function updateProgress() {
  const progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `${t('questionOf')} ${state.currentQuestionIndex + 1} ${t('of')} ${state.totalQuestions}`;
  
  const remainingQuestions = state.totalQuestions - state.currentQuestionIndex;
  const estimatedMinutes = Math.ceil(remainingQuestions * 0.5);
  document.getElementById('timeEstimate').textContent = `~${estimatedMinutes} ${t('timeRemaining')}`;
}

// Edit Answer
function openEditModal() {
  const modal = document.getElementById('editModal');
  const currentQuestion = state.conversationHistory
    .filter(m => m.role === 'interviewer' && m.type === 'question')
    .pop();
  
  if (currentQuestion) {
    document.getElementById('editModalQuestion').textContent = currentQuestion.content;
  }
  
  document.getElementById('editTextarea').value = state.currentTranscript || '';
  modal.classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

function saveEdit() {
  const editedText = document.getElementById('editTextarea').value.trim();
  if (editedText) {
    state.currentTranscript = editedText;
    document.getElementById('transcriptDisplay').textContent = editedText;
    processAnswer(editedText);
  }
  closeEditModal();
}

// Complete Interview
async function completeInterview() {
  try {
    // Save interview data
    const response = await fetch('/api/interview/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.userId,
        interviewId: state.interviewId,
        language: state.language,
        conversationHistory: state.conversationHistory,
        summary: state.realtimeSummary
      })
    });
    
    if (response.ok) {
      window.location.href = '/interview-summary';
    }
  } catch (error) {
    console.error('Error completing interview:', error);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('recordButton').addEventListener('click', startRecording);
  document.getElementById('stopButton').addEventListener('click', stopRecording);
  document.getElementById('editButton').addEventListener('click', openEditModal);
  document.getElementById('nextButton').addEventListener('click', nextQuestion);
}

// Generate User ID
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Auto-save progress
setInterval(() => {
  if (state.conversationHistory.length > 0) {
    localStorage.setItem('conversational_interview_progress', JSON.stringify({
      userId: state.userId,
      interviewId: state.interviewId,
      language: state.language,
      currentQuestionIndex: state.currentQuestionIndex,
      conversationHistory: state.conversationHistory,
      timestamp: new Date().toISOString()
    }));
  }
}, 30000); // Save every 30 seconds

console.log('Conversational Interview initialized');
