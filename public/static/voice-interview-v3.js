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
  interviewId: null
};

// Interview Questions
const interviewQuestions = [
  "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your company name and what product or service do you offer? Please also mention your website URL so we can research it for you later.",
  "Great! What's your current monthly revenue?",
  "How much are you spending on marketing each month?",
  "Which marketing channels are you currently using?",
  "What's your best performing channel and what metrics can you share?",
  "What's the biggest challenge you're facing with growth right now?",
  "Who is your ideal customer? Describe them in detail.",
  "Who are your top 3 competitors and what makes you different?",
  "What's your main goal for the next 6 months?",
  "What's your monthly budget range for growth and marketing investments?"
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
    
    if (data.exists) {
      const choice = confirm(
        `You have a previous interview from ${new Date(data.interview.createdAt).toLocaleDateString()}.\n\n` +
        `Click OK to start a NEW interview (previous will be saved).\n` +
        `Click Cancel to CONTINUE the previous interview.`
      );
      
      if (!choice) {
        // Continue previous interview
        loadPreviousInterview(data.interview);
      } else {
        // Start new interview (backend will archive old one)
        interviewState.interviewId = null;
      }
    }
  } catch (error) {
    console.error('Error checking existing interview:', error);
  }
}

// Load previous interview
function loadPreviousInterview(interview) {
  interviewState.interviewId = interview.id;
  interviewState.currentQuestion = interview.currentQuestion || 0;
  interviewState.responses = interview.responses || [];
  
  // Populate transcript with previous responses
  interviewState.responses.forEach((response, index) => {
    addToTranscript('leon', interviewQuestions[index]);
    addToTranscript('user', response.answer);
  });
  
  console.log('Loaded previous interview:', interview);
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
  
  // Check for existing interview
  await checkExistingInterview();
  
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
  
  // Update progress
  const progress = ((index + 1) / interviewState.totalQuestions) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `${index + 1}/${interviewState.totalQuestions} Questions`;
  
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
    alert('Could not access microphone. Please check your permissions.');
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
    alert('Please provide an answer before continuing.');
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
  
  // Save to database
  await saveInterviewProgress();
  
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
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
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
  
  alert('Interview paused. Click "Resume" to continue.');
}

// End interview
function endInterview() {
  if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
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
    
    // Save interview ID to localStorage for analysis
    if (result.success && result.interviewId) {
      const storedInterview = JSON.parse(localStorage.getItem('nexspark_interview') || '{}');
      storedInterview.id = result.interviewId;
      storedInterview.interviewId = result.interviewId; // For compatibility
      localStorage.setItem('nexspark_interview', JSON.stringify(storedInterview));
      console.log('✅ Saved interview ID to localStorage:', result.interviewId);
    }
  } catch (error) {
    console.error('Error completing interview:', error);
  }
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Interview Complete!
    </div>
    <div class="text-white/70 font-mono text-sm">
      Processing your responses...
    </div>
  `;
  
  document.getElementById('micButton').style.display = 'none';
  document.getElementById('finishedBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('endBtn').classList.add('hidden');
  
  // Show completion confirmation popup
  setTimeout(() => {
    showCompletionPopup();
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
    alert('Please enter your website URL to continue');
    return;
  }
  
  // Save company name and website to localStorage for strategy analysis
  const existingInterview = JSON.parse(localStorage.getItem('nexspark_interview') || '{}');
  existingInterview.companyName = companyName;
  existingInterview.website = website;
  localStorage.setItem('nexspark_interview', JSON.stringify(existingInterview));
  
  // Redirect to strategy analysis
  window.location.href = '/strategy-analysis';
}

// Demo Mode - Skip Interview with Sample Data
function skipToDemo() {
  // Create demo user if not exists
  const demoUser = {
    id: 'demo_user_' + Date.now(),
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
