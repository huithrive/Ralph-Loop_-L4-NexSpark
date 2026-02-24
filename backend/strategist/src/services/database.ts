/**
 * Database helper functions for interview management
 * This file acts as a facade that re-exports repository functions for backward compatibility
 */

// Re-export from base repository
export { generateId } from '../repositories/base-repository';

// Re-export from interview repository
export {
  getNextVersion,
  getIncompleteInterview,
  saveInterview,
  saveResponse,
  completeInterview,
  editInterviewResponses,
  getUserInterviews,
  getInterview,
  markInterviewPaid,
  deleteInterview,
  createPreviewInterview
} from '../repositories/interview-repository';

// Re-export from report repository
export {
  createReport,
  updateReport,
  getReport,
  getLatestReport,
  markReportForRegeneration,
  deleteReport,
  logGenerationEvent,
  savePreviewData
} from '../repositories/report-repository';

// Re-export from user repository
export {
  getUserByEmail,
  getUserAuthProviders,
  canUnlinkAuthMethod,
  markInterviewPaidWithStatus
} from '../repositories/user-repository';
