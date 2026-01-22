// Minimum Viable Agent - Day 1 Implementation
// Simple but functional agent with basic execution tracking

import { callClaude as callClaudeAPI } from '../ai/claude-client';
import { AI_MODELS } from '../../config';

export interface AgentRequest {
  userId: string;
  request: string;
  context?: Record<string, any>;
}

export interface AgentExecution {
  executionId: string;
  userId: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export class MinimumViableAgent {
  constructor(
    private env: any // Cloudflare env with KV and API keys
  ) {}

  /**
   * Main execution method - handles a user request
   */
  async execute(request: AgentRequest): Promise<{ success: boolean; executionId: string; message: string }> {
    const executionId = this.generateId();
    
    console.log(`[Agent] Starting execution ${executionId} for user ${request.userId}`);
    
    // Initialize execution state
    const execution: AgentExecution = {
      executionId,
      userId: request.userId,
      status: 'initializing',
      progress: 0,
      startedAt: new Date().toISOString()
    };
    
    await this.saveExecution(execution);
    
    try {
      // Update to running
      execution.status = 'running';
      execution.progress = 10;
      await this.saveExecution(execution);
      
      // Execute the actual work
      console.log(`[Agent] Processing request: ${request.request.substring(0, 100)}...`);
      const result = await this.processRequest(request, execution);
      
      // Mark as completed
      execution.status = 'completed';
      execution.progress = 100;
      execution.completedAt = new Date().toISOString();
      execution.result = result;
      await this.saveExecution(execution);
      
      console.log(`[Agent] Execution ${executionId} completed successfully`);
      
      return {
        success: true,
        executionId,
        message: 'Execution completed successfully'
      };
      
    } catch (error: any) {
      console.error(`[Agent] Execution ${executionId} failed:`, error);
      
      // Mark as failed
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();
      await this.saveExecution(execution);
      
      return {
        success: false,
        executionId,
        message: `Execution failed: ${error.message}`
      };
    }
  }

  /**
   * Get execution status
   */
  async getStatus(executionId: string): Promise<AgentExecution | null> {
    try {
      const key = `agent:execution:${executionId}`;
      const data = await this.env.KV.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`[Agent] Error getting status:`, error);
      return null;
    }
  }

  /**
   * Process the actual request
   */
  private async processRequest(
    request: AgentRequest,
    execution: AgentExecution
  ): Promise<any> {
    // Step 1: Analyze the request (30%)
    execution.progress = 30;
    await this.saveExecution(execution);
    
    const analysis = await this.analyzeRequest(request);
    
    // Step 2: Generate response (60%)
    execution.progress = 60;
    await this.saveExecution(execution);
    
    const response = await this.generateResponse(request, analysis);
    
    // Step 3: Format result (90%)
    execution.progress = 90;
    await this.saveExecution(execution);
    
    const result = this.formatResult(response);
    
    return result;
  }

  /**
   * Analyze the user request using Claude
   */
  private async analyzeRequest(request: AgentRequest): Promise<any> {
    console.log('[Agent] Analyzing request with Claude...');
    
    const prompt = `You are Nexspark, an expert growth strategist.

User Request: ${request.request}

${request.context ? `Context: ${JSON.stringify(request.context, null, 2)}` : ''}

Analyze this request and respond with:
1. What the user is asking for
2. Key information needed
3. Recommended approach

Keep your response focused and actionable.`;

    try {
      const response = await this.callClaude(prompt, 1000); // 1000 max tokens
      return {
        type: 'analysis',
        content: response
      };
    } catch (error: any) {
      console.error('[Agent] Claude analysis failed:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate the actual response
   */
  private async generateResponse(request: AgentRequest, analysis: any): Promise<any> {
    console.log('[Agent] Generating response with Claude...');
    
    const prompt = `You are Nexspark, an expert growth strategist.

User Request: ${request.request}

Analysis: ${analysis.content}

Now provide a detailed, actionable response to help the user.
Be specific, practical, and focused on growth strategies that lead to $100M revenue.

Format your response clearly with:
- Key insights
- Specific recommendations
- Next steps`;

    try {
      const response = await this.callClaude(prompt, 2048); // 2048 max tokens
      return {
        type: 'response',
        content: response
      };
    } catch (error: any) {
      console.error('[Agent] Claude response generation failed:', error);
      throw new Error(`Response generation failed: ${error.message}`);
    }
  }

  /**
   * Format the final result
   */
  private formatResult(response: any): any {
    return {
      timestamp: new Date().toISOString(),
      response: response.content,
      metadata: {
        generatedBy: 'Nexspark AI Agent',
        version: '1.0-mvp'
      }
    };
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string, maxTokens: number = 1024): Promise<string> {
    const apiKey = this.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Use new Claude client wrapper
    return await callClaudeAPI(prompt, apiKey, {
      model: AI_MODELS.claude.opus4,
      maxTokens,
    });
  }

  /**
   * Save execution state to KV
   */
  private async saveExecution(execution: AgentExecution): Promise<void> {
    const key = `agent:execution:${execution.executionId}`;
    await this.env.KV.put(key, JSON.stringify(execution), {
      expirationTtl: 3600 // 1 hour TTL
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
