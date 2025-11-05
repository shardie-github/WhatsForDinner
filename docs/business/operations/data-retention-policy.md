# Data Retention Policy

**What's for Dinner? — Data Retention and Deletion Policy**

**Last Updated**: [Auto-generated via CI]  
**Effective Date**: [Date]

---

## 1. Overview

This policy defines how **What's for Dinner?** retains and deletes user data in accordance with PIPEDA and best practices for data minimization.

**Principles**:
- ✅ Retain data only as long as necessary
- ✅ Delete data securely when no longer needed
- ✅ Comply with PIPEDA requirements
- ✅ Respect user rights (deletion requests)

---

## 2. Data Retention Periods

### 2.1 Account Data

**Retention Period**: While account is active + 2 years after last activity

**Data Types**:
- Name, email, password (hashed)
- Account preferences, settings
- Subscription status, payment history

**Deletion**: 
- **User-Initiated**: Deleted within 30 days of deletion request
- **Automated**: Deleted 2 years after last activity (inactive accounts)

---

### 2.2 Meal Planning Data

**Retention Period**: While account is active + 2 years after last activity

**Data Types**:
- Meal plans, preferences, dietary restrictions
- Pantry information, grocery lists
- Recipe favorites, cooking history

**Deletion**: 
- **User-Initiated**: Deleted within 30 days of deletion request
- **Automated**: Deleted 2 years after last activity (inactive accounts)

---

### 2.3 Usage Data (Analytics)

**Retention Period**: 12 months (anonymized)

**Data Types**:
- App usage, feature usage, performance metrics
- Device information, OS version

**Deletion**: 
- **Anonymized**: After 12 months
- **Opt-Out**: Deleted immediately upon opt-out

---

### 2.4 Payment Data

**Retention Period**: 7 years (tax compliance)

**Data Types**:
- Subscription status, payment history, invoices
- Billing address (if provided)

**Deletion**: 
- **Legal Requirement**: Retained for 7 years (tax compliance)
- **User Request**: Deleted after 7 years (if requested)

**Note**: Payment data (credit cards) handled by Stripe, not stored by us.

---

### 2.5 Support Data

**Retention Period**: 3 years after ticket closure

**Data Types**:
- Support tickets, emails, chat logs
- Customer feedback, bug reports

**Deletion**: 
- **Automated**: Deleted 3 years after ticket closure
- **User Request**: Deleted earlier if requested

---

### 2.6 Consent Records (CASL)

**Retention Period**: 3 years after consent expires

**Data Types**:
- Consent date, method, purpose
- Unsubscribe records

**Deletion**: 
- **Legal Requirement**: Retained for 3 years (CASL requirement)
- **Automated**: Deleted after 3 years

---

## 3. Deletion Process

### 3.1 User-Initiated Deletion

**Process**:
1. User requests account deletion (in-app or email)
2. Verify user identity (email confirmation)
3. Delete user data (within 30 days)
4. Send confirmation email

**Data Deleted**:
- ✅ Account information (name, email, password)
- ✅ Meal planning data (meal plans, preferences, pantry)
- ✅ Usage data (analytics, if opt-in)
- ✅ Support data (tickets, emails)

**Data Retained** (if required by law):
- ⚠️ Payment data (7 years, tax compliance)
- ⚠️ Consent records (3 years, CASL requirement)

---

### 3.2 Automated Deletion

**Process**:
1. Identify inactive accounts (2 years since last activity)
2. Send deletion warning email (30 days before deletion)
3. Delete account and data (after 30 days)

**Inactive Account Criteria**:
- No login activity for 2 years
- No app usage for 2 years
- No subscription activity for 2 years

---

### 3.3 Secure Deletion

**Methods**:
- **Database**: Secure deletion (overwrite, not just mark as deleted)
- **Backups**: Deleted from backups (within retention period)
- **Logs**: Deleted from logs (within retention period)

**Verification**:
- ✅ Verify deletion (confirm data removed)
- ✅ Audit logs (track deletion events)

---

## 4. Data Retention Exceptions

### 4.1 Legal Requirements

**Retention Required**:
- ⚠️ Payment data: 7 years (tax compliance)
- ⚠️ Consent records: 3 years (CASL requirement)
- ⚠️ Legal disputes: Until resolution (if applicable)

**Process**: Retain data as required by law, delete after requirement expires.

---

### 4.2 Active Investigations

**Retention Required**:
- ⚠️ Security incidents: Until investigation complete
- ⚠️ Legal disputes: Until resolution

**Process**: Retain data for investigation, delete after resolution.

---

## 5. User Rights (PIPEDA)

### 5.1 Right to Deletion

**User Right**: Users can request deletion of their data at any time.

**Process**:
1. User requests deletion (in-app or email)
2. Verify user identity
3. Delete data (within 30 days)
4. Send confirmation email

**Exceptions**:
- ⚠️ Legal requirements (payment data, consent records)
- ⚠️ Active investigations

---

### 5.2 Right to Access

**User Right**: Users can request access to their data (DSAR).

**Process**:
1. User requests access (in-app or email)
2. Verify user identity
3. Provide data (within 30 days, PIPEDA requirement)
4. Format: JSON or CSV export

---

## 6. Data Retention Schedule

### 6.1 Retention Schedule

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| Account Data | Active + 2 years | Automated (inactive accounts) |
| Meal Planning Data | Active + 2 years | Automated (inactive accounts) |
| Usage Data | 12 months | Automated (anonymized) |
| Payment Data | 7 years | Legal requirement (tax) |
| Support Data | 3 years | Automated (after ticket closure) |
| Consent Records | 3 years | Legal requirement (CASL) |

---

## 7. Monitoring & Compliance

### 7.1 Monitoring

**Tools**:
- ✅ Database monitoring (identify inactive accounts)
- ✅ Audit logs (track deletion events)
- ✅ Compliance audits (quarterly)

**Frequency**: Quarterly audits

---

### 7.2 Compliance

**Requirements**:
- ✅ PIPEDA compliance (user rights, retention)
- ✅ CASL compliance (consent records, 3 years)
- ✅ Tax compliance (payment data, 7 years)

**Status**: ✅ Compliant

---

## 8. Policy Updates

### 8.1 Changes to Policy

We may update this Data Retention Policy from time to time. We will notify you of changes by:
- **Email**: Sending an email to your registered address
- **In-App**: Displaying a notice in the app
- **Website**: Posting the updated policy on our website

**Effective Date**: The "Last Updated" date at the top of this policy indicates when changes take effect.

---

## 9. Contact Information

**Questions**: privacy@whats-for-dinner.ca  
**Deletion Requests**: support@whats-for-dinner.ca  
**Response Time**: Within 30 days (PIPEDA requirement)

---

## 10. Conclusion

**Policy Philosophy**: Retain data only as long as necessary, delete securely when no longer needed.

**Key Principles**:
- ✅ Retain data only as long as necessary
- ✅ Delete data securely (overwrite, not just mark as deleted)
- ✅ Comply with legal requirements (PIPEDA, CASL, tax)
- ✅ Respect user rights (deletion, access)

---

*Last Updated: [Auto-generated via CI]*
