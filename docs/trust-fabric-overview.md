# Trust Fabric Overview

## What is Guardian?

Guardian is a self-governing privacy system that continuously monitors your app's behavior, explains it to you, and builds trust through transparency and accountability.

## Core Principles

1. **Watch Everything**: Monitors all data access (telemetry, API calls, content processing)
2. **Assess Risk**: Classifies events as low/medium/high/critical
3. **Explain Clearly**: Generates readable summaries for users, not admins
4. **Enforce Boundaries**: Adaptive policies that respect your preferences
5. **Build Trust**: Hash-chained ledger for cryptographic verification

## How It Works

### Data Flow

1. **Event Detection**: Guardian middleware hooks into:
   - Telemetry events
   - API calls
   - Content processing
   - Sensor access (camera, microphone, location)

2. **Risk Assessment**: Each event is scored based on:
   - Data class (telemetry, location, audio, biometrics, content, credentials)
   - Scope (user, app, API, external)
   - Context (sensitive sensors active, patterns)

3. **Action Application**: Guardian applies one of:
   - **allow**: Safe operation, proceed
   - **mask**: Hide sensitive parts
   - **redact**: Remove sensitive data
   - **block**: Prevent access
   - **alert**: Notify user

4. **Ledger Storage**: All events stored in immutable JSONL ledger with:
   - SHA256 fingerprint hash
   - Hash chain (previous_hash links)
   - Timestamp
   - Full metadata

### Trust Fabric AI

Guardian learns from your behavior:

- **Comfort Zones**: Tracks how often you toggle privacy modes
- **Signal Preferences**: Learns which signals you disable
- **Risk Tolerance**: Adapts risk weights based on your decisions
- **Recommendations**: Suggests tighter or looser defaults

## Features

### Private Mode Pulse
Quick toggle to freeze telemetry instantly. One click, all monitoring pauses.

### Sensitive Context Detection
Automatically mutes monitoring when camera or microphone is active.

### MFA Bubble
Elevated sessions expire sooner when Guardian detects increased risk.

### Emergency Data Lockdown
1-click killswitch that:
- Wipes local telemetry cache
- Pauses background sync
- Blocks all data access

### Trust Dashboard
Visual dashboard showing:
- Total events this week
- Confidence score (0-100%)
- Violations prevented
- Hash integrity status
- Risk distribution
- Data access by class

### Weekly Reports
Auto-generated markdown reports with:
- Event breakdowns
- Policy changes
- Anomalies detected
- Guardian confidence score

## Privacy Guarantees

- **Offline-Capable**: Core monitoring works without network
- **Open-Sourced**: All code auditable
- **Explainable**: Every action has a reason
- **User-Owned**: You control your Trust Fabric model
- **Zero-Trust**: Admins cannot access your telemetry

## Integration Points

Guardian integrates with:
- MFA module (elevated sessions)
- Privacy preferences (consent flows)
- Data retention (automatic cleanup)
- Observability metrics (aggregate only)

## Export/Import

Your Trust Fabric model is portable:
- Export as JSON
- Import to other devices
- Take your privacy preferences with you

## Verification

Guardian provides cryptographic verification:
- Hash chain integrity
- Ledger tampering detection
- Daily hash roots stored in Supabase
- CI/CD audit checks

Run verification:
```bash
pnpm ops guardian --verify
```

## Learn More

- [Privacy API Reference](./privacy-api-reference.md)
- [How Guardian Learns](./how-guardian-learns.md)
