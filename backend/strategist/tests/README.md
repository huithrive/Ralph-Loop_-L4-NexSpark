# Integration Tests

This folder contains integration tests for the NexSpark application.

## Test Structure

```
tests/
├── integration/              # Integration tests
│   └── traffic-data-tool.test.ts   # SimilarWeb API tool calling tests
├── run-tests.js             # Test runner (loads .dev.vars)
└── README.md                # This file
```

## Running Tests

### Run all integration tests:
```bash
npm run test:integration
```

Or specifically for traffic data:
```bash
npm run test:traffic
```

### Run manually with environment:
```bash
# Load .dev.vars and run
source <(grep -v '^#' .dev.vars | sed 's/^/export /')
npx tsx tests/integration/traffic-data-tool.test.ts
```

## Test Coverage

### Traffic Data Tool (`traffic-data-tool.test.ts`)

Tests the SimilarWeb API integration and AI tool calling:

1. **Direct API Call** - Tests `fetchTrafficData()` function directly
   - Verifies API connection
   - Validates response parsing
   - Checks data transformation

2. **Claude Tool Calling** - Tests `callClaudeJsonWithTools()` with traffic tool
   - Verifies Claude can call the tool
   - Tests tool executor functionality
   - Validates traffic data formatting

3. **Rate Limit Handling** - Tests retry logic and rate limit handling
   - Triggers rate limits intentionally
   - Verifies retry behavior
   - Tests error handling

## Environment Variables Required

The tests require these environment variables from `.dev.vars`:

- `RAPIDAPI_KEY` - Your RapidAPI key for SimilarWeb
- `ANTHROPIC_API_KEY` - Your Claude API key

## Expected Behavior

### Successful Test Output:
```
Environment loaded
Test 1: Direct SimilarWeb API Call
   Domain: google.com
   Visits: 84,172,772,881

Test 2: Claude AI with Traffic Data Tool
   Found 3 competitors
   1. Bing (bing.com): 1.2B
   2. DuckDuckGo (duckduckgo.com): 850M
   3. Yahoo (yahoo.com): 2.1B
   Total tool calls made: 3

All tests passed!
```

### Rate Limit Errors:
If you see "Too Many Requests" or "Forbidden" errors, this indicates:
- Your RapidAPI plan has hit its rate limit
- The retry logic is working correctly
- You may need to:
  - Wait a few minutes before running tests again
  - Upgrade your RapidAPI subscription
  - Increase delays between requests

## Debugging

To see detailed logs during tests, the test file includes:
- Request/response logging
- Tool call tracking
- Timing information
- Error details

Check the console output for:
- `🔧 Tool Called` - When Claude invokes the tool
- `Traffic fetched` - Successful API calls
- `⏱️ Waiting` - Delays to avoid rate limits
- `Failed` - Errors with details