# Revenue Operations Guide

## Overview

The Intelligent Pricing & Revenue Optimization Layer provides predictive, causal, privacy-safe revenue analytics with continuous pricing optimization via telemetry and experiments.

## Core Components

### 1. Data Model

#### Tables

- **`transactions`**: Records all payment transactions across platforms (iOS, Android, Web)
- **`revenue_snapshots`**: Daily/weekly aggregated revenue KPIs (MRR, ARR, ARPU, LTV, CAC)
- **`price_experiments`**: A/B tests for pricing variants
- **`elasticity_results`**: Price elasticity coefficients per country/plan
- **`vanwestendorp_surveys`**: Survey responses for willingness-to-pay analysis
- **`ltv_segments`**: LTV/CAC metrics by user segment (new, retained, churned, reactivated)

#### Indexes

- `(country, plan, period)` for reporting queries
- RLS policies ensure only aggregated queries for non-admin roles

### 2. Data Pipeline & Analytics

**Location**: `packages/server/analytics/revenue.ts`

**Key Functions**:
- `aggregateRevenueSnapshot(period)`: Computes all revenue KPIs for a period
- `getRevenueSummary(startDate, endDate)`: Retrieves aggregated snapshots

**ETL Jobs**:
- **Daily** (00:05 UTC): Aggregate daily transactions ? snapshots
- **Weekly**: Compute cohort LTV/CAC segments

**KPIs Computed**:

1. **MRR (Monthly Recurring Revenue)**
   - Formula: Sum of monthly subscription revenue + (Annual revenue / 12)

2. **ARR (Annual Recurring Revenue)**
   - Formula: MRR ? 12

3. **ARPU (Average Revenue Per User)**
   - Formula: Total Revenue / Active Users (in period)

4. **LTV (Lifetime Value)**
   - Formula: Avg Revenue Per User ? Avg Lifetime (months) ? Gross Margin (0.7)
   - Based on cohort retention analysis

5. **CAC (Customer Acquisition Cost)**
   - Formula: Marketing Spend / New Paid Users
   - Estimated from lifecycle events and conversion data

6. **Churn Rate**
   - Formula: (Users who cancelled / Total active users) in period

7. **Conversion Rate**
   - Formula: (New paid users / Total signups) in period

### 3. Pricing Engine

**Location**: `packages/server/pricing/engine.ts`

**API**: `getRecommendedPrice(plan, country, platform, currency)`

**Output**:
```typescript
{
  price_cents: number;
  confidence: number; // 0-1
  reason: string;
  source: 'base' | 'elasticity' | 'vanwestendorp' | 'experiment' | 'geopricing';
}
```

#### Price Determination Logic (Priority Order)

1. **Active Experiment**: If price experiment running ? use variant A/B
2. **Van Westendorp Optimal**: If survey data exists and within ?20% ? use optimal price
3. **Elasticity-Based**: Adjust base price based on elasticity coefficient
   - Elastic (< -1): Test +5% price
   - Inelastic (> -0.5): Test -5% price
4. **Geo-Pricing**: Apply exchange rate adjustment (fixer.io API)
5. **Base Price**: Fallback to `pricing_rules` table or defaults

#### Constraints

- **?20% Guardrail**: Price adjustments limited to ?20% vs base price
- **App Store Tiers**: iOS prices must align with App Store pricing tiers
- **Fairness**: No >30% price gap within same region cluster

### 4. Elasticity Model

**Location**: `packages/server/jobs/elasticityModel.ts`

**Methodology**: Log-log regression

**Formula**:
```
elasticity = slope of log(quantity) vs log(price)
```

**Interpretation**:
- **Elastic (< -1)**: Demand sensitive to price changes
- **Inelastic (> -0.5)**: Demand less sensitive; can test higher prices
- **Unit Elastic (~ -1)**: Revenue maximized at current price

**Weekly Job**: Aggregates transactions per price point, fits regression, updates `elasticity_results`

### 5. Van Westendorp Price Sensitivity Meter

