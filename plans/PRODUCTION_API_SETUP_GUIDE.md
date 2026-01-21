# 🚀 Production Setup Guide - Real API Integration

**Objective:** Enable real-world growth analysis with live API integrations  
**Status:** Setup Required  
**Platform:** Cloudflare Pages (nexspark-growth)

---

## 📋 **What You Need**

To enable full production analysis, you need **3 API services**:

### **1. Claude AI (Anthropic) - Interview Analysis**
- **Purpose:** Analyze interview responses and extract business profile
- **Cost:** ~$0.50 per analysis (using Claude 3.5 Sonnet)
- **Required:** Yes (core feature)

### **2. RapidAPI (SimilarWeb) - Competitor Traffic Data**
- **Purpose:** Get real traffic data for competitor websites
- **Cost:** ~$0.30 per competitor lookup
- **Required:** Yes (competitor research)

### **3. Stripe - Payment Processing**
- **Purpose:** Charge $20 for full GTM strategy report
- **Cost:** 2.9% + $0.30 per transaction (~$0.88 per sale)
- **Required:** Yes (revenue generation)

---

## 💰 **Cost Analysis**

### **Per Report Costs:**
```
Claude AI analysis:           $0.50
RapidAPI (3 competitors):     $0.90
Stripe transaction fee:       $0.88
Infrastructure (Cloudflare):  $0.00 (free tier)
─────────────────────────────────────
Total Cost per Report:        $2.28
```

### **Revenue Model:**
```
Report Price:                 $20.00
Total Costs:                  -$2.28
─────────────────────────────────────
Profit per Report:            $17.72
Profit Margin:                88.6%
```

### **Break-even Analysis:**
```
First 3 reports = Break-even
After that = Pure profit at 88.6% margin
```

---

## 🔑 **API Keys Setup**

### **Step 1: Get Claude API Key (Anthropic)**

1. **Go to:** https://console.anthropic.com/
2. **Sign up** or log in
3. **Navigate to:** API Keys
4. **Create new key** with name: "NexSpark Production"
5. **Copy the key** (starts with `sk-ant-api03-...`)
6. **Add $5-10 credit** for testing

**Expected format:**
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 2: Get RapidAPI Key**

1. **Go to:** https://rapidapi.com/hub
2. **Sign up** or log in
3. **Subscribe to SimilarWeb API:**
   - Search for "SimilarWeb"
   - Choose plan (Basic $0/month for testing)
4. **Copy your RapidAPI Key** from dashboard
5. **Test endpoint** with your key

**Expected format:**
```
your-rapidapi-key-here (alphanumeric string)
```

**API Endpoint Used:**
```
https://similarweb-data.p.rapidapi.com/v1/domain/{domain}/overview
```

---

### **Step 3: Get Stripe API Keys**

1. **Go to:** https://dashboard.stripe.com/
2. **Sign up** or log in
3. **Get Test Keys** (for testing):
   - Navigate to: Developers → API keys
   - Copy "Publishable key" (starts with `pk_test_`)
   - Copy "Secret key" (starts with `sk_test_`)

4. **Switch to Live Keys** (when ready for production):
   - Toggle to "Live mode"
   - Copy live keys (starts with `pk_live_` and `sk_live_`)

**Expected format:**
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ⚙️ **Configure Cloudflare Pages**

### **Step 1: Add Environment Variables**

1. **Go to:** https://dash.cloudflare.com/pages/nexspark-growth
2. **Click:** Settings → Environment variables
3. **Click:** "Add variables" for Production environment

### **Step 2: Add All API Keys**

Add these variables one by one:

```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# RapidAPI
RAPIDAPI_KEY=your-rapidapi-key-here
RAPIDAPI_HOST=similarweb-data.p.rapidapi.com

# Stripe (Test Mode for now)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Environment
ENVIRONMENT=production
```

### **Step 3: Redeploy (Automatic)**

Cloudflare Pages will automatically redeploy after adding environment variables.

---

## 🧪 **Testing the Setup**

### **Test 1: Check if APIs are configured**

Visit this URL after setup:
```
https://nexspark-growth.pages.dev/api/growth-audit/status
```

**Expected response:**
```json
{
  "success": true,
  "status": "online",
  "features": {
    "competitiveAnalysis": true,
    "trafficData": true,
    "claudeAI": true,
    "rapidAPI": true
  },
  "version": "1.0.0"
}
```

### **Test 2: Complete Real Interview**

1. **Clear localStorage:**
   - Open console (F12)
   - Type: `localStorage.clear()`
   - Press Enter

2. **Start fresh interview:**
   ```
   https://aa1bea88.nexspark-growth.pages.dev
   ```

3. **Click "GET STARTED"**

4. **Complete all 10 questions:**
   - Question 1: Company name and website
   - Questions 2-10: Business details

5. **Click "START ANALYSIS"**

6. **Watch the flow:**
   - Step 1: Claude AI analyzes interview ✅
   - Step 2: RapidAPI fetches competitor data ✅
   - Step 3: Stripe payment ($20) ⏳
   - Step 4: Full GTM report generated ✅

---

## 🔄 **Real Analysis Flow**

### **What Happens:**

