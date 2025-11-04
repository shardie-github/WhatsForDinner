# Guardian System - Integration Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Database Migration

```bash
# Apply Guardian migration
psql $DATABASE_URL -f supabase/migrations/042_guardian_trust_ledger_roots.sql
```

### 3. Verify Installation

```bash
# Run Guardian audit
pnpm guardian:audit

# Verify ledger integrity
pnpm guardian:verify
```

## Integration Examples

### Example 1: API Route Protection

```typescript
import { withGuardian } from '@whats-for-dinner/utils/guardian';

export async function POST(request: Request) {
  const handler = withGuardian(
    async (req: Request) => {
      // Your API logic here
      return Response.json({ success: true });
    },
    {
      userId: user.id,
      scope: 'api',
      dataClass: 'telemetry',
      target: '/api/endpoint',
    }
  );

  return handler(request);
}
```

### Example 2: React Component Integration

```typescript
'use client';

import { useGuardian } from '@whats-for-dinner/utils/guardian';
import { useEffect } from 'react';

export function MyComponent({ userId }: { userId: string }) {
  const { trackEvent, togglePrivateMode, getRecommendations } = useGuardian(userId);

  useEffect(() => {
    // Track component view
    trackEvent('app', 'telemetry', 'component_view', 'MyComponent');
  }, []);

  const handleClick = () => {
    togglePrivateMode();
  };

  return (
    <div>
      <button onClick={handleClick}>Toggle Private Mode</button>
    </div>
  );
}
```

### Example 3: Server Action Protection

```typescript
import { guardServerAction } from '@whats-for-dinner/utils/guardian';

export const updateUserPreferences = guardServerAction(
  async (preferences: UserPreferences) => {
    // Your server action logic
    return { success: true };
  },
  {
    userId: user.id,
    scope: 'user',
    dataClass: 'personal_info',
    actionName: 'update_preferences',
  }
);
```

### Example 4: Batch Processing

```typescript
import { GuardianBatchProcessor } from '@whats-for-dinner/utils/guardian';

const processor = new GuardianBatchProcessor(userId);

// Add multiple events
processor.addEvent('api', 'telemetry', 'api_call', '/api/endpoint');
processor.addEvent('api', 'content', 'content_process', '/api/process');

// Process batch
await processor.processBatch();
```

## Composable Patterns

### Pattern 1: Composable Guardian Middleware

```typescript
import { compose } from 'lodash/fp';
import { withGuardian } from '@whats-for-dinner/utils/guardian';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';

export const protectedHandler = compose(
  withGuardian({ scope: 'api', dataClass: 'telemetry', target: '/api' }),
  withAuth(),
  withRateLimit({ limit: 100, window: 60000 })
)(async (req: Request) => {
  // Your handler
});
```

### Pattern 2: Guardian + Observability

```typescript
import { processGuardianEvent } from '@/lib/guardian-middleware';
import { observabilitySystem } from '@/lib/observability';

export async function trackedHandler(req: Request) {
  const span = observabilitySystem.startSpan('handler');
  
  try {
    // Process Guardian event
    await processGuardianEvent(req, userId, {
      type: 'api_call',
      scope: 'api',
      dataClass: 'telemetry',
      action: 'handler_execution',
      target: req.url,
    });

    // Your logic
    const result = await processRequest(req);
    
    span.finish();
    return result;
  } catch (error) {
    span.finishWithError(error);
    throw error;
  }
}
```

### Pattern 3: Guardian + MFA

```typescript
import { requireMFA } from '@/lib/privacy/mfa-middleware';
import { PrivacyInsurance } from '@whats-for-dinner/utils/guardian';

export async function sensitiveAction(req: Request) {
  // Require MFA
  const mfaResult = await requireMFA(req, 'sensitive_action');
  if (!mfaResult.success) {
    return mfaResult.response;
  }

  // Check Privacy Insurance
  const guardian = createGuardianMiddleware(userId);
  const insurance = new PrivacyInsurance(guardian);
  
  // Adjust MFA bubble based on risk
  insurance.activateMFABubble(15);

  // Your logic
  return processSensitiveAction();
}
```

## Optimization Strategies

### Strategy 1: Caching

```typescript
import { OptimizedGuardian } from '@whats-for-dinner/utils/guardian';

const guardian = new OptimizedGuardian(userId);

// Use cached risk assessment
const assessment = guardian.assessRiskCached('api', 'telemetry', metadata);
```

### Strategy 2: Batch Writing

```typescript
import { BatchLedgerWriter } from '@whats-for-dinner/utils/guardian';

const writer = new BatchLedgerWriter('./guardian/logs/user.jsonl');

// Add events (automatically batched)
writer.add(event1);
writer.add(event2);

// Flush when done
await writer.flush();
```

### Strategy 3: Performance Monitoring

```typescript
import { performanceMonitor } from '@whats-for-dinner/utils/guardian';

const start = Date.now();
await guardian.processEvent(...);
performanceMonitor.recordEventProcessing(Date.now() - start);

// Get stats
const stats = performanceMonitor.getStats();
console.log('Average processing time:', stats.eventProcessing.avg);
```

## Testing

### Unit Tests

```typescript
import { Guardian } from '@whats-for-dinner/utils/guardian';

describe('Guardian', () => {
  it('should assess risk correctly', () => {
    const guardian = new Guardian('test-user');
    const assessment = guardian.assessRisk('api', 'telemetry', {});
    expect(assessment.riskLevel).toBe('low');
  });
});
```

### Integration Tests

```typescript
import { processGuardianEvent } from '@/lib/guardian-middleware';

describe('Guardian Integration', () => {
  it('should process telemetry events', async () => {
    const result = await processGuardianEvent(
      request,
      userId,
      { type: 'api_call', scope: 'api', dataClass: 'telemetry', action: 'call', target: '/api' }
    );
    expect(result.allowed).toBe(true);
  });
});
```

## Troubleshooting

### Issue: Guardian events not being logged

**Solution**: Check middleware integration and ensure Guardian is enabled:

```typescript
const guardian = createGuardianMiddleware(userId);
guardian.setEnabled(true);
```

### Issue: Slow performance

**Solution**: Use optimized Guardian and batch processing:

```typescript
import { OptimizedGuardian, BatchLedgerWriter } from '@whats-for-dinner/utils/guardian';
```

### Issue: Hash chain verification fails

**Solution**: Run verification and check ledger integrity:

```bash
pnpm guardian:verify --user-id <userId>
```

## Best Practices

1. **Always use Guardian middleware** for API routes
2. **Cache risk assessments** for repeated operations
3. **Batch ledger writes** for better performance
4. **Monitor performance** regularly
5. **Export Trust Fabric models** periodically
6. **Review weekly reports** for insights
7. **Test policies** before deployment
8. **Keep documentation updated**

## Support

- **Documentation**: `/docs/trust-fabric-overview.md`
- **API Reference**: `/docs/privacy-api-reference.md`
- **Roadmap**: `/docs/guardian-roadmap.md`

---

**Last Updated**: 2024
