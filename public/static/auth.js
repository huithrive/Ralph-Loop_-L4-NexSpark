// Authentication utilities for frontend

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const user = localStorage.getItem('nexspark_user');
  const session = localStorage.getItem('nexspark_session');
  return !!(user && session);
}

/**
 * Get current user
 */
function getCurrentUser() {
  const user = localStorage.getItem('nexspark_user');
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
}

/**
 * Login with email/password
 */
async function loginWithEmail(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('nexspark_user', JSON.stringify(data.user));
      localStorage.setItem('nexspark_session', data.sessionToken);
      return { success: true };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Register with email/password
 */
async function registerWithEmail(email, password, name, type = 'brand') {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, type })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('nexspark_user', JSON.stringify(data.user));
      localStorage.setItem('nexspark_session', data.sessionToken);
      return { success: true, message: data.message };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Logout user
 */
function logout() {
  // Call logout endpoint (optional with JWT)
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

  // Clear all local data
  localStorage.removeItem('nexspark_user');
  localStorage.removeItem('nexspark_session');
  localStorage.removeItem('nexspark_interview');
  localStorage.removeItem('nexspark_interview_progress');

  console.log('✅ User logged out');
  window.location.href = '/';
}

/**
 * Require authentication (redirect if not logged in)
 */
function requireAuth() {
  if (!isAuthenticated()) {
    console.log('⚠️ Not authenticated, redirecting to home');
    window.location.href = '/';
    return false;
  }
  return true;
}
