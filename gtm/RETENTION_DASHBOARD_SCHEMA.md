# Retention Dashboard Schema
## What's for Dinner: Metrics, Formulas & Tracking

**Purpose:** Comprehensive retention analytics framework for measuring engagement, growth, and advocacy  
**Tools:** Supabase Analytics, Custom Dashboards, SQL Queries  
**Update Frequency:** Real-time (key metrics), Daily (aggregates), Weekly (reports)

---

## 📊 Core Retention Metrics

### 1. Engaged Retention Rate (ERR)

**Definition:** Percentage of Daily Active Users (DAU) who perform key actions 3+ times per week

**Formula:**
```sql
ERR = (DAU with 3+ key actions in past 7 days) / (Total DAU)
```

**Key Actions:**
- Meal plan created/updated
- Recipe viewed/saved
- Grocery list generated
- Meal plan shared

**Target:** 35%+ by Month 6, 40%+ by Month 12

**SQL Query (Supabase):**
```sql
WITH weekly_actions AS (
  SELECT 
    user_id,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(*) as action_count
  FROM analytics_events
  WHERE event_type IN ('meal_plan_created', 'meal_plan_updated', 'recipe_viewed', 'recipe_saved', 'grocery_list_generated', 'meal_plan_shared')
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY user_id
),
engaged_users AS (
  SELECT user_id
  FROM weekly_actions
  WHERE action_count >= 3
),
total_dau AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  (SELECT COUNT(*) FROM engaged_users)::float / 
  NULLIF((SELECT total FROM total_dau), 0)::float * 100 as err_percentage;
```

---

### 2. Activation Rate

**Definition:** Percentage of new users who complete first meal plan within 24 hours

**Formula:**
```sql
Activation Rate = (Users who complete first meal plan within 24h) / (Total new users)
```

**Target:** 60%+

**SQL Query:**
```sql
WITH new_users AS (
  SELECT user_id, created_at as signup_date
  FROM users
  WHERE created_at >= NOW() - INTERVAL '30 days'
),
activated_users AS (
  SELECT DISTINCT nu.user_id
  FROM new_users nu
  JOIN analytics_events ae ON nu.user_id = ae.user_id
  WHERE ae.event_type = 'meal_plan_completed'
    AND ae.created_at <= nu.signup_date + INTERVAL '24 hours'
)
SELECT 
  (SELECT COUNT(*) FROM activated_users)::float / 
  NULLIF((SELECT COUNT(*) FROM new_users), 0)::float * 100 as activation_rate;
```

---

### 3. Day-N Retention Rates

**Definition:** Percentage of users who return on Day N after signup

**Key Metrics:**
- Day-1 Retention: Users active on day after signup
- Day-7 Retention: Users active on day 7 after signup
- Day-30 Retention: Users active on day 30 after signup

**Target:**
- Day-1: 50%+
- Day-7: 40%+
- Day-30: 25%+

**SQL Query (Day-7):**
```sql
WITH cohort AS (
  SELECT user_id, created_at as signup_date
  FROM users
  WHERE created_at >= NOW() - INTERVAL '60 days'
),
day_7_users AS (
  SELECT DISTINCT c.user_id
  FROM cohort c
  JOIN analytics_events ae ON c.user_id = ae.user_id
  WHERE ae.created_at::date = (c.signup_date + INTERVAL '7 days')::date
)
SELECT 
  (SELECT COUNT(*) FROM day_7_users)::float / 
  NULLIF((SELECT COUNT(*) FROM cohort WHERE signup_date <= NOW() - INTERVAL '7 days'), 0)::float * 100 as day_7_retention;
```

---

### 4. Weekly Active Users (WAU)

**Definition:** Unique users active in past 7 days

**Formula:**
```sql
WAU = COUNT(DISTINCT user_id) WHERE created_at >= NOW() - INTERVAL '7 days'
```

