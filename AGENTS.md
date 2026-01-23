## Build & Run

NexSpark is a Node.js backend API.

**Commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`

**Server:** Port 3001

**Environment:**
NODE_ENV=development
PORT=3001
ANTHROPIC_API_KEY=your-key-here

## Validation

After implementing run:
- npm test (must pass)
- npm run lint
- npm run dev

## Module 1 Components

1. Deep Research: POST /api/strategist/research
2. Interview Agent
3. GTM Report Generator

## Development Order

1. Database models first
2. Research engine
3. Interview agent
4. Report generator
5. Tests

## Patterns

- Use async/await
- Try/catch for errors
- HTTP codes: 200, 400, 404, 500
- Validate all inputs
- Claude model: claude-sonnet-4-20250514

## Security

- Never commit .env
- Sanitize inputs