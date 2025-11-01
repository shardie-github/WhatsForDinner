# Critical and High Priority Services - Complete Configuration

**Date**: 2025-01-21  
**Status**: Configuration Complete  
**All services documented with cost factors and autoscaling**

---

## Executive Summary

This document provides a comprehensive configuration for all critical (P0) and high priority (P1) services identified in the premium product gaps analysis. Each service includes:
- ? Cost factor analysis
- ? Autoscaling configuration
- ? Implementation status
- ? Manual registration requirements (marked where needed)

---

## Service Configuration Status

### ? Critical Priority (P0) Services

#### 1. USDA FoodData Central API
- **Status**: ? **Pending Manual Registration**
- **Cost Factor**: **FREE** (0$/month)
  - Rate limit: 1000 requests/hour, 10,000/day
  - No cost per request
- **Autoscaling**: ? **Configured**
  - Strategy: Rate limit aware
  - Cache TTL: 7 days
  - Min: 10 req/min, Max: 16 req/min
  - Scale up: 80% threshold, Scale down: 30% threshold
- **Manual Registration Required**: ? **YES**
  - Steps: Visit https://fdc.nal.usda.gov/api-guide.html, register for API key
  - Estimated approval: Immediate (1 hour)
  - **Action**: Add `USDA_API_KEY` to environment variables

#### 2. Instacart Connect API
- **Status**: ? **Pending Manual Registration**
- **Cost Factor**: **REVENUE SHARE** (0$/month upfront)
  - Commission: 5% of order value
  - No setup fees or monthly fees
  - Revenue opportunity: High
- **Autoscaling**: ? **Configured**
  - Strategy: Demand based
  - Cache TTL: 1 hour
  - Min: 5 req/min, Max: 60 req/min
  - Scale up: 70% threshold, Scale down: 20% threshold
- **Manual Registration Required**: ? **YES - REQUIRES PARTNERSHIP APPROVAL**
  - Steps: Apply at https://www.instacart.com/partners/connect
  - Estimated approval: **1-2 weeks** (business verification required)
  - **Action**: Complete business verification, submit integration proposal
  - **Blockers**: Partnership approval process

#### 3. Weekly Meal Plan Generator
- **Status**: ? **Implementation Pending**
- **Cost Factor**: **NO EXTERNAL COSTS**
  - Uses internal recipe generation API
  - Cost: Compute only (Vercel serverless)
- **Autoscaling**: ? **Platform Managed**
  - Vercel handles autoscaling automatically
  - Scale to zero enabled
- **Manual Registration Required**: ? **NO**
  - Pure implementation task

#### 4. Cost Calculator Service
- **Status**: ? **Implementation Pending**
- **Cost Factor**: **MINIMAL** (~$0.05/month)
  - Uses USDA Price Database (free public data)
  - Storage cost: ~$0.05/month for 2GB
- **Autoscaling**: ? **Configured**
  - Strategy: Data refresh (monthly updates)
  - Cache TTL: 30 days
- **Manual Registration Required**: ? **NO**
  - Uses public USDA data files

#### 5. Pantry Intelligence
- **Status**: ? **Implementation Pending**
- **Cost Factor**: **NO EXTERNAL COSTS**
  - Internal feature using existing database
- **Autoscaling**: ? **Platform Managed**
  - Supabase handles database scaling
- **Manual Registration Required**: ? **NO**

---

### ? High Priority (P1) Services

#### 6. Amazon Associates API
- **Status**: ? **Pending Manual Registration**
- **Cost Factor**: **COMMISSION-BASED** (0$/month)
  - Commission: 4% of sales
  - No API costs
  - Revenue opportunity: Medium
- **Autoscaling**: ? **Configured**
  - Strategy: Rate limit aware (strict: 1 req/min)
  - Cache TTL: 24 hours
  - Very conservative scaling due to strict rate limits
- **Manual Registration Required**: ? **YES**
  - Steps: Apply at https://affiliate-program.amazon.com/
  - Estimated approval: **1-2 weeks**
  - **Action**: Apply for Associates program, wait for approval

#### 7. Spoonacular Recipe API
- **Status**: ? **Pending Manual Registration**
- **Cost Factor**: **SUBSCRIPTION** ($149/month)
  - Medium tier: $149/month
  - 15,000 requests/day included
  - Overage: $0.01 per request
- **Autoscaling**: ? **Configured**
  - Strategy: Budget aware
  - Daily budget limit: 15,000 requests
  - Scale up: 60% threshold, Scale down: 30% threshold
  - Cache TTL: 30 days (aggressive caching)
