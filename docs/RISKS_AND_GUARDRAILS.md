# Risks & Guardrails

**Product:** What's for Dinner  
**Last Updated:** 2025-01-09  
**Risk Owner:** Product Team

---

## RISK FRAMEWORK

**Risk Level Definitions:**
- **🔴 Critical:** Could kill the product/company
- **🟡 High:** Significant impact on growth/revenue
- **🟢 Medium:** Manageable impact, can recover
- **⚪ Low:** Minor impact, easily mitigated

**Mitigation Strategy:**
- **Prevent:** Stop risk from happening
- **Detect:** Early warning signals
- **Respond:** Action plan if risk occurs

---

## TECHNICAL RISKS

### Risk 1: AI Quality is Poor
**Level:** 🔴 Critical  
**Probability:** Medium  
**Impact:** High

**Description:**
AI meal suggestions are irrelevant, inaccurate, or don't use pantry items correctly. Users lose trust and churn.

**Early Warning Signals:**
- Suggestion rating <3.5 stars
- <50% of suggestions use 3+ pantry items
- <30% of suggestions are accepted
- High churn rate (<20% D7 retention)

**Mitigation:**
- **Prevent:**
  - Test AI prompts with 100+ scenarios
  - Validate suggestions with beta users
  - Iterate on prompts based on feedback
  - Set quality thresholds (must use 3+ pantry items)
  
- **Detect:**
  - Track suggestion ratings (target: 4+ stars)
  - Monitor pantry item usage in suggestions
  - Track acceptance rate (target: 50%+)
  - Weekly quality audits
  
- **Respond:**
  - If quality drops: Pause new signups, fix AI prompts
  - If users churn: Exit survey, fix top issues
  - If ratings low: Improve prompts, add human review

**Owner:** Engineering + Product  
**Status:** ⚠️ Monitor closely

---

### Risk 2: Core Features Don't Work
**Level:** 🔴 Critical  
**Probability:** Low  
**Impact:** High

**Description:**
Core user journey breaks (signup → pantry → suggestion → recipe). Product is unusable.

**Early Warning Signals:**
- Error rate >1%
- Support tickets spike
- Negative App Store reviews
- High bounce rate (<20% activation)

**Mitigation:**
- **Prevent:**
  - End-to-end smoke tests before launch
  - 40%+ test coverage for critical paths
  - Staging environment testing
  - Beta user validation
  
- **Detect:**
  - Error monitoring (Sentry alerts)
  - Daily smoke tests
  - User feedback surveys
  - Support ticket tracking
  
- **Respond:**
  - If errors spike: Rollback, fix, redeploy
  - If users can't use: Pause signups, fix immediately
  - If reviews negative: Respond publicly, fix issues

**Owner:** Engineering  
**Status:** ✅ Mitigated (smoke tests in place)

---

### Risk 3: Security Breach
**Level:** 🔴 Critical  
**Probability:** Low  
**Impact:** Critical

**Description:**
Data breach exposes user data (emails, pantry items, payment info). Legal and reputation damage.

**Early Warning Signals:**
- Unusual database access patterns
- Failed login attempts spike
- Security audit findings
- User reports of suspicious activity

**Mitigation:**
- **Prevent:**
  - Row-level security (RLS) on all tables
  - Encrypted secrets (no hardcoded credentials)
  - Regular security audits
  - Penetration testing
  
- **Detect:**
  - Security monitoring (unusual access patterns)
  - Automated security scanning
  - User reports
  - Security audit findings
  
- **Respond:**
  - If breach detected: Notify users immediately, fix vulnerability
  - If data exposed: GDPR compliance (notify, allow deletion)
  - If legal issues: Consult lawyer, follow regulations

**Owner:** Engineering + Security  
**Status:** ⚠️ Needs improvement (2,988 potential secrets found)

---

### Risk 4: Performance Issues
**Level:** 🟡 High  
**Probability:** Medium  
**Impact:** Medium

**Description:**
App is slow (meal suggestions take >30s, pages load slowly). Users abandon.

