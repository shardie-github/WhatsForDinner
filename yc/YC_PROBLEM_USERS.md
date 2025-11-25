# YC Problem & Users: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Explicit problem statement, user segments, and evidence from repo

---

## Explicit Problem Statement

### The Core Problem

**Every day at 6 PM, 50 million Americans face the same question: "What should I cook tonight?"**

This daily decision creates:
- **Decision fatigue**: 15+ minutes spent deciding what to make
- **Food waste**: Ingredients bought but never used (40% of food wasted in US)
- **Repetitive meals**: Same recipes week after week
- **Takeout dependency**: Defaulting to expensive delivery when overwhelmed
- **Dietary frustration**: Strict diets (keto, vegan, FODMAP, allergies) make meal planning harder

### Why Current Solutions Fail

| Solution Type | How They Fail |
|---------------|---------------|
| **Recipe Sites** (AllRecipes, Food Network) | Require searching—don't start with what you have. You need to know what you want before you search. |
| **Meal Apps** (Yummly, Mealime) | Need you to plan ahead. Cause planning fatigue. Don't solve "what's for dinner TONIGHT?" |
| **Generic AI** (ChatGPT, Claude) | Doesn't learn your preferences. No pantry integration. No personalization over time. |
| **Pantry Apps** (Paprika, AnyList) | Organize recipes but don't generate them. Still requires you to know what you want. |

### The Gap

**No solution starts with what you HAVE and generates personalized recipes from there.**

---

## Primary User Segments

### 1. Busy Families (Primary ICP)

**Demographics**
- Age: 28-45
- Household: Family of 2-4 people
- Income: $50K-$150K
- Location: Urban/suburban US

**Psychographics**
- Values time-saving and convenience
- Health-conscious but pragmatic
- Frustrated by meal planning decision fatigue
- Wants to reduce food waste

