# App Store Privacy Attestations

## iOS App Store Privacy

### Privacy Information Required by Apple

#### Data Collection Categories

**Location Data**
- **Purpose:** Provide location-based meal recommendations
- **Collected:** Approximate location (city-level)
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Third-Party Sharing:** No

**User Content**
- **Purpose:** Personalized meal plans, dietary preferences
- **Collected:** Meal preferences, dietary restrictions, pantry items
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Third-Party Sharing:** No (aggregated data only for analytics)

**Identifiers**
- **Purpose:** User authentication, account management
- **Collected:** User ID, device ID
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Third-Party Sharing:** No

**Usage Data**
- **Purpose:** Improve app performance, analytics
- **Collected:** App interactions, feature usage, crash logs
- **Linked to User:** Yes (anonymized)
- **Used for Tracking:** No
- **Third-Party Sharing:** Yes (analytics providers only)

**Diagnostics**
- **Purpose:** Crash reporting, performance monitoring
- **Collected:** Crash logs, performance metrics
- **Linked to User:** No (anonymized)
- **Used for Tracking:** No
- **Third-Party Sharing:** Yes (Sentry, analytics)

### Data Use Disclosure

**Personalization**
- Meal recommendations based on preferences
- Dietary restriction filtering
- Location-based suggestions

**Analytics**
- Usage analytics (anonymized)
- Feature adoption tracking
- Performance monitoring

**Advertising**
- None (no third-party advertising)

**Product Improvement**
- Feature usage analysis
- User feedback analysis
- A/B testing (with consent)

### Data Sharing

**No Sale of Data:** Nomad does not sell user data to third parties.

**Limited Sharing:**
- Analytics providers (anonymized data only)
- Payment processors (Stripe - transaction data only)
- Infrastructure providers (Supabase, Vercel - encrypted at rest)

### User Rights

Users can:
1. **Access Data:** Via in-app settings or DSAR request
2. **Delete Data:** Account deletion removes all personal data
3. **Export Data:** DSAR export available
4. **Opt-Out:** Disable analytics in settings

### Compliance

- **GDPR:** Compliant (EU users)
- **CCPA:** Compliant (California users)
- **COPPA:** Compliant (no data collection from children < 13)

## Android Play Store Privacy

### Privacy Policy Location

https://nomad.app/privacy

### Data Safety Section

**Data Collection:**
- **Personal Info:** Email, name (account creation)
- **Location:** Approximate location (optional)
- **App Activity:** Interactions, feature usage
- **Device IDs:** Device identifiers (for analytics)

**Data Usage:**
- App functionality
- Analytics
- Developer communications

**Data Sharing:**
- Analytics providers (anonymized)
- Payment processors (transaction data only)

**Security Practices:**
- Data encryption in transit (TLS)
- Data encryption at rest
- User data can be deleted
- No data sale

### User Controls

Users can:
- Request data deletion
- Export data (DSAR)
- Opt-out of analytics
- Manage location permissions

## Combined Privacy Statement

### Data Minimization

Nomad collects only data necessary for:
1. Account creation and authentication
2. Meal plan generation
3. Payment processing
4. Service improvement (with consent)

### Security Measures

1. **Encryption:** All data encrypted in transit (TLS 1.3) and at rest (AES-256)
2. **Access Controls:** Role-based access control (RBAC)
3. **Audit Logging:** All access logged and monitored
4. **Regular Audits:** Security assessments quarterly

### Third-Party Services

**Infrastructure:**
- **Supabase:** Database and authentication (encrypted)
- **Vercel:** Hosting (edge network)
- **Stripe:** Payments (PCI DSS compliant)

**Analytics:**
- **Sentry:** Error tracking (anonymized)
- **PostHog:** Analytics (with consent, anonymized)

**No Advertising Networks:** Nomad does not use third-party advertising.

### Data Retention

- **Active Users:** Data retained while account is active
- **Deleted Accounts:** Data purged within 30 days
- **Inactive Accounts:** Auto-deleted after 2 years of inactivity
- **Legal Holds:** Data retained if legal hold is active

### International Data Transfers

- **EU Users:** Data processed in EU region (Supabase EU)
- **GDPR Compliance:** Standard Contractual Clauses (SCCs)
- **Other Regions:** Processed in closest region

### Updates to Privacy Practices

Users notified of material changes:
- In-app notification
- Email notification
- Updated privacy policy date

## Compliance Certifications

- **SOC 2 Type II:** In progress
- **ISO 27001:** In progress
- **GDPR:** Compliant
- **CCPA:** Compliant

## Contact Information

**Privacy Officer:** privacy@nomad.app
**Data Protection Officer:** dpo@nomad.app

**Address:**
Nomad Privacy Team
[Company Address]

## Revision History

- **v1.0** (2024-01-XX): Initial privacy pack