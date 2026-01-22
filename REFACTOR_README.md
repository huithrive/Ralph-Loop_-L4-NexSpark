# NexSpark Backend Refactoring - Architecture Documentation

## Overview

This document describes the refactored NexSpark codebase architecture. The refactoring focused on:
- **Modularity**: Splitting large files into focused, single-responsibility modules
- **Reusability**: Extracting common code into shared utilities and services
- **Maintainability**: Centralizing configuration and reducing code duplication
- **Type Safety**: Consolidating types into a unified type system

## Directory Structure

```
src/
├── config/                      # Configuration files
│   ├── api-endpoints.ts        # External API URLs (Anthropic, OpenAI, Stripe, Google)
│   ├── model-config.ts         # AI model names and default configurations
│   ├── timeouts.ts             # Timeout constants for API calls
│   ├── pricing.ts              # Pricing and payment configurations
│   ├── rate-limits.ts          # Rate limiting configurations
│   ├── defaults.ts             # Default values (interview questions, etc.)
│   └── index.ts                # Central config export
│
├── routes/                      # API route handlers (follows Google style guide)
│   ├── auth.routes.ts          # Authentication routes (/api/auth/*)
│   ├── interview.routes.ts     # Interview routes (/api/interview/*)
│   ├── payment.routes.ts       # Payment routes (/api/payment/*)
│   ├── report.routes.ts        # Report generation routes (/api/report/*)
│   ├── analysis.routes.ts      # Analysis routes (/api/analysis/*)
│   ├── conversational.routes.ts # Conversational interview routes
│   ├── agent.routes.ts         # Agent routes (/api/agent/*)
│   ├── growth-audit.routes.ts  # Growth audit routes
│   └── index.ts                # Route exports
│
├── services/                    # Business logic services
│   ├── ai/                     # AI service wrappers
│   │   ├── claude-client.ts    # Claude API client wrapper
│   │   ├── openai-client.ts    # OpenAI API client wrapper
│   │   ├── web-scraper.ts      # Web scraping utilities
│   │   └── index.ts            # AI services export
│   │
│   ├── agent/                  # Agent-specific services
│   │   └── minimum-viable-agent.ts
│   │
│   ├── auth.ts                 # Email/password authentication
│   ├── database.ts             # Database operations
│   ├── google-oauth.ts         # Google OAuth implementation
│   ├── stripe-payment.ts       # Stripe payment processing
│   ├── voice-interview.ts      # Voice interview logic
│   ├── conversational-interview.ts # Conversational flow
│   ├── growth-audit-agent.ts   # Growth audit logic
│   ├── report-generation.ts    # Report generation logic
│   ├── report-generator.ts     # Report generator class
│   └── post-interview-analysis-v2.ts # Post-interview analysis
│
├── types/                       # TypeScript type definitions
│   ├── interview.ts            # Interview-related types
│   ├── business-profile.ts     # Business profile types
│   ├── user.ts                 # User and session types
│   ├── report.ts               # Report types
│   ├── report-formats.ts       # Report format types (existing)
│   ├── api.ts                  # API request/response types
│   └── index.ts                # Central type exports
│
├── utils/                       # Utility functions
│   ├── json-parser.ts          # JSON extraction from AI responses
│   ├── fetch-with-timeout.ts   # Fetch with timeout wrapper
│   ├── api-response.ts         # Standardized API response helpers
│   ├── id-generator.ts         # ID generation utilities
│   └── index.ts                # Utility exports
│
├── index.tsx                    # Main app entry point (~150 lines, down from 2300+)
├── renderer.tsx                 # React renderer
└── revised-landing.ts           # Landing page HTML

public/static/shared/            # Shared frontend modules
├── api-client.js               # Frontend API client
├── storage.js                  # localStorage utilities
├── constants.js                # Frontend constants
└── ui-utils.js                 # UI helper functions (modals, alerts, etc.)
```

## Key Improvements

### 1. Configuration Management

All hard-coded values have been extracted to `src/config/`:

