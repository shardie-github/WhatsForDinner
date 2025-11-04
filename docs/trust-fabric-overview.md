# Trust Fabric Overview

## What is Guardian?

Guardian is a self-governing privacy system that continuously monitors your app's behavior, explains it to you, and builds trust through transparency and accountability.

## Core Principles

1. **Transparency**: Every data access is logged and explained in plain language
2. **Accountability**: Cryptographic hash chains ensure data integrity
3. **User Control**: You own your data and privacy settings
4. **Offline-First**: Works without internet connection
5. **Open Source**: Fully auditable and explainable

## How It Works

### 1. Event Monitoring

Guardian hooks into all telemetry events via middleware:
- API calls
- Content processing
- Location access
- Audio/video capture
- Telemetry transmission

### 2. Risk Assessment

Each event is assessed for risk:
- **Low Risk**: Routine operations, local processing
- **Medium Risk**: External API calls, sensitive data
- **High Risk**: Credentials, biometrics, external sharing

### 3. Action Enforcement

Based on risk level, Guardian:
- **Allows**: Low-risk operations proceed normally
- **Masks**: Sensitive data is hidden before processing
- **Redacts**: Sensitive content is removed before transmission
- **Blocks**: High-risk operations are prevented
- **Alerts**: Critical risks trigger user notifications

### 4. Immutable Ledger

All events are logged to an append-only ledger with:
- Cryptographic hash chains (tamper-proof)
- Timestamps and fingerprints
- User-friendly explanations

### 5. Trust Reporting

Weekly reports show:
- Total events monitored
- Risk distribution
- Actions taken
- Anomalies detected
- Trust score

## Privacy Insurance Features

### Private Mode Pulse

Quick toggle to freeze telemetry instantly. One click, instant privacy.

### Sensitive Context Detection

Automatically mutes monitoring when:
- Camera is active
- Microphone is active
- Location services are active

### MFA Bubble

Elevated sessions expire sooner when Guardian detects increased risk.

### Emergency Data Lockdown

1-click killswitch that:
- Wipes local telemetry
- Pauses background sync
- Disables all data collection

## Trust Fabric AI

Guardian learns your comfort zones:
- Which signals you disable
- Which operations you allow/block
- Your privacy mode toggle frequency

Adaptive recommendations suggest tighter or looser defaults based on your behavior.

## User Dashboard

Visit `/dashboard/trust` to see:
- This week's data access summary
- Risk meter visualization
- Recent actions list
- Trust score and confidence

## Explainability

Press `?` on any UI element or ask Guardian GPT:
- "What data powers this feature?"
- "Why was my data accessed?"
- "Who accessed my data?"
- "What would happen if I disable monitoring?"

## Export/Import

Export your Trust Fabric model (JSON) for portability. Import it on another device to maintain your privacy preferences.

## Compliance

- RLS (Row Level Security) enforced
- Zero-trust architecture (user-only access)
- No admin access to user telemetry
- GDPR/CCPA compliant
- Cryptographic verification

## Open Source

Guardian is fully open-source and auditable. All code is available for review.

---

For technical details, see `docs/privacy-api-reference.md`.
