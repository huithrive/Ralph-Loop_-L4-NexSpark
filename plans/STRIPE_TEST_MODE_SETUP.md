# 🧪 Stripe TEST Mode Setup Guide

## Why TEST Mode?
- **No real charges**: Test cards won't charge actual money
- **Safe testing**: Verify report quality before going live
- **Easy debugging**: Test payment flows without financial risk

## Get Your Stripe TEST Keys

### Step 1: Go to Stripe Dashboard
https://dashboard.stripe.com/test/apikeys

### Step 2: Toggle to TEST MODE
Look for the toggle switch in the top right that says "**Test mode**"
- Should show orange/yellow badge when in test mode
- If it says "Live", click to toggle to "Test mode"

### Step 3: Copy Your TEST Keys
You'll see two keys:

**Publishable key** (starts with `pk_test_`)
```
pk_test_51XXX...
```

**Secret key** (starts with `sk_test_`) - click "Reveal test key"
```
sk_test_51XXX...
```

## Update Configuration

### Option A: Quick Fix (Recommended)
**Send me your Stripe TEST keys and I'll update everything:**
1. Publishable key (pk_test_...)
2. Secret key (sk_test_...)

I'll update:
- ✅ Frontend Stripe initialization
- ✅ Backend payment processing
- ✅ Cloudflare environment variables

### Option B: Manual Update
If you prefer, update these files yourself:

**1. Frontend** - `public/static/strategy-analysis.html` line 427:
```javascript
// OLD (live key)
stripe = Stripe('REDACTED_STRIPE_LIVE_PUBLISHABLE');

// NEW (test key)
stripe = Stripe('pk_test_YOUR_TEST_PUBLISHABLE_KEY');
```

**2. Cloudflare Pages Environment Variables**
https://dash.cloudflare.com/pages/nexspark-growth/settings/environment-variables

Update these:
- `STRIPE_SECRET_KEY` → `sk_test_YOUR_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY` → `pk_test_YOUR_PUBLISHABLE_KEY`

## Test Cards for TEST Mode

### ✅ Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### ❌ Declined Payment (for testing errors)
```
Card Number: 4000 0000 0000 0002
```

### 🔐 3D Secure (for testing authentication)
```
Card Number: 4000 0025 0000 3155
```

## What's Changed Already ✅

1. **UI Branding**:
   - ✅ "Claude AI analyzing" → "NexSpark AI analyzing"
   - ✅ "Powered by Claude AI" → "Powered by NexSpark AI"

2. **Ready for TEST Keys**:
   - Backend accepts any Stripe key format
   - Frontend ready to update publishable key
   - Payment flow tested and working

## Next Steps

1. **Copy your TEST keys** from Stripe dashboard
2. **Send them to me** or update manually
3. **I'll deploy** with TEST mode enabled
4. **Test payment** with card 4242 4242 4242 4242
5. **Review report quality** before going live
6. **Switch to LIVE** when ready (I'll help with this too)

## Security Notes

- ✅ TEST keys are safe to share (they don't process real money)
- ✅ Always use TEST keys during development
- ✅ Only use LIVE keys when ready for real customers
- ✅ Never commit keys to git (they're in .gitignore)

---

**Ready to proceed?** Send me your Stripe TEST keys and I'll update everything! 🚀
