# How Privacy-First Monitoring Works

## Overview

Privacy-first usage monitoring is an opt-in feature that analyzes your device/app activity to suggest workflow improvements. All data collection, storage, and access follows zero-trust principles where only you can access your data.

## Flow Diagram

```
┌─────────────────┐
│  User Consent   │
│  (Opt-in)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MFA Setup      │
│  (Required)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  App Allowlist  │
│  Selection      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Signal Toggles │
│  Configuration  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Local          │
│  Redaction      │
│  (Client-side)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Encrypted      │
│  Storage        │
│  (RLS-protected)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analysis &     │
│  Suggestions    │
└─────────────────┘
```

## Key Components

### 1. Consent & Onboarding

- Step-by-step wizard explains purpose and benefits
- Explicit opt-in required (default: OFF)
- No dark patterns or nudging

### 2. Local-First Processing

- Redaction happens on-device before network send
- Sensitive fields (passwords, message contents) are stripped
- Only metadata is collected by default

### 3. Zero-Trust Storage

- All data encrypted at rest (pgcrypto)
- Row-Level Security (RLS) ensures user-only access
- No admin bypass - even staff cannot view user telemetry

### 4. MFA Enforcement

- Required for sensitive actions:
  - Enabling/disabling monitoring
  - Exporting data
  - Deleting data
  - Viewing transparency log
- Time-boxed elevated sessions (15 minutes)

### 5. Transparency Log

- Immutable append-only log of all privacy actions
- Shows when data was collected, accessed, exported, or deleted
- User can view their own log anytime

### 6. Data Retention

- User-configurable retention period (default: 14 days)
- Automatic purging of expired data
- Soft delete → hard delete after 7-day grace period

## Security Architecture

```
┌─────────────────────────────────────────┐
│         User Layer                      │
│  (Browser/App with Local Redaction)    │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│         API Layer                       │
│  (MFA Verification, Rate Limiting)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Database Layer                  │
│  (RLS Policies, Encryption at Rest)    │
└─────────────────────────────────────────┘
```

## Privacy Safeguards

1. **Opt-in Only**: Monitoring is OFF by default
2. **Granular Control**: Per-app and per-signal toggles
3. **Encryption**: All sensitive data encrypted at rest
4. **Zero Admin Access**: No staff/admin can view user telemetry
5. **MFA Required**: Sensitive actions require MFA
6. **Transparency**: Immutable audit log of all actions
7. **Data Retention**: User-configurable automatic deletion
8. **Export/Delete**: User can export or delete data anytime

## Kill Switch

System-wide kill switch (`PRIVACY_KILL_SWITCH=true`) disables all collection at runtime. When active, the Privacy HUD shows "Private Mode" and no telemetry is collected.

## Compliance

- GDPR compliant (data portability, right to erasure)
- CCPA/CPRA compliant
- DSAR endpoints available
- 30-day SLA for support requests
