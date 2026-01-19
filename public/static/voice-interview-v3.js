// NexSpark Voice Interview - Real-Time Transcription + Simplified UI v3
// Implements Web Speech API for real-time transcription and simplified controls

// Animated Starfield Background
(() => {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = Array.from({ length: 800 }, () => ({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * 1000,
    color: ['#FF9C00', '#99CCFF', '#CC99CC', '#FFFFFF'][Math.floor(Math.random() * 4)]
  }));

  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    stars.forEach(star => {
      star.z -= 2;
      if (star.z <= 0) {
        star.z = 1000;
        star.x = Math.random() * canvas.width - centerX;
        star.y = Math.random() * canvas.height - centerY;
      }

      const scale = 1000 / star.z;
      const x = centerX + star.x * scale;
      const y = centerY + star.y * scale;
      const size = Math.max(0, (1 - star.z / 1000) * 3);

      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = star.color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX + star.x * (1000 / (star.z + 2)), centerY + star.y * (1000 / (star.z + 2)));
      ctx.stroke();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();

// Interview State Management
const interviewState = {
  isActive: false,
  isRecording: false,
  isProcessing: false,
  currentQuestion: 0,
  totalQuestions: 10,
  responses: [],
  mediaRecorder: null,
  audioChunks: [],
  recognition: null, // Web Speech API
  currentTranscript: '',
  interimTranscript: '',
  finalTranscript: '',
  userId: null,
  interviewId: null,
  lastAutoSave: null
};

// AUTO-SAVE: Save progress to localStorage
function autoSaveProgress() {
  const saveData = {
    currentQuestion: interviewState.currentQuestion,
    responses: interviewState.responses,
    lastSaved: new Date().toISOString(),
    userId: interviewState.userId
  };
  localStorage.setItem('nexspark_interview_progress', JSON.stringify(saveData));
  
  // Show auto-save indicator
  const indicator = document.getElementById('autoSaveIndicator');
  if (indicator) {
    indicator.innerHTML = '<span class="text-green-400 font-mono text-xs"><i class="fas fa-check-circle mr-1"></i>Progress auto-saved at ' + new Date().toLocaleTimeString() + '</span>';
  }
  
  interviewState.lastAutoSave = Date.now();
  console.log('✅ Auto-saved progress:', saveData);
}

// AUTO-SAVE: Load saved progress
async function loadSavedProgress() {
  const saved = localStorage.getItem('nexspark_interview_progress');
  if (!saved) return false;
  
  try {
    const saveData = JSON.parse(saved);
    
    // Check if save is recent (within 24 hours)
    const saveAge = Date.now() - new Date(saveData.lastSaved).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (saveAge > maxAge) {
      console.log('Saved progress too old, ignoring');
      localStorage.removeItem('nexspark_interview_progress');
      return false;
    }
    
    // Check if user matches
    if (saveData.userId !== interviewState.userId) {
      console.log('Saved progress for different user, ignoring');
      return false;
    }
    
    // Ask user if they want to continue
    const lastSavedTime = new Date(saveData.lastSaved).toLocaleString();
    const shouldContinue = await showConfirm(
      `We found your saved progress from ${lastSavedTime}.\n\nYou were on Question ${saveData.currentQuestion + 1} of ${interviewState.totalQuestions}.`,
      {
        title: 'Resume Interview?',
        confirmText: 'CONTINUE',
        cancelText: 'START OVER',
        icon: 'fa-play-circle',
        iconColor: 'nexspark-gold'
      }
    );

    if (shouldContinue) {
      // Restore progress
      interviewState.currentQuestion = saveData.currentQuestion;
      interviewState.responses = saveData.responses || [];
      
      // Update progress bar
      updateProgressDisplay();
      
      console.log('✅ Restored saved progress:', saveData);
      return true;
    } else {
      // Clear saved progress
      localStorage.removeItem('nexspark_interview_progress');
      return false;
    }
  } catch (e) {
    console.error('Error loading saved progress:', e);
    localStorage.removeItem('nexspark_interview_progress');
    return false;
  }
}

// Update progress display
function updateProgressDisplay() {
  const progress = ((interviewState.currentQuestion + 1) / interviewState.totalQuestions) * 100;
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const timeEstimate = document.getElementById('timeEstimate');
  
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  
  if (progressText) {
    progressText.textContent = `Question ${interviewState.currentQuestion + 1} of ${interviewState.totalQuestions}`;
  }
  
  if (timeEstimate) {
    const remainingQuestions = interviewState.totalQuestions - interviewState.currentQuestion;
    const estimatedMinutes = Math.ceil(remainingQuestions * 0.5); // 30 seconds per question
    timeEstimate.innerHTML = `<i class="fas fa-clock mr-1"></i>⏱ ~${estimatedMinutes} min remaining`;
  }
}

// Interview Questions - Updated for better brand & motivation focus
const interviewQuestions = [
  "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your brand name or the name of the product you're trying to grow?",
  "Perfect! How would you describe your product in your own words? What does it do and who is it for?",
  "When did you start this brand and what motivated you to create it? What problem were you trying to solve?",
  "What's your current monthly revenue?",
  "Which marketing channels are you currently using? For each channel, tell me roughly how much you're spending per month and what results you're seeing.",
  "What's your best performing channel and what specific metrics can you share? For example, conversion rates, ROI, or customer acquisition cost.",
  "What's the biggest challenge you're facing with growth right now?",
  "Who is your ideal customer? Describe them in detail - demographics, behaviors, pain points, and where they spend their time.",
  "Who are your top 3 competitors and what makes your brand different from them? What's your unique value proposition?",
  "What's your main goal for the next 6 months? Be specific about revenue, customer growth, or market expansion targets."
];

// Authentication Check
function checkAuth() {
  const user = localStorage.getItem('nexspark_user');
  if (!user) {
    console.log('No user found, redirecting to home');
    window.location.href = '/';
    return null;
  }
  
  try {
    const userData = JSON.parse(user);
    interviewState.userId = userData.id;
    return userData;
  } catch (e) {
    console.error('Invalid user data:', e);
    window.location.href = '/';
    return null;
  }
}

// Check for existing interview
async function checkExistingInterview() {
  try {
    const response = await fetch(`/api/interview/check?userId=${interviewState.userId}`);
    const data = await response.json();

    // Only prompt to resume if interview is incomplete
    if (data.exists && data.interview && !data.interview.completed) {
      const choice = await showConfirm(
        `You have a previous interview from ${new Date(data.interview.createdAt).toLocaleDateString()}.`,
        {
          title: 'Previous Interview Found',
          confirmText: 'START NEW',
          cancelText: 'CONTINUE OLD',
          icon: 'fa-history',
          iconColor: 'nexspark-blue'
        }
      );

      if (!choice) {
        // Continue previous interview
        loadPreviousInterview(data.interview);
      } else {
        // Start new interview (backend will archive old one)
        interviewState.interviewId = null;
      }
    } else {
      // No incomplete interview found, start fresh
      console.log('No incomplete interviews found - starting fresh');
    }
  } catch (error) {
    console.error('Error checking existing interview:', error);
  }
}

// Load previous interview
function loadPreviousInterview(interview) {
  interviewState.interviewId = interview.id;
  interviewState.responses = interview.responses || [];

  // Set current question based on responses length (not stored currentQuestion)
  // If 10 responses exist, interview is complete
  if (interviewState.responses.length >= interviewQuestions.length) {
    console.log('Interview already complete, redirecting to confirmation...');
    window.location.href = '/interview-confirmation';
    return false; // Signal to stop execution
  }

  interviewState.currentQuestion = interviewState.responses.length;

  // Populate transcript with previous responses
  interviewState.responses.forEach((response, index) => {
    addToTranscript('leon', interviewQuestions[index]);
    addToTranscript('user', response.answer);
  });

  console.log('Loaded previous interview:', interview, `Resuming from Q${interviewState.currentQuestion + 1}`);
  return true; // Signal to continue
}

// Initialize Web Speech API
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported, will use Whisper fallback');
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript + ' ';
      } else {
        interim += transcript;
      }
    }
    
    if (final) {
      interviewState.finalTranscript += final;
    }
    interviewState.interimTranscript = interim;
    
    // Update UI with real-time transcript
    updateRealTimeTranscript();
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
  
  recognition.onend = () => {
    console.log('Speech recognition ended');
  };
  
  return recognition;
}

