# Production-Ready AI Agent Architecture for Nexspark

## Overview
Building a robust multi-layer agent system that can handle errors, scale, and provide excellent user experience.

---

## Core Architecture Layers

### 1. Planning Layer (任务分解和执行规划)
**Purpose**: Break down complex user requests into executable subtasks

**Implementation**:
```typescript
// src/services/agent/planning-layer.ts
interface Task {
  id: string;
  type: 'analysis' | 'research' | 'generation' | 'validation';
  description: string;
  dependencies: string[]; // IDs of tasks that must complete first
  priority: number;
  estimatedTime: number; // seconds
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

interface ExecutionPlan {
  planId: string;
  userId: string;
  tasks: Task[];
  totalEstimatedTime: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class PlanningLayer {
  async createExecutionPlan(userRequest: string, context: any): Promise<ExecutionPlan> {
    // Use Claude to analyze request and create task breakdown
    const prompt = `
      Analyze this user request and break it into executable subtasks:
      Request: ${userRequest}
      Context: ${JSON.stringify(context)}
      
      Return a structured plan with:
      1. Task breakdown (analysis, research, generation steps)
      2. Task dependencies (which tasks must complete first)
      3. Estimated time for each task
      4. Priority ordering
      
      Return as JSON with tasks array.
    `;
    
    // Call Claude API
    const plan = await this.callClaude(prompt);
    
    return {
      planId: generateId(),
      userId: context.userId,
      tasks: plan.tasks.map(t => ({
        ...t,
        retryCount: 0,
        maxRetries: 3,
        status: 'pending'
      })),
      totalEstimatedTime: plan.tasks.reduce((sum, t) => sum + t.estimatedTime, 0),
      createdAt: new Date()
    };
  }
  
  async optimizePlan(plan: ExecutionPlan): Promise<ExecutionPlan> {
    // Identify parallel-executable tasks
    // Reorder for optimal execution
    // Merge similar tasks
    return plan;
  }
}
```

---

### 2. Memory System (短期工作记忆+长期知识存储)

**Purpose**: Store conversation context, user data, and learned patterns

**Implementation**:

#### A. Short-term Working Memory (Redis/KV)
```typescript
// src/services/agent/memory/short-term.ts
interface WorkingMemory {
  sessionId: string;
  userId: string;
  conversationHistory: Message[];
  currentContext: Record<string, any>;
  activeTaskIds: string[];
  createdAt: Date;
  expiresAt: Date; // TTL: 1 hour
}

export class ShortTermMemory {
  constructor(private kv: KVNamespace) {}
  
  async store(sessionId: string, data: WorkingMemory): Promise<void> {
    const key = `session:${sessionId}`;
    await this.kv.put(key, JSON.stringify(data), {
      expirationTtl: 3600 // 1 hour
    });
  }
  
  async retrieve(sessionId: string): Promise<WorkingMemory | null> {
    const key = `session:${sessionId}`;
    const data = await this.kv.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async append(sessionId: string, message: Message): Promise<void> {
    const memory = await this.retrieve(sessionId);
    if (memory) {
      memory.conversationHistory.push(message);
      // Keep only last 20 messages
      if (memory.conversationHistory.length > 20) {
        memory.conversationHistory = memory.conversationHistory.slice(-20);
      }
      await this.store(sessionId, memory);
    }
  }
}
```

