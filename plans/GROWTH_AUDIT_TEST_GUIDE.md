# 🧪 Quick Test Guide - Growth Audit Agent

## ⚡ 5-Minute Test

### Test URL
**https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai/growth-audit**

---

## 📋 Test Scenario: Pool Industry Analysis

### Step 1: Access the Agent
1. Navigate to: https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai/growth-audit
2. You should see:
   - ✅ Purple gradient background
   - ✅ "Growth Audit Agent" header
   - ✅ Green "Claude AI Connected" indicator
   - ✅ Blue "RapidAPI Connected" indicator

### Step 2: Fill in Industry Context
```
Pool chemical supplies targeting residential pool owners in the US 
sunbelt region. Focus on retail and direct-to-consumer channels with 
emphasis on chemical safety and ease of use.
```

### Step 3: Add Competitors

**Competitor #1:**
- Company Name: `HTH Pool Care`
- Website: `hthpools.com`
- Industry: `Pool Supplies`
- Primary Markets: `Florida, California, Texas`

**Competitor #2:**
- Company Name: `Clorox Pool & Spa`
- Website: `cloroxpool.com`
- Industry: `Pool Chemicals`
- Primary Markets: `Florida, Arizona, Texas`

**Competitor #3:**
- Company Name: `Leslie's Pools`
- Website: `lesliespool.com`
- Industry: `Pool Retail`
- Primary Markets: `California, Florida, Arizona, Texas`

### Step 4: Generate Report
1. Click **"Generate Competitive Intelligence Report"** button
2. Watch the loading sequence:
   - 🔄 "Fetching traffic data from RapidAPI..."
   - 🔄 "Analyzing with Claude AI..."
   - 🔄 "Generating report..."

### Step 5: Review Report
The generated report should include:

#### Executive Summary
- 2-3 paragraph market overview
- Key competitive insights

#### Priority Geographic Markets
- Florida (35% budget)
- California (30% budget)
- Texas (20% budget)
- Arizona (15% budget)

#### Competitor Traffic Analysis
For each competitor:
- Monthly visits
- Page views
- Average duration
- Bounce rate
- Top countries

#### Channel Strategy
- **Primary**: Google Ads, SEO, Content Marketing
- **Secondary**: Social Media, Email, Partnerships
- **Tactics**: Local SEO, Seasonal campaigns, Educational content

#### ICP Analysis
- **Demographics**: Homeowners 35-65, HHI $75K+
- **Psychographics**: DIY-oriented, Value quality
- **Pain Points**: Pool maintenance complexity, Chemical safety

#### Opportunity Gaps
- Subscription-based pool care
- Mobile app for pool management
- Eco-friendly chemical alternatives

#### Strategic Recommendations
- 5-7 specific actionable recommendations

### Step 6: Download Report
1. Click **"Download HTML"** button
2. File should download: `competitive-intelligence-report-[timestamp].html`
3. Open in browser to verify formatting

### Step 7: Start New Analysis
1. Click **"New Analysis"** button
2. Form should clear and scroll to top

---

## ✅ Expected Behaviors

### UI Elements
- ✅ Smooth gradient background (purple → blue)
- ✅ Glass morphism effects on cards
- ✅ Animated loading spinner
- ✅ Hover effects on competitor cards
- ✅ Responsive layout (works on mobile)

### API Behavior
- ✅ Form validation (at least 1 competitor required)
- ✅ Loading state prevents double-submission
- ✅ Error messages if API fails
- ✅ Graceful fallback to mock data if API keys missing

### Report Quality
- ✅ Professional formatting
- ✅ Data-driven insights
- ✅ Specific recommendations
- ✅ Market segmentation
- ✅ Budget allocations

---

## 🐛 Troubleshooting

### "Failed to generate report"
**Cause**: API key issue or network timeout  
**Solution**: 
1. Check PM2 logs: `cd /home/user/webapp && pm2 logs --nostream`
2. Verify API keys in ecosystem.config.cjs
3. Restart service: `pm2 restart nexspark-landing`

