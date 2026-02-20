// Conversational Interview - V2: Natural, Continuous Listening
// Auto-starts listening, shows "Finish" button, faster responses

// Global State
const state = {
  language: null,
  isListening: false,
  isSpeaking: false,
  currentQuestionIndex: 0,
  totalQuestions: 8, // Expanded to 8 questions
  conversationHistory: [],
  currentTranscript: '',
  recognition: null,
  synthesis: window.speechSynthesis,
  realtimeSummary: null,
  userId: null,
  interviewId: null,
  hasAnsweredTwoQuestions: false,
  websiteUrl: null, // Store website URL for research
  brandName: null // Store brand name
};

// Translation Dictionary
const translations = {
  en: {
    ready: 'Listening...',
    listening: 'Listening to your answer...',
    speaking: 'Speaking...',
    processing: 'Processing...',
    finish: 'Finish',
    edit: 'Edit',
    keyPoints: 'Key Points',
    businessProfile: 'Business Profile',
    challenges: 'Challenges',
    opportunities: 'Opportunities',
    nextFocus: 'Next Focus',
    questionOf: 'Question',
    of: 'of',
    timeRemaining: 'min remaining',
    summaryTitle: 'Real-time Insights',
    summarySubtitle: 'Building your growth strategy...',
    introPurposeTitle: 'Why We\'re Interviewing You',
    introGuidelinesTitle: 'Guidelines',
    introQuestionCount: 'This will take about 5-7 minutes with 8 short questions.',
    introStartButton: 'Start Interview'
  },
  zh: {
    ready: '正在聆听...',
    listening: '正在聆听您的回答...',
    speaking: '正在讲话...',
    processing: '处理中...',
    finish: '完成',
    edit: '编辑',
    keyPoints: '关键要点',
    businessProfile: '业务概况',
    challenges: '挑战',
    opportunities: '机会',
    nextFocus: '下一步',
    questionOf: '问题',
    of: '共',
    timeRemaining: '分钟剩余',
    summaryTitle: '实时洞察',
    summarySubtitle: '正在构建您的增长策略...',
    introPurposeTitle: '为什么要访谈您',
    introGuidelinesTitle: '指南',
    introQuestionCount: '大约需要5-7分钟，共8个简短问题。',
    introStartButton: '开始访谈'
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
  
  // Show interview introduction
  loadIntroduction();
  document.getElementById('interviewIntro').style.display = 'block';
}

// Load Introduction
async function loadIntroduction() {
  try {
    const response = await fetch(`/api/conversational-interview/introduction/${state.language}`);
    const intro = await response.json();
    
    document.getElementById('introTitle').textContent = intro.title;
    document.getElementById('introPurposeTitle').textContent = t('introPurposeTitle');
    document.getElementById('introGuidelinesTitle').textContent = t('introGuidelinesTitle');
    document.getElementById('introQuestionCount').textContent = t('introQuestionCount');
    document.getElementById('introStartButton').textContent = t('introStartButton');
    
    // Populate purpose list
    const purposeList = document.getElementById('introPurposeList');
    purposeList.innerHTML = intro.purpose.map(p => 
      `<li class="flex items-start"><i class="fas fa-check-circle text-purple-600 mr-3 mt-1"></i><span>${p}</span></li>`
    ).join('');
    
    // Populate guidelines list
    const guidelinesList = document.getElementById('introGuidelinesList');
    guidelinesList.innerHTML = intro.guidelines.map(g => 
      `<li class="flex items-start"><i class="fas fa-lightbulb text-blue-600 mr-3 mt-1"></i><span>${g}</span></li>`
    ).join('');
    
  } catch (error) {
    console.error('Error loading introduction:', error);
    // Use fallback
    document.getElementById('introTitle').textContent = state.language === 'zh' ? '让我们开始吧' : 'Let\'s Get Started';
  }
}

// Start Interview
function startInterview() {
  document.getElementById('interviewIntro').style.display = 'none';
  document.getElementById('interviewInterface').style.display = 'block';
  
  // Update UI language
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
  document.getElementById('industryTitle').textContent = t('businessProfile');
  document.getElementById('challengesTitle').textContent = t('challenges');
  document.getElementById('opportunitiesTitle').textContent = t('opportunities');
  document.getElementById('nextFocusTitle').textContent = t('nextFocus');
  document.getElementById('finishButtonText').textContent = t('finish');
}

// Initialize Interview
async function initializeInterview() {
  // Generate user ID
  state.userId = localStorage.getItem('auxora_user_id') || generateUserId();
  localStorage.setItem('auxora_user_id', state.userId);
  
  // Generate interview ID
  state.interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize Speech Recognition
  initializeSpeechRecognition();
  
  // Load first question
  await askQuestion(0);
  
  // Setup event listeners
  setupEventListeners();
  
  // Auto-start listening after AI speaks
  setTimeout(() => {
    if (!state.isSpeaking) {
      startListening();
    }
  }, 1000);
}

// Initialize Speech Recognition
function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert(state.language === 'zh' ? 
      '您的浏览器不支持语音识别。请使用Chrome浏览器。' : 
      'Your browser doesn\'t support speech recognition. Please use Chrome.');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SpeechRecognition();
  
  state.recognition.continuous = true;
  state.recognition.interimResults = true;
  state.recognition.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';
  
  state.recognition.onstart = () => {
    console.log('Speech recognition started');
    state.isListening = true;
    updateStatus('listening');
    document.getElementById('breathingCircle').classList.add('listening');
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
    
    if (finalTranscript) {
      state.currentTranscript += finalTranscript;
    }
    
    const displayText = state.currentTranscript + 
      (interimTranscript ? `<span class="text-gray-400">${interimTranscript}</span>` : '');
    document.getElementById('transcriptDisplay').innerHTML = displayText || 
      '<div class="text-gray-400 italic">' + (state.language === 'zh' ? '开始说话...' : 'Start speaking...') + '</div>';
  };
  
  state.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
      // Silently restart
      setTimeout(() => {
        if (state.isListening && !state.isSpeaking) {
          state.recognition.start();
        }
      }, 500);
    }
  };
  
  state.recognition.onend = () => {
    console.log('Speech recognition ended');
    if (state.isListening && !state.isSpeaking) {
      // Auto-restart
      setTimeout(() => {
        if (state.isListening && !state.isSpeaking) {
          state.recognition.start();
        }
      }, 300);
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
    // Fetch question and sample answer
    const response = await fetch(`/api/conversational-interview/question/${state.language}/${index}`);
    const data = await response.json();
    
    const questionText = data.question;
    const sampleAnswer = data.sample;
    
    // Display question
    document.getElementById('questionText').textContent = questionText;
    
    // Show sample answer
    const sampleEl = document.getElementById('sampleAnswer');
    sampleEl.textContent = sampleAnswer;
    sampleEl.style.display = 'block';
    
    // Save question to history
    state.conversationHistory.push({
      role: 'interviewer',
      content: questionText,
      language: state.language,
      timestamp: new Date().toISOString(),
      type: 'question'
    });
    
    // Speak question (faster, no wait)
    speakTextAsync(questionText);
    
  } catch (error) {
    console.error('Error asking question:', error);
  }
}

