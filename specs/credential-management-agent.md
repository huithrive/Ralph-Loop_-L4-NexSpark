# Credential Management Agent

## Purpose
AI-powered agent that checks for missing credentials, provides comprehensive lists of required API keys and authorizations, and guides the builder to place credentials in the proper locations within the repository.

## Role
Credential Validator & Setup Guide Agent that ensures all required API keys, OAuth credentials, and authorizations are properly configured.

## Workflow Integration

**Trigger Points:**
1. After each build completes → Credential check begins
2. After all iterations are done → Comprehensive credential audit
3. Before starting a new build → Quick credential validation
4. After adding new integrations → Credential requirement update

**Process:**
1. **Scan for credentials** - Check .env files and code references
2. **Identify missing credentials** - Compare against credential registry
3. **Generate comprehensive report** - List all missing and required credentials
4. **Provide setup guidance** - Step-by-step instructions for obtaining and placing credentials
5. **Validate credentials** - Test connectivity and format (where possible)
6. **Generate actionable checklist** - Create markdown checklist for builder

## Components

### 1. Credential Scanner
**Endpoint:** POST `/api/credentials/scan`

**Purpose:**
Scan the codebase and .env files to identify all credential dependencies.

**Process:**
1. Read `backend/.env` file (if exists)
2. Read `backend/.env.example` file
3. Parse codebase for `process.env.*` references
4. Scan for hardcoded credentials (security check)
5. Compare against credential registry
6. Identify missing, present, and invalid credentials

**Input:**
```json
{
  "scan_type": "full" | "quick" | "module_specific",
  "module": "strategist" | "executor" | "advertiser" | "analyzer" | "all"
}
```

**Output:**
```json
{
  "scan_id": "uuid",
  "timestamp": "ISO-8601",
  "credentials_found": [
    {
      "name": "ANTHROPIC_API_KEY",
      "status": "present" | "missing" | "invalid" | "placeholder",
      "value_preview": "sk-ant-api03-***" | null,
      "location": "backend/.env",
      "module": "strategist",
      "priority": "critical"
    }
  ],
  "missing_credentials": [
    {
      "name": "SHOPIFY_API_KEY",
      "module": "executor",
      "priority": "high",
      "required_for": "Shopify integration",
      "obtain_from": "https://partners.shopify.com",
      "setup_instructions": "detailed instructions"
    }
  ],
  "security_warnings": [
    {
      "type": "credential_in_code",
      "file": "backend/services/shopify.js",
      "line": 42,
      "severity": "high",
      "message": "API key found in code, should be in .env"
    }
  ],
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/credentialManager.js`
- `backend/services/credentialScanner.js`
- `backend/api/credentials/scan.js`

### 2. Credential Registry
**Purpose:**
Comprehensive database of all required credentials across all modules.

**Credential Categories:**

#### Infrastructure (Critical)
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

#### Module 1: Strategist
- `ANTHROPIC_API_KEY` - Claude API access (claude-sonnet-4-20250514)

#### Module 2: Executor
- `LOVABLE_API_KEY` - Landing page generation
- `SHOPIFY_API_KEY` - Shopify integration
- `SHOPIFY_API_SECRET` - Shopify OAuth secret
- `SHOPIFY_APP_HOST` - Shopify app domain
- `NAMESILO_API_KEY` - Domain management
- `PIXVERSE_API_KEY` - Video generation (primary)
- `KLING_API_KEY` - Video generation (fallback)
- `RUNWAY_API_KEY` - Video generation (fallback)
- `OPENAI_API_KEY` - Image generation (fallback)
- `REPLICATE_API_TOKEN` - Image generation (fallback)