**Early Warning Signals:**
- Meal suggestion time >30s p95
- Page load time >3s
- Core Web Vitals fail (LCP >2.5s)
- User complaints about speed

**Mitigation:**
- **Prevent:**
  - Performance budgets (LCP <2.5s, CLS <0.1)
  - Database query optimization
  - Caching (Redis for suggestions)
  - CDN for assets
  
- **Detect:**
  - Performance monitoring (Lighthouse CI)
  - Real User Monitoring (RUM)
  - Database slow query logs
  - User feedback
  
- **Respond:**
  - If slow: Optimize queries, add caching, scale infrastructure
  - If users abandon: Fix immediately, communicate improvements

**Owner:** Engineering  
**Status:** ✅ Monitored (performance budgets in place)

---

### Risk 5: Infrastructure Scaling Issues
**Level:** 🟡 High  
**Probability:** Medium  
**Impact:** Medium

**Description:**
Can't handle 10K+ users. Database crashes, API rate limits hit, costs spike.

**Early Warning Signals:**
- Database CPU >80%
- API rate limits hit
- Costs spike unexpectedly
- Error rate increases with user growth

**Mitigation:**
- **Prevent:**
  - Database query optimization
  - Connection pooling
  - Rate limiting
  - Cost monitoring and alerts
  
- **Detect:**
  - Infrastructure monitoring (CPU, memory, costs)
  - Cost alerts ($500+ over budget)
  - Performance degradation with scale
  
- **Respond:**
  - If scaling issues: Optimize queries, add caching, upgrade plan
  - If costs spike: Optimize AI usage, implement rate limiting
  - If rate limits hit: Upgrade API plan, implement queuing

**Owner:** Engineering + DevOps  
**Status:** ⚠️ Monitor as we scale

---

## PRODUCT RISKS

### Risk 6: No Product-Market Fit
**Level:** 🔴 Critical  
**Probability:** Medium  
**Impact:** Critical

**Description:**
Users don't see value. Low retention (<20% D7), low engagement (<1 suggestion/week), high churn.

**Early Warning Signals:**
- D7 retention <20%
- <1 meal suggestion per week per user
- High churn rate (>10% monthly)
- Low NPS (<30)
- Negative user feedback

**Mitigation:**
- **Prevent:**
  - Validate problem with user interviews before building
  - Beta test with 10+ users
  - Iterate based on feedback
  - Focus on core value prop (pantry-first suggestions)
  
- **Detect:**
  - Weekly retention analysis
  - User engagement tracking
  - Exit surveys for churned users
  - NPS surveys monthly
  
- **Respond:**
  - If no PMF: Pivot product, improve onboarding, fix core features
  - If low retention: Improve product quality, fix pain points
  - If high churn: Exit surveys, address top churn reasons

**Owner:** Product + Engineering  
**Status:** ⚠️ Validate with beta users

---

### Risk 7: Competition
**Level:** 🟡 High  
**Probability:** High  
**Impact:** Medium

**Description:**
Competitors (AllRecipes, HelloFresh, etc.) copy features or launch similar products. Market share erodes.

**Early Warning Signals:**
- Competitors launch similar features
- User signups slow down
- Competitors get funding/press
- Market becomes crowded

**Mitigation:**
- **Prevent:**
  - Build moat (pantry-first approach, AI personalization)
  - Move fast (ship features quickly)
  - Focus on differentiation (not recipe-first)
  - Build community (network effects)
  
- **Detect:**
  - Competitive analysis monthly
  - Market research
  - User feedback (why us vs competitors)
  
- **Respond:**
  - If competitors copy: Double down on differentiation, move faster
  - If market crowded: Focus on niche (busy parents), improve product
  - If users switch: Exit survey, improve retention

**Owner:** Product + GTM  
**Status:** ⚠️ Monitor competitors monthly

---

### Risk 8: Feature Bloat
**Level:** 🟢 Medium  
**Probability:** Medium  
**Impact:** Medium

