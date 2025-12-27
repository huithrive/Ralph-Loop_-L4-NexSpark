// Initialize background animation (same as dashboard)
(() => {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  let animationFrameId;

  const stars = [];
  const starCount = 800;
  const colors = ['#FF9C00', '#99CCFF', '#CC99CC', '#FFFFFF'];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  const render = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    const cx = width / 2;
    const cy = height / 2;

    stars.forEach(star => {
      star.z -= 4;
      if (star.z <= 0) {
        star.z = width;
        star.x = (Math.random() - 0.5) * width;
        star.y = (Math.random() - 0.5) * height;
      }

      const x = (star.x / star.z) * width + cx;
      const y = (star.y / star.z) * height + cy;
      const rawSize = (1 - star.z / width) * 3;
      const size = Math.max(0, rawSize);

      if (x >= 0 && x <= width && y >= 0 && y <= height && size > 0) {
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.strokeStyle = 'rgba(153, 204, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    
    for(let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for(let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', handleResize);
})();

// Interview state
let interviewState = {
  isActive: false,
  isRecording: false,
  currentQuestion: 0,
  totalQuestions: 10,
  responses: [],
  mediaRecorder: null,
  audioChunks: []
};

// Interview questions from Digital Leon
const interviewQuestions = [
  "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your company name and what product or service do you offer?",
  "Great! What's your current monthly revenue or sales volume?",
  "How much are you currently spending on marketing per month?",
  "What marketing channels are you currently using? For example, Facebook ads, Google ads, SEO, email marketing, etc.",
  "Which of these channels is performing best for you right now, and how do you measure success?",
  "What's your biggest challenge in growing your business right now?",
  "Who is your ideal customer? Can you describe their demographics, behaviors, and pain points?",
  "Who are your top 3 competitors, and what do you think they're doing better than you?",
  "What's your main growth goal for the next 6 months? Is it revenue, customers, market share, or something else?",
  "Finally, what's your budget range for working with growth experts? This helps us match you with the right specialists."
];

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('nexspark_user');
  if (!user) {
    window.location.href = '/';
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (e) {
    console.error('Failed to parse user data:', e);
    localStorage.removeItem('nexspark_user');
    window.location.href = '/';
    return null;
  }
}

// Start interview
async function startInterview() {
  console.log('startInterview() called');
  const user = checkAuth();
  if (!user) {
    console.log('No user found, redirecting...');
    return;
  }
  
  console.log('User authenticated:', user);
  console.log('Setting interview state to active...');
  
  interviewState.isActive = true;
  interviewState.currentQuestion = 0;
  
  console.log('Interview state:', interviewState);
  
  // Update UI
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('endBtn').classList.remove('hidden');
  document.getElementById('questionBox').classList.remove('hidden');
  document.getElementById('transcriptContainer').classList.remove('hidden');
  
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('endBtn').disabled = false;
  
  // Update status to show it's ready
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Listening...
    </div>
    <div class="text-white/70 font-mono text-sm">
      Click the microphone to answer
    </div>
  `;
  
  // Show first question
  showQuestion(0);
  
  // Speak the question using Text-to-Speech
  speakQuestion(interviewQuestions[0]);
  
  console.log('Interview started - microphone should now be active!');
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
}

// Speak question using Web Speech API
function speakQuestion(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Use a more professional voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.name.includes('Google US English')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
  }
}

// Toggle recording
async function toggleRecording() {
  console.log('toggleRecording called, isActive:', interviewState.isActive, 'isRecording:', interviewState.isRecording);
  
  if (!interviewState.isActive) {
    console.log('Interview not active! Please click START INTERVIEW button first.');
    alert('Please click the "START INTERVIEW" button below first');
    return;
  }
  
  if (interviewState.isRecording) {
    console.log('Stopping recording...');
    stopRecording();
  } else {
    console.log('Starting recording...');
    startRecording();
  }
}

// Start recording user response
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    interviewState.mediaRecorder = new MediaRecorder(stream);
    interviewState.audioChunks = [];
    
    interviewState.mediaRecorder.addEventListener('dataavailable', event => {
      interviewState.audioChunks.push(event.data);
    });
    
    interviewState.mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(interviewState.audioChunks, { type: 'audio/wav' });
      processAudioResponse(audioBlob);
    });
    
    interviewState.mediaRecorder.start();
    interviewState.isRecording = true;
    
    // Update UI
    document.getElementById('micIcon').className = 'fas fa-stop text-5xl text-black';
    document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-red flex items-center justify-center cursor-pointer hover:bg-red-700 transition-all shadow-lg shadow-nexspark-red/50';
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Recording...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Click to stop recording
      </div>
    `;
    document.getElementById('waveform').classList.remove('hidden');
    
    console.log('Recording started');
  } catch (err) {
    console.error('Error accessing microphone:', err);
    alert('Could not access microphone. Please check your permissions.');
  }
}

// Stop recording
function stopRecording() {
  if (interviewState.mediaRecorder && interviewState.mediaRecorder.state !== 'inactive') {
    interviewState.mediaRecorder.stop();
    interviewState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
  
  interviewState.isRecording = false;
  
  // Update UI
  document.getElementById('micIcon').className = 'fas fa-microphone text-5xl text-black';
  document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-gold flex items-center justify-center cursor-pointer hover:bg-nexspark-pale transition-all shadow-lg shadow-nexspark-gold/50';
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
      Processing...
    </div>
    <div class="text-white/70 font-mono text-sm">
      Transcribing your response
    </div>
  `;
  document.getElementById('waveform').classList.add('hidden');
  
  console.log('Recording stopped');
}

// Process audio response - This will integrate with OpenAI Whisper API
async function processAudioResponse(audioBlob) {
  try {
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
        Processing...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Transcribing your response with AI...
      </div>
    `;
    
    // Send audio to OpenAI Whisper API for transcription
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Transcription failed');
    }
    
    const transcript = result.transcript;
    console.log('Transcription received:', transcript);
    
    // Save response
    interviewState.responses.push({
      questionId: `q${interviewState.currentQuestion + 1}`,
      question: interviewQuestions[interviewState.currentQuestion],
      answer: transcript,
      timestamp: new Date().toISOString()
    });
    
    // Add to transcript
    addToTranscript('user', transcript);
    
    // Save progress
    saveInterviewProgress();
    
    // Move to next question
    interviewState.currentQuestion++;
    
    if (interviewState.currentQuestion < interviewQuestions.length) {
      // Show next question
      setTimeout(() => {
        showQuestion(interviewState.currentQuestion);
        speakQuestion(interviewQuestions[interviewState.currentQuestion]);
        
        document.getElementById('statusText').innerHTML = `
          <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
            Listening...
          </div>
          <div class="text-white/70 font-mono text-sm">
            Click the microphone to answer
          </div>
        `;
      }, 1000);
    } else {
      completeInterview();
    }
    
  } catch (error) {
    console.error('Error processing audio:', error);
    
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Error
      </div>
      <div class="text-white/70 font-mono text-sm">
        ${error.message || 'Failed to process audio. Please try recording again.'}
      </div>
    `;
    
    // Allow user to retry
    setTimeout(() => {
      document.getElementById('statusText').innerHTML = `
        <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
          Ready
        </div>
        <div class="text-white/70 font-mono text-sm">
          Click the microphone to try again
        </div>
      `;
    }, 3000);
  }
}

// Save interview progress
function saveInterviewProgress() {
  const progressData = {
    currentQuestion: interviewState.currentQuestion,
    totalQuestions: interviewState.totalQuestions,
    responses: interviewState.responses,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem('nexspark_interview_progress', JSON.stringify(progressData));
}

// Add message to transcript
function addToTranscript(sender, message) {
  const transcript = document.getElementById('transcript');
  const messageEl = document.createElement('div');
  messageEl.className = 'transcript-message';
  
  if (sender === 'leon') {
    messageEl.innerHTML = `
      <div class="flex items-start gap-3 bg-nexspark-blue/10 p-4 rounded-lg">
        <i class="fas fa-robot text-nexspark-blue text-xl mt-1"></i>
        <div class="flex-1">
          <div class="text-nexspark-blue font-mono text-xs uppercase mb-1">Digital Leon</div>
          <div class="text-white/90 font-mono text-sm">${message}</div>
        </div>
      </div>
    `;
  } else {
    messageEl.innerHTML = `
      <div class="flex items-start gap-3 bg-nexspark-gold/10 p-4 rounded-lg">
        <i class="fas fa-user text-nexspark-gold text-xl mt-1"></i>
        <div class="flex-1">
          <div class="text-nexspark-gold font-mono text-xs uppercase mb-1">You</div>
          <div class="text-white/90 font-mono text-sm">${message}</div>
        </div>
      </div>
    `;
  }
  
  transcript.appendChild(messageEl);
  
  // Scroll to bottom
  const container = document.getElementById('transcriptContainer');
  container.scrollTop = container.scrollHeight;
}

// Pause interview
function pauseInterview() {
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  // TODO: Implement pause functionality
  alert('Interview paused. Click "Start Interview" to resume.');
}

// End interview early
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
  
  // Update UI immediately
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
      Interview Complete!
    </div>
    <div class="text-white/70 font-mono text-sm">
      Analyzing your responses...
    </div>
  `;
  
  document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-blue flex items-center justify-center shadow-lg shadow-nexspark-blue/50';
  document.getElementById('micIcon').className = 'fas fa-spinner fa-spin text-5xl text-black';
  
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('endBtn').classList.add('hidden');
  
  try {
    // Send interview data for analysis
    const response = await fetch('/api/interview/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        responses: interviewState.responses
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Save complete interview data with analysis
      const interviewData = {
        completed: true,
        completedAt: new Date().toISOString(),
        responses: interviewState.responses,
        analysis: result.analysis,
        strategy: result.strategy,
        progress: 1.0
      };
      
      localStorage.setItem('nexspark_interview', JSON.stringify(interviewData));
      
      // Update UI with success
      document.getElementById('statusText').innerHTML = `
        <div class="text-nexspark-blue font-header text-2xl uppercase tracking-wider mb-2">
          Analysis Complete!
        </div>
        <div class="text-white/70 font-mono text-sm">
          Your personalized growth strategy is ready
        </div>
      `;
      
      document.getElementById('micIcon').className = 'fas fa-check text-5xl text-black';
      
      // Show completion message and redirect
      setTimeout(() => {
        alert('Your growth strategy has been generated! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      }, 2000);
      
      console.log('Interview completed and analyzed:', result);
    } else {
      throw new Error(result.message || 'Analysis failed');
    }
  } catch (error) {
    console.error('Error completing interview:', error);
    
    // Save basic interview data without analysis
    const interviewData = {
      completed: true,
      completedAt: new Date().toISOString(),
      responses: interviewState.responses,
      progress: interviewState.currentQuestion / interviewState.totalQuestions,
      analysisError: error.message
    };
    
    localStorage.setItem('nexspark_interview', JSON.stringify(interviewData));
    
    // Update UI
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
        Interview Saved
      </div>
      <div class="text-white/70 font-mono text-sm">
        Our team will analyze your responses manually
      </div>
    `;
    
    document.getElementById('micIcon').className = 'fas fa-check text-5xl text-black';
    
    setTimeout(() => {
      alert('Interview completed! Our team will review your responses and contact you within 24 hours.');
      window.location.href = '/dashboard';
    }, 2000);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  if (!user) return;
  
  console.log('%c🎤 VOICE INTERVIEW SYSTEM', 'color: #FF9C00; font-size: 20px; font-weight: bold; font-family: Antonio;');
  console.log('%cDIGITAL LEON AI - READY', 'color: #99CCFF; font-family: JetBrains Mono;');
  console.log('%c⚠ OpenAI Whisper API integration pending', 'color: #FFCC99; font-family: JetBrains Mono;');
});