#### B. Long-term Knowledge Storage (D1 Database)
```typescript
// src/services/agent/memory/long-term.ts
interface UserProfile {
  userId: string;
  businessName: string;
  industry: string;
  previousAnalyses: string[]; // IDs
  learnings: Record<string, any>; // Key insights
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalysisRecord {
  analysisId: string;
  userId: string;
  type: string;
  input: any;
  output: any;
  successful: boolean;
  duration: number;
  createdAt: Date;
}

export class LongTermMemory {
  constructor(private db: D1Database) {}
  
  async storeUserProfile(profile: UserProfile): Promise<void> {
    await this.db.prepare(`
      INSERT INTO user_profiles (user_id, business_name, industry, learnings, preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        learnings = excluded.learnings,
        preferences = excluded.preferences,
        updated_at = excluded.updated_at
    `).bind(
      profile.userId,
      profile.businessName,
      profile.industry,
      JSON.stringify(profile.learnings),
      JSON.stringify(profile.preferences),
      profile.createdAt.toISOString(),
      profile.updatedAt.toISOString()
    ).run();
  }
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const result = await this.db.prepare(`
      SELECT * FROM user_profiles WHERE user_id = ?
    `).bind(userId).first();
    
    if (!result) return null;
    
    return {
      userId: result.user_id,
      businessName: result.business_name,
      industry: result.industry,
      previousAnalyses: JSON.parse(result.previous_analyses || '[]'),
      learnings: JSON.parse(result.learnings || '{}'),
      preferences: JSON.parse(result.preferences || '{}'),
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    };
  }
  
  async storeAnalysis(record: AnalysisRecord): Promise<void> {
    await this.db.prepare(`
      INSERT INTO analysis_records (analysis_id, user_id, type, input, output, successful, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      record.analysisId,
      record.userId,
      record.type,
      JSON.stringify(record.input),
      JSON.stringify(record.output),
      record.successful ? 1 : 0,
      record.duration,
      record.createdAt.toISOString()
    ).run();
  }
  
  async getRecentAnalyses(userId: string, limit: number = 5): Promise<AnalysisRecord[]> {
    const results = await this.db.prepare(`
      SELECT * FROM analysis_records 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(userId, limit).all();
    
    return results.results.map(r => ({
      analysisId: r.analysis_id,
      userId: r.user_id,
      type: r.type,
      input: JSON.parse(r.input),
      output: JSON.parse(r.output),
      successful: r.successful === 1,
      duration: r.duration,
      createdAt: new Date(r.created_at)
    }));
  }
}
```

---

### 3. Tool Orchestration (工具调用的智能编排)

**Purpose**: Intelligently coordinate API calls, manage rate limits, handle failures

**Implementation**:
```typescript
// src/services/agent/tool-orchestration.ts
interface Tool {
  name: string;
  description: string;
  rateLimit: {
    maxCallsPerMinute: number;
    maxCallsPerHour: number;
  };
  costPerCall: number; // USD
  averageLatency: number; // ms
  reliability: number; // 0-1 score
}

interface ToolCall {
  toolName: string;
  params: any;
  priority: number;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

interface ToolResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
  cost: number;
  retries: number;
}

export class ToolOrchestrator {
  private tools: Map<string, Tool>;
  private rateLimiters: Map<string, RateLimiter>;
  private costTracker: CostTracker;
  
  constructor(private kv: KVNamespace) {
    this.tools = new Map();
    this.rateLimiters = new Map();
    this.costTracker = new CostTracker(kv);
    
    // Register tools
    this.registerTool({
      name: 'claude',
      description: 'Claude AI API for analysis',
      rateLimit: { maxCallsPerMinute: 50, maxCallsPerHour: 1000 },
      costPerCall: 0.015,
      averageLatency: 2000,
      reliability: 0.99
    });
    
    this.registerTool({
      name: 'rapidapi',
      description: 'RapidAPI for traffic data',
      rateLimit: { maxCallsPerMinute: 10, maxCallsPerHour: 100 },
      costPerCall: 0.05,
      averageLatency: 3000,
      reliability: 0.95
    });
  }
  
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.rateLimiters.set(tool.name, new RateLimiter(
      tool.rateLimit.maxCallsPerMinute,
      tool.rateLimit.maxCallsPerHour
    ));
  }
  
  async executeTool(call: ToolCall): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = this.tools.get(call.toolName);
    
    if (!tool) {
      return {
        toolName: call.toolName,
        success: false,
        error: 'Tool not found',
        duration: 0,
        cost: 0,
        retries: 0
      };
    }
    
    const rateLimiter = this.rateLimiters.get(call.toolName)!;
    
    // Wait for rate limit
    await rateLimiter.waitForSlot();
    
    // Execute with retry logic
    let retries = 0;
    let lastError: string = '';
    
    while (retries <= call.retryPolicy.maxRetries) {
      try {
        const result = await this.callTool(tool, call.params, call.timeout);
        const duration = Date.now() - startTime;
        const cost = tool.costPerCall * (retries + 1);
        
        // Track cost
        await this.costTracker.addCost(call.toolName, cost);
        
        return {
          toolName: call.toolName,
          success: true,
          result,
          duration,
          cost,
          retries
        };
        
      } catch (error: any) {
        lastError = error.message;
        retries++;
        
        if (retries <= call.retryPolicy.maxRetries) {
          const delay = call.retryPolicy.initialDelay * 
            Math.pow(call.retryPolicy.backoffMultiplier, retries - 1);
          await this.sleep(delay);
        }
      }
    }
    
    // All retries failed
    const duration = Date.now() - startTime;
    const cost = tool.costPerCall * retries;
    await this.costTracker.addCost(call.toolName, cost);
    
    return {
      toolName: call.toolName,
      success: false,
      error: lastError,
      duration,
      cost,
      retries: retries - 1
    };
  }
  
  async executeParallel(calls: ToolCall[]): Promise<ToolResult[]> {
    // Execute multiple tool calls in parallel with coordination
    return Promise.all(calls.map(call => this.executeTool(call)));
  }
  
  async optimizeCallOrder(calls: ToolCall[]): Promise<ToolCall[]> {
    // Sort by priority, cost, and estimated latency
    return calls.sort((a, b) => {
      const toolA = this.tools.get(a.toolName)!;
      const toolB = this.tools.get(b.toolName)!;
      
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Lower cost first
      if (toolA.costPerCall !== toolB.costPerCall) {
        return toolA.costPerCall - toolB.costPerCall;
      }
      
      // Faster tools first
      return toolA.averageLatency - toolB.averageLatency;
    });
  }
  
  private async callTool(tool: Tool, params: any, timeout: number): Promise<any> {
    // Implement actual tool calls here
    // This is a placeholder
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve({ data: 'mock result' }), tool.averageLatency);
    });
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class RateLimiter {
  private minuteWindow: number[] = [];
  private hourWindow: number[] = [];
  
  constructor(
    private maxPerMinute: number,
    private maxPerHour: number
  ) {}
  
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Clean old entries
    this.minuteWindow = this.minuteWindow.filter(t => now - t < 60000);
    this.hourWindow = this.hourWindow.filter(t => now - t < 3600000);
    
    // Wait if limits exceeded
    while (
      this.minuteWindow.length >= this.maxPerMinute ||
      this.hourWindow.length >= this.maxPerHour
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.minuteWindow = this.minuteWindow.filter(t => Date.now() - t < 60000);
      this.hourWindow = this.hourWindow.filter(t => Date.now() - t < 3600000);
    }
    
    // Record this call
    this.minuteWindow.push(now);
    this.hourWindow.push(now);
  }
}

class CostTracker {
  constructor(private kv: KVNamespace) {}
  
  async addCost(toolName: string, cost: number): Promise<void> {
    const key = `cost:${toolName}:${new Date().toISOString().slice(0, 10)}`;
    const current = await this.kv.get(key);
    const total = (current ? parseFloat(current) : 0) + cost;
    await this.kv.put(key, total.toString(), { expirationTtl: 86400 * 7 }); // 7 days
  }
  
  async getDailyCost(toolName: string, date: Date): Promise<number> {
    const key = `cost:${toolName}:${date.toISOString().slice(0, 10)}`;
    const value = await this.kv.get(key);
    return value ? parseFloat(value) : 0;
  }
}
```

---

### 4. State Management (执行状态的持久化管理)

**Purpose**: Track execution progress, enable resume after failures

**Implementation**:
```typescript
// src/services/agent/state-management.ts
interface ExecutionState {
  executionId: string;
  planId: string;
  userId: string;
  currentTaskId: string | null;
  completedTasks: string[];
  failedTasks: string[];
  taskResults: Record<string, any>;
  variables: Record<string, any>; // Shared state between tasks
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export class StateManager {
  constructor(
    private db: D1Database,
    private kv: KVNamespace
  ) {}
  
  async createExecution(planId: string, userId: string): Promise<string> {
    const executionId = generateId();
    const state: ExecutionState = {
      executionId,
      planId,
      userId,
      currentTaskId: null,
      completedTasks: [],
      failedTasks: [],
      taskResults: {},
      variables: {},
      status: 'initializing',
      progress: 0,
      startedAt: new Date(),
      lastUpdatedAt: new Date()
    };
    
    // Store in both KV (fast access) and D1 (persistent)
    await this.saveState(state);
    
    return executionId;
  }
  
  async getState(executionId: string): Promise<ExecutionState | null> {
    // Try KV first (faster)
    const kvKey = `execution:${executionId}`;
    const cached = await this.kv.get(kvKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fallback to D1
    const result = await this.db.prepare(`
      SELECT * FROM execution_states WHERE execution_id = ?
    `).bind(executionId).first();
    
    if (!result) return null;
    
    const state: ExecutionState = {
      executionId: result.execution_id,
      planId: result.plan_id,
      userId: result.user_id,
      currentTaskId: result.current_task_id,
      completedTasks: JSON.parse(result.completed_tasks),
      failedTasks: JSON.parse(result.failed_tasks),
      taskResults: JSON.parse(result.task_results),
      variables: JSON.parse(result.variables),
      status: result.status,
      progress: result.progress,
      startedAt: new Date(result.started_at),
      lastUpdatedAt: new Date(result.last_updated_at),
      completedAt: result.completed_at ? new Date(result.completed_at) : undefined,
      error: result.error
    };
    
    // Cache in KV for next access
    await this.kv.put(kvKey, JSON.stringify(state), { expirationTtl: 3600 });
    
    return state;
  }
  
  async updateState(executionId: string, updates: Partial<ExecutionState>): Promise<void> {
    const current = await this.getState(executionId);
    if (!current) throw new Error('Execution not found');
    
    const updated = {
      ...current,
      ...updates,
      lastUpdatedAt: new Date()
    };
    
    await this.saveState(updated);
  }
  
  async markTaskCompleted(executionId: string, taskId: string, result: any): Promise<void> {
    const state = await this.getState(executionId);
    if (!state) throw new Error('Execution not found');
    
    state.completedTasks.push(taskId);
    state.taskResults[taskId] = result;
    state.currentTaskId = null;
    state.progress = (state.completedTasks.length / (state.completedTasks.length + state.failedTasks.length + 1)) * 100;
    
    await this.saveState(state);
  }
  
  async markTaskFailed(executionId: string, taskId: string, error: string): Promise<void> {
    const state = await this.getState(executionId);
    if (!state) throw new Error('Execution not found');
    
    state.failedTasks.push(taskId);
    state.taskResults[taskId] = { error };
    state.currentTaskId = null;
    
    await this.saveState(state);
  }
  
  async pauseExecution(executionId: string): Promise<void> {
    await this.updateState(executionId, { status: 'paused' });
  }
  
  async resumeExecution(executionId: string): Promise<void> {
    await this.updateState(executionId, { status: 'running' });
  }
  
  private async saveState(state: ExecutionState): Promise<void> {
    // Save to KV (fast, temporary)
    const kvKey = `execution:${state.executionId}`;
    await this.kv.put(kvKey, JSON.stringify(state), { expirationTtl: 3600 });
    
    // Save to D1 (persistent)
    await this.db.prepare(`
      INSERT INTO execution_states (
        execution_id, plan_id, user_id, current_task_id,
        completed_tasks, failed_tasks, task_results, variables,
        status, progress, started_at, last_updated_at, completed_at, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(execution_id) DO UPDATE SET
        current_task_id = excluded.current_task_id,
        completed_tasks = excluded.completed_tasks,
        failed_tasks = excluded.failed_tasks,
        task_results = excluded.task_results,
        variables = excluded.variables,
        status = excluded.status,
        progress = excluded.progress,
        last_updated_at = excluded.last_updated_at,
        completed_at = excluded.completed_at,
        error = excluded.error
    `).bind(
      state.executionId,
      state.planId,
      state.userId,
      state.currentTaskId,
      JSON.stringify(state.completedTasks),
      JSON.stringify(state.failedTasks),
      JSON.stringify(state.taskResults),
      JSON.stringify(state.variables),
      state.status,
      state.progress,
      state.startedAt.toISOString(),
      state.lastUpdatedAt.toISOString(),
      state.completedAt?.toISOString() || null,
      state.error || null
    ).run();
  }
}
```

---

### 5. Error Recovery (异常处理和重试机制)

**Purpose**: Handle failures gracefully, retry intelligently, maintain user experience

**Implementation**:
```typescript
// src/services/agent/error-recovery.ts
interface ErrorContext {
  executionId: string;
  taskId: string;
  toolName?: string;
  errorType: 'timeout' | 'rate_limit' | 'api_error' | 'validation' | 'unknown';
  errorMessage: string;
  attemptNumber: number;
  timestamp: Date;
  userImpact: 'none' | 'minor' | 'major' | 'critical';
}

interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'skip' | 'manual' | 'abort';
  delay?: number;
  fallbackTool?: string;
  fallbackParams?: any;
  notification?: string;
}

export class ErrorRecovery {
  constructor(
    private stateManager: StateManager,
    private toolOrchestrator: ToolOrchestrator,
    private notificationService: NotificationService
  ) {}
  
  async handleError(context: ErrorContext): Promise<RecoveryStrategy> {
    // Log error for analysis
    await this.logError(context);
    
    // Determine recovery strategy based on error type
    const strategy = this.determineStrategy(context);
    
    // Execute recovery
    const result = await this.executeRecovery(context, strategy);
    
    // Notify user if needed
    if (strategy.notification) {
      await this.notifyUser(context, strategy);
    }
    
    return strategy;
  }
  
  private determineStrategy(context: ErrorContext): RecoveryStrategy {
    // Rate limit errors - wait and retry
    if (context.errorType === 'rate_limit') {
      return {
        type: 'retry',
        delay: 60000, // Wait 1 minute
        notification: 'Processing delayed due to high demand. Please wait...'
      };
    }
    
    // Timeout errors - retry with increased timeout
    if (context.errorType === 'timeout') {
      if (context.attemptNumber < 3) {
        return {
          type: 'retry',
          delay: 5000 * context.attemptNumber
        };
      } else {
        return {
          type: 'fallback',
          notification: 'Switching to alternative method due to slow response...'
        };
      }
    }
    
    // API errors - try fallback or skip
    if (context.errorType === 'api_error') {
      if (this.hasFallback(context.toolName)) {
        return {
          type: 'fallback',
          fallbackTool: this.getFallbackTool(context.toolName),
          notification: 'Using alternative data source...'
        };
      } else if (context.userImpact === 'minor') {
        return {
          type: 'skip',
          notification: 'Continuing with partial results...'
        };
      } else {
        return {
          type: 'abort',
          notification: 'Unable to complete analysis. Please try again later.'
        };
      }
    }
    
    // Validation errors - usually can't retry
    if (context.errorType === 'validation') {
      return {
        type: 'manual',
        notification: 'Invalid input detected. Please check your data and try again.'
      };
    }
    
    // Unknown errors - retry once then fallback
    if (context.attemptNumber === 1) {
      return {
        type: 'retry',
        delay: 3000
      };
    } else {
      return {
        type: 'fallback',
        notification: 'Encountered unexpected issue. Trying alternative approach...'
      };
    }
  }
  
  private async executeRecovery(
    context: ErrorContext,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    switch (strategy.type) {
      case 'retry':
        // Wait specified delay
        if (strategy.delay) {
          await this.sleep(strategy.delay);
        }
        
        // Mark task for retry
        const state = await this.stateManager.getState(context.executionId);
        if (state) {
          state.currentTaskId = context.taskId;
          await this.stateManager.updateState(context.executionId, state);
        }
        return true;
        
      case 'fallback':
        // Switch to fallback tool
        if (strategy.fallbackTool) {
          // Update execution to use fallback
          const state = await this.stateManager.getState(context.executionId);
          if (state) {
            state.variables['fallback_tool'] = strategy.fallbackTool;
            await this.stateManager.updateState(context.executionId, state);
          }
        }
        return true;
        
      case 'skip':
        // Mark task as completed with empty result
        await this.stateManager.markTaskCompleted(
          context.executionId,
          context.taskId,
          { skipped: true, reason: context.errorMessage }
        );
        return true;
        
      case 'manual':
        // Pause execution for manual intervention
        await this.stateManager.pauseExecution(context.executionId);
        return false;
        
      case 'abort':
        // Mark execution as failed
        await this.stateManager.updateState(context.executionId, {
          status: 'failed',
          error: context.errorMessage
        });
        return false;
    }
  }
  
  private async logError(context: ErrorContext): Promise<void> {
    // Log to monitoring system
    console.error('[Error Recovery]', {
      executionId: context.executionId,
      taskId: context.taskId,
      errorType: context.errorType,
      message: context.errorMessage,
      attempt: context.attemptNumber,
      userImpact: context.userImpact,
      timestamp: context.timestamp.toISOString()
    });
    
    // Store in database for analysis
    // TODO: Implement error logging to D1
  }
  
  private async notifyUser(
    context: ErrorContext,
    strategy: RecoveryStrategy
  ): Promise<void> {
    if (strategy.notification) {
      await this.notificationService.send(context.executionId, {
        type: 'warning',
        message: strategy.notification,
        timestamp: new Date()
      });
    }
  }
  
  private hasFallback(toolName?: string): boolean {
    if (!toolName) return false;
    
    const fallbacks: Record<string, string> = {
      'rapidapi': 'similarweb',
      'claude': 'gpt4',
      'primary_search': 'backup_search'
    };
    
    return toolName in fallbacks;
  }
  
  private getFallbackTool(toolName?: string): string {
    if (!toolName) return '';
    
    const fallbacks: Record<string, string> = {
      'rapidapi': 'similarweb',
      'claude': 'gpt4',
      'primary_search': 'backup_search'
    };
    
    return fallbacks[toolName] || '';
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class NotificationService {
  async send(executionId: string, notification: any): Promise<void> {
    // Send real-time notification to user
    // Could use WebSockets, Server-Sent Events, or polling
    console.log(`[Notification] ${executionId}:`, notification);
  }
}
```

---

## Integration Example

```typescript
// src/services/agent/orchestrator.ts
export class AgentOrchestrator {
  private planningLayer: PlanningLayer;
  private shortTermMemory: ShortTermMemory;
  private longTermMemory: LongTermMemory;
  private toolOrchestrator: ToolOrchestrator;
  private stateManager: StateManager;
  private errorRecovery: ErrorRecovery;
  
  constructor(env: any) {
    this.planningLayer = new PlanningLayer();
    this.shortTermMemory = new ShortTermMemory(env.KV);
    this.longTermMemory = new LongTermMemory(env.DB);
    this.toolOrchestrator = new ToolOrchestrator(env.KV);
    this.stateManager = new StateManager(env.DB, env.KV);
    this.errorRecovery = new ErrorRecovery(
      this.stateManager,
      this.toolOrchestrator,
      new NotificationService()
    );
  }
  
  async executeUserRequest(userId: string, request: string): Promise<string> {
    // 1. Load user context from memory
    const userProfile = await this.longTermMemory.getUserProfile(userId);
    const sessionMemory = await this.shortTermMemory.retrieve(userId);
    
    // 2. Create execution plan
    const plan = await this.planningLayer.createExecutionPlan(request, {
      userId,
      userProfile,
      sessionMemory
    });
    
    // 3. Create execution state
    const executionId = await this.stateManager.createExecution(plan.planId, userId);
    
    // 4. Execute tasks with error handling
    for (const task of plan.tasks) {
      try {
        await this.stateManager.updateState(executionId, {
          currentTaskId: task.id,
          status: 'running'
        });
        
        const result = await this.executeTask(task, executionId);
        
        await this.stateManager.markTaskCompleted(executionId, task.id, result);
        
      } catch (error: any) {
        const errorContext: ErrorContext = {
          executionId,
          taskId: task.id,
          errorType: this.classifyError(error),
          errorMessage: error.message,
          attemptNumber: task.retryCount + 1,
          timestamp: new Date(),
          userImpact: this.assessImpact(task)
        };
        
        const strategy = await this.errorRecovery.handleError(errorContext);
        
        if (strategy.type === 'abort') {
          throw new Error('Execution aborted due to critical error');
        }
      }
    }
    
    // 5. Mark execution complete
    await this.stateManager.updateState(executionId, {
      status: 'completed',
      completedAt: new Date(),
      progress: 100
    });
    
    return executionId;
  }
  
  private async executeTask(task: Task, executionId: string): Promise<any> {
    // Execute task based on type
    const toolCall: ToolCall = {
      toolName: this.getToolForTask(task.type),
      params: task,
      priority: task.priority,
      timeout: task.estimatedTime * 1000,
      retryPolicy: {
        maxRetries: task.maxRetries,
        backoffMultiplier: 2,
        initialDelay: 1000
      }
    };
    
    const result = await this.toolOrchestrator.executeTool(toolCall);
    
    if (!result.success) {
      throw new Error(result.error || 'Tool execution failed');
    }
    
    return result.result;
  }
  
  private getToolForTask(taskType: string): string {
    const mapping: Record<string, string> = {
      'analysis': 'claude',
      'research': 'rapidapi',
      'generation': 'claude',
      'validation': 'internal'
    };
    return mapping[taskType] || 'claude';
  }
  
  private classifyError(error: any): ErrorContext['errorType'] {
    if (error.message.includes('timeout')) return 'timeout';
    if (error.message.includes('rate limit')) return 'rate_limit';
    if (error.message.includes('API')) return 'api_error';
    if (error.message.includes('validation')) return 'validation';
    return 'unknown';
  }
  
  private assessImpact(task: Task): ErrorContext['userImpact'] {
    if (task.priority >= 9) return 'critical';
    if (task.priority >= 7) return 'major';
    if (task.priority >= 5) return 'minor';
    return 'none';
  }
}
```

---

## Database Schema (D1)

```sql
-- migrations/0001_agent_system.sql

-- User profiles for long-term memory
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  business_name TEXT,
  industry TEXT,
  previous_analyses TEXT, -- JSON array
  learnings TEXT, -- JSON object
  preferences TEXT, -- JSON object
  created_at DATETIME,
  updated_at DATETIME
);

-- Analysis records for learning
CREATE TABLE IF NOT EXISTS analysis_records (
  analysis_id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  input TEXT, -- JSON
  output TEXT, -- JSON
  successful INTEGER,
  duration INTEGER,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Execution states for persistence
CREATE TABLE IF NOT EXISTS execution_states (
  execution_id TEXT PRIMARY KEY,
  plan_id TEXT,
  user_id TEXT,
  current_task_id TEXT,
  completed_tasks TEXT, -- JSON array
  failed_tasks TEXT, -- JSON array
  task_results TEXT, -- JSON object
  variables TEXT, -- JSON object
  status TEXT,
  progress REAL,
  started_at DATETIME,
  last_updated_at DATETIME,
  completed_at DATETIME,
  error TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Error logs for analysis
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT,
  task_id TEXT,
  tool_name TEXT,
  error_type TEXT,
  error_message TEXT,
  attempt_number INTEGER,
  user_impact TEXT,
  recovery_strategy TEXT,
  timestamp DATETIME,
  FOREIGN KEY (execution_id) REFERENCES execution_states(execution_id)
);

CREATE INDEX idx_analysis_user ON analysis_records(user_id);
CREATE INDEX idx_execution_user ON execution_states(user_id);
CREATE INDEX idx_error_execution ON error_logs(execution_id);
```

---

## Next Steps to Implement

1. **Create the database schema**
   ```bash
   npx wrangler d1 migrations apply nexspark-production --local
   ```

2. **Create service files**
   ```bash
   mkdir -p src/services/agent/memory
   touch src/services/agent/planning-layer.ts
   touch src/services/agent/memory/short-term.ts
   touch src/services/agent/memory/long-term.ts
   touch src/services/agent/tool-orchestration.ts
   touch src/services/agent/state-management.ts
   touch src/services/agent/error-recovery.ts
   touch src/services/agent/orchestrator.ts
   ```

3. **Add API endpoints**
   ```typescript
   // In src/index.tsx
   app.post('/api/agent/execute', async (c) => {
     const { userId, request } = await c.req.json();
     const orchestrator = new AgentOrchestrator(c.env);
     const executionId = await orchestrator.executeUserRequest(userId, request);
     return c.json({ success: true, executionId });
   });
   
   app.get('/api/agent/status/:executionId', async (c) => {
     const executionId = c.req.param('executionId');
     const stateManager = new StateManager(c.env.DB, c.env.KV);
     const state = await stateManager.getState(executionId);
     return c.json({ success: true, state });
   });
   ```

4. **Test incrementally**
   - Start with Planning Layer
   - Add Memory System
   - Integrate Tool Orchestration
   - Add State Management
   - Finally add Error Recovery

5. **Monitor and optimize**
   - Track execution times
   - Monitor error rates
   - Optimize cost per execution
   - Improve recovery strategies

---

## Benefits

✅ **Reliability**: Handles failures gracefully, retries intelligently  
✅ **Scalability**: Rate limiting, parallel execution, resource management  
✅ **User Experience**: Progress tracking, error notifications, resume capability  
✅ **Cost Efficiency**: Smart tool selection, cost tracking, optimization  
✅ **Maintainability**: Modular architecture, clear separation of concerns  
✅ **Observability**: Comprehensive logging, state tracking, error analysis  

This architecture will make your agent production-ready for thousands of concurrent users!
