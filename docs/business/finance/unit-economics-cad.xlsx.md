# Unit Economics Model (CAD)

**What's for Dinner? — Unit Economics Spreadsheet**

## Overview

This document describes the structure of the unit economics Excel spreadsheet (`unit-economics-cad.xlsx`).

**File Format**: Excel (.xlsx) or CSV  
**Currency**: CAD (Canadian Dollar)

---

## Spreadsheet Structure

### Sheet 1: Unit Economics Summary

**Columns**:
- Metric
- Value
- Notes

**Rows**:
- **COGS (Cost of Goods Sold)**:
  - Infrastructure: CAD $45/month
  - Payment processing: 2.9% + CAD $0.30 per transaction
  - Support: CAD $0 (self-service)
  - **Total COGS**: CAD $45/month (fixed) + 2.9% + CAD $0.30 (variable)

- **CAC (Customer Acquisition Cost)**:
  - Organic: CAD $0 (content, SEO)
  - Paid: CAD $30-50 (Google Ads, Facebook Ads)
  - Referral: CAD $5 (referral bonus)
  - **Blended CAC**: CAD $25-35

- **LTV (Lifetime Value)**:
  - Average subscription: CAD $12/month
  - Average lifespan: 12 months
  - Churn rate: 5% monthly
  - **LTV**: CAD $144 (12 months × CAD $12)

- **Payback Period**:
  - CAC: CAD $30
  - Monthly revenue: CAD $12
  - **Payback**: 2.5 months

- **Gross Margin**:
  - Revenue: CAD $12/month
  - COGS: CAD $1.65/month (2.9% + CAD $0.30)
  - **Gross Margin**: 86%

- **Net Margin**:
  - Revenue: CAD $12/month
  - COGS: CAD $1.65/month
  - Operating costs: CAD $0.50/month (allocated)
  - **Net Margin**: 82%

---

### Sheet 2: CAC Scenarios

**Columns**:
- Channel
- CAC
- Volume
- Total Cost

**Rows**:
- Organic (SEO, Content): CAD $0, 50 users/month, CAD $0
- Paid Ads (Google, Facebook): CAD $40, 20 users/month, CAD $800
- Referral: CAD $5, 10 users/month, CAD $50
- **Blended**: CAD $25, 80 users/month, CAD $2,000

---

### Sheet 3: LTV Scenarios

**Columns**:
- Scenario
- Monthly Revenue
- Lifespan (months)
- Churn Rate
- LTV

**Rows**:
- **Optimistic**: CAD $15/month, 18 months, 3% churn, CAD $270
- **Base Case**: CAD $12/month, 12 months, 5% churn, CAD $144
- **Pessimistic**: CAD $9/month, 6 months, 10% churn, CAD $54

---

### Sheet 4: Payback Analysis

**Columns**:
- Month
- CAC
- Monthly Revenue
- Cumulative Revenue
- Payback Status

**Rows**:
- Month 1: CAD $30, CAD $12, CAD $12, Not paid back
- Month 2: CAD $30, CAD $12, CAD $24, Not paid back
- Month 3: CAD $30, CAD $12, CAD $36, Paid back

**Payback Period**: 2.5 months

---

## Key Metrics

### Unit Economics Summary

- **COGS**: CAD $45/month (fixed) + 2.9% + CAD $0.30 (variable)
- **CAC**: CAD $25-35 (blended)
- **LTV**: CAD $144 (base case)
- **Payback**: 2.5 months
- **Gross Margin**: 86%
- **LTV/CAC Ratio**: 4.1x (CAD $144 / CAD $35)

---

## Assumptions

### Revenue Assumptions
- Average subscription: CAD $12/month (mixed Starter/Pro)
- Churn rate: 5% monthly
- Average lifespan: 12 months

### Cost Assumptions
- Infrastructure: CAD $45/month (fixed)
- Payment processing: 2.9% + CAD $0.30 per transaction
- CAC: CAD $25-35 (blended organic/paid)

---

## Notes

**Excel File**: Create `unit-economics-cad.xlsx` with the structure above.

**CSV Alternative**: If Excel is not available, use CSV format with comma-separated values.

**Updates**: Update monthly with actual data (revenue, costs, CAC, LTV).

---

*Last Updated: [Auto-generated via CI]*
