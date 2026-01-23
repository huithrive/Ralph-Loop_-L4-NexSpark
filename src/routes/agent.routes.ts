/**
 * Agent routes (Minimum Viable Agent)
 */

import { Hono } from 'hono';
import { MinimumViableAgent } from '../services/agent/minimum-viable-agent';
import type { AgentRequest } from '../services/agent/minimum-viable-agent';
import { successResponse, errorResponse } from '../utils/api-response';

export const agentRoutes = new Hono();

// Execute minimum viable agent
agentRoutes.post('/execute', async (c) => {
  try {
    const { userId, request, context } = await c.req.json();

    if (!userId || !request) {
      return c.json(errorResponse('userId and request are required'), 400);
    }

    const agent = new MinimumViableAgent(c.env);
    const agentRequest: AgentRequest = {
      userId,
      request,
      context: context || {},
    };

    const result = await agent.execute(agentRequest);

    return c.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Agent execution error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Get agent execution status
agentRoutes.get('/status/:executionId', async (c) => {
  try {
    const executionId = c.req.param('executionId');

    // Fetch from KV storage
    const key = `agent:execution:${executionId}`;
    const data = await c.env.KV.get(key);

    if (!data) {
      return c.json(errorResponse('Execution not found'), 404);
    }

    return c.json({
      success: true,
      execution: JSON.parse(data)
    });
  } catch (error: any) {
    console.error('Get agent status error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Test agent endpoint
agentRoutes.get('/test', async (c) => {
  return c.json({
    success: true,
    message: 'Agent service is operational',
    version: '1.0-mvp'
  });
});
