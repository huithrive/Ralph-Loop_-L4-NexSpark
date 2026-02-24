/**
 * Environment variable types for Cloudflare Workers
 */

export interface Env {
  // Database
  DB: D1Database;

  // Queues
  REPORT_QUEUE: Queue;

  // Durable Objects
  REPORT_COORDINATOR: DurableObjectNamespace;

  // API Keys
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ADMIN_API_KEY: string;

  // Configuration
  JWT_SECRET: string;
  REPORT_FORMAT?: 'legacy' | 'v2';
  LOG_LEVEL?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  SUPPORT_EMAIL: string;
  DISCORD_URL?: string;

  // Optional
  RAPIDAPI_KEY?: string;
  RAPIDAPI_HOST?: string;
}