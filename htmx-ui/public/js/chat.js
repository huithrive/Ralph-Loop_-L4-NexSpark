document.addEventListener('DOMContentLoaded', function () {
  initChatInput();
  initProactiveTimer();
  initHintCommands();
  initChatDelegation();
});

/* ── Tab Manager ── */

var canvasTabs = {};
var activeTabId = null;
var tabOrder = [];

function openCanvasTab(id, title, icon, route) {
  var tabBar = document.getElementById('canvas-tabs');
  var body = document.getElementById('main-content');

  if (canvasTabs[id]) {
    activateTab(id);
    return;
  }

  var tab = document.createElement('div');
  tab.className = 'canvas-tab active';
  tab.setAttribute('data-tab-id', id);

  var iconSpan = document.createElement('span');
  iconSpan.className = 'canvas-tab-icon';
  iconSpan.textContent = icon;
  tab.appendChild(iconSpan);

  var titleSpan = document.createElement('span');
  titleSpan.textContent = title;
  tab.appendChild(titleSpan);

  var closeBtn = document.createElement('button');
  closeBtn.className = 'canvas-tab-close';
  closeBtn.textContent = '\u00D7';
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeCanvasTab(id);
  });
  tab.appendChild(closeBtn);

  tab.addEventListener('click', function () { activateTab(id); });
  tabBar.appendChild(tab);

  var pane = document.createElement('div');
  pane.className = 'canvas-pane active';
  pane.id = 'canvas-pane-' + id;
  body.appendChild(pane);

  canvasTabs[id] = { tab: tab, pane: pane, route: route };
  tabOrder.push(id);

  deactivateAllTabs();
  tab.classList.add('active');
  pane.classList.add('active');
  activeTabId = id;

  htmx.ajax('GET', route, { target: pane, swap: 'innerHTML' });
}

function activateTab(id) {
  if (!canvasTabs[id] || activeTabId === id) return;
  deactivateAllTabs();
  canvasTabs[id].tab.classList.add('active');
  canvasTabs[id].pane.classList.add('active');
  activeTabId = id;
}

function closeCanvasTab(id) {
  if (!canvasTabs[id]) return;
  canvasTabs[id].tab.remove();
  canvasTabs[id].pane.remove();

  var idx = tabOrder.indexOf(id);
  if (idx > -1) tabOrder.splice(idx, 1);
  delete canvasTabs[id];

  if (activeTabId === id) {
    activeTabId = null;
    if (tabOrder.length > 0) {
      var prevId = tabOrder[tabOrder.length - 1];
      activateTab(prevId);
    }
  }
}

function deactivateAllTabs() {
  Object.keys(canvasTabs).forEach(function (key) {
    canvasTabs[key].tab.classList.remove('active');
    canvasTabs[key].pane.classList.remove('active');
  });
}

/* ── Chat Command Dispatch ── */

function sendChatCommand(cmd) {
  var input = document.getElementById('chat-input');
  if (!input) return;
  input.value = cmd;
  var form = document.getElementById('chat-form');
  if (form) {
    htmx.trigger(form, 'submit');
  }
}

function scrollChatToBottom() {
  var container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

/* ── Chat Input ── */

function initChatInput() {
  var textarea = document.getElementById('chat-input');
  var form = document.getElementById('chat-form');
  if (!textarea || !form) return;

  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (textarea.value.trim()) {
        htmx.trigger(form, 'submit');
      }
    }
  });

  textarea.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  form.addEventListener('htmx:afterRequest', function () {
    textarea.value = '';
    textarea.style.height = 'auto';
    resetProactiveTimer();
  });
}

/* ── Event Delegation for Chat Messages ── */

function initChatDelegation() {
  document.addEventListener('click', function (e) {
    var choiceBtn = e.target.closest('.chat-choice-btn');
    if (choiceBtn && choiceBtn.dataset.command) {
      sendChatCommand(choiceBtn.dataset.command);
      return;
    }

    var artifact = e.target.closest('.chat-artifact');
    if (artifact && artifact.dataset.artifactId) {
      openCanvasTab(
        artifact.dataset.artifactId,
        artifact.dataset.artifactTitle,
        artifact.dataset.artifactIcon,
        artifact.dataset.artifactRoute
      );
      return;
    }
  });
}

/* ── Proactive Messages ── */

var proactiveTimer = null;
var proactiveIndex = 0;
var PROACTIVE_DELAY = 30000;

function initProactiveTimer() {
  resetProactiveTimer();
}

function resetProactiveTimer() {
  clearTimeout(proactiveTimer);
  proactiveTimer = setTimeout(fireProactive, PROACTIVE_DELAY);
}

function fireProactive() {
  htmx.ajax('GET', '/api/chat/proactive?index=' + proactiveIndex, {
    target: '#chat-messages',
    swap: 'beforeend scroll:#chat-messages:bottom',
  });
  proactiveIndex++;
  proactiveTimer = setTimeout(fireProactive, PROACTIVE_DELAY * 2);
}

/* ── Hint Commands ── */

function initHintCommands() {
  var hints = document.querySelectorAll('.chat-hints code');
  hints.forEach(function (el) {
    el.addEventListener('click', function () {
      sendChatCommand(el.textContent);
    });
  });
}

/* ── HTMX Hooks ── */

document.addEventListener('htmx:afterSwap', function (event) {
  var target = event.detail.target;

  if (target && (target.id === 'chat-messages' || (target.closest && target.closest('#chat-messages')))) {
    scrollChatToBottom();
  }
});

document.addEventListener('htmx:afterSettle', function (event) {
  var target = event.detail.target;
  if (target && (target.id === 'chat-messages' || (target.closest && target.closest('#chat-messages')))) {
    scrollChatToBottom();
  }
});
