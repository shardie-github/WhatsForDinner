# Demo Checklist

**Purpose**: Pre-demo checklist and quick recovery tips

---

## Pre-Demo Checklist

### Environment Setup

- [ ] **App Running**
  - Local: `pnpm dev:web` running, accessible at `http://localhost:3000`
  - OR Production: URL ready, app accessible

- [ ] **Test Account Ready**
  - Account created and logged in
  - OR ready to sign up during demo

- [ ] **Environment Variables Set**
  - `NEXT_PUBLIC_SUPABASE_URL` configured
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
  - `OPENAI_API_KEY` configured (for recipe generation)
  - `SUPABASE_SERVICE_ROLE_KEY` configured

- [ ] **Database Connected**
  - Supabase project active (not paused)
  - Migrations applied
  - Test data seeded (optional, but helpful)

---

### Demo Data Preparation

- [ ] **Pantry Items Ready**
  - Have 3-5 common ingredients ready to add
  - Examples: chicken, rice, vegetables, pasta, etc.

- [ ] **Test Recipes Available**
  - If recipe generation fails, have backup recipes ready
  - Or use pre-generated recipes from previous sessions

- [ ] **Browser Ready**
  - Chrome/Firefox/Safari open
  - Incognito mode (if using test account)
  - Browser console closed (or errors hidden)

---

### Technical Checks

- [ ] **Network Connection**
  - Stable internet connection
  - No VPN blocking Supabase/OpenAI

- [ ] **API Keys Valid**
  - OpenAI API key not expired
  - Supabase keys valid
  - Check usage limits (OpenAI rate limits)

- [ ] **Performance Check**
  - App loads quickly (< 3 seconds)
  - Recipe generation works (< 30 seconds)
  - No console errors

---

### Presentation Setup

- [ ] **Screen Sharing Ready**
  - Screen sharing software tested
  - Screen resolution appropriate (1920x1080 recommended)
  - Browser zoom set to 100%

- [ ] **Audio/Video**
  - Microphone working
  - Camera ready (if video call)
  - Background noise minimized

- [ ] **Backup Plan**
  - Recording ready (if recording demo)
  - Backup device ready (phone/tablet)
  - Alternative demo path prepared

---

## Quick Recovery Tips

### Recipe Generation Fails

**Symptom**: Recipe generation takes too long or fails

**Quick Fix**:
1. Say: "Let me try that again. Sometimes the AI needs a moment."
2. Refresh page, try again
3. If still fails, use pre-generated recipe as backup

**Prevention**: Test recipe generation before demo, have backup recipes ready

---

### App Won't Load

**Symptom**: App doesn't load or shows error

**Quick Fix**:
1. Check `.env.local` has all required variables
2. Restart dev server: `pnpm dev:web`
3. Check Supabase project is active (not paused)
4. If production, check Vercel deployment status

**Prevention**: Test app before demo, have production URL as backup

---

### Database Connection Error

**Symptom**: "Cannot connect to database" error

**Quick Fix**:
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify Supabase project is active
3. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
4. Try refreshing page

**Prevention**: Test database connection before demo

---

### OpenAI API Error

**Symptom**: Recipe generation fails with API error

**Quick Fix**:
1. Check `OPENAI_API_KEY` is set and valid
2. Check OpenAI dashboard for rate limits/quota
3. Use backup pre-generated recipes
4. Say: "The AI is experiencing high load. Let me show you a pre-generated recipe."

**Prevention**: Check OpenAI quota before demo, have backup recipes

---

### Slow Performance

**Symptom**: App is slow or laggy

**Quick Fix**:
1. Say: "The app is usually faster - this might be a network issue."
2. Continue demo, mention it's usually faster
3. Close other browser tabs/apps
4. Check network connection

**Prevention**: Test performance before demo, use wired connection if possible

---

### Feature Not Available

**Symptom**: Feature mentioned but not implemented

**Quick Fix**:
1. Say: "That feature is coming soon. The core recipe generation is what we're showing today."
2. Focus on what works
3. Mention roadmap if asked

**Prevention**: Know what features are available, don't demo unavailable features

---

## Post-Demo

### Immediate Follow-Up

- [ ] **Answer Questions**
  - Be ready for technical questions
  - Reference `/yc/YC_TECH_OVERVIEW.md` for tech details
  - Reference `/dataroom/*` for business details

- [ ] **Share Resources**
  - Send demo recording (if recorded)
  - Share relevant docs (`/dataroom/*`)
  - Provide contact info for follow-up

- [ ] **Document Feedback**
  - Note any questions asked
  - Document any issues encountered
  - Update demo script based on feedback

---

## Common Issues & Solutions

### Issue: "How do I know this will work for me?"

**Answer**: "We've validated with [X] users. [Specific example or metric]. Would you like to try it yourself?"

---

### Issue: "What about [competitor]?"

**Answer**: "Great question. [Competitor] is recipe-first, which means you need to know what you want before searching. We're pantry-first, which means we start with what you have. [Key differentiator]."

**See**: `/yc/YC_COMPETITIVE_ANALYSIS.md` for competitive talking points

---

### Issue: "How does the AI work?"

**Answer**: "We use GPT-4 fine-tuned on dietary restrictions and cooking constraints. The AI analyzes your pantry, preferences, and constraints to generate personalized recipes. It learns from your feedback to improve over time."

**See**: `/yc/YC_TECH_OVERVIEW.md` for technical details

---

### Issue: "What's your business model?"

**Answer**: "Consumer subscriptions - Free, Pro ($9.99/month), Premium ($19.99/month). Plus affiliate commissions from grocery delivery partnerships."

**See**: `/yc/FINANCIAL_MODEL.md` for detailed business model

---

## Practice Recommendations

1. **Run through demo 2-3 times** before actual demo
2. **Test all features** you plan to show
3. **Time yourself** - aim for 3-5 minutes
4. **Prepare answers** to common questions
5. **Have backup plan** if something breaks

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Ready for use
