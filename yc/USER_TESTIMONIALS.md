# User Testimonials: What's for Dinner

**Last Updated**: 2025-01-28  
**Purpose**: Customer proof for YC application and investor meetings

---

## How to Collect Testimonials

### Step 1: Identify Beta Users

- [ ] List all beta users (from database or email list)
- [ ] Prioritize users who:
  - Use the app regularly (3+ recipes/week)
  - Have been using for 30+ days
  - Have upgraded to paid (if applicable)
  - Have given positive feedback

### Step 2: Send Testimonial Request Email

**Template Email**:

```
Subject: Quick favor - Help us improve What's for Dinner

Hi [Name],

I hope you're enjoying What's for Dinner! I'm reaching out because you're one of our early users, and your feedback would be incredibly valuable.

Would you be willing to share a quick testimonial? Just 2-3 sentences about:
- What problem we solved for you
- How much time you save
- Whether you'd recommend us to others

If you're open to it, I'd also love to feature your story (with your permission, of course).

Thanks so much!
Scott Hardie
Founder, What's for Dinner
```

### Step 3: Create Case Studies

For users who provide detailed feedback, create before/after case studies.

---

## Testimonials Collected

### Testimonial 1: [User Name]

**Name**: [TBD]  
**Location**: [TBD]  
**User Type**: [Busy Parent / Diet-Restricted / Meal Prep Enthusiast]  
**Photo**: [Optional]

**Quote**: 
> "[What problem did we solve? How much time do you save? Would you recommend us?]"

**Metrics** (if available):
- Time saved: [X] minutes per meal decision
- Recipes generated: [X] per week
- Food waste reduced: [X]%
- Using app for: [X] months

---

### Testimonial 2: [User Name]

[Same format as above]

---

### Testimonial 3: [User Name]

[Same format as above]

---

## Case Studies

### Case Study 1: [User Name] - Before/After Story

**User**: [Name]  
**Problem**: [What was their pain point?]  
**Before**: [How did they solve it before?]  
**After**: [How does our product help?]  
**Results**: [Quantifiable outcomes]

**Example**:
> **User**: Sarah, Busy Parent  
> **Problem**: Spent 15+ minutes daily deciding what to cook, defaulted to takeout  
> **Before**: Searched Google for recipes, realized missing ingredients, ordered takeout  
> **After**: Scans pantry, gets recipe in 30 seconds, cooks meal  
> **Results**: Saves 15 minutes/day, reduced takeout by 80%, family happier

---

### Case Study 2: [User Name]

[Same format as above]

---

## Usage Statistics (From Database)

**Current** (as of [DATE]):
- **Total Recipes Generated**: [TBD]
- **Average Recipes per User**: [TBD]/week
- **Most Popular Recipes**: [TBD]
- **Average Time Saved**: [TBD] minutes per meal decision

**Query to get stats**:
```sql
-- Total recipes generated
SELECT COUNT(*) as total_recipes
FROM recipes;

-- Average recipes per user per week
SELECT 
  COUNT(*)::NUMERIC / COUNT(DISTINCT user_id) / 
  EXTRACT(WEEK FROM MAX(created_at) - MIN(created_at)) as avg_per_user_per_week
FROM recipes
WHERE user_id IS NOT NULL;
```

---

## User Feedback Themes

**Common Positive Feedback**:
- [ ] "Saves me so much time"
- [ ] "I actually use ingredients before they expire"
- [ ] "My family loves the variety"
- [ ] "I don't know what I'd do without it"

**Common Pain Points Addressed**:
- [ ] Decision fatigue solved
- [ ] Food waste reduced
- [ ] Meal variety increased
- [ ] Cooking stress reduced

---

## Next Steps

1. **Send testimonial request emails** to 10-20 beta users
2. **Follow up** with users who don't respond (1 week later)
3. **Create case studies** for users who provide detailed feedback
4. **Update this document** with collected testimonials
5. **Add to data room** (`/dataroom/04_CUSTOMER_PROOF.md`)

---

**Last Updated**: 2025-01-28  
**Status**: Template - Collect testimonials and fill in