**SQL Query:**
```sql
SELECT COUNT(DISTINCT user_id) as wau
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

### 5. Monthly Active Users (MAU)

**Definition:** Unique users active in past 30 days

**Formula:**
```sql
MAU = COUNT(DISTINCT user_id) WHERE created_at >= NOW() - INTERVAL '30 days'
```

**SQL Query:**
```sql
SELECT COUNT(DISTINCT user_id) as mau
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

### 6. Stickiness Ratio (WAU/MAU)

**Definition:** Ratio of weekly active users to monthly active users (measures engagement depth)

**Formula:**
```sql
Stickiness = WAU / MAU
```

**Target:** 0.5+ (50%+ of monthly users are weekly users)

**SQL Query:**
```sql
WITH wau AS (
  SELECT COUNT(DISTINCT user_id) as count
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
),
mau AS (
  SELECT COUNT(DISTINCT user_id) as count
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT count FROM wau)::float / 
  NULLIF((SELECT count FROM mau), 0)::float as stickiness_ratio;
```

---

## 🔄 Engagement Metrics

### 7. Average Sessions Per User (Weekly)

**Definition:** Average number of sessions per user in past 7 days

**Formula:**
```sql
Avg Sessions = SUM(sessions) / COUNT(DISTINCT user_id)
```

**Target:** 3+ sessions per week

**SQL Query:**
```sql
SELECT 
  COUNT(DISTINCT session_id)::float / 
  NULLIF(COUNT(DISTINCT user_id), 0)::float as avg_sessions_per_user
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

### 8. Time to First Value (TTFV)

**Definition:** Average time from signup to first meal plan completion

**Formula:**
```sql
TTFV = AVG(time_to_first_meal_plan)
```

**Target:** < 5 minutes

**SQL Query:**
```sql
WITH first_meal_plans AS (
  SELECT 
    u.user_id,
    u.created_at as signup_date,
    MIN(ae.created_at) as first_meal_plan_date
  FROM users u
  JOIN analytics_events ae ON u.user_id = ae.user_id
  WHERE ae.event_type = 'meal_plan_completed'
  GROUP BY u.user_id, u.created_at
)
SELECT 
  AVG(EXTRACT(EPOCH FROM (first_meal_plan_date - signup_date)) / 60) as avg_ttfv_minutes
FROM first_meal_plans;
```

---

### 9. Meal Plans Created Per User (Weekly)

**Definition:** Average number of meal plans created per user in past 7 days

**Target:** 1+ meal plan per week

**SQL Query:**
```sql
SELECT 
  COUNT(*)::float / 
  NULLIF(COUNT(DISTINCT user_id), 0)::float as avg_meal_plans_per_user
FROM analytics_events
WHERE event_type = 'meal_plan_created'
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

### 10. Recipe Engagement Rate

**Definition:** Percentage of users who view/save recipes in past 7 days

**Formula:**
```sql
Recipe Engagement = (Users who view/save recipes) / (Total WAU)
```

**Target:** 70%+

**SQL Query:**
```sql
WITH recipe_users AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type IN ('recipe_viewed', 'recipe_saved')
    AND created_at >= NOW() - INTERVAL '7 days'
),
total_wau AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  (SELECT COUNT(*) FROM recipe_users)::float / 
  NULLIF((SELECT total FROM total_wau), 0)::float * 100 as recipe_engagement_rate;
```

---

## 🎯 Habit Formation Metrics

### 11. Streak Completion Rate

**Definition:** Percentage of users who maintain a 7-day streak

**Target:** 20%+ of active users

**SQL Query:**
```sql
WITH user_streaks AS (
  SELECT 
    user_id,
    COUNT(DISTINCT DATE(created_at)) as consecutive_days
  FROM analytics_events
  WHERE event_type IN ('meal_plan_created', 'meal_plan_updated')
    AND created_at >= NOW() - INTERVAL '14 days'
  GROUP BY user_id
  HAVING COUNT(DISTINCT DATE(created_at)) >= 7
)
SELECT 
  (SELECT COUNT(*) FROM user_streaks)::float / 
  NULLIF((SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= NOW() - INTERVAL '7 days'), 0)::float * 100 as streak_completion_rate;
```