```
User completes interview
        ↓
Interview saved with ID
        ↓
POST /api/analysis/start
        ↓
Claude AI extracts business profile:
  - Brand name
  - Industry
  - Target market
  - Current stage
  - Challenges
  - Goals
        ↓
POST /api/analysis/research
        ↓
RapidAPI fetches data for 3 competitors:
  - Traffic volume
  - Traffic sources
  - Top keywords
  - Engagement metrics
        ↓
Stripe payment intent ($20)
        ↓
User pays $20
        ↓
POST /api/analysis/generate-strategy
        ↓
Claude AI generates GTM strategy:
  - 6-month roadmap
  - Channel recommendations
  - Budget allocations
  - CAC/LTV projections
  - Expected results
        ↓
HTML report generated
        ↓
User downloads report
```

---

## 💡 **Important Notes**

### **About Claude API:**
- Uses Claude 3.5 Sonnet model
- Each analysis: ~5,000 tokens input + ~3,000 output
- Cost: $3/million input tokens, $15/million output tokens
- Per analysis: ~$0.50

### **About RapidAPI:**
- Free tier: 500 requests/month
- Each analysis checks 3 competitors
- After free tier: $0.30 per lookup
- Consider caching results

### **About Stripe:**
- Test mode is free (fake transactions)
- Live mode charges real money
- Webhook needed for payment confirmation
- 2.9% + $0.30 per successful charge

### **About Interview Data:**
- Saved to localStorage (temporary)
- D1 database not yet connected
- Each browser session is isolated
- Consider adding D1 for persistence

---

## 📊 **API Call Breakdown**

### **Per Analysis Session:**

| Step | API | Calls | Cost |
|------|-----|-------|------|
| **Step 1** | Claude AI | 1 call | $0.50 |
| **Step 2** | RapidAPI | 3 calls | $0.90 |
| **Step 3** | Stripe | 1 charge | $0.88 |
| **Step 4** | Claude AI | 1 call | $0.50 |
| **Total** | - | 6 calls | $2.78 |

**Revenue per session:** $20.00  
**Profit per session:** $17.22 (86.1%)

---

## 🚨 **Before Going Live**

### **Checklist:**

- [ ] Get all 3 API keys (Claude, RapidAPI, Stripe)
- [ ] Add environment variables to Cloudflare Pages
- [ ] Test with Stripe test mode first
- [ ] Complete a full test interview
- [ ] Verify report generation works
- [ ] Switch Stripe to live mode
- [ ] Test real payment ($20)
- [ ] Monitor API usage and costs
- [ ] Set up billing alerts

---

## 🔐 **Security Best Practices**

### **DO:**
✅ Store all API keys in Cloudflare environment variables  
✅ Use Stripe test mode for development  
✅ Monitor API usage and costs  
✅ Set spending limits on all APIs  
✅ Validate user input before API calls  

### **DON'T:**
❌ Commit API keys to git  
❌ Use live Stripe keys in development  
❌ Store sensitive data in localStorage  
❌ Skip payment verification  
❌ Allow unlimited API calls  

---

## 📈 **Scaling Considerations**

### **Current Setup (Good for 0-100 users/month):**
- Free Cloudflare Pages hosting
- Pay-as-you-go API costs
- Stripe standard pricing
- No database (localStorage only)

### **Future Improvements (100+ users/month):**
- Add D1 database for persistence
- Cache competitor data (reduce RapidAPI costs)
- Batch Claude AI calls for efficiency
- Add webhook for Stripe confirmations
- Monitor and optimize API usage

---

## 🎯 **Next Steps**

### **Immediate (Today):**
1. Get Claude API key from Anthropic
2. Get RapidAPI key and subscribe to SimilarWeb
3. Get Stripe test keys
4. Add all keys to Cloudflare environment variables
5. Test complete flow with real APIs

### **Short-term (This Week):**
1. Complete 5-10 test analyses
2. Monitor costs and adjust if needed
3. Optimize API calls for cost
4. Add D1 database for data persistence
5. Switch Stripe to live mode when ready

### **Long-term (This Month):**
1. Add more payment options
2. Implement caching for competitor data
3. Add user accounts and dashboards
4. Build email notification system
5. Create admin panel for monitoring

---

## 🆘 **Troubleshooting**

### **"Failed to analyze interview" Error:**
- Check if ANTHROPIC_API_KEY is set
- Verify API key is valid
- Check Claude API dashboard for errors
- Ensure you have credits

### **"Failed to fetch competitor data" Error:**
- Check if RAPIDAPI_KEY is set
- Verify subscription is active
- Test API endpoint manually
- Check rate limits

### **"Payment failed" Error:**
- Check if STRIPE_SECRET_KEY is set
- Verify using correct mode (test/live)
- Check Stripe dashboard for errors
- Ensure webhook is configured

### **"Interview ID not found" Error:**
- Clear localStorage and start fresh
- Ensure latest code is deployed
- Check browser console for errors
- Use demo mode as fallback

---

## 📞 **Support Resources**

### **API Documentation:**
- **Claude AI:** https://docs.anthropic.com/claude/reference
- **RapidAPI:** https://rapidapi.com/hub
- **Stripe:** https://stripe.com/docs/api

### **Dashboards:**
- **Claude Console:** https://console.anthropic.com/
- **RapidAPI Dashboard:** https://rapidapi.com/developer/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com/

---

## ✅ **Ready to Start?**

Once you have all 3 API keys:
1. Add them to Cloudflare Pages environment variables
2. Wait for automatic redeploy (~2 minutes)
3. Clear your browser localStorage
4. Start a fresh interview
5. Complete all 10 questions
6. Click "START ANALYSIS"
7. Watch the magic happen! ✨

**Your real growth analysis platform is ready to go!** 🚀

---

**Last Updated:** 2025-12-31  
**Platform:** Cloudflare Pages (nexspark-growth)  
**Status:** Ready for API Integration