**Before:**
```typescript
// Scattered throughout codebase
const response = await fetch('https://api.anthropic.com/v1/messages', {
  model: 'claude-opus-4-20250514',
  max_tokens: 16384,
  // ...
});
```

**After:**
```typescript
import { API_ENDPOINTS, AI_MODELS, DEFAULT_MODEL_CONFIGS } from '../config';

const response = await fetch(API_ENDPOINTS.anthropic.messages, {
  model: AI_MODELS.claude.opus4,
  max_tokens: DEFAULT_MODEL_CONFIGS.claude.defaultMaxTokens,
  // ...
});
```

### 2. AI Client Wrappers

Centralized AI API interactions with error handling and consistent interfaces:

**Before (duplicated 8+ times):**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({ model, max_tokens, messages }),
});

const data = await response.json();
const text = data.content[0].text;

// JSON extraction logic (different in every file)
const jsonMatch = text.match(/\{[\s\S]*\}/);
const result = JSON.parse(jsonMatch[0]);
```

**After (single implementation):**
```typescript
import { callClaudeJson } from './ai/claude-client';

const result = await callClaudeJson(prompt, apiKey, {
  model: AI_MODELS.claude.opus4,
  maxTokens: 8000,
  temperature: 0.7,
});
```

**Benefits:**
- ✅ Consistent error handling across all AI calls
- ✅ Centralized timeout management
- ✅ Unified JSON extraction logic
- ✅ Support for streaming responses
- ✅ Easy to add retry logic or caching

### 3. Route Modularization

Split 2,300+ line `index.tsx` into focused route modules:

**Before:**
```typescript
// index.tsx - 2,326 lines
app.post('/api/auth/login', async (c) => { /* ... */ });
app.post('/api/auth/register', async (c) => { /* ... */ });
app.get('/api/interview/check', async (c) => { /* ... */ });
app.post('/api/interview/save', async (c) => { /* ... */ });
app.post('/api/payment/create-intent', async (c) => { /* ... */ });
app.post('/api/report/start', async (c) => { /* ... */ });
// ... 50+ more routes
```

**After:**
```typescript
// index.tsx - 150 lines
import { authRoutes, interviewRoutes, paymentRoutes, reportRoutes } from './routes';

app.route('/api/auth', authRoutes);
app.route('/api/interview', interviewRoutes);
app.route('/api/payment', paymentRoutes);
app.route('/api/report', reportRoutes);
```

### 4. Unified Type System

All types consolidated into `src/types/` for consistency:

```typescript
// Before: Types defined inline in multiple files
interface Interview { /* ... */ }  // Defined 3x differently

// After: Single source of truth
import type { Interview, InterviewResponse } from '../types';
```

### 5. Utility Functions

Common patterns extracted to reusable utilities:

**ID Generation:**
```typescript
// Before: Duplicated in 5 files
const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// After: Centralized
import { generateUserId } from '../utils/id-generator';
const id = generateUserId();
```

**API Responses:**
```typescript
// Before: Inconsistent response formats
return c.json({ success: true, data: result });
return c.json({ success: false, error: 'Failed' });

// After: Standardized helpers
import { successResponse, errorResponse } from '../utils/api-response';
return c.json(successResponse(result));
return c.json(errorResponse('Failed'), 400);
```

### 6. Frontend Shared Modules

Created reusable frontend JavaScript modules in `public/static/shared/`:

**API Client** (`api-client.js`):
```javascript
// Before: Fetch calls duplicated across 10+ HTML files
const response = await fetch('/api/interview/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// After: Centralized API methods
const result = await InterviewAPI.save(data);
```

**Storage** (`storage.js`):
```javascript
// Before: localStorage keys hardcoded everywhere
const user = JSON.parse(localStorage.getItem('nexspark_user'));

// After: Unified storage manager
const user = Storage.getUser();
```

**UI Utils** (`ui-utils.js`):
```javascript
// Before: Alert/modal code duplicated across files
// After: Reusable functions
await showConfirm('Are you sure?', { confirmText: 'YES', cancelText: 'NO' });
showError('Operation failed');
showSuccess('Saved successfully');
```

## Migration Guide

### For Route Handlers

**Old Pattern:**
```typescript
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    // ... logic ...
    return c.json({ success: true, user, sessionToken });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**New Pattern:**
```typescript
// In src/routes/auth.routes.ts
import { Hono } from 'hono';
import { successResponse, errorResponse } from '../utils/api-response';

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    // ... logic ...
    return c.json(successResponse({ user, sessionToken }));
  } catch (error: any) {
    return c.json(errorResponse(error.message), 500);
  }
});
```

### For AI API Calls

**Old Pattern:**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-opus-4-20250514',
    max_tokens: 16384,
    messages: [{ role: 'user', content: prompt }],
  }),
});

