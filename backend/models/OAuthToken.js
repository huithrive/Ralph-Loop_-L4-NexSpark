const db = require('../config/database');

class OAuthToken {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.platform = data.platform;
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.token_type = data.token_type || 'Bearer';
    this.scope = data.scope;
    this.expires_at = data.expires_at;
    this.shop_domain = data.shop_domain;
    this.meta_business_manager_id = data.meta_business_manager_id;
    this.google_ads_customer_id = data.google_ads_customer_id;
    this.is_active = data.is_active !== false; // Default to true
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_used_at = data.last_used_at;
  }

  /**
   * Store a new OAuth token
   */
  static async store({
    user_id,
    platform,
    access_token,
    refresh_token = null,
    token_type = 'Bearer',
    scope = null,
    expires_in = null,
    shop_domain = null,
    meta_business_manager_id = null,
    google_ads_customer_id = null
  }) {
    // Calculate expiration time
    const expires_at = expires_in ?
      new Date(Date.now() + expires_in * 1000) : null;

    // Deactivate any existing tokens for this user/platform
    await OAuthToken.deactivateExisting(user_id, platform);

    const query = `
      INSERT INTO oauth_tokens (
        user_id, platform, access_token, refresh_token, token_type,
        scope, expires_at, shop_domain, meta_business_manager_id,
        google_ads_customer_id, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *
    `;

    const values = [
      user_id, platform, access_token, refresh_token, token_type,
      scope, expires_at, shop_domain, meta_business_manager_id,
      google_ads_customer_id
    ];

    const result = await db.query(query, values);
    return new OAuthToken(result.rows[0]);
  }

  /**
   * Get active token for user and platform
   */
  static async getActiveToken(user_id, platform) {
    const query = `
      SELECT * FROM oauth_tokens
      WHERE user_id = $1 AND platform = $2 AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await db.query(query, [user_id, platform]);
    return result.rows[0] ? new OAuthToken(result.rows[0]) : null;
  }

  /**
   * Get all active tokens for a user
   */
  static async getActiveTokensByUser(user_id) {
    const query = `
      SELECT * FROM oauth_tokens
      WHERE user_id = $1 AND is_active = true
      ORDER BY platform, created_at DESC
    `;

    const result = await db.query(query, [user_id]);
    return result.rows.map(row => new OAuthToken(row));
  }

  /**
   * Deactivate existing tokens for user/platform
   */
  static async deactivateExisting(user_id, platform) {
    const query = `
      UPDATE oauth_tokens
      SET is_active = false, updated_at = NOW()
      WHERE user_id = $1 AND platform = $2 AND is_active = true
    `;

    const result = await db.query(query, [user_id, platform]);
    return result.rowCount;
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed() {
    const query = `
      UPDATE oauth_tokens
      SET last_used_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING last_used_at
    `;

    const result = await db.query(query, [this.id]);
    this.last_used_at = result.rows[0].last_used_at;
    return this.last_used_at;
  }

  /**
   * Refresh access token (for platforms that support it)
   */
  async refreshToken() {
    if (!this.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Implementation would call the platform's token refresh endpoint
    // This is a placeholder for the actual refresh logic
    throw new Error('Token refresh not implemented yet');
  }

  /**
   * Check if token is expired
   */
  isExpired() {
    if (!this.expires_at) return false; // Never expires
    return new Date() > new Date(this.expires_at);
  }

  /**
   * Check if token is valid (active and not expired)
   */
  isValid() {
    return this.is_active && !this.isExpired();
  }

  /**
   * Get connection status for API responses
   */
  getConnectionStatus() {
    return {
      connected: this.isValid(),
      platform: this.platform,
      connected_at: this.created_at,
      expires_at: this.expires_at,
      scope: this.scope,
      shop_domain: this.shop_domain,
      last_used_at: this.last_used_at
    };
  }

  /**
   * Safe JSON representation (without sensitive data)
   */
  toSafeJSON() {
    return {
      id: this.id,
      platform: this.platform,
      token_type: this.token_type,
      scope: this.scope,
      expires_at: this.expires_at,
      shop_domain: this.shop_domain,
      is_active: this.is_active,
      created_at: this.created_at,
      last_used_at: this.last_used_at,
      // Partial token for verification
      access_token_preview: this.access_token ?
        this.access_token.substring(0, 10) + '...' : null
    };
  }

  /**
   * Get full access token (for internal use)
   */
  getAccessToken() {
    if (!this.isValid()) {
      throw new Error('Token is not valid');
    }
    return this.access_token;
  }
}

module.exports = OAuthToken;