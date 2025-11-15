# Grocery API Keys Configuration Guide

This document outlines the API keys and credentials needed for grocery store integrations.

## Required API Keys

### ✅ Free Tier Available

#### Walmart Canada
- **API Key**: `NEXT_PUBLIC_WALMART_API_KEY`
- **Where to get**: https://developer.walmartlabs.com/
- **Status**: ✅ Free tier available
- **Rate Limit**: 1 request/second (free tier)
- **Setup**: 
  1. Sign up at https://developer.walmartlabs.com/
  2. Get your API key
  3. Add to `.env`: `NEXT_PUBLIC_WALMART_API_KEY=your_key_here`
  4. Enable: `NEXT_PUBLIC_WALMART_ENABLED=true`

#### Walmart Affiliate Program
- **Affiliate ID**: `NEXT_PUBLIC_WALMART_AFFILIATE_ID`
- **Where to get**: https://affiliates.walmart.com/
- **Status**: ✅ Free to join
- **Commission**: 4% average

### ⚠️ Requires Application/Partnership

#### Loblaws / PC Express
- **API Key**: `NEXT_PUBLIC_LOBLAWS_API_KEY` (if available)
- **Affiliate ID**: `NEXT_PUBLIC_LOBLAWS_AFFILIATE_ID`
- **Status**: ⚠️ No public API, affiliate program available
- **Setup**:
  1. Apply for Loblaws affiliate program
  2. Add affiliate ID: `NEXT_PUBLIC_LOBLAWS_AFFILIATE_ID=your_id`
  3. Enable: `NEXT_PUBLIC_LOBLAWS_ENABLED=true`
- **Note**: Currently uses deep linking to PC Express app

#### Metro
- **API Key**: `NEXT_PUBLIC_METRO_API_KEY` (if available)
- **Affiliate ID**: `NEXT_PUBLIC_METRO_AFFILIATE_ID`
- **Status**: ⚠️ No public API, check for partner program
- **Setup**:
  1. Contact Metro for partnership opportunities
  2. Add affiliate ID if available
  3. Enable: `NEXT_PUBLIC_METRO_ENABLED=true`

#### Sobeys
- **API Key**: `NEXT_PUBLIC_SOBEYS_API_KEY` (if available)
- **Affiliate ID**: `NEXT_PUBLIC_SOBEYS_AFFILIATE_ID`
- **Status**: ⚠️ No public API, check for partner program
- **Setup**:
  1. Contact Sobeys for partnership opportunities
  2. Add affiliate ID if available
  3. Enable: `NEXT_PUBLIC_SOBEYS_ENABLED=true`

## Environment Variables

Add these to your `.env.local` file:

```bash
# Walmart (Free API Available)
NEXT_PUBLIC_WALMART_ENABLED=true
NEXT_PUBLIC_WALMART_API_KEY=your_walmart_api_key
NEXT_PUBLIC_WALMART_AFFILIATE_ID=your_affiliate_id

# Loblaws (Affiliate Only)
NEXT_PUBLIC_LOBLAWS_ENABLED=true
NEXT_PUBLIC_LOBLAWS_AFFILIATE_ID=your_affiliate_id

# Metro (Affiliate Only)
NEXT_PUBLIC_METRO_ENABLED=true
NEXT_PUBLIC_METRO_AFFILIATE_ID=your_affiliate_id

# Sobeys (Affiliate Only)
NEXT_PUBLIC_SOBEYS_ENABLED=true
NEXT_PUBLIC_SOBEYS_AFFILIATE_ID=your_affiliate_id
```

## Current Implementation Status

### ✅ Fully Implemented
- Walmart Canada (with free API support)
- Base adapter architecture
- Product search
- Cart creation
- Category system

### ⚠️ Partial Implementation (Affiliate Links)
- Loblaws (PC Express deep linking)
- Metro (affiliate links)
- Sobeys (affiliate links)

### 📋 To Do
- [ ] Apply for Walmart API key (free)
- [ ] Apply for Loblaws affiliate program
- [ ] Contact Metro for partnership
- [ ] Contact Sobeys for partnership
- [ ] Implement full API integrations when available
- [ ] Add price comparison feature
- [ ] Add inventory checking

## Testing Without API Keys

The system will work with affiliate links even without API keys:
- Product search returns placeholder results
- Cart creation generates affiliate links
- Deep linking to store apps/websites works

## Next Steps

1. **Immediate**: Get Walmart API key (free, takes 5 minutes)
2. **Short-term**: Apply for affiliate programs
3. **Long-term**: Establish partnerships for full API access

## Support

For API key issues or partnership inquiries, contact:
- Walmart: https://developer.walmartlabs.com/support
- Loblaws: Contact through affiliate program
- Metro: Contact business development
- Sobeys: Contact business development
