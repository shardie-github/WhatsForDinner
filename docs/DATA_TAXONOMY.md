# Data Taxonomy

This document maps all data types collected by Nomad, their purposes, legal basis, retention, and processors.

## Personal Data

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Email Address | Account creation, authentication, communications | Contract | While account active + 30 days | Supabase Auth |
| Name | Profile display, personalization | Contract | While account active + 30 days | Supabase |
| Birth Year | Age gating (COPPA compliance) | Legal Obligation | While account active + 30 days | Supabase |
| Profile Photo | Profile display | Consent | While account active + 30 days | Supabase Storage |

## Sensitive Data

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Health Inputs | Dietary restrictions, allergies (user-provided) | Consent | While account active + 30 days | Supabase |
| Household Members | Family meal planning | Contract | While account active + 30 days | Supabase |

## Device Data

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Device ID | Analytics, fraud prevention | Legitimate Interest | 2 years (anonymized) | Segment, PostHog |
| Advertising ID | Personalized ads (with consent) | Consent | Until consent withdrawn | AdMob, Google Ads |
| IP Address | Security, fraud prevention | Legitimate Interest | 90 days | Supabase, Cloudflare |
| Device Type/OS | App functionality, analytics | Contract | While account active | Segment |
| App Version | Crash reporting, support | Contract | 2 years | Sentry |

## Usage Analytics

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Recipe Views | Personalization, analytics | Consent | 2 years (anonymized) | Segment, PostHog |
| Meal Plan Selections | Core functionality | Contract | While account active + 30 days | Supabase |
| Feature Usage | Product improvement | Consent | 2 years (anonymized) | Segment, PostHog |
| Session Duration | Analytics | Consent | 2 years (anonymized) | Segment, PostHog |

## Advertising Signals

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Ad Impressions | Revenue generation | Consent (adults only) | 90 days | AdMob, Google Ads |
| Ad Clicks | Revenue generation | Consent (adults only) | 90 days | AdMob, Google Ads |
| Interest Categories | Ad targeting | Consent (adults only) | 90 days | AdMob, Google Ads |

## Payment Data

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Subscription Status | Service delivery | Contract | 7 years (legal compliance) | Stripe, Apple, Google |
| Transaction IDs | Receipt validation | Contract | 7 years | Stripe, Apple, Google |
| Payment Method | Payment processing | Contract | Not stored (processed by third parties) | Stripe, Apple, Google |

## Consent Records

| Data Type | Purpose | Lawful Basis | Retention | Processors |
|-----------|---------|--------------|-----------|------------|
| Consent Status | Privacy compliance | Legal Obligation | 7 years | Supabase |
| Consent Timestamps | Audit trail | Legal Obligation | 7 years | Supabase |
| TCF String | IAB TCF compliance | Legal Obligation | 7 years | Supabase |

## Data Minimization Principles

- We collect only data necessary for app functionality
- Sensitive data is collected only with explicit consent
- Analytics data is anonymized after 2 years
- Advertising data is not collected for users under 13 (COPPA)
- Payment data is processed by certified third parties

## Data Subject Rights

Users can exercise their rights by:
1. **Access**: Request data export via Settings ? Privacy ? Download My Data
2. **Correction**: Update profile information in Settings
3. **Deletion**: Request account deletion via Settings ? Privacy ? Delete Account
4. **Portability**: Export includes machine-readable JSON format
5. **Withdraw Consent**: Update privacy preferences in Settings ? Privacy

## Processor Contracts

All third-party processors are bound by Data Processing Agreements (DPAs) that include:
- GDPR compliance obligations
- CCPA compliance
- COPPA compliance
- Data breach notification requirements
- Data retention and deletion obligations