// Speak Text Async (non-blocking, faster)
function speakTextAsync(text) {
  updateStatus('speaking');
  state.isSpeaking = true;
  document.getElementById('breathingCircle').classList.add('speaking');
  
  // Use browser TTS for speed
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 1.1; // Slightly faster
  
  utterance.onend = () => {
    state.isSpeaking = false;
    document.getElementById('breathingCircle').classList.remove('speaking');
    updateStatus('listening');
    
    // Auto-start listening
    if (!state.isListening) {
      startListening();
    }
  };
  
  state.synthesis.speak(utterance);
}

// Start Listening
function startListening() {
  if (state.isSpeaking) {
    return;
  }
  
  state.isListening = true;
  state.currentTranscript = '';
  
  document.getElementById('transcriptDisplay').innerHTML = 
    '<div class="text-gray-400 italic">' + 
    (state.language === 'zh' ? '开始说话...' : 'Start speaking...') + 
    '</div>';
  
  // Show finish button
  document.getElementById('finishAnswerButton').style.display = 'flex';
  
  try {
    state.recognition.start();
  } catch (error) {
    console.error('Error starting recognition:', error);
  }
}

// Finish Answer (user clicks "Finish" button)
async function finishAnswer() {
  state.isListening = false;
  
  if (state.recognition) {
    state.recognition.stop();
  }
  
  document.getElementById('breathingCircle').classList.remove('listening');
  document.getElementById('finishAnswerButton').style.display = 'none';
  
  if (state.currentTranscript.trim()) {
    await processAnswer(state.currentTranscript.trim());
  } else {
    // No answer, ask again or skip
    const shouldSkip = confirm(state.language === 'zh' ? 
      '您还没有回答。要跳过这个问题吗？' : 
      'You haven\'t answered yet. Skip this question?');
    if (shouldSkip) {
      await nextQuestion();
    } else {
      startListening();
    }
  }
}

