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
  verifySessionToken,
  getGoogleAuthUrl
} from '../services/google-oauth';
import { successResponse, errorResponse } from '../utils/api-response';
import { TIMEOUTS } from '../config';

export const authRoutes = new Hono();

// Google OAuth - Initiate OAuth flow
authRoutes.get('/google', (c) => {
  const googleClientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!googleClientId) {
    return c.text('Google OAuth not configured', 500);
  }

  // Get returnUrl from query parameter and pass it through OAuth state
  const returnUrl = c.req.query('returnUrl');
  const state = returnUrl ? btoa(JSON.stringify({ returnUrl })) : undefined;

  const authUrl = getGoogleAuthUrl(googleClientId, redirectUri, state);
  return c.redirect(authUrl);
});

// Email/Password Login
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(errorResponse('Email and password are required'), 400);
    }

    const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
    console.log('[Login] Using JWT secret:', jwtSecret.substring(0, 10) + '...');
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

    const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
    console.log('[Register] Using JWT secret:', jwtSecret.substring(0, 10) + '...');
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
    const error = c.req.query('error');
    const stateParam = c.req.query('state');

    // Extract returnUrl from state parameter
    let returnUrl = '/dashboard';
    if (stateParam) {
      try {
        const stateData = JSON.parse(atob(stateParam));
        if (stateData.returnUrl) {
          returnUrl = stateData.returnUrl;
        }
      } catch (e) {
        console.warn('Failed to parse state parameter:', e);
      }
    }

    console.log('OAuth callback - returnUrl:', returnUrl);

    if (error) {
      console.error('OAuth error:', error);
      return c.html(`
        <script>
          alert('Google sign-in failed: ${error}');
          window.location.href = '/';
        </script>
      `);
    }

    if (!code) {
      return c.html(`
        <script>
          alert('No authorization code received');
          window.location.href = '/';
        </script>
      `);
    }

    // Exchange code for tokens
    const googleClientId = c.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = c.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

    const tokens = await exchangeCodeForToken(code, googleClientId, googleClientSecret, redirectUri);

    // Get user info
    const googleUser = await getGoogleUser(tokens.access_token);

    console.log('✅ Google user authenticated:', googleUser.email);

    // Handle database operations if available
    if (c.env.DB) {
      try {
        console.log('Finding or creating user...');
        const userId = await findOrCreateUser(
          c.env.DB,
          googleUser.email,
          googleUser.name || 'User',
          'brand'
        );
        console.log('✅ User ID:', userId);

        // Link Google auth
        console.log('Linking Google auth...');
        await linkGoogleAuth(c.env.DB, userId, googleUser.id, googleUser.email, true);
        console.log('✅ Google auth linked');

        // Update user profile with Google info
        await c.env.DB.prepare(`
          UPDATE users
          SET picture = ?, email_verified = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(googleUser.picture, googleUser.email_verified ? 1 : 0, userId).run();

        // Generate JWT session token
        const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
        const sessionToken = await generateSessionToken(userId, jwtSecret);
        console.log('✅ Session token generated');

        // Return inline script that sets localStorage and redirects
        return c.html(`
          <script>
            localStorage.setItem('auxora_user', JSON.stringify({
              id: '${userId}',
              email: '${googleUser.email}',
              name: '${googleUser.name}',
              picture: '${googleUser.picture}',
              email_verified: ${googleUser.email_verified}
            }));
            localStorage.setItem('auxora_session', '${sessionToken}');
            console.log('✅ Google authentication successful');
            window.location.href = '${returnUrl}';
          </script>
        `);

      } catch (dbError: any) {
        console.error('❌ Database error during OAuth:', dbError);
        // Fall through to fallback
      }
    }

    // Fallback: localStorage mode (no database)
    console.log('⚠️ Database not configured - using localStorage fallback');

    const user = {
      id: 'usr_' + googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      email_verified: googleUser.email_verified
    };

    const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
    const sessionToken = await generateSessionToken(user.id, jwtSecret);

    // Return inline script for fallback mode
    return c.html(`
      <script>
        localStorage.setItem('auxora_user', JSON.stringify(${JSON.stringify(user)}));
        localStorage.setItem('auxora_session', '${sessionToken}');
        console.log('✅ Google authentication successful');
        window.location.href = '${returnUrl}';
      </script>
    `);

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return c.html(`
      <script>
        alert('Authentication failed: ${error.message}');
        window.location.href = '/';
      </script>
    `);
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    // JWT tokens are stateless, so logout is handled on client side
    return c.json(successResponse(null, 'Logged out successfully'));
  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json(errorResponse(error.message), 500);
  }
});