**Location**: `packages/server/jobs/vanWestendorpModel.ts`

**Survey Questions**:
1. At what price is this too cheap?
2. At what price is this cheap?
3. At what price is this expensive?
4. At what price is this too expensive?

**Outputs**:
- **Optimal Price**: Intersection of "cheap" and "expensive" curves
- **PMC (Point of Marginal Cheapness)**: Lower bound of acceptable range
- **PME (Point of Marginal Expensiveness)**: Upper bound of acceptable range

**Auto-Scheduling**: Survey sent to new users (1 week after signup) if consented

**Job**: Aggregates responses, computes median optimal price per country/plan, updates `pricing_rules`

### 6. Price Optimizer

**Location**: `packages/server/jobs/priceOptimizer.ts`

**Automated Testing**:
- If elasticity < -1 ? test +5% price for 1 week
- If elasticity > -0.5 ? test -5% price to see conversion lift

**Auto-Pause Conditions**:
- Conversion drop > 10%
- Revenue drop > 5%

**Results**: Recorded in `price_experiments` table

## API Surface

### Endpoints

#### `GET /api/pricing/current?plan=&country=&platform=`
Returns final price recommendation with reason.

**Query Params**:
- `plan`: `monthly` | `annual`
- `country`: ISO 3-letter code (default: `US`)
- `platform`: `ios` | `android` | `web` (default: `web`)
- `currency`: ISO 3-letter code (default: `USD`)

**Response**:
```json
{
  "price_cents": 999,
  "confidence": 0.8,
  "reason": "Elasticity-based pricing (elasticity: -1.5, geo-adjusted)",
  "source": "elasticity"
}
```

**Auth**: Public (for paywall display)

---

#### `POST /api/pricing/survey`
Accept Van Westendorp survey responses.

**Body**:
```json
{
  "too_cheap": 5.00,
  "cheap": 10.00,
  "expensive": 20.00,
  "too_expensive": 30.00,
  "country": "US",
  "currency": "USD"
}
```

**Response**:
```json
{
  "success": true,
  "median_optimal_price": 1500,
  "message": "Survey response recorded"
}
```

**Validation**: Ensures `too_cheap < cheap < expensive < too_expensive`

**Auth**: Authenticated (optional user_id, can be anonymous)

---

#### `GET /api/revenue/summary?period=month|quarter`
Get aggregated revenue snapshots.

**Query Params**:
- `period`: `month` | `quarter` (default: `month`)

**Response**:
```json
{
  "period": "month",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "snapshots": [
    {
      "mrr_cents": 100000,
      "arr_cents": 1200000,
      "arpu_cents": 1000,
      "ltv_cents": 4200,
      "cac_cents": 5000,
      "churn_rate": 0.05,
      "conversion_rate": 0.02
    }
  ]
}
```

**Auth**: Admin or Premium Analytics role

**Caching**: 5 minutes

---

#### `GET /api/elasticity/:country/:plan`
Get latest elasticity coefficients.

**Response**:
```json
{
  "country": "US",
  "plan": "monthly",
  "elasticity": -1.5,
  "price_points": [999, 1099, 1199],
  "demand": [100, 80, 60],
  "updated_at": "2025-01-15T00:00:00Z"
}
```

**Auth**: Admin or Premium Analytics role

**Caching**: 1 hour

---

#### `POST /api/experiments/price`
Start/stop price experiments.

**Body**:
```json
{
  "slug": "exp_monthly_us_2025q1",
  "plan": "monthly",
  "country": "US",
  "platform": "web",
  "variant_a_price_cents": 999,
  "variant_b_price_cents": 1099,
  "action": "start" // or "stop"
}
```

**Auth**: Admin only

## Client Integrations

### Hooks

**Location**: `packages/data/src/pricing.ts`

- **`usePrice(plan, options?)`**: Fetch current price, reacts to experiment assignments
- **`useRevenueSummary(period)`**: Get revenue metrics
- **`useElasticity(country, plan)`**: Get elasticity data
- **`useSubmitSurvey()`**: Submit Van Westendorp survey

