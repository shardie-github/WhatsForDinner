# Second-Order Effects Guardrails

**Generated:** 2025-01-27  
**Priority:** HIGH  
**Owner:** Engineering Lead, Product Lead

---

## Guardrail 1: Feature Complexity Limit

**Rule:** Max 50 core API endpoints, archive non-core features  
**Enforcement:** Automated check in CI/CD, manual review for new endpoints  
**Action on Violation:** Block PR, require justification  
**Owner:** Engineering Lead

---

## Guardrail 2: Revenue Validation Window

**Rule:** Enable monetization within 30 days of building revenue systems  
**Enforcement:** Manual check, alert if revenue = $0 after 30 days  
**Action on Violation:** Generate ticket, escalate to Growth Lead  
**Owner:** Growth Lead

---

## Guardrail 3: Test Coverage Minimum

**Rule:** Maintain >80% test coverage  
**Enforcement:** Automated check in CI/CD  
**Action on Violation:** Block PR, require test coverage increase  
**Owner:** Engineering Lead

---

## Guardrail 4: User Persona Balance

**Rule:** Maintain 70% solo / 30% family feature split  
**Enforcement:** Manual review, quarterly audit  
**Action on Violation:** Rebalance features, update roadmap  
**Owner:** Product Lead

---

**Related:** `/reports/system/second_order.md` - Full audit