**Pain Points**
1. "What should I cook tonight?" decision paralysis (happens daily)
2. Wasting ingredients bought but never used
3. Repetitive meals (tired of same recipes)
4. Dietary restrictions (kids' allergies, picky eaters)
5. Limited time for meal planning

**Jobs-To-Be-Done**
- "I need dinner ideas in under 5 minutes"
- "I want to use ingredients I already have"
- "I need recipes my whole family will eat"

**Value Propositions**
- Saves 15+ minutes per meal decision
- Reduces food waste (use what you have)
- Personalizes to family preferences

**Evidence from Repo**
- `/gtm/ICP_profiles.md` defines this segment
- `/gtm/messaging_map.md` has messaging variants for busy families
- Multi-tenant schema supports family/household sharing (`tenant_memberships` table)

---

### 2. Diet-Restricted Consumers (Secondary ICP)

**Demographics**
- Age: 25-55
- Household: Solo or couple
- Income: $60K-$120K
- Location: Urban US

**Psychographics**
- Highly health-conscious
- Specific dietary needs (keto, vegan, FODMAP, allergies)
- Willing to pay premium for solutions
- Research-oriented

**Pain Points**
1. Generic meal apps don't respect strict diets
2. Constant ingredient checking for restrictions
3. Limited recipe variety within diet constraints
4. Meal planning takes too long with restrictions

**Jobs-To-Be-Done**
- "I need recipes that actually fit my diet"
- "I want confidence recipes meet my restrictions"
- "I need variety despite my limitations"

**Value Propositions**
- Specialized AI understands dietary constraints
- Validates recipes against restrictions
- Premium pricing justified by specificity

**Evidence from Repo**
- Database schema includes `dietary_preferences` and `allergies` fields
- AI generation logic validates against restrictions (inferred from code structure)
- `/gtm/ICP_profiles.md` defines this segment

---

### 3. Meal Prep Enthusiasts (Tertiary ICP)

**Demographics**
- Age: 22-40
- Household: Solo or couple
- Income: $40K-$100K
- Location: Urban US

**Psychographics**
- Efficiency-focused
- Batch cooking oriented
- Health and fitness goals
- Time optimization mindset

**Pain Points**
1. Planning weekly meal prep is time-consuming
2. Ingredient optimization across meals
3. Storage and portion management
4. Variety within meal prep constraints

**Jobs-To-Be-Done**
- "I need a weekly meal prep plan"
- "I want to minimize grocery trips"
- "I need recipes that batch well"

**Value Propositions**
- Weekly meal planning optimization
- Batch cooking recommendations
- Grocery list generation

**Evidence from Repo**
- Meal planning features mentioned in README
- Grocery list integration planned (affiliate partnerships)

---

## Top Pains These Users Experience Today

### Pain #1: Decision Fatigue (Most Common)

**The Problem**: Standing in front of the fridge, knowing you have ingredients but no idea what to make.

**Frequency**: Daily (6 PM every day)

**Impact**: 
- 15+ minutes wasted deciding
- Default to takeout when overwhelmed
- Stress and frustration

**Current Workarounds**:
- Order takeout (expensive)
- Make the same 5 recipes (boring)
- Search Google for "what to make with X" (time-consuming)

**How We Solve**: 30-second recipe generation from pantry

---

### Pain #2: Food Waste

**The Problem**: Buying ingredients with good intentions, then they expire unused.

**Frequency**: Weekly (40% of food wasted in US)

**Impact**:
- Money wasted ($1,500/year average household)
- Environmental impact
- Guilt and frustration

**Current Workarounds**:
- Meal planning apps (but they require planning ahead)
- Expiration tracking apps (but they don't generate recipes)

**How We Solve**: Pantry-first approach + expiration alerts + recipe suggestions

---

### Pain #3: Dietary Restrictions Make Planning Harder

**The Problem**: Strict diets (keto, vegan, FODMAP, allergies) require constant ingredient checking.

**Frequency**: Every meal

**Impact**:
- Time-consuming (check every ingredient)
- Limited recipe variety
- Frustration with generic apps

**Current Workarounds**:
- Manual recipe filtering
- Multiple apps (one for recipes, one for diet tracking)
- Giving up and eating the same safe meals

**How We Solve**: AI validates recipes against restrictions automatically

---

### Pain #4: Repetitive Meals

**The Problem**: Same recipes week after week because you don't know what else to make.

**Frequency**: Weekly

**Impact**:
- Boring meals
- Family complaints
- Lack of variety

**Current Workarounds**:
- Recipe sites (but overwhelming choice)
- Cookbooks (but don't use what you have)

**How We Solve**: AI suggests variety based on pantry + preferences

---

## Evidence from Repo About User Pain

### Code Comments & TODOs

**TODO**: Search codebase for user pain indicators:
- [ ] Check `/whats-for-dinner/src/` for comments about user frustrations
- [ ] Review GitHub issues (if accessible)
- [ ] Check `/docs/` for user feedback or research

**Current Evidence**:
- `/gtm/ICP_profiles.md` explicitly documents pain points
- `/gtm/messaging_map.md` addresses pain points in messaging
- README describes the problem clearly

### Database Schema Evidence

**Pantry Management** (`pantry_items` table):
- Tracks ingredients with expiration dates
- **Inference**: Users waste food → need expiration tracking

**Dietary Preferences** (`profiles.dietary_preferences`, `profiles.allergies`):
- Stores restrictions at user level
- **Inference**: Users have strict diets → need validation

**Recipe Feedback** (`recipe_feedback` table):
- Tracks user ratings and feedback
- **Inference**: Users need personalization → system learns preferences

**Analytics Events** (`analytics_events` table):
- Tracks user behavior and engagement
- **Inference**: Need to understand what users actually do

---

## Hypotheses: What Founders Know That Others Don't

### Hypothesis 1: Pantry-First Is The Right Wedge

**What Founders Know**: Starting with what users HAVE (not what they need) eliminates planning fatigue.

**Why Others Missed It**: 
- Recipe sites optimize for search (recipe-first)
- Meal apps optimize for planning (future-focused)
- No one optimized for "what can I make RIGHT NOW with what I have"

**Evidence**: 
- Product architecture is pantry-first (pantry_items table is core)
- AI generation starts with pantry analysis

---

### Hypothesis 2: AI Personalization Creates Switching Cost

**What Founders Know**: The more users interact, the better recommendations get → creates moat.

**Why Others Missed It**:
- Generic AI doesn't learn (ChatGPT, Claude)
- Recipe sites don't personalize (AllRecipes, Food Network)
- Meal apps don't learn preferences (Yummly, Mealime)

**Evidence**:
- `recipe_feedback` table tracks user preferences
- `recipe_metrics` table tracks what users actually cook
- Analytics events track engagement patterns

---

### Hypothesis 3: Universal Platform Is Differentiator

**What Founders Know**: Users want to start planning on phone, finish cooking with tablet.

**Why Others Missed It**:
- Most apps are single-platform (web OR mobile)
- Cross-platform sync is hard (technical complexity)
- Many don't invest in both

**Evidence**:
- Monorepo structure supports web + mobile
- Shared packages ensure consistency
- Real-time sync via Supabase

---

### Hypothesis 4: Offline Support Matters

**What Founders Know**: Cooking happens in kitchens with spotty connectivity.

**Why Others Missed It**:
- Most apps require internet for core features
- Offline support is expensive to build
- Many assume "everyone has internet"

**Evidence**:
- README mentions offline support as key feature
- Architecture supports offline access (local storage, caching)

---

## Validation Needed

### User Research Gaps

- [ ] **User Interviews**: 10+ interviews per ICP segment
- [ ] **Surveys**: Quantitative validation of pain points
- [ ] **Usage Data**: Actual behavior data (when available)
- [ ] **Testimonials**: Real user quotes about pain points

### Metrics to Collect

- [ ] **Time Saved**: Average minutes saved per meal decision
- [ ] **Food Waste Reduction**: % reduction in wasted ingredients
- [ ] **Retention**: % of users who return within 7 days
- [ ] **Engagement**: Recipes generated per user per week

---

## Competitive Landscape

### Direct Competitors

| Competitor | How They Address Problem | Why They Fall Short |
|------------|-------------------------|---------------------|
| **Yummly** | Recipe discovery | Recipe-first, not pantry-first |
| **Mealime** | Meal planning | Requires planning ahead |
| **Paprika** | Recipe organization | Doesn't generate recipes |
| **AllRecipes** | Recipe database | Overwhelming choice, no personalization |

### Indirect Competitors

- **Takeout Apps** (UberEats, DoorDash): Solve "what's for dinner" but expensive
- **Grocery Apps** (Instacart, Amazon Fresh): Help shop but don't solve meal planning
- **Generic AI** (ChatGPT): Can suggest recipes but doesn't learn or integrate pantry

### Our Wedge

**Pantry-first + AI personalization + Universal platform = Unique position**

---

## TODO: Founders to Supply

- [ ] User interview transcripts or summaries
- [ ] Survey results validating pain points
- [ ] Actual usage data showing pain points
- [ ] User testimonials/quotes
- [ ] Case studies (before/after stories)
- [ ] Competitive analysis (detailed comparison)
- [ ] Market research data

---

**Last Updated**: 2025-01-27  
**Status**: Draft - Ready for founder review and validation data
