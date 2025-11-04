# Guardian System - Composability & Optimization Guide

## Architectural Principles

### 1. Composability

Guardian is designed to be **highly composable** - all components can be combined and reused:

```typescript
// Example: Composing multiple patterns
import { compose } from 'lodash/fp';
import { withGuardian } from '@whats-for-dinner/utils/guardian';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { withObservability } from '@/lib/observability';

export const fullyProtectedHandler = compose(
  withObservability('api_call'),
  withGuardian({ scope: 'api', dataClass: 'telemetry', target: '/api' }),
  withAuth(),
  withRateLimit({ limit: 100, window: 60000 })
)(async (req: Request) => {
  // Your handler
});
```

### 2. Optimization Layers

Guardian has **multiple optimization layers** that can be applied independently:

```typescript
// Layer 1: Core Guardian (always needed)
const guardian = new Guardian(userId);

// Layer 2: Optimized Guardian (adds caching)
const optimized = new OptimizedGuardian(userId);

// Layer 3: Batch Writer (adds batching)
const batchWriter = new BatchLedgerWriter('./guardian/logs/user.jsonl');

// Layer 4: Performance Monitor (adds metrics)
performanceMonitor.recordEventProcessing(duration);
```

### 3. Integration Patterns

**Pre-built patterns** for common use cases:

- **API Routes**: `withGuardian()` wrapper
- **React Components**: `useGuardian()` hook
- **Server Actions**: `guardServerAction()` wrapper
- **Batch Processing**: `GuardianBatchProcessor` class
- **Instance Management**: `GuardianInstanceManager` singleton

## Cohesion Strategies

### Strategy 1: Unified Interface

All Guardian components share a unified interface:

```typescript
// Consistent event structure
interface GuardianEvent {
  userId: string;
  scope: DataScope;
  dataClass: DataClass;
  action: string;
  target: string;
  metadata?: Record<string, unknown>;
}

// Consistent return types
interface GuardianResult {
  allowed: boolean;
  action: ResponseAction;
  explanation: string;
  riskLevel: RiskLevel;
}
```

### Strategy 2: Shared Configuration

Configuration is centralized and reusable:

```typescript
// Shared policy config
const policyConfig = {
  allowedScopes: ['user', 'app', 'api', 'external'],
  dataClasses: { /* ... */ },
  riskWeights: { impact: 0.6, likelihood: 0.4 },
};

// Reused across all components
const guardian = new Guardian(userId, ledgerDir);
guardian.updatePolicy(userId, policyConfig);
```

### Strategy 3: Event-Driven Architecture

Components communicate via events:

```typescript
// Event emitter pattern
class GuardianEventEmitter extends EventEmitter {
  emit('event_processed', event: GuardianEvent);
  emit('risk_assessed', assessment: RiskAssessment);
  emit('action_taken', action: ResponseAction);
}

// Other components can listen
eventEmitter.on('action_taken', (action) => {
  // Update UI, send notification, etc.
});
```

## Optimization Patterns

### Pattern 1: Lazy Loading

Load components only when needed:

```typescript
class LazyGuardian {
  private guardian: Guardian | null = null;

  async getGuardian(): Promise<Guardian> {
    if (!this.guardian) {
      this.guardian = new Guardian(userId);
      await this.guardian.loadPolicies(); // Load on-demand
    }
    return this.guardian;
  }
}
```

### Pattern 2: Memoization

Cache expensive computations:

```typescript
import { memoize } from 'lodash';

const assessRiskMemoized = memoize(
  (scope: DataScope, dataClass: DataClass, metadata: Record<string, unknown>) => {
    return guardian.assessRisk(scope, dataClass, metadata);
  },
  (scope, dataClass, metadata) => `${scope}:${dataClass}:${JSON.stringify(metadata)}`
);
```

### Pattern 3: Debouncing

Debounce frequent operations:

```typescript
import { debounce } from 'lodash';

const debouncedLedgerWrite = debounce(
  async (event: GuardianEvent) => {
    await ledgerWriter.write(event);
  },
  1000 // Wait 1 second before writing
);
```

### Pattern 4: Request Deduplication

