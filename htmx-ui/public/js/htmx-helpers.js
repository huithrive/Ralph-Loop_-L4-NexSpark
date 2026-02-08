document.addEventListener('DOMContentLoaded', function () {
  initCharts();
  initToasts();
  initMobileNav();
});

document.addEventListener('htmx:afterSwap', function (event) {
  initCharts(event.detail.target);
});

document.addEventListener('htmx:responseError', function (event) {
  showToast('Request failed. Please try again.', 'error');
});

document.addEventListener('htmx:sendError', function () {
  showToast('Network error. Check your connection.', 'error');
});

function initCharts(scope) {
  const root = scope || document;
  root.querySelectorAll('[data-chart]').forEach(function (el) {
    if (el._chartInstance) {
      el._chartInstance.destroy();
    }

    const config = JSON.parse(el.getAttribute('data-chart'));
    const ctx = el.getContext('2d');

    const goldRGBA = 'rgba(255, 156, 0, %%a%%)';
    const blueRGBA = 'rgba(153, 204, 255, %%a%%)';
    const greenRGBA = 'rgba(0, 204, 102, %%a%%)';

    function c(template, a) {
      return template.replace('%%a%%', a);
    }

    const colorMap = {
      gold: { border: c(goldRGBA, 1), bg: c(goldRGBA, 0.15) },
      blue: { border: c(blueRGBA, 1), bg: c(blueRGBA, 0.1) },
      green: { border: c(greenRGBA, 1), bg: c(greenRGBA, 0.1) },
    };

    const datasets = config.datasets.map(function (ds) {
      const palette = colorMap[ds.color] || colorMap.gold;
      return {
        label: ds.label,
        data: ds.data,
        borderColor: palette.border,
        backgroundColor: ds.fill !== false ? palette.bg : 'transparent',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: ds.fill !== false,
      };
    });

    el._chartInstance = new Chart(ctx, {
      type: config.type || 'line',
      data: {
        labels: config.labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(153, 204, 255, 0.7)',
              font: { family: "'Rajdhani', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(20, 20, 25, 0.95)',
            titleColor: '#FFFFFF',
            bodyColor: '#99CCFF',
            borderColor: 'rgba(153, 204, 255, 0.2)',
            borderWidth: 1,
            titleFont: { family: "'Antonio', sans-serif", size: 14 },
            bodyFont: { family: "'Rajdhani', sans-serif", size: 13 },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(153, 204, 255, 0.5)', font: { family: "'Rajdhani', sans-serif", size: 11 } },
            grid: { color: 'rgba(153, 204, 255, 0.06)' },
          },
          y: {
            ticks: { color: 'rgba(153, 204, 255, 0.5)', font: { family: "'Rajdhani', sans-serif", size: 11 } },
            grid: { color: 'rgba(153, 204, 255, 0.06)' },
          },
        },
      },
    });
  });
}

/* ── Toasts ── */
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) return;

  var icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span>' +
    '<span>' + message + '</span>' +
    '<button class="toast-close" onclick="this.parentElement.remove()">×</button>';
  container.appendChild(toast);

  setTimeout(function () {
    if (toast.parentElement) {
      toast.style.animation = 'toast-out 0.3s ease-in forwards';
      setTimeout(function () { toast.remove(); }, 300);
    }
  }, 4000);
}

/* ── Mobile nav toggle ── */
function initMobileNav() {
  var toggle = document.getElementById('mobile-nav-toggle');
  var sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }
}

function initToasts() {
  if (!document.getElementById('toast-container')) {
    var c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
}
