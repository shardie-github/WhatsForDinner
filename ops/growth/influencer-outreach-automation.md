# Influencer Outreach Automation — Canadian Venture Operations

**Goal:** Systematically reach out to food bloggers, chefs, and wellness influencers to promote "What's for Dinner?"

---

## 🎯 Overview

This guide covers automating influencer outreach using free/low-cost tools (Google Sheets, Zapier, Gmail) to scale partnerships without manual effort.

**Time Investment:** 2 hours setup, then runs automatically  
**Monthly Cost:** $0 (free tier tools)

---

## 📋 Target Influencer Profiles

### Category 1: Food Bloggers
- **Focus:** Meal planning, recipe content, Canadian food
- **Platforms:** Instagram, TikTok, Blog
- **Followers:** 5K-50K (micro-influencers)
- **Engagement Rate:** > 3%

### Category 2: Wellness Coaches
- **Focus:** Healthy eating, meal prep, nutrition
- **Platforms:** Instagram, YouTube, Podcast
- **Followers:** 3K-30K
- **Engagement Rate:** > 4%

### Category 3: Family/Lifestyle Influencers
- **Focus:** Family meals, busy parents, meal planning
- **Platforms:** Instagram, Facebook, Blog
- **Followers:** 10K-100K
- **Engagement Rate:** > 2.5%

---

## 🚀 Automated Outreach System

### Step 1: Build Influencer Database (Google Sheets)

**Create Sheet:** "Influencer Outreach"

**Columns:**
- Name
- Email
- Instagram Handle
- Followers
- Engagement Rate
- Category
- Location (prefer Canada)
- Contacted (Yes/No)
- Contact Date
- Response (Yes/No/No Response)
- Status (Not Contacted, Contacted, Interested, Partnered, Declined)
- Notes

**Sample Data:**
```
Name,Email,Instagram Handle,Followers,Engagement Rate,Category,Location,Contacted,Contact Date,Response,Status
Sarah Johnson,sarah@example.com,@sarahcooks,12500,4.2%,Food Blogger,Toronto,No,,,Not Contacted
Mike Chen,mike@example.com,@chefmike,8500,3.8%,Food Blogger,Vancouver,No,,,Not Contacted
```

---

### Step 2: Find Influencers

**Methods:**
1. **Instagram Search:** Hashtags (#mealprepcanada #torontofoodie #canadianfoodblogger)
2. **Google Search:** "food blogger canada" + "contact"
3. **Blog Directories:** Food Bloggers of Canada, Canadian Food Bloggers
4. **Competitor Analysis:** See who promotes similar apps

**Add to Sheet:** Manually add 50-100 influencers over time

---

### Step 3: Personalized Outreach Email Template

**Template:**

```
Subject: Love your {{specific_post}}! Would love to collaborate

Hi {{name}},

I've been following your account (@{{handle}}) and love your content on {{topic}}. Your recipe for {{specific_recipe}} looks amazing!

I'm reaching out because I think you'd love our app, "What's for Dinner?" - it helps Canadians plan meals in 30 seconds using AI.

We'd love to collaborate:
- Free lifetime premium account
- Feature you in our app (if interested)
- Cross-promote on our social channels

Would you be interested in trying it out? No pressure if not!

Best,
[Your Name]
Founder, What's for Dinner?
```

**Personalization Tips:**
- Mention specific post/recipe
- Reference their location (if Canadian)
- Highlight shared values (healthy eating, meal planning)

---

### Step 4: Automated Email Sequence (Zapier)

**Zap 1: Send Initial Outreach**

1. **Trigger:** Google Sheets → New Row Added
2. **Filter:** Status = "Not Contacted" AND Email is not empty
3. **Action:** Gmail → Send Email
   - To: `{{row.Email}}`
   - Subject: Personalized (use template above)
   - Body: Personalized email (replace {{placeholders}})
4. **Action:** Google Sheets → Update Row
   - Update "Contacted" = "Yes"
   - Update "Contact Date" = Today

**Zap 2: Follow-up (If No Response)**

1. **Trigger:** Schedule → Every 7 Days
2. **Action:** Google Sheets → Find Rows
   - Filter: Contacted = "Yes" AND Response = "No" AND Contact Date > 7 days ago
3. **Action:** Gmail → Send Follow-up Email
   - Subject: "Following up - collaboration opportunity"
   - Body: Brief follow-up, offer to answer questions

**Zap 3: Track Responses**

1. **Trigger:** Gmail → New Email (Label: "Influencer Response")
2. **Action:** Google Sheets → Update Row
   - Find by Email: `{{email.From}}`
   - Update Response: "Yes"
   - Update Status: "Interested" (if positive) OR "Declined" (if negative)

---

### Step 5: Partnership Tracking

**Create Sheet:** "Partnerships"

**Columns:**
- Influencer Name
- Content Type (Post, Story, Video, Blog)
- Published Date
- Link/URL
- Engagement (Likes, Comments, Shares)
- Conversion (Signups from link)
- Payment/Compensation
- Status (Active, Completed, Ended)

---

## 📊 Outreach Metrics

**Track Weekly:**
- Influencers contacted (goal: 10-20/week)
- Response rate (target: > 20%)
- Partnership rate (target: > 5%)
- Cost per partnership
- Signups from influencer links

---

## 💰 Compensation Options

### Free Tier (Start Here)
- Free lifetime premium account
- Feature in app
- Cross-promotion on social

### Paid Tier (If Budget Allows)
- $50-200 CAD per post (micro-influencers)
- $200-500 CAD per post (mid-tier)
- Product swap (if applicable)

---

## ✅ Checklist

- [ ] Influencer database created (Google Sheets)
- [ ] 50+ influencers added
- [ ] Email template written
- [ ] Zapier automation set up
- [ ] Follow-up sequence configured
- [ ] Response tracking set up
- [ ] Partnership tracking sheet created
- [ ] Metrics dashboard created

---

## 📚 Resources

- [Food Bloggers of Canada](https://foodbloggersofcanada.com/)
- [Instagram Influencer Search](https://www.instagram.com/)
- [Hashtag Research](https://hashtagify.me/)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Monthly (optimize outreach based on response rates)
