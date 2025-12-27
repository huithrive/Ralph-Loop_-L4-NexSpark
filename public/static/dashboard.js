// Initialize background animation
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

    // Grid overlay
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
  
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationFrameId);
  });
})();

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('nexspark_user');
  
  if (!user) {
    // Not logged in, redirect to home
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

// Load user data
function loadUserData() {
  const user = checkAuth();
  if (!user) return;
  
  // Display user name
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = user.name || user.email || 'Operator';
  }
  
  // Check interview status
  const interviewData = localStorage.getItem('nexspark_interview');
  if (interviewData) {
    try {
      const interview = JSON.parse(interviewData);
      updateInterviewStatus(interview);
    } catch (e) {
      console.error('Failed to parse interview data:', e);
    }
  }
}

// Update interview status card
function updateInterviewStatus(interview) {
  const interviewCard = document.getElementById('interviewCard');
  const interviewStatus = document.getElementById('interviewStatus');
  const growthPlanCard = document.getElementById('growthPlanCard');
  const growthPlanStatus = document.getElementById('growthPlanStatus');
  
  if (interview.completed) {
    interviewStatus.className = 'status-indicator status-completed';
    interviewCard.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <i class="fas fa-microphone text-3xl text-nexspark-blue"></i>
        <span class="status-indicator status-completed"></span>
      </div>
      <h3 class="text-xl font-header font-bold text-nexspark-blue uppercase mb-2">Voice Interview</h3>
      <p class="text-white/70 font-mono text-sm">Interview completed successfully</p>
      <div class="mt-4 text-nexspark-blue font-mono text-xs">
        <i class="fas fa-check-circle mr-1"></i> COMPLETED ${new Date(interview.completedAt).toLocaleDateString()}
      </div>
    `;
    
    // Show growth plan if available
    if (interview.analysis && interview.strategy) {
      growthPlanStatus.className = 'status-indicator status-completed';
      growthPlanCard.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <i class="fas fa-chart-line text-3xl text-nexspark-purple"></i>
          <span class="status-indicator status-completed"></span>
        </div>
        <h3 class="text-xl font-header font-bold text-nexspark-purple uppercase mb-2">Growth Plan</h3>
        <p class="text-white/70 font-mono text-sm">AI-generated strategy ready</p>
        <div class="mt-4">
          <button onclick="viewGrowthStrategy()" class="lcars-btn bg-nexspark-purple hover:bg-nexspark-pale text-black px-4 py-2 rounded text-xs">
            <i class="fas fa-file-alt mr-1"></i> VIEW STRATEGY
          </button>
        </div>
      `;
      
      // Show analysis summary
      displayAnalysisSummary(interview.analysis);
    } else {
      growthPlanStatus.className = 'status-indicator status-pending';
      growthPlanCard.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <i class="fas fa-chart-line text-3xl text-nexspark-purple"></i>
          <span class="status-indicator status-pending"></span>
        </div>
        <h3 class="text-xl font-header font-bold text-nexspark-purple uppercase mb-2">Growth Plan</h3>
        <p class="text-white/70 font-mono text-sm">Being prepared by our team</p>
        <div class="mt-4 text-nexspark-purple font-mono text-xs">
          <i class="fas fa-clock mr-1"></i> PROCESSING
        </div>
      `;
    }
  }
}

// Display analysis summary
function displayAnalysisSummary(analysis) {
  const systemInfo = document.querySelector('.bg-nexspark-blue\\/10.border-l-4');
  if (!systemInfo) return;
  
  const summaryHTML = `
    <div class="bg-nexspark-purple/10 border-l-4 border-nexspark-purple p-6 rounded-r-lg backdrop-blur-sm mt-6">
      <div class="flex items-start gap-3">
        <i class="fas fa-lightbulb text-nexspark-purple text-xl mt-1"></i>
        <div class="flex-1">
          <div class="text-nexspark-purple font-mono text-xs uppercase tracking-widest mb-3">
            Growth Analysis Summary
          </div>
          
          <div class="space-y-4">
            <!-- Brand Profile -->
            <div>
              <h4 class="text-white font-header text-sm uppercase mb-2">Your Brand</h4>
              <div class="text-white/70 font-mono text-xs space-y-1">
                <p><span class="text-nexspark-blue">Industry:</span> ${analysis.brandProfile.industry}</p>
                <p><span class="text-nexspark-blue">Stage:</span> ${analysis.brandProfile.stage}</p>
                <p><span class="text-nexspark-blue">Current Channels:</span> ${analysis.brandProfile.currentChannels.join(', ')}</p>
              </div>
            </div>
            
            <!-- Main Challenges -->
            <div>
              <h4 class="text-white font-header text-sm uppercase mb-2">Main Challenges</h4>
              <ul class="text-white/70 font-mono text-xs space-y-1">
                ${analysis.brandProfile.mainChallenges.map(c => `<li><i class="fas fa-chevron-right text-nexspark-gold mr-2"></i>${c}</li>`).join('')}
              </ul>
            </div>
            
            <!-- Recommendations -->
            <div>
              <h4 class="text-white font-header text-sm uppercase mb-2">Priority Actions</h4>
              <div class="text-white/70 font-mono text-xs space-y-1">
                <p class="text-nexspark-gold mb-2">${analysis.recommendations.priority}</p>
                <p><span class="text-nexspark-blue">Recommended Channels:</span> ${analysis.recommendations.channels.join(', ')}</p>
                <p><span class="text-nexspark-blue">Budget Range:</span> ${analysis.recommendations.budget}</p>
                <p><span class="text-nexspark-blue">Timeline:</span> ${analysis.recommendations.timeline}</p>
              </div>
            </div>
            
            <!-- Next Steps -->
            <div>
              <h4 class="text-white font-header text-sm uppercase mb-2">Next Steps</h4>
              <ol class="text-white/70 font-mono text-xs space-y-1 pl-5">
                ${analysis.nextSteps ? analysis.nextSteps.map((step, i) => `<li>${i+1}. ${step}</li>`).join('') : ''}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  systemInfo.insertAdjacentHTML('afterend', summaryHTML);
}

// View full growth strategy in modal
function viewGrowthStrategy() {
  const interviewData = localStorage.getItem('nexspark_interview');
  if (!interviewData) return;
  
  try {
    const interview = JSON.parse(interviewData);
    if (!interview.strategy) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-black border-2 border-nexspark-purple rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-black border-b-2 border-nexspark-purple p-6 flex items-center justify-between">
          <h2 class="text-2xl font-header font-bold text-nexspark-purple uppercase">
            <i class="fas fa-file-alt mr-2"></i> Your Growth Strategy
          </h2>
          <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-nexspark-purple">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="prose prose-invert max-w-none">
            <div class="text-white/90 font-mono text-sm whitespace-pre-wrap leading-relaxed">
${interview.strategy}
            </div>
          </div>
          <div class="mt-8 flex gap-4">
            <button onclick="downloadStrategy()" class="lcars-btn bg-nexspark-blue hover:bg-white text-black px-6 py-3 rounded">
              <i class="fas fa-download mr-2"></i> DOWNLOAD PDF
            </button>
            <button onclick="scheduleCall()" class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-6 py-3 rounded">
              <i class="fas fa-calendar mr-2"></i> SCHEDULE CALL
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (e) {
    console.error('Failed to load strategy:', e);
    alert('Failed to load growth strategy');
  }
}

// Download strategy as PDF (placeholder)
function downloadStrategy() {
  alert('PDF download feature coming soon! For now, you can copy the text or take a screenshot.');
}

// Schedule call (placeholder)
function scheduleCall() {
  alert('Scheduling feature coming soon! Please email founders@nexspark.io to schedule a call.');
}

// Start interview
function startInterview() {
  const user = checkAuth();
  if (!user) return;
  
  // Redirect to interview page
  window.location.href = '/interview';
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('nexspark_user');
    localStorage.removeItem('nexspark_interview');
    window.location.href = '/';
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  
  console.log('%c⚡ NEXSPARK DASHBOARD', 'color: #FF9C00; font-size: 20px; font-weight: bold; font-family: Antonio;');
  console.log('%cMISSION CONTROL ONLINE', 'color: #99CCFF; font-family: JetBrains Mono;');
});
