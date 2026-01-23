# Strategist Module - Deep Research Engine

## Purpose
Generate comprehensive market research using Claude AI.

## Requirements

### Input
- Website URL (required)
- Product Description (required, 100-500 words)

### Processing
Use Claude API to analyze:
1. Competitive landscape (top 5-7 competitors)
2. Market trends and growth
3. Target audience demographics
4. Market size (TAM/SAM)
5. Customer pain points (top 3-5)

### Output
JSON with structure:
- researchId
- marketSize (tam, sam, growthRate, trends)
- targetAudience (demographics, psychographics)
- competitors (name, url, positioning, strengths, weaknesses)
- channels (recommended marketing channels with priority)
- painPoints (customer problems)
- opportunities and threats
- recommendations

## Technical Requirements

**Endpoint:** POST /api/strategist/research

**Request Body:**
{
  "websiteUrl": "string",
  "productDescription": "string"
}

**Claude API:**
- Model: claude-sonnet-4-20250514
- Max tokens: 4000
- Temperature: 0.7

**Database Table:** research_results
- id (UUID, primary key)
- user_id (UUID, optional for MVP)
- website_url (TEXT)
- product_description (TEXT)
- research_data (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Performance:**
- Response time: <30 seconds
- API cost: <$0.50 per query

## Error Handling
- Invalid URL → 400 error
- Claude API failure → 500 error
- Timeout (>45s) → 504 error
- Rate limit → 429 error

## Acceptance Criteria
- [ ] Accepts valid URL and description
- [ ] Calls Claude API successfully
- [ ] Parses response into structured JSON
- [ ] Stores data in database
- [ ] Returns complete research object
- [ ] Handles all error cases
- [ ] Includes unit tests
- [ ] Includes integration tests

## Dependencies
- @anthropic-ai/sdk (Claude API)
- pg (PostgreSQL)
- express (Web framework)
- joi or zod (Validation)
