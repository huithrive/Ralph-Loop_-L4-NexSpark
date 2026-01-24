/**
 * Models Index - Central export for all database models
 */

const ResearchResult = require('./ResearchResult');
const InterviewSession = require('./InterviewSession');
const InterviewResponse = require('./InterviewResponse');
const GTMReport = require('./GTMReport');
const Campaign = require('./Campaign');
const Creative = require('./Creative');
const CreativeGeneration = require('./CreativeGeneration');
const OAuthState = require('./OAuthState');
const OAuthToken = require('./OAuthToken');

module.exports = {
  ResearchResult,
  InterviewSession,
  InterviewResponse,
  GTMReport,
  Campaign,
  Creative,
  CreativeGeneration,
  OAuthState,
  OAuthToken
};