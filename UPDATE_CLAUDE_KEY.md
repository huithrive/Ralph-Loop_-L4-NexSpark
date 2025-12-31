# ⚠️ SECURITY NOTICE: API Key Exposed

**IMPORTANT**: Your Claude API key was shared in this conversation. After fixing your platform, please:

1. Go to: https://console.anthropic.com/settings/keys
2. Delete the key: `sk-ant-api03-OdYneVAUqEYf0i1El4Yz...`
3. Create a new key
4. Update Cloudflare with the new key

---

# 🔑 Update Claude API Key in Cloudflare

## Step 1: Go to Cloudflare Pages Settings

**URL**: https://dash.cloudflare.com/pages/nexspark-growth/settings/environment-variables

## Step 2: Find ANTHROPIC_API_KEY Variable

Look for the variable named: `ANTHROPIC_API_KEY`

## Step 3: Update the Value

1. Click "Edit" button next to `ANTHROPIC_API_KEY`
2. **Delete the old incomplete value**
3. **Paste this FULL key**:
   ```
   REDACTED_ANTHROPIC_KEY6IOxgMOrrQ-aZjejgAA
   ```
4. Click "Save"

## Step 4: Wait for Automatic Redeploy

- Cloudflare will automatically trigger a new deployment
- Wait **2-3 minutes** for the redeploy to complete
- You'll see a new deployment URL when it's done

## Step 5: Test Your Platform

1. **Clear localStorage** (Important!):
   ```javascript
   // Press F12 → Console → Type:
   localStorage.clear();
   location.reload();
   ```

2. **Test Demo Mode**:
   ```
   https://2a38eabb.nexspark-growth.pages.dev/strategy-analysis?demo=true
   ```

3. **Or Complete Real Interview**:
   ```
   https://2a38eabb.nexspark-growth.pages.dev
   ```

## Step 6: Verify Success

You should see:
- ✅ Interview summary displays
- ✅ Analysis proceeds without error
- ✅ "Analyzing interview transcript..." in console
- ✅ Business profile extracted
- ✅ Moves to Step 2 (website verification)

---

## 🔍 Console Verification

Open browser console (F12) and look for:

```
Analyzing interview transcript... {
  mode: 'localStorage',
  responseCount: 10,
  hasClaudeKey: true,  ← Should now be TRUE
  keyLength: 95        ← Should be 95
}
```

---

## ⚠️ SECURITY: Rotate Key After Testing

**After your platform works**, immediately rotate the key:

1. Go to: https://console.anthropic.com/settings/keys
2. Find the key ending in `...jgAA`
3. Click "Delete"
4. Click "Create Key" to generate a new one
5. Copy the new key
6. Update Cloudflare Pages with the new key (same steps as above)

**Why?** Your key was exposed in this conversation and could be used by others.

---

## 📋 Quick Checklist

- [ ] Go to Cloudflare Pages settings
- [ ] Find ANTHROPIC_API_KEY variable
- [ ] Update with full key (95 characters)
- [ ] Save (triggers auto-redeploy)
- [ ] Wait 2-3 minutes
- [ ] Clear localStorage
- [ ] Test platform
- [ ] ⚠️ **ROTATE KEY** for security

---

## 🔗 Links

- **Cloudflare Settings**: https://dash.cloudflare.com/pages/nexspark-growth/settings/environment-variables
- **Anthropic Console** (to rotate key): https://console.anthropic.com/settings/keys
- **Test URL**: https://2a38eabb.nexspark-growth.pages.dev

---

**Status**: ⏳ Waiting for you to update the key in Cloudflare

Let me know once you've updated it and I'll help you test!
