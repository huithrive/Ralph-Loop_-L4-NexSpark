# 🧪 NexSpark Testing Guide - Phases 1-3

## 🎯 What We're Testing

**The complete new flow from interview to preview:**
1. ✅ New interview questions (brand-focused)
2. ✅ Claude-powered summary confirmation
3. ✅ Website URL confirmation
4. ✅ **Report preview with real data** (THE BIG ONE!)
   - Competitor identification
   - 6-month roadmap
   - Paid ads benchmarks
   - Unlock CTA

## 🚀 Production URLs

- **Main**: https://cfa1b9c4.nexspark-growth.pages.dev
- **Interview**: https://cfa1b9c4.nexspark-growth.pages.dev/interview
- **Summary**: https://cfa1b9c4.nexspark-growth.pages.dev/interview-summary
- **Website**: https://cfa1b9c4.nexspark-growth.pages.dev/website-confirmation
- **Preview**: https://cfa1b9c4.nexspark-growth.pages.dev/report-preview
- **API Status**: https://cfa1b9c4.nexspark-growth.pages.dev/api/growth-audit/status

## 📋 Testing Checklist

### STEP 0: Clear Browser Data (CRITICAL!)
```javascript
// Open browser console (F12 → Console tab)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### STEP 1: Start Interview ✅
1. Go to: https://cfa1b9c4.nexspark-growth.pages.dev
2. Click **GET STARTED**
3. You should see the voice interview page

**Check:**
- [ ] Page loads correctly
- [ ] "Digital Leon" greeting appears
- [ ] Microphone button visible
- [ ] Question 1 displays

### STEP 2: Complete Interview ✅
**New Questions to Answer:**
1. **Brand name**: "What's your brand name or product you're trying to grow?"
2. **Product description**: "How would you describe your product?"
3. **Motivation**: "When did you start and what motivated you?" ← NEW!
4. **Revenue**: "Current monthly revenue?"
5. **Channels & Budget**: "Which channels and how much per channel?" ← CONSOLIDATED!
6. **Best channel**: "Best performing channel with metrics?"
7. **Challenge**: "Biggest growth challenge?"
8. **Ideal customer**: "Describe ideal customer in detail?"
9. **Competitors**: "Top 3 competitors and differentiation?"
10. **Goal**: "Main 6-month goal?"

**Check:**
- [ ] All 10 questions display
- [ ] Notice questions 2, 3, 5 are different
- [ ] Can complete via voice or text
- [ ] Progress indicator works
- [ ] Click "I'M FINISHED" when done

### STEP 3: Interview Summary (NEW!) ✅
**Expected:**
- Redirects to `/interview-summary`
- Shows loading spinner
- "NexSpark AI analyzing your responses..."
- Summary displays in ~3-5 seconds

**Check:**
- [ ] Loading state appears
- [ ] Summary generates successfully
- [ ] All fields populated:
  - Brand Name
  - Product Description
  - Motivation & Story ← NEW!
  - Current Revenue
  - Best Channel
  - Biggest Challenge
  - Ideal Customer
  - 6-Month Goal
  - Competitors
- [ ] Two buttons: "Yes, This is Accurate" and "Let Me Edit"
- [ ] Click **"Yes, This is Accurate"**

**Console Check:**
```
Look for:
✅ Summary generated: {brandName: "...", ...}
✅ Saved to localStorage
```

### STEP 4: Website Confirmation (NEW!) ✅
**Expected:**
- Redirects to `/website-confirmation`
- Website input field (may auto-populate if mentioned in interview)
- Shows what we'll analyze
- "Continue to Preview" button

**Check:**
- [ ] Page loads correctly
- [ ] Website field shown
- [ ] Can enter URL (e.g., "poolsupplyworld.com" or "acmepoolsupply.com")
- [ ] Auto-adds https:// if missing
- [ ] Shows 4 bullet points of what we'll analyze
- [ ] Click **"Continue to Preview"**

**Try entering:** `poolsupplyworld.com` or your own website

### STEP 5: Report Preview (THE BIG TEST!) 🎉

**Expected:**
- Redirects to `/report-preview`
- Shows table of contents (6 sections)
- 3 sections load with spinners, then display data:
  1. Competitive Intelligence
  2. 6-Month Roadmap  
  3. Paid Ads Benchmarks
- Unlock CTA appears when all 3 load

#### 5a. Table of Contents
**Check:**
- [ ] Report structure displays with 6 sections
- [ ] Sections 2, 3, 4 have green "PREVIEW" badges
- [ ] Professional layout

#### 5b. Competitive Intelligence Preview
**Expected (loads in ~5-10 seconds):**
- Loading spinner: "NexSpark AI identifying competitors..."
- Then displays 3 competitor cards

**Check for each competitor:**
- [ ] Competitor name and website
- [ ] Monthly traffic estimate (from RapidAPI or mock)
- [ ] Green "Strength" card
- [ ] Red "Weakness/Opportunity" card
- [ ] Differentiation insight at bottom

**Console Check:**
```
Look for:
📊 Loading competitor preview...
✅ Competitors loaded: [{name: "...", ...}, ...]
```

#### 5c. 6-Month Roadmap Preview
**Expected (loads in ~5-10 seconds):**
- Loading spinner: "NexSpark AI building your roadmap..."
- Then displays 3 phases

**Check for each phase:**
- [ ] Phase number and name (e.g., "Foundation Phase")
- [ ] Month range (e.g., "Months 1-2")
- [ ] 2-3 key actions with checkmarks
- [ ] Phase goal
- [ ] Expected outcome summary at bottom

**Console Check:**
```
Look for:
📅 Loading roadmap preview...
✅ Roadmap loaded: {phases: [...]}
```

#### 5d. Paid Ads Benchmarks Preview
**Expected (loads in ~5-10 seconds):**
- Loading spinner: "NexSpark AI calculating benchmarks..."
- Then displays Google Ads & Facebook Ads side-by-side

**Check:**
- [ ] Google Ads card shows:
  - Target CPC (e.g., "$2.50")
  - Expected CTR (e.g., "3.5%")
  - Projected CAC (e.g., "$35")
  - Recommended Budget (e.g., "$3,000/month")
  - Expected ROI (e.g., "4.5x") in green
- [ ] Facebook Ads card shows same metrics
- [ ] Recommended channel mix at bottom

**Console Check:**
```
Look for:
📈 Loading benchmarks preview...
✅ Benchmarks loaded: {googleAds: {...}, facebookAds: {...}}
```

#### 5e. Unlock CTA
**Expected (appears after all 3 previews load):**
- Scrolls into view automatically
- Large heading "Unlock Your Complete Growth Strategy"
- Lists what's included (6 checkmarks)
- Shows "$20" in large text
- "Unlock Full Report - $20" button

**Check:**
- [ ] CTA appears after all previews load
- [ ] Auto-scrolls to CTA
- [ ] Button is clickable
- [ ] Professional design with gold accents

**Click: "Unlock Full Report - $20"**

### STEP 6: Payment (Existing)
**Expected:**
- Redirects to `/strategy-analysis` (existing payment page)
- Payment form appears
- Stripe TEST mode active

**Check:**
- [ ] Payment page loads
- [ ] Test card works: 4242 4242 4242 4242
- [ ] Expiry: 12/25, CVC: 123, ZIP: 12345
- [ ] Payment processes

### STEP 7: Report Generation (Existing)
**Expected:**
- Shows generation progress
- "NexSpark AI analyzing..." messages
- Report generates in 2-3 minutes

**Check:**
- [ ] Progress indicators show
- [ ] Report completes successfully
- [ ] Download button appears

---

## 🐛 Troubleshooting

### Issue: Summary not generating
**Fix:**
```javascript
// Check if interview data exists
console.log(JSON.parse(localStorage.getItem('nexspark_interview')));
// Should show responses array with 10 items
```

### Issue: Preview sections stuck on loading
**Check:**
1. Open browser console (F12)
2. Look for error messages
3. Check API calls in Network tab
4. Verify: `hasClaudeKey: true` and `hasRapidKey: true`

**Common causes:**
- API keys not configured
- Network error
- Invalid summary data

### Issue: Competitors show mock data
**Expected behavior!**
- If RapidAPI isn't configured, shows placeholder data
- This is normal for testing without full API access

### Issue: "No summary found" error
**Fix:**
1. Clear localStorage
2. Start from beginning
3. Complete full interview
4. Don't skip any steps

---

## ✅ Success Criteria

**The flow is working correctly if:**
1. ✅ Interview completes with new questions
2. ✅ Summary generates and displays all fields
3. ✅ Website input accepts and validates URL
4. ✅ Preview page shows all 3 sections:
   - Competitors (even if mock data)
   - Roadmap (3 phases)
   - Benchmarks (Google & Facebook)
5. ✅ Unlock CTA appears after previews load
6. ✅ Can click through to payment
7. ✅ Payment processes (TEST mode)
8. ✅ Report generates successfully

---

## 📊 What to Look For

### User Experience
- **Smooth flow**: Each step leads naturally to next
- **Loading states**: Clear feedback during processing
- **Data quality**: Summary accurately reflects answers
- **Value demonstration**: Preview shows real insights
- **Professional design**: Looks polished throughout

### Technical Performance
- **API calls**: All complete successfully
- **Load times**: Preview sections load in 5-10 seconds each
- **Error handling**: Graceful failures with retry options
- **Data persistence**: localStorage saves between steps

### Conversion Optimization
- **Preview impact**: Do you feel compelled to pay after seeing preview?
- **Value clarity**: Is it obvious what you're getting for $20?
- **Trust building**: Does the preview demonstrate expertise?

---

## 💬 Feedback Questions

After testing, consider:
1. **Interview questions**: Do the new questions feel better? More insightful?
2. **Summary page**: Does Claude accurately capture your intent?
3. **Preview value**: Does the preview make you want to pay?
4. **Competitor data**: Is the competitive intelligence useful?
5. **Roadmap**: Does the 6-month plan seem actionable?
6. **Benchmarks**: Are the ad projections realistic?
7. **Overall flow**: Any confusing or jarring transitions?
8. **Missing anything**: What would make this better?

---

## 🚀 Ready to Test!

**Start here:** https://cfa1b9c4.nexspark-growth.pages.dev

**Remember:**
1. Clear localStorage first!
2. Use real answers (more interesting preview)
3. Test card: 4242 4242 4242 4242
4. Check browser console for logs
5. Take notes on any issues

**Let me know:**
- ✅ What works well
- ❌ What breaks or confuses
- 💡 Ideas for improvement
- 🎯 Does the preview increase desire to pay?

Good luck! The preview page is the key innovation - focus your testing there! 🎉
