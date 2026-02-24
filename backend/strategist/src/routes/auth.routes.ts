/**
 * Authentication routes
 */

import { Hono } from 'hono';
import { getUserByEmail } from '../services/database';
import {
  authenticateEmailPassword,
  registerEmailPassword,
  findOrCreateUser,
  findUserByEmail,
  createUserWithInvitation,
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
import { createRequestLogger } from '../utils/logger';
import { validateInvitationCode } from '../services/invitation';
import { updateUserProfile } from '../repositories/user-repository';

export const authRoutes = new Hono();

// Google OAuth - Initiate OAuth flow
authRoutes.get('/google', (c) => {
  const googleClientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!googleClientId) {
    return c.text('Google OAuth not configured', 500);
  }

  // Get returnUrl and invitationCode from query parameters and pass through OAuth state
  const returnUrl = c.req.query('returnUrl');
  const invitationCode = c.req.query('invitationCode');

  const stateData: any = {};
  if (returnUrl) stateData.returnUrl = returnUrl;
  if (invitationCode) stateData.invitationCode = invitationCode;

  const state = Object.keys(stateData).length > 0 ? btoa(JSON.stringify(stateData)) : undefined;

  const authUrl = getGoogleAuthUrl(googleClientId, redirectUri, state);
  return c.redirect(authUrl);
});

