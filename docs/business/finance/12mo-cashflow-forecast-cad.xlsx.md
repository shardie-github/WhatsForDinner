# 12-Month Cashflow Forecast (CAD)

**What's for Dinner? — Cashflow Forecast Spreadsheet**

## Overview

This document describes the structure of the 12-month cashflow forecast Excel spreadsheet (`12mo-cashflow-forecast-cad.xlsx`).

**File Format**: Excel (.xlsx) or CSV  
**Currency**: CAD (Canadian Dollar)  
**Timeline**: 12 months

---

## Spreadsheet Structure

### Sheet 1: Cashflow Forecast

**Columns**:
- Month
- Revenue
- Costs
- Net Cash Flow
- Cumulative Cash Flow

**Rows** (Monthly):

**Month 1** (Launch):
- Revenue: CAD $500 (50 users × CAD $10 average)
- Costs: CAD $600 (infrastructure, marketing, tools)
- Net: CAD $-100
- Cumulative: CAD $-100

**Month 2**:
- Revenue: CAD $800 (80 users × CAD $10)
- Costs: CAD $650
- Net: CAD $150
- Cumulative: CAD $50

**Month 3**:
- Revenue: CAD $1,200 (100 users × CAD $12)
- Costs: CAD $700
- Net: CAD $500
- Cumulative: CAD $550

**Month 4-6** (Growth):
- Revenue: CAD $2,000-3,000/month (200-250 users)
- Costs: CAD $700-800/month
- Net: CAD $1,200-2,200/month

**Month 7-12** (Scale):
- Revenue: CAD $5,000-10,000/month (500-1,000 users)
- Costs: CAD $800-1,000/month
- Net: CAD $4,000-9,000/month

---

### Sheet 2: Revenue Breakdown

**Columns**:
- Month
- Free Users
- Starter Subscriptions
- Pro Subscriptions
- Total Revenue

**Rows**:
- **Month 1**: 50 free, 30 starter, 20 pro = CAD $500
- **Month 3**: 100 free, 60 starter, 40 pro = CAD $1,200
- **Month 6**: 200 free, 120 starter, 80 pro = CAD $2,400
- **Month 12**: 500 free, 300 starter, 200 pro = CAD $6,000

---

### Sheet 3: Cost Breakdown

**Columns**:
- Month
- Infrastructure
- Marketing
- Tools
- Payments
- Total Costs

**Rows**:
- **Month 1**: CAD $45 (infra), CAD $300 (marketing), CAD $15 (tools), CAD $50 (payments) = CAD $410
- **Month 3**: CAD $45, CAD $400, CAD $15, CAD $100 = CAD $560
- **Month 6**: CAD $100 (scaled infra), CAD $500, CAD $20, CAD $200 = CAD $820
- **Month 12**: CAD $200, CAD $700, CAD $30, CAD $500 = CAD $1,430

---

### Sheet 4: Assumptions

**Revenue Assumptions**:
- Free-to-paid conversion: 5%
- Average subscription: CAD $12/month
- Churn rate: 5% monthly
- Growth rate: 20% monthly (months 1-6), 10% monthly (months 7-12)

**Cost Assumptions**:
- Infrastructure: CAD $45/month (months 1-3), scales with users
- Marketing: CAD $300-700/month (scales with revenue)
- Tools: CAD $15-30/month
- Payments: 2.9% + CAD $0.30 per transaction

---

## Key Metrics

### Cashflow Summary

- **Month 1**: CAD $-100 (negative)
- **Month 3**: CAD $550 (positive)
- **Month 6**: CAD $3,000+ (positive)
- **Month 12**: CAD $20,000+ (positive)

### Break-Even

- **Break-Even Month**: Month 2-3
- **Break-Even Revenue**: CAD $600-700/month

### Runway

- **Starting Cash**: CAD $5,000 (assumed)
- **Month 12 Cash**: CAD $25,000+
- **Runway**: 12+ months (based on growth)

---

## Notes

**Excel File**: Create `12mo-cashflow-forecast-cad.xlsx` with the structure above.

**CSV Alternative**: If Excel is not available, use CSV format with comma-separated values.

**Updates**: Update monthly with actual data (revenue, costs, users).

---

*Last Updated: [Auto-generated via CI]*
