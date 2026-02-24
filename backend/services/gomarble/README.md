# GoMarble Node.js Client

Production-ready GoMarble API client for advertising insights from Facebook Ads and Google Ads.

## Features

- ✅ Native `fetch` (Node 18+), zero dependencies
- ✅ Automatic mock fallback when API unavailable
- ✅ Configurable timeouts (30s for accounts, 60s for insights)
- ✅ Clean error handling with descriptive messages
- ✅ Data processing utilities for standardized metrics
- ✅ Built-in analysis functions (top performers, period comparison)

## Installation

```bash
# Set your API key in environment
export GOMARBLE_API_KEY="your_api_key_here"
```

## Usage

### Basic Client

```javascript
const { getClient } = require('./services/gomarble');

const gomarble = getClient();

// List Facebook ad accounts
const accounts = await gomarble.listFacebookAccounts();
console.log(accounts);
// { data: [...], _mock: false }

// Get campaign insights (last 7 days)
const insights = await gomarble.getFacebookInsights('act_123456789', {
  level: 'campaign',
  date_preset: 'last_7d',
  fields: 'campaign_name,spend,impressions,clicks,ctr,cpm,purchase_roas',
});
console.log(insights);
```

### Data Processing

```javascript
const { 
  processCampaignData, 
  getTopPerformers,
  formatCampaignAnalysis 
} = require('./services/gomarble/advertisingService');

// Process raw campaign data
const { campaigns, summary } = processCampaignData(
  'facebook', 
  'act_123456789', 
  insightsResponse.data
);

console.log(summary);
// {
//   totalSpend: 5000,
//   totalRevenue: 15000,
//   avgRoas: 3.0,
//   campaignCount: 10,
//   ...
// }

// Get top 5 campaigns by ROAS
const topCampaigns = getTopPerformers(campaigns, 'roas', 5);

// Pretty-print report
console.log(formatCampaignAnalysis({ campaigns, summary }));
```

### Integration with AnalyzerModule

The GoMarble client is automatically wired into the analyzer module:

```javascript
// In analyzerModule.js
const metrics = await fetchLiveMetrics(clientId);
// Returns structured metrics with:
// - Campaign breakdown
// - Summary metrics (spend, revenue, ROAS, etc.)
// - Top performers
// - Health alerts (low ROAS, high CPM, etc.)
```

## API Reference

### GoMarbleClient

#### `listFacebookAccounts()`
Returns all Facebook ad accounts accessible with your API key.

**Returns:** `Promise<{data: Array, _mock?: boolean}>`

#### `getFacebookInsights(accountId, options)`
Fetches campaign or ad-level insights.

**Parameters:**
- `accountId` (string): Facebook ad account ID (e.g., `'act_123456789'`)
- `options` (object):
  - `level` (string): `'campaign'` or `'ad'` (default: `'campaign'`)
  - `date_preset` (string): `'last_7d'`, `'last_30d'`, etc. (default: `'last_7d'`)
  - `fields` (string): Comma-separated fields (default: standard metrics)
  - `limit` (number): Max results (default: 100)

**Returns:** `Promise<{data: Array, _mock?: boolean}>`

#### `listGoogleAccounts()`
Returns all Google Ads accounts.

**Returns:** `Promise<{data: Array, _mock?: boolean}>`

### advertisingService

#### `processCampaignData(platform, accountId, rawData)`
Processes raw campaign insights into structured format with summary metrics.

**Returns:** `{campaigns: Array, summary: Object}`

#### `processAdData(platform, accountId, rawData)`
Processes raw ad-level insights.

**Returns:** `{ads: Array, summary: Object}`

#### `getTopPerformers(data, sortBy, limit)`
Sorts and returns top N performers by a metric.

**Parameters:**
- `data` (Array): Processed campaigns or ads
- `sortBy` (string): `'roas'`, `'profit'`, `'revenue'`, `'spend'`, `'ctr'`
- `limit` (number): Max results (default: 10)

**Returns:** `Array`

#### `comparePeriods(currentData, previousData, metrics)`
Compares two time periods and calculates changes.

**Returns:** `Object` with change deltas and percentages

#### `formatCampaignAnalysis(processedData, topN)`
Pretty-prints campaign analysis report.

**Returns:** `string`

## Mock Mode

When no API key is configured or API requests fail, the client automatically returns mock data:

```javascript
const gomarble = new GoMarbleClient(); // No API key
const accounts = await gomarble.listFacebookAccounts();
// Returns demo accounts with _mock: true flag
```

Mock data includes:
- 2 demo Facebook accounts
- 3 demo campaigns with realistic metrics
- 1 demo Google account

## Environment Variables

```bash
# Required for live API access
GOMARBLE_API_KEY=your_api_key_here
```

## Architecture

```
gomarble/
├── gomarbleClient.js      # Core API client (fetch, timeouts, mocks)
├── advertisingService.js  # Data processing & analysis utilities
├── index.js               # Singleton export
└── README.md              # This file
```

## Error Handling

- **Timeout:** Falls back to mock data after 30s (accounts) or 60s (insights)
- **Network errors:** Logs error, returns mock data
- **API errors:** Logs HTTP status, returns mock data
- **Missing API key:** Warns and runs in mock-only mode

## Examples

### Full Campaign Analysis

```javascript
const { getClient } = require('./services/gomarble');
const { processCampaignData, formatCampaignAnalysis } = require('./services/gomarble/advertisingService');

async function analyzeCampaigns() {
  const gomarble = getClient();
  
  // Get accounts
  const accountsRes = await gomarble.listFacebookAccounts();
  const accountId = accountsRes.data[0].id;
  
  // Get insights
  const insightsRes = await gomarble.getFacebookInsights(accountId, {
    date_preset: 'last_7d',
    level: 'campaign',
  });
  
  // Process and format
  const processed = processCampaignData('facebook', accountId, insightsRes.data);
  console.log(formatCampaignAnalysis(processed, 5));
}

analyzeCampaigns();
```

### Period Comparison

```javascript
const { comparePeriods } = require('./services/gomarble/advertisingService');

// Fetch current and previous week data
const currentWeek = await fetchWeekData('last_7d');
const previousWeek = await fetchWeekData('last_14d'); // Adjust date range

const comparison = comparePeriods(currentWeek, previousWeek, ['spend', 'revenue', 'roas']);

console.log(comparison.roas);
// { current: 3.5, previous: 2.8, change: 0.7, changePercent: 25.0, trend: 'up' }
```

## Integration Notes

- The client is automatically instantiated as a singleton via `getClient()`
- `analyzerModule.js` uses `fetchLiveMetrics()` to pull data on-demand
- Falls back gracefully to demo mode when API is unavailable
- All currency values are floats (dollars), not cents
- ROAS is a multiplier (e.g., 3.42 = $3.42 return per $1 spent)

## License

Internal use only — Nexspark/Auxora project.
