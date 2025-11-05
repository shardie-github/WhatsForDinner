# Trust & Transparency

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

## Product Promises

### What We Do

- **AI-Powered Meal Planning:** We use machine learning to suggest recipes based on your pantry ingredients, dietary preferences, and cooking history.
- **Privacy-First Design:** Your data belongs to you. We minimize data collection and provide tools for export and deletion.
- **Secure Infrastructure:** All data is encrypted in transit and at rest. We use industry-standard security practices.
- **Transparent Operations:** We communicate incidents, maintenance windows, and changes proactively.

### What We Don't Do

- **Sell Your Data:** We never sell your personal information to third parties.
- **Share Without Consent:** We don't share your data except as necessary to provide the service (e.g., with payment processors).
- **Track Without Purpose:** We only collect data necessary to provide and improve the service.
- **Store Sensitive Data Unnecessarily:** We follow data minimization principles and retention policies.

---

## Data Map

### Categories of Data We Collect

| Category | Purpose | Storage Location | Retention Period |
|----------|---------|------------------|------------------|
| **Account Data** | Authentication, account management | Supabase (PostgreSQL) | Until account deletion |
| **Pantry Data** | Recipe suggestions, meal planning | Supabase (PostgreSQL) | Until account deletion |
| **Usage Data** | Service improvement, analytics | Supabase (PostgreSQL) | 180 days |
| **Payment Data** | Subscription processing | Stripe (PCI-compliant) | Per Stripe retention policy |
| **Cookies & Tracking** | Session management, preferences | Browser local storage | Session or 365 days |

### Data Processing Purposes

1. **Service Delivery:** Provide meal planning, recipe suggestions, and account management
2. **Service Improvement:** Analyze usage patterns to improve algorithms and UX
3. **Security:** Detect and prevent fraud, abuse, and security threats
4. **Compliance:** Meet legal obligations and enforce terms of service
5. **Communication:** Send service updates, support responses, and marketing (with consent)

### International Transfers

Data is stored in Supabase infrastructure (currently US-based). When you use our service from outside the US, your data may be transferred to and processed in the US. We ensure appropriate safeguards are in place per GDPR requirements.

---

## Consent Model & Toggles

### Types of Consent

1. **Functional Cookies:** Required for service operation (session management, authentication)
   - **Status:** Cannot be disabled (service requires these)
   - **Control:** Automatic

2. **Analytics Cookies:** Help us understand usage patterns
   - **Status:** Opt-in by default
   - **Control:** Manage in Settings → Privacy

3. **Marketing Cookies:** Used for personalized advertising (if applicable)
   - **Status:** Opt-in only
   - **Control:** Manage in Settings → Privacy

### Consent Management

- **Granular Controls:** You can enable/disable specific cookie categories
- **Easy Access:** Privacy settings accessible from your account or footer
- **Withdrawal:** You can withdraw consent at any time
- **Impact:** Disabling analytics may reduce service personalization

---

## Security Posture

### Authentication

- **Multi-Factor Authentication (MFA):** Available for all accounts (optional)
- **Password Requirements:** Minimum 8 characters, complexity recommended
- **Session Management:** Secure JWT tokens with configurable expiry
- **Account Recovery:** Email-based password reset with rate limiting

### Access Control

- **Row-Level Security (RLS):** Database-level access control ensures users can only access their own data
- **Least Privilege:** Applications use minimal database permissions
- **API Authentication:** All API endpoints require authentication

### Encryption

- **In Transit:** TLS 1.3 for all API communications
- **At Rest:** Database encryption managed by Supabase (PostgreSQL)
- **Secrets:** Application secrets stored in environment variables, never committed

### Infrastructure

- **Hosting:** Vercel (edge network) + Supabase (managed PostgreSQL)
- **CDN:** Global edge network for static assets
- **DDoS Protection:** Managed by hosting providers
- **Monitoring:** 24/7 monitoring and alerting

---

## SLA/SLO Overview

### Service Level Objectives (SLOs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| **Availability** | 99.9% uptime | Monthly |
| **API Latency (p95)** | < 500ms | Daily |
| **Error Rate** | < 0.1% | Daily |
| **Recipe Generation** | < 5 seconds | Per request |

### Error Budgets

- **Availability:** 0.1% downtime per month (~43 minutes)
- **Error Rate:** 0.1% error rate threshold
- **Response:** If error budget exhausted, we prioritize stability over new features

### Incident Communication

- **Status Page:** [status.whatsfordinner.com](/status)
- **Email Updates:** Subscribe at status@whatsfordinner.com
- **Response Times:**
  - Critical incidents: < 1 hour acknowledgment
  - Major incidents: < 4 hours acknowledgment
  - Minor incidents: < 24 hours acknowledgment

See [STATUS.md](./STATUS.md) for detailed incident communication policy.

---

## Data Subject Rights

### Right to Access

You can request a copy of all personal data we hold about you.

**How to Request:**
- Via account settings: [Export My Data](/account/export)
- Via email: privacy@whatsfordinner.com
- Response time: Within 30 days

### Right to Rectification

You can correct inaccurate personal data.

**How to Request:**
- Via account settings: Edit your profile
- Via email: privacy@whatsfordinner.com
- Response time: Within 7 days

### Right to Erasure ("Right to be Forgotten")

You can request deletion of your account and data.

**How to Request:**
- Via account settings: [Delete Account](/settings/account/delete)
- Via email: privacy@whatsfordinner.com
- Response time: Within 30 days
- **Note:** Some data may be retained for legal compliance (e.g., transaction records)

### Right to Data Portability

You can export your data in a machine-readable format.

**How to Request:**
- Via account settings: [Export My Data](/account/export)
- Formats: JSON, CSV
- Response time: Within 30 days

### Right to Object

You can object to processing of your data for certain purposes (e.g., marketing).

**How to Request:**
- Via account settings: Privacy preferences
- Via email: privacy@whatsfordinner.com
- Response time: Within 7 days

### Right to Restrict Processing

You can request restriction of data processing in certain circumstances.

**How to Request:**
- Via email: privacy@whatsfordinner.com
- Response time: Within 7 days

---

## Contact

### Privacy Inquiries
- **Email:** privacy@whatsfordinner.com
- **Response Time:** Within 7 business days

### Security Issues
- **Email:** security@whatsfordinner.com
- **Response Time:** Within 24 hours (critical issues)

### General Support
- **Email:** support@whatsfordinner.com
- **Help Center:** [/help](/help)

---

## Changes to This Document

We may update this document periodically. Significant changes will be communicated via:
- Email notification (for account holders)
- Banner on website (for 30 days)
- Updated "Last Updated" date

**Last Updated:** 2025-01-XX
