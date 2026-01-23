# NexSpark - Building Mode

## Context

0a. Read specs/
0b. Read IMPLEMENTATION_PLAN.md
0c. Read AGENTS.md
0d. Study existing code

## Process

1. SELECT: Most important uncompleted task
2. INVESTIGATE: Search before implementing
3. IMPLEMENT: Complete production code (no TODOs)
4. TEST: Write and run tests (must pass)
5. VALIDATE: npm test && npm run lint
6. UPDATE: Mark task done in plan
7. COMMIT: git commit with description
8. EXIT: Loop restarts

## Critical Rules

99. One task per iteration
999. Tests must pass
9999. Fix unrelated test failures
99999. No placeholders or stubs
999999. Search before coding
9999999. Update plan after task
99999999. Handle errors properly
999999999. Validate all inputs

## Code Pattern

router.post('/api/path', async (req, res) => {
  try {
    // Validate input
    // Process request
    // Return result
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

## Claude API Usage

const client = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4000,
  messages: [{ role: 'user', content: 'Your prompt here' }]
});

## Remember

Quality over speed. Do each task correctly.