// Update real-time transcript display
function updateRealTimeTranscript() {
  const currentTranscriptEl = document.getElementById('currentTranscript');
  const manualInputEl = document.getElementById('manualInput');
  
  const fullText = interviewState.finalTranscript + interviewState.interimTranscript;
  
  if (currentTranscriptEl) {
    currentTranscriptEl.innerHTML = `
      <span class="text-white">${escapeHtml(interviewState.finalTranscript)}</span>
      <span class="text-white/50">${escapeHtml(interviewState.interimTranscript)}</span>
    `;
  }
  
  if (manualInputEl) {
    manualInputEl.value = fullText.trim();
  }
  
  interviewState.currentTranscript = fullText.trim();
}

// HTML escape helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start Interview
async function startInterview() {
  console.log('startInterview() called');

  // Check authentication
  const user = checkAuth();
  if (!user) return;

  // Check if dashboard requested to continue specific interview
  const continueInterviewId = localStorage.getItem('nexspark_continue_interview');
  if (continueInterviewId) {
    console.log('Continuing interview:', continueInterviewId);
    localStorage.removeItem('nexspark_continue_interview');

    // Load specific interview from database
    try {
      const response = await fetch(`/api/interview/${continueInterviewId}`);
      const data = await response.json();

      if (data.success && data.interview) {
        const shouldContinue = loadPreviousInterview(data.interview);
        if (!shouldContinue) {
          // Interview complete, redirected
          return;
        }
      } else {
        console.error('Failed to load interview:', data.message);
      }
    } catch (error) {
      console.error('Error loading interview to continue:', error);
    }
  } else {
    // AUTO-SAVE: Try to load saved progress first
    const hasLoadedProgress = await loadSavedProgress();

    // Check for existing interview (skip if we loaded local progress)
    if (!hasLoadedProgress) {
      await checkExistingInterview();
    }
  }

  // Check if interview is already complete (10 responses)
  if (interviewState.responses.length >= interviewQuestions.length) {
    console.log('✅ Interview complete, redirecting to confirmation...');
    window.location.href = '/interview-confirmation';
    return; // Stop execution
  }

  console.log('User authenticated:', user);
  console.log('Setting interview state to active...');

  // Initialize speech recognition
  interviewState.recognition = initSpeechRecognition();

  // Set state
  interviewState.isActive = true;
  interviewState.currentQuestion = interviewState.currentQuestion || 0;
  
  // Update UI
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('endBtn').classList.remove('hidden');
  document.getElementById('questionBox').classList.remove('hidden');
  document.getElementById('transcriptContainer').classList.remove('hidden');
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('endBtn').disabled = false;
  
  // Show current input section
  document.getElementById('currentInputSection').classList.remove('hidden');
  
  // Show "Finished" button
  document.getElementById('finishedBtn').classList.remove('hidden');
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Ready to Listen
    </div>
    <div class="text-white/70 font-mono text-sm">
      Click microphone to start speaking
    </div>
  `;
  
  // Show question
  showQuestion(interviewState.currentQuestion);
  
  // Speak question and auto-start recording after it's spoken
  speakQuestion(interviewQuestions[interviewState.currentQuestion]);
  
  // Auto-start recording after 2 seconds (let question start speaking)
  setTimeout(() => {
    startRecording();
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Listening...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Speak naturally - click "Finished" when done
      </div>
    `;
  }, 2000);
  
  console.log('Interview started!');
}

