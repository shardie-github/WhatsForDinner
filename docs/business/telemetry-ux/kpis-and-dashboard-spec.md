# KPIs and Dashboard Spec

**What's for Dinner? — KPI Definitions and Dashboard Wireframe**

## Overview

This document defines key performance indicators (KPIs) and dashboard specifications for **What's for Dinner?**, including metrics, targets, and dashboard wireframe.

**Update Frequency**: Real-time (dashboard), Weekly (reports)  
**Dashboard Access**: Internal (founder, team)

---

## Core KPIs

### 1. User Growth

**Metric**: Total Users, New Users  
**Target**: 1,000+ users (Month 6), 2,000+ users (Month 12)  
**Update Frequency**: Daily  
**Dashboard Widget**: Line chart (user growth over time)

---

### 2. Retention

**Metric**: 7-Day Retention, 30-Day Retention  
**Target**: 40%+ 7-day retention, 25%+ 30-day retention  
**Update Frequency**: Daily  
**Dashboard Widget**: Retention curve, cohort retention table

---

### 3. Revenue

**Metric**: Monthly Recurring Revenue (MRR), Average Revenue Per User (ARPU)  
**Target**: CAD $5K+ MRR (Month 6), CAD $12+ ARPU  
**Update Frequency**: Daily  
**Dashboard Widget**: MRR chart, ARPU gauge

---

### 4. Engagement

**Metric**: Weekly Active Users (WAU), Daily Active Users (DAU)  
**Target**: 60%+ WAU, 30%+ DAU  
**Update Frequency**: Daily  
**Dashboard Widget**: WAU/DAU chart, engagement rate

---

### 5. Conversion

**Metric**: Free-to-Paid Conversion Rate  
**Target**: 5%+ conversion rate  
**Update Frequency**: Daily  
**Dashboard Widget**: Conversion funnel, conversion rate gauge

---

### 6. Customer Acquisition Cost (CAC)

**Metric**: Blended CAC, Organic CAC, Paid CAC  
**Target**: CAD $25-35 blended CAC  
**Update Frequency**: Weekly  
**Dashboard Widget**: CAC by channel, CAC trend

---

### 7. Lifetime Value (LTV)

**Metric**: LTV, LTV/CAC Ratio  
**Target**: CAD $144 LTV, 4x+ LTV/CAC ratio  
**Update Frequency**: Weekly  
**Dashboard Widget**: LTV calculation, LTV/CAC ratio

---

### 8. Value Delivered

**Metric**: Time Saved, Cost Saved, Food Waste Reduction  
**Target**: 12+ minutes/day time saved, CAD $200+ monthly cost saved, 31%+ waste reduction  
**Update Frequency**: Weekly  
**Dashboard Widget**: Value metrics, user testimonials

---

## Dashboard Wireframe

### Layout

**Top Row** (Key Metrics):
- **Total Users**: [Number] users (+[Number] from last week)
- **MRR**: CAD $[Amount] (+CAD $[Amount] from last week)
- **7-Day Retention**: [Percentage]%
- **Conversion Rate**: [Percentage]%

**Second Row** (Charts):
- **User Growth Chart**: Line chart (total users over time)
- **MRR Chart**: Line chart (MRR over time)
- **Retention Curve**: Retention curve (7-day, 30-day)

**Third Row** (Engagement):
- **WAU/DAU Chart**: Bar chart (weekly active users, daily active users)
- **Engagement Rate**: Gauge (WAU/Total Users)
- **Usage Metrics**: Table (meal suggestions, grocery lists, recipes)

**Fourth Row** (Financial):
- **CAC by Channel**: Bar chart (organic, paid, referral)
- **LTV/CAC Ratio**: Gauge (LTV/CAC ratio)
- **Revenue Breakdown**: Pie chart (Free, Starter, Pro)

**Fifth Row** (Value):
- **Time Saved**: Average time saved per user
- **Cost Saved**: Average cost saved per user
- **Food Waste Reduction**: Average waste reduction per user

---

## Dashboard Tools

### Recommended Tools

**Option 1**: PostHog (Self-Hosted)
- **Pros**: Open source, privacy-friendly, Canadian data residency
- **Cons**: Requires self-hosting

**Option 2**: Mixpanel (Canadian Data Residency)
- **Pros**: Easy to use, powerful analytics
- **Cons**: Paid (costs scale with users)

**Option 3**: Custom Dashboard (Supabase + Charts)
- **Pros**: Full control, no vendor lock-in
- **Cons**: Requires development time

**Recommendation**: **PostHog** (self-hosted) or **Mixpanel** (if budget allows)

---

## Event Tracking Schema

### Events to Track

**User Events**:
- `user_signed_up` (user_id, email, source)
- `user_subscribed` (user_id, plan, price)
- `user_cancelled` (user_id, reason)

**Product Events**:
- `meal_suggested` (user_id, meal_id, preferences)
- `meal_planned` (user_id, meal_id, date)
- `grocery_list_generated` (user_id, store, items_count)
- `recipe_viewed` (user_id, recipe_id)

**Engagement Events**:
- `app_opened` (user_id, platform)
- `feature_used` (user_id, feature_name)
- `search_performed` (user_id, query)

---

## Reporting

### Weekly Report

**Sections**:
- User growth (total users, new users, growth rate)
- Retention (7-day, 30-day retention, churn rate)
- Revenue (MRR, ARPU, conversion rate)
- Engagement (WAU, DAU, usage metrics)
- Financial (CAC, LTV, LTV/CAC ratio)

**Format**: Email or PDF report

---

### Monthly Report

**Sections**:
- Executive summary (key metrics, highlights)
- User growth (trends, segments)
- Retention (cohort analysis, churn analysis)
- Revenue (MRR trends, ARPU trends)
- Engagement (usage trends, feature adoption)
- Financial (unit economics, CAC/LTV)
- Value delivered (time saved, cost saved, waste reduction)

**Format**: PDF report (for investors, stakeholders)

---

## Conclusion

**Dashboard Purpose**: Track key metrics, monitor performance, make data-driven decisions.

**Key Metrics**: User growth, retention, revenue, engagement, conversion, CAC, LTV, value delivered.

**Success Criteria**: 1,000+ users, 40%+ 7-day retention, CAD $5K+ MRR, 4x+ LTV/CAC ratio.

---

*Last Updated: [Auto-generated via CI]*
