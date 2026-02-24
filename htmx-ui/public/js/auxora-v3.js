/**
 * Auxora V3 — Two-Panel Chat + Canvas Client
 * Left panel: chat messages + question/action/alert cards
 * Right panel: progress stepper + canvas dashboards
 */
var V3 = (function() {
  'use strict';

  // ─── STATE ──────────────────────────────────────────
  var state = {
    sessionId: null,
    currentStage: 'discovery',
    currentTab: 'onboarding',
    isLoading: false,
    typingEl: null,
    liveReport: null,
    cardCounter: 0,
    proMode: false,
    agentDrawerOpen: false,
    agentActions: [],
    agentIdleTimer: null,
    canvasDetailActive: false,
    bgTasks: 0
  };

  var stages = window.v3Stages || [];
  var stepperConfigs = window.v3StepperConfigs || {};

  // ─── DOM REFS ───────────────────────────────────────
  var chatMessages, canvasPanel;

  function init() {
    chatMessages = document.getElementById('chatMessages');
    canvasPanel = document.getElementById('canvasPanel');

    // Wire up tab clicks
    var tabs = document.querySelectorAll('.v3-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        switchTab(tab.getAttribute('data-tab'));
      });
    });

    // Init resize handle
    initResizeHandle();

    // Create session and start
    createSession();
  }

  // ─── RESIZABLE PANEL ────────────────────────────────
  function initResizeHandle() {
    var handle = document.getElementById('resizeHandle');
    var chatPanel = document.querySelector('.v3-chat-panel');
    if (!handle || !chatPanel) return;

    var isResizing = false;
    var startX, startWidth;

    handle.addEventListener('mousedown', function(e) {
      isResizing = true;
      startX = e.clientX;
      startWidth = chatPanel.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      handle.classList.add('active');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isResizing) return;
      var newWidth = startWidth + (e.clientX - startX);
      // Clamp between 280px and 600px
      newWidth = Math.max(280, Math.min(600, newWidth));
      chatPanel.style.width = newWidth + 'px';
      chatPanel.style.minWidth = newWidth + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handle.classList.remove('active');
    });

    // Touch support for mobile
    handle.addEventListener('touchstart', function(e) {
      isResizing = true;
      startX = e.touches[0].clientX;
      startWidth = chatPanel.offsetWidth;
      handle.classList.add('active');
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
      if (!isResizing) return;
      var newWidth = startWidth + (e.touches[0].clientX - startX);
      newWidth = Math.max(280, Math.min(600, newWidth));
      chatPanel.style.width = newWidth + 'px';
      chatPanel.style.minWidth = newWidth + 'px';
    });

    document.addEventListener('touchend', function() {
      if (!isResizing) return;
      isResizing = false;
      handle.classList.remove('active');
    });
  }

  function switchTab(tabName) {
    state.currentTab = tabName;
    var tabs = document.querySelectorAll('.v3-tab');
    tabs.forEach(function(tab) {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Show/hide canvas views
    var views = document.querySelectorAll('.v3-canvas-view');
    views.forEach(function(view) {
      if (view.getAttribute('data-canvas') === tabName) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // AUTO-RENDER: Trigger canvas render when switching to monitor tab
    if (tabName === 'openclaw') {
      renderOpenclawDashboard();
    }
  }

  // ─── HELPERS ────────────────────────────────────────

  function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  // Escape for use inside single-quoted JS strings within onclick attributes
  function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function timeAgo(dateStr) {
    if (!dateStr) return 'unknown';
    var diff = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  function timeUntil(dateStr) {
    if (!dateStr) return '';
    var diff = new Date(dateStr).getTime() - Date.now();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return mins + ' min';
    return Math.floor(mins / 60) + 'h';
  }

  function nextCardId(prefix) {
    state.cardCounter++;
    return 'card-' + (prefix || 'c') + '-' + state.cardCounter;
  }

  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function formatCurrency(num) {
    if (typeof num === 'string') return num;
    return '$' + num.toLocaleString();
  }

  // ─── API CLIENT ───────────────────────────────────

  async function createSession() {
    try {
      var res = await fetch('/api/v3/session', { method: 'POST' });
      var data = await res.json();
      state.sessionId = data.sessionId;

      // Start the greeting stream
      consumeSSE('/api/v3/session/' + state.sessionId + '/start', 'GET');
    } catch (err) {
      console.error('Session creation failed:', err);
      appendAuxoraMessage('Connection error. Please refresh to try again.');
    }
  }

  async function sendMessage() {
    var input = document.getElementById('chatInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text || state.isLoading) return;
    input.value = '';

    appendUserMessage(text);

    consumeSSE(
      '/api/v3/session/' + state.sessionId + '/message',
      'POST',
      { text: text }
    );
  }

  // Send a message programmatically (from button clicks)
  function sendAction(text) {
    if (state.isLoading) return;
    appendUserMessage(text);
    consumeSSE(
      '/api/v3/session/' + state.sessionId + '/message',
      'POST',
      { text: text }
    );
  }

  async function consumeSSE(url, method, body) {
    state.isLoading = true;
    updateInputState();

    try {
      var opts = {
        method: method,
        headers: {}
      };
      if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }

      var response = await fetch(url, opts);
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        var currentEvent = '';
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            var dataStr = line.slice(6);
            try {
              var data = JSON.parse(dataStr);
              handleSSEEvent(currentEvent, data);
            } catch (e) {
              console.error('SSE event error:', currentEvent, dataStr, e);
            }
          }
        }
      }
    } catch (err) {
      console.error('SSE error:', err);
      hideTyping();
      appendAuxoraMessage('Connection interrupted. Please try again.');
    }

    state.isLoading = false;
    updateInputState();
  }

  function handleSSEEvent(event, data) {
    switch (event) {
      case 'typing':
        if (data.show) showTyping();
        else hideTyping();
        break;

      case 'message':
        hideTyping();
        if (data.sender === 'auxora') {
          appendAuxoraMessage(data.text);
        } else {
          appendUserMessage(data.text);
        }
        break;

      case 'card':
        hideTyping();
        appendCardFromData(data);
        break;

      case 'stage':
        state.currentStage = data.stage;
        updateStepperLabels(data.stage);
        updateJourneyProgress(data.stage);
        if (data.stage === 'report-gen') {
          updateProgressStep(4, 'active');
        } else if (data.stage === 'strategy') {
          // Report is already rendered in the onboarding canvas — keep showing it
          updateTabCompleted('onboarding');
        } else if (data.stage === 'competitor-research') {
          // competitor research step before execution
        } else if (data.stage === 'execution-setup') {
          switchTab('execution');
          renderSetupDashboard(0);
        } else if (data.stage === 'campaign-planning') {
          renderCampaignPlanDashboard();
        } else if (data.stage === 'launch') {
          // handled by canvas_update
        } else if (data.stage === 'monitoring') {
          updateTabCompleted('execution');
          // handled by canvas_update
        } else if (data.stage === 'optimization') {
          // handled by canvas_update
        } else if (data.stage === 'scaling') {
          updateTabCompleted('openclaw');
          // handled by canvas_update
        }
        break;

      case 'progress_step':
        updateProgressStep(data.step, data.status);
        break;

      case 'tab_switch':
        switchTab(data.tab);
        break;

      case 'canvas_update':
        handleCanvasUpdate(data);
        break;

      case 'chat_progress':
        hideTyping();
        showChatProgress(data);
        break;

      case 'chat_progress_done':
        dismissChatProgress();
        break;

      case 'agent_action':
        handleAgentAction(data);
        break;

      case 'keepalive':
        // Heartbeat to keep SSE connection alive during long operations
        break;

      case 'done':
        hideTyping();
        break;

      case 'error':
        hideTyping();
        appendAuxoraMessage('Something went wrong. Please try again.');
        break;
    }
  }

  function updateInputState() {
    var input = document.getElementById('chatInput');
    var btn = document.querySelector('.v3-chat-send-btn');
    if (input) input.disabled = state.isLoading;
    if (btn) btn.disabled = state.isLoading;
  }

  // ─── STEPPER LABEL UPDATES ──────────────────────────

  function updateStepperLabels(stage) {
    var config = stepperConfigs[stage];
    if (!config) return;

    var stepper = document.getElementById('progressSteps');
    if (!stepper) return;

    var currentSteps = stepper.querySelectorAll('.v3-step');
    var newCount = config.steps.length;

    // If step count changed, rebuild the stepper DOM
    if (currentSteps.length !== newCount) {
      rebuildStepper(stepper, config.steps);
      return;
    }

    var labels = stepper.querySelectorAll('.v3-step-label');
    config.steps.forEach(function(label, idx) {
      if (labels[idx]) labels[idx].textContent = label;
    });
  }

  function rebuildStepper(stepper, steps) {
    var html = '';
    var isCompact = steps.length > 4;
    steps.forEach(function(label, idx) {
      if (idx > 0) {
        html += '<div class="v3-step-connector" data-connector="' + idx + '"></div>';
      }
      html += '<div class="v3-step" data-step="' + (idx + 1) + '">';
      html += '<div class="v3-step-circle">' + (idx + 1) + '</div>';
      html += '<div class="v3-step-label">' + label + '</div>';
      html += '</div>';
    });
    stepper.innerHTML = html;
    if (isCompact) {
      stepper.classList.add('compact');
    } else {
      stepper.classList.remove('compact');
    }
  }

  // ─── PROGRESS STEPPER ────────────────────────────────

  function updateProgressStep(stepNum, status) {
    var stepper = document.getElementById('progressSteps');
    if (!stepper) return;

    var steps = stepper.querySelectorAll('.v3-step');
    var connectors = stepper.querySelectorAll('.v3-step-connector');

    steps.forEach(function(stepEl, idx) {
      var num = idx + 1;
      var circle = stepEl.querySelector('.v3-step-circle');

      if (num < stepNum) {
        stepEl.className = 'v3-step complete';
        circle.innerHTML = '\u2713';
      } else if (num === stepNum) {
        if (status === 'complete') {
          stepEl.className = 'v3-step complete';
          circle.innerHTML = '\u2713';
        } else {
          stepEl.className = 'v3-step active';
          circle.innerHTML = String(num);
        }
      } else {
        stepEl.className = 'v3-step';
        circle.innerHTML = String(num);
      }
    });

    connectors.forEach(function(conn, idx) {
      var connNum = idx + 1;
      if (connNum < stepNum) {
        conn.classList.add('filled');
      } else if (connNum === stepNum && status === 'complete') {
        conn.classList.add('filled');
      } else {
        conn.classList.remove('filled');
      }
    });
  }

  // ─── JOURNEY PROGRESS + TAB STATE ─────────────────────

  // Map stages to journey progress percentage + ETA text
  var journeyMap = {
    'discovery':         { pct: 5,   eta: '~20 min to ads live, then autopilot', milestones: 0 },
    'report-gen':        { pct: 15,  eta: '~15 min to ads live', milestones: 0 },
    'strategy':          { pct: 25,  eta: '~10 min to ads live', milestones: 1 },
    'competitor-research': { pct: 30, eta: '~9 min to ads live', milestones: 1 },
    'execution-setup':   { pct: 35,  eta: '~8 min to ads live', milestones: 1 },
    'campaign-planning': { pct: 50,  eta: '~5 min to ads live', milestones: 2 },
    'launch':            { pct: 70,  eta: 'Almost there...', milestones: 2 },
    'monitoring':        { pct: 80,  eta: 'Ads are live! Revenue incoming', milestones: 3 },
    'weekly-sync':       { pct: 85,  eta: 'Ads are live! Revenue incoming', milestones: 3 },
    'optimization':      { pct: 90,  eta: 'Revenue growing, optimizing...', milestones: 3 },
    'scaling':           { pct: 100, eta: 'Revenue engine running', milestones: 4 }
  };

  function updateJourneyProgress(stage) {
    var info = journeyMap[stage];
    if (!info) return;

    var fill = document.getElementById('journeyFill');
    var eta = document.getElementById('journeyEta');
    if (fill) fill.style.width = info.pct + '%';
    if (eta) eta.textContent = info.eta;

    var milestones = document.querySelectorAll('.v3-journey-milestone');
    milestones.forEach(function(m, idx) {
      if (idx < info.milestones) {
        m.classList.add('reached');
      } else {
        m.classList.remove('reached');
      }
    });
  }

  function updateTabCompleted(tabName) {
    var tabs = document.querySelectorAll('.v3-tab');
    tabs.forEach(function(tab) {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('completed');
        // Update the tab number to a checkmark
        var num = tab.querySelector('.v3-tab-num');
        if (num) num.textContent = '\u2713';
      }
    });
  }

  // ─── MESSAGE APPENDERS ──────────────────────────────

  function appendAuxoraMessage(text) {
    var time = getTimestamp();
    var div = document.createElement('div');
    div.className = 'v3-msg-group from-auxora';
    div.innerHTML =
      '<div class="v3-avatar auxora-av">A</div>' +
      '<div class="v3-bubble-wrap">' +
        '<div class="v3-bubble">' + esc(text) + '</div>' +
        '<span class="v3-msg-time">' + time + '</span>' +
      '</div>';
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function appendUserMessage(text) {
    var time = getTimestamp();
    var div = document.createElement('div');
    div.className = 'v3-msg-group from-user';
    div.innerHTML =
      '<div class="v3-avatar user-av">Y</div>' +
      '<div class="v3-bubble-wrap">' +
        '<div class="v3-bubble">' + esc(text) + '</div>' +
        '<span class="v3-msg-time">' + time + '</span>' +
      '</div>';
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  // ─── CARD RENDERERS ─────────────────────────────────

  function resolveCardData(cardData) {
    if (typeof cardData === 'object' && cardData !== null) return cardData;
    var data = window.v3Data || {};
    var cards = data.cards || {};
    var canvas = data.canvasData || {};
    return cards[cardData] || canvas[cardData] || null;
  }

  function renderQuestionCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('q');
    var html = '<div class="v3-card question" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<p class="v3-question-text">' + esc(d.question) + '</p>';

    if (d.inputType === 'chips' && d.options) {
      html += '<div class="v3-chip-select">';
      d.options.forEach(function(opt) {
        html += '<button class="v3-chip" onclick="V3.handleChipSelect(\'' + id + '\',\'' + escAttr(opt) + '\')">' + esc(opt) + '</button>';
      });
      html += '</div>';
    } else {
      html += '<div class="v3-question-input-row">';
      html += '<input class="v3-question-input" type="text" placeholder="' + esc(d.placeholder || '') + '" onkeydown="if(event.key===\'Enter\')V3.submitQuestionInput(\'' + id + '\')">';
      html += '<button class="v3-submit-input" onclick="V3.submitQuestionInput(\'' + id + '\')">Send</button>';
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderActionCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('act');
    var severity = d.severity || 'info';
    var html = '<div class="v3-card action severity-' + severity + '" id="' + id + '">';
    html += '<div class="v3-card-body">';

    // Header
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) {
      html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    }
    html += '</div>';

    // Attribution
    if (d.attribution) {
      html += '<div class="v3-card-attribution"><span class="v3-attr-icon">' + esc(d.attribution.icon || '🤖') + '</span><span class="v3-attr-label">' + esc(d.attribution.label || d.attribution.role) + '</span></div>';
    }

    // Body
    if (d.body) {
      html += '<div class="v3-action-body">' + esc(d.body) + '</div>';
    }

    // Detail
    if (d.detail) {
      html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    }

    // Action buttons
    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderAlertCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('alert');
    var severity = d.severity || 'warning';
    var html = '<div class="v3-card alert severity-' + severity + '" id="' + id + '">';
    html += '<div class="v3-card-body">';

    // Header
    html += '<div class="v3-alert-header">';
    html += '<div class="v3-alert-icon ' + severity + '">\u26A0</div>';
    html += '<span class="v3-alert-title">' + esc(d.title) + '</span>';
    if (d.confidence) {
      html += '<span class="v3-alert-confidence">' + esc(d.confidence) + ' confidence</span>';
    }
    html += '</div>';

    // Attribution
    if (d.attribution) {
      html += '<div class="v3-card-attribution"><span class="v3-attr-icon">' + esc(d.attribution.icon || '🤖') + '</span><span class="v3-attr-label">' + esc(d.attribution.label || d.attribution.role) + '</span></div>';
    }

    if (d.body) html += '<div class="v3-alert-body">' + esc(d.body) + '</div>';
    if (d.cause) html += '<div class="v3-alert-cause"><strong>Why:</strong> ' + esc(d.cause) + '</div>';
    if (d.recommendation) html += '<div class="v3-alert-rec">' + esc(d.recommendation) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderAutoActionCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('auto');
    var html = '<div class="v3-card auto-action" id="' + id + '">';
    html += '<div class="v3-card-body">';

    html += '<div class="v3-auto-header">';
    html += '<span class="v3-auto-title">' + esc(d.title) + '</span>';
    if (d.timestamp) html += '<span class="v3-auto-time">' + esc(d.timestamp) + '</span>';
    html += '</div>';

    // Attribution
    if (d.attribution) {
      html += '<div class="v3-card-attribution"><span class="v3-attr-icon">' + esc(d.attribution.icon || '🤖') + '</span><span class="v3-attr-label">' + esc(d.attribution.label || d.attribution.role) + '</span></div>';
    }

    if (d.body) html += '<div class="v3-auto-body">' + esc(d.body) + '</div>';
    if (d.impact) html += '<div class="v3-auto-impact">' + esc(d.impact) + '</div>';
    if (d.policy) html += '<div class="v3-auto-policy">' + esc(d.policy) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn secondary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderMilestoneCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('mile');

    var icons = { trophy: '\uD83C\uDFC6', rocket: '\uD83D\uDE80', shield: '\uD83D\uDEE1\uFE0F', check: '\u2705', star: '\u2B50' };
    var icon = icons[d.icon] || '\uD83C\uDFC6';

    var html = '<div class="v3-card milestone" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-milestone-icon">' + icon + '</div>';
    html += '<div class="v3-milestone-title">' + esc(d.title) + '</div>';
    if (d.body) html += '<div class="v3-milestone-body">' + esc(d.body) + '</div>';
    if (d.summary) html += '<div class="v3-milestone-summary">' + esc(d.summary) + '</div>';

    // Sparkline
    if (d.sparkline && d.sparkline.length) {
      var max = Math.max.apply(null, d.sparkline);
      if (max === 0) max = 1;
      html += '<div class="v3-milestone-sparkline">';
      d.sparkline.forEach(function(v) {
        var h = Math.max(4, Math.round((v / max) * 28));
        html += '<div class="v3-milestone-sparkline-bar" style="height:' + h + 'px"></div>';
      });
      html += '</div>';
    }

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row" style="justify-content:center">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderConnectionCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('conn');

    var bgColors = { shopify: '#96BF48', meta: '#1877F2', google: '#4285F4' };
    var labels = { shopify: 'S', meta: 'M', google: 'G' };
    var platform = d.platform || 'shopify';

    var html = '<div class="v3-card connection" id="' + id + '">';
    html += '<div class="v3-card-body">';

    // Platform header
    html += '<div class="v3-connection-platform">';
    html += '<div class="v3-connection-icon" style="background:' + (bgColors[platform] || '#666') + '">' + (labels[platform] || '?') + '</div>';
    html += '<span class="v3-connection-title">' + esc(d.title) + '</span>';
    html += '</div>';

    if (d.description) html += '<div class="v3-connection-desc">' + esc(d.description) + '</div>';

    // Permissions
    if (d.permissions) {
      html += '<div class="v3-connection-perms">';
      if (d.permissions.will) {
        html += '<div class="v3-perm-group"><span class="v3-perm-label will">WILL ACCESS</span>';
        d.permissions.will.forEach(function(p) { html += '<div class="v3-perm-item">' + esc(p) + '</div>'; });
        html += '</div>';
      }
      if (d.permissions.wont) {
        html += '<div class="v3-perm-group"><span class="v3-perm-label wont">WON\'T TOUCH</span>';
        d.permissions.wont.forEach(function(p) { html += '<div class="v3-perm-item">' + esc(p) + '</div>'; });
        html += '</div>';
      }
      html += '</div>';
    }

    // Actions
    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderChecklistCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('cl');
    var html = '<div class="v3-card checklist" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-checklist-title">' + esc(d.title) + '</div>';

    if (d.items) {
      d.items.forEach(function(item) {
        var status = item.status || 'pending';
        html += '<div class="v3-checklist-item">';
        html += '<div class="v3-checklist-check ' + status + '">' + (status === 'done' ? '\u2713' : '') + '</div>';
        html += '<div><div class="v3-checklist-text">' + esc(item.text) + '</div>';
        if (item.detail) html += '<div class="v3-checklist-detail">' + esc(item.detail) + '</div>';
        html += '</div></div>';
      });
    }

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row" style="margin-top:10px">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ─── CARD DISPATCHER ──────────────────────────────

  function appendCardFromData(entry) {
    var html = '';
    try {
    switch (entry.cardType) {
      case 'question':
        appendQuestionCard(entry.cardData);
        return;
      case 'report':
        renderReportInCanvas(resolveCardData(entry.cardData));
        return;
      case 'progress':
        renderProgressInCanvas(resolveCardData(entry.cardData));
        return;
      case 'action':
        html = renderActionCard(entry.cardData);
        break;
      case 'alert':
        html = renderAlertCard(entry.cardData);
        break;
      case 'auto-action':
        html = renderAutoActionCard(entry.cardData);
        break;
      case 'milestone':
        html = renderMilestoneCard(entry.cardData);
        break;
      case 'connection':
        html = renderConnectionCard(entry.cardData);
        break;
      case 'checklist':
        html = renderChecklistCard(entry.cardData);
        break;
      case 'objective-picker':
        html = renderObjectivePickerCard(entry.cardData);
        break;
      case 'campaign-structure':
        html = renderCampaignStructureCard(entry.cardData);
        break;
      case 'audience-builder':
        html = renderAudienceBuilderCard(entry.cardData);
        break;
      case 'budget-waterfall':
        html = renderBudgetWaterfallCard(entry.cardData);
        break;
      case 'creative-preview':
        html = renderCreativePreviewCard(entry.cardData);
        break;
      case 'review-summary':
        html = renderReviewSummaryCard(entry.cardData);
        break;
      case 'notification-settings':
        html = renderNotificationSettingsCard(entry.cardData);
        break;
      case 'gtm-report':
        // Render GTM report - both in canvas overlay and as inline chat card
        var reportData = resolveCardData(entry.cardData);
        console.log('[V3] GTM Report received:', reportData ? 'valid' : 'null', reportData ? Object.keys(reportData) : []);
        if (reportData) {
          state.liveReport = reportData;
          // Show in canvas overlay
          try { showCanvasDetail('gtm-report', 'Go-to-Market Strategy Report'); } catch(e) { console.error('[V3] Canvas overlay error:', e); }
          // Render inline report summary card in chat
          var sectionCount = (reportData.sections || reportData.reportSections || []).length;
          var execSummary = reportData.executiveSummary;
          var inlineHtml = '<div class="v3-card report-summary" style="max-width:100%;padding:16px;background:linear-gradient(135deg,#FAF7F4,#F3EDE7);border-radius:12px;border:1px solid #E8DDD4">';
          inlineHtml += '<div style="font-size:16px;font-weight:700;color:#2D3436;margin-bottom:8px">📊 ' + esc(reportData.reportTitle || 'Go-to-Market Strategy Report') + '</div>';
          inlineHtml += '<div style="font-size:12px;color:#636E72;margin-bottom:12px">Prepared by Auxora for ' + esc(reportData.companyName || 'your brand') + '</div>';
          if (execSummary) {
            if (execSummary.whatItIs) inlineHtml += '<div style="font-size:13px;color:#2D3436;margin-bottom:8px"><strong>Overview:</strong> ' + esc(execSummary.whatItIs) + '</div>';
            if (execSummary.marketGap) inlineHtml += '<div style="font-size:13px;color:#2D3436;margin-bottom:8px"><strong>Market Gap:</strong> ' + esc(execSummary.marketGap) + '</div>';
          }
          inlineHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">';
          (reportData.sections || reportData.reportSections || []).forEach(function(s, i) {
            inlineHtml += '<span style="font-size:11px;padding:4px 8px;background:#BF6744;color:white;border-radius:6px">' + (i+1) + '. ' + esc(s.title || s.id || 'Section') + '</span>';
          });
          inlineHtml += '</div>';
          inlineHtml += '<button class="v3-preview-link" style="margin-top:8px;color:#BF6744;font-weight:600;background:none;border:none;cursor:pointer;font-size:13px" onclick="try{V3.showCanvasDetail(\'gtm-report\',\'Go-to-Market Strategy Report\')}catch(e){console.error(\'showCanvasDetail error:\',e);alert(\'Error opening report: \'+(e.message||e))}">View Full Report →</button>';
          inlineHtml += '</div>';
          html = inlineHtml;
        } else {
          console.warn('[V3] GTM Report data is null/undefined');
        }
        break;
      case 'competitor-research':
        html = renderCompetitorResearchCard(entry.cardData);
        break;
      case 'preview':
        html = renderPreviewCard(entry.previewType || 'detail', entry.cardData, entry.detailKey || entry.cardData, entry.previewSummary || '');
        break;
      default:
        var d = resolveCardData(entry.cardData);
        if (d && d.title) {
          appendAuxoraMessage(d.title + (d.body ? ': ' + d.body : ''));
        }
        return;
    }

    if (html) {
      appendCardHTML(html);
    }
    } catch (cardErr) {
      console.error('Card render error (' + entry.cardType + '):', cardErr);
    }
  }

  function appendCardHTML(html) {
    var time = getTimestamp();
    var div = document.createElement('div');
    div.className = 'v3-msg-group from-auxora';
    div.innerHTML =
      '<div class="v3-avatar auxora-av">A</div>' +
      '<div class="v3-bubble-wrap" style="max-width:340px">' + html +
        '<span class="v3-msg-time">' + time + '</span>' +
      '</div>';
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function appendQuestionCard(cardData) {
    var html = renderQuestionCard(cardData);
    if (!html) return;
    appendCardHTML(html);
  }

  // ─── CANVAS RENDERERS ──────────────────────────────

  function getCanvasEl(tab) {
    var id = {
      onboarding: 'canvasOnboarding',
      execution: 'canvasExecution',
      openclaw: 'canvasOpenclaw',
      results: 'canvasResults'
    };
    return document.getElementById(id[tab] || 'canvasOnboarding');
  }

  function handleCanvasUpdate(data) {
    var view = data.view;
    if (view === 'setup-dashboard') {
      renderSetupDashboard(data.step || 0);
    } else if (view === 'campaign-plan') {
      renderCampaignPlanDashboard();
    } else if (view === 'campaign-plan-approved') {
      renderCampaignPlanApproved();
    } else if (view === 'launch-dashboard') {
      renderLaunchDashboard();
    } else if (view === 'openclaw-dashboard') {
      renderOpenclawDashboard();
    } else if (view === 'openclaw-alert') {
      renderOpenclawAlert();
    } else if (view === 'openclaw-actions') {
      renderOpenclawActions();
    } else if (view === 'results-early') {
      renderResultsEarly();
    } else if (view === 'results-week1') {
      renderResultsWeek1();
    } else if (view === 'results-week1vs2') {
      renderResultsComparison();
    } else if (view === 'results-week3') {
      renderResultsWeek3();
    } else if (view === 'results-month1') {
      renderResultsMonth1();
    } else if (view === 'results-month2') {
      renderResultsMonth2();
    } else if (view === 'scaling-plan') {
      renderScalingPlan();
    } else if (view === 'campaign-hierarchy') {
      renderCampaignHierarchy();
    } else if (view === 'budget-waterfall-canvas') {
      renderBudgetWaterfallCanvas();
    } else if (view === 'creative-comparison') {
      renderCreativeComparisonCanvas();
    } else if (view === 'daily-spend-tracker') {
      renderDailyBriefingEnhanced(resolveCardData('dailySpendTracker'));
    }
  }

  function renderProgressInCanvas(d) {
    if (!d) return;
    var el = getCanvasEl(state.currentTab);
    if (!el) return;

    var html = '<div class="v3-canvas-progress" id="canvasProgress">';
    html += '<h3>' + esc(d.title) + '</h3>';
    html += '<div class="v3-canvas-progress-steps">';
    d.steps.forEach(function(step, idx) {
      html += '<div class="v3-canvas-progress-step pending" data-step>';
      html += '<div class="step-icon">' + (idx + 1) + '</div>';
      html += '<span class="step-text">' + esc(step.text) + '</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="v3-canvas-progress-bar"><div class="v3-canvas-progress-bar-fill" style="width:0%"></div></div>';
    html += '<div class="v3-canvas-progress-label">Analyzing...</div>';
    html += '</div>';

    el.innerHTML = html;
    animateCanvasProgress(d.steps.length);
  }

  function animateCanvasProgress(totalSteps) {
    var card = document.getElementById('canvasProgress');
    if (!card) return;

    var steps = card.querySelectorAll('[data-step]');
    var fill = card.querySelector('.v3-canvas-progress-bar-fill');
    var label = card.querySelector('.v3-canvas-progress-label');
    var total = steps.length;
    var current = 0;

    function tickStep() {
      if (current >= total) return;
      var step = steps[current];
      step.className = 'v3-canvas-progress-step done';
      step.querySelector('.step-icon').innerHTML = '\u2713';
      current++;
      var pct = Math.round((current / total) * 100);
      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = pct + '% complete';

      if (current < total) {
        steps[current].className = 'v3-canvas-progress-step active';
      }
    }

    if (steps[0]) {
      steps[0].className = 'v3-canvas-progress-step active';
    }

    for (var i = 0; i < total; i++) {
      (function(idx) {
        setTimeout(function() { tickStep(); }, 500 * (idx + 1));
      })(i);
    }
  }

  function renderReportInCanvas(d) {
    if (!d) return;
    state.liveReport = d;
    var el = getCanvasEl(state.currentTab);
    if (!el) el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-report-card">';
    html += '<div class="v3-report-header">';
    html += '<span class="v3-report-title">' + esc(d.title || 'Report') + '</span>';
    if (d.badge) {
      html += '<span class="v3-report-badge">' + esc(d.badge) + '</span>';
    } else {
      html += '<span class="v3-report-badge">Generated</span>';
    }
    html += '</div>';
    html += '<div class="v3-report-body">';

    if (d.summary) {
      html += '<div class="v3-report-summary">' + esc(d.summary) + '</div>';
    }

    if (d.kpis && d.kpis.length) {
      html += '<div class="v3-report-kpis">';
      d.kpis.forEach(function(k) {
        html += '<div class="v3-report-kpi">';
        html += '<span class="v3-report-kpi-value">' + esc(k.value) + '</span>';
        html += '<span class="v3-report-kpi-label">' + esc(k.label) + '</span>';
        if (k.delta) {
          var cls = k.trend === 'up' ? 'up' : (k.trend === 'down' ? 'down' : 'neutral');
          html += '<span class="v3-report-kpi-delta ' + cls + '">' + esc(k.delta) + '</span>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    if (d.sections && d.sections.length) {
      d.sections.forEach(function(s) {
        html += '<div class="v3-report-section">';
        html += '<h4>' + esc(s.title) + '</h4>';
        if (s.items && s.items.length) {
          html += '<ul>';
          s.items.forEach(function(item) {
            html += '<li>' + esc(item) + '</li>';
          });
          html += '</ul>';
        }
        html += '</div>';
      });
    }

    if (d.sparkline && d.sparkline.length) {
      html += '<div class="v3-report-section"><h4>Projected Revenue</h4>';
      var max = Math.max.apply(null, d.sparkline);
      if (max === 0) max = 1;
      html += '<div class="v3-report-sparkline">';
      d.sparkline.forEach(function(v) {
        var h = Math.max(4, Math.round((v / max) * 48));
        html += '<div class="v3-report-sparkline-bar" style="height:' + h + 'px"></div>';
      });
      html += '</div></div>';
    }

    html += '</div></div>';
    el.innerHTML = html;

    if (state.currentStage === 'strategy' || state.currentStage === 'report-gen') {
      updateProgressStep(4, 'complete');
    }
  }

  // ─── SETUP DASHBOARD (Canvas) ──────────────────────

  function renderSetupDashboard(completedStep) {
    var el = getCanvasEl('execution');
    if (!el) return;

    var platforms = [
      { name: 'Shopify Store', icon: 'S', color: '#96BF48' },
      { name: 'Meta (Facebook/Instagram)', icon: 'M', color: '#1877F2' },
      { name: 'Google Ads', icon: 'G', color: '#4285F4' },
      { name: 'Website Tracking', icon: 'T', color: '#7C3AED' }
    ];

    var connected = completedStep || 0;
    var html = '<div class="v3-setup-dashboard">';

    // KPIs
    html += '<div class="v3-setup-kpis">';
    html += '<div class="v3-setup-kpi"><span class="v3-setup-kpi-value">' + connected + '</span><span class="v3-setup-kpi-label">Connected</span></div>';
    html += '<div class="v3-setup-kpi"><span class="v3-setup-kpi-value">$0</span><span class="v3-setup-kpi-label">Ad Spend</span></div>';
    html += '<div class="v3-setup-kpi"><span class="v3-setup-kpi-value">--</span><span class="v3-setup-kpi-label">Return per $1</span></div>';
    html += '<div class="v3-setup-kpi"><span class="v3-setup-kpi-value">Day 1</span><span class="v3-setup-kpi-label">Timeline</span></div>';
    html += '</div>';

    // Connection rows
    html += '<div class="v3-connections-list">';
    platforms.forEach(function(p, idx) {
      var status = idx < connected ? 'connected' : (idx === connected ? 'active' : '');
      var statusText = idx < connected ? '\u2713 Connected' : (idx === connected ? 'Connecting...' : 'Pending');
      var statusClass = idx < connected ? 'connected' : (idx === connected ? 'active' : 'pending');
      html += '<div class="v3-connection-row ' + status + '">';
      html += '<div class="v3-connection-row-icon" style="background:' + p.color + '">' + p.icon + '</div>';
      html += '<div style="flex:1"><div class="v3-connection-row-name">' + esc(p.name) + '</div></div>';
      html += '<span class="v3-connection-row-status ' + statusClass + '">' + statusText + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  // ─── CAMPAIGN PLAN DASHBOARD (Canvas) ───────────────

  function renderCampaignPlanDashboard() {
    var el = getCanvasEl('execution');
    if (!el) return;

    var html = '<div class="v3-plan-dashboard">';
    html += '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">Campaign Plan</span><span class="v3-report-badge">Awaiting Approval</span></div>';
    html += '<div class="v3-report-body">';

    // KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$13K</span><span class="v3-report-kpi-label">Total Budget</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">31</span><span class="v3-report-kpi-label">Days</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$419</span><span class="v3-report-kpi-label">Daily Avg</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">3</span><span class="v3-report-kpi-label">Phases</span></div>';
    html += '</div>';

    // Phase bar
    html += '<div class="v3-plan-phases">';
    html += '<div class="v3-plan-phase test" style="flex:30">Test $3.9K</div>';
    html += '<div class="v3-plan-phase optimize" style="flex:48">Optimize $6.2K</div>';
    html += '<div class="v3-plan-phase scale" style="flex:22">Scale $2.9K</div>';
    html += '</div>';

    // Channel split
    html += '<div class="v3-plan-channel-split">';
    html += '<div class="v3-plan-channel"><div class="v3-plan-channel-name">Google Ads</div><div class="v3-plan-channel-pct">70%</div><div class="v3-plan-channel-desc">Search + Shopping</div></div>';
    html += '<div class="v3-plan-channel"><div class="v3-plan-channel-name">Meta Ads</div><div class="v3-plan-channel-pct">30%</div><div class="v3-plan-channel-desc">Awareness + Retargeting</div></div>';
    html += '</div>';

    html += '<div class="v3-plan-status">Awaiting your approval...</div>';
    html += '</div></div></div>';

    el.innerHTML = html;
  }

  function renderCampaignPlanApproved() {
    var el = getCanvasEl('execution');
    if (!el) return;
    // Just update the badge
    var badge = el.querySelector('.v3-report-badge');
    if (badge) {
      badge.textContent = 'Approved';
      badge.style.background = '#DCFCE7';
      badge.style.color = '#166534';
    }
    var status = el.querySelector('.v3-plan-status');
    if (status) {
      status.innerHTML = '\u2705 All 4 decisions approved. Ready to launch!';
      status.style.color = '#166534';
      status.style.fontWeight = '600';
    }
  }

  // ─── LAUNCH DASHBOARD (Canvas) ─────────────────────

  function renderLaunchDashboard() {
    var el = getCanvasEl('execution');
    if (!el) return;

    var campaigns = [
      { name: 'Google Search \u2014 Wagyu', platform: 'google', status: 'Active', budget: '$125/day' },
      { name: 'Google Shopping \u2014 All Products', platform: 'google', status: 'Active', budget: '$68/day' },
      { name: 'Meta \u2014 Awareness Campaign', platform: 'meta', status: 'In Review', budget: '$45/day' },
      { name: 'Meta \u2014 Retargeting', platform: 'meta', status: 'Active', budget: '$30/day' },
      { name: 'Meta \u2014 Lookalike Audiences', platform: 'meta', status: 'In Review', budget: '$25/day' }
    ];

    var html = '<div class="v3-launch-dashboard">';
    html += '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">Campaign Status</span><span class="v3-report-badge">Live</span></div>';
    html += '<div class="v3-report-body">';

    html += '<div class="v3-campaign-list">';
    campaigns.forEach(function(c) {
      var statusCls = c.status === 'Active' ? 'active' : 'in-review';
      html += '<div class="v3-campaign-row">';
      html += '<span class="v3-campaign-platform-tag ' + c.platform + '">' + c.platform + '</span>';
      html += '<span class="v3-campaign-name">' + esc(c.name) + '</span>';
      html += '<span class="v3-campaign-status ' + statusCls + '">' + esc(c.status) + '</span>';
      html += '<span class="v3-campaign-budget">' + esc(c.budget) + '</span>';
      html += '</div>';
    });
    html += '</div>';

    // Tracking status
    html += '<div class="v3-tracking-status">';
    html += '<div class="v3-tracking-item"><div class="v3-tracking-name">Meta Pixel</div><div class="v3-tracking-detail">95% event match</div></div>';
    html += '<div class="v3-tracking-item"><div class="v3-tracking-name">Google Tags</div><div class="v3-tracking-detail">3 conversions</div></div>';
    html += '<div class="v3-tracking-item"><div class="v3-tracking-name">UTM Params</div><div class="v3-tracking-detail">All tagged</div></div>';
    html += '</div>';

    html += '</div></div></div>';
    el.innerHTML = html;
  }

  // ─── OPENCLAW DASHBOARD (Canvas) ───────────────────

  function renderOpenclawDashboard() {
    var el = getCanvasEl('openclaw');
    if (!el) return;

    // Don't override if detail view is active
    if (state.canvasDetailActive) return;

    // Show loading state
    el.innerHTML = '<div class="v3-openclaw-loading">Loading monitor data...</div>';

    // Fetch action cards from API
    fetch('/api/v1/action-cards')
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch action cards');
        return res.json();
      })
      .then(function(data) {
        var actions = data.actions || { active: [], completed: [] };
        var html = '<div class="v3-openclaw-dashboard">';

        // Status header
        html += '<div class="v3-openclaw-header">';
        html += '<div class="v3-openclaw-pulse"></div>';
        html += '<span class="v3-openclaw-status-text">OpenClaw Active</span>';
        html += '<span class="v3-openclaw-checks">Last check: 8 min ago | Next: 22 min</span>';
        html += '</div>';

        // Pending cards section (v0.2 pattern: compact cards that expand on click)
        if (actions.active && actions.active.length > 0) {
          html += '<div class="v3-openclaw-pending-section"><h4>Pending Actions (' + actions.active.length + ')</h4>';
          actions.active.forEach(function(card) {
            var severity = card.severity || 'info';
            html += '<div class="v3-openclaw-pending-card severity-' + severity + '" onclick="V3.showCardDetail(\'' + escAttr(card.id) + '\')">';
            html += '<div class="v3-openclaw-pending-title">' + esc(card.title) + '</div>';
            html += '<div class="v3-openclaw-pending-summary">' + esc((card.body || '').substring(0, 80));
            if ((card.body || '').length > 80) html += '...';
            html += '</div>';
            html += '<span class="v3-openclaw-tap-hint">Tap to review →</span>';
            html += '</div>';
          });
          html += '</div>';

          // Update badge
          updateMonitorBadge(actions.active.length);
        } else {
          html += '<div class="v3-openclaw-no-pending">✓ No pending actions</div>';
          updateMonitorBadge(0);
        }

        // What it's watching
        html += '<div class="v3-openclaw-watching"><h4>Monitoring</h4><ul>';
        html += '<li>Cost per customer across all audiences</li>';
        html += '<li>Click rates on all ad creatives</li>';
        html += '<li>Tracking pixel health & data accuracy</li>';
        html += '<li>Budget pacing (too fast or too slow)</li>';
        html += '</ul></div>';

        // Recent actions (completed)
        if (actions.completed && actions.completed.length > 0) {
          html += '<div class="v3-openclaw-actions-log"><h4>Recent Actions</h4>';
          actions.completed.forEach(function(card) {
            html += '<div class="v3-openclaw-action-item">';
            html += '<span class="v3-openclaw-action-time">' + esc(card.timestamp || 'Recently') + '</span>';
            html += '<div><div class="v3-openclaw-action-text">' + esc(card.title) + '</div>';
            if (card.impact) html += '<div class="v3-openclaw-action-impact">' + esc(card.impact) + '</div>';
            html += '</div></div>';
          });
          html += '</div>';
        } else {
          // Fallback static data
          html += '<div class="v3-openclaw-actions-log"><h4>Recent Actions</h4>';
          html += '<div class="v3-openclaw-action-item"><span class="v3-openclaw-action-time">2:14 PM</span><div><div class="v3-openclaw-action-text">Added 12 negative keywords</div><div class="v3-openclaw-action-impact">$45/week savings</div></div></div>';
          html += '<div class="v3-openclaw-action-item"><span class="v3-openclaw-action-time">Yesterday</span><div><div class="v3-openclaw-action-text">Adjusted Shopping bid strategy</div><div class="v3-openclaw-action-impact">+8% impression share</div></div></div>';
          html += '<div class="v3-openclaw-action-item"><span class="v3-openclaw-action-time">2 days ago</span><div><div class="v3-openclaw-action-text">Paused underperforming ad variant</div><div class="v3-openclaw-action-impact">$12/week savings</div></div></div>';
          html += '</div>';
        }

        html += '</div>';
        el.innerHTML = html;
      })
      .catch(function(err) {
        console.error('Failed to load OpenClaw dashboard:', err);
        // Fallback to static content
        var html = '<div class="v3-openclaw-dashboard">';
        html += '<div class="v3-openclaw-header">';
        html += '<div class="v3-openclaw-pulse"></div>';
        html += '<span class="v3-openclaw-status-text">OpenClaw Active</span>';
        html += '<span class="v3-openclaw-checks">Last check: 8 min ago | Next: 22 min</span>';
        html += '</div>';
        html += '<div class="v3-openclaw-no-pending">✓ No pending actions</div>';
        html += '<div class="v3-openclaw-watching"><h4>Monitoring</h4><ul>';
        html += '<li>Cost per customer across all audiences</li>';
        html += '<li>Click rates on all ad creatives</li>';
        html += '<li>Tracking pixel health & data accuracy</li>';
        html += '<li>Budget pacing (too fast or too slow)</li>';
        html += '</ul></div>';
        html += '</div>';
        el.innerHTML = html;
        updateMonitorBadge(0);
      });
  }

  function renderOpenclawAlert() {
    // Already showing alert in chat; update openclaw canvas with alert detail
    renderOpenclawDashboard();
  }

  function renderOpenclawActions() {
    renderOpenclawDashboard();
  }

  function updateMonitorBadge(pendingCount) {
    var monitorTab = document.querySelector('.v3-tab[data-tab="openclaw"]');
    if (!monitorTab) return;
    var dot = monitorTab.querySelector('.v3-tab-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'v3-tab-dot';
      monitorTab.appendChild(dot);
    }
    dot.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }

  function showCardDetail(cardId) {
    if (!cardId) return;
    
    // Fetch card detail from API
    fetch('/api/v1/action-cards/' + encodeURIComponent(cardId))
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch card detail');
        return res.json();
      })
      .then(function(data) {
        var el = getCanvasEl('openclaw');
        if (!el) return;
        
        var card = data.card || data;
        var html = '<div class="v3-card-detail-view">';
        
        // Back button
        html += '<div class="v3-card-detail-header">';
        html += '<button class="v3-card-detail-back" onclick="V3.hideCardDetail()">← Back to Monitor</button>';
        html += '</div>';
        
        // Card detail content
        html += '<div class="v3-card-detail-content">';
        html += '<h2>' + esc(card.title) + '</h2>';
        
        if (card.attribution) {
          html += '<div class="v3-card-attribution" style="margin: 12px 0;"><span class="v3-attr-icon">' + esc(card.attribution.icon || '🤖') + '</span><span class="v3-attr-label">' + esc(card.attribution.label || card.attribution.role) + '</span></div>';
        }
        
        if (card.body) html += '<div class="v3-card-detail-body">' + esc(card.body) + '</div>';
        if (card.cause) html += '<div class="v3-card-detail-cause"><strong>Why:</strong> ' + esc(card.cause) + '</div>';
        if (card.recommendation) html += '<div class="v3-card-detail-rec"><strong>Recommendation:</strong> ' + esc(card.recommendation) + '</div>';
        if (card.impact) html += '<div class="v3-card-detail-impact"><strong>Impact:</strong> ' + esc(card.impact) + '</div>';
        
        // Metrics if available
        if (card.metrics) {
          html += '<div class="v3-card-detail-metrics"><h3>Metrics</h3>';
          for (var key in card.metrics) {
            html += '<div class="v3-metric-row"><span class="v3-metric-label">' + esc(key) + '</span><span class="v3-metric-value">' + esc(card.metrics[key]) + '</span></div>';
          }
          html += '</div>';
        }
        
        // Action buttons
        if (card.actions && card.actions.length) {
          html += '<div class="v3-action-buttons-row" style="margin-top: 20px;">';
          card.actions.forEach(function(action, idx) {
            var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
            html += '<button class="' + cls + '" onclick="V3.handleCardAction(\'' + cardId + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
          });
          html += '</div>';
        }
        
        html += '</div></div>';
        el.innerHTML = html;
        state.canvasDetailActive = true;
      })
      .catch(function(err) {
        console.error('Failed to load card detail:', err);
        appendAuxoraMessage('Failed to load card details. Please try again.');
      });
  }

  function hideCardDetail() {
    state.canvasDetailActive = false;
    renderOpenclawDashboard();
  }

  function handleCardAction(cardId, action) {
    // Similar to handleActionBtn but for detail view
    sendAction(action);
    hideCardDetail();
  }

  // ─── RESULTS DASHBOARDS (Canvas) ───────────────────

  function renderResultsEarly() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';
    html += '<div class="v3-results-period-badge">First 48 Hours</div>';

    // KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$189</span><span class="v3-report-kpi-label">Revenue</span><span class="v3-report-kpi-delta up">2 purchases</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$86</span><span class="v3-report-kpi-label">Ad Spend</span><span class="v3-report-kpi-delta neutral">on budget</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$2.20</span><span class="v3-report-kpi-label">Return per $1</span><span class="v3-report-kpi-delta up">day 2</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">2</span><span class="v3-report-kpi-label">Purchases</span><span class="v3-report-kpi-delta up">first 48h</span></div>';
    html += '</div>';

    // Learning phase
    html += '<div class="v3-learning-phase">';
    html += '<div class="v3-learning-phase-label"><span>Learning Phase</span><span>Day 2 of 7</span></div>';
    html += '<div class="v3-learning-phase-bar"><div class="v3-learning-phase-fill" style="width:29%"></div></div>';
    html += '<div style="font-size:0.75rem;color:#78716C;margin-top:4px">Platforms are still learning who to show your ads to.</div>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  function renderResultsWeek1() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';
    html += '<div class="v3-results-period-badge">Week 1</div>';

    // KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$1,134</span><span class="v3-report-kpi-label">Revenue</span><span class="v3-report-kpi-delta up">8 purchases</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$388</span><span class="v3-report-kpi-label">Ad Spend</span><span class="v3-report-kpi-delta neutral">on budget</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$2.92</span><span class="v3-report-kpi-label">Return per $1</span><span class="v3-report-kpi-delta up">profitable!</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$48.50</span><span class="v3-report-kpi-label">Cost / Customer</span><span class="v3-report-kpi-delta down">improving</span></div>';
    html += '</div>';

    // By audience table
    html += '<div class="v3-results-table"><div class="v3-results-table-header">Performance by Audience</div><table>';
    html += '<tr><th>Audience</th><th>Spent</th><th>Sales</th><th>Verdict</th></tr>';
    html += '<tr><td>Wagyu Enthusiasts</td><td>$124</td><td>4</td><td><span class="v3-verdict-tag winner">Winner</span></td></tr>';
    html += '<tr><td>Health Foodies</td><td>$98</td><td>2</td><td><span class="v3-verdict-tag promising">Promising</span></td></tr>';
    html += '<tr><td>Gift Buyers</td><td>$72</td><td>1</td><td><span class="v3-verdict-tag testing">Testing</span></td></tr>';
    html += '<tr><td>Organic Buyers</td><td>$94</td><td>1</td><td><span class="v3-verdict-tag underperforming">Underperforming</span></td></tr>';
    html += '</table></div>';

    // By creative table
    html += '<div class="v3-results-table"><div class="v3-results-table-header">Performance by Ad Creative</div><table>';
    html += '<tr><th>Creative</th><th>Clicks</th><th>Sales</th><th>Verdict</th></tr>';
    html += '<tr><td>Sizzle Reel (video)</td><td>89</td><td>3</td><td><span class="v3-verdict-tag best_performer">Best</span></td></tr>';
    html += '<tr><td>Unboxing (video)</td><td>52</td><td>2</td><td><span class="v3-verdict-tag strong">Strong</span></td></tr>';
    html += '<tr><td>Premium Plating (image)</td><td>28</td><td>2</td><td><span class="v3-verdict-tag decent">Decent</span></td></tr>';
    html += '<tr><td>Lifestyle Scene (image)</td><td>17</td><td>1</td><td><span class="v3-verdict-tag below_average">Below avg</span></td></tr>';
    html += '</table></div>';

    html += '</div>';
    el.innerHTML = html;
  }

  function renderResultsComparison() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';
    html += '<div class="v3-results-period-badge">Week 1 vs Week 2</div>';

    // Comparison table
    html += '<div class="v3-comparison">';
    html += '<div class="v3-comparison-header"><span class="v3-comparison-col">Metric</span><span class="v3-comparison-col">Week 1</span><span class="v3-comparison-col">Week 2</span><span class="v3-comparison-col">Change</span></div>';
    var metrics = [
      { name: 'Revenue', w1: '$1,134', w2: '$1,890', delta: '+67%' },
      { name: 'Purchases', w1: '8', w2: '12', delta: '+50%' },
      { name: 'Return per $1', w1: '$2.92', w2: '$4.59', delta: '+57%' },
      { name: 'Cost / Customer', w1: '$48.50', w2: '$34.33', delta: '-29%' }
    ];
    metrics.forEach(function(m) {
      html += '<div class="v3-comparison-row">';
      html += '<span class="v3-comparison-metric">' + esc(m.name) + '</span>';
      html += '<span class="v3-comparison-val">' + esc(m.w1) + '</span>';
      html += '<span class="v3-comparison-val">' + esc(m.w2) + '</span>';
      html += '<span class="v3-comparison-delta">' + esc(m.delta) + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  function renderResultsWeek3() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';
    html += '<div class="v3-results-period-badge">Weeks 1-3 Trend</div>';

    // Revenue chart
    var weeks = [
      { label: 'W1', value: 1134 },
      { label: 'W2', value: 1890 },
      { label: 'W3', value: 3450 }
    ];
    var maxVal = 3450;

    html += '<div class="v3-revenue-chart">';
    weeks.forEach(function(w) {
      var h = Math.max(8, Math.round((w.value / maxVal) * 80));
      html += '<div class="v3-revenue-bar-group">';
      html += '<div class="v3-revenue-bar-value">$' + w.value.toLocaleString() + '</div>';
      html += '<div class="v3-revenue-bar" style="height:' + h + 'px"></div>';
      html += '<div class="v3-revenue-bar-label">' + w.label + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$3,450</span><span class="v3-report-kpi-label">Week 3 Revenue</span><span class="v3-report-kpi-delta up">+83%</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$5.86</span><span class="v3-report-kpi-label">Return per $1</span><span class="v3-report-kpi-delta up">+28%</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">22</span><span class="v3-report-kpi-label">Purchases</span><span class="v3-report-kpi-delta up">+83%</span></div>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  function renderResultsMonth1() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';

    // Hero stat
    html += '<div class="v3-results-hero-stat">';
    html += '<div class="v3-results-hero-value">$5.75x</div>';
    html += '<div class="v3-results-hero-label">Average Return per $1 \u2014 Month 1</div>';
    html += '</div>';

    // Revenue chart
    var weeks = [
      { label: 'W1', value: 1134 },
      { label: 'W2', value: 1890 },
      { label: 'W3', value: 3450 },
      { label: 'W4', value: 5780 }
    ];
    var maxVal = 5780;

    html += '<div class="v3-revenue-chart">';
    weeks.forEach(function(w) {
      var h = Math.max(8, Math.round((w.value / maxVal) * 80));
      html += '<div class="v3-revenue-bar-group">';
      html += '<div class="v3-revenue-bar-value">$' + w.value.toLocaleString() + '</div>';
      html += '<div class="v3-revenue-bar" style="height:' + h + 'px"></div>';
      html += '<div class="v3-revenue-bar-label">' + w.label + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Summary KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$12,254</span><span class="v3-report-kpi-label">Total Revenue</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$2,131</span><span class="v3-report-kpi-label">Total Spend</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$10,123</span><span class="v3-report-kpi-label">Net Profit</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">77</span><span class="v3-report-kpi-label">Customers</span></div>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  function renderResultsMonth2() {
    var el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-results-dashboard">';
    html += '<div class="v3-results-period-badge">Month 2</div>';

    // Goal progress
    html += '<div class="v3-goal-progress">';
    html += '<div class="v3-goal-progress-header"><span class="v3-goal-progress-label">Progress to $50K Target</span><span class="v3-goal-progress-target">$25,420 / $50,000</span></div>';
    html += '<div class="v3-goal-bar"><div class="v3-goal-fill" style="width:50%"></div></div>';
    html += '<div class="v3-goal-marker">YOU ARE HERE: Month 2 \u2014 50% to intermediate target</div>';
    html += '</div>';

    // Projected revenue chart
    var months = [
      { label: 'M1', value: 12254, actual: true },
      { label: 'M2', value: 25420, actual: true },
      { label: 'M3', value: 38000, actual: false },
      { label: 'M4', value: 50000, actual: false },
      { label: 'M5', value: 65000, actual: false },
      { label: 'M6', value: 80000, actual: false }
    ];
    var maxVal = 80000;

    html += '<div class="v3-revenue-chart" style="height:140px">';
    months.forEach(function(m) {
      var h = Math.max(8, Math.round((m.value / maxVal) * 100));
      html += '<div class="v3-revenue-bar-group">';
      html += '<div class="v3-revenue-bar-value">$' + (m.value / 1000).toFixed(0) + 'K</div>';
      html += '<div class="v3-revenue-bar" style="height:' + h + 'px;' + (m.actual ? '' : 'opacity:0.4;border:1px dashed var(--auxora-primary-400);background:transparent') + '"></div>';
      html += '<div class="v3-revenue-bar-label">' + m.label + (m.actual ? '' : ' (proj)') + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // KPIs
    html += '<div class="v3-report-kpis">';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$25,420</span><span class="v3-report-kpi-label">Revenue</span><span class="v3-report-kpi-delta up">+107%</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$6.08</span><span class="v3-report-kpi-label">Return per $1</span><span class="v3-report-kpi-delta up">stable</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">159</span><span class="v3-report-kpi-label">Total Customers</span><span class="v3-report-kpi-delta up">+82 repeat</span></div>';
    html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">$4,180</span><span class="v3-report-kpi-label">Ad Spend</span><span class="v3-report-kpi-delta neutral">on budget</span></div>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  // ─── SCALING PLAN (Canvas) ─────────────────────────

  function renderScalingPlan() {
    var el = getCanvasEl('execution');
    if (!el) return;

    var html = '<div class="v3-scaling-plan">';
    html += '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">Growth Plan</span><span class="v3-report-badge">Phase 3</span></div>';
    html += '<div class="v3-report-body">';

    // Phase progression
    html += '<div class="v3-scaling-progression">';
    html += '<div class="v3-scaling-phase completed"><div class="v3-scaling-phase-name">Phase 1</div><div class="v3-scaling-phase-budget">$390/wk</div><div class="v3-scaling-phase-detail">Test & Learn</div></div>';
    html += '<div class="v3-scaling-phase completed"><div class="v3-scaling-phase-name">Phase 2</div><div class="v3-scaling-phase-budget">$590/wk</div><div class="v3-scaling-phase-detail">Optimize</div></div>';
    html += '<div class="v3-scaling-phase current"><div class="v3-scaling-phase-name">Phase 3</div><div class="v3-scaling-phase-budget">$1,500/wk</div><div class="v3-scaling-phase-detail">Scale</div></div>';
    html += '</div>';

    // Projected revenue
    html += '<div class="v3-report-section"><h4>Revenue Trajectory</h4><ul>';
    html += '<li>Month 1: $12,254 (actual)</li>';
    html += '<li>Month 2: $25,420 (actual)</li>';
    html += '<li>Month 3: $38,000 (projected)</li>';
    html += '<li>Month 4: $50,000 (target)</li>';
    html += '<li>Month 6: $80,000+ (stretch goal)</li>';
    html += '</ul></div>';

    // New channels
    html += '<div class="v3-report-section"><h4>New Channels</h4><ul>';
    html += '<li>TikTok Ads (10% of budget) \u2014 Video-first platform</li>';
    html += '<li>Email Retargeting \u2014 Zero ad cost, repeat orders</li>';
    html += '</ul></div>';

    html += '</div></div></div>';
    el.innerHTML = html;
  }

  // ─── TYPING INDICATOR ──────────────────────────────

  function showTyping() {
    if (state.typingEl) return;
    var div = document.createElement('div');
    div.className = 'v3-typing';
    div.id = 'typingIndicator';
    div.innerHTML =
      '<div class="v3-avatar auxora-av thinking">A</div>' +
      '<div class="v3-typing-dots">' +
        '<div class="v3-typing-dot"></div>' +
        '<div class="v3-typing-dot"></div>' +
        '<div class="v3-typing-dot"></div>' +
      '</div>';
    chatMessages.appendChild(div);
    state.typingEl = div;
    scrollToBottom();
  }

  function hideTyping() {
    if (state.typingEl) {
      state.typingEl.remove();
      state.typingEl = null;
    }
  }

  // ─── CHAT PROGRESS BAR (shown during report generation) ──

  function showChatProgress(data) {
    dismissChatProgress(); // remove any existing
    var div = document.createElement('div');
    div.className = 'v3-chat-progress';
    div.id = 'chatProgressBar';

    var html = '<div class="v3-chat-progress-inner">';
    html += '<div class="v3-chat-progress-title">' + esc(data.title || 'Working...') + '</div>';
    html += '<div class="v3-chat-progress-bar"><div class="v3-chat-progress-fill" id="chatProgressFill"></div></div>';
    html += '<div class="v3-chat-progress-steps">';
    if (data.steps) {
      data.steps.forEach(function(step, idx) {
        html += '<div class="v3-chat-progress-step pending" data-idx="' + idx + '">';
        html += '<span class="v3-chat-progress-check"></span>';
        html += '<span>' + esc(step) + '</span>';
        html += '</div>';
      });
    }
    html += '</div></div>';

    div.innerHTML = html;
    chatMessages.appendChild(div);
    scrollToBottom();

    // Animate steps
    var steps = div.querySelectorAll('.v3-chat-progress-step');
    var fill = document.getElementById('chatProgressFill');
    var total = steps.length || 1;
    for (var i = 0; i < steps.length; i++) {
      (function(idx) {
        setTimeout(function() {
          steps[idx].classList.remove('pending');
          steps[idx].classList.add('done');
          if (fill) fill.style.width = Math.round(((idx + 1) / total) * 100) + '%';
          scrollToBottom();
        }, 1200 * (idx + 1));
      })(i);
    }
  }

  function dismissChatProgress() {
    var el = document.getElementById('chatProgressBar');
    if (el) {
      el.classList.add('finishing');
      // Fill bar to 100% then fade out
      var fill = el.querySelector('.v3-chat-progress-fill');
      if (fill) fill.style.width = '100%';
      var steps = el.querySelectorAll('.v3-chat-progress-step');
      steps.forEach(function(s) { s.classList.remove('pending'); s.classList.add('done'); });
      setTimeout(function() { if (el.parentNode) el.remove(); }, 800);
    }
  }

  // ─── NEW CARD RENDERERS (Pro-Level Facebook Ads) ────

  function renderObjectivePickerCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('obj');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';
    if (d.subtitle) html += '<div class="v3-action-body" style="margin-bottom:10px">' + esc(d.subtitle) + '</div>';

    html += '<div class="v3-objective-grid">';
    d.objectives.forEach(function(obj) {
      var icons = { eye: '\uD83D\uDC41', click: '\uD83D\uDD17', heart: '\u2764\uFE0F', form: '\uD83D\uDCCB', phone: '\uD83D\uDCF1', cart: '\uD83D\uDED2', grid: '\uD83D\uDDC2' };
      var cls = 'v3-objective-tile' + (obj.recommended ? ' recommended' : '');
      html += '<div class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(obj.label) + '\')">';
      html += '<div class="v3-objective-icon">' + (icons[obj.icon] || '\u2B50') + '</div>';
      html += '<div class="v3-objective-label">' + esc(obj.label) + '</div>';
      html += '<div class="v3-objective-desc">' + esc(obj.desc) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    if (d.detail) html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    if (d.proDetail) html += '<div class="v3-pro-detail">' + esc(d.proDetail) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderCampaignStructureCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('struct');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';
    if (d.subtitle) html += '<div class="v3-action-body" style="margin-bottom:10px">' + esc(d.subtitle) + '</div>';

    // Campaign tree
    if (d.structure) {
      var s = d.structure;
      html += '<div class="v3-campaign-tree">';
      html += '<div class="v3-tree-branch" style="padding-left:0">';
      html += '<div class="v3-tree-branch-icon campaign">C</div>';
      html += '<div class="v3-tree-branch-name">' + esc(s.campaign) + '</div>';
      html += '<div class="v3-tree-branch-meta">' + esc(s.model) + '</div>';
      html += '</div>';

      html += '<div class="v3-tree-node">';
      s.adSets.forEach(function(adSet, asIdx) {
        var treeId = id + '-as-' + asIdx;
        html += '<div class="v3-tree-branch" onclick="V3.toggleTreeNode(\'' + treeId + '\')">';
        html += '<span class="v3-tree-toggle" id="' + treeId + '-toggle">\u25B6</span>';
        html += '<div class="v3-tree-branch-icon adset">AS</div>';
        html += '<div class="v3-tree-branch-name">' + esc(adSet.name) + '</div>';
        html += '<div class="v3-tree-branch-meta">' + adSet.ads.length + ' ads</div>';
        html += '</div>';

        html += '<div class="v3-tree-children collapsed" id="' + treeId + '">';
        html += '<div class="v3-tree-leaf">';
        adSet.ads.forEach(function(ad) {
          html += '<div class="v3-tree-branch">';
          html += '<div class="v3-tree-branch-icon ad">A</div>';
          html += '<div class="v3-tree-branch-name" style="font-size:0.75rem">' + esc(ad) + '</div>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div></div>';
    }

    if (d.detail) html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    if (d.proDetail) html += '<div class="v3-pro-detail">' + esc(d.proDetail) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderAudienceBuilderCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('aud');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';

    if (d.audiences) {
      d.audiences.forEach(function(aud) {
        html += '<div class="v3-audience-row">';
        html += '<div class="v3-audience-info">';
        html += '<div class="v3-audience-name">' + esc(aud.name) + ' <span class="v3-audience-type ' + aud.type + '">' + esc(aud.type) + '</span></div>';
        html += '<div class="v3-audience-meta">' + esc(aud.size) + ' people \u2022 ' + esc(aud.demographics) + '</div>';
        html += '</div>';
        html += '<div class="v3-audience-budget-bar"><div class="v3-audience-budget-fill ' + aud.type + '" style="width:' + (aud.budget * 2) + '%"></div></div>';
        html += '<div class="v3-audience-budget-label">' + aud.budget + '%</div>';
        html += '</div>';
      });
    }

    if (d.rules) {
      html += '<div class="v3-budget-rules">';
      d.rules.forEach(function(r) {
        html += '<div class="v3-budget-rule">';
        html += '<div class="v3-budget-rule-check ' + r.status + '">' + (r.status === 'pass' ? '\u2713' : '\u2717') + '</div>';
        html += '<span>' + esc(r.rule) + ' \u2014 ' + esc(r.current) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (d.detail) html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    if (d.proDetail) html += '<div class="v3-pro-detail">' + esc(d.proDetail) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderBudgetWaterfallCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('water');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';
    if (d.subtitle) html += '<div class="v3-action-body" style="margin-bottom:10px">' + esc(d.subtitle) + '</div>';

    if (d.allocation) {
      html += '<div class="v3-waterfall-chart">';
      d.allocation.forEach(function(a) {
        html += '<div class="v3-waterfall-bar" style="flex:' + a.pct + ';background:' + a.color + '">' + a.pct + '% ' + a.type.split(' ')[0] + '</div>';
      });
      html += '</div>';

      html += '<div class="v3-waterfall-legend">';
      d.allocation.forEach(function(a) {
        html += '<div class="v3-waterfall-legend-item"><div class="v3-waterfall-legend-dot" style="background:' + a.color + '"></div>' + esc(a.type) + ' ' + esc(a.amount) + '</div>';
      });
      html += '</div>';
    }

    if (d.rules) {
      html += '<div class="v3-budget-rules">';
      d.rules.forEach(function(r) {
        html += '<div class="v3-budget-rule">';
        html += '<div class="v3-budget-rule-check ' + r.status + '">' + (r.status === 'pass' ? '\u2713' : '\u2717') + '</div>';
        html += '<span>' + esc(r.rule) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (d.detail) html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    if (d.proDetail) html += '<div class="v3-pro-detail">' + esc(d.proDetail) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderCreativePreviewCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('cre');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';

    var icons = { video: '\uD83C\uDFA5', image: '\uD83D\uDDBC', carousel: '\uD83D\uDDC2' };

    if (d.categories) {
      d.categories.forEach(function(cat) {
        html += '<div class="v3-creative-category-label">' + esc(cat.category) + '</div>';
        html += '<div class="v3-creative-grid">';
        cat.creatives.forEach(function(c) {
          html += '<div class="v3-creative-thumb">';
          html += '<div class="v3-creative-thumb-preview">' + (icons[c.type] || '\uD83D\uDDBC') + '</div>';
          html += '<div class="v3-creative-thumb-name">' + esc(c.name) + '</div>';
          html += '<div class="v3-creative-thumb-format">' + esc(c.format) + '</div>';
          if (c.placements) {
            html += '<div class="v3-placement-tags">';
            c.placements.forEach(function(p) {
              html += '<span class="v3-placement-tag">' + esc(p) + '</span>';
            });
            html += '</div>';
          }
          html += '</div>';
        });
        html += '</div>';
      });
    }

    if (d.detail) html += '<div class="v3-action-detail">' + esc(d.detail) + '</div>';
    if (d.proDetail) html += '<div class="v3-pro-detail">' + esc(d.proDetail) + '</div>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderReviewSummaryCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('rev');
    var html = '<div class="v3-card action severity-success" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-header">';
    html += '<span class="v3-action-title">' + esc(d.title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';
    if (d.subtitle) html += '<div class="v3-action-body" style="margin-bottom:10px">' + esc(d.subtitle) + '</div>';

    if (d.summary) {
      html += '<div class="v3-review-summary">';
      var keys = Object.keys(d.summary);
      keys.forEach(function(key) {
        html += '<div class="v3-review-row">';
        html += '<div class="v3-review-label">' + esc(key) + '</div>';
        html += '<div class="v3-review-value">' + esc(d.summary[key]) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderNotificationSettingsCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('notif');
    var html = '<div class="v3-card action severity-info" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-title" style="margin-bottom:8px">' + esc(d.title) + '</div>';
    if (d.subtitle) html += '<div class="v3-action-body" style="margin-bottom:10px">' + esc(d.subtitle) + '</div>';

    var tierIcons = { passive: '\uD83D\uDC41', weekly: '\uD83D\uDCC5', daily: '\u2600\uFE0F' };

    if (d.tiers) {
      html += '<div class="v3-notification-tiers">';
      d.tiers.forEach(function(tier) {
        var cls = 'v3-notification-tier' + (tier.recommended ? ' recommended' : '');
        html += '<div class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(tier.label) + '\')">';
        html += '<div class="v3-notification-tier-icon">' + (tierIcons[tier.id] || '\uD83D\uDD14') + '</div>';
        html += '<div class="v3-notification-tier-info">';
        html += '<div class="v3-notification-tier-label">' + esc(tier.label) + (tier.recommended ? ' (recommended)' : '') + '</div>';
        html += '<div class="v3-notification-tier-desc">' + esc(tier.desc) + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    if (d.emergencyNote) {
      html += '<div class="v3-notification-emergency">\u26A0 ' + esc(d.emergencyNote) + '</div>';
    }

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderDailyBriefingEnhanced(d) {
    if (!d) return;
    var el = getCanvasEl(state.currentTab);
    if (!el) el = getCanvasEl('results');
    if (!el) return;

    var html = '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">' + esc(d.title) + '</span>';
    if (d.badge) html += '<span class="v3-report-badge">' + esc(d.badge) + '</span>';
    html += '</div><div class="v3-report-body">';

    // KPIs (positive first)
    if (d.kpis) {
      html += '<div class="v3-report-kpis">';
      d.kpis.forEach(function(k) {
        var cls = k.trend === 'up' ? 'up' : (k.trend === 'down' ? 'down' : 'neutral');
        html += '<div class="v3-report-kpi"><span class="v3-report-kpi-value">' + esc(k.value) + '</span>';
        html += '<span class="v3-report-kpi-label">' + esc(k.label) + '</span>';
        html += '<span class="v3-report-kpi-delta ' + cls + '">' + esc(k.delta) + '</span></div>';
      });
      html += '</div>';
    }

    // Daily spend tracker
    if (d.spendTracker) {
      var st = d.spendTracker;
      var maxBudget = 0;
      st.days.forEach(function(day) { if (day.budget > maxBudget) maxBudget = day.budget; });
      if (maxBudget === 0) maxBudget = 1;

      html += '<div class="v3-report-section"><h4>Weekly Spend Pacing</h4>';
      html += '<div class="v3-daily-spend-tracker">';
      st.days.forEach(function(day) {
        var budgetH = Math.round((day.budget / maxBudget) * 36);
        var actualH = day.spent > 0 ? Math.max(4, Math.round((day.spent / maxBudget) * 36)) : 0;
        var status = day.spent === 0 ? 'pending' : (day.spent <= day.budget ? 'on_track' : 'slight_over');
        html += '<div class="v3-spend-day">';
        html += '<div class="v3-spend-day-bar-wrap">';
        html += '<div class="v3-spend-day-budget" style="height:' + budgetH + 'px"></div>';
        if (day.spent > 0) html += '<div class="v3-spend-day-actual ' + status + '" style="height:' + actualH + 'px"></div>';
        html += '</div>';
        html += '<div class="v3-spend-day-label">' + esc(day.day) + '</div>';
        if (day.spent > 0) html += '<div class="v3-spend-day-amount">$' + day.spent + '</div>';
        html += '</div>';
      });
      html += '</div>';

      var totalSpent = 0;
      st.days.forEach(function(d) { totalSpent += d.spent; });
      html += '<div class="v3-spend-tracker-summary"><span>Spent: $' + totalSpent + '</span><span>Budget: $' + st.budget + '/wk</span></div>';
      html += '</div>';
    }

    // Sections
    if (d.sections) {
      d.sections.forEach(function(s) {
        html += '<div class="v3-report-section"><h4>' + esc(s.title) + '</h4><ul>';
        s.items.forEach(function(item) { html += '<li>' + esc(item) + '</li>'; });
        html += '</ul></div>';
      });
    }

    html += '</div></div>';
    el.innerHTML = html;
  }

  // ─── NEW CANVAS RENDERERS ─────────────────────────

  function renderCampaignHierarchy() {
    var d = resolveCardData('campaignHierarchy');
    if (!d) return;
    var el = getCanvasEl('execution');
    if (!el) return;

    var html = '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">' + esc(d.campaign.name) + '</span>';
    html += '<span class="v3-report-badge">' + esc(d.campaign.objective) + '</span></div>';
    html += '<div class="v3-report-body">';

    html += '<div class="v3-campaign-tree">';
    html += '<div class="v3-tree-node v3-tree-branch campaign"><span class="v3-tree-branch-icon campaign">\uD83C\uDFAF</span>' + esc(d.campaign.name) + ' — $' + d.campaign.dailyBudget + '/day CBO</div>';

    d.campaign.adSets.forEach(function(adSet, i) {
      var nodeId = 'tree-adset-' + i;
      html += '<div class="v3-tree-node" style="margin-left:24px">';
      html += '<div class="v3-tree-branch adset" id="' + nodeId + '" onclick="V3.toggleTreeNode(\'' + nodeId + '-children\')">';
      html += '<span class="v3-tree-branch-icon adset">\uD83D\uDC65</span>';
      html += '<span class="v3-audience-type ' + adSet.type + '">' + esc(adSet.type) + '</span> ';
      html += esc(adSet.name) + ' — $' + adSet.budget + '/day</div>';

      html += '<div class="v3-tree-children" id="' + nodeId + '-children">';
      adSet.ads.forEach(function(ad) {
        html += '<div class="v3-tree-node v3-tree-leaf" style="margin-left:24px">';
        html += '<span class="v3-tree-branch-icon ad">\uD83D\uDCCB</span>';
        html += esc(ad.name) + ' <span style="opacity:.6">(' + esc(ad.format) + ')</span>';
        if (ad.roas) html += ' <span class="v3-report-kpi-delta up">ROAS ' + ad.roas + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });

    html += '</div>';
    html += '</div></div>';
    el.innerHTML = html;
  }

  function renderBudgetWaterfallCanvas() {
    var d = resolveCardData('budgetWaterfall');
    if (!d) return;
    var el = getCanvasEl('execution');
    if (!el) return;

    var html = '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">' + esc(d.title) + '</span></div>';
    html += '<div class="v3-report-body">';

    html += '<div class="v3-waterfall-chart">';
    d.allocations.forEach(function(a) {
      html += '<div class="v3-waterfall-bar-row">';
      html += '<span class="v3-waterfall-label">' + esc(a.type) + '</span>';
      html += '<div class="v3-waterfall-bar-track">';
      html += '<div class="v3-waterfall-bar ' + a.type.toLowerCase().replace(/\s/g, '') + '" style="width:' + a.pct + '%"></div>';
      html += '</div>';
      html += '<span class="v3-waterfall-pct">' + a.pct + '% ($' + a.amount + ')</span>';
      html += '</div>';
    });
    html += '</div>';

    if (d.rules) {
      html += '<div class="v3-report-section"><h4>Budget Rules</h4><ul>';
      d.rules.forEach(function(r) { html += '<li>' + esc(r) + '</li>'; });
      html += '</ul></div>';
    }

    html += '</div></div>';
    el.innerHTML = html;
  }

  function renderCreativeComparisonCanvas() {
    var d = resolveCardData('creativeComparison');
    if (!d) return;
    var el = getCanvasEl('results');
    if (!el) el = getCanvasEl('openclaw');
    if (!el) return;

    var html = '<div class="v3-report-card">';
    html += '<div class="v3-report-header"><span class="v3-report-title">' + esc(d.title) + '</span></div>';
    html += '<div class="v3-report-body">';

    html += '<table class="v3-comparison-table"><thead><tr>';
    html += '<th>Creative</th><th>Category</th><th>Spend</th><th>ROAS</th><th>CTR</th><th>Purchases</th><th>Status</th>';
    html += '</tr></thead><tbody>';
    d.creatives.forEach(function(c) {
      var statusCls = c.status === 'Active' ? 'up' : (c.status === 'Paused' ? 'down' : 'neutral');
      html += '<tr>';
      html += '<td>' + esc(c.name) + '</td>';
      html += '<td><span class="v3-audience-type ' + c.category.toLowerCase() + '">' + esc(c.category) + '</span></td>';
      html += '<td>$' + c.spend + '</td>';
      html += '<td class="v3-report-kpi-delta ' + (c.roas >= 3 ? 'up' : 'neutral') + '">' + c.roas + '</td>';
      html += '<td>' + c.ctr + '%</td>';
      html += '<td>' + c.purchases + '</td>';
      html += '<td><span class="v3-report-kpi-delta ' + statusCls + '">' + esc(c.status) + '</span></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';

    html += '</div></div>';
    el.innerHTML = html;
  }

  // ─── PRO MODE TOGGLE ──────────────────────────────

  function toggleProMode() {
    state.proMode = !state.proMode;
    var toggle = document.getElementById('proModeToggle');
    if (toggle) {
      if (state.proMode) {
        toggle.classList.add('pro');
        document.body.classList.add('pro-mode');
      } else {
        toggle.classList.remove('pro');
        document.body.classList.remove('pro-mode');
      }
    }
    // Update mode labels
    var labels = toggle ? toggle.querySelectorAll('.v3-mode-label') : [];
    labels.forEach(function(l) {
      var mode = l.getAttribute('data-mode');
      if ((mode === 'pro' && state.proMode) || (mode === 'amateur' && !state.proMode)) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  }

  // ─── AGENT STATUS BAR (Auto-Collapse) ──────────────

  function toggleAgentDrawer() {
    var expanded = document.getElementById('agentExpanded');
    if (!expanded) return;
    state.agentDrawerOpen = !state.agentDrawerOpen;
    expanded.style.display = state.agentDrawerOpen ? 'block' : 'none';
    var bar = document.getElementById('agentStatusBar');
    if (bar) bar.classList.toggle('expanded', state.agentDrawerOpen);
  }

  function handleAgentAction(data) {
    state.agentActions.push(data);
    var bar = document.getElementById('agentStatusBar');
    var list = document.getElementById('agentActionsList');
    var statusText = document.getElementById('agentStatusText');
    var count = document.getElementById('agentActionCount');
    var spinner = document.getElementById('agentStatusSpinner');

    if (!bar || !list) return;

    // Show status bar
    bar.style.display = 'flex';
    if (spinner) spinner.classList.add('active');
    if (statusText) statusText.textContent = data.text || data.action || 'Working...';
    if (count) count.textContent = state.agentActions.length + ' actions';

    // Add to expanded log
    var actionId = 'agent-action-' + state.agentActions.length;
    var html = '<div class="v3-agent-action" id="' + actionId + '">';
    html += '<div class="v3-agent-action-spinner"></div>';
    html += '<div style="flex:1">';
    html += '<div class="v3-agent-action-text">' + esc(data.text || data.action) + '</div>';
    html += '</div>';
    html += '<div class="v3-agent-action-time">' + getTimestamp() + '</div>';
    html += '</div>';
    list.insertAdjacentHTML('beforeend', html);

    // Auto-complete spinner after delay
    if (data.duration || !data.persistent) {
      setTimeout(function() {
        var el = document.getElementById(actionId);
        if (el) {
          var sp = el.querySelector('.v3-agent-action-spinner');
          if (sp) sp.classList.add('done');
        }
      }, data.duration || 2000);
    }

    // Reset auto-collapse timer: collapse after 2s of no new actions
    if (state.agentIdleTimer) clearTimeout(state.agentIdleTimer);
    state.agentIdleTimer = setTimeout(function() {
      collapseAgentBar();
    }, 2000);
  }

  function collapseAgentBar() {
    var bar = document.getElementById('agentStatusBar');
    var spinner = document.getElementById('agentStatusSpinner');
    var statusText = document.getElementById('agentStatusText');
    var count = document.getElementById('agentActionCount');
    if (spinner) spinner.classList.remove('active');
    if (statusText) statusText.textContent = state.agentActions.length + ' actions completed';
    if (count) count.textContent = state.agentActions.length;
    // Close expanded if open
    var expanded = document.getElementById('agentExpanded');
    if (expanded) expanded.style.display = 'none';
    state.agentDrawerOpen = false;
    if (bar) bar.classList.remove('expanded');
  }

  function completeAllAgentActions() {
    var list = document.getElementById('agentActionsList');
    if (!list) return;
    var spinners = list.querySelectorAll('.v3-agent-action-spinner:not(.done)');
    spinners.forEach(function(s) { s.classList.add('done'); });
    collapseAgentBar();
  }

  // ─── CANVAS DETAIL OVERLAY (WS2) ────────────────────

  function showCanvasDetail(dataKey, title) {
    console.log('[V3] showCanvasDetail called:', dataKey, 'title:', title, 'liveReport exists:', !!state.liveReport);
    var overlay = document.getElementById('canvasDetailOverlay');
    var titleEl = document.getElementById('canvasDetailTitle');
    var bodyEl = document.getElementById('canvasDetailBody');
    console.log('[V3] overlay:', !!overlay, 'bodyEl:', !!bodyEl);
    if (!overlay || !bodyEl) {
      console.warn('[V3] canvasDetailOverlay not found, creating dynamically');
      var parent = document.querySelector('.v3-content-panel') || document.body;
      overlay = document.createElement('div');
      overlay.id = 'canvasDetailOverlay';
      overlay.className = 'v3-canvas-detail-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = '<div class="v3-canvas-detail-header"><button class="v3-canvas-detail-back" onclick="V3.hideCanvasDetail()">← Back</button><span id="canvasDetailTitle" class="v3-canvas-detail-title"></span></div><div id="canvasDetailBody" class="v3-canvas-detail-body"></div>';
      parent.appendChild(overlay);
      titleEl = document.getElementById('canvasDetailTitle');
      bodyEl = document.getElementById('canvasDetailBody');
    }

    if (titleEl) titleEl.textContent = title || '';
    state.canvasDetailActive = true;

    var data = resolveCardData(dataKey);
    console.log('[V3] resolved data:', !!data, dataKey);
    // For GTM report, prefer live report from state
    if (dataKey === 'gtm-report' && state.liveReport) {
      data = state.liveReport;
      console.log('[V3] Using state.liveReport, sections:', data?.sections?.length);
    }
    var html = '';

    // Route to the appropriate detail renderer
    if (dataKey === 'gtm-report' || (data && (data.reportSections || data.executiveSummary || (data.sections && data.sections[0] && data.sections[0].sectionNumber)))) {
      html = renderGTMReportDetail(data);
    } else if (dataKey === 'competitor-analysis' || (data && data.competitors)) {
      html = renderCompetitorDetail(data);
    } else if (data && data.structure) {
      html = renderCampaignStructureDetail(data);
    } else if (data && data.audiences) {
      html = renderAudienceDetail(data);
    } else if (data && data.allocation) {
      html = renderBudgetAllocationDetail(data);
    } else if (data && data.categories) {
      html = renderCreativeDetail(data);
    } else if (data && data.summary && typeof data.summary === 'object') {
      html = renderReviewDetail(data);
    } else {
      html = '<div class="v3-canvas-detail-placeholder">Detail view not available for this item.</div>';
    }

    bodyEl.innerHTML = html;
    overlay.style.display = 'flex';
    overlay.scrollTop = 0;
  }

  function hideCanvasDetail() {
    var overlay = document.getElementById('canvasDetailOverlay');
    if (overlay) overlay.style.display = 'none';
    state.canvasDetailActive = false;
  }

  // ─── CANVAS DETAIL RENDERERS ────────────────────────

  function renderCampaignStructureDetail(d) {
    if (!d) return '';
    var html = '<div class="v3-detail-section">';
    html += '<h3>' + esc(d.title || 'Campaign Structure') + '</h3>';
    if (d.structure) {
      var s = d.structure;
      html += '<div class="v3-detail-tree">';
      html += '<div class="v3-detail-tree-root">' + esc(s.campaign) + ' <span class="v3-detail-tree-meta">' + esc(s.model) + '</span></div>';
      s.adSets.forEach(function(adSet) {
        html += '<div class="v3-detail-tree-branch">';
        html += '<div class="v3-detail-tree-adset">' + esc(adSet.name) + '</div>';
        html += '<div class="v3-detail-tree-ads">';
        adSet.ads.forEach(function(ad) {
          html += '<div class="v3-detail-tree-ad">' + esc(ad) + '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    }
    if (d.detail) html += '<p class="v3-detail-note">' + esc(d.detail) + '</p>';
    if (d.proDetail) html += '<p class="v3-detail-pro-note">' + esc(d.proDetail) + '</p>';
    html += '</div>';
    return html;
  }

  function renderAudienceDetail(d) {
    if (!d) return '';
    var html = '<div class="v3-detail-section">';
    html += '<h3>' + esc(d.title || 'Audience Breakdown') + '</h3>';
    if (d.audiences) {
      html += '<table class="v3-detail-table"><thead><tr><th>Audience</th><th>Size</th><th>Type</th><th>Budget</th><th>Demographics</th></tr></thead><tbody>';
      d.audiences.forEach(function(a) {
        html += '<tr><td><strong>' + esc(a.name) + '</strong></td><td>' + esc(a.size) + '</td>';
        html += '<td><span class="v3-audience-type ' + a.type + '">' + esc(a.type) + '</span></td>';
        html += '<td>' + esc(a.budgetAmt || a.budget + '%') + '</td>';
        html += '<td>' + esc(a.demographics) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    if (d.rules) {
      html += '<div class="v3-detail-rules">';
      d.rules.forEach(function(r) {
        html += '<div class="v3-budget-rule"><div class="v3-budget-rule-check ' + r.status + '">' + (r.status === 'pass' ? '\u2713' : '\u2717') + '</div><span>' + esc(r.rule) + ' \u2014 ' + esc(r.current) + '</span></div>';
      });
      html += '</div>';
    }
    if (d.detail) html += '<p class="v3-detail-note">' + esc(d.detail) + '</p>';
    if (d.proDetail) html += '<p class="v3-detail-pro-note">' + esc(d.proDetail) + '</p>';
    html += '</div>';
    return html;
  }

  function renderBudgetAllocationDetail(d) {
    if (!d) return '';
    var html = '<div class="v3-detail-section">';
    html += '<h3>' + esc(d.title || 'Budget Allocation') + '</h3>';
    if (d.allocation) {
      html += '<div class="v3-detail-waterfall">';
      d.allocation.forEach(function(a) {
        html += '<div class="v3-detail-waterfall-row">';
        html += '<span class="v3-detail-waterfall-label">' + esc(a.type) + '</span>';
        html += '<div class="v3-detail-waterfall-track"><div class="v3-detail-waterfall-bar" style="width:' + a.pct + '%;background:' + a.color + '"></div></div>';
        html += '<span class="v3-detail-waterfall-value">' + a.pct + '% (' + esc(a.amount) + ')</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    if (d.rules) {
      html += '<div class="v3-detail-rules" style="margin-top:20px">';
      d.rules.forEach(function(r) {
        html += '<div class="v3-budget-rule"><div class="v3-budget-rule-check ' + r.status + '">' + (r.status === 'pass' ? '\u2713' : '\u2717') + '</div><span>' + esc(r.rule) + '</span></div>';
      });
      html += '</div>';
    }
    if (d.detail) html += '<p class="v3-detail-note">' + esc(d.detail) + '</p>';
    html += '</div>';
    return html;
  }

  function renderCreativeDetail(d) {
    if (!d) return '';
    var icons = { video: '\uD83C\uDFA5', image: '\uD83D\uDDBC', carousel: '\uD83D\uDDC2' };
    var html = '<div class="v3-detail-section">';
    html += '<h3>' + esc(d.title || 'Ad Creatives') + '</h3>';
    if (d.categories) {
      d.categories.forEach(function(cat) {
        html += '<h4 class="v3-detail-category-label">' + esc(cat.category) + '</h4>';
        html += '<div class="v3-detail-creative-grid">';
        cat.creatives.forEach(function(c) {
          html += '<div class="v3-detail-creative-card">';
          html += '<div class="v3-detail-creative-icon">' + (icons[c.type] || '\uD83D\uDDBC') + '</div>';
          html += '<div class="v3-detail-creative-name">' + esc(c.name) + '</div>';
          html += '<div class="v3-detail-creative-format">' + esc(c.format) + '</div>';
          if (c.placements) {
            html += '<div class="v3-placement-tags">';
            c.placements.forEach(function(p) { html += '<span class="v3-placement-tag">' + esc(p) + '</span>'; });
            html += '</div>';
          }
          html += '</div>';
        });
        html += '</div>';
      });
    }
    if (d.detail) html += '<p class="v3-detail-note">' + esc(d.detail) + '</p>';
    html += '</div>';
    return html;
  }

  function renderReviewDetail(d) {
    if (!d) return '';
    var html = '<div class="v3-detail-section">';
    html += '<h3>' + esc(d.title || 'Campaign Review') + '</h3>';
    if (d.summary && typeof d.summary === 'object') {
      html += '<table class="v3-detail-table"><tbody>';
      Object.keys(d.summary).forEach(function(key) {
        html += '<tr><td class="v3-detail-key">' + esc(key) + '</td><td>' + esc(d.summary[key]) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    return html;
  }

  // ─── GTM REPORT RENDERER (McKinsey-style, Lovart 9-section framework) ──────

  function renderGTMReportDetail(d) {
    if (!d) return '';
    var sections = d.sections || d.reportSections || [];
    var html = '<div class="v3-gtm-report">';

    // ── Hero header (navy gradient) ──
    html += '<div class="v3-report-hero">';
    html += '<div class="v3-report-hero-prepared">Prepared by ' + esc(d.preparedBy || 'Auxora') + ' | ' + esc(d.date || '') + '</div>';
    html += '<h1 class="v3-report-hero-title">' + esc(d.companyName || 'GTM Strategy') + '</h1>';
    html += '<div class="v3-report-hero-subtitle">' + esc(d.reportTitle || 'Go-to-Market Strategy Report') + '</div>';
    html += '</div>';

    // ── Executive Summary ──
    var exec = d.executiveSummary;
    if (exec) {
      html += '<div class="v3-report-exec">';
      html += '<div class="v3-report-section-header"><span class="v3-report-section-num">0</span><span class="v3-report-section-title">Executive Summary</span></div>';
      if (exec.whatItIs) html += '<p class="v3-report-exec-lead">' + esc(exec.whatItIs) + '</p>';
      if (exec.marketGap) html += '<div class="v3-report-callout">' + esc(exec.marketGap) + '</div>';
      if (exec.strategyPhases && exec.strategyPhases.length) {
        html += '<table class="v3-report-table"><thead><tr><th>Phase</th><th>Timeline</th><th>Focus</th><th>Investment</th><th>Target Outcome</th></tr></thead><tbody>';
        exec.strategyPhases.forEach(function(p) {
          html += '<tr><td><strong>' + esc(p.phase) + '</strong></td><td>' + esc(p.timeline) + '</td><td>' + esc(p.focus) + '</td><td>' + esc(p.investment) + '</td><td>' + esc(p.targetOutcome) + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (exec.keySuccessFactors && exec.keySuccessFactors.length) {
        html += '<div class="v3-report-subsection-title">Key Success Factors</div>';
        html += '<ol class="v3-report-ordered-list">';
        exec.keySuccessFactors.forEach(function(f) { html += '<li>' + esc(f) + '</li>'; });
        html += '</ol>';
      }
      html += '</div>';
    }

    // ── Navigation + sections layout ──
    html += '<div class="v3-report-layout">';

    // Section nav sidebar
    if (sections.length > 0) {
      html += '<nav class="v3-report-nav">';
      html += '<a class="v3-report-nav-item" href="#gtm-exec" onclick="V3.navigateReportSection(\'gtm-exec\');return false;">Executive Summary</a>';
      sections.forEach(function(s, idx) {
        html += '<a class="v3-report-nav-item' + (idx === 0 ? ' active' : '') + '" href="#gtm-section-' + idx + '" onclick="V3.navigateReportSection(\'gtm-section-' + idx + '\');return false;">' + (s.sectionNumber || (idx + 1)) + '. ' + esc(s.title) + '</a>';
      });
      html += '</nav>';
    }

    // Section content
    html += '<div class="v3-report-sections">';
    sections.forEach(function(s, idx) {
      html += '<div class="v3-report-section-card" id="gtm-section-' + idx + '">';
      html += '<div class="v3-report-section-header"><span class="v3-report-section-num">' + (s.sectionNumber || (idx + 1)) + '</span><span class="v3-report-section-title">' + esc(s.title) + '</span></div>';
      html += '<div class="v3-report-section-body">';

      // ── Section 1: Growth Opportunity ──
      if (s.bigInsight) {
        html += '<blockquote class="v3-report-big-insight">' + esc(s.bigInsight.quote) + '</blockquote>';
        if (s.bigInsight.analysis) {
          s.bigInsight.analysis.split('\n\n').forEach(function(para) {
            html += '<p>' + esc(para) + '</p>';
          });
        }
        if (s.bigInsight.bottomLine) {
          html += '<div class="v3-report-callout"><strong>What this means for you:</strong> ' + esc(s.bigInsight.bottomLine) + '</div>';
        }
      }

      // ── Section 2: Market Landscape ──
      if (s.marketOverview) {
        s.marketOverview.split('\n\n').forEach(function(para) {
          html += '<p>' + esc(para) + '</p>';
        });
      }
      if (s.keyStrategicInsight) {
        html += '<div class="v3-report-callout"><strong>Key Strategic Insight:</strong> ' + esc(s.keyStrategicInsight) + '</div>';
      }

      // ── Section 3: Competitor Deep Dive ──
      if (s.competitors && s.competitors.length) {
        s.competitors.forEach(function(c, ci) {
          html += '<div class="v3-report-competitor-card">';
          html += '<div class="v3-report-competitor-header">';
          html += '<div class="v3-report-competitor-name">Competitor ' + (ci + 1) + ': ' + esc(c.name).toUpperCase() + '</div>';
          if (c.website) html += '<div class="v3-report-competitor-url">' + esc(c.website) + '</div>';
          html += '</div>';

          // Key metrics
          if (c.keyMetrics) {
            html += '<div class="v3-report-kpi-row">';
            if (c.keyMetrics.traffic) html += '<div class="v3-report-kpi-chip"><span class="v3-report-kpi-chip-val">' + esc(c.keyMetrics.traffic) + '</span><span class="v3-report-kpi-chip-label">Monthly Traffic</span></div>';
            if (c.keyMetrics.revenue) html += '<div class="v3-report-kpi-chip"><span class="v3-report-kpi-chip-val">' + esc(c.keyMetrics.revenue) + '</span><span class="v3-report-kpi-chip-label">Revenue</span></div>';
            if (c.keyMetrics.stage) html += '<div class="v3-report-kpi-chip"><span class="v3-report-kpi-chip-val">' + esc(c.keyMetrics.stage) + '</span><span class="v3-report-kpi-chip-label">Stage</span></div>';
            html += '</div>';
          }

          // Traffic sources bar
          if (c.trafficSources && c.trafficSources.length) {
            html += '<div class="v3-report-traffic-sources">';
            c.trafficSources.forEach(function(ts) {
              var pct = parseInt(ts.percentage) || 0;
              html += '<div class="v3-report-traffic-row"><span class="v3-report-traffic-label">' + esc(ts.source) + '</span><div class="v3-report-traffic-bar"><div class="v3-report-traffic-fill" style="width:' + Math.min(pct, 100) + '%"></div></div><span class="v3-report-traffic-pct">' + esc(ts.percentage) + '</span></div>';
            });
            html += '</div>';
          }

          // Strengths & weaknesses
          html += '<div class="v3-report-sw-grid">';
          if (c.strengths && c.strengths.length) {
            html += '<div class="v3-report-sw-col"><div class="v3-report-sw-title strengths">Strengths</div>';
            c.strengths.forEach(function(st) { html += '<div class="v3-report-sw-item">' + esc(st) + '</div>'; });
            html += '</div>';
          }
          if (c.weaknesses && c.weaknesses.length) {
            html += '<div class="v3-report-sw-col"><div class="v3-report-sw-title weaknesses">Vulnerabilities</div>';
            c.weaknesses.forEach(function(w) { html += '<div class="v3-report-sw-item">' + esc(w) + '</div>'; });
            html += '</div>';
          }
          html += '</div>';

          if (c.keyTakeaway) {
            html += '<div class="v3-report-callout"><strong>Key Takeaway:</strong> ' + esc(c.keyTakeaway) + '</div>';
          }
          html += '</div>'; // competitor card
        });
      }

      // ── Section 4: Ideal Customer Profile ──
      if (s.primaryPersona) {
        var pp = s.primaryPersona;
        html += '<div class="v3-report-persona-card">';
        html += '<div class="v3-report-persona-header">Primary Customer Persona</div>';
        html += '<div class="v3-report-persona-name">' + esc(pp.name) + '</div>';
        if (pp.demographics && pp.demographics.length) {
          html += '<div class="v3-report-persona-section"><div class="v3-report-persona-section-title">Demographics</div>';
          pp.demographics.forEach(function(d) { html += '<div class="v3-report-persona-bullet">' + esc(d) + '</div>'; });
          html += '</div>';
        }
        if (pp.psychographics && pp.psychographics.length) {
          html += '<div class="v3-report-persona-section"><div class="v3-report-persona-section-title">Psychographics</div>';
          pp.psychographics.forEach(function(d) { html += '<div class="v3-report-persona-bullet">' + esc(d) + '</div>'; });
          html += '</div>';
        }
        if (pp.onlineBehavior && pp.onlineBehavior.length) {
          html += '<div class="v3-report-persona-section"><div class="v3-report-persona-section-title">Online Behavior</div>';
          pp.onlineBehavior.forEach(function(d) { html += '<div class="v3-report-persona-bullet">' + esc(d) + '</div>'; });
          html += '</div>';
        }
        if (pp.triggerEvent) {
          html += '<div class="v3-report-persona-section"><div class="v3-report-persona-section-title">Trigger Event</div><p>' + esc(pp.triggerEvent) + '</p></div>';
        }
        html += '</div>'; // persona card
      }
      if (s.secondaryICPs && s.secondaryICPs.length) {
        html += '<div class="v3-report-subsection-title">Secondary ICP Options</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Persona</th><th>Key Difference</th><th>Test Priority</th></tr></thead><tbody>';
        s.secondaryICPs.forEach(function(icp) {
          var prioClass = (icp.testPriority || '').toLowerCase();
          html += '<tr><td><strong>' + esc(icp.persona) + '</strong></td><td>' + esc(icp.keyDifference) + '</td><td><span class="v3-report-priority-badge ' + prioClass + '">' + esc(icp.testPriority) + '</span></td></tr>';
        });
        html += '</tbody></table>';
      }
      if (s.validationPlan && s.validationPlan.length) {
        html += '<div class="v3-report-subsection-title">ICP Validation Plan</div>';
        html += '<ol class="v3-report-ordered-list">';
        s.validationPlan.forEach(function(v) { html += '<li>' + esc(v) + '</li>'; });
        html += '</ol>';
      }

      // ── Section 5: Geographic Opportunity ──
      if (s.marketTiers && s.marketTiers.length) {
        html += '<div class="v3-report-tier-grid">';
        s.marketTiers.forEach(function(t) {
          html += '<div class="v3-report-tier-card"><div class="v3-report-tier-label">' + esc(t.tier) + ': ' + esc(t.label) + '</div>';
          t.markets.forEach(function(m) { html += '<div class="v3-report-tier-market">' + esc(m) + '</div>'; });
          html += '</div>';
        });
        html += '</div>';
      }
      if (s.costComparison && s.costComparison.length) {
        html += '<div class="v3-report-subsection-title">Cost Comparison</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Market</th><th>Est. CPC</th><th>Est. CPM</th><th>Language</th><th>Recommendation</th></tr></thead><tbody>';
        s.costComparison.forEach(function(c) {
          html += '<tr><td>' + esc(c.market) + '</td><td>' + esc(c.cpc) + '</td><td>' + esc(c.cpm) + '</td><td>' + esc(c.language) + '</td><td>' + esc(c.recommendation) + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (s.launchStrategy && s.launchStrategy.length) {
        html += '<div class="v3-report-subsection-title">Geographic Launch Strategy</div>';
        html += '<ol class="v3-report-ordered-list">';
        s.launchStrategy.forEach(function(l) { html += '<li>' + esc(l) + '</li>'; });
        html += '</ol>';
      }

      // ── Section 6: SEO & Keyword Opportunity ──
      if (s.brandAnalysis) {
        html += '<div class="v3-report-callout">' + esc(s.brandAnalysis) + '</div>';
      }
      if (s.categoryKeywords && s.categoryKeywords.length) {
        html += '<div class="v3-report-subsection-title">Category Keyword Opportunities</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Keyword</th><th>Monthly Searches</th><th>CPC</th><th>Competition</th><th>Priority</th></tr></thead><tbody>';
        s.categoryKeywords.forEach(function(k) {
          var prioClass = (k.priority || '').toLowerCase().indexOf('high') >= 0 ? 'high' : '';
          html += '<tr class="' + prioClass + '"><td><strong>' + esc(k.keyword) + '</strong></td><td>' + esc(k.monthlySearches) + '</td><td>' + esc(k.cpc) + '</td><td>' + esc(k.competition) + '</td><td>' + esc(k.priority) + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (s.contentGaps && s.contentGaps.length) {
        html += '<div class="v3-report-subsection-title">Content Gap Analysis</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Topic</th><th>Competitor Ranking</th><th>Difficulty</th><th>Content Type</th></tr></thead><tbody>';
        s.contentGaps.forEach(function(g) {
          html += '<tr><td>' + esc(g.topic) + '</td><td>' + esc(g.competitorRanking) + '</td><td>' + esc(g.difficulty) + '</td><td>' + esc(g.contentType) + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (s.quickWins && s.quickWins.length) {
        html += '<div class="v3-report-subsection-title">Quick Win Recommendations</div>';
        html += '<ol class="v3-report-ordered-list">';
        s.quickWins.forEach(function(w) { html += '<li>' + esc(w) + '</li>'; });
        html += '</ol>';
      }

      // ── Section 7: Growth Roadmap ──
      if (s.phases && s.phases.length) {
        s.phases.forEach(function(phase, pi) {
          html += '<div class="v3-report-phase-card">';
          html += '<div class="v3-report-phase-header">';
          html += '<span class="v3-report-phase-num">Phase ' + (pi + 1) + '</span>';
          html += '<span class="v3-report-phase-name">' + esc(phase.name).toUpperCase() + '</span>';
          html += '<span class="v3-report-phase-period">' + esc(phase.period) + '</span>';
          html += '</div>';
          if (phase.goal) html += '<div class="v3-report-phase-goal"><strong>Goal:</strong> ' + esc(phase.goal) + '</div>';
          if (phase.budget) html += '<div class="v3-report-phase-budget">Budget: ' + esc(phase.budget) + '</div>';

          if (phase.keyStrategies && phase.keyStrategies.length) {
            html += '<div class="v3-report-subsection-title">Key Strategies</div><ul class="v3-report-bullet-list">';
            phase.keyStrategies.forEach(function(st) { html += '<li>' + esc(st) + '</li>'; });
            html += '</ul>';
          }
          if (phase.successMetrics && phase.successMetrics.length) {
            html += '<div class="v3-report-subsection-title">Success Metrics</div><ul class="v3-report-check-list">';
            phase.successMetrics.forEach(function(m) { html += '<li>' + esc(m) + '</li>'; });
            html += '</ul>';
          }
          if (phase.keyMilestone) {
            html += '<div class="v3-report-milestone-badge">' + esc(phase.keyMilestone) + '</div>';
          }
          html += '</div>'; // phase card
        });
      }

      // ── Section 8: Budget & Metrics ──
      if (s.monthlyAllocation && s.monthlyAllocation.length) {
        html += '<div class="v3-report-subsection-title">Monthly Budget Allocation</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Channel</th><th>Amount</th><th>%</th></tr></thead><tbody>';
        s.monthlyAllocation.forEach(function(a) {
          html += '<tr><td>' + esc(a.channel) + '</td><td><strong>' + esc(a.amount) + '</strong></td><td>' + esc(a.percentage) + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (s.scalingRules) {
        html += '<div class="v3-report-rules-grid">';
        if (s.scalingRules.scaleWhen && s.scalingRules.scaleWhen.length) {
          html += '<div class="v3-report-rule-box scale"><div class="v3-report-rule-title">Scale When</div>';
          s.scalingRules.scaleWhen.forEach(function(r) { html += '<div class="v3-report-rule-item">' + esc(r) + '</div>'; });
          html += '</div>';
        }
        if (s.scalingRules.safetyRules && s.scalingRules.safetyRules.length) {
          html += '<div class="v3-report-rule-box safety"><div class="v3-report-rule-title">Safety Rules</div>';
          s.scalingRules.safetyRules.forEach(function(r) { html += '<div class="v3-report-rule-item">' + esc(r) + '</div>'; });
          html += '</div>';
        }
        if (s.scalingRules.pauseWhen && s.scalingRules.pauseWhen.length) {
          html += '<div class="v3-report-rule-box pause"><div class="v3-report-rule-title">Pause When</div>';
          s.scalingRules.pauseWhen.forEach(function(r) { html += '<div class="v3-report-rule-item">' + esc(r) + '</div>'; });
          html += '</div>';
        }
        html += '</div>';
      }
      if (s.kpiTargets && s.kpiTargets.length) {
        html += '<div class="v3-report-subsection-title">KPI Targets by Phase</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Metric</th><th>Months 1-2</th><th>Months 3-4</th><th>Months 5-6</th></tr></thead><tbody>';
        s.kpiTargets.forEach(function(k) {
          html += '<tr><td><strong>' + esc(k.metric) + '</strong></td><td>' + esc(k.month1_2) + '</td><td>' + esc(k.month3_4) + '</td><td>' + esc(k.month5_6) + '</td></tr>';
        });
        html += '</tbody></table>';
      }

      // ── Section 9: Next Steps ──
      if (s.immediateActions && s.immediateActions.length) {
        html += '<div class="v3-report-subsection-title">Immediate Actions (This Week)</div>';
        s.immediateActions.forEach(function(a, ai) {
          html += '<div class="v3-report-action-row">';
          html += '<div class="v3-report-action-num">' + (ai + 1) + '</div>';
          html += '<div class="v3-report-action-info">';
          html += '<div class="v3-report-action-name">' + esc(a.action) + '</div>';
          if (a.timeEstimate) html += '<div class="v3-report-action-meta">Time: ' + esc(a.timeEstimate) + '</div>';
          if (a.whyItMatters) html += '<div class="v3-report-action-why">' + esc(a.whyItMatters) + '</div>';
          html += '</div></div>';
        });
      }
      if (s.recommendedTools && s.recommendedTools.length) {
        html += '<div class="v3-report-subsection-title">Recommended Tools</div>';
        html += '<table class="v3-report-table"><thead><tr><th>Category</th><th>Tool</th><th>Cost</th><th>Why</th></tr></thead><tbody>';
        s.recommendedTools.forEach(function(t) {
          html += '<tr><td>' + esc(t.category) + '</td><td><strong>' + esc(t.tool) + '</strong></td><td>' + esc(t.cost) + '</td><td>' + esc(t.why) + '</td></tr>';
        });
        html += '</tbody></table>';
      }

      // ── Fallback for legacy content types ──
      if (s.text && !s.bigInsight && !s.marketOverview && !s.brandAnalysis) {
        s.text.split('\n\n').forEach(function(para) {
          html += '<p>' + esc(para) + '</p>';
        });
      }
      if (s.kpis && !s.kpiTargets) {
        html += '<div class="v3-report-kpi-row">';
        s.kpis.forEach(function(k) {
          html += '<div class="v3-report-kpi-chip"><span class="v3-report-kpi-chip-val">' + esc(k.value) + '</span><span class="v3-report-kpi-chip-label">' + esc(k.label) + '</span></div>';
        });
        html += '</div>';
      }
      if (s.items && !s.immediateActions && !s.quickWins) {
        html += '<ul class="v3-report-bullet-list">';
        s.items.forEach(function(item) { html += '<li>' + esc(item) + '</li>'; });
        html += '</ul>';
      }

      html += '</div>'; // section-body
      html += '</div>'; // section-card
    });
    html += '</div></div>'; // close sections + layout

    html += '</div>'; // close v3-gtm-report
    return html;
  }

  function navigateReportSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update active nav
    var navItems = document.querySelectorAll('.v3-report-nav-item');
    navItems.forEach(function(n) {
      n.classList.toggle('active', n.getAttribute('href') === '#' + sectionId);
    });
  }

  // ─── PREVIEW CARD RENDERER (WS4) ────────────────────

  function renderPreviewCard(cardType, cardData, detailKey, summary) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('prev');
    var title = d.title || d.reportTitle || cardType;
    var html = '<div class="v3-card preview" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-preview-header">';
    html += '<span class="v3-preview-title">' + esc(title) + '</span>';
    if (d.number && d.total) html += '<span class="v3-action-badge">' + d.number + ' of ' + d.total + '</span>';
    html += '</div>';
    html += '<div class="v3-preview-summary">' + esc(summary || d.detail || '') + '</div>';
    html += '<button class="v3-preview-link" onclick="V3.showCanvasDetail(\'' + escAttr(detailKey || cardData) + '\',\'' + escAttr(title) + '\')">View Details &rarr;</button>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row" style="margin-top:8px">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ─── COMPETITOR RESEARCH CARDS (WS5) ─────────────────

  function renderCompetitorResearchCard(cardData) {
    var d = resolveCardData(cardData);
    if (!d) return '';
    var id = nextCardId('comp');
    var html = '<div class="v3-card competitor-research" id="' + id + '">';
    html += '<div class="v3-card-body">';
    html += '<div class="v3-action-title" style="margin-bottom:10px">Competitor Analysis</div>';

    if (d.competitors) {
      d.competitors.forEach(function(c) {
        html += '<div class="v3-competitor-card">';
        html += '<div class="v3-competitor-name">' + esc(c.name) + '</div>';
        html += '<div class="v3-competitor-meta">' + esc(c.website || '') + ' &bull; ~' + esc(c.monthlyAdSpend || '?') + '/mo ad spend</div>';
        html += '</div>';
      });
    }

    html += '<button class="v3-preview-link" onclick="V3.showCanvasDetail(\'competitor_analysis\',\'Competitor Analysis\')">View Full Analysis &rarr;</button>';

    if (d.actions && d.actions.length) {
      html += '<div class="v3-action-buttons-row" style="margin-top:8px">';
      d.actions.forEach(function(action, idx) {
        var cls = idx === 0 ? 'v3-action-btn primary' : 'v3-action-btn secondary';
        html += '<button class="' + cls + '" onclick="V3.handleActionBtn(\'' + id + '\',\'' + escAttr(action) + '\')">' + esc(action) + '</button>';
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderCompetitorDetail(d) {
    if (!d) return '';
    var html = '<div class="v3-detail-section">';
    html += '<h3>Competitive Landscape</h3>';
    if (d.competitors) {
      d.competitors.forEach(function(c) {
        html += '<div class="v3-competitor-detail-card">';
        html += '<div class="v3-competitor-detail-header">';
        html += '<div class="v3-competitor-detail-name">' + esc(c.name) + '</div>';
        html += '<div class="v3-competitor-detail-spend">~' + esc(c.monthlyAdSpend || '?') + '/mo</div>';
        html += '</div>';
        if (c.website) html += '<div class="v3-competitor-detail-url">' + esc(c.website) + '</div>';
        if (c.strengths) {
          html += '<div class="v3-competitor-detail-section"><strong>Strengths:</strong> ' + esc(c.strengths) + '</div>';
        }
        if (c.weaknesses) {
          html += '<div class="v3-competitor-detail-section"><strong>Weaknesses:</strong> ' + esc(c.weaknesses) + '</div>';
        }
        if (c.adCopy) {
          html += '<div class="v3-competitor-detail-section"><strong>Sample Ad Copy:</strong><blockquote>' + esc(c.adCopy) + '</blockquote></div>';
        }
        if (c.targeting) {
          html += '<div class="v3-competitor-detail-section"><strong>Targeting Approach:</strong> ' + esc(c.targeting) + '</div>';
        }
        html += '</div>';
      });
    }
    html += '</div>';
    return html;
  }

  // ─── TREE NODE TOGGLE ─────────────────────────────

  function toggleTreeNode(elId) {
    var children = document.getElementById(elId);
    var toggle = document.getElementById(elId + '-toggle');
    if (!children) return;
    if (children.classList.contains('collapsed')) {
      children.classList.remove('collapsed');
      children.style.maxHeight = children.scrollHeight + 'px';
      if (toggle) toggle.textContent = '\u25BC';
    } else {
      children.classList.add('collapsed');
      children.style.maxHeight = '0';
      if (toggle) toggle.textContent = '\u25B6';
    }
  }

  // ─── INTERACTION HANDLERS ──────────────────────────

  function handleChipSelect(cardId, value) {
    var card = document.getElementById(cardId);
    if (!card) return;
    var chips = card.querySelectorAll('.v3-chip');
    chips.forEach(function(c) { c.classList.remove('selected'); });
    chips.forEach(function(c) {
      if (c.textContent.trim() === value) c.classList.add('selected');
    });

    if (!state.isLoading) {
      chips.forEach(function(c) { c.disabled = true; });
      sendAction(value);
    }
  }

  function submitQuestionInput(cardId) {
    var card = document.getElementById(cardId);
    if (!card || state.isLoading) return;
    var input = card.querySelector('.v3-question-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    input.disabled = true;
    var btn = card.querySelector('.v3-submit-input');
    if (btn) btn.disabled = true;

    sendAction(text);
  }

  function handleActionBtn(cardId, action) {
    var card = document.getElementById(cardId);
    if (!card || state.isLoading) return;

    // Disable all buttons in this card
    var btns = card.querySelectorAll('.v3-action-btn');
    btns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.5'; });

    // Highlight the selected button
    btns.forEach(function(b) {
      if (b.textContent.trim() === action) {
        b.style.opacity = '1';
        b.style.fontWeight = '700';
      }
    });

    sendAction(action);
  }

  function handleUpgrade() {
    appendAuxoraMessage('Upgrade flow coming soon! This would redirect to Stripe checkout for the $20/month Growth plan.');
  }

  function handleDownload() {
    if (!state.liveReport) {
      appendAuxoraMessage('No report available to download yet.');
      return;
    }
    var text = state.liveReport.title + '\n\n';
    if (state.liveReport.summary) text += state.liveReport.summary + '\n\n';
    if (state.liveReport.sections) {
      state.liveReport.sections.forEach(function(s) {
        text += '## ' + s.title + '\n';
        if (s.items) {
          s.items.forEach(function(item) {
            text += '- ' + item + '\n';
          });
        }
        text += '\n';
      });
    }
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'auxora-gtm-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── INIT ───────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── PUBLIC API ─────────────────────────────────────
  return {
    sendMessage: sendMessage,
    handleChipSelect: handleChipSelect,
    submitQuestionInput: submitQuestionInput,
    handleActionBtn: handleActionBtn,
    handleUpgrade: handleUpgrade,
    handleDownload: handleDownload,
    toggleProMode: toggleProMode,
    toggleAgentDrawer: toggleAgentDrawer,
    toggleTreeNode: toggleTreeNode,
    showCanvasDetail: showCanvasDetail,
    hideCanvasDetail: hideCanvasDetail,
    navigateReportSection: navigateReportSection,
    showCardDetail: showCardDetail,
    handleCardAction: handleCardAction
  };

})();
