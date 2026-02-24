/**
 * Auxora V2 — Auto-Play Step-by-Step Demo
 * Conversation-driven chapter flow with typing indicators,
 * action buttons, and progressive content reveal.
 */

(function() {
  var currentChapter = 0; // 0 = not started yet
  var highestUnlocked = 0; // highest chapter unlocked so far
  var charts = {};
  var isPlaying = false; // prevent double-play

  // ─── CONVERSATION FLOW SCRIPT ───
  var conversationFlow = {
    welcome: {
      messages: [
        { from: 'auxora', text: "Hi Len! I'm Auxora, your AI Growth Co-Founder." },
        { from: 'auxora', text: "I've prepared the complete project workspace for YamaBushi Farms. Let's walk through each phase together." }
      ],
      buttons: [{ label: 'Start with Market Research', action: 'ch1Start' }]
    },

    ch1Start: {
      chapter: 1,
      messages: [
        { from: 'auxora', text: "Starting with Discovery & Research. Analyzing the premium beef market..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "Market research complete! $7.2B opportunity with 3 key audience segments identified." }
      ],
      buttons: [{ label: 'Continue to Brand Identity', action: 'ch2Start' }]
    },

    ch2Start: {
      chapter: 2,
      messages: [
        { from: 'auxora', text: "Now let's define your brand identity..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "Brand system ready \u2014 3 colors, premium fonts, and your brand story." }
      ],
      buttons: [{ label: 'Continue to Site Build', action: 'ch3Start' }]
    },

    ch3Start: {
      chapter: 3,
      messages: [
        { from: 'auxora', text: "Building your Shopify store..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "Store is live! 5 products, all payments connected, SEO green across the board." }
      ],
      buttons: [{ label: 'Set Up Ad Accounts', action: 'ch4Start' }]
    },

    ch4Start: {
      chapter: 4,
      messages: [
        { from: 'auxora', text: "Connecting your ad accounts..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "All 8 accounts connected! 95% pixel match rate. Ready for campaigns." }
      ],
      buttons: [{ label: 'Plan Campaigns', action: 'ch5Start' }]
    },

    ch5Start: {
      chapter: 5,
      messages: [
        { from: 'auxora', text: "Creating your campaign strategy \u2014 $13K over 31 days, 3 phases..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "Budget plan ready. Phase 1 focuses on data collection. Phase 3 is pure profit." }
      ],
      buttons: [{ label: 'Launch Campaigns!', action: 'ch6Start' }]
    },

    ch6Start: {
      chapter: 6,
      messages: [
        { from: 'auxora', text: "Campaigns are LIVE! Here are your Week 1-2 results..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "9 purchases, $33.65 avg CPA. Sizzle Video winning. OpenClaw made 5 autonomous actions." }
      ],
      buttons: [{ label: 'See Optimization', action: 'ch7Start' }]
    },

    ch7Start: {
      chapter: 7,
      messages: [
        { from: 'auxora', text: "Weeks 3-4: Scaling the winners..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "ROAS improved to 1.99! CPA down 8.2%. Recommending: scale Vitamin audience 20-30%." }
      ],
      buttons: [{ label: 'Show Final Results', action: 'ch8Start' }]
    },

    ch8Start: {
      chapter: 8,
      messages: [
        { from: 'auxora', text: "Week 5 results are in..." }
      ],
      showContent: true,
      afterMessages: [
        { from: 'auxora', text: "\ud83c\udf89 ROAS 7.78X! $945 revenue this week! 37 total purchases across 5 weeks." },
        { from: 'auxora', text: "Ready to scale to $5K/month with TikTok expansion?" }
      ],
      buttons: [{ label: "Let's Scale! \ud83d\ude80", action: 'finale' }]
    },

    finale: {
      messages: [
        { from: 'auxora', text: "Congratulations! The full YamaBushi Farms growth journey is complete." },
        { from: 'auxora', text: "From zero marketing to 7.78X ROAS in 5 weeks \u2014 that's the Auxora difference." }
      ],
      buttons: []
    }
  };

  // ─── CHAT MESSAGE HELPERS ───

  function addMessage(from, text, callback) {
    var container = document.getElementById('chatMessages');
    if (!container) return;

    var msg = document.createElement('div');
    msg.className = 'message ' + from;

    var avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = from === 'auxora' ? 'A' : 'L';

    var bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    if (callback) callback();
  }

  function addActionButtons(buttons) {
    if (!buttons || buttons.length === 0) return;
    var container = document.getElementById('chatMessages');
    if (!container) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'action-buttons';

    buttons.forEach(function(btn) {
      var button = document.createElement('button');
      button.className = 'action-btn';
      button.textContent = btn.label;
      button.onclick = function() {
        // Remove the button wrapper
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        // Show user "click" as a message
        addMessage('user', btn.label);
        // Play the next conversation after a brief pause
        setTimeout(function() {
          playConversation(btn.action);
        }, 400);
      };
      wrapper.appendChild(button);
    });

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // ─── TYPING INDICATOR ───

  function showTyping() {
    var container = document.getElementById('chatMessages');
    if (!container) return;

    // Remove any existing typing indicator first
    hideTyping();

    var typing = document.createElement('div');
    typing.className = 'message auxora typing-indicator-msg';
    typing.id = 'typingIndicator';

    var avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'A';

    var bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-bubble';
    bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    typing.appendChild(avatar);
    typing.appendChild(bubble);
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('typingIndicator');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ─── PLAY CONVERSATION ───

  function playConversation(key) {
    var flow = conversationFlow[key];
    if (!flow || isPlaying) return;
    isPlaying = true;

    var step = flow;

    // If this step has a chapter, navigate to it
    if (step.chapter) {
      unlockChapter(step.chapter);
      goToChapter(step.chapter);
    }

    // Play intro messages with typing
    playMessages(step.messages, 0, function() {

      // If showContent is true, wait for content to settle, then play afterMessages
      if (step.showContent && step.afterMessages) {
        setTimeout(function() {
          playMessages(step.afterMessages, 0, function() {
            isPlaying = false;
            addActionButtons(step.buttons);
          });
        }, 800);
      } else {
        isPlaying = false;
        addActionButtons(step.buttons);
      }
    });
  }

  function playMessages(messages, index, done) {
    if (!messages || index >= messages.length) {
      if (done) done();
      return;
    }

    var msg = messages[index];
    showTyping();

    // Vary typing delay based on message length
    var delay = Math.min(600 + msg.text.length * 8, 1800);

    setTimeout(function() {
      hideTyping();
      addMessage(msg.from, msg.text);

      // Pause between messages
      setTimeout(function() {
        playMessages(messages, index + 1, done);
      }, 300);
    }, delay);
  }

  // ─── CHAPTER NAVIGATION ───

  function unlockChapter(num) {
    if (num > highestUnlocked) {
      highestUnlocked = num;
    }
    // Remove locked class from all chapters up to this one
    var nodes = document.querySelectorAll('.progress-node');
    nodes.forEach(function(node) {
      var ch = parseInt(node.getAttribute('data-chapter'));
      if (ch <= highestUnlocked) {
        node.classList.remove('locked');
      }
    });
  }

  window.goToChapter = function(num) {
    // Only allow clicking on unlocked (completed or active) chapters
    var node = document.querySelector('.progress-node[data-chapter="' + num + '"]');
    if (node && node.classList.contains('locked')) return;

    currentChapter = num;
    updateProgressBar();
    showChapterContent();
    loadWhatsAppMessages();
    initChartsForChapter(num);
  };

  function updateProgressBar() {
    var nodes = document.querySelectorAll('.progress-node');
    var connectors = document.querySelectorAll('.progress-connector');

    nodes.forEach(function(node) {
      var ch = parseInt(node.getAttribute('data-chapter'));
      // Remove visual state classes but keep locked if applicable
      node.classList.remove('completed', 'active', 'upcoming');

      if (ch < currentChapter) {
        node.classList.add('completed');
        node.classList.remove('locked');
      } else if (ch === currentChapter) {
        node.classList.add('active');
        node.classList.remove('locked');
      } else if (ch <= highestUnlocked) {
        node.classList.add('upcoming');
        node.classList.remove('locked');
      } else {
        node.classList.add('upcoming');
        // keep locked
      }
    });

    connectors.forEach(function(conn) {
      var after = parseInt(conn.getAttribute('data-after'));
      conn.className = 'progress-connector';
      if (after < currentChapter - 1) conn.classList.add('done');
      else if (after === currentChapter - 1) conn.classList.add('active');
    });
  }

  function showChapterContent() {
    var panels = document.querySelectorAll('.chapter-content');
    panels.forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('chapter-' + currentChapter);
    if (target) {
      target.classList.add('active');
      var centerPanel = document.getElementById('centerPanel');
      if (centerPanel) centerPanel.scrollTop = 0;
    }
  }

  // ─── WHATSAPP MESSAGES ───

  function loadWhatsAppMessages() {
    var container = document.getElementById('waMessages');
    if (!container) return;
    container.innerHTML = '';

    var key = 'ch' + currentChapter;
    var messages = waData[key] || [];

    messages.forEach(function(msg, i) {
      var bubble = document.createElement('div');
      var isOutgoing = msg.from === 'len';
      bubble.className = 'wa-bubble ' + (isOutgoing ? 'outgoing' : 'incoming');

      var html = '';
      if (!isOutgoing) {
        html += '<div class="wa-bubble-sender">Auxora AI</div>';
      }
      html += '<div>' + escapeHtml(msg.text) + '</div>';
      html += '<div class="wa-bubble-time">' + escapeHtml(msg.time) + '</div>';
      bubble.innerHTML = html;

      container.appendChild(bubble);

      setTimeout(function() {
        bubble.classList.add('visible');
        container.scrollTop = container.scrollHeight;
      }, 200 + i * 400);
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── CHART.JS INITIALIZATION ───

  function initChartsForChapter(num) {
    Object.keys(charts).forEach(function(key) {
      if (charts[key]) {
        charts[key].destroy();
        delete charts[key];
      }
    });

    setTimeout(function() {
      switch(num) {
        case 1: initSeasonalityChart(); break;
        case 5: initPieCharts(); break;
        case 7: initTrendChart(); break;
        case 8: initRevenueChart(); initRoasChart(); break;
      }
    }, 100);
  }

  function initSeasonalityChart() {
    var canvas = document.getElementById('seasonalityChart');
    if (!canvas) return;
    charts.seasonality = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Search Interest',
          data: [65, 55, 60, 70, 75, 80, 90, 85, 70, 75, 95, 100],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#F59E0B'
        }]
      },
      options: chartOptions('Search Interest Index')
    });
  }

  function initPieCharts() {
    [1, 2, 3].forEach(function(phaseId) {
      var canvas = document.getElementById('piePhase' + phaseId);
      if (!canvas) return;
      var pcts = phaseId === 1 ? [70, 30] : (phaseId === 2 ? [60, 40] : [53, 47]);
      charts['pie' + phaseId] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Google Ads', 'Meta Ads'],
          datasets: [{
            data: pcts,
            backgroundColor: ['#4285F4', '#1877F2'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { display: false } }
        }
      });
    });
  }

  function initTrendChart() {
    var canvas = document.getElementById('trendChart');
    if (!canvas) return;
    charts.trend = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'ROAS',
            data: [1.95, 1.57, 1.99, 1.99],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: 'CPA ($)',
            data: [29.75, 39.10, 29.82, 32.69],
            borderColor: '#EF4444',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 } } }
        },
        scales: {
          y: {
            type: 'linear', display: true, position: 'left',
            title: { display: true, text: 'ROAS', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y1: {
            type: 'linear', display: true, position: 'right',
            title: { display: true, text: 'CPA ($)', font: { size: 11 } },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function initRevenueChart() {
    var canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    charts.revenue = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [
          {
            label: 'Revenue',
            data: [289.50, 245.00, 356.00, 325.00, 945.00],
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: '#F59E0B',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Spend',
            data: [148.77, 156.38, 178.92, 163.45, 121.40],
            backgroundColor: 'rgba(168, 162, 158, 0.5)',
            borderColor: '#A8A29E',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 } } }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'USD ($)', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function initRoasChart() {
    var canvas = document.getElementById('roasChart');
    if (!canvas) return;
    charts.roas = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [
          {
            label: 'ROAS',
            data: [1.95, 1.57, 1.99, 1.99, 7.78],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 6,
            pointBackgroundColor: '#F59E0B'
          },
          {
            label: 'Target (3.0X)',
            data: [3.0, 3.0, 3.0, 3.0, 3.0],
            borderColor: '#EF4444',
            borderWidth: 2,
            borderDash: [8, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: chartOptions('ROAS')
    });
  }

  function chartOptions(yLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 } } }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: yLabel, font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    };
  }

  // ─── INIT: AUTO-START ───

  function init() {
    // All chapters start hidden + locked (set in EJS)
    // Start the welcome conversation after a brief delay
    setTimeout(function() {
      playConversation('welcome');
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
