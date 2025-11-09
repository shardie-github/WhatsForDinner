# Experiment: Retention Email Campaign

**Slug:** `retention-email-campaign`  
**Status:** Ready to start  
**Created:** 2025-01-09  
**Owner:** Growth Team + Marketing Team

---

## Hypothesis

**If** we send targeted retention emails to users at risk of churning,  
**Then** we can increase 30-day retention by 15-20% and extend LTV,  
**Because** proactive engagement will re-engage inactive users and demonstrate ongoing value.

---

## Success Metrics

### Primary Metric
- **30-Day Retention Rate:** % of users active 30 days after signup
- **Metric Name:** `retention_30d` (custom cohort metric)
- **Baseline:** Current 30-day retention (to be measured)
- **Target:** 15-20% improvement

### Secondary Metrics
- **Email Open Rate:** % of emails opened
- **Email Click-Through Rate:** % of emails with clicks
- **Re-engagement Rate:** % of inactive users who return after email
- **LTV:** Lifetime value improvement

---

## Success Threshold

**Primary:** 15% improvement in 30-day retention rate  
**Timeline:** 30 days to measure retention impact  
**Minimum Sample Size:** 500 users per variant (email vs. no email)

---

## Sample Size Heuristic

**Current Retention:** ~60% (estimated, to be validated)  
**Target Improvement:** 15% (60% → 69%)  
**Statistical Power:** 80%  
**Significance Level:** 5%  
**Required Sample Size:** ~500 users per variant (1,000 total)

**Estimated Duration:** 30 days to measure retention impact

---

## Rollout Plan

### Phase 1: Setup & Design (Days 1-5)
1. Set up email automation platform (SendGrid, Mailchimp, etc.)
2. Design email templates (welcome series, re-engagement, value tips)
3. Define user segments (at-risk, inactive, new users)
4. Set up tracking for email events

### Phase 2: A/B Test Launch (Days 6-10)
1. Launch A/B test: Email campaign vs. control (no emails)
2. 50/50 split of users
3. Monitor email delivery and open rates
4. Track initial engagement

### Phase 3: Measurement (Days 11-30)
1. Monitor retention rates daily
2. Track email engagement metrics
3. Measure re-engagement rate
4. Calculate LTV impact

### Phase 4: Analysis & Rollout (Day 30+)
1. Compare retention rates (email vs. control)
2. Analyze LTV impact
3. If successful: Roll out to 100%
4. If unsuccessful: Iterate on email content/timing

---

## Rollback Plan

**Trigger Conditions:**
- Retention rate decreases by > 5% vs. baseline
- Unsubscribe rate > 5%
- User complaints about email frequency
- Negative impact on engagement

**Rollback Steps:**
1. Immediately pause email campaign
2. Analyze root cause (content, timing, frequency)
3. Adjust email strategy
4. Retest with improvements

**Rollback Time:** < 1 hour (pause automation)

---

## Dependencies

- **Tables:** `events`, `experiments`, user activity tracking
- **Email Platform:** SendGrid, Mailchimp, or similar
- **Tracking:** Email open/click tracking, user activity events
- **Segmentation:** User activity data for segmentation

---

## Risk Assessment

**Risk Level:** Low-Medium  
**Risks:**
- Email fatigue (too many emails)
- Unsubscribe rate increase
- Negative user sentiment
- Spam folder delivery

**Mitigation:**
- Start with low frequency (1-2 emails/week)
- Provide clear unsubscribe option
- Monitor unsubscribe and complaint rates
- Test email deliverability
- Personalize content based on user behavior

---

## Expected Financial Impact

**30-Day Impact:**
- Retention improvement: 15-20%
- LTV increase: Proportional to retention improvement
- Email cost: Minimal (email platform costs)

**90-Day Impact:**
- Sustained retention improvement
- Extended customer lifetime
- Improved LTV:CAC ratio
- Better unit economics

---

## Measurement Plan

### Daily Monitoring
- Email delivery rate
- Email open rate
- Email click-through rate
- User activity (email recipients vs. control)

### Weekly Review
- Retention rate comparison
- Re-engagement rate
- Unsubscribe rate
- User feedback

### 30-Day Review
- Final retention rate comparison
- LTV impact calculation
- Email campaign ROI
- Rollout decision

---

## Email Campaign Details

### Email Sequence
1. **Welcome Email (Day 0):** Product overview, getting started guide
2. **Value Tip Email (Day 3):** Feature highlight, use case example
3. **Re-engagement Email (Day 7):** For inactive users, personalized content
4. **Success Story Email (Day 14):** Customer testimonial, social proof
5. **Advanced Tips Email (Day 21):** Advanced features, best practices

### Segmentation
- **New Users:** Welcome series
- **Inactive Users (7+ days):** Re-engagement emails
- **At-Risk Users:** Targeted retention emails
- **Active Users:** Value-add emails (lower frequency)

---

## Notes

- Focus on value, not promotion
- Personalize based on user behavior
- Test different send times and frequencies
- Monitor unsubscribe and complaint rates
- Consider mobile vs. desktop email rendering

---

**Next Steps:**
1. Set up email platform
2. Design email templates
3. Define user segments
4. Launch A/B test
5. Monitor and measure
