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
  
  // Load interview history
  loadInterviewHistory();
  
  // Load reports
  loadReports();
}

// Load interview history from database
async function loadInterviewHistory() {
  try {
    const user = checkAuth();
    if (!user) return;
    
    const response = await fetch(`/api/interview/history?userId=${encodeURIComponent(user.email)}`);
    const data = await response.json();
    
    if (data.success && data.interviews) {
      displayInterviewHistory(data.interviews);
    }
  } catch (error) {
    console.error('Failed to load interview history:', error);
  }
}

// Display interview history in the dashboard
function displayInterviewHistory(interviews) {
  const historyContainer = document.getElementById('interviewHistory');
  if (!historyContainer) return;
  
  if (!interviews || interviews.length === 0) {
    historyContainer.innerHTML = `
      <div class="text-center py-12 text-white/50">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p class="font-mono text-sm">No interviews yet. Start your first interview!</p>
      </div>
    `;
    return;
  }
  
  // Sort by created_at descending (newest first)
  const sortedInterviews = interviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  historyContainer.innerHTML = sortedInterviews.map((interview, index) => {
    const date = new Date(interview.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const statusClass = interview.completed ? 'status-completed' : 'status-pending';
    const statusText = interview.completed ? 'COMPLETED' : 'IN PROGRESS';
    const borderColor = interview.completed ? 'border-nexspark-gold' : 'border-nexspark-blue';
    
    return `
      <div class="bg-nexspark-panel border-l-4 ${borderColor} p-6 backdrop-blur-sm hover:bg-nexspark-panel/80 transition-all">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="status-indicator ${statusClass}"></span>
              <h3 class="text-xl font-header font-bold text-white uppercase">
                ${formattedDate}, Version ${interview.version}
              </h3>
            </div>
            <p class="text-nexspark-blue font-mono text-xs">
              <i class="fas fa-clock mr-1"></i> ${formattedTime}
            </p>
          </div>
          <div class="text-right">
            <div class="text-nexspark-gold font-mono text-xs uppercase tracking-wider mb-1">${statusText}</div>
            <div class="text-white/50 font-mono text-xs">
              ${interview.question_count || 0}/10 Questions
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button onclick="viewInterview('${interview.id}')" 
                  class="lcars-btn bg-nexspark-blue hover:bg-blue-600 text-white px-4 py-2 rounded text-xs flex-1">
            <i class="fas fa-eye mr-1"></i> VIEW
          </button>
          ${interview.completed ? `
            <button onclick="analyzeInterview('${interview.id}')" 
                    class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-4 py-2 rounded text-xs flex-1">
              <i class="fas fa-rocket mr-1"></i> ANALYZE
            </button>
          ` : `
            <button onclick="continueInterview('${interview.id}')" 
                    class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-4 py-2 rounded text-xs flex-1">
              <i class="fas fa-play mr-1"></i> CONTINUE
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// View interview details
async function viewInterview(interviewId) {
  try {
    const response = await fetch(`/api/interview/${interviewId}`);
    const data = await response.json();
    
    if (data.success && data.interview) {
      showInterviewModal(data.interview);
    }
  } catch (error) {
    console.error('Failed to load interview:', error);
    alert('Failed to load interview details');
  }
}

// Continue an incomplete interview
function continueInterview(interviewId) {
  localStorage.setItem('nexspark_continue_interview', interviewId);
  window.location.href = '/interview';
}

// Analyze a completed interview
async function analyzeInterview(interviewId) {
  try {
    // Load the interview from database
    const response = await fetch(`/api/interview/${interviewId}`);
    const data = await response.json();
    
    if (data.success && data.interview) {
      const interview = data.interview;
      
      // Parse responses if string
      const responses = typeof interview.responses === 'string' 
        ? JSON.parse(interview.responses) 
        : interview.responses;
      
      // Extract company name and website from first response
      const firstResponse = responses[0]?.answer || '';
      const websiteMatch = firstResponse.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      const detectedWebsite = websiteMatch ? websiteMatch[0] : '';
      
      const companyMatch = firstResponse.match(/(?:company name|called|named)\s+(?:is\s+)?([A-Z][a-zA-Z\s&]+?)(?:\s+and|\s+which|\.|,|$)/i);
      const detectedCompany = companyMatch ? companyMatch[1].trim() : '';
      
      if (!detectedWebsite) {
        alert('No website URL found in interview. Please complete a new interview with your website.');
        return;
      }
      
      // Save to localStorage for analysis
      const interviewData = {
        id: interview.id,
        companyName: detectedCompany,
        website: detectedWebsite,
        responses: responses,
        completed: true,
        completedAt: interview.completed_at || interview.created_at
      };
      
      localStorage.setItem('nexspark_interview', JSON.stringify(interviewData));
      
      // Redirect to strategy analysis
      window.location.href = '/strategy-analysis';
    }
  } catch (error) {
    console.error('Failed to load interview:', error);
    alert('Failed to load interview. Please try again.');
  }
}

// Show interview modal
function showInterviewModal(interview) {
  const responses = typeof interview.responses === 'string' ? JSON.parse(interview.responses) : interview.responses;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  const date = new Date(interview.created_at);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  modal.innerHTML = `
    <div class="bg-nexspark-panel border border-nexspark-gold max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
      <div class="sticky top-0 bg-nexspark-dark border-b border-nexspark-gold p-6 z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-header font-bold text-nexspark-gold uppercase">
              Interview - ${formattedDate}
            </h2>
            <p class="text-nexspark-blue font-mono text-sm mt-1">Version ${interview.version}</p>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="lcars-btn bg-nexspark-red hover:bg-red-700 text-white px-4 py-2 rounded">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="p-6 space-y-4">
        ${responses.map((r, i) => `
          <div class="bg-nexspark-dark/50 border border-nexspark-blue/30 p-4 rounded">
            <div class="flex items-start gap-3 mb-2">
              <span class="text-nexspark-gold font-header text-lg">${i + 1}.</span>
              <div class="flex-1">
                <p class="text-nexspark-blue font-mono text-sm mb-2">${r.question}</p>
                <p class="text-white font-sans">${r.answer || '<em class="text-white/50">No response recorded</em>'}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
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
      <div class="mt-4 mb-4 text-nexspark-blue font-mono text-xs">
        <i class="fas fa-check-circle mr-1"></i> COMPLETED ${new Date(interview.completedAt).toLocaleDateString()}
      </div>
      <div class="mt-4">
        <button onclick="proceedToAnalysis()" class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-4 py-2 rounded-lg text-sm w-full">
          <i class="fas fa-rocket mr-1"></i> START ANALYSIS
        </button>
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

// Proceed to analysis (for completed interviews)
function proceedToAnalysis() {
  const interviewData = localStorage.getItem('nexspark_interview');
  if (!interviewData) {
    alert('No interview data found. Please complete an interview first.');
    return;
  }
  
  try {
    const interview = JSON.parse(interviewData);
    
    // Check if interview has company name and website
    if (!interview.companyName || !interview.website) {
      // Extract from first response
      const firstResponse = interview.responses[0]?.answer || '';
      const websiteMatch = firstResponse.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      const detectedWebsite = websiteMatch ? websiteMatch[0] : '';
      
      const companyMatch = firstResponse.match(/(?:company name|called|named)\s+(?:is\s+)?([A-Z][a-zA-Z\s&]+?)(?:\s+and|\s+which|\.|,|$)/i);
      const detectedCompany = companyMatch ? companyMatch[1].trim() : '';
      
      if (!detectedWebsite) {
        alert('Please provide your website URL in the interview to continue with analysis.');
        return;
      }
      
      // Save extracted data
      interview.companyName = detectedCompany;
      interview.website = detectedWebsite;
      localStorage.setItem('nexspark_interview', JSON.stringify(interview));
    }
    
    // Redirect to strategy analysis
    window.location.href = '/strategy-analysis';
  } catch (e) {
    console.error('Failed to parse interview data:', e);
    alert('Failed to load interview data. Please try again.');
  }
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

// Load reports from localStorage
function loadReports() {
  const reportReady = localStorage.getItem('nexspark_report_ready');
  const reportData = localStorage.getItem('nexspark_report_data');
  const summaryData = localStorage.getItem('nexspark_summary');
  
  if (reportReady === 'true' && (reportData || summaryData)) {
    const reportsSection = document.getElementById('reportsSection');
    const reportsList = document.getElementById('reportsList');
    
    if (reportsSection && reportsList) {
      reportsSection.classList.remove('hidden');
      
      const timestamp = localStorage.getItem('nexspark_report_timestamp');
      const date = timestamp ? new Date(timestamp) : new Date();
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get summary to extract brand name
      let brandName = 'Your Company';
      try {
        const summary = JSON.parse(summaryData);
        brandName = summary.brandName || summary.companyName || 'Your Company';
      } catch (e) {}
      
      reportsList.innerHTML = `
        <div class="bg-nexspark-panel border-l-4 border-nexspark-gold p-6 backdrop-blur-sm">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="status-indicator status-completed"></span>
                <h3 class="text-xl font-header font-bold text-white uppercase">
                  ${brandName} - Growth Strategy Report
                </h3>
              </div>
              <p class="text-nexspark-blue font-mono text-xs">
                <i class="fas fa-clock mr-1"></i> Generated ${formattedDate}
              </p>
            </div>
            <div class="text-right">
              <div class="text-nexspark-gold font-mono text-xs uppercase tracking-wider mb-1">READY</div>
              <div class="text-white/50 font-mono text-xs">
                Complete Report
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="viewReportInline()" 
                    class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-4 py-2 rounded text-xs flex-1">
              <i class="fas fa-eye mr-1"></i> VIEW REPORT
            </button>
            <button onclick="downloadReportPDF()" 
                    class="lcars-btn bg-nexspark-blue hover:bg-blue-600 text-white px-4 py-2 rounded text-xs flex-1">
              <i class="fas fa-download mr-1"></i> DOWNLOAD PDF
            </button>
          </div>
        </div>
      `;
    }
  }
}

// View report inline (Slack-like)
function viewReportInline() {
  const summaryData = localStorage.getItem('nexspark_summary');
  if (!summaryData) {
    alert('No report data found');
    return;
  }
  
  try {
    const summary = JSON.parse(summaryData);
    showReportModal(summary);
  } catch (e) {
    console.error('Failed to load report:', e);
    alert('Failed to load report');
  }
}

// Show report in Slack-like modal
function showReportModal(summary) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  const brandName = summary.brandName || summary.companyName || 'Your Company';
  const timestamp = localStorage.getItem('nexspark_report_timestamp');
  const date = timestamp ? new Date(timestamp) : new Date();
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });
  
  modal.innerHTML = `
    <div class="bg-nexspark-dark border-2 border-nexspark-gold max-w-5xl w-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden">
      <!-- Header (sticky) -->
      <div class="bg-nexspark-panel border-b border-nexspark-gold p-6 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <i class="fas fa-file-alt text-nexspark-gold text-3xl"></i>
            <div>
              <h2 class="text-2xl font-header font-bold text-white uppercase">
                Growth Strategy Report
              </h2>
              <p class="text-nexspark-blue font-mono text-sm mt-1">${brandName} • ${formattedDate}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="downloadReportPDF()" class="lcars-btn bg-nexspark-blue hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              <i class="fas fa-download mr-1"></i> DOWNLOAD
            </button>
            <button onclick="this.closest('.fixed').remove()" class="lcars-btn bg-nexspark-red hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Report Content (scrollable) -->
      <div class="flex-1 overflow-y-auto p-8 space-y-8">
        
        <!-- Executive Summary -->
        <div class="bg-nexspark-panel border-l-4 border-nexspark-gold p-6 rounded-r-lg">
          <h3 class="text-2xl font-header font-bold text-nexspark-gold uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-lightbulb"></i>
            Executive Summary
          </h3>
          <div class="space-y-4 text-white/90 font-mono text-sm">
            <div>
              <span class="text-nexspark-blue font-bold">Brand:</span> ${brandName}
            </div>
            <div>
              <span class="text-nexspark-blue font-bold">Product:</span> ${summary.productDescription || 'N/A'}
            </div>
            <div>
              <span class="text-nexspark-blue font-bold">Current Revenue:</span> ${summary.currentRevenue || 'N/A'}
            </div>
            <div>
              <span class="text-nexspark-blue font-bold">6-Month Goal:</span> ${summary.sixMonthGoal || 'N/A'}
            </div>
            <div>
              <span class="text-nexspark-blue font-bold">Biggest Challenge:</span> ${summary.biggestChallenge || 'N/A'}
            </div>
          </div>
        </div>
        
        <!-- Marketing Channels -->
        <div class="bg-nexspark-panel border-l-4 border-nexspark-blue p-6 rounded-r-lg">
          <h3 class="text-2xl font-header font-bold text-nexspark-blue uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-chart-line"></i>
            Current Marketing Channels
          </h3>
          <div class="text-white/90 font-mono text-sm">
            ${summary.marketingChannels || 'Not specified'}
          </div>
          ${summary.bestChannel ? `
            <div class="mt-4 pt-4 border-t border-white/10">
              <span class="text-nexspark-gold font-bold">Best Performing:</span> ${summary.bestChannel}
            </div>
          ` : ''}
        </div>
        
        <!-- Target Customer -->
        <div class="bg-nexspark-panel border-l-4 border-nexspark-purple p-6 rounded-r-lg">
          <h3 class="text-2xl font-header font-bold text-nexspark-purple uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-users"></i>
            Target Customer Profile
          </h3>
          <div class="text-white/90 font-mono text-sm whitespace-pre-wrap">
            ${summary.idealCustomer || 'Not specified'}
          </div>
        </div>
        
        <!-- Competitors -->
        ${summary.competitors ? `
          <div class="bg-nexspark-panel border-l-4 border-nexspark-red p-6 rounded-r-lg">
            <h3 class="text-2xl font-header font-bold text-nexspark-red uppercase mb-4 flex items-center gap-2">
              <i class="fas fa-trophy"></i>
              Key Competitors
            </h3>
            <div class="text-white/90 font-mono text-sm whitespace-pre-wrap">
              ${summary.competitors}
            </div>
          </div>
        ` : ''}
        
        <!-- Strategic Recommendations -->
        <div class="bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-lg">
          <h3 class="text-2xl font-header font-bold text-green-400 uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-rocket"></i>
            Strategic Recommendations
          </h3>
          <div class="space-y-4 text-white/90 font-mono text-sm">
            <div class="bg-nexspark-dark/50 p-4 rounded">
              <div class="text-green-400 font-bold mb-2">Priority Action:</div>
              <div>Focus on addressing "${summary.biggestChallenge}" through targeted channel optimization and strategic budget allocation.</div>
            </div>
            <div class="bg-nexspark-dark/50 p-4 rounded">
              <div class="text-nexspark-blue font-bold mb-2">Growth Path:</div>
              <div>Scale from ${summary.currentRevenue} to ${summary.sixMonthGoal} within 6 months through systematic execution.</div>
            </div>
          </div>
        </div>
        
        <!-- Next Steps -->
        <div class="bg-nexspark-gold/10 border-l-4 border-nexspark-gold p-6 rounded-r-lg">
          <h3 class="text-2xl font-header font-bold text-nexspark-gold uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-tasks"></i>
            Next Steps
          </h3>
          <ol class="space-y-3 text-white/90 font-mono text-sm">
            <li class="flex items-start gap-3">
              <span class="text-nexspark-gold font-bold flex-shrink-0">1.</span>
              <span>Review detailed competitive analysis and traffic benchmarks</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-nexspark-gold font-bold flex-shrink-0">2.</span>
              <span>Implement recommended channel strategy based on data</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-nexspark-gold font-bold flex-shrink-0">3.</span>
              <span>Allocate budget according to 6-month roadmap priorities</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-nexspark-gold font-bold flex-shrink-0">4.</span>
              <span>Track KPIs and adjust strategy based on performance data</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-nexspark-gold font-bold flex-shrink-0">5.</span>
              <span>Schedule monthly reviews to assess progress toward ${summary.sixMonthGoal} goal</span>
            </li>
          </ol>
        </div>
        
        <!-- Call to Action -->
        <div class="bg-nexspark-panel border-2 border-nexspark-gold p-6 rounded-lg text-center">
          <h3 class="text-xl font-header font-bold text-white uppercase mb-3">
            Ready to Accelerate Your Growth?
          </h3>
          <p class="text-white/70 font-mono text-sm mb-4">
            This report contains the strategic foundation. Let's discuss implementation details.
          </p>
          <button onclick="window.open('mailto:founders@nexspark.io?subject=Growth Strategy Discussion - ${encodeURIComponent(brandName)}')" 
                  class="lcars-btn bg-nexspark-gold hover:bg-nexspark-pale text-black px-8 py-3 rounded-lg text-lg">
            <i class="fas fa-envelope mr-2"></i> SCHEDULE STRATEGY CALL
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Download report as PDF
function downloadReportPDF() {
  const summaryData = localStorage.getItem('nexspark_summary');
  if (!summaryData) {
    alert('No report data found');
    return;
  }
  
  try {
    const summary = JSON.parse(summaryData);
    const brandName = summary.brandName || summary.companyName || 'Company';
    
    // Generate report content
    const reportContent = generateReportHTML(summary);
    
    // Create a blob and trigger download
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexSpark-Growth-Report-${brandName.replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showToast('Report downloaded successfully!', 'success');
  } catch (e) {
    console.error('Failed to download report:', e);
    alert('Failed to download report. Please try again.');
  }
}

// Generate report HTML for download
function generateReportHTML(summary) {
  const brandName = summary.brandName || summary.companyName || 'Your Company';
  const timestamp = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandName} - NexSpark Growth Strategy Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #FF9C00 0%, #FFD700 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
        }
        .header .subtitle {
            margin-top: 10px;
            font-size: 18px;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 30px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #FF9C00;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #FF9C00;
            margin-top: 0;
            font-size: 24px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        .field {
            margin: 15px 0;
        }
        .field-label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            min-width: 180px;
        }
        .field-value {
            color: #333;
        }
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 14px;
        }
        ol {
            padding-left: 25px;
        }
        li {
            margin: 10px 0;
        }
        @media print {
            body { background: white; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 NexSpark Growth Strategy Report</h1>
        <div class="subtitle">${brandName} • Generated ${timestamp}</div>
    </div>
    
    <div class="section">
        <h2>📊 Executive Summary</h2>
        <div class="field">
            <span class="field-label">Brand Name:</span>
            <span class="field-value">${brandName}</span>
        </div>
        <div class="field">
            <span class="field-label">Product Description:</span>
            <span class="field-value">${summary.productDescription || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Current Revenue:</span>
            <span class="field-value">${summary.currentRevenue || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">6-Month Goal:</span>
            <span class="field-value">${summary.sixMonthGoal || 'N/A'}</span>
        </div>
        <div class="field">
            <span class="field-label">Biggest Challenge:</span>
            <span class="field-value">${summary.biggestChallenge || 'N/A'}</span>
        </div>
    </div>
    
    <div class="section">
        <h2>📈 Current Marketing Channels</h2>
        <p>${summary.marketingChannels || 'Not specified'}</p>
        ${summary.bestChannel ? `<p><strong>Best Performing:</strong> ${summary.bestChannel}</p>` : ''}
    </div>
    
    <div class="section">
        <h2>👥 Target Customer Profile</h2>
        <p>${summary.idealCustomer || 'Not specified'}</p>
    </div>
    
    ${summary.competitors ? `
    <div class="section">
        <h2>🏆 Key Competitors</h2>
        <p>${summary.competitors}</p>
    </div>
    ` : ''}
    
    <div class="section">
        <h2>🎯 Strategic Recommendations</h2>
        <p><strong>Priority Action:</strong> Focus on addressing "${summary.biggestChallenge}" through targeted channel optimization and strategic budget allocation.</p>
        <p><strong>Growth Path:</strong> Scale from ${summary.currentRevenue} to ${summary.sixMonthGoal} within 6 months through systematic execution.</p>
    </div>
    
    <div class="section">
        <h2>✅ Next Steps</h2>
        <ol>
            <li>Review detailed competitive analysis and traffic benchmarks</li>
            <li>Implement recommended channel strategy based on data</li>
            <li>Allocate budget according to 6-month roadmap priorities</li>
            <li>Track KPIs and adjust strategy based on performance data</li>
            <li>Schedule monthly reviews to assess progress toward ${summary.sixMonthGoal} goal</li>
        </ol>
    </div>
    
    <div class="footer">
        <p><strong>NexSpark Growth OS</strong></p>
        <p>Your AI Growth Co-Founder • founders@nexspark.io</p>
        <p>© ${new Date().getFullYear()} NexSpark. All rights reserved.</p>
    </div>
</body>
</html>`;
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-8 right-8 z-50 px-6 py-4 rounded-lg font-mono text-sm animate-fade-in`;
  
  if (type === 'success') {
    toast.classList.add('bg-green-500', 'text-white');
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
  } else {
    toast.classList.add('bg-nexspark-blue', 'text-black');
    toast.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
