# Manual Registration Requirements - Quick Reference

**Date**: 2025-01-21  
**Purpose**: Quick reference for all services requiring manual registration or input

---

## ?? Critical Priority (P0) - Manual Registration Required

### 1. USDA FoodData Central API
- **Status**: ? Not Started
- **Registration Time**: ? Immediate (1 hour)
- **Steps**:
  1. Visit https://fdc.nal.usda.gov/api-guide.html
  2. Register for free API key
  3. Add `USDA_API_KEY` to environment variables
- **Blockers**: None - Can register immediately
- **Action**: ? **DO THIS FIRST** (1 hour task)

### 2. Instacart Connect API
- **Status**: ? Not Started  
- **Registration Time**: ? 1-2 weeks (Partnership Approval Required)
- **Steps**:
  1. Visit https://www.instacart.com/partners/connect
  2. Apply for Instacart Connect partner program
  3. Complete business verification (1-2 weeks)
  4. Submit integration proposal
  5. Wait for technical review and approval
  6. Receive OAuth credentials
  7. Add to environment variables:
     - `INSTACART_CLIENT_ID`
     - `INSTACART_CLIENT_SECRET`
     - `INSTACART_REDIRECT_URI`
- **Blockers**: ?? **PARTNERSHIP APPROVAL REQUIRED** - Cannot implement until approved
- **Action**: ?? **START IMMEDIATELY** - This is the longest approval process

---

## ?? High Priority (P1) - Manual Registration Required

### 3. Amazon Associates
- **Status**: ? Not Started
- **Registration Time**: ? 1-2 weeks
- **Steps**:
  1. Visit https://affiliate-program.amazon.com/
  2. Apply for Amazon Associates program
  3. Wait for approval (typically 1-2 weeks)
  4. Create Product Advertising API credentials
  5. Add to environment variables:
     - `AMAZON_ACCESS_KEY`
     - `AMAZON_SECRET_KEY`
     - `AMAZON_ASSOCIATE_TAG`
     - `AMAZON_PARTNER_TYPE`
     - `AMAZON_MARKETPLACE`
- **Blockers**: None - Can apply immediately, but need to wait for approval
- **Action**: ? **APPLY NOW** - Approval takes 1-2 weeks

### 4. Spoonacular Recipe API
- **Status**: ? Not Started
- **Registration Time**: ? Immediate
- **Steps**:
  1. Visit https://spoonacular.com/food-api
  2. Sign up for account
  3. Choose subscription tier:
     - Free: $0 (limited)
     - Medium: $149/month (15K requests/day) - **RECOMMENDED**
     - Premium: $299/month (100K requests/day)
  4. Receive API key
  5. Add `SPOONACULAR_API_KEY` to environment variables
- **Blockers**: None - Immediate approval
- **Action**: ? **DO THIS NOW** - Quick setup, immediate access

### 5. Google Calendar API
- **Status**: ? Not Started
- **Registration Time**: ? Immediate (OAuth setup, 1 day)
- **Steps**:
  1. Create Google Cloud Project at https://console.cloud.google.com/
  2. Enable Calendar API in API Library
  3. Create OAuth 2.0 credentials:
     - Go to Credentials ? Create Credentials ? OAuth client ID
     - Application type: Web application
     - Add authorized redirect URIs
  4. Configure OAuth consent screen:
     - User type: External (unless G Suite)
     - App name, support email, developer contact
     - Scopes: `https://www.googleapis.com/auth/calendar`
  5. Add to environment variables:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_REDIRECT_URI`
     - `GOOGLE_PROJECT_ID`
- **Blockers**: None - OAuth setup required
- **Action**: ? **DO THIS WEEK** - Setup takes ~1 day

### 6. Edamam Food API (Deferred to Phase 3)
- **Status**: ? Deferred
- **Registration Time**: ? Immediate (when needed)
- **Steps**: (Defer until Phase 3)
  1. Visit https://www.edamam.com/
  2. Sign up for free account
  3. Get API key and App ID
  4. Add to environment variables:
     - `EDAMAM_APP_ID`
     - `EDAMAM_APP_KEY`
- **Blockers**: None
- **Action**: ?? **DEFER** - Mark for Phase 3 implementation

---

## ? Services NOT Requiring Manual Registration

### Open Food Facts API
- **Status**: ? Ready to implement
- **Registration**: ? Not required
- **Action**: Can implement immediately

### USDA Price Database
- **Status**: ? Ready to implement
- **Registration**: ? Not required (public data)
- **Action**: Download public data files, implement immediately

---

## Registration Priority Order

### ? Immediate Actions (This Week)
1. ? **USDA FoodData Central** - Register API key (1 hour)
2. ? **Spoonacular** - Sign up and get API key (30 minutes)
3. ? **Google Calendar** - Set up OAuth credentials (1 day)

### ? Medium Term (Next 2 Weeks)
4. ? **Amazon Associates** - Apply now, wait 1-2 weeks for approval
5. ?? **Instacart Connect** - Apply now, wait 1-2 weeks for partnership approval

### ?? Deferred
6. **Edamam** - Defer to Phase 3

---

## Environment Variables Checklist

After completing registrations, add these to your environment variables:

```bash
# USDA FoodData Central
USDA_API_KEY=your_key_here

# Instacart Connect (after approval)
INSTACART_CLIENT_ID=your_client_id
INSTACART_CLIENT_SECRET=your_client_secret
INSTACART_REDIRECT_URI=https://yourdomain.com/callback/instacart

# Amazon Associates (after approval)
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_ASSOCIATE_TAG=your_tag
AMAZON_PARTNER_TYPE=Associates
AMAZON_MARKETPLACE=us-east-1

# Spoonacular
SPOONACULAR_API_KEY=your_key_here

# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/callback/google
GOOGLE_PROJECT_ID=your_project_id

# Edamam (Phase 3)
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key
```

---

## Tracking Registration Status

| Service | Priority | Registration Status | Approval Time | Actions Remaining |
|---------|----------|---------------------|---------------|-------------------|
| USDA FoodData Central | P0 | ? Not Started | ? Immediate | Register API key |
| Instacart Connect | P0 | ? Not Started | ? 1-2 weeks | Apply for partnership |
| Amazon Associates | P1 | ? Not Started | ? 1-2 weeks | Apply for program |
| Spoonacular | P1 | ? Not Started | ? Immediate | Sign up and subscribe |
| Google Calendar | P1 | ? Not Started | ? 1 day | Set up OAuth |
| Edamam | P1 | ?? Deferred | ? Immediate | Defer to Phase 3 |
| Open Food Facts | P1 | ? Ready | N/A | No registration needed |
| USDA Price Database | P1 | ? Ready | N/A | No registration needed |

---

## Notes

- **Total Services Requiring Registration**: 6 (2 critical, 4 high priority)
- **Immediate Registrations** (can do today): 3 (USDA, Spoonacular, Google Calendar setup)
- **Delayed Registrations** (1-2 week approval): 2 (Instacart, Amazon)
- **Deferred**: 1 (Edamam)

**Recommendation**: Start with immediate registrations (USDA, Spoonacular, Google Calendar) while waiting for Instacart and Amazon approvals.

---

**Last Updated**: 2025-01-21  
**Next Review**: After completing immediate registrations
