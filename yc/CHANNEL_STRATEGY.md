# Channel Strategy: What's for Dinner

**Purpose**: Explicit "how users discover us" strategy  
**Last Updated**: 2025-01-27

---

## Channel Prioritization Framework

**Criteria**: CAC, Conversion Rate, Scalability, Time to Results

---

## Primary Channel: SEO (Organic Search)

### Strategy
**Target Keywords**: "what to make with [ingredients]"  
**Approach**: Create dynamic SEO landing pages for high-value keywords  
**Timeline**: Month 1-3 (long-term growth)

### Why This Channel?
- **CAC**: $0 (organic traffic)
- **Conversion Rate**: 10%+ (high intent)
- **Scalability**: High (1M+ monthly searches)
- **Time to Results**: 3-6 months (SEO takes time)

### Implementation
- Create SEO landing pages (`/apps/web/src/app/recipes/what-to-make-with/[ingredients]/page.tsx`)
- Target top 10 keywords (chicken and rice, eggs, etc.)
- Add SEO metadata, structured data
- Create blog content around keywords

### Success Metrics
- **Traffic**: 1,000+ organic visitors/month
- **Signups**: 100+ signups/month
- **Rankings**: Top 10 for 5+ keywords

---

## Secondary Channel: Referrals (Viral Loops)

### Strategy
**Approach**: Referral program (1 month free for referrer + referee)  
**Timeline**: Week 1-2 (quick launch)

### Why This Channel?
- **CAC**: $0 (viral growth)
- **Conversion Rate**: 30%+ (higher than organic)
- **Scalability**: High (viral coefficient > 0.2)
- **Time to Results**: 1-2 weeks (quick launch)

### Implementation
- Build referral UI (`/apps/web/src/app/referrals/page.tsx`)
- Launch referral program (Week 1-2)
- Track viral coefficient, conversion rate

### Success Metrics
- **Viral Coefficient**: 0.2+ (20% of users refer 1 person)
- **Referrals**: 2K users (20% × 10K users)
- **Conversion**: 30%+ (referral signups convert)

---

## Tertiary Channel: Social Media (TikTok, Instagram)

### Strategy
**Approach**: Shareable recipe cards, viral content  
**Timeline**: Week 5-6 (after core product stable)

### Why This Channel?
- **CAC**: $5-10 (content creation)
- **Conversion Rate**: 5%+ (social traffic)
- **Scalability**: Medium (requires content creation)
- **Time to Results**: 2-4 weeks (content takes time)

### Implementation
- Add social sharing buttons (`/apps/web/src/components/recipe/RecipeCard.tsx`)
- Create shareable recipe cards (images)
- Post content (TikTok, Instagram)

### Success Metrics
- **Shares**: 10x increase
- **Signups**: 50+ signups/month
- **Conversion**: 5%+ (signups / shares)

---

## Channel Performance Tracking

### Metrics by Channel

**SEO**:
- Traffic: [TO FILL] visitors/month
- Signups: [TO FILL] signups/month
- CAC: $0
- Conversion: [TO FILL]%

**Referrals**:
- Referrals: [TO FILL] referrals/month
- Signups: [TO FILL] signups/month
- CAC: $0
- Conversion: [TO FILL]%

**Social Media**:
- Shares: [TO FILL] shares/month
- Signups: [TO FILL] signups/month
- CAC: $5-10
- Conversion: [TO FILL]%

---

## Channel Strategy Summary

### Phase 1: Quick Wins (Month 1)
- **Referrals**: Launch referral program (Week 1-2)
- **Social**: Add social sharing (Week 5-6)

### Phase 2: Long-Term Growth (Month 2-3)
- **SEO**: Implement SEO landing pages (Week 3-4)
- **Content**: Create blog content (ongoing)

### Phase 3: Scale (Month 4+)
- **Paid Ads**: Test paid channels (Google Ads, Facebook Ads)
- **Partnerships**: Grocery apps, wellness platforms

---

**Next Steps**:
1. Prioritize channels (start with referrals, SEO)
2. Implement channel tracking (UTM parameters)
3. Measure performance by channel
4. Optimize based on results
