/**
 * API request/response types
 */

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface ApiContext {
  request: Request;
  env: any;
  ctx: any;
}

export interface PaymentIntent {
  userId: string;
  userEmail: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  clientSecret?: string;
  message?: string;
}
