const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class OAuthState {
  constructor(data = {}) {
    this.id = data.id;
    this.state = data.state;
    this.platform = data.platform;
    this.user_id = data.user_id;
    this.redirect_uri = data.redirect_uri;
    this.shop_domain = data.shop_domain;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
  }

  /**
   * Create a new OAuth state
   */
  static async create({ platform, user_id, redirect_uri, shop_domain = null, expires_in_minutes = 10 }) {
    const state = uuidv4();
    const expires_at = new Date(Date.now() + expires_in_minutes * 60 * 1000);

    const query = `
      INSERT INTO oauth_states (state, platform, user_id, redirect_uri, shop_domain, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [state, platform, user_id, redirect_uri, shop_domain, expires_at];
    const result = await db.query(query, values);

    return new OAuthState(result.rows[0]);
  }

  /**
   * Find OAuth state by state string
   */
  static async findByState(state) {
    const query = 'SELECT * FROM oauth_states WHERE state = $1';
    const result = await db.query(query, [state]);

    return result.rows[0] ? new OAuthState(result.rows[0]) : null;
  }

  /**
   * Delete OAuth state (cleanup after use)
   */
  static async deleteByState(state) {
    const query = 'DELETE FROM oauth_states WHERE state = $1';
    const result = await db.query(query, [state]);

    return result.rowCount > 0;
  }

  /**
   * Cleanup expired OAuth states
   */
  static async cleanupExpired() {
    const query = 'DELETE FROM oauth_states WHERE expires_at < NOW()';
    const result = await db.query(query);

    return result.rowCount;
  }

  /**
   * Check if state has expired
   */
  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  /**
   * Validate platform matches expected value
   */
  validatePlatform(expectedPlatform) {
    return this.platform === expectedPlatform;
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      state: this.state,
      platform: this.platform,
      expires_at: this.expires_at,
      created_at: this.created_at
    };
  }
}

module.exports = OAuthState;