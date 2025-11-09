# Expo Time to Interactive (TTI) Telemetry

## Overview

Time to Interactive (TTI) telemetry collection for Expo mobile applications enables performance monitoring and trend analysis.

## Configuration

TTI telemetry is controlled by the `EXPO_PUBLIC_TELEMETRY` environment variable (configured in `ops.config.json`).

**Enable Telemetry:**
```bash
EXPO_PUBLIC_TELEMETRY=true
```

**Disable Telemetry:**
```bash
EXPO_PUBLIC_TELEMETRY=false
# or unset the variable
```

## Implementation

### Telemetry Endpoint

The telemetry endpoint should be available at `/api/telemetry` (or create if missing).

**Expected Payload:**
```json
{
  "metric": "tti",
  "value": 1500,
  "unit": "ms",
  "platform": "ios|android",
  "appVersion": "1.0.0",
  "deviceInfo": {
    "model": "iPhone 14",
    "osVersion": "17.0"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Expo App Integration

Add TTI measurement to your Expo app:

```typescript
// Example: apps/mobile/src/hooks/useTTI.ts
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useTTI() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TELEMETRY !== 'true') {
      return;
    }

    const startTime = Date.now();
    
    // Measure TTI (simplified - adjust based on your app's interactive state)
    const measureTTI = () => {
      const tti = Date.now() - startTime;
      
      // Send to telemetry endpoint
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: 'tti',
          value: tti,
          unit: 'ms',
          platform: Platform.OS,
          appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);
    };

    // Trigger measurement when app becomes interactive
    // Adjust timing based on your app's initialization
    const timer = setTimeout(measureTTI, 100);
    
    return () => clearTimeout(timer);
  }, []);
}
```

### API Endpoint Implementation

If `/api/telemetry` doesn't exist, create it:

```typescript
// apps/web/src/app/api/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify telemetry is enabled
  if (process.env.EXPO_PUBLIC_TELEMETRY !== 'true') {
    return NextResponse.json(
      { error: 'Telemetry disabled' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate payload
    if (!data.metric || !data.value) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Store telemetry data (implement your storage solution)
    // Example: Store in database, send to analytics service, etc.
    // await storeTelemetry(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process telemetry' },
      { status: 500 }
    );
  }
}
```

## Performance Report Integration

The agent automatically adds a "TTI trend" section to `PERFORMANCE_REPORT.md` when telemetry data is available.

**Report Section:**
```markdown
## Mobile Performance (Expo)

### Time to Interactive (TTI)
- **Current:** {{ tti_ms }}ms
- **Target:** ≤ 2000ms
- **Trend:** {{ tti_trend }}
- **Status:** {{ tti_status }}
```

## Monitoring

### Metrics to Track

- **TTI (ms):** Time from app start to interactive state
- **Platform:** iOS vs Android performance
- **Device Info:** Model and OS version correlation
- **App Version:** Performance across versions

### Dashboards

- **Admin Dashboard:** `/admin/metrics` (if TTI data integrated)
- **Performance Report:** `PERFORMANCE_REPORT.md`
- **Custom Analytics:** Implement as needed

## Privacy Considerations

- **User Consent:** Ensure telemetry collection complies with privacy policy
- **Data Minimization:** Only collect necessary metrics
- **Anonymization:** Avoid collecting PII
- **Retention:** Define data retention policy

## Testing

1. **Enable Telemetry:**
   ```bash
   export EXPO_PUBLIC_TELEMETRY=true
   ```

2. **Run Expo App:**
   ```bash
   cd apps/mobile
   npx expo start
   ```

3. **Verify Data Collection:**
   - Check `/api/telemetry` endpoint receives data
   - Verify data appears in storage/analytics
   - Check `PERFORMANCE_REPORT.md` for TTI trends

## Troubleshooting

### Telemetry Not Sending

- Verify `EXPO_PUBLIC_TELEMETRY=true` is set
- Check network connectivity
- Verify `/api/telemetry` endpoint exists and is accessible
- Check console for errors

### Data Not Appearing in Reports

- Verify telemetry data is being stored
- Check agent has access to telemetry data source
- Verify report generation includes TTI section

## Related Documentation

- [Performance Report](../../PERFORMANCE_REPORT.md)
- [Configuration Reference](../../ops.config.json)
- [Mobile App Documentation](../../apps/mobile/README.md)

---

**Last Updated:** {{ timestamp }}  
**Owner:** Mobile Team  
**Configuration:** `ops.config.json` → `telemetry.expo_flag`
