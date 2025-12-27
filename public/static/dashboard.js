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
        <i class="fas fa-check-circle mr-1"></i> COMPLETED
      </div>
    `;
    
    // Unlock growth plan
    // TODO: Enable growth plan card
  }
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