**Description:**
Too many features, product becomes complex. Users confused, core value lost.

**Early Warning Signals:**
- Feature usage <20% for new features
- User complaints about complexity
- Activation rate drops
- Support tickets increase

**Mitigation:**
- **Prevent:**
  - Focus on core features first
  - Say no to feature requests unless validated
  - Measure feature usage before building more
  - Keep product simple
  
- **Detect:**
  - Feature usage analytics
  - User feedback
  - Activation rate monitoring
  
- **Respond:**
  - If feature bloat: Remove unused features, simplify UI
  - If users confused: Improve onboarding, simplify flows

**Owner:** Product  
**Status:** ✅ Guardrails in place (focus on core)

---

## BUSINESS RISKS

### Risk 9: Pricing Too High
**Level:** 🟡 High  
**Probability:** Medium  
**Impact:** Medium

**Description:**
Users won't pay $9.99/month. Low conversion (<5%), high churn.

**Early Warning Signals:**
- Conversion rate <5%
- High churn after trial
- User complaints about pricing
- Competitors charge less

**Mitigation:**
- **Prevent:**
  - Test pricing with beta users
  - Validate willingness to pay
  - Show clear value prop (time saved, waste reduced)
  - Offer annual plan (20% discount)
  
- **Detect:**
  - Conversion rate tracking
  - Pricing feedback surveys
  - Churn analysis (pricing-related)
  
- **Respond:**
  - If conversion low: Test lower prices ($7.99), improve value prop
  - If users churn: Exit survey, address pricing concerns
  - If competitors cheaper: Focus on differentiation, not price

**Owner:** Product + GTM  
**Status:** ⚠️ Test pricing with beta users

---

### Risk 10: Unit Economics Don't Work
**Level:** 🔴 Critical  
**Probability:** Low  
**Impact:** Critical

**Description:**
CAC > LTV, unprofitable unit economics. Can't scale profitably.

**Early Warning Signals:**
- CAC >$20 per user
- LTV <$100
- LTV:CAC <2:1
- Monthly burn rate increases

**Mitigation:**
- **Prevent:**
  - Focus on organic channels (low CAC)
  - Optimize paid ads (target CAC <$10)
  - Improve retention (increase LTV)
  - Test pricing (increase ARPU)
  
- **Detect:**
  - Weekly CAC tracking by channel
  - Monthly LTV calculation
  - Unit economics dashboard
  
- **Respond:**
  - If CAC high: Focus on organic, optimize ads, improve targeting
  - If LTV low: Improve retention, increase pricing, reduce churn
  - If unprofitable: Pause paid acquisition, focus on organic

**Owner:** Finance + GTM  
**Status:** ✅ Target LTV:CAC >3:1

---

### Risk 11: Low Growth Rate
**Level:** 🟡 High  
**Probability:** Medium  
**Impact:** Medium

**Description:**
Growth <10% MoM. Can't reach 10K users in 12 months.

**Early Warning Signals:**
- Signups <100/week
- Growth rate <10% MoM
- CAC increasing
- Channels not working

**Mitigation:**
- **Prevent:**
  - Diversify acquisition channels
  - Build referral program (viral growth)
  - Content marketing (SEO, social)
  - App Store Optimization (ASO)
  
- **Detect:**
  - Weekly growth tracking
  - Channel performance analysis
  - CAC by channel
  
- **Respond:**
  - If growth slow: Try new channels, improve product, increase marketing
  - If channels fail: Pivot strategy, focus on what works
  - If product issue: Fix product, improve retention

**Owner:** GTM + Product  
**Status:** ⚠️ Monitor growth weekly

---

### Risk 12: Run Out of Funding
**Level:** 🔴 Critical  
**Probability:** Low  
**Impact:** Critical

**Description:**
Burn through cash before reaching profitability. Can't continue operations.

**Early Warning Signals:**
- Monthly burn rate >$10K
- Runway <6 months
- Can't raise funding
- Revenue growth slow