// Show question
function showQuestion(index) {
  if (index >= interviewQuestions.length) {
    completeInterview();
    return;
  }
  
  const questionEl = document.getElementById('currentQuestion');
  questionEl.textContent = interviewQuestions[index];
  
  // Update progress with new function
  interviewState.currentQuestion = index;
  updateProgressDisplay();
  
  // Add to transcript
  addToTranscript('leon', interviewQuestions[index]);
  
  // Clear current input
  document.getElementById('currentTranscript').innerHTML = '';
  document.getElementById('manualInput').value = '';
  interviewState.finalTranscript = '';
  interviewState.interimTranscript = '';
  interviewState.currentTranscript = '';
  
  // Show website reminder for first question
  if (index === 0) {
    document.getElementById('websiteReminder').classList.remove('hidden');
  } else {
    document.getElementById('websiteReminder').classList.add('hidden');
  }
}

// Speak question using Web Speech API
function speakQuestion(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    
    const voices = speechSynthesis.getVoices();
    const maleVoiceNames = [
      'Microsoft David',
      'Alex',
      'Microsoft Mark',
      'Daniel',
      'Google UK English Male',
      'Fred',
      'Google US English Male'
    ];
    
    let selectedVoice = null;
    for (const voiceName of maleVoiceNames) {
      selectedVoice = voices.find(voice => 
        voice.name.includes(voiceName) || 
        (voice.name.toLowerCase().includes('male') && voice.lang.startsWith('en'))
      );
      if (selectedVoice) break;
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('mark'))
      );
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en-US')) || voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name);
    }
    
    speechSynthesis.speak(utterance);
  }
}