### Components

**Location**: `packages/ui/PricingSurvey.tsx`

- **`<PricingSurvey />`**: React Native-compatible four-question Van Westendorp UI
- Persists responses offline in localStorage
- Auto-submits when online

**Location**: `apps/web/app/admin/revenue/page.tsx`

- **Revenue Dashboard**: Admin charts (MRR, LTV, CAC, ARPU) via Recharts
- Filters by period/region
- Export to CSV/PDF
- Simple ARIMA forecast for next quarter

## Modeling & Jobs

### Weekly Jobs

1. **`elasticityModel.ts`**
   - Fetches transactions per price point
   - Fits log-log regression
   - Updates `elasticity_results`

2. **`vanWestendorpModel.ts`**
   - Aggregates survey responses
   - Computes median optimal price per country/plan
   - Updates `pricing_rules`

3. **`priceOptimizer.ts`**
   - Checks elasticity data
   - Creates/updates price experiments
   - Auto-pauses on performance drops

### Nightly Jobs

**`revenueAggregator.ts`**:
- **Daily** (00:05 UTC): Aggregate transactions ? snapshots
- **Weekly**: Compute cohort LTV/CAC segments

## Security & Privacy

### RLS Policies

- **Transactions**: Admin can see all, users see only aggregated data
- **Revenue Snapshots**: Read allowed (aggregated), write admin only
- **Price Experiments**: Admin only
- **Elasticity Results**: Premium analytics can read, admin can write
- **Van Westendorp Surveys**: Users can insert their own, read aggregated only
- **LTV Segments**: Premium analytics can read, admin can write

### GDPR Compliance

- All pricing and revenue data aggregated anonymously for reporting
- No individual purchase or survey data exposed publicly
- Data Protection Impact Assessment (DPIA) entry in `docs/SECURITY_PRIVACY.md`

### App Store / Play Billing Compliance

- iOS prices must match App Store pricing tiers
- Android prices must comply with Play Billing requirements
- No discrimination based on protected characteristics

## Formulas Reference

### MRR
```
MRR = Sum(Monthly Subscriptions) + Sum(Annual Subscriptions) / 12
```

### ARR
```
ARR = MRR ? 12
```

### ARPU
```
ARPU = Total Revenue / Active Users (in period)
```

### LTV
```
LTV = (Avg Monthly Revenue ? Avg Lifetime Months) ? Gross Margin
Gross Margin = 0.7 (70%)
```

### CAC
```
CAC = Marketing Spend / New Paid Users
```

### Churn Rate
```
Churn Rate = (Users who cancelled / Total active users) in period
```

### Conversion Rate
```
Conversion Rate = (New paid users / Total signups) in period
```

### Price Elasticity
```
Elasticity = % ? Quantity / % ? Price
Computed via: log-log regression
```

### Van Westendorp Optimal Price
```
Optimal Price = (Median(Cheap) + Median(Expensive)) / 2
```

## Environment Variables

```bash
# Exchange Rate API (fixer.io or similar)
EXCHANGE_RATE_API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://...
SUPABASE_DB_URL=postgresql://...

# Redis (for caching)
REDIS_URL=redis://...

# Auth
SUPABASE_JWT_SECRET=your_jwt_secret
JWT_SECRET=your_jwt_secret
```

## CI/CD Integration

**Workflow**: `.github/workflows/revenue.yml`

**Steps**:
1. Typecheck
2. Migrations check
3. Run pricing tests
4. Validate forecasts

**Nightly Scheduled**:
- 00:05 UTC: `revenueAggregator` (daily)
- Weekly: `elasticityModel`, `vanWestendorpModel`, `priceOptimizer`

## Next Recommended Prompt

**Prompt #7**: Partner Revenue Network & Marketplace APIs

Extend the revenue layer with:
- Partner revenue sharing calculations
- Marketplace transaction fees
- Affiliate commission tracking
- Multi-party revenue attribution
