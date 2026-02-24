/**
 * Admin repository - manages admin metrics and user management queries
 * Note: Errors propagate to route layer for centralized handling
 */

// ============================================================================
// Report Metrics
// ============================================================================

/**
 * Get daily report metrics
 */
export async function getDailyReportMetrics(db: D1Database, days: number = 30) {
  const result = await db.prepare(`
    SELECT
      COUNT(*) as total_reports,
      SUM(preview_input_tokens + total_input_tokens) as total_input_tokens,
      SUM(preview_output_tokens + total_output_tokens) as total_output_tokens,
      SUM(preview_cost_cents + total_cost_cents) as total_cost_cents,
      SUM(preview_cost_cents) as preview_only_cost_cents,
      AVG(generation_time_seconds) as avg_generation_time,
      SUM(CASE WHEN preview_generated = 1 THEN 1 ELSE 0 END) as reports_with_preview,
      model_id,
      DATE(created_at) as date
    FROM reports
    WHERE status = 'READY'
    GROUP BY DATE(created_at), model_id
    ORDER BY date DESC
    LIMIT ?
  `).bind(days).all();

  return result.results || [];
}

/**
 * Get combined daily metrics for both legacy and agent reports
 */
export async function getCombinedDailyMetrics(db: D1Database, days: number = 30) {
  const result = await db.prepare(`
    SELECT
      date,
      SUM(CASE WHEN report_type = 'legacy' THEN total_reports ELSE 0 END) as legacy_reports,
      SUM(CASE WHEN report_type = 'agent' THEN total_reports ELSE 0 END) as agent_reports,
      SUM(total_reports) as combined_reports,
      SUM(CASE WHEN report_type = 'legacy' THEN total_cost_cents ELSE 0 END) as legacy_cost_cents,
      SUM(CASE WHEN report_type = 'agent' THEN total_cost_cents ELSE 0 END) as agent_cost_cents,
      SUM(total_cost_cents) as combined_cost_cents,
      AVG(CASE WHEN report_type = 'legacy' THEN avg_generation_time ELSE NULL END) as legacy_avg_time,
      AVG(CASE WHEN report_type = 'agent' THEN avg_generation_time ELSE NULL END) as agent_avg_time
    FROM (
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_reports,
        SUM(preview_cost_cents + total_cost_cents) as total_cost_cents,
        AVG(generation_time_seconds) as avg_generation_time,
        'legacy' as report_type
      FROM reports
      WHERE status = 'READY'
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_reports,
        SUM(total_cost_cents) as total_cost_cents,
        AVG(generation_time_seconds) as avg_generation_time,
        'agent' as report_type
      FROM agent_reports
      WHERE status = 'READY'
      GROUP BY DATE(created_at)
    )
    GROUP BY date
    ORDER BY date DESC
    LIMIT ?
  `).bind(days).all();

  return result.results || [];
}

/**
 * Get metrics for a specific report by ID
 */
export async function getReportMetricsById(db: D1Database, reportId: string) {
  const result = await db.prepare(`
    SELECT
      id,
      brand_name,
      user_id,
      preview_input_tokens,
      preview_output_tokens,
      preview_cost_cents,
      preview_generated_at,
      total_input_tokens,
      total_output_tokens,
      total_cost_cents,
      model_id,
      generation_time_seconds,
      step_metrics,
      competitors_analyzed_count,
      api_retry_count,
      preview_generated,
      created_at
    FROM reports
    WHERE id = ?
  `).bind(reportId).first();

  return result || null;
}

/**
 * Get metrics grouped by model
 */
export async function getMetricsByModel(db: D1Database) {
  const result = await db.prepare(`
    SELECT
      model_id,
      COUNT(*) as total_reports,
      SUM(preview_cost_cents + total_cost_cents) as total_cost_cents,
      AVG(preview_cost_cents + total_cost_cents) as avg_cost_cents,
      AVG(generation_time_seconds) as avg_generation_time,
      SUM(preview_input_tokens + total_input_tokens) as total_input_tokens,
      SUM(preview_output_tokens + total_output_tokens) as total_output_tokens
    FROM reports
    WHERE status = 'READY' AND model_id IS NOT NULL
    GROUP BY model_id
    ORDER BY total_cost_cents DESC
  `).all();

  return result.results || [];
}

/**
 * Get metrics grouped by step
 */
export async function getMetricsByStep(db: D1Database) {
  const result = await db.prepare(`
    SELECT step_metrics
    FROM reports
    WHERE status = 'READY' AND step_metrics IS NOT NULL
  `).all();

  return result.results || [];
}

// ============================================================================
// User Management
// ============================================================================

/**
 * List users with activity summary
 */
