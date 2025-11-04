# Privacy API Reference

## Guardian Core

### `Guardian`

Main Guardian service that monitors data access and assesses risk.

```typescript
import { Guardian } from '@whats-for-dinner/utils/guardian';

const guardian = new Guardian(userId, ledgerDir?);

// Process an event
const event = await guardian.processEvent(
  userId,
  scope: 'api',
  dataClass: 'telemetry',
  action: 'api_call',
  target: 'api.openai.com',
  metadata: { payloadSize: 1024 }
);

// Verify ledger integrity
const integrity = guardian.verifyLedgerIntegrity();
```

### `GuardianMiddleware`

Middleware wrapper for hooking into telemetry events.

```typescript
import { createGuardianMiddleware } from '@whats-for-dinner/utils/guardian';

const middleware = createGuardianMiddleware(userId, ledgerDir?);

// Process telemetry event
const result = await middleware.processTelemetryEvent({
  userId,
  type: 'api_call',
  scope: 'api',
  dataClass: 'telemetry',
  action: 'api_call',
  target: 'api.openai.com',
  metadata: {},
});

// Wrap API call
const data = await middleware.wrapApiCall(
  userId,
  () => fetch('/api/data'),
  'api',
  'telemetry',
  '/api/data'
);
```

### `GuardianInspector`

Background agent that analyzes logs and generates trust reports.

```typescript
import { GuardianInspector } from '@whats-for-dinner/utils/guardian';

const inspector = new GuardianInspector(logsDir?);

// Generate report
const report = await inspector.analyzeAndGenerateReport(
  userId,
  periodStart,
  periodEnd
);

// Generate weekly markdown
const markdown = await inspector.generateWeeklyReport(report);

// Save report
await inspector.saveReport(report, outputPath?);
```

### `TrustFabricAI`

AI layer that learns user comfort zones and adapts recommendations.

```typescript
import { TrustFabricAI } from '@whats-for-dinner/utils/guardian';

const trustFabric = new TrustFabricAI(userId, modelsDir?);

// Learn from behavior
trustFabric.learnFromBehavior({
  dataClass: 'location',
  action: 'allow',
  userDecision: 'allow',
  timestamp: new Date().toISOString(),
});

// Get recommendations
const recommendations = trustFabric.getRecommendations();

// Export/import model
const model = trustFabric.exportModel();
trustFabric.importModel(model);
```

### `PrivacyInsurance`

Privacy insurance features (Private Mode, Lockdown, etc.).

```typescript
import { PrivacyInsurance } from '@whats-for-dinner/utils/guardian';

const insurance = new PrivacyInsurance(middleware);

// Toggle private mode
insurance.togglePrivateMode();

// Detect sensitive context
insurance.detectSensitiveContext();

// Activate MFA bubble
insurance.activateMFABubble(15);

// Emergency lockdown
await insurance.activateLockdown();
```

### `GuardianGPT`

Explainer for user-friendly explanations.

```typescript
import { GuardianGPT } from '@whats-for-dinner/utils/guardian';

const explainer = new GuardianGPT(logsDir?);

const explanation = await explainer.explain({
  question: 'What data was used and why?',
  userId,
  context: {
    eventId: '...',
    periodStart: new Date(),
    periodEnd: new Date(),
  },
});
```

## Types

### `GuardianEvent`

```typescript
interface GuardianEvent {
  eventId: string;
  timestamp: string;
  userId: string;
  scope: DataScope;
  dataClass: DataClass;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  riskScore: number;
  riskLevel: RiskLevel;
  guardianAction: ResponseAction;
  explanation: string;
  fingerprint: string;
  previousHash?: string;
}
```

### `TrustReport`

```typescript
interface TrustReport {
  userId: string;
  periodStart: string;
  periodEnd: string;
  totalEvents: number;
  eventsByRisk: { low: number; medium: number; high: number };
  eventsByClass: Record<DataClass, number>;
  eventsByScope: Record<DataScope, number>;
  actionsTaken: Record<ResponseAction, number>;
  trustScore: number;
  anomalies: Array<{ type: string; description: string; timestamp: string }>;
  policyChanges: Array<{ timestamp: string; change: string }>;
  confidenceScore: number;
  generatedAt: string;
}
```

## Policy Configuration

Policies are defined in YAML format:

```yaml
allowed_scopes:
  - user
  - app
  - api
  - external

data_classes:
  telemetry:
    risk_weight: 0.3
    default_action: allow
    requires_consent: true
  
  location:
    risk_weight: 0.8
    default_action: mask
    requires_consent: true

risk_weights:
  impact: 0.6
  likelihood: 0.4

response_actions:
  allow:
    threshold: 30
    description: "Low risk - allow operation"
  
  block:
    threshold: 85
    description: "Very high risk - block operation"
```

## CLI Commands

### Audit

```bash
pnpm ops guardian:audit
```

### Verify

```bash
pnpm ops guardian:verify --user-id <userId>
```

## API Routes

### GET `/api/guardian/events`

Get trust report for current user.

Query params:
- `period`: `week` | `month` | `all`

### POST `/api/guardian/explain`

Ask Guardian GPT to explain something.

Body:
```json
{
  "question": "What data was used?",
  "eventId": "...",
  "periodStart": "...",
  "periodEnd": "..."
}
```

## Database Schema

### `trust_ledger_roots`

Stores daily hash roots for verification.

```sql
CREATE TABLE trust_ledger_roots (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  root_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, date)
);
```

RLS enabled - users can only access their own rows.

## Best Practices

1. **Always verify ledger integrity** before trusting reports
2. **Export Trust Fabric model** regularly for backup
3. **Review weekly reports** to understand data usage
4. **Use Private Mode** when in sensitive contexts
5. **Enable MFA Bubble** for elevated sessions
6. **Review policy changes** in trust reports

## Security

- All events are cryptographically hashed
- Hash chains prevent tampering
- RLS ensures user-only access
- No admin access to user telemetry
- Offline-capable design