// Process Answer (fast, minimal acknowledgment)
async function processAnswer(answerText) {
  updateStatus('processing');
  
  try {
    // Save answer
    state.conversationHistory.push({
      role: 'user',
      content: answerText,
      language: state.language,
      timestamp: new Date().toISOString(),
      type: 'answer',
      questionIndex: state.currentQuestionIndex
    });
    
    // Extract key information from answers
    if (state.currentQuestionIndex === 0) {
      // First question - extract brand name
      state.brandName = answerText;
    } else if (state.currentQuestionIndex === 1) {
      // Second question - extract website URL
      const urlMatch = answerText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      if (urlMatch) {
        state.websiteUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
    }
    
    // Quick acknowledgment (no API call, instant)
    const quickAcks = {
      en: ['Got it', 'Great', 'Thank you', 'I see', 'Perfect'],
      zh: ['好的', '很好', '谢谢', '明白了', '完美']
    };
    const ack = quickAcks[state.language][Math.floor(Math.random() * quickAcks[state.language].length)];
    
    // Speak acknowledgment (fast)
    await speakQuick(ack);
    
    // Update summary if 2+ questions answered
    if (state.currentQuestionIndex >= 2 && !state.hasAnsweredTwoQuestions) {
      state.hasAnsweredTwoQuestions = true;
      await updateRealtimeSummary();
    } else if (state.hasAnsweredTwoQuestions) {
      // Update summary for subsequent questions
      await updateRealtimeSummary();
    }
    
    // Show edit button briefly
    document.getElementById('editButton').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('editButton').style.display = 'none';
    }, 3000);
    
    // Move to next question
    setTimeout(() => nextQuestion(), 500);
    
  } catch (error) {
    console.error('Error processing answer:', error);
    updateStatus('listening');
  }
}

// Speak Quick (very short acknowledgment)
function speakQuick(text) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.language === 'zh' ? 'zh-CN' : 'en-US';
    utterance.rate = 1.2; // Fast
    utterance.volume = 0.8;
    
    utterance.onend = () => resolve();
    
    state.synthesis.speak(utterance);
  });
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
          userProfile: {
            brandName: state.brandName,
            websiteUrl: state.websiteUrl
          }
        }
      })
    });
    
    const summary = await response.json();
    state.realtimeSummary = summary;
    
    updateSummaryUI(summary);
    
  } catch (error) {
    console.error('Error updating summary:', error);
  }
}

// Update Summary UI
function updateSummaryUI(summary) {
  const keyPointsList = document.getElementById('keyPointsList');
  if (summary.keyPoints && summary.keyPoints.length > 0) {
    keyPointsList.innerHTML = summary.keyPoints.map(point => `<li>${point}</li>`).join('');
  }
  
  if (summary.industry) {
    document.getElementById('industryValue').textContent = summary.industry;
  }
  
  if (summary.stage) {
    document.getElementById('stageValue').textContent = summary.stage;
  } else {
    document.getElementById('stageValue').textContent = state.language === 'zh' ? '增长期' : 'Growth';
  }
  
  const challengesList = document.getElementById('challengesList');
  if (summary.challenges && summary.challenges.length > 0) {
    challengesList.innerHTML = summary.challenges.map(c => `<li>${c}</li>`).join('');
  }
  
  const opportunitiesList = document.getElementById('opportunitiesList');
  if (summary.opportunities && summary.opportunities.length > 0) {
    opportunitiesList.innerHTML = summary.opportunities.map(o => `<li>${o}</li>`).join('');
  }
  
  if (summary.nextFocus) {
    document.getElementById('nextFocusText').textContent = summary.nextFocus;
  }
}

// Next Question
async function nextQuestion() {
  state.currentTranscript = '';
  document.getElementById('transcriptDisplay').innerHTML = 
    '<div class="text-gray-400 italic">' + 
    (state.language === 'zh' ? '准备下一个问题...' : 'Preparing next question...') + 
    '</div>';
  
  await askQuestion(state.currentQuestionIndex + 1);
}

// Get Topic for Question
function getTopicForQuestion(index) {
  const topics = ['brand', 'website', 'revenue', 'channels', 'best_channel', 'challenges', 'customer', 'goals'];
  return topics[index] || 'general';
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
  document.getElementById('progressText').textContent = 
    `${t('questionOf')} ${state.currentQuestionIndex + 1} ${t('of')} ${state.totalQuestions}`;
  
  const remainingQuestions = state.totalQuestions - state.currentQuestionIndex;
  const estimatedMinutes = Math.ceil(remainingQuestions * 0.6);
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
  document.getElementById('finishAnswerButton').addEventListener('click', finishAnswer);
  document.getElementById('editButton').addEventListener('click', openEditModal);
}

// Generate User ID
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

console.log('Conversational Interview V2 initialized');