**Mitigation:**
- **Prevent:**
  - Keep burn rate low (<$5K/month initially)
  - Focus on profitability early
  - Extend runway (reduce costs, increase revenue)
  - Bootstrap if possible
  
- **Detect:**
  - Monthly burn rate tracking
  - Runway calculation
  - Revenue vs costs analysis
  
- **Respond:**
  - If runway short: Reduce costs, increase revenue, raise funding
  - If can't raise: Bootstrap, focus on profitability
  - If unprofitable: Pivot, reduce burn, extend runway

**Owner:** Finance + Founders  
**Status:** ✅ Monitor burn rate monthly

---

## OPERATIONAL RISKS

### Risk 13: Key Person Dependency
**Level:** 🟢 Medium  
**Probability:** Low  
**Impact:** Medium

**Description:**
Key person (founder, engineer) leaves. Product stalls.

**Early Warning Signals:**
- Single point of failure (one person knows everything)
- No documentation
- No backup plan

**Mitigation:**
- **Prevent:**
  - Document everything
  - Cross-train team members
  - Build redundancy
  - Hire backup talent
  
- **Detect:**
  - Knowledge audit (who knows what)
  - Documentation completeness
  
- **Respond:**
  - If key person leaves: Document knowledge, hire replacement, train team

**Owner:** Founders  
**Status:** ⚠️ Document knowledge

---

### Risk 14: Regulatory/Compliance Issues
**Level:** 🟡 High  
**Probability:** Low  
**Impact:** High

**Description:**
GDPR violations, data privacy issues, App Store rejections.

**Early Warning Signals:**
- GDPR complaints
- App Store rejection
- Legal notices
- User privacy concerns

**Mitigation:**
- **Prevent:**
  - GDPR compliance (data export, deletion)
  - Privacy policy, terms of service
  - App Store guidelines compliance
  - Legal review
  
- **Detect:**
  - Compliance audits
  - User complaints
  - App Store feedback
  
- **Respond:**
  - If GDPR issue: Fix immediately, notify users, comply
  - If App Store rejection: Fix issues, resubmit
  - If legal issue: Consult lawyer, follow regulations

**Owner:** Legal + Engineering  
**Status:** ✅ GDPR compliant

---

## GUARDRAILS

### Product Guardrails
- **Activation Rate:** Must be >50% (if below, fix onboarding)
- **D7 Retention:** Must be >40% (if below, improve product)
- **Suggestion Quality:** Must be >4 stars (if below, fix AI)
- **Error Rate:** Must be <1% (if above, fix bugs)

### Business Guardrails
- **CAC:** Must be <$10 (if above, focus on organic)
- **LTV:CAC:** Must be >3:1 (if below, improve retention/pricing)
- **Conversion Rate:** Must be >5% (if below, improve paywall)
- **Burn Rate:** Must be <$5K/month (if above, reduce costs)

### Technical Guardrails
- **Test Coverage:** Must be >40% (if below, add tests)
- **Performance:** LCP <2.5s, CLS <0.1 (if above, optimize)
- **Security:** Zero critical vulnerabilities (if found, fix immediately)
- **Uptime:** Must be >99.9% (if below, fix infrastructure)

### Growth Guardrails
- **Growth Rate:** Must be >10% MoM (if below, try new channels)
- **Organic vs Paid:** Must be >70% organic (if below, focus on organic)
- **Viral Coefficient:** Must be >0.1 (if below, improve referral program)

---

## RISK RESPONSE PLAN

### If Critical Risk Occurs
1. **Assess:** Understand impact and urgency
2. **Communicate:** Notify team immediately
3. **Respond:** Execute mitigation plan
4. **Monitor:** Track resolution progress
5. **Learn:** Document lessons, update processes

### Escalation Path
- **Level 1:** Team lead handles
- **Level 2:** Product/Engineering lead escalates
- **Level 3:** Founders make decision

---

**Next Steps:** See `/docs/EXECUTION_BLUEPRINT.md` for staged execution plan and `/docs/METRICS_AND_FORECASTS.md` for financial projections.
