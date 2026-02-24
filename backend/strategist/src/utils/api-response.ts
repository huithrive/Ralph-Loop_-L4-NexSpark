/**
 * Standardized API response utilities
 */

import { createLogger } from './logger';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a success response
 */
export function successResponse<T = any>(data?: T, message?: string): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  return response;
}

/**
 * Creates an error response
 */
export function errorResponse(error: string | Error, statusCode?: number): ApiErrorResponse {
  const message = error instanceof Error ? error.message : error;
  return {
    success: false,
    error: message,
    message,
    ...(statusCode && { statusCode }),
  };
}

/**
 * Wraps a handler function with standard error handling
 */
export function withErrorHandling<T = any>(
  handler: () => Promise<T>
): Promise<ApiResponse<T>> {
  const log = createLogger({ context: '[API]' });
  return handler()
    .then((data) => successResponse(data))
    .catch((error) => {
      log.error('API Error', error);
      return errorResponse(error);
    });
}