- **Manual Registration Required**: ? **YES**
  - Steps: Sign up at https://spoonacular.com/food-api
  - Choose subscription tier
  - Estimated approval: Immediate
  - **Action**: Sign up and add API key

#### 8. Google Calendar API
- **Status**: ? **Pending Manual Registration**
- **Cost Factor**: **FREE**
  - Free tier with 1M requests/day quota
  - No cost for calendar sync use case
- **Autoscaling**: ? **Configured**
  - Strategy: Quota aware
  - Min: 1 req/min, Max: 60 req/min
  - Scale up: 70% threshold, Scale down: 20% threshold
  - Cache TTL: 5 minutes
- **Manual Registration Required**: ? **YES**
  - Steps:
    1. Create Google Cloud Project
    2. Enable Calendar API
    3. Create OAuth 2.0 credentials
    4. Configure OAuth consent screen
  - Estimated approval: Immediate (OAuth setup)
  - **Action**: Set up Google Cloud project and OAuth

#### 9. Open Food Facts API
- **Status**: ? **Ready for Implementation**
- **Cost Factor**: **FREE**
  - Completely free, open source
  - Respectful rate limiting: 5 requests/second
- **Autoscaling**: ? **Configured**
  - Strategy: Rate limit aware
  - Min: 1 req/min, Max: 5 req/min (strict)
  - Scale up: 50% threshold, Scale down: 20% threshold
  - Cache TTL: 24 hours
- **Manual Registration Required**: ? **NO**
  - **Action**: Can implement immediately

#### 10. Edamam Food API (Optional)
- **Status**: ? **Pending Manual Registration** (Defer to Phase 3)
- **Cost Factor**: **FREEMIUM**
  - Free tier: 5,000 requests/month
  - Paid tier: $99/month for 50,000 requests/month
- **Autoscaling**: ? **Configured**
  - Strategy: Tier aware
  - Monthly budget limit: 5,000 (free tier)
  - Cache TTL: 7 days
- **Manual Registration Required**: ? **YES** (but defer)
  - Priority: P2 (defer to Phase 3)
  - **Action**: Defer implementation

---

## Already Configured Services

### ? Vercel Hosting (P0)
- **Status**: ? **Configured**
- **Cost**: $20/month (Pro tier)
- **Autoscaling**: Platform managed (automatic)
- **No action needed**

### ? Supabase Database (P0)
- **Status**: ? **Configured**
- **Cost**: $25/month (Pro tier)
- **Autoscaling**: Platform managed (automatic)
- **Action**: Configure connection pooling (optional optimization)

### ? OpenAI API (P0)
- **Status**: ? **Configured**
- **Cost**: ~$100/month (usage-based)
- **Autoscaling**: Cost-optimized (prefers gpt-4o-mini)
- **Action**: Monitor token usage, optimize with caching

### ? Stripe Payments (P0)
- **Status**: ? **Configured**
- **Cost**: Transaction-based (2.9% + $0.30)
- **Autoscaling**: Platform managed (automatic)
- **No action needed**

---

## Cost Summary

| Category | Monthly Cost | Notes |
|----------|--------------|-------|
| **Existing Services** | $145 | Vercel ($20) + Supabase ($25) + OpenAI ($100) |
| **New Critical Services (P0)** | $0.05 | USDA Price Database storage |
| **New High Priority Services (P1)** | $149 | Spoonacular subscription |
| **Total Monthly Cost** | **$294.05** | Excluding revenue opportunities |

### Revenue Opportunities
- **Instacart**: 5% commission on grocery orders
- **Amazon Associates**: 4% commission on product sales

---

## Autoscaling Summary

### ? All Services Configured with Autoscaling

| Strategy | Services | Notes |
|----------|----------|-------|
| Rate Limit Aware | 5 services | USDA, Amazon, Open Food Facts, etc. |
| Platform Managed | 4 services | Vercel, Supabase, Stripe, OpenAI |
| Demand Based | 1 service | Instacart |
| Budget Aware | 1 service | Spoonacular |
| Cost Optimized | 1 service | OpenAI (model selection) |

### Implementation Status
- ? **Autoscaling configurations**: Complete
- ? **Implementation**: Pending (requires service registration first)
- ? **Monitoring**: Need to set up rate limit tracking
- ? **Budget alerts**: Need to configure cost monitoring

---

## Manual Registration Requirements

### ?? Services Requiring Manual Registration

