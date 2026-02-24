/**
 * chatRouter.js — Unified Chat Router
 * 
 * Replaces the monolithic auxora-chat.js with a module-based routing system.
 * 
 * Routing priority:
 * 1. Stage-based: If session.stage has an owning module → route there (free, instant)
 * 2. LLM fallback: If no module owns the stage → classify intent (rare, expensive)
 * 
 * All responses are Effect-based — the effect pipeline handles side effects.
 */

const crypto = require('crypto');
const registry = require('./moduleRegistry');
const { pipeline } = require('./effectSystem');
const agentContext = require('./agentContext');
const logger = require('../../utils/logger');

// ============================================================================
// SESSION STORE
// ============================================================================

const sessions = new Map();

function createSession(clientId) {
  const id = crypto.randomUUID();
  const session = {
    id,
    clientId: clientId || 'default',
    stage: 'discovery',
    module: 'strategist',
    subStep: 0,
    collectedData: {},
    decisions: {},
    messages: [],
    questionCount: 0,
    report: null,
    connections: { shopify: false, meta: false, google: false, tracking: false },
    notificationPolicy: null,
    pendingCards: [],
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

// Clean up old sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - (2 * 60 * 60 * 1000);
  for (const [id, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(id);
  }
}, 30 * 60 * 1000);

// ============================================================================
// CORE ROUTING
// ============================================================================

/**
 * Process a user message through the module system
 * @param {string} sessionId
 * @param {string} userText
 * @returns {AsyncGenerator} SSE events
 */
async function* processMessage(sessionId, userText) {
  const session = getSession(sessionId);
  if (!session) {
    yield { event: 'error', data: { error: 'Session not found' } };
    return;
  }
  
  yield { event: 'typing', data: { show: true } };
  
  try {
    // 1. Route to the right module
    let mod = registry.getModuleForStage(session.stage);
    
    if (!mod) {
      // Fallback: no module owns this stage — use simple heuristic
      // (LLM classification is overkill for our well-defined stage flow)
      logger.warn(`[chatRouter] No module for stage '${session.stage}', defaulting to analyzer`);
      mod = registry.getModule('analyzer') || registry.getModule('strategist');
    }
    
    if (!mod || !mod.handleMessage) {
      yield { event: 'message', data: { type: 'text', sender: 'auxora', text: "I'm not sure how to help with that right now." } };
      yield { event: 'done', data: {} };
      return;
    }
    
    // 2. Build context for the module
    let context = {};
    try {
      context = await agentContext.buildContext(session.clientId, mod.name, {});
    } catch {
      // Context building is optional — proceed without it
    }
    
    // 3. Module handles the message → returns effects + sseEvents
    const result = await mod.handleMessage(session, userText, context);
    const { effects = [], sseEvents = [] } = result;
    
    // 4. Check for reroute (stage changed, new module should handle)
    let rerouteEvent = sseEvents.find(e => e.event === '_reroute');
    
    // 5. Yield SSE events (filter out internal events)
    for (const sse of sseEvents) {
      if (sse.event === '_reroute') continue;
      if (sse.event === 'done') continue; // We'll yield done at the end
      yield sse;
    }
    
    // 5b. Handle deferred work (e.g., report generation)
    // Events above are flushed to client first, then we do the heavy lifting
    if (session._deferredWork) {
      const deferredFn = session._deferredWork;
      delete session._deferredWork;
      
      const deferredResult = await deferredFn();
      if (deferredResult) {
        // Yield deferred SSE events
        for (const sse of (deferredResult.sseEvents || [])) {
          if (sse.event === 'done') continue;
          // Skip duplicated progress events (already sent in phase 1)
          if (sse.event === 'chat_progress') continue;
          if (sse.event === 'agent_action') continue;
          if (sse.event === 'progress_step' && sse.data?.step === 4 && sse.data?.status === 'active') continue;
          if (sse.event === 'stage' && sse.data?.stage === 'report-gen') continue;
          yield sse;
        }
        // Add deferred effects
        effects.push(...(deferredResult.effects || []));
      }
    }
    
    // 6. Process effects through pipeline
    if (effects.length > 0) {
      const pipelineResult = await pipeline.process(effects, { session });
      
      // Yield any SSE events from pipeline (dashboard updates, etc.)
      for (const sse of pipelineResult.sseEvents) {
        yield sse;
      }
      
      // Log errors but don't fail
      if (pipelineResult.errors.length > 0) {
        logger.warn(`[chatRouter] ${pipelineResult.errors.length} pipeline errors:`, pipelineResult.errors);
      }
    }
    
    // 7. Handle reroute — if module changed the stage, delegate to new module
    if (rerouteEvent) {
      const newMod = registry.getModuleForStage(rerouteEvent.data.stage);
      if (newMod && newMod.handleMessage && newMod.name !== mod.name) {
        session.module = newMod.name;
        const rerouteResult = await newMod.handleMessage(session, userText, context);
        
        for (const sse of rerouteResult.sseEvents) {
          if (sse.event === '_reroute' || sse.event === 'done') continue;
          yield sse;
        }
        
        if (rerouteResult.effects.length > 0) {
          const pResult = await pipeline.process(rerouteResult.effects, { session });
          for (const sse of pResult.sseEvents) yield sse;
        }
      }
    }
    
    // Update session module tracking
    const currentMod = registry.getModuleForStage(session.stage);
    if (currentMod) session.module = currentMod.name;
    
    yield { event: 'done', data: {} };
    
  } catch (err) {
    logger.error('[chatRouter] Error processing message:', err);
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: 'Something went wrong. Please try again.' } };
    yield { event: 'done', data: {} };
  }
}

/**
 * Get greeting for a new session
 * @param {string} sessionId
 * @returns {AsyncGenerator} SSE events
 */
async function* getGreeting(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    yield { event: 'error', data: { error: 'Session not found' } };
    return;
  }
  
  // Greeting always comes from strategist (first module)
  const mod = registry.getModule('strategist');
  if (!mod || !mod.getGreeting) {
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: "Hey! I'm Auxora. Tell me about your business." } };
    yield { event: 'done', data: {} };
    return;
  }
  
  try {
    const result = await mod.getGreeting(session);
    
    for (const sse of result.sseEvents) {
      yield sse;
    }
    
    if (result.effects.length > 0) {
      await pipeline.process(result.effects, { session });
    }
  } catch (err) {
    logger.error('[chatRouter] Greeting error:', err);
    yield { event: 'message', data: { type: 'text', sender: 'auxora', text: "Hey! I'm Auxora. What's your website?" } };
    yield { event: 'done', data: {} };
  }
}

// ============================================================================
// EXPORTS — Same interface as auxora-chat.js for drop-in replacement
// ============================================================================

module.exports = {
  createSession,
  getSession,
  processMessage,
  getGreeting,
};
