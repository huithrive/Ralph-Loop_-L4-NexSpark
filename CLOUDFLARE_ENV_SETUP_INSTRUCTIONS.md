# 🚀 Cloudflare Pages Environment Variables Setup

**CRITICAL:** You must add these environment variables to Cloudflare Pages for the APIs to work!

---

## 📋 **Environment Variables to Add**

Go to: https://dash.cloudflare.com/pages/nexspark-growth/settings/environment-variables

Click "Add variables" and add these **6 variables** for **Production** environment:

---

### **1. ANTHROPIC_API_KEY**
```
REDACTED_ANTHROPIC_KEY
```

### **2. RAPIDAPI_KEY**
```
REDACTED_RAPIDAPI_KEY
```

### **3. RAPIDAPI_HOST**
```
similarweb-data.p.rapidapi.com
```

### **4. STRIPE_SECRET_KEY** ⚠️ LIVE KEY
```
REDACTED_STRIPE_LIVE_SECRET
```

### **5. STRIPE_PUBLISHABLE_KEY** ⚠️ LIVE KEY
```
REDACTED_STRIPE_LIVE_PUBLISHABLE
```

### **6. ENVIRONMENT**
```
production
```

---

## 🎯 **Step-by-Step Instructions**

### **Step 1: Open Cloudflare Dashboard**
1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → nexspark-growth
3. Click: Settings (in left sidebar)
4. Click: Environment variables

### **Step 2: Add Variables**
1. Click the **"Add variables"** button
2. For **each variable** above:
   - Variable name: (e.g., `ANTHROPIC_API_KEY`)
   - Environment: Select **"Production"**
   - Value: (paste the value from above)
   - Click "Add variable"
3. Repeat for all 6 variables

### **Step 3: Save and Redeploy**
1. Click **"Save"** after adding all variables
2. Cloudflare will automatically trigger a redeploy
3. Wait 2-3 minutes for deployment to complete

---

## ✅ **Verification**

After adding variables and redeploy completes:

### **Test 1: Check API Status**
Visit: https://6976dfb4.nexspark-growth.pages.dev/api/growth-audit/status

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
  }
}
```

### **Test 2: Complete Interview Flow**
1. Clear localStorage: `localStorage.clear()`
2. Go to: https://6976dfb4.nexspark-growth.pages.dev
3. Click "GET STARTED"
4. Complete all 10 questions
5. Click "START ANALYSIS"
6. Watch the analysis flow work!

---

## ⚠️ **CRITICAL WARNINGS**

### **🔴 LIVE STRIPE KEYS - REAL MONEY!**

You are using **LIVE Stripe keys**, which means:
- ✅ Real $20 charges will happen
- ✅ Money goes to your Stripe account
- ✅ Real credit card processing
- ⚠️ Make sure you test thoroughly first!

**Test card that works in LIVE mode:**
- Use your own credit card
- Stripe will charge $20 (real money)
- You can refund from Stripe dashboard

---

## 💰 **Cost Per Analysis**

With these APIs configured:
```
Claude AI (2 calls):      ~$1.00
RapidAPI (3 lookups):     ~$0.90
Stripe fee:               ~$0.88
─────────────────────────────────
Total cost per report:    ~$2.78
Revenue per report:       $20.00
Profit per report:        $17.22
Profit margin:            86.1%
```

---

## 🔒 **Security**

**These keys are:**
- ✅ Stored securely in Cloudflare
- ✅ Never committed to git
- ✅ Encrypted at rest
- ✅ Only accessible by Cloudflare Workers

**Never:**
- ❌ Share these keys publicly
- ❌ Commit to GitHub
- ❌ Expose in frontend code (except publishable key)

---

## 📊 **What's Already Done**

✅ **Frontend Updated:**
- Stripe publishable key configured
- Payment form ready
- All UI components working

✅ **Backend Ready:**
- Claude AI integration coded
- RapidAPI integration coded
- Stripe payment processing coded
- Report generation coded

⏳ **Waiting For:**
- You to add environment variables to Cloudflare
- Then everything will work!

---

## 🚀 **After Setup**

Once you add the variables to Cloudflare:

1. **Test immediately** with real interview
2. **Real analysis** will happen
3. **Real payment** will be charged ($20)
4. **Real report** will be generated

**You'll be ready to accept paying customers!** 🎉

---

## 📝 **Next Steps**

1. **[ ] Add all 6 environment variables to Cloudflare Pages**
2. **[ ] Wait for automatic redeploy (2-3 minutes)**
3. **[ ] Test with real interview**
4. **[ ] Verify payment works**
5. **[ ] Generate first real report**
6. **[ ] Share with customers!**

---

**Latest Deployment URL:**
```
https://6976dfb4.nexspark-growth.pages.dev
```

**Cloudflare Settings:**
```
https://dash.cloudflare.com/pages/nexspark-growth/settings/environment-variables
```

---

**Status:** ⏳ Waiting for environment variables to be added  
**Action Required:** Add 6 variables to Cloudflare Pages  
**Time Required:** ~5 minutes  
**Then:** Ready for production! 🚀