---

### 12. Badge Earning Rate

**Definition:** Percentage of users who earn at least one badge in past 30 days

**Target:** 30%+

**SQL Query:**
```sql
WITH badge_earners AS (
  SELECT DISTINCT user_id
  FROM user_achievements
  WHERE created_at >= NOW() - INTERVAL '30 days'
),
active_users AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT COUNT(*) FROM badge_earners)::float / 
  NULLIF((SELECT total FROM active_users), 0)::float * 100 as badge_earning_rate;
```

---

### 13. Weekly Goal Achievement Rate

**Definition:** Percentage of users who set and achieve weekly goals

**Target:** 50%+ of users who set goals

**SQL Query:**
```sql
WITH goal_setters AS (
  SELECT DISTINCT user_id
  FROM user_goals
  WHERE created_at >= NOW() - INTERVAL '7 days'
),
goal_achievers AS (
  SELECT DISTINCT ug.user_id
  FROM user_goals ug
  JOIN analytics_events ae ON ug.user_id = ae.user_id
  WHERE ae.event_type = 'weekly_goal_achieved'
    AND ae.created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  (SELECT COUNT(*) FROM goal_achievers)::float / 
  NULLIF((SELECT COUNT(*) FROM goal_setters), 0)::float * 100 as goal_achievement_rate;
```

---

## 🚀 Advocacy Metrics

### 14. Referral-Origin New Users

**Definition:** Percentage of new users who came from referrals

**Formula:**
```sql
Referral Rate = (Referral sign-ups) / (Total sign-ups)
```

**Target:** 15%+ by Month 6, 20%+ by Month 12

**SQL Query:**
```sql
WITH referral_signups AS (
  SELECT COUNT(*) as count
  FROM users
  WHERE referral_code IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
),
total_signups AS (
  SELECT COUNT(*) as count
  FROM users
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT count FROM referral_signups)::float / 
  NULLIF((SELECT count FROM total_signups), 0)::float * 100 as referral_rate;
```

---

### 15. Viral Coefficient (K-Factor)

**Definition:** Average number of new users each existing user brings in

**Formula:**
```sql
K = (Referral sign-ups) / (Referrers)
```

**Target:** 0.3+ (each user brings in 0.3 new users on average)

**SQL Query:**
```sql
WITH referral_signups AS (
  SELECT COUNT(*) as count
  FROM users
  WHERE referral_code IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
),
referrers AS (
  SELECT COUNT(DISTINCT referrer_id) as count
  FROM referrals
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT count FROM referral_signups)::float / 
  NULLIF((SELECT count FROM referrers), 0)::float as viral_coefficient;
```

---

### 16. Share Rate

**Definition:** Percentage of users who share recipes or meal plans in past 7 days

**Target:** 10%+

**SQL Query:**
```sql
WITH sharers AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type IN ('recipe_shared', 'meal_plan_shared')
    AND created_at >= NOW() - INTERVAL '7 days'
),
total_wau AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  (SELECT COUNT(*) FROM sharers)::float / 
  NULLIF((SELECT total FROM total_wau), 0)::float * 100 as share_rate;
```

---

## 🫶 Community Metrics

### 17. UGC Participation Rate

**Definition:** Percentage of users who create UGC (recipes, videos, stories) per 1,000 users

**Formula:**
```sql
UGC Ratio = (UGC posts) / (Total users / 1,000)
```

**Target:** 10%+ participation rate (100+ posts per 1,000 users)

**SQL Query:**
```sql
WITH ugc_posts AS (
  SELECT COUNT(*) as count
  FROM user_generated_content
  WHERE created_at >= NOW() - INTERVAL '30 days'
),
total_users AS (
  SELECT COUNT(*) as total
  FROM users
)
SELECT 
  (SELECT count FROM ugc_posts)::float / 
  NULLIF((SELECT total FROM total_users) / 1000.0, 0)::float as ugc_ratio;
```

