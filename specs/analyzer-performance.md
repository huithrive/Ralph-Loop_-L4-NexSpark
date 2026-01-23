# Module 4: Analyzer & Inspector - Performance Tracking

## Purpose
Real-time analytics dashboard and automated optimization for campaigns.

## Components

### 1. Campaign Performance Tracking
**Endpoint:** GET `/api/analyzer/performance/:campaign_id`

**Metrics:**
```json
{
  "impressions": 50000,
  "reach": 35000,
  "frequency": 1.43,
  "ctr": 2.5,
  "cpc": 0.45,
  "cpa": 35.50,
  "roas": 4.2,
  "conversion_rate": 3.2,
  "revenue": 15000,
  "spend": 3500
}
```

**Data Sources:**
- Meta Marketing API (ad performance)
- Shopify API (sales, revenue)
- Meta Pixel (website events)

**Files:**
- `backend/services/analytics.js`
- `backend/api/analyzer/performance.js`

### 2. Real-Time Dashboard Data
**Endpoint:** GET `/api/analyzer/dashboard/:user_id`

**Dashboards:**
1. Campaign Performance
2. Website Analytics
3. Revenue Tracking
4. Progress to $10K Goal

**WebSocket:** 
- Real-time updates every 5 minutes
- File: `backend/services/websocket.js`

### 3. Automated Optimization
**Endpoint:** POST `/api/analyzer/optimize/:campaign_id`

**Triggers:**
- CTR < 1% → Pause ad, suggest new creative
- CPA > target → Adjust bidding strategy
- Low conversions → Modify targeting
- ROAS < 1.5 → Increase budget or pause

**Actions:**
- Update ad sets
- Pause underperforming ads
- Increase budget on winners
- Send notifications

**Files:**
- `backend/services/optimizer.js`
- `backend/api/analyzer/optimize.js`

### 4. System Health Monitoring
**Endpoint:** GET `/api/analyzer/health/system`

**Monitors:**
- Server uptime (target: 99.9%)
- Pixel firing rate (target: 100%)
- API status (Meta, Shopify, Lovable)
- Database health
- Error rates

**Files:**
- `backend/services/monitoring.js`
- `backend/api/analyzer/health.js`

### 5. Weekly Reports
**Endpoint:** POST `/api/analyzer/report/generate`

**Report Contents:**
- Performance summary
- Top insights
- Optimization recommendations
- Progress toward $10K goal
- Next steps

**Delivery:**
- Email PDF report
- Dashboard view
- Export as JSON

## Database Schema

### performance_snapshots table
```sql
CREATE TABLE performance_snapshots (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  timestamp TIMESTAMP,
  metrics JSONB,
  created_at TIMESTAMP
);
```

### optimization_actions table
```sql
CREATE TABLE optimization_actions (
  id UUID PRIMARY KEY,
  campaign_id UUID,
  trigger VARCHAR(100),
  action VARCHAR(100),
  result JSONB,
  created_at TIMESTAMP
);
```

## Environment Variables
```
META_API_VERSION=v18.0
SHOPIFY_WEBHOOK_SECRET=xxx
```

## Acceptance Criteria
- [ ] Fetch performance data from Meta API
- [ ] Fetch revenue data from Shopify
- [ ] Calculate ROAS, CPA, CTR correctly
- [ ] Dashboard endpoints return real-time data
- [ ] Automated optimization triggers work
- [ ] System health monitoring accurate
- [ ] Weekly reports generated
- [ ] All metrics stored in database
- [ ] WebSocket updates every 5 min
