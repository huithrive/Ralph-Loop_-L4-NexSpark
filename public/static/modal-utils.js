// LCARS-Styled Modal Utilities for Auxora
// Replaces browser default alert() and confirm() with custom modals

console.log('✅ Modal utilities loaded');

/**
 * Show custom alert modal (replaces alert())
 */
window.showAlert = function showAlert(message, options = {}) {
  const {
    title = 'Notification',
    icon = 'fa-info-circle',
    iconColor = 'auxora-blue',
    buttonText = 'OK'
  } = options;

  return new Promise((resolve) => {
    // Remove existing modals
    const existing = document.getElementById('customAlertModal');
    if (existing) existing.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'customAlertModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm';
    modal.style.animation = 'fadeIn 0.2s ease-out';

    modal.innerHTML = `
      <div class="bg-auxora-panel border-4 border-auxora-gold rounded-2xl p-8 max-w-md mx-4 shadow-2xl" style="animation: slideUp 0.3s ease-out">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-${iconColor}/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas ${icon} text-${iconColor} text-3xl"></i>
          </div>
          <h2 class="text-2xl font-header font-bold text-white uppercase mb-3">
            ${title}
          </h2>
          <p class="text-white/80 font-mono text-sm leading-relaxed">
            ${message}
          </p>
        </div>

        <button id="alertOkButton"
                class="w-full py-3 bg-auxora-gold hover:bg-auxora-pale text-black font-header font-bold text-lg uppercase rounded-xl transition-all shadow-lg">
          ${buttonText}
        </button>
      </div>
    `;

    // Add animations if not already in DOM
    if (!document.getElementById('modalAnimations')) {
      const style = document.createElement('style');
      style.id = 'modalAnimations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    // Close on button click
    document.getElementById('alertOkButton').onclick = () => {
      modal.remove();
      resolve(true);
    };

    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(true);
      }
    };

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        resolve(true);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  });
}

/**
 * Show custom confirm modal (replaces confirm())
 */
window.showConfirm = function showConfirm(message, options = {}) {
  const {
    title = 'Confirm Action',
    icon = 'fa-question-circle',
    iconColor = 'auxora-gold',
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    confirmColor = 'auxora-gold',
    danger = false
  } = options;

  const finalIcon = danger ? 'fa-exclamation-triangle' : icon;
  const finalIconColor = danger ? 'auxora-red' : iconColor;
  const finalConfirmColor = danger ? 'auxora-red' : confirmColor;

  return new Promise((resolve) => {
    // Remove existing modals
    const existing = document.getElementById('customConfirmModal');
    if (existing) existing.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'customConfirmModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm';
    modal.style.animation = 'fadeIn 0.2s ease-out';

    modal.innerHTML = `
      <div class="bg-auxora-panel border-4 border-${finalIconColor} rounded-2xl p-8 max-w-md mx-4 shadow-2xl" style="animation: slideUp 0.3s ease-out">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-${finalIconColor}/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas ${finalIcon} text-${finalIconColor} text-3xl"></i>
          </div>
          <h2 class="text-2xl font-header font-bold text-white uppercase mb-3">
            ${title}
          </h2>
          <p class="text-white/80 font-mono text-sm leading-relaxed">
            ${message}
          </p>
        </div>

        <div class="flex gap-3">
          <button id="confirmCancelButton"
                  class="flex-1 py-3 bg-auxora-dark border-2 border-white/30 hover:border-white/50 text-white font-header font-bold text-lg uppercase rounded-xl transition-all">
            <i class="fas fa-times mr-2"></i>${cancelText}
          </button>
          <button id="confirmOkButton"
                  class="flex-1 py-3 bg-${finalConfirmColor} ${danger ? 'hover:bg-red-600' : 'hover:bg-auxora-pale'} text-${danger ? 'white' : 'black'} font-header font-bold text-lg uppercase rounded-xl transition-all shadow-lg">
            <i class="fas fa-check mr-2"></i>${confirmText}
          </button>
        </div>
      </div>
    `;

    // Add animations if not already in DOM
    if (!document.getElementById('modalAnimations')) {
      const style = document.createElement('style');
      style.id = 'modalAnimations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    // Handle confirm
    document.getElementById('confirmOkButton').onclick = () => {
      modal.remove();
      resolve(true);
    };

    // Handle cancel
    document.getElementById('confirmCancelButton').onclick = () => {
      modal.remove();
      resolve(false);
    };

    // Close on overlay click (cancel)
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    };

    // Close on Escape key (cancel)
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        resolve(false);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  });
}

/**
 * Show error modal (red theme)
 */
window.showError = function showError(message, title = 'Error') {
  return showAlert(message, {
    title,
    icon: 'fa-exclamation-circle',
    iconColor: 'auxora-red',
    buttonText: 'OK'
  });
}

/**
 * Show success modal (green theme)
 */
window.showSuccess = function showSuccess(message, title = 'Success') {
  return showAlert(message, {
    title,
    icon: 'fa-check-circle',
    iconColor: 'green-500',
    buttonText: 'OK'
  });
}

/**
 * Show warning modal (yellow theme)
 */
window.showWarning = function showWarning(message, title = 'Warning') {
  return showAlert(message, {
    title,
    icon: 'fa-exclamation-triangle',
    iconColor: 'yellow-500',
    buttonText: 'OK'
  });
}