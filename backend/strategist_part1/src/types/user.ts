/**
 * User related types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'brand' | 'agency' | 'freelancer';
  created_at: string;
  google_id?: string;
}

export interface Session {
  userId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  type?: 'brand' | 'agency' | 'freelancer';
}
