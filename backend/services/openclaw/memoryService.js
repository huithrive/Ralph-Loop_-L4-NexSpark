/**
 * memoryService.js — Per-Client Persistent Context (Markdown Files)
 *
 * File structure:
 *   data/auxora/SOUL.md                        — shared personality
 *   data/clients/{clientId}/USER.md             — client preferences
 *   data/clients/{clientId}/MEMORY.md           — long-term learnings
 *   data/clients/{clientId}/memory/YYYY-MM-DD.md — daily logs
 */

const fs = require('fs/promises');
const path = require('path');

// Base data path — configurable via env or openclawConfig
let BASE_PATH;
try {
  const openclawConfig = require('../../config/openclawConfig');
  BASE_PATH = openclawConfig.dataPath || process.env.OPENCLAW_DATA_PATH || path.resolve(__dirname, '../../data');
} catch {
  BASE_PATH = process.env.OPENCLAW_DATA_PATH || path.resolve(__dirname, '../../data');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clientDir(clientId) {
  return path.join(BASE_PATH, 'clients', clientId);
}

function dailyFile(clientId, date) {
  const d = date || new Date();
  const stamp = d.toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(clientDir(clientId), 'memory', `${stamp}.md`);
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read the shared Auxora personality file.
 */
async function readSoul() {
  return readFileSafe(path.join(BASE_PATH, 'auxora', 'SOUL.md'));
}

/**
 * Read USER.md + MEMORY.md + recent daily logs for a client.
 * Returns an object with each component.
 */
async function readUserContext(clientId) {
  const dir = clientDir(clientId);
  const user = await readFileSafe(path.join(dir, 'USER.md'));
  const memory = await readFileSafe(path.join(dir, 'MEMORY.md'));

  // Collect last 7 days of daily logs
  const dailyLogs = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const content = await readFileSafe(dailyFile(clientId, d));
    if (content) {
      dailyLogs.push({ date: d.toISOString().slice(0, 10), content });
    }
  }

  return { user, memory, dailyLogs };
}

/**
 * Assemble the full context string used for card generation.
 * Combines SOUL + USER + MEMORY + recent daily logs.
 */
async function assembleContext(clientId) {
  const soul = await readSoul();
  const { user, memory, dailyLogs } = await readUserContext(clientId);

  const sections = [];
  if (soul) sections.push(`## SOUL (Personality)\n${soul}`);
  if (user) sections.push(`## CLIENT PREFERENCES\n${user}`);
  if (memory) sections.push(`## LONG-TERM MEMORY\n${memory}`);
  if (dailyLogs.length) {
    const logsStr = dailyLogs
      .map((l) => `### ${l.date}\n${l.content}`)
      .join('\n\n');
    sections.push(`## RECENT DAILY LOGS\n${logsStr}`);
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Append an entry to today's daily log file.
 */
async function appendDailyLog(clientId, entry) {
  const file = dailyFile(clientId);
  await ensureDir(path.dirname(file));

  const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const line = `\n- **${timestamp}** — ${entry}\n`;

  // Create file with header if it doesn't exist
  try {
    await fs.access(file);
  } catch {
    const dateStr = new Date().toISOString().slice(0, 10);
    await fs.writeFile(file, `# Daily Log — ${dateStr}\n`, 'utf-8');
  }

  await fs.appendFile(file, line, 'utf-8');
}

/**
 * Append a distilled insight/learning to MEMORY.md.
 */
async function updateMemory(clientId, insight) {
  const file = path.join(clientDir(clientId), 'MEMORY.md');
  await ensureDir(clientDir(clientId));

  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, `# Long-Term Memory\n`, 'utf-8');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const line = `\n- [${dateStr}] ${insight}\n`;
  await fs.appendFile(file, line, 'utf-8');
}

/**
 * Parse USER.md for notification preferences and trust overrides.
 * Returns a structured object.
 */
async function getUserPreferences(clientId) {
  const userMd = await readFileSafe(path.join(clientDir(clientId), 'USER.md'));
  if (!userMd) return { notifications: {}, trustOverrides: {}, campaigns: [] };

  const prefs = {
    notifications: {
      frequency: 'weekly',
      email: null,
      whatsapp: null,
      quietHours: { start: 23, end: 8 },
      emergencyOverride: true,
      dailyDigest: false,
      milestones: true,
    },
    trustOverrides: {},
    campaigns: [],
    tone: null,
    riskTolerance: null,
  };

  // Parse key-value pairs from markdown list items
  const lines = userMd.split('\n');
  let section = '';

  for (const raw of lines) {
    const line = raw.trim();

    // Detect sections
    if (/^##\s+preferences/i.test(line) || /^##\s+notification/i.test(line)) {
      section = 'prefs';
      continue;
    }
    if (/^##\s+trust\s+overrides/i.test(line)) {
      section = 'trust';
      continue;
    }
    if (/^##\s+active\s+campaigns/i.test(line)) {
      section = 'campaigns';
      continue;
    }
    if (/^##\s/.test(line)) {
      section = '';
      continue;
    }

    if (!line.startsWith('-')) continue;
    const content = line.replace(/^-\s*/, '');

    if (section === 'prefs') {
      const kv = content.split(':').map((s) => s.split('#')[0].trim()); // strip comments
      if (kv.length < 2) continue;
      const key = kv[0].toLowerCase();
      const val = kv.slice(1).join(':').trim();

      if (key.includes('notification') || key === 'frequency') prefs.notifications.frequency = val;
      else if (key === 'email') prefs.notifications.email = val;
      else if (key === 'whatsapp') prefs.notifications.whatsapp = val;
      else if (key === 'tone') prefs.tone = val;
      else if (key.includes('risk')) prefs.riskTolerance = val;
      else if (key.includes('channels')) prefs.notifications.channels = val.split('+').map((s) => s.trim());
      else if (key.includes('quiet')) {
        const m = val.match(/(\d+).*?(\d+)/);
        if (m) prefs.notifications.quietHours = { start: parseInt(m[1]), end: parseInt(m[2]) };
      }
      else if (key.includes('emergency')) prefs.notifications.emergencyOverride = /yes|true/i.test(val);
      else if (key.includes('daily digest')) prefs.notifications.dailyDigest = /yes|true/i.test(val);
      else if (key.includes('milestone')) prefs.notifications.milestones = /yes|true/i.test(val);
    }

    if (section === 'trust') {
      const match = content.match(/^(.+?):\s*(.+)/);
      if (match) {
        const action = match[1].trim();
        const level = match[2].split('(')[0].trim(); // e.g. "L1 auto" → "L1 auto"
        prefs.trustOverrides[action] = level;
      }
    }

    if (section === 'campaigns') {
      prefs.campaigns.push(content);
    }
  }

  return prefs;
}

module.exports = {
  readSoul,
  readUserContext,
  assembleContext,
  appendDailyLog,
  updateMemory,
  getUserPreferences,
  // Expose for testing
  _internals: { BASE_PATH, clientDir, dailyFile, readFileSafe },
};