#### Module 3: Advertiser
- `GOMARBLE_MCP_URL` - GoMarble MCP endpoint (default: https://apps.gomarble.ai/mcp-api/sse)
- `GOMARBLE_OAUTH_CLIENT_ID` - GoMarble OAuth client ID
- `GOMARBLE_OAUTH_CLIENT_SECRET` - GoMarble OAuth client secret
- `META_APP_ID` - Meta Business Manager (fallback)
- `META_APP_SECRET` - Meta Business Manager (fallback)
- `META_ACCESS_TOKEN` - Meta API access (fallback)
- `GOOGLE_ADS_CLIENT_ID` - Google Ads OAuth (fallback)
- `GOOGLE_ADS_CLIENT_SECRET` - Google Ads OAuth (fallback)
- `GOOGLE_ADS_REFRESH_TOKEN` - Google Ads refresh token (fallback)
- `GOOGLE_ADS_DEVELOPER_TOKEN` - Google Ads developer token (fallback)

#### Module 4: Analyzer
- `GOMARBLE_MCP_URL` - GoMarble MCP endpoint (shared with Advertiser)
- `GOMARBLE_OAUTH_CLIENT_ID` - GoMarble OAuth (shared with Advertiser)
- `GOMARBLE_OAUTH_CLIENT_SECRET` - GoMarble OAuth (shared with Advertiser)
- `META_APP_ID` - Meta API (shared with Advertiser)
- `META_APP_SECRET` - Meta API (shared with Advertiser)
- `META_ACCESS_TOKEN` - Meta API (shared with Advertiser)
- `GOOGLE_ADS_CLIENT_ID` - Google Ads (shared with Advertiser)
- `GOOGLE_ADS_CLIENT_SECRET` - Google Ads (shared with Advertiser)
- `GOOGLE_ADS_REFRESH_TOKEN` - Google Ads (shared with Advertiser)
- `SHOPIFY_WEBHOOK_SECRET` - Shopify webhook verification

**Database Schema:**
```sql
CREATE TABLE credential_registry (
  id UUID PRIMARY KEY,
  credential_name VARCHAR(255) UNIQUE NOT NULL,
  module VARCHAR(50), -- 'infrastructure', 'strategist', 'executor', 'advertiser', 'analyzer'
  priority VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
  description TEXT,
  obtain_from_url TEXT,
  setup_instructions TEXT,
  validation_pattern VARCHAR(255), -- regex pattern for format validation
  example_value VARCHAR(255),
  is_oauth BOOLEAN DEFAULT false,
  requires_database_storage BOOLEAN DEFAULT false, -- for OAuth tokens
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credential_module ON credential_registry(module);
CREATE INDEX idx_credential_priority ON credential_registry(priority);
```

**Files:**
- `backend/services/credentialRegistry.js`
- `backend/migrations/006_credential_registry.sql`

### 3. Missing Credential Detection
**Endpoint:** GET `/api/credentials/missing`

**Purpose:**
Identify all missing credentials and generate comprehensive list.

**Output:**
```json
{
  "audit_id": "uuid",
  "total_required": 25,
  "total_present": 18,
  "total_missing": 7,
  "missing_by_priority": {
    "critical": 0,
    "high": 3,
    "medium": 4,
    "low": 0
  },
  "missing_credentials": [
    {
      "name": "SHOPIFY_API_KEY",
      "module": "executor",
      "priority": "high",
      "required_for": "Shopify store connection and product creation",
      "obtain_from": "https://partners.shopify.com",
      "setup_steps": [
        "1. Go to https://partners.shopify.com",
        "2. Create a new app",
        "3. Copy the API key",
        "4. Add to backend/.env as: SHOPIFY_API_KEY=your-key-here"
      ],
      "file_location": "backend/.env",
      "line_number": 7,
      "example_format": "SHOPIFY_API_KEY=abc123def456"
    }
  ],
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/credentialAuditor.js`
- `backend/api/credentials/missing.js`

### 4. Credential Setup Guide Generator
**Endpoint:** GET `/api/credentials/guide`

**Purpose:**
Generate step-by-step setup guide for all missing credentials.

**Output:**
```json
{
  "guide_id": "uuid",
  "audit_id": "uuid",
  "guide_format": "markdown" | "html" | "json",
  "sections": [
    {
      "priority": "critical",
      "title": "Critical Credentials (Required for Core Functionality)",
      "credentials": [
        {
          "name": "DATABASE_URL",
          "module": "infrastructure",
          "steps": [
            {
              "step_number": 1,
              "title": "Set up PostgreSQL database",
              "description": "Create a PostgreSQL database for NexSpark",
              "action": "Run: createdb nexspark",
              "url": null
            },
            {
              "step_number": 2,
              "title": "Get connection string",
              "description": "Format: postgresql://username:password@localhost:5432/nexspark",
              "action": "Replace username, password, and database name",
              "url": null
            },
            {
              "step_number": 3,
              "title": "Add to .env file",
              "description": "Add this line to backend/.env",
              "action": "DATABASE_URL=postgresql://username:password@localhost:5432/nexspark",
              "url": null,
              "file_location": "backend/.env",
              "line_number": 3
            }
          ],
          "verification": "Run: npm run dev and check database connection",
          "troubleshooting": [
            "If connection fails, check PostgreSQL is running",
            "Verify username and password are correct",
            "Check database exists: psql -l"
          ]
        }
      ]
    }
  ],
  "copy_paste_section": {
    "title": "Copy-Paste Ready .env Entries",
    "description": "Copy these to backend/.env file",
    "entries": [
      "# Missing Credentials - Add these to backend/.env",
      "SHOPIFY_API_KEY=your-shopify-api-key-here",
      "GOMARBLE_OAUTH_CLIENT_ID=your-client-id-here",
      "GOMARBLE_OAUTH_CLIENT_SECRET=your-client-secret-here"
    ]
  },
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/credentialSetupGuide.js`
- `backend/api/credentials/guide.js`

### 5. Credential Validation & Testing
**Endpoint:** POST `/api/credentials/validate`

**Purpose:**
Validate credential format and test connectivity (where possible without exposing keys).

**Input:**
```json
{
  "credential_name": "ANTHROPIC_API_KEY",
  "value": "sk-ant-api03-***" // masked for security
}
```

**Output:**
```json
{
  "validation_id": "uuid",
  "credential_name": "ANTHROPIC_API_KEY",
  "format_valid": true,
  "format_check": {
    "pattern": "^sk-ant-api03-",
    "matches": true,
    "length_valid": true
  },
  "connectivity_test": {
    "tested": true,
    "success": true,
    "response_time_ms": 245,
    "error": null
  },
  "security_check": {
    "not_in_code": true,
    "not_in_git": true,
    "in_env_file": true
  },
  "overall_status": "valid",
  "created_at": "timestamp"
}
```

**Validation Rules:**
- **Format validation:** Check against regex patterns (e.g., API key prefixes)
- **Length validation:** Ensure minimum/maximum length
- **Connectivity test:** Test API endpoint (for APIs that support health checks)
- **Security check:** Verify credential is not in code or git

**Files:**
- `backend/services/credentialValidator.js`
- `backend/api/credentials/validate.js`

### 6. Credential Status Report
**Endpoint:** GET `/api/credentials/status`

**Purpose:**
Get comprehensive status of all credentials.

**Output:**
```json
{
  "status_id": "uuid",
  "summary": {
    "total_required": 25,
    "present": 18,
    "missing": 7,
    "invalid": 0,
    "placeholder": 2
  },
  "by_module": {
    "infrastructure": {
      "required": 3,
      "present": 3,
      "missing": 0
    },
    "strategist": {
      "required": 1,
      "present": 1,
      "missing": 0
    },
    "executor": {
      "required": 10,
      "present": 6,
      "missing": 4
    },
    "advertiser": {
      "required": 8,
      "present": 5,
      "missing": 3
    },
    "analyzer": {
      "required": 3,
      "present": 3,
      "missing": 0
    }
  },
  "by_priority": {
    "critical": {
      "required": 3,
      "present": 3,
      "missing": 0
    },
    "high": {
      "required": 8,
      "present": 5,
      "missing": 3
    },
    "medium": {
      "required": 10,
      "present": 7,
      "missing": 3
    },
    "low": {
      "required": 4,
      "present": 3,
      "missing": 1
    }
  },
  "credentials": [
    {
      "name": "DATABASE_URL",
      "status": "present",
      "module": "infrastructure",
      "priority": "critical",
      "validated": true
    },
    {
      "name": "SHOPIFY_API_KEY",
      "status": "missing",
      "module": "executor",
      "priority": "high",
      "validated": false
    }
  ],
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/credentialStatus.js`
- `backend/api/credentials/status.js`

### 7. Credential Audit Report
**Endpoint:** POST `/api/credentials/audit`

**Purpose:**
Run full credential audit and generate comprehensive report.

**Output:**
```json
{
  "audit_id": "uuid",
  "timestamp": "ISO-8601",
  "summary": {
    "total_credentials": 25,
    "present": 18,
    "missing": 7,
    "invalid": 0,
    "security_issues": 1
  },
  "missing_credentials": [],
  "security_warnings": [],
  "recommendations": [
    "Add SHOPIFY_API_KEY to enable Shopify integration",
    "Configure GoMarble OAuth for Meta/Google Ads integration"
  ],
  "next_steps": [
    "1. Review missing credentials list",
    "2. Follow setup guide for each missing credential",
    "3. Run validation after adding credentials",
    "4. Test integrations after configuration"
  ],
  "report_url": "/api/credentials/report/{audit_id}",
  "created_at": "timestamp"
}
```

**Files:**
- `backend/services/credentialAuditor.js`
- `backend/api/credentials/audit.js`

## Database Schema

### credential_audits table
```sql
CREATE TABLE credential_audits (
  id UUID PRIMARY KEY,
  scan_id UUID,
  total_required INTEGER,
  total_present INTEGER,
  total_missing INTEGER,
  audit_data JSONB,
  report_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### credential_status table
```sql
CREATE TABLE credential_status (
  id UUID PRIMARY KEY,
  credential_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'present', 'missing', 'invalid', 'placeholder'
  last_checked TIMESTAMP,
  last_validated TIMESTAMP,
  validation_result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credential_status_name ON credential_status(credential_name);
CREATE INDEX idx_credential_status_status ON credential_status(status);
```

## Environment Variables
```
# Credential Management Agent
CREDENTIAL_CHECK_ENABLED=true
CREDENTIAL_AUTO_VALIDATE=true
CREDENTIAL_SECURITY_SCAN=true
```

## Security Best Practices

### Credential Storage
- **Never commit .env files** - Ensure `.env` is in `.gitignore`
- **Use environment variables** - Never hardcode credentials in code
- **OAuth tokens in database** - Store OAuth tokens in database, not .env
- **Rotate credentials regularly** - Document rotation schedule
- **Use least privilege** - Request minimum required permissions/scopes

### Validation
- **Format validation** - Check credential format before use
- **Connectivity testing** - Test API connectivity (where possible)
- **Security scanning** - Check for credentials in code or git
- **Placeholder detection** - Identify placeholder values (xxx, your-key-here)

## Acceptance Criteria
- [ ] Scan .env files for all required credentials
- [ ] Parse codebase for process.env.* references
- [ ] Identify missing credentials with priority classification
- [ ] Generate comprehensive setup guide with step-by-step instructions
- [ ] Provide copy-paste ready .env entries
- [ ] Validate credential format and connectivity
- [ ] Detect security issues (credentials in code, .env in git)
- [ ] Generate actionable checklist
- [ ] Integrate with build loop (triggers after builds)
- [ ] Store audit history in database
- [ ] Support multiple output formats (markdown, JSON, HTML)

## Dependencies
- dotenv (Environment variable parsing)
- fs (File system access for .env files)
- pg (PostgreSQL for credential registry)
- @anthropic-ai/sdk (Claude API for intelligent guidance generation)