export async function listUsersWithActivity(
  db: D1Database,
  options: { limit?: number; offset?: number; search?: string }
) {
  const limit = options.limit ?? 100;
  const offset = options.offset ?? 0;
  const search = options.search || '';

  let query = `
    SELECT
      u.id,
      u.email,
      u.created_at,
      u.updated_at,
      u.max_interviews,
      COALESCE(interview_count.total, 0) as interviews_count,
      COALESCE(legacy_count.total, 0) + COALESCE(agent_count.total, 0) as reports_count,
      COALESCE(legacy_cost.cost, 0) + COALESCE(agent_cost.cost, 0) as total_cost_cents
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) as total FROM interviews GROUP BY user_id
    ) interview_count ON u.id = interview_count.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as total FROM reports WHERE status = 'READY' GROUP BY user_id
    ) legacy_count ON u.id = legacy_count.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as total FROM agent_reports WHERE status = 'READY' GROUP BY user_id
    ) agent_count ON u.id = agent_count.user_id
    LEFT JOIN (
      SELECT user_id, SUM(preview_cost_cents + total_cost_cents) as cost
      FROM reports WHERE status = 'READY' GROUP BY user_id
    ) legacy_cost ON u.id = legacy_cost.user_id
    LEFT JOIN (
      SELECT user_id, SUM(total_cost_cents) as cost
      FROM agent_reports WHERE status = 'READY' GROUP BY user_id
    ) agent_cost ON u.id = agent_cost.user_id
  `;

  const params: any[] = [];

  if (search) {
    query += ` WHERE u.email LIKE ?`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const users = await db.prepare(query).bind(...params).all();

  const countParams = search ? [`%${search}%`] : [];
  const totalCount = await db.prepare(`
    SELECT COUNT(*) as count FROM users ${search ? 'WHERE email LIKE ?' : ''}
  `).bind(...countParams).first<{ count: number }>();

  return {
    users: users.results || [],
    total: totalCount?.count || 0
  };
}

/**
 * Get detailed user info with costs
 */
export async function getUserDetailWithCosts(db: D1Database, userId: string) {
  const user = await db.prepare(`
    SELECT
      u.*,
      COALESCE(legacy_cost.cost, 0) + COALESCE(agent_cost.cost, 0) as total_cost_cents,
      COALESCE(legacy_count.total, 0) + COALESCE(agent_count.total, 0) as total_reports,
      COALESCE(legacy_count.total, 0) as legacy_reports_count,
      COALESCE(agent_count.total, 0) as agent_reports_count
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) as total FROM reports WHERE status = 'READY' GROUP BY user_id
    ) legacy_count ON u.id = legacy_count.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as total FROM agent_reports WHERE status = 'READY' GROUP BY user_id
    ) agent_count ON u.id = agent_count.user_id
    LEFT JOIN (
      SELECT user_id, SUM(preview_cost_cents + total_cost_cents) as cost
      FROM reports WHERE status = 'READY' GROUP BY user_id
    ) legacy_cost ON u.id = legacy_cost.user_id
    LEFT JOIN (
      SELECT user_id, SUM(total_cost_cents) as cost
      FROM agent_reports WHERE status = 'READY' GROUP BY user_id
    ) agent_cost ON u.id = agent_cost.user_id
    WHERE u.id = ?
  `).bind(userId).first();

  return user || null;
}

/**
 * Get user's interviews for admin view
 */
export async function getUserInterviewsAdmin(db: D1Database, userId: string) {
  const result = await db.prepare(`
    SELECT
      i.id,
      i.preview_url,
      i.status as interview_status,
      i.paid,
      i.current_question,
      i.total_questions,
      i.created_at,
      i.updated_at,
      r.id as report_id,
      r.status as report_status,
      r.brand_name,
      r.total_cost_cents
    FROM interviews i
    LEFT JOIN reports r ON i.id = r.interview_id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `).bind(userId).all();

  return result.results || [];
}

/**
 * Get costs aggregated by user
 */
export async function getCostsByUser(db: D1Database, limit: number = 100) {
  const result = await db.prepare(`
    SELECT
      u.id as user_id,
      u.email,
      COALESCE(legacy.legacy_count, 0) as legacy_reports_count,
      COALESCE(agent.agent_count, 0) as agent_reports_count,
      COALESCE(legacy.legacy_count, 0) + COALESCE(agent.agent_count, 0) as total_reports,
      COALESCE(legacy.total_tokens, 0) + COALESCE(agent.total_tokens, 0) as total_tokens,
      COALESCE(legacy.total_cost, 0) + COALESCE(agent.total_cost, 0) as total_cost_cents,
      COALESCE(legacy.reports_with_preview, 0) as reports_with_preview
    FROM users u
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) as legacy_count,
        SUM(preview_input_tokens + preview_output_tokens + total_input_tokens + total_output_tokens) as total_tokens,
        SUM(preview_cost_cents + total_cost_cents) as total_cost,
        SUM(CASE WHEN preview_generated = 1 THEN 1 ELSE 0 END) as reports_with_preview
      FROM reports
      WHERE status = 'READY'
      GROUP BY user_id
    ) legacy ON u.id = legacy.user_id
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) as agent_count,
        SUM(total_input_tokens + total_output_tokens) as total_tokens,
        SUM(total_cost_cents) as total_cost
      FROM agent_reports
      WHERE status = 'READY'
      GROUP BY user_id
    ) agent ON u.id = agent.user_id
    WHERE legacy.user_id IS NOT NULL OR agent.user_id IS NOT NULL
    ORDER BY total_cost_cents DESC
    LIMIT ?
  `).bind(limit).all();

  return result.results || [];
}

/**
 * Get detailed cost breakdown for a specific user
 */
export async function getUserCostBreakdown(db: D1Database, userId: string) {
  const userSummary = await db.prepare(`
    SELECT
      u.id as user_id,
      u.email,
      COALESCE(legacy.legacy_count, 0) as legacy_reports_count,
      COALESCE(agent.agent_count, 0) as agent_reports_count,
      COALESCE(legacy.legacy_count, 0) + COALESCE(agent.agent_count, 0) as total_reports,
      COALESCE(legacy.total_tokens, 0) + COALESCE(agent.total_tokens, 0) as total_tokens,
      COALESCE(legacy.total_cost, 0) + COALESCE(agent.total_cost, 0) as total_cost_cents,
      COALESCE(legacy.reports_with_preview, 0) as reports_with_preview
    FROM users u
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) as legacy_count,
        SUM(preview_input_tokens + preview_output_tokens + total_input_tokens + total_output_tokens) as total_tokens,
        SUM(preview_cost_cents + total_cost_cents) as total_cost,
        SUM(CASE WHEN preview_generated = 1 THEN 1 ELSE 0 END) as reports_with_preview
      FROM reports
      WHERE status = 'READY'
      GROUP BY user_id
    ) legacy ON u.id = legacy.user_id
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) as agent_count,
        SUM(total_input_tokens + total_output_tokens) as total_tokens,
        SUM(total_cost_cents) as total_cost
      FROM agent_reports
      WHERE status = 'READY'
      GROUP BY user_id
    ) agent ON u.id = agent.user_id
    WHERE u.id = ?
  `).bind(userId).first();

  if (!userSummary) {
    return null;
  }

  const legacyReports = await db.prepare(`
    SELECT
      id,
      brand_name,
      preview_cost_cents,
      total_cost_cents,
      preview_input_tokens,
      preview_output_tokens,
      total_input_tokens,
      total_output_tokens,
      preview_generated,
      model_id,
      generation_time_seconds,
      competitors_analyzed_count,
      api_retry_count,
      created_at,
      'legacy' as report_type
    FROM reports
    WHERE user_id = ? AND status = 'READY'
    ORDER BY created_at DESC
  `).bind(userId).all();

  const agentReports = await db.prepare(`
    SELECT
      id,
      brand_name,
      total_cost_cents,
      total_input_tokens,
      total_output_tokens,
      model_id,
      generation_time_seconds,
      web_searches_count,
      rapidapi_calls_count,
      created_at,
      'agent' as report_type
    FROM agent_reports
    WHERE user_id = ? AND status = 'READY'
    ORDER BY created_at DESC
  `).bind(userId).all();

  return {
    summary: userSummary,
    legacyReports: legacyReports.results || [],
    agentReports: agentReports.results || []
  };
}

// ============================================================================
// Agent Report Metrics
// ============================================================================

/**
 * Get daily agent report metrics
 */
export async function getAgentReportDailyMetrics(db: D1Database, days: number = 30) {
  const result = await db.prepare(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total_reports,
      SUM(total_cost_cents) as total_cost,
      AVG(generation_time_seconds) as avg_time,
      SUM(web_searches_count) as total_searches,
      SUM(rapidapi_calls_count) as total_traffic_calls,
      model_id
    FROM agent_reports
    WHERE status = 'READY'
    GROUP BY DATE(created_at), model_id
    ORDER BY date DESC
    LIMIT ?
  `).bind(days).all();

  return result.results || [];
}

/**
 * Get agent report tool usage metrics
 */
export async function getAgentToolUsageMetrics(db: D1Database) {
  const result = await db.prepare(`
    SELECT
      SUM(web_searches_count) as total_web_searches,
      SUM(rapidapi_calls_count) as total_traffic_calls,
      COUNT(*) as total_reports,
      ROUND(AVG(web_searches_count), 1) as avg_searches_per_report,
      ROUND(AVG(rapidapi_calls_count), 1) as avg_traffic_per_report
    FROM agent_reports
    WHERE status = 'READY'
  `).first();

  return result || {};
}

/**
 * Get metrics for a specific agent report
 */
export async function getAgentReportMetricsById(db: D1Database, reportId: string) {
  const result = await db.prepare(`
    SELECT
      id,
      brand_name,
      user_id,
      total_input_tokens,
      total_output_tokens,
      total_cost_cents,
      model_id,
      generation_time_seconds,
      web_searches_count,
      rapidapi_calls_count,
      tool_results,
      created_at
    FROM agent_reports
    WHERE id = ?
  `).bind(reportId).first();

  return result || null;
}

/**
 * Get recent interviews for a user (limited)
 */
export async function getRecentUserInterviews(
  db: D1Database,
  userId: string,
  limit: number = 10
) {
  const result = await db.prepare(`
    SELECT id, preview_url, status, created_at, updated_at
    FROM interviews
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(userId, limit).all();

  return result.results || [];
}
