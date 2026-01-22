/**
 * Shared localStorage utilities
 */

const STORAGE_KEYS = {
  USER: 'nexspark_user',
  SESSION: 'nexspark_session',
  INTERVIEW: 'nexspark_interview',
  INTERVIEW_PROGRESS: 'nexspark_interview_progress',
  CONTINUE_INTERVIEW: 'nexspark_continue_interview',
};

/**
 * Storage manager
 */
const Storage = {
  // User management
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Session management
  getSession: () => {
    return localStorage.getItem(STORAGE_KEYS.SESSION);
  },

  setSession: (sessionToken) => {
    localStorage.setItem(STORAGE_KEYS.SESSION, sessionToken);
  },

  removeSession: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Interview management
  getInterview: () => {
    const interview = localStorage.getItem(STORAGE_KEYS.INTERVIEW);
    return interview ? JSON.parse(interview) : null;
  },

  setInterview: (interview) => {
    localStorage.setItem(STORAGE_KEYS.INTERVIEW, JSON.stringify(interview));
  },

  removeInterview: () => {
    localStorage.removeItem(STORAGE_KEYS.INTERVIEW);
  },

  // Interview progress management
  getInterviewProgress: () => {
    const progress = localStorage.getItem(STORAGE_KEYS.INTERVIEW_PROGRESS);
    return progress ? JSON.parse(progress) : null;
  },

  setInterviewProgress: (progress) => {
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_PROGRESS, JSON.stringify(progress));
  },

  removeInterviewProgress: () => {
    localStorage.removeItem(STORAGE_KEYS.INTERVIEW_PROGRESS);
  },

  // Continue interview flag
  getContinueInterview: () => {
    return localStorage.getItem(STORAGE_KEYS.CONTINUE_INTERVIEW);
  },

  setContinueInterview: (interviewId) => {
    localStorage.setItem(STORAGE_KEYS.CONTINUE_INTERVIEW, interviewId);
  },

  removeContinueInterview: () => {
    localStorage.removeItem(STORAGE_KEYS.CONTINUE_INTERVIEW);
  },

  // Clear all
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
