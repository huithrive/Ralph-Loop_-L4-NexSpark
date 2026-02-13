document.addEventListener('DOMContentLoaded', function () {
  var state = { phase: 'landing', step: 0, answers: [], url: '', builderAnswers: {}, builderStep: 0, selectedTemplate: '', builderMods: {}, creativeAnswers: {}, creativeStep: 0 };

  var shell = document.querySelector('.app-shell');
  var overlay = document.getElementById('landing-overlay');
  var chatMessages = document.getElementById('chat-messages');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
  var chatHints = document.getElementById('chat-hints');
  var canvasContent = document.getElementById('canvas-content');
  var canvasTabs = document.getElementById('canvas-tabs');

  /* ── Landing Form ── */
  var landingForm = document.getElementById('landing-form');
  if (landingForm) {
    landingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var urlInput = document.getElementById('landing-url');
      var url = (urlInput.value || '').trim();
      if (!url) return;
      state.url = url;
      dismissLanding();
      setTimeout(function () { fireResearch(url); }, 400);
    });
  }

  /* ── Example URL Buttons ── */
  document.addEventListener('click', function (e) {
    var exBtn = e.target.closest('.landing-example-btn');
    if (exBtn) {
      var url = exBtn.getAttribute('data-url');
      var urlInput = document.getElementById('landing-url');
      if (urlInput) urlInput.value = url;
      state.url = url;
      dismissLanding();
      setTimeout(function () { fireResearch(url); }, 400);
      return;
    }

    /* ── Onboarding Action Buttons ── */
    var actionBtn = e.target.closest('[data-onboarding-action]');
    if (actionBtn) {
      var action = actionBtn.getAttribute('data-onboarding-action');
      handleOnboardingAction(action);
      return;
    }

    /* ── Artifact Links ── */
    var artifact = e.target.closest('.chat-artifact');
    if (artifact) {
      var route = artifact.getAttribute('data-artifact-route');
      var title = artifact.getAttribute('data-artifact-title');
      var icon = artifact.getAttribute('data-artifact-icon');
      if (route) loadCanvas(route, title, icon);
      return;
    }

    /* ── Choice Buttons (free-mode slash commands) ── */
    var choiceBtn = e.target.closest('.chat-choice-btn');
    if (choiceBtn && !choiceBtn.hasAttribute('data-onboarding-action')) {
      var cmd = choiceBtn.getAttribute('data-command');
      if (cmd && state.phase === 'free') {
        chatInput.value = cmd;
        chatForm.dispatchEvent(new Event('submit'));
      }
      return;
    }
  });

  /* ── Chat Form Submit ── */
  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var message = (chatInput.value || '').trim();
    if (!message) return;

    if (state.phase === 'interview') {
      submitInterviewAnswer(message);
    } else if (state.phase === 'builder-gather') {
      submitBuilderAnswer(message);
    } else if (state.phase === 'builder-preview') {
      submitBuilderRefine(message);
    } else if (state.phase === 'creative-gather') {
      submitCreativeAnswer(message);
    } else if (state.phase === 'free') {
      submitFreeChat(message);
    }

    chatInput.value = '';
    autoResizeTextarea();
  });

  /* ── Textarea Auto-resize + Enter-to-send ── */
  chatInput.addEventListener('input', autoResizeTextarea);
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  }

  /* ── Dismiss Landing ── */
  function dismissLanding() {
    overlay.classList.add('dismissed');
    shell.removeAttribute('data-phase');
    state.phase = 'research';
  }

  /* ── Fire Research ── */
  function fireResearch(url) {
    appendTypingIndicator();
    fetch('/guided/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        loadCanvas('/guided/canvas/research', 'Market Research', '🎯');
      })
      .catch(function () {
        removeTypingIndicator();
        appendChat('<div class="chat-msg agent"><div class="chat-bubble">Something went wrong. Please try again.</div></div>');
      });
  }

  /* ── Onboarding Actions ── */
  function handleOnboardingAction(action) {
    if (action === 'start-interview') {
      state.phase = 'interview';
      state.step = 0;
      state.answers = [];
      shell.setAttribute('data-phase', 'interview');
      chatInput.placeholder = 'Type your answer...';
      chatInput.focus();
      askInterviewQuestion(0);
    } else if (action === 'skip-to-report') {
      state.phase = 'report';
      shell.removeAttribute('data-phase');
      loadReportDirectly();
    } else if (action === 'free-mode') {
      unlockFreeMode();
    } else if (action === 'landing-page') {
      enterBuilderGather();
    } else if (action === 'campaigns') {
      unlockFreeMode();
      setTimeout(function () {
        chatInput.value = '/campaigns';
        chatForm.dispatchEvent(new Event('submit'));
      }, 300);
    } else if (action.indexOf('pick-template-') === 0) {
      var templateId = action.replace('pick-template-', '');
      selectBuilderTemplate(templateId);
    } else if (action === 'builder-publish') {
      publishBuilderPage();
    } else if (action.indexOf('builder-refine-') === 0) {
      var refinement = action.replace('builder-refine-', '');
      chatInput.value = refinement;
      chatInput.focus();
    } else if (action === 'generate-creative') {
      enterCreativeGather();
    } else if (action.indexOf('creative-answer-') === 0) {
      var creativeVal = action.replace('creative-answer-', '');
      submitCreativeAnswer(creativeVal);
    }
  }

  /* ── Interview: Ask Question ── */
  function askInterviewQuestion(step) {
    appendTypingIndicator();
    fetch('/guided/api/interview-ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: step }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
      })
      .catch(function () {
        removeTypingIndicator();
      });
  }

  /* ── Interview: Submit Answer ── */
  function submitInterviewAnswer(answer) {
    state.answers.push(answer);
    appendTypingIndicator();

    fetch('/guided/api/interview-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: state.step, message: answer, url: state.url }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        state.step++;

        if (state.step >= 3) {
          state.phase = 'report';
          shell.removeAttribute('data-phase');
          loadCanvas('/guided/canvas/report', 'GTM Report', '📋');
        }
      })
      .catch(function () {
        removeTypingIndicator();
      });
  }

  /* ── Skip to Report ── */
  function loadReportDirectly() {
    appendTypingIndicator();

    var html = '';
    fetch('/guided/api/interview-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 2, message: 'Skipped', url: state.url }),
    })
      .then(function (r) { return r.text(); })
      .then(function (responseHtml) {
        removeTypingIndicator();
        appendChat(responseHtml);
        state.phase = 'report';
        loadCanvas('/guided/canvas/report', 'GTM Report', '📋');
      })
      .catch(function () {
        removeTypingIndicator();
      });
  }

  /* ── Builder: Enter Gather Phase ── */
  function enterBuilderGather() {
    state.phase = 'builder-gather';
    state.builderStep = 0;
    state.builderAnswers = {};
    state.builderMods = {};
    state.selectedTemplate = '';
    shell.setAttribute('data-phase', 'builder');
    chatInput.placeholder = 'Type your answer...';
    chatInput.focus();

    appendTypingIndicator();
    fetch('/guided/api/builder-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Builder: Submit Answer ── */
  function submitBuilderAnswer(message) {
    var keys = ['headline', 'cta', 'sellingPoints'];
    var key = keys[state.builderStep];
    if (key) state.builderAnswers[key] = message;

    appendTypingIndicator();
    fetch('/guided/api/builder-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: state.builderStep, message: message }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        state.builderStep++;

        if (state.builderStep >= 3) {
          state.phase = 'builder-pick';
          shell.removeAttribute('data-phase');
          loadCanvas('/guided/canvas/builder-templates', 'Templates', '📐');
        }
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Builder: Select Template ── */
  function selectBuilderTemplate(templateId) {
    state.selectedTemplate = templateId;
    state.phase = 'builder-preview';
    chatInput.placeholder = 'Describe a change (e.g. "bigger headline")...';

    appendTypingIndicator();
    fetch('/guided/api/builder-select-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: templateId }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        var qs = encodeURIComponent(JSON.stringify(state.builderAnswers));
        var ms = encodeURIComponent(JSON.stringify(state.builderMods));
        loadCanvas('/guided/canvas/builder-preview?answers=' + qs + '&mods=' + ms, 'Landing Page Preview', '⚡');
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Builder: Refine ── */
  function submitBuilderRefine(message) {
    appendTypingIndicator();
    fetch('/guided/api/builder-refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message }),
    })
      .then(function (r) {
        var trigger = r.headers.get('HX-Trigger');
        if (trigger) {
          try {
            var data = JSON.parse(trigger);
            if (data['builder-canvas-reload']) {
              var mod = data['builder-canvas-reload'];
              if (mod.field) {
                state.builderMods[mod.field] = mod.value;
              }
            }
          } catch (e) { /* ignore */ }
        }
        return r.text();
      })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        var qs = encodeURIComponent(JSON.stringify(state.builderAnswers));
        var ms = encodeURIComponent(JSON.stringify(state.builderMods));
        loadCanvas('/guided/canvas/builder-preview?answers=' + qs + '&mods=' + ms, 'Landing Page Preview', '⚡');
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Builder: Publish ── */
  function publishBuilderPage() {
    appendTypingIndicator();
    fetch('/guided/api/builder-publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: state.selectedTemplate, answers: state.builderAnswers, mods: state.builderMods }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        unlockFreeMode();
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Creative Gen: Enter Gather Phase ── */
  function enterCreativeGather() {
    state.phase = 'creative-gather';
    state.creativeStep = 0;
    state.creativeAnswers = {};
    shell.setAttribute('data-phase', 'builder');
    chatInput.placeholder = 'Type your answer...';
    chatInput.focus();

    appendTypingIndicator();
    fetch('/guided/api/creative-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Creative Gen: Submit Answer ── */
  function submitCreativeAnswer(message) {
    var keys = ['type', 'style', 'prompt'];
    var key = keys[state.creativeStep];
    if (key) state.creativeAnswers[key] = message;

    appendTypingIndicator();
    fetch('/guided/api/creative-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: state.creativeStep, message: message }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
        state.creativeStep++;

        if (state.creativeStep >= 3) {
          state.phase = 'free';
          shell.removeAttribute('data-phase');
          var qs = encodeURIComponent(JSON.stringify(state.creativeAnswers));
          loadCanvas('/guided/canvas/creative-preview?answers=' + qs, 'Generated Creative', '🎨');
        }
      })
      .catch(function () { removeTypingIndicator(); });
  }

  /* ── Free Mode ── */
  function unlockFreeMode() {
    state.phase = 'free';
    chatInput.placeholder = 'Type a command or ask a question...';
    chatHints.style.display = '';
  }

  /* ── Free Chat Submit ── */
  function submitFreeChat(message) {
    appendTypingIndicator();

    fetch('/guided/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message }),
    })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        removeTypingIndicator();
        appendChat(html);
      })
      .catch(function () {
        removeTypingIndicator();
        appendChat('<div class="chat-msg agent"><div class="chat-bubble">Something went wrong. Please try again.</div></div>');
      });
  }

  /* ── Canvas Loading ── */
  var canvasTabData = [];

  function loadCanvas(route, title, icon) {
    canvasContent.innerHTML = '<div class="spinner"><div class="spinner-dots"><span></span><span></span><span></span></div>Loading...</div>';

    fetch(route)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        canvasContent.innerHTML = html;

        if (typeof initCharts === 'function') {
          initCharts(canvasContent);
        }

        updateCanvasTabs(route, title, icon);
      })
      .catch(function () {
        canvasContent.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Failed to load</div><div class="empty-desc">Could not load canvas content.</div></div>';
      });
  }

  function updateCanvasTabs(route, title, icon) {
    var existing = canvasTabData.find(function (t) { return t.route === route; });
    if (!existing) {
      canvasTabData.push({ route: route, title: title, icon: icon });
    }

    canvasTabData.forEach(function (t) { t.active = t.route === route; });
    renderCanvasTabs();
  }

  function renderCanvasTabs() {
    var html = '';
    canvasTabData.forEach(function (tab, i) {
      html += '<div class="canvas-tab' + (tab.active ? ' active' : '') + '" data-tab-index="' + i + '">';
      html += '<span class="canvas-tab-icon">' + (tab.icon || '') + '</span>';
      html += '<span>' + tab.title + '</span>';
      if (canvasTabData.length > 1) {
        html += '<button class="canvas-tab-close" data-tab-close="' + i + '">&times;</button>';
      }
      html += '</div>';
    });
    canvasTabs.innerHTML = html;
  }

  canvasTabs.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('[data-tab-close]');
    if (closeBtn) {
      var idx = parseInt(closeBtn.getAttribute('data-tab-close'), 10);
      canvasTabData.splice(idx, 1);
      if (canvasTabData.length > 0) {
        var lastTab = canvasTabData[canvasTabData.length - 1];
        loadCanvas(lastTab.route, lastTab.title, lastTab.icon);
      } else {
        canvasContent.innerHTML = '';
        renderCanvasTabs();
      }
      return;
    }

    var tab = e.target.closest('.canvas-tab');
    if (tab) {
      var tabIdx = parseInt(tab.getAttribute('data-tab-index'), 10);
      var tabData = canvasTabData[tabIdx];
      if (tabData) loadCanvas(tabData.route, tabData.title, tabData.icon);
    }
  });

  /* ── Chat Helpers ── */
  function appendChat(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) {
      chatMessages.appendChild(div.firstChild);
    }
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    requestAnimationFrame(function () {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function appendTypingIndicator() {
    var el = document.createElement('div');
    el.id = 'guided-typing';
    el.className = 'chat-msg agent';
    el.innerHTML = '<div class="chat-typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    chatMessages.appendChild(el);
    scrollChatToBottom();
  }

  function removeTypingIndicator() {
    var el = document.getElementById('guided-typing');
    if (el) el.remove();
  }
});
