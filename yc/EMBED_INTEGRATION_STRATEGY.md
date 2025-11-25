# Embed/Integration Strategy: What's for Dinner

**Purpose**: Identify where embeds and integrations could drive distribution  
**Last Updated**: 2025-01-27

---

## Embed Strategy

### Recipe Widgets for Food Blogs

**Opportunity**: Food bloggers embed recipe widgets → readers try recipes → sign up

**Implementation**:
1. Create embeddable recipe widget (`/apps/web/src/components/embed/RecipeWidget.tsx`)
2. Generate embed code: `<script src="https://whatsfordinner.app/widget.js"></script>`
3. Widget shows: Recipe preview + "Get full recipe" CTA → Signup flow
4. Track embeds: `embed_tracking` table (blog URL, impressions, clicks, signups)

**Target Blogs**:
- Food blogs with 10K+ monthly visitors
- Recipe sites (AllRecipes, Food Network) - if partnership possible
- Meal prep blogs
- Diet-specific blogs (keto, vegan, etc.)

**Success Metrics**:
- 100+ blog embeds
- 1,000+ monthly impressions
- 50+ signups/month from embeds
- 5%+ conversion rate (signups / impressions)

**Timeline**: Month 2-3 (after core product stable)

---

### Grocery App Integrations

**Opportunity**: Integrate with grocery apps → users add ingredients → get recipes → sign up

**Implementation**:
1. Create API for grocery app integrations (`/apps/web/src/app/api/integrations/grocery/route.ts`)
2. Partner with grocery apps:
   - Instacart (shopping list → recipe suggestions)
   - Amazon Fresh (pantry tracking → recipe generation)
   - Walmart Grocery (receipt import → pantry sync)
3. OAuth integration: Users connect grocery account → sync pantry automatically

**Target Partners**:
- Instacart (40M+ users)
- Amazon Fresh (Prime members)
- Walmart Grocery (large user base)
- Local grocery apps (regional partnerships)

**Success Metrics**:
- 3+ grocery app partnerships
- 10K+ users via integrations
- 20%+ activation rate (higher than organic)
- $2-$4 ARPU from affiliate commissions

**Timeline**: Month 4-6 (requires partnership negotiations)

---

### Wellness Platform Integrations (B2B2C)

**Opportunity**: White-label integration with wellness platforms → employees use → sign up

**Implementation**:
1. Create white-label API (`/apps/web/src/app/api/b2b/wellness/route.ts`)
2. Partner with wellness platforms:
   - Corporate wellness programs
   - Health insurance wellness benefits
   - Fitness apps (MyFitnessPal, etc.)
3. White-label branding: Partner's logo, colors, domain

**Target Partners**:
- Corporate wellness platforms (100-10K employees)
- Health insurance companies (wellness benefits)
- Fitness apps (nutrition integration)

**Success Metrics**:
- 5+ wellness platform partnerships
- 50K+ users via B2B2C
- $5-$20 per employee/month revenue
- 30%+ engagement rate (higher than B2C)

**Timeline**: Month 6-12 (requires enterprise sales)

---

## Integration Strategy

### Recipe API for Developers

**Opportunity**: Developers build apps using our recipe API → users discover us → sign up

**Implementation**:
1. Create public API (`/apps/web/src/app/api/v1/recipes/route.ts`)
2. API endpoints:
   - `GET /api/v1/recipes?ingredients=chicken,rice` - Generate recipes
   - `GET /api/v1/recipes/:id` - Get recipe details
   - `POST /api/v1/recipes/:id/feedback` - Submit feedback
3. API documentation: `/docs/api.md`
4. Developer portal: `/apps/web/src/app/developers/page.tsx`

**Target Developers**:
- Food app developers
- Meal planning app developers
- Nutrition app developers
- Smart home developers (recipe suggestions on smart displays)

**Success Metrics**:
- 50+ API developers
- 1,000+ API calls/day
- 100+ signups/month from API
- 10%+ API → signup conversion rate

**Timeline**: Month 3-4 (after core product stable)

---

### Browser Extension

