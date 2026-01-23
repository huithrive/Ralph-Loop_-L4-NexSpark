/**
 * Models Index - Central export for all database models
 */

const ResearchResult = require('./ResearchResult');
const InterviewSession = require('./InterviewSession');
const InterviewResponse = require('./InterviewResponse');
const GTMReport = require('./GTMReport');

module.exports = {
  ResearchResult,
  InterviewSession,
  InterviewResponse,
  GTMReport
};