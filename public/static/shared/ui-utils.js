/**
 * Shared UI utilities
 */

/**
 * Show a simple alert modal
 */
function showAlert(message, options = {}) {
  const {
    title = 'Alert',
    icon = 'fa-info-circle',
    iconColor = 'nexspark-blue',
  } = options;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
  modal.style.animation = 'fadeIn 0.3s ease-out';

  modal.innerHTML = `
    <div class="bg-nexspark-panel border-4 border-${iconColor} rounded-2xl p-8 max-w-md mx-4 shadow-2xl" style="animation: slideUp 0.3s ease-out">
      <div class="text-center">
        <div class="w-20 h-20 bg-${iconColor}/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas ${icon} text-${iconColor} text-4xl"></i>
        </div>
        <h2 class="text-2xl font-header font-bold text-white uppercase mb-4">${title}</h2>
        <p class="text-white/80 font-mono text-sm mb-6">${message}</p>
        <button onclick="this.closest('.fixed').remove()" class="w-full py-3 bg-${iconColor} hover:bg-${iconColor}/80 text-black font-header font-bold text-lg uppercase rounded-xl transition-all">
          OK
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

/**
 * Show a confirmation dialog
 */
async function showConfirm(message, options = {}) {
  const {
    title = 'Confirm',
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    icon = 'fa-question-circle',
    iconColor = 'nexspark-gold',
    danger = false,
  } = options;

  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.style.animation = 'fadeIn 0.3s ease-out';

    const confirmColor = danger ? 'nexspark-red' : iconColor;

    modal.innerHTML = `
      <div class="bg-nexspark-panel border-4 border-${iconColor} rounded-2xl p-8 max-w-md mx-4 shadow-2xl" style="animation: slideUp 0.3s ease-out">
        <div class="text-center">
          <div class="w-20 h-20 bg-${iconColor}/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas ${icon} text-${iconColor} text-4xl"></i>
          </div>
          <h2 class="text-2xl font-header font-bold text-white uppercase mb-4">${title}</h2>
          <p class="text-white/80 font-mono text-sm mb-6">${message}</p>
          <div class="flex gap-3">
            <button class="cancel-btn flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-header font-bold text-lg uppercase rounded-xl transition-all">
              ${cancelText}
            </button>
            <button class="confirm-btn flex-1 py-3 bg-${confirmColor} hover:bg-${confirmColor}/80 text-black font-header font-bold text-lg uppercase rounded-xl transition-all">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });

    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });

    document.body.appendChild(modal);
  });
}

/**
 * Show error message
 */
function showError(message) {
  showAlert(message, {
    title: 'Error',
    icon: 'fa-exclamation-triangle',
    iconColor: 'nexspark-red',
  });
}

/**
 * Show success message
 */
function showSuccess(message) {
  showAlert(message, {
    title: 'Success',
    icon: 'fa-check-circle',
    iconColor: 'green-500',
  });
}

/**
 * Show loading spinner
 */
function showLoading(message = 'Loading...') {
  const modal = document.createElement('div');
  modal.id = 'loadingModal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';

  modal.innerHTML = `
    <div class="bg-nexspark-panel border-2 border-nexspark-gold rounded-2xl p-8 text-center">
      <i class="fas fa-spinner fa-spin text-nexspark-gold text-6xl mb-4"></i>
      <p class="text-white font-mono text-lg">${message}</p>
    </div>
  `;

  document.body.appendChild(modal);
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  const modal = document.getElementById('loadingModal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Format currency
 */
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format date
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