const data = await response.json();
const text = data.content[0].text;

const jsonMatch = text.match(/\{[\s\S]*\}/);
const result = JSON.parse(jsonMatch[0]);
```

**New Pattern:**
```typescript
import { callClaudeJson } from '../services/ai/claude-client';
import { AI_MODELS } from '../config';

const result = await callClaudeJson(prompt, env.ANTHROPIC_API_KEY, {
  model: AI_MODELS.claude.opus45,
  maxTokens: 16384,
});
```

### For Frontend Code

**Old Pattern:**
```javascript
async function saveInterview() {
  const response = await fetch('/api/interview/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(interviewData),
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('nexspark_interview', JSON.stringify(data));
  }
}
```

**New Pattern:**
```javascript
// Include shared modules in HTML
<script src="/static/shared/api-client.js"></script>
<script src="/static/shared/storage.js"></script>

// Use in your code
async function saveInterview() {
  const data = await InterviewAPI.save(interviewData);
  if (data.success) {
    Storage.setInterview(data);
  }
}
```

## Testing the Refactored Code

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

3. **Test key flows:**
   - Authentication (login/register)
   - Interview completion
   - Report generation
   - Payment processing

## Next Steps

### Recommended Future Improvements

1. **Add Unit Tests**
   - Test AI client wrappers
   - Test utility functions
   - Test route handlers

2. **Add Integration Tests**
   - Test complete user flows
   - Mock external API calls

3. **Environment Variables**
   - Move API keys to environment variables
   - Create `.env.example` file

4. **Error Monitoring**
   - Add Sentry or similar error tracking
   - Centralized error logging

5. **Performance Optimization**
   - Add caching for AI responses
   - Optimize database queries
   - Add request/response compression

6. **Documentation**
   - Add JSDoc comments to all functions
   - Create API documentation
   - Add code examples

## File Size Comparison

### Before Refactoring:
- `src/index.tsx`: 2,326 lines
- `src/services/post-interview-analysis.ts`: 989 lines (removed - legacy)
- `src/services/post-interview-analysis-v2.ts`: 1,377 lines
- Total duplicated AI client code: ~500 lines across 8 files

### After Refactoring:
- `src/index.tsx`: ~150 lines (94% reduction)
- `src/routes/*`: 8 focused files, avg 150 lines each
- `src/services/ai/*`: Centralized in 3 files
- `src/config/*`: 7 files, clearly organized
- `src/utils/*`: 5 reusable helpers
- Legacy code removed: 989 lines

**Total Lines Saved:** ~1,500 lines through deduplication and removal of legacy code

## Breaking Changes

### API Contract Changes

The refactoring preserves the existing API contracts. All endpoints remain unchanged:
- `/api/auth/*` - No changes
- `/api/interview/*` - No changes
- `/api/payment/*` - No changes
- `/api/report/*` - No changes

### Frontend Integration

Frontend HTML/JS files may need to include new shared modules:

```html
<!-- Add to HTML files -->
<script src="/static/shared/api-client.js"></script>
<script src="/static/shared/storage.js"></script>
<script src="/static/shared/constants.js"></script>
<script src="/static/shared/ui-utils.js"></script>
```

Then update fetch calls to use the new API client methods.

## Support

For questions about the refactored architecture, please refer to:
- This document for architecture overview
- Individual file comments for implementation details
- Type definitions in `src/types/` for data structures

---

**Refactored by:** Claude AI Assistant
**Date:** January 2026
**Version:** 2.0.0