Deduplicate identical requests:

```typescript
class DeduplicatedGuardian {
  private pending: Map<string, Promise<GuardianEvent>> = new Map();

  async processEvent(event: GuardianEvent): Promise<GuardianEvent> {
    const key = `${event.scope}:${event.dataClass}:${event.action}`;
    
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = this.guardian.processEvent(...);
    this.pending.set(key, promise);
    
    promise.finally(() => {
      this.pending.delete(key);
    });

    return promise;
  }
}
```

## Performance Optimization Checklist

### ✅ Implemented

- [x] Caching for risk assessments
- [x] Batch ledger writes
- [x] Non-blocking event processing
- [x] Instance management (singleton pattern)
- [x] Performance monitoring

### 🔄 Recommended

- [ ] Redis caching layer
- [ ] Database indexing for queries
- [ ] Ledger compression for old entries
- [ ] Sharding for large deployments
- [ ] CDN for policy files

## Composable Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Application Layer                      │
│  (API Routes, Components, Server Actions)        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        Integration Patterns Layer                │
│  (withGuardian, useGuardian, guardServerAction) │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Optimization Layer                       │
│  (Caching, Batching, Performance Monitoring)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            Core Guardian Layer                  │
│  (Risk Assessment, Ledger, Policies)            │
└─────────────────────────────────────────────────┘
```

## Best Practices

### 1. Use Appropriate Pattern

```typescript
// ✅ Good: Use pattern for API route
export const handler = withGuardian(async (req) => {
  // handler logic
}, { scope: 'api', dataClass: 'telemetry', target: '/api' });

// ❌ Bad: Manual integration
export async function handler(req: Request) {
  const guardian = new Guardian(userId);
  // ... manual integration
}
```

### 2. Optimize for Scale

```typescript
// ✅ Good: Use batch processor for high volume
const processor = new GuardianBatchProcessor(userId);
for (const event of events) {
  processor.addEvent(...);
}
await processor.flush();

// ❌ Bad: Process one by one
for (const event of events) {
  await guardian.processEvent(...);
}
```

### 3. Monitor Performance

```typescript
// ✅ Good: Track performance
const start = Date.now();
await guardian.processEvent(...);
performanceMonitor.recordEventProcessing(Date.now() - start);

// ❌ Bad: No monitoring
await guardian.processEvent(...);
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good: Non-blocking with error handling
processGuardianEvent(req, userId, event)
  .catch(err => {
    console.error('Guardian failed:', err);
    // Don't block request
  });

// ❌ Bad: Blocking on Guardian
await processGuardianEvent(req, userId, event);
// Request blocked if Guardian fails
```

## Future Enhancements

### 1. Plugin System

```typescript
interface GuardianPlugin {
  beforeProcess?(event: GuardianEvent): Promise<GuardianEvent>;
  afterProcess?(event: GuardianEvent, result: GuardianResult): Promise<void>;
}

class PluginGuardian extends Guardian {
  private plugins: GuardianPlugin[] = [];

  addPlugin(plugin: GuardianPlugin): void {
    this.plugins.push(plugin);
  }
}
```

### 2. Strategy Pattern

```typescript
interface RiskAssessmentStrategy {
  assess(scope: DataScope, dataClass: DataClass, metadata: Record<string, unknown>): RiskAssessment;
}

class MLRiskAssessmentStrategy implements RiskAssessmentStrategy {
  assess(...): RiskAssessment {
    // Use ML model
  }
}

class RuleBasedRiskAssessmentStrategy implements RiskAssessmentStrategy {
  assess(...): RiskAssessment {
    // Use rules
  }
}
```

### 3. Factory Pattern

```typescript
class GuardianFactory {
  static create(userId: string, options?: {
    optimized?: boolean;
    batched?: boolean;
    cached?: boolean;
  }): Guardian {
    let guardian = new Guardian(userId);
    
    if (options?.optimized) {
      guardian = new OptimizedGuardian(userId);
    }
    
    if (options?.batched) {
      // Wrap with batch writer
    }
    
    return guardian;
  }
}
```

---

**Last Updated**: 2024
**Version**: 1.0.0
