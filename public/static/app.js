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
document.getElementById('brandForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
  
  try {
    const response = await axios.post('/api/register/brand', data);
    
    const messageEl = document.getElementById('brandFormMessage');
    messageEl.classList.remove('hidden');
    messageEl.className = 'mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-300';
    messageEl.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-check-circle text-2xl mr-3 mt-1"></i>
        <div>
          <strong class="block mb-1">Success!</strong>
          <p>${response.data.message}</p>
          <p class="mt-2 text-sm">We'll reach out within 24 hours to schedule your Digital Leon consultation.</p>
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
    messageEl.className = 'mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300';
    messageEl.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-exclamation-circle text-2xl mr-3 mt-1"></i>
        <div>
          <strong class="block mb-1">Error</strong>
          <p>${error.response?.data?.message || 'Registration failed. Please try again.'}</p>
        </div>
      </div>
    `;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

// Agency form submission
document.getElementById('agencyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
  
  try {
    const response = await axios.post('/api/register/agency', data);
    
    const messageEl = document.getElementById('agencyFormMessage');
    messageEl.classList.remove('hidden');
    messageEl.className = 'mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-300';
    messageEl.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-check-circle text-2xl mr-3 mt-1"></i>
        <div>
          <strong class="block mb-1">Application Received!</strong>
          <p>${response.data.message}</p>
          <p class="mt-2 text-sm">Our Digital Leon AI will review your profile and we'll contact you with next steps.</p>
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
    messageEl.className = 'mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300';
    messageEl.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-exclamation-circle text-2xl mr-3 mt-1"></i>
        <div>
          <strong class="block mb-1">Error</strong>
          <p>${error.response?.data?.message || 'Application failed. Please try again.'}</p>
        </div>
      </div>
    `;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

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

// Add scroll animation effects
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe sections for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});

// Add dynamic stats counter animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Initialize on page load
console.log('NexSpark Landing Page initialized');
console.log('Ready to transform growth for brands and agencies!');
