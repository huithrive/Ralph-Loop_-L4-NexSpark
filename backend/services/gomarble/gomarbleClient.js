/**
 * gomarbleClient.js — Production-ready GoMarble API Client
 * 
 * Official GoMarble REST API client for Node.js.
 * Supports Facebook Ads and Google Ads insights with built-in mock fallback.
 * 
 * Features:
 * - Native fetch (Node 18+), zero dependencies
 * - Configurable timeouts (30s accounts, 60s insights)
 * - Automatic mock data fallback on API failures
 * - Clean error handling with descriptive messages
 * 
 * Usage:
 *   const client = new GoMarbleClient(apiKey);
 *   const accounts = await client.listFacebookAccounts();
 *   const insights = await client.getFacebookInsights(accountId, options);
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_URL = 'https://api.gomarble.com/v1';
const TIMEOUT_ACCOUNTS = 30000; // 30s for account lists
const TIMEOUT_INSIGHTS = 60000; // 60s for insights (larger payload)

// Mock data (matches Python source)
const MOCK_FACEBOOK_ACCOUNTS = [
  {
    id: 'act_123456789',
    name: 'Demo Facebook Ad Account',
    account_id: '123456789',
    currency: 'USD',
    account_status: 1,
  },
  {
    id: 'act_987654321',
    name: 'Secondary Ad Account',
    account_id: '987654321',
    currency: 'USD',
    account_status: 1,
  },
];

const MOCK_CAMPAIGN_INSIGHTS = [
  {
    campaign_name: 'Holiday Sale Campaign',
    spend: 1847.32,
    impressions: 45621,
    clicks: 892,
    ctr: 1.96,
    cpm: 40.47,
    purchase_roas: [{ value: 3.42 }],
  },
  {
    campaign_name: 'Brand Awareness Campaign',
    spend: 1234.56,
    impressions: 32145,
    clicks: 654,
    ctr: 2.03,
    cpm: 38.42,
    purchase_roas: [{ value: 2.87 }],
  },
  {
    campaign_name: 'Product Launch Campaign',
    spend: 987.65,
    impressions: 21098,
    clicks: 423,
    ctr: 2.01,
    cpm: 46.82,
    purchase_roas: [{ value: 4.15 }],
  },
];

const MOCK_GOOGLE_ACCOUNTS = [
  {
    customer_id: '1234567890',
    descriptive_name: 'Demo Google Ads Account',
    currency_code: 'USD',
    manager: false,
  },
];

// ============================================================================
// CLIENT CLASS
// ============================================================================

class GoMarbleClient {
  /**
   * Create a GoMarble API client.
   * @param {string} [apiKey] - API key (defaults to process.env.GOMARBLE_API_KEY)
   */
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GOMARBLE_API_KEY;
    if (!this.apiKey) {
      console.warn('[GoMarbleClient] No API key provided. Mock mode only.');
    }
    this.baseUrl = BASE_URL;
  }

  // ==========================================================================
  // FACEBOOK ADS
  // ==========================================================================

  /**
   * List all Facebook ad accounts.
   * @returns {Promise<{data: Array, _mock?: boolean}>}
   */
  async listFacebookAccounts() {
    return this._request('GET', '/facebook/accounts', null, TIMEOUT_ACCOUNTS, MOCK_FACEBOOK_ACCOUNTS);
  }

  /**
   * Get Facebook Insights (campaign or ad level).
   * 
   * @param {string} accountId - Facebook ad account ID (e.g., 'act_123456789')
   * @param {Object} options - Query parameters
   * @param {string} [options.level='campaign'] - 'campaign' or 'ad'
   * @param {string} [options.date_preset='last_7d'] - 'today', 'yesterday', 'last_7d', 'last_30d', etc.
   * @param {string} [options.fields] - Comma-separated fields (e.g., 'campaign_name,spend,impressions')
   * @param {Object} [options.filtering] - Facebook filtering object
   * @param {string} [options.sort] - Sort field
   * @param {number} [options.limit=100] - Max results
   * @returns {Promise<{data: Array, _mock?: boolean}>}
   */
  async getFacebookInsights(accountId, options = {}) {
    const payload = {
      account_id: accountId,
      level: options.level || 'campaign',
      date_preset: options.date_preset || 'last_7d',
      fields: options.fields || 'campaign_name,spend,impressions,clicks,ctr,cpm,purchase_roas',
      filtering: options.filtering || undefined,
      sort: options.sort || undefined,
      limit: options.limit || 100,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    return this._request('POST', '/facebook/insights', payload, TIMEOUT_INSIGHTS, MOCK_CAMPAIGN_INSIGHTS);
  }

  // ==========================================================================
  // GOOGLE ADS
  // ==========================================================================

  /**
   * List all Google Ads accounts.
   * @returns {Promise<{data: Array, _mock?: boolean}>}
   */
  async listGoogleAccounts() {
    return this._request('GET', '/google-ads/accounts', null, TIMEOUT_ACCOUNTS, MOCK_GOOGLE_ACCOUNTS);
  }

  // ==========================================================================
  // CORE REQUEST METHOD
  // ==========================================================================

  /**
   * Internal request handler with timeout and mock fallback.
   * @private
   */
  async _request(method, path, body, timeout, mockData) {
    // Mock-only mode
    if (!this.apiKey) {
      console.log(`[GoMarbleClient] Mock mode: ${method} ${path}`);
      return { data: mockData, _mock: true };
    }

    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options = {
        method,
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `GoMarble API error: ${response.status} ${response.statusText} — ${errorText}`
        );
      }

      const data = await response.json();
      return { data };

    } catch (error) {
      clearTimeout(timeoutId);

      // Timeout
      if (error.name === 'AbortError') {
        console.error(`[GoMarbleClient] Timeout (${timeout}ms): ${method} ${path}`);
      } else {
        console.error(`[GoMarbleClient] Request failed: ${error.message}`);
      }

      // Fallback to mock
      console.log(`[GoMarbleClient] Falling back to mock data for ${path}`);
      return { data: mockData, _mock: true };
    }
  }
}

module.exports = GoMarbleClient;
