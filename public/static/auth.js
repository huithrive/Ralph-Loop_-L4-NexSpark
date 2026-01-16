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
 * Logout user
 */
function logout() {
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