### Blank report content
**Cause**: JavaScript error or missing data  
**Solution**:
1. Open browser console (F12)
2. Look for errors
3. Try with different competitor data

### Page not loading
**Cause**: Service not running  
**Solution**:
```bash
cd /home/user/webapp
pm2 list  # Check if running
pm2 restart nexspark-landing  # Restart if needed
```

### "Please add at least one competitor"
**Cause**: No competitor data filled in  
**Solution**: Fill in at least one competitor's data

---

## 🎯 Success Criteria

### ✅ Test Passes If:
1. Page loads without errors
2. Form accepts competitor data
3. Report generates within 10 seconds
4. Report contains all sections
5. Download button works
6. New Analysis button clears form

### ❌ Test Fails If:
1. Page shows 500 error
2. Form doesn't submit
3. Report is blank
4. Download doesn't work
5. Loading spinner never stops

---

## 📊 Performance Benchmarks

- **Page Load**: < 2 seconds
- **Report Generation**: 5-10 seconds
- **API Response**: < 8 seconds
- **Download**: Instant

---

## 🔍 Advanced Testing

### Test Different Industries

**SaaS Industry:**
```
Industry Context: B2B SaaS project management tools for remote teams
Competitors: Asana (asana.com), Monday (monday.com), Clickup (clickup.com)
```

**E-commerce:**
```
Industry Context: Direct-to-consumer athletic apparel
Competitors: Gymshark (gymshark.com), Lululemon (lululemon.com), Nike (nike.com)
```

**Healthcare:**
```
Industry Context: Telemedicine platforms for primary care
Competitors: Teladoc (teladoc.com), MDLive (mdlive.com), Doctor On Demand (doctorondemand.com)
```

### Test Edge Cases

1. **Single Competitor**: Add only 1 competitor
2. **Many Competitors**: Add 5-6 competitors
3. **Long Industry Context**: 500+ word description
4. **Empty Markets**: Leave markets field blank
5. **Invalid Domains**: Use non-existent websites

---

## 🚀 Integration Testing

### Test Dashboard Link
1. Go to: https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai/dashboard
2. Scroll to "Quick Actions" section
3. Click **"ANALYZE NOW"** on Growth Audit Agent card
4. Should redirect to `/growth-audit`

### Test API Endpoints Directly

**Check Status:**
```bash
curl http://localhost:3000/api/growth-audit/status
```

**Expected:**
```json
{
  "success": true,
  "status": "online",
  "features": {
    "competitiveAnalysis": true,
    "trafficData": true,
    "claudeAI": true,
    "rapidAPI": true
  }
}
```

**Generate Report:**
```bash
curl -X POST http://localhost:3000/api/growth-audit/generate \
  -H "Content-Type: application/json" \
  -d '{
    "industryContext": "Pool supplies",
    "competitors": [{
      "name": "HTH",
      "website": "hthpools.com",
      "industry": "Pool",
      "markets": ["Florida"]
    }]
  }'
```

---

## 📝 Test Checklist

- [ ] Dashboard loads
- [ ] Dashboard shows Growth Audit Agent card
- [ ] Clicking card navigates to /growth-audit
- [ ] Growth Audit page loads with form
- [ ] Can add multiple competitors
- [ ] Can remove competitors
- [ ] Form validation works
- [ ] Submit button triggers analysis
- [ ] Loading state appears
- [ ] Report generates successfully
- [ ] Report has all sections
- [ ] Report formatting is correct
- [ ] Download button works
- [ ] Downloaded HTML opens correctly
- [ ] New Analysis button works
- [ ] Mobile responsive design works
- [ ] API status endpoint works
- [ ] Error handling works gracefully

---

## 🎉 Next Steps After Testing

If all tests pass:
1. ✅ Mark feature as production-ready
2. 📝 Update README.md
3. 🚀 Deploy to Cloudflare Pages
4. 📊 Set up analytics tracking
5. 👥 Onboard first beta users

---

**Test Status**: Ready for Testing  
**Test URL**: https://3000-iuiqfv7yjexsx0p7qqz1x-c81df28e.sandbox.novita.ai/growth-audit  
**Last Updated**: December 29, 2024
