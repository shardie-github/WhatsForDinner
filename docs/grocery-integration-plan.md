# Canadian Grocery Integration Activation Plan

**Priority:** HIGH  
**Owner:** Partnerships Lead  
**30-Day Signal:** 2+ grocery APIs integrated, grocery list sync functional, users can add items to cart

## Problem

Core differentiator (Canadian grocery integration) mentioned but only 3 stores (Loblaws, Metro, Sobeys) referenced, no evidence of active integrations. This loses competitive advantage.

## Solution

### Phase 1: API Integration Setup (Week 1-2)

1. **Loblaws API Integration**
   - Research Loblaws API availability
   - If no public API, use web scraping (with legal review) or partner program
   - Implement product search
   - Implement cart add functionality

2. **Metro API Integration**
   - Research Metro API availability
   - Implement product search
   - Implement cart add functionality

3. **Sobeys API Integration**
   - Research Sobeys API availability
   - Implement product search
   - Implement cart add functionality

### Phase 2: Grocery List Sync (Week 2-3)

1. **Connect Pantry to Store Inventory**
   - Map pantry items to store products
   - Handle product matching (fuzzy search)
   - Support multiple stores per user

2. **Add to Cart Functionality**
   - Generate deep links to store carts
   - Support multiple items at once
   - Track conversion (items added → purchased)

### Phase 3: Marketing & Onboarding (Week 3-4)

1. **Feature in Marketing**
   - Highlight as #1 differentiator
   - Create comparison with competitors
   - Showcase in landing page

2. **Feature in Onboarding**
   - Add grocery integration step
   - Show demo of adding items to cart
   - Set preferred stores

## Implementation Checklist

- [ ] Research Loblaws API/partner program
- [ ] Research Metro API/partner program
- [ ] Research Sobeys API/partner program
- [ ] Research Walmart Canada API
- [ ] Research Real Canadian Superstore API
- [ ] Implement Loblaws integration
- [ ] Implement Metro integration
- [ ] Implement Sobeys integration
- [ ] Build product matching system
- [ ] Build grocery list sync
- [ ] Build add to cart functionality
- [ ] Add to onboarding flow
- [ ] Update marketing materials
- [ ] Test end-to-end flow
- [ ] Monitor conversion rates

## API Research Notes

### Loblaws
- Check: https://developer.loblaws.ca (if exists)
- Alternative: Partner program or affiliate links
- Products: PC Express, Loblaws, No Frills, Real Canadian Superstore

### Metro
- Check: Metro.ca API availability
- Alternative: Web scraping or partner program
- Products: Metro, Food Basics

### Sobeys
- Check: Sobeys.com API availability
- Alternative: Partner program
- Products: Sobeys, Safeway, IGA

### Additional Stores
- Walmart Canada
- Real Canadian Superstore
- Longo's
- Farm Boy

## Success Metrics

- 2+ grocery APIs integrated
- Grocery list sync functional
- Users can add items to cart
- Conversion rate: items added → purchased
- User satisfaction with grocery integration

## Related

- `/backlog/READY_realignment_003.md` - Grocery Integration
- `/docs/business/partnerships/grocery-outreach-template.md` - Partnership templates