---

### 18. Community Engagement Rate

**Definition:** Percentage of users who engage with community features (comments, reactions, Shared Tables)

**Target:** 25%+

**SQL Query:**
```sql
WITH community_users AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type IN ('comment_posted', 'reaction_added', 'shared_table_created', 'shared_table_updated')
    AND created_at >= NOW() - INTERVAL '30 days'
),
active_users AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT COUNT(*) FROM community_users)::float / 
  NULLIF((SELECT total FROM active_users), 0)::float * 100 as community_engagement_rate;
```

---

### 19. Ambassador Tier Distribution

**Definition:** Distribution of users across ambassador tiers (Bronze, Silver, Gold)

**SQL Query:**
```sql
SELECT 
  ambassador_tier,
  COUNT(*) as user_count,
  COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM users WHERE ambassador_tier IS NOT NULL), 0)::float * 100 as percentage
FROM users
WHERE ambassador_tier IS NOT NULL
GROUP BY ambassador_tier
ORDER BY 
  CASE ambassador_tier
    WHEN 'Bronze' THEN 1
    WHEN 'Silver' THEN 2
    WHEN 'Gold' THEN 3
  END;
```

---

## 📱 Notification & Email Metrics

### 20. Push Notification Open Rate

**Definition:** Percentage of push notifications opened

**Target:** 25%+

**SQL Query:**
```sql
WITH notifications_sent AS (
  SELECT COUNT(*) as count
  FROM push_notifications
  WHERE created_at >= NOW() - INTERVAL '7 days'
),
notifications_opened AS (
  SELECT COUNT(*) as count
  FROM push_notifications
  WHERE opened_at IS NOT NULL
    AND created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  (SELECT count FROM notifications_opened)::float / 
  NULLIF((SELECT count FROM notifications_sent), 0)::float * 100 as open_rate;
```

---

### 21. Email Open Rate

**Definition:** Percentage of emails opened

**Target:** 30%+

**SQL Query:**
```sql
WITH emails_sent AS (
  SELECT COUNT(*) as count
  FROM email_campaigns
  WHERE sent_at >= NOW() - INTERVAL '30 days'
),
emails_opened AS (
  SELECT COUNT(*) as count
  FROM email_campaigns
  WHERE opened_at IS NOT NULL
    AND sent_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT count FROM emails_opened)::float / 
  NULLIF((SELECT count FROM emails_sent), 0)::float * 100 as email_open_rate;
```

---

### 22. Email Click-Through Rate (CTR)

**Definition:** Percentage of emails with clicks

**Target:** 10%+

**SQL Query:**
```sql
WITH emails_sent AS (
  SELECT COUNT(*) as count
  FROM email_campaigns
  WHERE sent_at >= NOW() - INTERVAL '30 days'
),
emails_clicked AS (
  SELECT COUNT(*) as count
  FROM email_campaigns
  WHERE clicked_at IS NOT NULL
    AND sent_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT count FROM emails_clicked)::float / 
  NULLIF((SELECT count FROM emails_sent), 0)::float * 100 as click_through_rate;
```

---

## 📊 Cohort Analysis

### 23. Cohort Retention Matrix

**Definition:** Retention rates by signup cohort (monthly)

**SQL Query:**
```sql
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', created_at) as cohort_month,
    user_id
  FROM users
  WHERE created_at >= NOW() - INTERVAL '6 months'
),
monthly_activity AS (
  SELECT 
    DATE_TRUNC('month', created_at) as activity_month,
    user_id
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '6 months'
)
SELECT 
  c.cohort_month,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN ma.activity_month = c.cohort_month THEN c.user_id END) as month_0,
  COUNT(DISTINCT CASE WHEN ma.activity_month = c.cohort_month + INTERVAL '1 month' THEN c.user_id END) as month_1,
  COUNT(DISTINCT CASE WHEN ma.activity_month = c.cohort_month + INTERVAL '2 months' THEN c.user_id END) as month_2,
  COUNT(DISTINCT CASE WHEN ma.activity_month = c.cohort_month + INTERVAL '3 months' THEN c.user_id END) as month_3
FROM cohorts c
LEFT JOIN monthly_activity ma ON c.user_id = ma.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month DESC;
```