**Opportunity**: Browser extension → users save recipes from any site → discover us → sign up

**Implementation**:
1. Create browser extension (`/apps/browser-extension/`)
2. Features:
   - Save recipes from any website
   - Import recipes to What's for Dinner
   - Quick recipe generation (browser popup)
3. Chrome Web Store listing
4. Track installs, usage, signups

**Target Users**:
- Recipe site visitors (AllRecipes, Food Network)
- Food blog readers
- Meal planning enthusiasts

**Success Metrics**:
- 10K+ extension installs
- 1,000+ monthly active users
- 200+ signups/month from extension
- 20%+ extension → signup conversion rate

**Timeline**: Month 4-5 (requires browser extension development)

---

### Smart Home Integration (Future)

**Opportunity**: Smart displays (Google Nest, Amazon Echo Show) → voice recipe generation → sign up

**Implementation**:
1. Create smart home API (`/apps/web/src/app/api/smart-home/route.ts`)
2. Integrations:
   - Google Assistant ("Hey Google, what can I make with chicken?")
   - Amazon Alexa ("Alexa, suggest a recipe with rice")
   - Apple HomeKit (future)
3. Voice + display: Show recipes on smart displays

**Target Devices**:
- Google Nest Hub (smart displays)
- Amazon Echo Show
- Smart refrigerators (Samsung, LG)

**Success Metrics**:
- 3+ smart home integrations
- 5K+ monthly voice interactions
- 100+ signups/month from smart home
- 2%+ voice → signup conversion rate

**Timeline**: Month 12+ (requires smart home partnerships)

---

## Distribution Channel Prioritization

### Phase 1: Quick Wins (Month 1-3)
1. **Recipe Widgets**: Low effort, high distribution potential
2. **Browser Extension**: Medium effort, high user acquisition potential
3. **Recipe API**: Medium effort, developer ecosystem growth

### Phase 2: Partnerships (Month 4-6)
1. **Grocery App Integrations**: High effort, high user acquisition potential
2. **Wellness Platform Integrations**: High effort, high revenue potential
3. **Smart Home Integration**: High effort, future growth potential

---

## Integration Requirements

### Technical Requirements
- **API Infrastructure**: RESTful API, authentication, rate limiting
- **OAuth Integration**: Secure user authentication for third-party apps
- **Webhook Support**: Real-time updates for integrations
- **White-Label Support**: Custom branding for B2B2C partners

### Business Requirements
- **Partnership Agreements**: Legal contracts, revenue sharing
- **Support Infrastructure**: Developer support, partner support
- **Analytics**: Track integrations, usage, conversions
- **Documentation**: API docs, integration guides, partner resources

---

## Success Metrics Summary

**Embed Strategy**:
- 100+ blog embeds
- 1,000+ monthly impressions
- 50+ signups/month

**Integration Strategy**:
- 3+ grocery app partnerships
- 5+ wellness platform partnerships
- 50+ API developers
- 10K+ browser extension installs

**Overall Distribution Impact**:
- 20%+ of signups from embeds/integrations
- $2-$4 ARPU from affiliate commissions
- 30%+ higher engagement rate (integrated users vs organic)

---

## Implementation Roadmap

### Month 1-2: Foundation
- [ ] Create embed infrastructure (`embed_tracking` table)
- [ ] Build recipe widget component
- [ ] Create API documentation

### Month 3-4: Quick Wins
- [ ] Launch recipe widgets (100+ blog embeds)
- [ ] Launch browser extension (10K+ installs)
- [ ] Launch recipe API (50+ developers)

### Month 5-6: Partnerships
- [ ] Negotiate grocery app partnerships (3+ partners)
- [ ] Negotiate wellness platform partnerships (5+ partners)
- [ ] Launch integrations (10K+ users)

### Month 7-12: Scale
- [ ] Optimize embed/integration conversion rates
- [ ] Expand to new integration types (smart home, etc.)
- [ ] Build partner ecosystem

---

**Next Steps**:
1. Prioritize integrations (start with recipe widgets)
2. Build embed infrastructure
3. Create API documentation
4. Reach out to potential partners
