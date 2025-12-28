// NexSpark Voice Interview - Natural Conversation v2
// Implements Voice Activity Detection (VAD), real-time transcription, and editable responses

// Animated Starfield Background (Star Trek Warp Effect)
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

      const trail = Math.min(100, star.z / 5);
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
  audioContext: null,
  analyser: null,
  silenceTimeout: null,
  silenceThreshold: -50, // dB threshold for silence detection
  silenceDuration: 2000, // 2 seconds of silence before auto-stop
  currentTranscript: '',
  vadActive: true // Voice Activity Detection enabled by default
};

// Interview Questions
const interviewQuestions = [
  "Welcome! I'm Digital Leon, your AI growth strategist. Let's start with the basics - what's your company name and what product or service do you offer?",
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
    return JSON.parse(user);
  } catch (e) {
    console.error('Invalid user data:', e);
    window.location.href = '/';
    return null;
  }
}

// Start Interview
function startInterview() {
  console.log('startInterview() called');
  
  // Check authentication
  const user = checkAuth();
  if (!user) return;
  
  console.log('User authenticated:', user);
  console.log('Setting interview state to active...');
  
  // Set state
  interviewState.isActive = true;
  interviewState.currentQuestion = 0;
  
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
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Ready to Listen
    </div>
    <div class="text-white/70 font-mono text-sm">
      Just start speaking - I'll detect when you're done
    </div>
  `;
  
  // Show question
  showQuestion(0);
  
  // Speak question and auto-start recording when done
  speakQuestion(interviewQuestions[0], () => {
    console.log('Question finished speaking, auto-starting recording...');
    setTimeout(() => {
      startRecording();
    }, 500);
  });
  
  console.log('Interview started - will auto-record after question!');
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
  document.getElementById('currentTranscript').textContent = '';
  document.getElementById('manualInput').value = '';
}

// Speak question using Web Speech API
function speakQuestion(text, onFinish) {
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
    
    if (onFinish) {
      utterance.onend = onFinish;
    }
    
    speechSynthesis.speak(utterance);
  }
}

// Voice Activity Detection (VAD) Setup
async function setupVoiceActivityDetection(stream) {
  interviewState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = interviewState.audioContext.createMediaStreamSource(stream);
  interviewState.analyser = interviewState.audioContext.createAnalyser();
  interviewState.analyser.fftSize = 512;
  interviewState.analyser.smoothingTimeConstant = 0.8;
  
  source.connect(interviewState.analyser);
  
  // Start monitoring audio levels
  monitorAudioLevel();
}

// Monitor audio level for Voice Activity Detection
function monitorAudioLevel() {
  if (!interviewState.isRecording || !interviewState.analyser) {
    return;
  }
  
  const bufferLength = interviewState.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  interviewState.analyser.getByteFrequencyData(dataArray);
  
  // Calculate average volume
  const average = dataArray.reduce((a, b) => a + b) / bufferLength;
  const volumeDb = 20 * Math.log10(average / 255);
  
  // Update waveform visualization
  updateWaveform(dataArray);
  
  // Detect silence
  if (volumeDb < interviewState.silenceThreshold) {
    // User is silent
    if (!interviewState.silenceTimeout && interviewState.vadActive) {
      console.log('Silence detected, starting timeout...');
      interviewState.silenceTimeout = setTimeout(() => {
        console.log('Silence duration exceeded, auto-stopping recording...');
        stopRecording();
      }, interviewState.silenceDuration);
    }
  } else {
    // User is speaking
    if (interviewState.silenceTimeout) {
      clearTimeout(interviewState.silenceTimeout);
      interviewState.silenceTimeout = null;
    }
  }
  
  // Continue monitoring
  if (interviewState.isRecording) {
    requestAnimationFrame(() => monitorAudioLevel());
  }
}

// Update waveform visualization
function updateWaveform(dataArray) {
  const waveform = document.getElementById('waveform');
  if (!waveform) return;
  
  // Simple bar visualization
  const bars = waveform.querySelectorAll('.waveform-bar');
  const step = Math.floor(dataArray.length / bars.length);
  
  bars.forEach((bar, i) => {
    const value = dataArray[i * step];
    const height = (value / 255) * 100;
    bar.style.height = `${height}%`;
  });
}

// Start Recording with VAD
async function startRecording() {
  if (interviewState.isProcessing) {
    console.log('Already processing, skipping start recording');
    return;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Set up Voice Activity Detection
    await setupVoiceActivityDetection(stream);
    
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
    document.getElementById('micIcon').className = 'fas fa-circle text-5xl text-nexspark-red animate-pulse';
    document.getElementById('micButton').className = 'w-32 h-32 rounded-full bg-nexspark-red/20 flex items-center justify-center border-4 border-nexspark-red transition-all shadow-lg shadow-nexspark-red/50';
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Listening...
      </div>
      <div class="text-white/70 font-mono text-sm">
        Speak naturally - I'll detect when you're done
      </div>
    `;
    document.getElementById('waveform').classList.remove('hidden');
    
    console.log('Recording started with Voice Activity Detection');
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
  
  // Clear silence timeout
  if (interviewState.silenceTimeout) {
    clearTimeout(interviewState.silenceTimeout);
    interviewState.silenceTimeout = null;
  }
  
  // Stop media recorder
  if (interviewState.mediaRecorder && interviewState.mediaRecorder.state !== 'inactive') {
    interviewState.mediaRecorder.stop();
    interviewState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
  
  // Stop audio context
  if (interviewState.audioContext) {
    interviewState.audioContext.close();
    interviewState.audioContext = null;
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

// Toggle VAD on/off
function toggleVAD() {
  interviewState.vadActive = !interviewState.vadActive;
  const vadToggle = document.getElementById('vadToggle');
  
  if (interviewState.vadActive) {
    vadToggle.innerHTML = '<i class="fas fa-magic mr-2"></i>Auto-Stop: ON';
    vadToggle.className = 'px-4 py-2 bg-nexspark-gold/20 text-nexspark-gold border border-nexspark-gold rounded font-mono text-sm hover:bg-nexspark-gold/30 transition-all';
  } else {
    vadToggle.innerHTML = '<i class="fas fa-magic mr-2"></i>Auto-Stop: OFF';
    vadToggle.className = 'px-4 py-2 bg-gray-700/50 text-gray-400 border border-gray-600 rounded font-mono text-sm hover:bg-gray-700 transition-all';
  }
  
  console.log('VAD toggled:', interviewState.vadActive);
}

// Manual stop button (for users who want control)
function manualStopRecording() {
  if (interviewState.isRecording) {
    interviewState.vadActive = false; // Disable VAD for this stop
    stopRecording();
  }
}

// Process audio response
async function processAudioResponse(audioBlob) {
  if (interviewState.isProcessing) {
    console.log('Already processing, ignoring duplicate call');
    return;
  }
  
  interviewState.isProcessing = true;
  
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
    
    // Display transcript in current input
    document.getElementById('currentTranscript').textContent = transcript;
    document.getElementById('manualInput').value = transcript;
    
    // Show "Next Question" button
    document.getElementById('nextQuestionBtn').classList.remove('hidden');
    
    interviewState.currentTranscript = transcript;
    
  } catch (err) {
    console.error('Error processing audio:', err);
    document.getElementById('statusText').innerHTML = `
      <div class="text-nexspark-red font-header text-2xl uppercase tracking-wider mb-2">
        Error
      </div>
      <div class="text-white/70 font-mono text-sm">
        ${err.message}. Please try again.
      </div>
    `;
    
    // Re-enable recording after 2 seconds
    setTimeout(() => {
      interviewState.isProcessing = false;
      startRecording();
    }, 2000);
  }
}

// Confirm and move to next question
function confirmAndNext() {
  // Get final answer (manual input overrides transcript)
  const finalAnswer = document.getElementById('manualInput').value.trim() || interviewState.currentTranscript;
  
  if (!finalAnswer) {
    alert('Please provide an answer before continuing.');
    return;
  }
  
  // Save response
  interviewState.responses.push({
    questionId: `q${interviewState.currentQuestion + 1}`,
    question: interviewQuestions[interviewState.currentQuestion],
    answer: finalAnswer,
    timestamp: new Date().toISOString()
  });
  
  // Add to transcript
  addToTranscript('user', finalAnswer);
  
  // Save progress
  saveInterviewProgress();
  
  // Hide "Next Question" button
  document.getElementById('nextQuestionBtn').classList.add('hidden');
  
  // Move to next question
  interviewState.currentQuestion++;
  interviewState.isProcessing = false;
  
  if (interviewState.currentQuestion < interviewQuestions.length) {
    // Show next question
    setTimeout(() => {
      showQuestion(interviewState.currentQuestion);
      
      // Speak question and auto-start recording when done
      speakQuestion(interviewQuestions[interviewState.currentQuestion], () => {
        console.log('Next question finished speaking, auto-starting recording...');
        setTimeout(() => {
          startRecording();
        }, 500);
      });
      
      document.getElementById('statusText').innerHTML = `
        <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
          Ready to Listen
        </div>
        <div class="text-white/70 font-mono text-sm">
          Speak naturally - I'll detect when you're done
        </div>
      `;
    }, 1000);
  } else {
    completeInterview();
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
      ${message}
    </div>
  `;
  
  transcriptMessages.appendChild(messageEl);
  transcriptMessages.scrollTop = transcriptMessages.scrollHeight;
}

// Save interview progress to localStorage
function saveInterviewProgress() {
  const progress = {
    currentQuestion: interviewState.currentQuestion,
    responses: interviewState.responses,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('nexspark_interview_progress', JSON.stringify(progress));
  console.log('Progress saved:', progress);
}

// Pause interview
function pauseInterview() {
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  interviewState.isActive = false;
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Paused
    </div>
    <div class="text-white/70 font-mono text-sm">
      Click "Resume" to continue
    </div>
  `;
  
  // TODO: Implement actual pause functionality
  alert('Interview paused. Click "Resume" to continue.');
}

// End interview
function endInterview() {
  if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
    completeInterview();
  }
}

// Complete interview
function completeInterview() {
  interviewState.isActive = false;
  
  if (interviewState.isRecording) {
    stopRecording();
  }
  
  // Save final progress
  const finalData = {
    completed: true,
    responses: interviewState.responses,
    completedAt: new Date().toISOString()
  };
  
  localStorage.setItem('nexspark_interview', JSON.stringify(finalData));
  
  document.getElementById('statusText').innerHTML = `
    <div class="text-nexspark-gold font-header text-2xl uppercase tracking-wider mb-2">
      Interview Complete!
    </div>
    <div class="text-white/70 font-mono text-sm">
      Generating your growth strategy...
    </div>
  `;
  
  document.getElementById('micButton').style.display = 'none';
  document.getElementById('pauseBtn').classList.add('hidden');
  document.getElementById('endBtn').classList.add('hidden');
  
  // Redirect to dashboard after 2 seconds
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Voice Interview v2 initialized');
  checkAuth();
  
  // Populate waveform bars
  const waveform = document.getElementById('waveform');
  if (waveform) {
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform-bar bg-nexspark-gold/70 rounded-full transition-all';
      bar.style.width = '4px';
      bar.style.height = '10%';
      waveform.appendChild(bar);
    }
  }
});