---

## 🎯 Feature Adoption Metrics

### 24. Feature Adoption Rate

**Definition:** Percentage of users who use a specific feature

**Example: "What's in my fridge?" Feature:**
```sql
WITH feature_users AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type = 'fridge_recipe_suggested'
    AND created_at >= NOW() - INTERVAL '30 days'
),
active_users AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  (SELECT COUNT(*) FROM feature_users)::float / 
  NULLIF((SELECT total FROM active_users), 0)::float * 100 as feature_adoption_rate;
```

---

## 📈 Dashboard Views

### Recommended Dashboard Structure

**1. Executive Dashboard (Daily)**
- Engaged Retention Rate (ERR)
- Day-7 Retention
- Weekly Active Users (WAU)
- Referral Rate
- Stickiness Ratio

**2. Engagement Dashboard (Weekly)**
- Activation Rate
- Time to First Value (TTFV)
- Meal Plans Created Per User
- Recipe Engagement Rate
- Streak Completion Rate

**3. Advocacy Dashboard (Monthly)**
- Referral-Origin New Users
- Viral Coefficient (K-Factor)
- Share Rate
- UGC Participation Rate
- Ambassador Tier Distribution

**4. Community Dashboard (Weekly)**
- Community Engagement Rate
- UGC Participation Rate
- Shared Tables Usage
- Comment/Reaction Rate

**5. Communication Dashboard (Weekly)**
- Push Notification Open Rate
- Email Open Rate
- Email Click-Through Rate
- Re-engagement Rate

---

## 🔧 Implementation Notes

### Database Schema Requirements

**Core Tables:**
- `users` (user_id, created_at, referral_code, ambassador_tier)
- `analytics_events` (user_id, event_type, created_at, session_id)
- `user_achievements` (user_id, achievement_type, created_at)
- `user_goals` (user_id, goal_type, target_value, created_at)
- `referrals` (user_id, referrer_id, created_at)
- `push_notifications` (user_id, sent_at, opened_at)
- `email_campaigns` (user_id, sent_at, opened_at, clicked_at)
- `user_generated_content` (user_id, content_type, created_at)

### Event Tracking

**Key Events to Track:**
- `meal_plan_created`
- `meal_plan_updated`
- `meal_plan_completed`
- `meal_plan_shared`
- `recipe_viewed`
- `recipe_saved`
- `recipe_shared`
- `grocery_list_generated`
- `grocery_list_shared`
- `fridge_recipe_suggested`
- `comment_posted`
- `reaction_added`
- `shared_table_created`
- `shared_table_updated`
- `weekly_goal_achieved`
- `badge_earned`
- `streak_milestone`

### Automation

**Recommended Automation:**
- Daily metric calculations (Supabase Edge Functions or scheduled jobs)
- Weekly dashboard updates (email reports)
- Monthly cohort analysis (automated reports)

---

## 📊 Success Criteria Summary

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Engaged Retention Rate (ERR) | 35% | 40% |
| Activation Rate | 60% | 65% |
| Day-7 Retention | 40% | 45% |
| Day-30 Retention | 25% | 30% |
| Stickiness Ratio (WAU/MAU) | 0.5 | 0.6 |
| Referral Rate | 15% | 20% |
| UGC Participation Rate | 10% | 15% |
| Community Engagement Rate | 25% | 30% |

---

**Next Steps:** Implement event tracking, set up dashboards, and automate metric calculations using Supabase and the tools outlined in the Stage-by-Stage Action Plan.
