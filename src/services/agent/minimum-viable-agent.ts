// Minimum Viable Agent - Day 1 Implementation
// Simple, working agent with basic error handling and state tracking

export interface AgentRequest {
  userId: string;
  request: string;
  context?: Record<string, any>;
}

export interface AgentExecution {
  executionId: string;
  userId: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export class MinimumViableAgent {
  constructor(private env: any) {}

  /**
   * Execute a user request with basic state tracking
   */
  async execute(request: AgentRequest): Promise<{ success: boolean; executionId: string; message?: string }> {
    const executionId = this.generateId();
    
    console.log(`[MVAgent] Starting execution ${executionId} for user ${request.userId}`);
    
    try {
      // 1. Initialize execution state
      await this.saveState(executionId, {
        executionId,
        userId: request.userId,
        status: 'initializing',
        progress: 0,
        startedAt: new Date().toISOString()
      });
      
      // 2. Update to running
      await this.updateProgress(executionId, 10, 'running');
      
      // 3. Execute the actual work
      const result = await this.executeWork(request, executionId);
      
      // 4. Mark as completed
      await this.saveState(executionId, {
        executionId,
        userId: request.userId,
        status: 'completed',
        progress: 100,
        result,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });
      
      console.log(`[MVAgent] ✅ Execution ${executionId} completed successfully`);
      
      return {
        success: true,
        executionId,
        message: 'Execution completed successfully'
      };
      
    } catch (error: any) {
      console.error(`[MVAgent] ❌ Execution ${executionId} failed:`, error);
      
      // Save failed state
      await this.saveState(executionId, {
        executionId,
        userId: request.userId,
        status: 'failed',
        progress: 0,
        error: error.message,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });
      
      return {
        success: false,
        executionId,
        message: error.message || 'Execution failed'
      };
    }
  }

  /**
   * Get execution status
   */
  async getStatus(executionId: string): Promise<AgentExecution | null> {
    try {
      const key = `agent_execution:${executionId}`;
      const data = await this.env.KV.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`[MVAgent] Error getting status:`, error);
      return null;
    }
  }

  /**
   * Execute the actual work with retry logic
   */
  private async executeWork(request: AgentRequest, executionId: string): Promise<any> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[MVAgent] Attempt ${attempt}/${maxRetries} for execution ${executionId}`);
        
        // Update progress
        const progress = 10 + (attempt - 1) * 20;
        await this.updateProgress(executionId, progress, 'running');
        
        // Call Claude API
        const result = await this.callClaude(request.request, request.context);
        
        console.log(`[MVAgent] ✅ Claude API call successful on attempt ${attempt}`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.error(`[MVAgent] ⚠️ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          console.log(`[MVAgent] Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }
    
    // All retries failed
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string, context?: Record<string, any>): Promise<any> {
    const apiKey = this.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];
    
    // Add context if provided
    if (context) {
      messages[0].content = `Context: ${JSON.stringify(context)}\n\n${prompt}`;
    }
    
    console.log(`[MVAgent] Calling Claude API...`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model
    };
  }

  /**
   * Save execution state to KV
   */
  private async saveState(executionId: string, state: AgentExecution): Promise<void> {
    const key = `agent_execution:${executionId}`;
    await this.env.KV.put(key, JSON.stringify(state), {
      expirationTtl: 3600 // 1 hour
    });
  }

  /**
   * Update progress
   */
  private async updateProgress(executionId: string, progress: number, status: AgentExecution['status']): Promise<void> {
    const current = await this.getStatus(executionId);
    if (current) {
      current.progress = progress;
      current.status = status;
      await this.saveState(executionId, current);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
