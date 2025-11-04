# Privacy API Reference

## Guardian Core API

### `guardianCore.processEvent(event)`

Process a data access event and emit guardian event.

**Parameters:**
```typescript
{
  user_id: string;
  type: string;
  scope: DataScope; // 'user' | 'app' | 'api' | 'external'
  data_class: DataClass; // 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'metadata'
  source: string; // 'telemetry' | 'api_call' | 'content_processing'
  metadata: Record<string, unknown>;
}
```

**Returns:** `GuardianEvent`

**Example:**
```typescript
const event = await guardianCore.processEvent({
  user_id: 'user-123',
  type: 'location_access',
  scope: 'app',
  data_class: 'location',
  source: 'telemetry',
  metadata: { precision_km: 1 },
});
```

### `guardianCore.enablePrivateMode()`

Freeze all telemetry monitoring.

### `guardianCore.disablePrivateMode()`

Resume telemetry monitoring.

### `guardianCore.lockdown()`

Emergency data lockdown. Wipes local telemetry and pauses background sync.

### `guardianCore.releaseLockdown()`

Release lockdown and resume normal operation.

## Middleware API

### `guardTelemetryEvent(userId, eventType, metadata)`

Guard a telemetry event.

**Example:**
```typescript
await guardTelemetryEvent(userId, 'app_focus', {
  app_name: 'WhatsApp',
  duration_ms: 5000,
});
```

### `guardApiCall(userId, endpoint, method, hasData, metadata)`

Guard an API call.

**Returns:** `{ allowed: boolean; action: string }`

**Example:**
```typescript
const result = await guardApiCall(
  userId,
  '/api/external/analytics',
  'POST',
  true,
  { user_agent: '...' }
);

if (!result.allowed) {
  return NextResponse.json({ error: 'Blocked' }, { status: 403 });
}
```

### `guardContentProcessing(userId, contentType, metadata)`

Guard content processing.

**Returns:** `{ allowed: boolean; redacted: boolean }`

**Example:**
```typescript
const result = await guardContentProcessing(userId, 'text', {
  length: 1000,
});

if (!result.allowed) {
  return NextResponse.json({ error: 'Blocked' }, { status: 403 });
}
```

### `detectSensitiveContext(metadata)`

Detect if sensitive sensors are active.

**Returns:** `{ active: boolean; sensors: string[] }`

**Example:**
```typescript
const context = detectSensitiveContext({
  camera_active: true,
  microphone_active: false,
});
// { active: true, sensors: ['camera'] }
```

### `handleSensitiveContext(userId, sensors)`

Auto-mute Guardian when sensitive context detected.

## Inspector API

### `guardianInspector.inspectUser(userId)`

Inspect user's ledger and generate trust report.

**Returns:** `TrustReport`

**Example:**
```typescript
const report = await guardianInspector.inspectUser(userId);
console.log(`Confidence: ${report.guardian_confidence_score}%`);
```

### `guardianInspector.generateWeeklyReport(userId)`

Generate weekly markdown report.

**Returns:** `string` (markdown)

### `guardianInspector.start(hours)`

Start hourly inspection cycle.

**Example:**
```typescript
guardianInspector.start(1); // Run every hour
```

### `guardianInspector.stop()`

Stop inspection cycle.

## Trust Fabric AI API

### `trustFabricAI.loadOrCreateModel(userId)`

Load or create Trust Fabric model.

**Returns:** `TrustFabricModel`

### `trustFabricAI.learnFromBehavior(userId, event)`

Learn from user behavior.

**Parameters:**
```typescript
{
  data_class: DataClass;
  risk_level: RiskLevel;
  action_taken: string;
  user_decision?: string;
}
```

### `trustFabricAI.generateRecommendations(userId)`

Generate personalized recommendations.

**Returns:** `GuardianRecommendation[]`

### `trustFabricAI.exportModel(userId)`

Export Trust Fabric model for portability.

**Returns:** `TrustFabricModel`

### `trustFabricAI.importModel(model)`

Import Trust Fabric model.

## Guardian GPT API

### `guardianGPT.explainEvent(eventId, userId, trustReport)`

Explain a specific event.

**Returns:** `string` (markdown)

### `guardianGPT.explainAppDataAccess(userId, trustReport)`

Explain which parts of the app touched user data.

**Returns:** `string` (markdown)

### `guardianGPT.answerQuestion(question, userId, trustReport)`

Answer explainability questions from trust report.

**Example:**
```typescript
const answer = await guardianGPT.answerQuestion(
  'What data was used this week?',
  userId,
  trustReport
);
```

## REST API Endpoints

### `GET /api/guardian/trust-report`

Get user's trust report.

**Response:**
```json
{
  "user_id": "uuid",
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "total_events": 12,
  "events_by_class": { "telemetry": 8, "location": 4 },
  "events_by_risk": { "low": 10, "medium": 2 },
  "guardian_confidence_score": 85.5,
  "hash_integrity_verified": true,
  "violations_prevented": 2
}
```

### `GET /api/guardian/weekly-report`

Get weekly markdown report.

**Response:** `text/markdown`

### `GET /api/guardian/recommendations`

Get personalized recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "type": "tighter",
      "data_class": "telemetry",
      "reason": "Frequent privacy mode toggles",
      "impact": "Reduces telemetry collection",
      "suggested_action": "mask",
      "confidence": 0.7
    }
  ]
}
```

### `POST /api/guardian/private-mode`

Toggle private mode.

**Request:**
```json
{
  "enabled": true
}
```

### `POST /api/guardian/lockdown`

Activate emergency data lockdown.

### `POST /api/guardian/explain`

Get explanation for question or event.

**Request:**
```json
{
  "question": "What data was used this week?",
  "eventId": "optional-event-id"
}
```

**Response:**
```json
{
  "answer": "This week, Guardian monitored 12 data access events..."
}
```

### `GET /api/guardian/fabric/export`

Export Trust Fabric model.

**Response:** `application/json` (downloads file)

### `POST /api/guardian/fabric/import`

Import Trust Fabric model.

**Request:**
```json
{
  "user_id": "uuid",
  "comfort_zones": { ... },
  "adaptive_risk_weights": { ... },
  ...
}
```

### `GET /api/guardian/events`

Get recent guardian events.

**Response:**
```json
{
  "events": [
    {
      "event_id": "uuid",
      "ts": "ISO8601",
      "type": "location_access",
      "scope": "app",
      "guardian_action": "allow",
      "sha256": "hash",
      "metadata": { ... }
    }
  ]
}
```

## CLI Commands

### `pnpm ops guardian --audit`

Run full Guardian audit.

**Checks:**
- RLS policies on `trust_ledger_roots`
- Hash chain integrity
- Event classification completeness

**Exit codes:**
- `0`: Passed
- `1`: Failed

### `pnpm ops guardian --verify`

Verify hash chain integrity only.

## Policy Configuration

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
    conditions:
      retention_days: 14
      anonymize: true
```

## Data Types

### `DataScope`
```typescript
type DataScope = 'user' | 'app' | 'api' | 'external';
```

### `DataClass`
```typescript
type DataClass = 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'metadata';
```

### `RiskLevel`
```typescript
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
```

### `ResponseAction`
```typescript
type ResponseAction = 'allow' | 'mask' | 'redact' | 'block' | 'alert';
```
