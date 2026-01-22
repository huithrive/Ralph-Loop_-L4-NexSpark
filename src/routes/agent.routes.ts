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