// Email/Password Login
authRoutes.post('/login', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(errorResponse('Email and password are required'), 400);
    }

    const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
    log.debug('[Login] Using JWT secret', { prefix: jwtSecret.substring(0, 10) + '...' });
    const result = await authenticateEmailPassword(c.env.DB, email, password, jwtSecret);

    if (!result.success) {
      return c.json(errorResponse(result.error || 'Authentication failed'), 401);
    }

    log.info('User logged in', { userId: result.user?.id, email });
    return c.json({
      success: true,
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error: any) {
    log.error('Login error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Email/Password Registration
authRoutes.post('/register', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { email, password, name, type = 'brand', invitationCode } = await c.req.json();

    if (!email || !password || !name) {
      return c.json(errorResponse('Email, password, and name are required'), 400);
    }

    const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
    log.debug('[Register] Using JWT secret', { prefix: jwtSecret.substring(0, 10) + '...' });
    const result = await registerEmailPassword(c.env.DB, email, password, name, jwtSecret, type, invitationCode);

    if (!result.success) {
      return c.json(errorResponse(result.error || 'Registration failed'), 400);
    }

    log.info('User registered', { userId: result.user?.id, email, type, isAccountLink: result.isAccountLink });
    return c.json({
      success: true,
      message: result.isAccountLink ? 'Email/password linked to existing account' : 'Registration successful',
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error: any) {
    log.error('Registration error', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Google OAuth Callback
authRoutes.get('/google/callback', async (c) => {
  const log = createRequestLogger(c);
  try {
    const code = c.req.query('code');
    const error = c.req.query('error');
    const stateParam = c.req.query('state');

    // Extract returnUrl and invitationCode from state parameter
    let returnUrl = '/static/dashboard.html';
    let invitationCode: string | undefined;

    if (stateParam) {
      try {
        const stateData = JSON.parse(atob(stateParam));
        if (stateData.returnUrl) {
          returnUrl = stateData.returnUrl;
        }
        if (stateData.invitationCode) {
          invitationCode = stateData.invitationCode;
        }
      } catch (e) {
        log.warn('Failed to parse state parameter', e);
      }
    }

    log.info('OAuth callback', { returnUrl, hasInvitation: !!invitationCode });

    if (error) {
      log.error('OAuth error', error);
      return c.html(`
        <script>
          window.location.href = '/static/register.html?error=oauth_failed&message=${encodeURIComponent('Google sign-in failed: ' + '${error}')}';
        </script>
      `);
    }

    if (!code) {
      return c.html(`
        <script>
          window.location.href = '/static/register.html?error=oauth_failed&message=${encodeURIComponent('No authorization code received')}';
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

    log.info('Google user authenticated', { email: googleUser.email });

    // Handle database operations if available
    if (c.env.DB) {
      try {
        // Check if user already exists (grandfathering)
        const existingUserId = await findUserByEmail(c.env.DB, googleUser.email);

        let userId: string;

        if (existingUserId) {
          // Existing user - allow login without invitation (grandfathered)
          userId = existingUserId;
          log.info('Existing user login (grandfathered)', { userId, email: googleUser.email });
        } else {
          // New user - requires invitation code
          if (!invitationCode) {
            log.warn('New user attempted Google OAuth without invitation code', { email: googleUser.email });
            return c.html(`
              <script>
                window.location.href = '/static/register.html?error=invitation_required&email=${encodeURIComponent('${googleUser.email}')}';
              </script>
            `);
          }

          // Create user with invitation validation
          const result = await createUserWithInvitation(
            c.env.DB,
            googleUser.email,
            googleUser.name || 'User',
            invitationCode,
            'google',
            'brand'
          );

          if (!result.success) {
            log.warn('Invitation validation failed during Google OAuth', { email: googleUser.email, error: result.error });
            const errorMessage = encodeURIComponent(result.error || 'Invalid invitation code');
            return c.html(`
              <script>
                window.location.href = '/static/register.html?error=invitation_invalid&message=${errorMessage}&email=${encodeURIComponent('${googleUser.email}')}';
              </script>
            `);
          }

          userId = result.userId!;
          log.info('New user created with invitation', { userId, email: googleUser.email });
        }

        // Link Google auth
        log.debug('Linking Google auth');
        await linkGoogleAuth(c.env.DB, userId, googleUser.id, googleUser.email, true);
        log.info('Google auth linked', { userId });

        // Update user profile with Google info
        await updateUserProfile(c.env.DB, userId, {
          picture: googleUser.picture,
          emailVerified: googleUser.email_verified
        });

        // Generate JWT session token
        const jwtSecret = c.env.JWT_SECRET || c.env.GOOGLE_CLIENT_SECRET || 'dev-secret';
        const sessionToken = await generateSessionToken(userId, jwtSecret);
        log.info('Session token generated', { userId });

        // Return inline script that sets localStorage and redirects
        return c.html(`
          <script>
            localStorage.setItem('nexspark_user', JSON.stringify({
              id: '${userId}',
              email: '${googleUser.email}',
              name: '${googleUser.name}',
              picture: '${googleUser.picture}',
              email_verified: ${googleUser.email_verified}
            }));
            localStorage.setItem('nexspark_session', '${sessionToken}');
            console.log('Google authentication successful');
            window.location.href = '${returnUrl}';
          </script>
        `);

      } catch (dbError: any) {
        log.error('Database error during OAuth', dbError);
        return c.html(`
          <script>
            window.location.href = '/static/register.html?error=service_unavailable&message=${encodeURIComponent('Database temporarily unavailable. Please try again later.')}';
          </script>
        `, 503);
      }
    } else {
      log.error('Database not configured');
      return c.html(`
        <script>
          window.location.href = '/static/register.html?error=service_unavailable&message=${encodeURIComponent('Service temporarily unavailable. Please try again later.')}';
        </script>
      `, 503);
    }

  } catch (error: any) {
    log.error('OAuth callback error', error);
    return c.html(`
      <script>
        window.location.href = '/static/register.html?error=auth_failed&message=${encodeURIComponent('${error.message}')}';
      </script>
    `);
  }
});

// Validate Invitation Code (optional pre-validation)
authRoutes.post('/validate-invitation', async (c) => {
  const log = createRequestLogger(c);
  try {
    const { invitationCode, email } = await c.req.json();

    if (!invitationCode) {
      return c.json(errorResponse('Invitation code is required'), 400);
    }

    const validation = await validateInvitationCode(c.env.DB, invitationCode, email);

    if (!validation.valid) {
      return c.json({
        success: false,
        valid: false,
        error: validation.error
      });
    }

    log.info('Invitation code validated', { code: invitationCode });

    return c.json({
      success: true,
      valid: true
    });
  } catch (error: any) {
    log.error('Error validating invitation code', error);
    return c.json(errorResponse(error.message), 500);
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  const log = createRequestLogger(c);
  try {
    // JWT tokens are stateless, so logout is handled on client side
    log.info('User logged out');
    return c.json(successResponse(null, 'Logged out successfully'));
  } catch (error: any) {
    log.error('Logout error', error);
    return c.json(errorResponse(error.message), 500);
  }
});
