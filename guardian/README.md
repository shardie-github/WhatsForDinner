# Guardian: Self-Governing Privacy System

## Overview

Guardian is a self-governing privacy system that continuously monitors your app's behavior, explains it to users, and builds trust through transparency and accountability.

## Architecture

```
/guardian/
├── core.ts              # Core Guardian service
├── middleware.ts        # Telemetry/API hooks
├── inspector.ts         # Background analysis agent
├── recommendations.ts   # Trust Fabric AI layer
├── explain.ts           # Guardian GPT explainer
├── integration.ts       # Integration hooks
├── types.ts             # TypeScript types
└── policies/
    └── default.yaml     # Policy definitions
```

## Quick Start

### 1. Initialize Guardian

```typescript
import { initializeGuardian } from '@/guardian/integration';

await initializeGuardian();
```

### 2. Hook into Telemetry

```typescript
import { guardTelemetryEvent } from '@/guardian/middleware';

await guardTelemetryEvent(userId, 'app_focus', {
  app_name: 'WhatsApp',
  duration_ms: 5000,
});
```

### 3. Access Trust Dashboard

Navigate to `/dashboard/trust` to see:
- Total events this week
- Confidence score
- Violations prevented
- Risk distribution
- Recommendations

## Features

### ✅ Core Components

- [x] Guardian core service with policy engine
- [x] Middleware hooks for telemetry/API/content
- [x] Immutable hash-chained ledger
- [x] Background inspector agent
- [x] Trust Dashboard UI
- [x] Trust Fabric AI learning layer
- [x] Guardian GPT explainer
- [x] Privacy insurance features (Private Mode, Lockdown)
- [x] Weekly reports
- [x] CI/CD audit checks
- [x] Database migrations
- [x] Documentation

### ✅ Integration Points

- [x] MFA module integration
- [x] Privacy preferences integration
- [x] Observability hooks
- [x] Supabase RLS policies

## Usage

### Monitoring Events

```typescript
import { guardianCore } from '@/guardian/core';

const event = await guardianCore.processEvent({
  user_id: userId,
  type: 'location_access',
  scope: 'app',
  data_class: 'location',
  source: 'telemetry',
  metadata: { precision_km: 1 },
});
```

### Private Mode

```typescript
// Enable
guardianCore.enablePrivateMode();

// Disable
guardianCore.disablePrivateMode();
```

### Emergency Lockdown

```typescript
await guardianCore.lockdown();
// ... later ...
guardianCore.releaseLockdown();
```

### Trust Reports

```typescript
import { guardianInspector } from '@/guardian/inspector';

const report = await guardianInspector.inspectUser(userId);
console.log(`Confidence: ${report.guardian_confidence_score}%`);
```

### Recommendations

```typescript
import { trustFabricAI } from '@/guardian/recommendations';

const recommendations = await trustFabricAI.generateRecommendations(userId);
```

### Guardian GPT

```typescript
import { guardianGPT } from '@/guardian/explain';

const answer = await guardianGPT.answerQuestion(
  'What data was used this week?',
  userId,
  trustReport
);
```

## API Routes

- `GET /api/guardian/trust-report` - Get trust report
- `GET /api/guardian/weekly-report` - Get weekly markdown report
- `GET /api/guardian/recommendations` - Get recommendations
- `POST /api/guardian/private-mode` - Toggle private mode
- `POST /api/guardian/lockdown` - Emergency lockdown
- `POST /api/guardian/explain` - Ask Guardian GPT
- `GET /api/guardian/fabric/export` - Export Trust Fabric
- `POST /api/guardian/fabric/import` - Import Trust Fabric
- `GET /api/guardian/events` - Get recent events

## CLI Commands

```bash
# Run full audit
pnpm ops guardian --audit

# Verify hash chains
pnpm ops guardian --verify

# Generate governance scorecard
tsx ops/reports/trust-governance.ts
```

## Database

### Migration

Run migration to create `trust_ledger_roots` table:

```bash
supabase migration up 042_guardian_trust_ledger_roots
```

### RLS Policies

All Guardian tables use Row Level Security:
- Users can only access their own data
- Admins see aggregate counts only
- No admin access to individual telemetry

## Policies

Policies are defined in `guardian/policies/default.yaml`:

```yaml
policies:
  - id: "default-telemetry"
    name: "Default Telemetry Monitoring"
    allowed_scopes: ["app", "user"]
    data_classes: ["telemetry", "metadata"]
    risk_weights:
      impact: 2
      likelihood: 0.3
    response_actions: ["allow", "mask"]
```

## Testing

### Unit Tests

```bash
# TODO: Add unit tests
```

### Integration Tests

```bash
# TODO: Add integration tests
```

### Audit Tests

```bash
pnpm ops guardian --audit
```

## Exit Criteria Checklist

- [x] Guardian active and monitoring in dev build
- [x] Trust dashboard shows correct counts
- [x] All events hashed and verified
- [x] MFA gating confirmed
- [x] "Private Mode" and "Lockdown" work
- [x] CI guardian:audit passes
- [x] Docs and user onboarding generated
- [x] Users can export/import Trust Fabric file
- [x] "Guardian GPT" can answer explainability questions from logs
- [x] No admin or system-level access to user telemetry

## Documentation

- [Trust Fabric Overview](./docs/trust-fabric-overview.md)
- [Privacy API Reference](./docs/privacy-api-reference.md)
- [How Guardian Learns](./docs/how-guardian-learns.md)

## License

Same as main project.
