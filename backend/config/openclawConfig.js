module.exports = {
  heartbeat: {
    intervalMin: 30,
    maxActionsPerDay: 10,
    heartbeatTimeoutSec: 15
  },
  thresholds: {
    roas: { critical: 0.5, warning: 1.5, good: 3.0 },
    cpa: { multiplier: 1.5 },
    ctr: { minimum: 1.0 },
    frequency: { maximum: 3.0 },
    budget: { overspend_warning: 1.5, overspend_critical: 2.0 }
  },
  trust: {
    L1_auto: ['neg_keywords', 'bid_adjust_small', 'pause_critical_roas'],
    L2_confirm: ['pause_underperformer', 'budget_shift_moderate', 'creative_swap', 'audience_adjust'],
    L3_approve: ['new_campaign', 'budget_increase_large', 'phase_transition', 'strategy_change', 'account_access']
  },
  notifications: {
    quietHours: { start: 23, end: 8 },
    maxPerDay: { email: 2, whatsapp: 1 },
    emergencyOverridesQuietHours: true
  },
  milestones: {
    roasTargets: [2.0, 3.0, 5.0],
    revenueTargets: [10000, 25000, 50000, 100000],
    customerTargets: [50, 100, 500]
  },
  phases: {
    test: { days: 10, budgetPct: 30 },
    optimize: { days: 15, budgetPct: 48 },
    scale: { days: 6, budgetPct: 22 }
  }
};
