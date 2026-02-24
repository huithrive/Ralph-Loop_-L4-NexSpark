import { Context, Next } from 'hono';
import { verifySessionToken } from '../services/google-oauth';
import type { AuthContext } from './types';

export function requireAuth() {
  return async (c: Context<AuthContext>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json(
        {
          error: 'Authorization header required',
          message: 'Please provide a valid session token'
        },
        401
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json(
        {
          error: 'Invalid authorization format. Expected: Bearer <token>',
          message: 'Authorization header must follow the format: Bearer <token>'
        },
        401
      );
    }

    const token = parts[1];
    const jwtSecret = c.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured in environment');
      return c.json(
        {
          error: 'Authentication service unavailable',
          message: 'Server configuration error'
        },
        500
      );
    }

    try {
      const payload = await verifySessionToken(token, jwtSecret);

      if (!payload || !payload.sub) {
        return c.json(
          {
            error: 'Invalid or expired session token',
            message: 'Please log in again'
          },
          401
        );
      }

      c.set('userId', payload.sub);
      c.set('sessionToken', token);

      await next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return c.json(
        {
          error: 'Invalid or expired session token',
          message: 'Please log in again'
        },
        401
      );
    }
  };
}

export function extractUserId(c: Context<AuthContext>): string {
  const userId = c.get('userId');

  if (!userId) {
    const path = c.req.path;
    const method = c.req.method;
    throw new Error(`userId not found in context for ${method} ${path}. Ensure requireAuth() middleware is applied.`);
  }

  return userId;
}

export function extractSessionToken(c: Context<AuthContext>): string {
  const sessionToken = c.get('sessionToken');

  if (!sessionToken) {
    const path = c.req.path;
    const method = c.req.method;
    throw new Error(`sessionToken not found in context for ${method} ${path}. Ensure requireAuth() middleware is applied.`);
  }

  return sessionToken;
}
