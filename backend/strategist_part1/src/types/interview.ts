/**
 * Interview related types
 */

export interface InterviewResponse {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface Interview {
  id: string;
  userId: string;
  responses: InterviewResponse[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  currentQuestion?: number;
}

export interface InterviewTranscript {
  interviewId: string;
  transcript: string;
  summary?: string;
  createdAt: string;
}
