/**
 * Execution Layer API Endpoints
 * 
 * Add these to src/index.tsx
 */

import { Hono } from 'hono'
import { ExecutionAgent } from './services/agent/execution-agent'

const app = new Hono()

// Parse strategy into execution plan
app.post('/api/execution/parse-strategy', async (c) => {
  try {
    const { strategy_id } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    
    return c.json({ success: true, plan })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Generate campaigns from strategy
app.post('/api/execution/generate-campaigns', async (c) => {
  try {
    const { strategy_id, platforms } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    const campaigns = await agent.generateAdCampaigns(plan)
    
    return c.json({ success: true, campaigns })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Generate landing page
app.post('/api/execution/generate-landing-page', async (c) => {
  try {
    const { strategy_id, page_type } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    const plan = await agent.parseStrategy(strategy_id)
    const pages = await agent.generateLandingPages(plan)
    
    return c.json({ success: true, page: pages[0] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Launch campaign
app.post('/api/execution/launch-campaign', async (c) => {
  try {
    const { campaign_id } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    // Fetch campaign from D1
    const campaign = await c.env.DB.prepare(`
      SELECT * FROM campaigns WHERE campaign_id = ?
    `).bind(campaign_id).first()
    
    const result = await agent.launchCampaign(campaign)
    
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Deploy landing page to Shopify
app.post('/api/execution/deploy-shopify-page', async (c) => {
  try {
    const { page_id, shopify_store } = await c.req.json()
    
    const agent = new ExecutionAgent(c.env)
    // Fetch page from D1
    const page = await c.env.DB.prepare(`
      SELECT * FROM landing_pages WHERE page_id = ?
    `).bind(page_id).first()
    
    const result = await agent.deployLandingPage(page, shopify_store)
    
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get campaign performance
app.get('/api/execution/campaign-performance/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const agent = new ExecutionAgent(c.env)
    const metrics = await agent.trackPerformance(campaignId)
    
    return c.json({ success: true, metrics })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get optimization recommendations
app.get('/api/execution/optimize/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const agent = new ExecutionAgent(c.env)
    const recommendations = await agent.generateOptimizations(campaignId)
    
    return c.json({ success: true, recommendations })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
