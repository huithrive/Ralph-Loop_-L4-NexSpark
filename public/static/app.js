// Animated Starfield Background (Star Trek Warp Effect)
(() => {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  let animationFrameId;

  // Star Trek "Warp" / Data Stream Effect
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
    // Create trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    const cx = width / 2;
    const cy = height / 2;

    stars.forEach(star => {
      // Move star closer
      star.z -= 4; // Speed
      if (star.z <= 0) {
        star.z = width;
        star.x = (Math.random() - 0.5) * width;
        star.y = (Math.random() - 0.5) * height;
      }

      const x = (star.x / star.z) * width + cx;
      const y = (star.y / star.z) * height + cy;
      
      // Calculate size based on depth
      const rawSize = (1 - star.z / width) * 3;
      const size = Math.max(0, rawSize);

      if (x >= 0 && x <= width && y >= 0 && y <= height && size > 0) {
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Grid Overlay (Holodeck style)
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
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationFrameId);
  });
})();

// Modal management
function openModal(type) {
  const modal = document.getElementById(`${type}Modal`);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(type) {
  const modal = document.getElementById(`${type}Modal`);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Clear form and message
    const form = document.getElementById(`${type}Form`);
    const message = document.getElementById(`${type}FormMessage`);
    if (form) form.reset();
    if (message) {
      message.classList.add('hidden');
      message.innerHTML = '';
    }
  }
}

// Google Sign-In (Simulated - requires actual OAuth setup)
function signInWithGoogle() {
  // In production, this would redirect to Google OAuth
  // For demo, simulate successful authentication
  const mockUser = {
    id: 'usr_' + Date.now(),
    email: 'demo@nexspark.com',
    name: 'Demo User',
    picture: 'https://via.placeholder.com/150',
    created_at: new Date().toISOString()
  };
  
  // Save user data
  localStorage.setItem('nexspark_user', JSON.stringify(mockUser));
  
  // Show success message
  showSuccess('Successfully signed in! Redirecting to dashboard...', 'Welcome');
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.id === 'brandModal' || e.target.id === 'agencyModal') {
    const modalType = e.target.id === 'brandModal' ? 'brand' : 'agency';
    closeModal(modalType);
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal('brand');
    closeModal('agency');
  }
});

// Brand form submission
const brandForm = document.getElementById('brandForm');
if (brandForm) {
  brandForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>TRANSMITTING...';

    try {
      const response = await axios.post('/api/register/brand', data);

      const messageEl = document.getElementById('brandFormMessage');
      messageEl.classList.remove('hidden');
      messageEl.className = 'mt-4 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg text-green-300';
      messageEl.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="fas fa-check-circle text-2xl"></i>
          <div class="font-mono">
            <strong class="block mb-2 text-lg uppercase tracking-wider">✓ Registration Successful!</strong>
            <p class="text-sm">${response.data.message}</p>
            <p class="mt-2 text-xs opacity-75">Digital Leon will contact you within 24 hours to schedule your growth diagnosis.</p>
          </div>
        </div>
      `;

      e.target.reset();

      // Auto-close after 3 seconds
      setTimeout(() => {
        closeModal('brand');
      }, 3000);

    } catch (error) {
      const messageEl = document.getElementById('brandFormMessage');
      messageEl.classList.remove('hidden');
      messageEl.className = 'mt-4 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-300';
      messageEl.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-circle text-2xl"></i>
          <div class="font-mono">
            <strong class="block mb-2 text-lg uppercase tracking-wider">✗ System Error</strong>
            <p class="text-sm">${error.response?.data?.message || 'Registration failed. Please try again.'}</p>
          </div>
        </div>
      `;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
}

// Agency form submission
const agencyForm = document.getElementById('agencyForm');
if (agencyForm) {
  agencyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>TRANSMITTING...';

    try {
      const response = await axios.post('/api/register/agency', data);

      const messageEl = document.getElementById('agencyFormMessage');
      messageEl.classList.remove('hidden');
      messageEl.className = 'mt-4 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg text-green-300';
      messageEl.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="fas fa-check-circle text-2xl"></i>
          <div class="font-mono">
            <strong class="block mb-2 text-lg uppercase tracking-wider">✓ Application Received!</strong>
            <p class="text-sm">${response.data.message}</p>
            <p class="mt-2 text-xs opacity-75">Our Digital Leon AI will review your profile and contact you with next steps.</p>
          </div>
        </div>
      `;

      e.target.reset();

      // Auto-close after 3 seconds
      setTimeout(() => {
        closeModal('agency');
      }, 3000);

    } catch (error) {
      const messageEl = document.getElementById('agencyFormMessage');
      messageEl.classList.remove('hidden');
      messageEl.className = 'mt-4 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-300';
      messageEl.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-circle text-2xl"></i>
          <div class="font-mono">
            <strong class="block mb-2 text-lg uppercase tracking-wider">✗ System Error</strong>
            <p class="text-sm">${error.response?.data?.message || 'Application failed. Please try again.'}</p>
          </div>
        </div>
      `;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Initialize
console.log('%c⚡ NEXSPARK GROWTH OS - v2.0', 'color: #FF9C00; font-size: 20px; font-weight: bold; font-family: Antonio;');
console.log('%cSYSTEM ONLINE | AI LAYER ACTIVE | ESCROW VAULT SECURED', 'color: #99CCFF; font-family: JetBrains Mono;');
console.log('%cReady to transform growth for brands and agencies!', 'color: #CC99CC; font-family: JetBrains Mono;');
