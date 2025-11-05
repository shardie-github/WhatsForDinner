# Runway & Breakeven Scenarios (CAD)

**What's for Dinner? — Breakeven Analysis Spreadsheet**

## Overview

This document describes the structure of the runway and breakeven scenarios Excel spreadsheet (`runway-breakeven-scenarios-cad.xlsx`).

**File Format**: Excel (.xlsx) or CSV  
**Currency**: CAD (Canadian Dollar)

---

## Spreadsheet Structure

### Sheet 1: Breakeven Analysis

**Columns**:
- Scenario
- Fixed Costs
- Variable Costs
- Revenue per User
- Breakeven Users

**Rows**:

**Base Case**:
- Fixed costs: CAD $400/month
- Variable costs: CAD $1.65/user/month (2.9% + CAD $0.30)
- Revenue per user: CAD $12/month
- **Breakeven users**: 33 users (CAD $400 / (CAD $12 - CAD $1.65))

**Optimistic**:
- Fixed costs: CAD $400/month
- Variable costs: CAD $1.65/user/month
- Revenue per user: CAD $15/month
- **Breakeven users**: 30 users

**Pessimistic**:
- Fixed costs: CAD $600/month
- Variable costs: CAD $1.65/user/month
- Revenue per user: CAD $9/month
- **Breakeven users**: 81 users

---

### Sheet 2: Runway Scenarios

**Columns**:
- Starting Cash
- Monthly Burn
- Monthly Revenue
- Net Burn
- Runway (months)

**Rows**:

**Scenario 1: Bootstrapped (CAD $5K)**:
- Starting cash: CAD $5,000
- Monthly burn: CAD $600
- Monthly revenue: CAD $500 (month 1), CAD $1,000 (month 3), CAD $2,000 (month 6)
- Net burn: CAD $-100 (month 1), CAD $400 (month 3), CAD $1,400 (month 6)
- **Runway**: 10+ months (breaks even month 2-3)

**Scenario 2: Seed Funded (CAD $50K)**:
- Starting cash: CAD $50,000
- Monthly burn: CAD $1,000
- Monthly revenue: CAD $500 (month 1), CAD $2,000 (month 3), CAD $5,000 (month 6)
- Net burn: CAD $-500 (month 1), CAD $1,000 (month 3), CAD $4,000 (month 6)
- **Runway**: 18+ months (breaks even month 2-3)

**Scenario 3: Lean (CAD $2K)**:
- Starting cash: CAD $2,000
- Monthly burn: CAD $400
- Monthly revenue: CAD $300 (month 1), CAD $600 (month 3), CAD $1,200 (month 6)
- Net burn: CAD $-100 (month 1), CAD $200 (month 3), CAD $800 (month 6)
- **Runway**: 5-6 months (breaks even month 2-3)

---

### Sheet 3: Sensitivity Analysis

**Columns**:
- Variable
- Low
- Base
- High
- Impact on Breakeven

**Rows**:

**Users per Day**:
- Low: 5 users/day (150/month)
- Base: 10 users/day (300/month)
- High: 20 users/day (600/month)
- **Impact**: Breakeven in 1-3 months

**ARPU (Average Revenue Per User)**:
- Low: CAD $9/month
- Base: CAD $12/month
- High: CAD $15/month
- **Impact**: Breakeven in 2-4 months

**Churn Rate**:
- Low: 3% monthly
- Base: 5% monthly
- High: 10% monthly
- **Impact**: LTV varies from CAD $270 to CAD $54

---

### Sheet 4: Growth Scenarios

**Columns**:
- Month
- Conservative
- Base Case
- Optimistic

**Rows** (User Growth):

**Month 1**: 50 users, 100 users, 200 users
**Month 3**: 150 users, 300 users, 500 users
**Month 6**: 300 users, 600 users, 1,000 users
**Month 12**: 500 users, 1,000 users, 2,000 users

**Revenue** (based on CAD $12 ARPU):

**Month 1**: CAD $600, CAD $1,200, CAD $2,400
**Month 3**: CAD $1,800, CAD $3,600, CAD $6,000
**Month 6**: CAD $3,600, CAD $7,200, CAD $12,000
**Month 12**: CAD $6,000, CAD $12,000, CAD $24,000

---

## Key Metrics

### Breakeven Summary

- **Base Case**: 33 users (CAD $400 fixed costs, CAD $12 ARPU)
- **Optimistic**: 30 users (CAD $400 fixed costs, CAD $15 ARPU)
- **Pessimistic**: 81 users (CAD $600 fixed costs, CAD $9 ARPU)

### Runway Summary

- **Bootstrapped (CAD $5K)**: 10+ months (breaks even month 2-3)
- **Seed Funded (CAD $50K)**: 18+ months (breaks even month 2-3)
- **Lean (CAD $2K)**: 5-6 months (breaks even month 2-3)

---

## Assumptions

### Revenue Assumptions
- Average subscription: CAD $12/month
- Free-to-paid conversion: 5%
- Churn rate: 5% monthly

### Cost Assumptions
- Fixed costs: CAD $400-600/month
- Variable costs: 2.9% + CAD $0.30 per transaction
- Growth rate: 20% monthly (months 1-6), 10% monthly (months 7-12)

---

## Notes

**Excel File**: Create `runway-breakeven-scenarios-cad.xlsx` with the structure above.

**CSV Alternative**: If Excel is not available, use CSV format with comma-separated values.

**Updates**: Update monthly with actual data (users, revenue, costs).

---

*Last Updated: [Auto-generated via CI]*
