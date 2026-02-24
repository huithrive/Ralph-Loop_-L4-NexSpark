/**
 * Durable Object for managing WebSocket connections during report generation
 *
 * Purpose:
 * - Maintains WebSocket connection for real-time thinking process updates
 * - Receives broadcast messages from queue handler
 * - Sends updates to connected client(s)
 *
 * Lifecycle:
 * - Created when client connects via /api/gtm-agent/ws/:reportId
 * - Persists for duration of report generation
 * - Automatically cleaned up after client disconnects
 */

import { DurableObject } from 'cloudflare:workers';
import type { WebSocketMessage } from '../types/gtm-agent-types';

export class ReportCoordinator extends DurableObject {
  private ws: WebSocket | null = null;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade
    if (request.headers.get('upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    // Handle broadcast message from queue
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      return this.handleBroadcast(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private handleWebSocketUpgrade(request: Request): Response {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();

    // Store WebSocket reference
    this.ws = server;

    // Send initial state if provided in headers
    const initialState = request.headers.get('x-initial-state');
    if (initialState && this.ws.readyState === WebSocket.READY_STATE_OPEN) {
      this.ws.send(initialState);
    }

    // Set up event handlers
    server.addEventListener('close', () => {
      this.ws = null;
    });

    server.addEventListener('error', () => {
      this.ws = null;
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    try {
      const message: WebSocketMessage = await request.json();

      // Send to connected WebSocket if open
      if (this.ws && this.ws.readyState === WebSocket.READY_STATE_OPEN) {
        this.ws.send(JSON.stringify(message));
      }

      return new Response('OK');
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 });
    }
  }
}
