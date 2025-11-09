# Retention Email Campaign

**Owner:** Marketing Team + Growth Team  
**Status:** Ready  
**Priority:** High  
**Impact × Confidence ÷ Effort:** 7.0

---

## Objective

Send targeted retention emails to users at risk of churning to increase 30-day retention by 15-20% and extend LTV.

**Why it matters:** Improved retention directly increases LTV, improves LTV:CAC ratio, and extends customer lifetime value, leading to better unit economics.

---

## Steps

1. **Set up email automation platform**
   - Choose platform (SendGrid, Mailchimp, etc.)
   - Configure API keys and webhooks
   - Set up email templates

2. **Design email templates**
   - Welcome email (Day 0)
   - Value tip email (Day 3)
   - Re-engagement email (Day 7)
   - Success story email (Day 14)
   - Advanced tips email (Day 21)

3. **Define user segments**
   - New users (welcome series)
   - Inactive users (7+ days, re-engagement)
   - At-risk users (targeted retention)
   - Active users (value-add, lower frequency)

4. **Set up tracking**
   - Email open/click tracking
   - User activity event tracking
   - Retention cohort tracking

5. **Launch A/B test (50/50 split)**
   - Variant A: No retention emails (control)
   - Variant B: Retention email campaign (treatment)
   - Monitor email delivery and engagement

6. **Measure and analyze (30 days)**
   - Track retention rates daily
   - Monitor email engagement metrics
   - Measure re-engagement rate
   - Calculate LTV impact

7. **Make rollout decision**
   - If successful: Roll out to 100%
   - If unsuccessful: Iterate on email content/timing

---

## Dependencies

- **Tables:** `events`, `experiments`, user activity tracking
- **Email Platform:** SendGrid, Mailchimp, or similar
- **Tracking:** Email open/click tracking, user activity events
- **Segmentation:** User activity data for segmentation

---

## KPI

**Primary:** 15% improvement in 30-day retention rate  
**Secondary:** Email open rate > 30%, click-through rate > 5%, re-engagement rate increase  
**30-day signal:** Retention rate trending upward, email engagement healthy

---

## Done When

- [ ] Email platform set up and configured
- [ ] Email templates designed and implemented
- [ ] User segments defined
- [ ] A/B test launched
- [ ] 30-day retention improved by 15% or more
- [ ] LTV impact calculated
- [ ] Rollout decision made

---

## Risk Assessment

**Risk Level:** Low-Medium  
**Mitigation:** Start with low frequency (1-2 emails/week), monitor unsubscribe rates, provide clear unsubscribe option, test email deliverability

---

## Estimated Effort

- **Email Platform Setup:** 1-2 days
- **Template Design:** 2-3 days
- **Segmentation Setup:** 1-2 days
- **Tracking Setup:** 1-2 days
- **Monitoring:** Ongoing (1 hour/day)

**Total:** ~5-9 days + ongoing monitoring