#### ?? Critical Priority (P0) - 1 Service
1. **Instacart Connect** 
   - ? **Status**: Not started
   - ? **Estimated Approval**: 1-2 weeks
   - ?? **Actions**:
     - [ ] Apply for partnership program
     - [ ] Complete business verification
     - [ ] Submit integration proposal
     - [ ] Wait for approval
     - [ ] Receive OAuth credentials
     - [ ] Add to environment variables
   - ?? **BLOCKER**: Partnership approval required before implementation

#### ?? High Priority (P1) - 4 Services
2. **Amazon Associates**
   - ? **Status**: Not started
   - ? **Estimated Approval**: 1-2 weeks
   - ?? **Actions**:
     - [ ] Apply for Associates program
     - [ ] Wait for approval
     - [ ] Create Product Advertising API credentials
     - [ ] Add credentials to environment variables

3. **Spoonacular**
   - ? **Status**: Not started
   - ? **Estimated Approval**: Immediate
   - ?? **Actions**:
     - [ ] Sign up at spoonacular.com
     - [ ] Choose subscription tier (Medium: $149/month)
     - [ ] Receive API key
     - [ ] Add `SPOONACULAR_API_KEY` to environment variables

4. **Google Calendar**
   - ? **Status**: Not started
   - ? **Estimated Approval**: Immediate (OAuth setup)
   - ?? **Actions**:
     - [ ] Create Google Cloud Project
     - [ ] Enable Calendar API
     - [ ] Create OAuth 2.0 credentials
     - [ ] Configure OAuth consent screen
     - [ ] Add credentials to environment variables

5. **Edamam** (Deferred)
   - ? **Status**: Deferred to Phase 3
   - ?? **Action**: Skip for now, implement in Phase 3

#### ?? No Registration Required - 2 Services
6. **USDA FoodData Central** - ?? **Requires API key registration** (free, immediate)
   - ?? **Actions**:
     - [ ] Visit https://fdc.nal.usda.gov/api-guide.html
     - [ ] Register for free API key
     - [ ] Add `USDA_API_KEY` to environment variables

7. **Open Food Facts** - ? **No registration needed**
   - ?? **Action**: Can implement immediately

---

## Implementation Priority Order

### Week 1: Immediate Actions (No Registration Blockers)
1. ? **USDA FoodData Central** - Register API key (1 hour)
2. ? **Open Food Facts** - Implement immediately
3. ? **Cost Calculator** - Implement (uses public data)
4. ? **Pantry Intelligence** - Implement (internal feature)

### Week 2-3: Manual Registration Required
5. ? **Google Calendar** - Set up OAuth (1 day)
6. ? **Spoonacular** - Sign up and get API key (1 hour)
7. ? **Amazon Associates** - Apply (wait 1-2 weeks)
8. ? **Instacart Connect** - Apply for partnership (wait 1-2 weeks)

---

## Next Steps

### Immediate (This Week)
- [ ] Register for USDA API key
- [ ] Set up Google Calendar OAuth credentials
- [ ] Sign up for Spoonacular subscription
- [ ] Implement Open Food Facts integration (no blocker)
- [ ] Start implementing cost calculator and pantry intelligence

### Short Term (Next 2 Weeks)
- [ ] Apply for Amazon Associates program
- [ ] Apply for Instacart Connect partnership
- [ ] Set up cost monitoring dashboard
- [ ] Implement rate limit monitoring for all services
- [ ] Configure budget alerts

### Medium Term (Next Month)
- [ ] Complete all manual registrations
- [ ] Implement all service integrations
- [ ] Test autoscaling configurations
- [ ] Monitor costs and optimize

---

## Files Generated

1. **`/config/service-config.json`** - Complete service configuration with:
   - Cost factors for all services
   - Autoscaling configurations
   - Manual registration requirements
   - Environment variables needed

2. **`CRITICAL_HIGH_PRIORITY_SERVICES_SUMMARY.md`** (this file) - Human-readable summary

---

## Notes

- ? All critical and high priority services have cost factors documented
- ? All services have autoscaling configurations
- ? 6 services require manual registration (2 critical, 4 high priority)
- ? 2 services can be implemented immediately (USDA API key registration, Open Food Facts)
- ?? 2 services require partnership approval (Instacart, Amazon) - estimated 1-2 weeks

**Total Estimated Monthly Cost**: $294.05  
**Revenue Opportunities**: 5% (Instacart) + 4% (Amazon) commissions

---

**Last Updated**: 2025-01-21  
**Next Review**: After manual registrations complete
