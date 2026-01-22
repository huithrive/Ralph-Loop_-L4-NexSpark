/**
 * Authentication routes
 */

import { Hono } from 'hono';
import { getUserByEmail } from '../services/database';
import {
  authenticateEmailPassword,
  registerEmailPassword,
  findOrCreateUser,
  linkGoogleAuth
} from '../services/auth';
import {
  exchangeCodeForToken,
  getGoogleUser,
  generateSessionToken,
  verifySessionToken
} from '../services/google-oauth';
import { successResponse, errorResponse } from '../utils/api-response';
import { TIMEOUTS } from '../config';

export const authRoutes = new Hono();

// Email/Password Login
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(errorResponse('Email and password are required'), 400);
    }

    const jwtSecret = c.env.JWT_SECRET || 'default-secret';
    const result = await authenticateEmailPassword(c.env.DB, email, password, jwtSecret);

    if (!result.success) {
      return c.json(errorResponse(result.error || 'Authentication failed'), 401);
    }

    return c.json({
      success: true,
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Email/Password Registration
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, name, type = 'brand' } = await c.req.json();

    if (!email || !password || !name) {
      return c.json(errorResponse('Email, password, and name are required'), 400);
    }

    const jwtSecret = c.env.JWT_SECRET || 'default-secret';
    const result = await registerEmailPassword(c.env.DB, email, password, name, jwtSecret, type);

    if (!result.success) {
      return c.json(errorResponse(result.error || 'Registration failed'), 400);
    }

    return c.json({
      success: true,
      message: result.isAccountLink ? 'Email/password linked to existing account' : 'Registration successful',
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Google OAuth Callback
authRoutes.get('/google/callback', async (c) => {
  try {
    const code = c.req.query('code');

    if (!code) {
      return c.redirect('/?error=no_code');
    }

    // Exchange code for tokens
    const googleClientId = c.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = c.env.GOOGLE_REDIRECT_URI || '';

    const tokens = await exchangeCodeForToken(code, googleClientId, googleClientSecret, redirectUri);

    // Get user info
    const userInfo = await getGoogleUser(tokens.access_token);

    if (!userInfo.email) {
      return c.redirect('/?error=no_email');
    }

    // Find or create user
    const userId = await findOrCreateUser(
      c.env.DB,
      userInfo.email,
      userInfo.name || 'User',
      'brand'
    );

    // Link Google auth
    await linkGoogleAuth(c.env.DB, userId, userInfo.id, userInfo.email, true);

    // Get user data
    const user = await getUserByEmail(c.env.DB, userInfo.email);

    // Generate JWT session token
    const jwtSecret = c.env.JWT_SECRET || 'default-secret';
    const sessionToken = await generateSessionToken(userId, jwtSecret);

    // Redirect with session info
    return c.redirect(`/?auth=success&sessionToken=${sessionToken}&userId=${userId}&userName=${encodeURIComponent(user?.name || 'User')}&userEmail=${encodeURIComponent(userInfo.email)}`);
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return c.redirect('/?error=oauth_failed');
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    // JWT tokens are stateless, so logout is handled on client side
    // Just return success
    return c.json(successResponse(null, 'Logged out successfully'));
  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Verify Session
authRoutes.get('/verify', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return c.json(errorResponse('No session token provided'), 401);
    }

    const jwtSecret = c.env.JWT_SECRET || 'default-secret';
    const payload = await verifySessionToken(sessionToken, jwtSecret);

    if (!payload) {
      return c.json(errorResponse('Invalid or expired session'), 401);
    }

    return c.json(successResponse({ valid: true, userId: payload.userId }));
  } catch (error: any) {
    console.error('Verify error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
