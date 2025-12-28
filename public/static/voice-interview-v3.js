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
  "What's your budget range for working with growth experts?"
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
  
  // Speak question
  speakQuestion(interviewQuestions[interviewState.currentQuestion]);
  
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
      
      document.getElementById('statusText').innerHTML = `
        <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
          Ready to Listen
        </div>
        <div class="text-white/70 font-mono text-sm">
          Click microphone to start speaking
        </div>
      `;
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
  } catch (error) {
    console.error('Error completing interview:', error);
  }
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Interview Complete!
    </div>
    <div class="text-white/70 font-mono text-sm">
      Generating your growth strategy...
    </div>
  `;
  
  document.getElementById('micButton').style.display = 'none';
  document.getElementById('finishedBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('endBtn').classList.add('hidden');
  
  // Redirect to dashboard after 2 seconds
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Voice Interview v3 initialized - Real-time transcription + Simplified UI');
  checkAuth();
});
