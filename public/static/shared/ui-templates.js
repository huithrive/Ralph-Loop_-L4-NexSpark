/**
 * UI Templates and Components
 * Reusable UI patterns following DRY principles
 */

const InterviewUI = {
  /**
   * Status templates for interview recording states
   */
  statusTemplates: {
    ready: {
      title: 'Ready to Record',
      subtitle: 'Hold button to speak • Release to transcribe • Record again to add more',
      titleColor: 'auxora-gold',
      subtitleColor: 'auxora-blue',
      icon: 'fa-microphone',
      buttonClass: 'mic-button',
      iconColor: 'black'
    },
    listening: {
      title: 'Recording...',
      subtitle: 'Release when finished speaking',
      titleColor: 'auxora-blue',
      subtitleColor: 'white/70',
      icon: 'fa-microphone',
      buttonClass: 'mic-button listening',
      iconColor: 'black'
    },
    processing: {
      title: 'Transcribing...',
      subtitle: 'Converting speech to text',
      titleColor: 'auxora-purple',
      subtitleColor: 'white/70',
      icon: 'fa-spinner',
      buttonClass: 'mic-button processing',
      iconColor: 'black'
    }
  },

  /**
   * Render status display
   * @param {string} state - State key (ready, listening, processing)
   * @param {HTMLElement} statusElement - Status text container
   * @param {HTMLElement} buttonElement - Microphone button (optional)
   * @param {HTMLElement} iconElement - Icon element (optional)
   */
  renderStatus(state, statusElement, buttonElement = null, iconElement = null) {
    const template = this.statusTemplates[state];
    if (!template) {
      console.error(`Unknown status: ${state}`);
      return;
    }

    // Update status text
    if (statusElement) {
      statusElement.innerHTML = `
        <div class="text-${template.titleColor} font-header text-2xl uppercase tracking-wider mb-2">
          ${template.title}
        </div>
        <div class="text-${template.subtitleColor} font-mono text-sm">
          ${template.subtitle}
        </div>
      `;
    }

    // Update button class
    if (buttonElement) {
      buttonElement.className = template.buttonClass;
    }

    // Update icon
    if (iconElement) {
      iconElement.className = `fas ${template.icon} text-${template.iconColor} text-5xl`;
    }
  },

  /**
   * Update progress bar
   * @param {number} percent - Progress percentage (0-100)
   * @param {HTMLElement} progressBar - Progress bar element
   */
  updateProgress(percent, progressBar) {
    if (!progressBar) return;
    progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  },

  /**
   * Show alert message
   * @param {string} message - Alert message
   * @param {string} type - Alert type (info, success, warning, error)
   */
  showAlert(message, type = 'info') {
    const colors = {
      info: 'auxora-blue',
      success: 'auxora-gold',
      warning: 'auxora-purple',
      error: 'auxora-red'
    };

    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle'
    };

    const color = colors[type] || colors.info;
    const icon = icons[type] || icons.info;

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 z-50 bg-${color} text-black px-6 py-4 rounded-lg shadow-2xl animate-fade-in`;
    alert.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${icon} text-xl"></i>
        <span class="font-mono font-bold">${message}</span>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.3s';
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  },

  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback for confirm action
   * @param {Function} onCancel - Callback for cancel action
   */
  showConfirm(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-auxora-panel border-2 border-auxora-gold rounded-xl p-8 max-w-md">
        <div class="mb-6">
          <i class="fas fa-question-circle text-5xl text-auxora-gold mb-4"></i>
          <p class="text-white font-mono text-lg">${message}</p>
        </div>
        <div class="flex gap-4">
          <button id="confirmBtn" class="flex-1 px-6 py-3 bg-auxora-gold text-black font-header uppercase rounded-lg hover:bg-auxora-pale transition-all">
            Confirm
          </button>
          <button id="cancelBtn" class="flex-1 px-6 py-3 bg-auxora-dark border-2 border-auxora-blue/30 text-auxora-blue font-header uppercase rounded-lg hover:border-auxora-blue transition-all">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    modal.querySelector('#confirmBtn').onclick = () => {
      modal.remove();
      if (onConfirm) onConfirm();
    };

    modal.querySelector('#cancelBtn').onclick = () => {
      modal.remove();
      if (onCancel) onCancel();
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        if (onCancel) onCancel();
      }
    };
  },

  /**
   * Show loading spinner
   * @param {string} message - Loading message
   * @returns {Object} - Object with remove() method
   */
  showLoading(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center';
    loader.innerHTML = `
      <div class="bg-auxora-panel border-2 border-auxora-gold rounded-xl p-8 text-center">
        <div class="w-16 h-16 border-4 border-auxora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-auxora-gold font-header text-xl uppercase tracking-wider">${message}</p>
      </div>
    `;

    document.body.appendChild(loader);

    return {
      remove: () => loader.remove(),
      updateMessage: (newMessage) => {
        const messageEl = loader.querySelector('p');
        if (messageEl) messageEl.textContent = newMessage;
      }
    };
  },

  /**
   * Format question display
   * @param {Object} question - Question object {index, text, number, total}
   * @param {HTMLElement} element - Element to update
   */
  displayQuestion(question, element) {
    if (!element || !question) return;

    element.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="shrink-0">
          <i class="fas fa-question-circle text-3xl text-auxora-blue"></i>
        </div>
        <div class="flex-1">
          <div class="text-auxora-blue font-mono text-xs uppercase tracking-wider mb-2">
            Question ${question.number} of ${question.total}:
          </div>
          <p class="text-white text-lg font-mono leading-relaxed">
            ${question.text}
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Format countdown timer display
   * @param {number} seconds - Seconds remaining
   * @param {HTMLElement} element - Element to update
   */
  displayCountdown(seconds, element) {
    if (!element) return;

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = minutes > 0
      ? `${minutes}:${secs.toString().padStart(2, '0')}`
      : `${secs}`;

    element.textContent = formatted;
  }
};

/**
 * Form validation helpers
 */
const FormValidation = {
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate non-empty string
   */
  isNonEmpty(value) {
    return value && value.trim().length > 0;
  },

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Show validation error on input
   */
  showError(inputElement, message) {
    inputElement.classList.add('border-auxora-red');

    // Remove existing error
    const existingError = inputElement.parentElement.querySelector('.validation-error');
    if (existingError) existingError.remove();

    // Add error message
    const error = document.createElement('div');
    error.className = 'validation-error text-auxora-red font-mono text-xs mt-1';
    error.textContent = message;
    inputElement.parentElement.appendChild(error);
  },

  /**
   * Clear validation error
   */
  clearError(inputElement) {
    inputElement.classList.remove('border-auxora-red');
    const error = inputElement.parentElement.querySelector('.validation-error');
    if (error) error.remove();
  }
};