// Toggle recording (microphone button)
function toggleRecording() {
  if (interviewState.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// Start Recording
async function startRecording() {
  if (interviewState.isProcessing) {
    console.log('Already processing, skipping start recording');
    return;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Start audio recording for Whisper fallback
    interviewState.mediaRecorder = new MediaRecorder(stream);
    interviewState.audioChunks = [];
    
    interviewState.mediaRecorder.addEventListener('dataavailable', event => {
      interviewState.audioChunks.push(event.data);
    });
    
    interviewState.mediaRecorder.start();
    interviewState.isRecording = true;
    
    // Start Web Speech API for real-time transcription
    if (interviewState.recognition) {
      try {
        interviewState.recognition.start();
        console.log('Real-time speech recognition started');
      } catch (e) {
        console.warn('Speech recognition already started or error:', e);
      }
    }
    
    // Update UI
    document.getElementById('micIcon').className = 'fas fa-circle text-5xl text-nexspark-red animate-pulse';
    document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-red/20 flex items-center justify-center border-4 border-nexspark-red cursor-pointer transition-all shadow-lg shadow-nexspark-red/50';
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Listening...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Speak naturally - click "Finished" when done
      </div>
    `;
    
    console.log('Recording started with real-time transcription');
  } catch (err) {
    console.error('Error accessing microphone:', err);
    showError('Could not access microphone. Please check your permissions.');
  }
}

// Stop recording
function stopRecording() {
  if (!interviewState.isRecording) {
    return;
  }
  
  console.log('Stopping recording...');
  
  // Stop Web Speech API
  if (interviewState.recognition) {
    try {
      interviewState.recognition.stop();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
  }
  
  // Stop media recorder
  if (interviewState.mediaRecorder && interviewState.mediaRecorder.state !== 'inactive') {
    interviewState.mediaRecorder.stop();
    interviewState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
  
  interviewState.isRecording = false;
  
  // Update UI
  document.getElementById('micIcon').className = 'fas fa-microphone text-5xl text-black';
  document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-gold flex items-center justify-center cursor-pointer hover:bg-nexspark-pale transition-all shadow-lg shadow-nexspark-gold/50';
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Response Captured
    </div>
    <div class="text-white/70 font-mono text-sm">
      Edit if needed, then click "Finished"
    </div>
  `;
  
  console.log('Recording stopped');
}

// Finished button - move to next question
async function finishedSpeaking() {
  // Stop recording if still active
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  // Get final answer
  const finalAnswer = document.getElementById('manualInput').value.trim() || interviewState.currentTranscript;
  
  if (!finalAnswer) {
    showAlert('Please provide an answer before continuing.', {
      icon: 'fa-comment-slash',
      iconColor: 'nexspark-gold'
    });
    return;
  }
  
  interviewState.isProcessing = true;
  
  // Show processing status
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
      Saving...
    </div>
    <div class="text-white/70 font-mono text-sm">
      Preparing next question
    </div>
  `;
  
  try {
    // Save response
    const response = {
      questionId: `q${interviewState.currentQuestion + 1}`,
      question: interviewQuestions[interviewState.currentQuestion],
      answer: finalAnswer,
      timestamp: new Date().toISOString()
    };
    
    interviewState.responses.push(response);
    
    // Add to transcript
    addToTranscript('user', finalAnswer);
    
    // Save to database (non-blocking)
    await saveInterviewProgress();
    
    // AUTO-SAVE: Save progress locally
    autoSaveProgress();
    
    // Move to next question
    interviewState.currentQuestion++;
    interviewState.isProcessing = false;
    
    if (interviewState.currentQuestion < interviewQuestions.length) {
      setTimeout(() => {
        showQuestion(interviewState.currentQuestion);
        speakQuestion(interviewQuestions[interviewState.currentQuestion]);
        
        // Auto-start recording after question is spoken
        setTimeout(() => {
          startRecording();
          document.getElementById('statusText').innerHTML = `
            <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
              Listening...
            </div>
            <div class="text-white/70 font-mono text-sm">
              Speak naturally - click "Finished" when done
            </div>
          `;
        }, 2000); // Wait 2 seconds for question to be spoken
      }, 500);
    } else {
      completeInterview();
    }
  } catch (error) {
    console.error('Error in finishedSpeaking:', error);
    interviewState.isProcessing = false;
    
    // Show error recovery modal
    showErrorWithRecovery(
      'We had trouble saving your answer. Don\'t worry - your progress is safe locally!',
      'save_error'
    );
  }
}

// Save interview progress to database
async function saveInterviewProgress() {
  try {
    const data = {
      userId: interviewState.userId,
      interviewId: interviewState.interviewId,
      currentQuestion: interviewState.currentQuestion,
      responses: interviewState.responses,
      completed: false,
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch('/api/interview/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success && result.interviewId) {
      interviewState.interviewId = result.interviewId;
      console.log('Progress saved, interview ID:', result.interviewId);
    } else {
      console.warn('Server save failed, relying on local auto-save only');
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    // Don't throw - we have local auto-save as backup
  }
}

// ERROR RECOVERY: Handle errors gracefully with recovery options
function showErrorWithRecovery(errorMessage, errorType = 'general') {
  console.error('Interview error:', errorType, errorMessage);
  
  // Stop any active recording
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  // Create error modal
  const errorModal = document.createElement('div');
  errorModal.id = 'errorModal';
  errorModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
  errorModal.style.animation = 'fadeIn 0.3s ease-out';
  
  const currentQuestion = interviewState.currentQuestion;
  const totalAnswered = interviewState.responses.length;
  
  errorModal.innerHTML = `
    <div class="bg-nexspark-panel border-4 border-nexspark-red rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl" style="animation: slideUp 0.3s ease-out">
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-nexspark-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-nexspark-red text-4xl"></i>
        </div>
        <h2 class="text-3xl font-header font-bold text-white uppercase mb-2">
          Oops! Something Went Wrong
        </h2>
        <p class="text-white/70 font-mono text-sm">
          ${errorMessage}
        </p>
      </div>
      
      <div class="bg-nexspark-dark border border-nexspark-gold/30 rounded-lg p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <i class="fas fa-shield-check text-nexspark-gold text-2xl"></i>
          <div>
            <h3 class="text-nexspark-gold font-bold text-lg">Your Progress is Safe!</h3>
            <p class="text-white/70 text-sm">You've answered ${totalAnswered} question${totalAnswered !== 1 ? 's' : ''} - all saved locally</p>
          </div>
        </div>
        
        <div class="text-white/80 text-sm space-y-2">
          <p><i class="fas fa-check-circle text-green-400 mr-2"></i>Your answers are auto-saved</p>
          <p><i class="fas fa-check-circle text-green-400 mr-2"></i>No data has been lost</p>
          <p><i class="fas fa-check-circle text-green-400 mr-2"></i>You can continue or restart</p>
        </div>
      </div>
      
      <div class="space-y-3">
        <button onclick="retryCurrentQuestion()" class="w-full py-4 bg-nexspark-gold hover:bg-nexspark-pale text-black font-header font-bold text-xl uppercase rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <i class="fas fa-redo mr-2"></i>Retry This Question
        </button>
        
        <button onclick="continueFromLastSaved()" class="w-full py-4 bg-nexspark-blue/20 border-2 border-nexspark-blue hover:bg-nexspark-blue/40 text-nexspark-blue font-header font-bold text-xl uppercase rounded-xl transition-all">
          <i class="fas fa-play mr-2"></i>Continue from Question ${totalAnswered + 1}
        </button>
        
        <button onclick="restartInterview()" class="w-full py-4 bg-nexspark-purple/20 border-2 border-nexspark-purple hover:bg-nexspark-purple/40 text-nexspark-purple font-header font-bold text-xl uppercase rounded-xl transition-all">
          <i class="fas fa-refresh mr-2"></i>Start Fresh Interview
        </button>
        
        <button onclick="skipToDemo()" class="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-mono text-sm rounded-lg transition-all">
          <i class="fas fa-forward mr-2"></i>Skip to Demo Mode
        </button>
      </div>
      
      <div class="mt-6 text-center">
        <p class="text-white/50 text-xs">
          <i class="fas fa-life-ring mr-1"></i>
          Need help? Contact support or try refreshing the page
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(errorModal);
}

// RECOVERY: Retry current question
function retryCurrentQuestion() {
  const modal = document.getElementById('errorModal');
  if (modal) modal.remove();
  
  // Reset processing state
  interviewState.isProcessing = false;
  
  // Clear current input
  document.getElementById('currentTranscript').innerHTML = '';
  document.getElementById('manualInput').value = '';
  interviewState.finalTranscript = '';
  interviewState.interimTranscript = '';
  interviewState.currentTranscript = '';
  
  // Show ready to record status
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Ready to Try Again
    </div>
    <div class="text-white/70 font-mono text-sm">
      Click microphone to start speaking
    </div>
  `;
  
  // Re-speak the question
  speakQuestion(interviewQuestions[interviewState.currentQuestion]);
  
  // Auto-start recording after 2 seconds
  setTimeout(() => {
    startRecording();
  }, 2000);
}

// RECOVERY: Continue from last saved question
function continueFromLastSaved() {
  const modal = document.getElementById('errorModal');
  if (modal) modal.remove();
  
  // Move to next question if we have responses
  if (interviewState.responses.length > 0) {
    interviewState.currentQuestion = interviewState.responses.length;
  }
  
  interviewState.isProcessing = false;
  
  // Show the next question
  if (interviewState.currentQuestion < interviewQuestions.length) {
    showQuestion(interviewState.currentQuestion);
    speakQuestion(interviewQuestions[interviewState.currentQuestion]);
    
    setTimeout(() => {
      startRecording();
    }, 2000);
  } else {
    completeInterview();
  }
}

// RECOVERY: Restart entire interview
async function restartInterview() {
  const confirmed = await showConfirm(
    'Are you sure you want to start a completely new interview? This will clear all your current answers and start from Question 1.',
    {
      title: 'Restart Interview?',
      confirmText: 'START OVER',
      cancelText: 'KEEP CURRENT',
      danger: true
    }
  );

  if (!confirmed) return;
  
  const modal = document.getElementById('errorModal');
  if (modal) modal.remove();
  
  // Clear all state
  interviewState.currentQuestion = 0;
  interviewState.responses = [];
  interviewState.isProcessing = false;
  
  // Clear localStorage
  localStorage.removeItem('nexspark_interview_progress');
  localStorage.removeItem('nexspark_interview');
  
  // Clear transcript
  document.getElementById('transcriptMessages').innerHTML = '';
  
  // Reload the page to start fresh
  window.location.reload();
}

// Add message to transcript
function addToTranscript(speaker, message) {
  const transcriptMessages = document.getElementById('transcriptMessages');
  const messageEl = document.createElement('div');
  messageEl.className = speaker === 'leon' 
    ? 'p-4 rounded bg-nexspark-blue/10 border border-nexspark-blue/30'
    : 'p-4 rounded bg-nexspark-gold/10 border border-nexspark-gold/30';
  
  const speakerName = speaker === 'leon' ? 'DIGITAL LEON' : 'YOU';
  const icon = speaker === 'leon' ? '🤖' : '👤';
  
  messageEl.innerHTML = `
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">${icon}</span>
      <span class="text-white/50 font-mono text-xs uppercase">${speakerName}</span>
    </div>
    <div class="text-white/90 font-mono text-sm leading-relaxed">
      ${escapeHtml(message)}
    </div>
  `;
  
  transcriptMessages.appendChild(messageEl);
  transcriptMessages.scrollTop = transcriptMessages.scrollHeight;
}

// Pause interview
function pauseInterview() {
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  showAlert('Interview paused. Click "Resume" to continue.', {
    title: 'Interview Paused',
    icon: 'fa-pause-circle',
    iconColor: 'nexspark-blue'
  });
}

// End interview
async function endInterview() {
  const confirmed = await showConfirm(
    'Are you sure you want to end the interview? Your progress will be saved.',
    {
      title: 'End Interview?',
      confirmText: 'END',
      cancelText: 'CONTINUE',
      icon: 'fa-stop-circle',
      iconColor: 'nexspark-red'
    }
  );

  if (confirmed) {
    completeInterview();
  }
}

// Complete interview
async function completeInterview() {
  interviewState.isActive = false;
  
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  // Mark as completed and save
  const finalData = {
    userId: interviewState.userId,
    interviewId: interviewState.interviewId,
    responses: interviewState.responses,
    completed: true,
    completedAt: new Date().toISOString()
  };
  
  try {
    const response = await fetch('/api/interview/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    });
    
    const result = await response.json();
    console.log('Interview completed:', result);
    
    // Save complete interview data to localStorage for analysis
    if (result.success && result.interviewId) {
      const storedInterview = {
        id: result.interviewId,
        interviewId: result.interviewId, // For compatibility
        userId: interviewState.userId,
        responses: interviewState.responses, // CRITICAL: Save responses array
        completed: true,
        completedAt: finalData.completedAt
      };
      localStorage.setItem('nexspark_interview', JSON.stringify(storedInterview));
      console.log('✅ Saved complete interview data to localStorage:', {
        id: result.interviewId,
        responseCount: interviewState.responses.length
      });
    }
  } catch (error) {
    console.error('Error completing interview:', error);
    // Even if API fails, save interview data locally for analysis
    const storedInterview = {
      id: interviewState.interviewId || 'local_' + Date.now(),
      interviewId: interviewState.interviewId || 'local_' + Date.now(),
      userId: interviewState.userId,
      responses: interviewState.responses, // Save responses locally
      completed: true,
      completedAt: finalData.completedAt
    };
    localStorage.setItem('nexspark_interview', JSON.stringify(storedInterview));
    console.log('⚠️ API failed, saved interview data locally');
  }
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Interview Complete!
    </div>
    <div class="text-white/70 font-mono text-sm">
      Redirecting to summary confirmation...
    </div>
  `;
  
  document.getElementById('micButton').style.display = 'none';
  document.getElementById('finishedBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('endBtn').classList.add('hidden');
  
  // Redirect to confirmation page first
  setTimeout(() => {
    window.location.href = '/interview-confirmation';
  }, 1500);
}

function showCompletionPopup() {
  // Extract website from first question response
  const firstResponse = interviewState.responses[0]?.answer || '';
  const websiteMatch = firstResponse.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  const detectedWebsite = websiteMatch ? websiteMatch[0] : '';
  
  // Extract company name
  const companyMatch = firstResponse.match(/(?:company name|called|named)\s+(?:is\s+)?([A-Z][a-zA-Z\s&]+?)(?:\s+and|\s+which|\.|,|$)/i);
  const detectedCompany = companyMatch ? companyMatch[1].trim() : '';
  
  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'completionPopup';
  overlay.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  overlay.style.animation = 'fadeIn 0.3s ease-out';
  
  overlay.innerHTML = `
    <div class="bg-nexspark-panel border-4 border-nexspark-gold rounded-2xl p-8 max-w-2xl w-full" style="animation: slideUp 0.4s ease-out;">
      <div class="text-center mb-6">
        <i class="fas fa-check-circle text-6xl text-nexspark-gold mb-4"></i>
        <h2 class="text-4xl font-header font-bold text-white uppercase mb-2">
          Interview Complete!
        </h2>
        <p class="text-nexspark-blue font-mono text-lg">
          🎉 Great job! Here's what we captured:
        </p>
      </div>
      
      <div class="bg-nexspark-dark rounded-xl p-6 mb-6 space-y-4">
        <div class="border-b border-nexspark-blue/30 pb-3">
          <label class="block text-nexspark-gold font-bold mb-2 uppercase text-sm">
            <i class="fas fa-building mr-2"></i>Company Name
          </label>
          <input 
            type="text" 
            id="companyNameInput" 
            value="${detectedCompany}"
            class="w-full px-4 py-3 bg-black border-2 border-nexspark-purple rounded-lg text-white font-mono focus:border-nexspark-gold focus:outline-none"
            placeholder="Enter your company name"
          >
        </div>
        
        <div class="border-b border-nexspark-blue/30 pb-3">
          <label class="block text-nexspark-gold font-bold mb-2 uppercase text-sm">
            <i class="fas fa-globe mr-2"></i>Website URL
          </label>
          <input 
            type="text" 
            id="websiteInput" 
            value="${detectedWebsite}"
            class="w-full px-4 py-3 bg-black border-2 border-nexspark-purple rounded-lg text-white font-mono focus:border-nexspark-gold focus:outline-none"
            placeholder="e.g., www.yourcompany.com"
          >
          <p class="text-white/50 text-xs font-mono mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            We'll verify this website and analyze your top competitors
          </p>
        </div>
        
        <div>
          <label class="block text-nexspark-gold font-bold mb-2 uppercase text-sm">
            <i class="fas fa-comments mr-2"></i>Total Responses Captured
          </label>
          <div class="text-white font-mono text-2xl">
            ${interviewState.responses.length} / ${interviewState.totalQuestions} Questions
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-nexspark-gold/20 to-nexspark-blue/20 rounded-xl p-6 mb-6 border border-nexspark-gold/30">
        <h3 class="text-white font-header text-xl uppercase mb-3">
          <i class="fas fa-magic mr-2 text-nexspark-gold"></i>
          What Happens Next?
        </h3>
        <div class="space-y-2 text-white/80 font-mono text-sm">
          <div class="flex items-start gap-2">
            <span class="text-nexspark-gold">1.</span>
            <span>We'll analyze your interview with Claude AI</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-nexspark-gold">2.</span>
            <span>Automatically identify your top 3 competitors</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-nexspark-gold">3.</span>
            <span>Generate a comprehensive 6-month GTM strategy</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-nexspark-gold">4.</span>
            <span>Provide budget allocation and CAC projections</span>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <button 
          onclick="goToDashboard()" 
          class="flex-1 py-4 bg-nexspark-dark hover:bg-nexspark-purple text-white rounded-lg font-bold text-lg transition border border-nexspark-purple">
          <i class="fas fa-arrow-left mr-2"></i> BACK TO DASHBOARD
        </button>
        <button 
          onclick="startAnalysis()" 
          class="flex-1 py-4 bg-nexspark-gold hover:bg-nexspark-pale text-black rounded-lg font-bold text-lg transition shadow-lg">
          <i class="fas fa-rocket mr-2"></i> START ANALYSIS
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

function goToDashboard() {
  window.location.href = '/dashboard';
}

function startAnalysis() {
  const companyName = document.getElementById('companyNameInput').value.trim();
  const website = document.getElementById('websiteInput').value.trim();
  
  if (!website) {
    showAlert('Please enter your website URL to continue', {
      icon: 'fa-globe',
      iconColor: 'nexspark-gold'
    });
    return;
  }
  
  // Save company name and website to localStorage for strategy analysis
  const existingInterview = JSON.parse(localStorage.getItem('nexspark_interview') || '{}');
  existingInterview.companyName = companyName;
  existingInterview.website = website;
  localStorage.setItem('nexspark_interview', JSON.stringify(existingInterview));
  
  // Redirect to strategy analysis
  window.location.href = '/static/interview-summary.html';
}

// Demo Mode - Skip Interview with Sample Data
function skipToDemo() {
  // Create demo user if not exists
  const demoUser = {
    id: 'usr_demo_' + Date.now(),
    email: 'demo@nexspark.io',
    name: 'Demo User',
    created_at: new Date().toISOString()
  };
  localStorage.setItem('nexspark_user', JSON.stringify(demoUser));
  
  // Create demo interview data
  const demoInterview = {
    id: 'demo_interview_' + Date.now(),
    companyName: 'Acme Pool Supply',
    website: 'www.acmepoolsupply.com',
    responses: [
      {
        question: "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your company name and what product or service do you offer? Please also mention your website URL so we can research it for you later.",
        answer: "My company is Acme Pool Supply and we sell pool chemicals and maintenance supplies to residential pool owners. Our website is www.acmepoolsupply.com",
        timestamp: new Date().toISOString()
      },
      {
        question: "Great! What's your current monthly revenue?",
        answer: "We're currently doing about $150,000 per month in revenue",
        timestamp: new Date().toISOString()
      },
      {
        question: "How much are you spending on marketing each month?",
        answer: "We spend around $25,000 per month on marketing",
        timestamp: new Date().toISOString()
      },
      {
        question: "Which marketing channels are you currently using?",
        answer: "We're using Google Ads, Facebook Ads, and some local SEO. We also do email marketing to our existing customers",
        timestamp: new Date().toISOString()
      },
      {
        question: "What's your best performing channel and what metrics can you share?",
        answer: "Google Ads is our best channel with about a 4.5x ROAS. We get about 500 leads per month from search",
        timestamp: new Date().toISOString()
      },
      {
        question: "What's the biggest challenge you're facing with growth right now?",
        answer: "Our biggest challenge is customer acquisition cost. It's been climbing and eating into our margins. We need to find more efficient channels",
        timestamp: new Date().toISOString()
      },
      {
        question: "Who is your ideal customer? Describe them in detail.",
        answer: "Homeowners aged 35-65 with household income over $75k. They own pools in the sunbelt states like Florida, California, Arizona, and Texas. They value quality and convenience",
        timestamp: new Date().toISOString()
      },
      {
        question: "Who are your top 3 competitors and what makes you different?",
        answer: "Our top competitors are HTH Pool Care, Leslie's Pools, and Clorox Pool & Spa. We differentiate with faster shipping, better customer service, and educational content about pool maintenance",
        timestamp: new Date().toISOString()
      },
      {
        question: "What's your main goal for the next 6 months?",
        answer: "We want to scale from $150k to $300k per month while maintaining our profit margins. That means we need to lower CAC and increase LTV",
        timestamp: new Date().toISOString()
      },
      {
        question: "What's your monthly budget range for growth and marketing investments?",
        answer: "We can allocate up to $10,000 per month for growth initiatives and marketing",
        timestamp: new Date().toISOString()
      }
    ],
    completed: true,
    completedAt: new Date().toISOString(),
    demo: true
  };
  
  localStorage.setItem('nexspark_interview', JSON.stringify(demoInterview));
  
  // Show a brief notification
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-nexspark-gold text-black px-6 py-4 rounded-lg shadow-lg z-50 font-bold';
  notification.innerHTML = `
    <i class="fas fa-magic mr-2"></i>
    Demo Mode Activated! Redirecting to analysis...
  `;
  document.body.appendChild(notification);
  
  // Redirect to strategy analysis after brief delay
  setTimeout(() => {
    window.location.href = '/strategy-analysis?demo=true';
  }, 1500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Voice Interview v3 initialized - Real-time transcription + Simplified UI');
  checkAuth();
});
