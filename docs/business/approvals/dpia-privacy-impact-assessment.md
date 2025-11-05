# Privacy Impact Assessment (DPIA)

**What's for Dinner? — Data Protection Impact Assessment**

## Overview

This Data Protection Impact Assessment (DPIA) evaluates the privacy risks and mitigations for **What's for Dinner?** in accordance with PIPEDA and best practices for privacy protection.

**Assessment Date**: [Auto-generated via CI]  
**Assessor**: [Your Name]  
**Review Frequency**: Annual (or upon significant changes)

---

## 1. Description of Processing

### 1.1 Purpose of Processing

**What's for Dinner?** processes personal information to:
- Provide meal planning services (meal suggestions, grocery lists)
- Manage user accounts (authentication, preferences)
- Integrate with grocery stores (Loblaws, Metro, Sobeys)
- Process payments (subscriptions via Stripe)
- Improve services (opt-in analytics)

### 1.2 Types of Personal Information Processed

- **Account Information**: Name, email, password (hashed)
- **Meal Planning Data**: Meal plans, preferences, dietary restrictions, pantry information
- **Usage Data**: App usage, device information (opt-in only)
- **Payment Data**: Subscription status, payment history (handled by Stripe)

### 1.3 Data Subjects

- **Primary**: End users (Canadians using the app)
- **Secondary**: Grocery store customers (if grocery integration collects data)

### 1.4 Data Recipients

- **Internal**: What's for Dinner? (authorized employees only)
- **Service Providers**: Supabase (database), Stripe (payments), Analytics providers (opt-in)
- **Third Parties**: Grocery store APIs (Loblaws, Metro, Sobeys)

---

## 2. Legal Basis for Processing

### 2.1 Consent

- **Express Consent**: Account creation, opt-in analytics
- **Implied Consent**: Essential app functionality (meal planning, account management)

### 2.2 Legitimate Interests

- **Service Delivery**: Processing necessary to provide meal planning services
- **Improvement**: Processing necessary to improve app functionality (with consent)

### 2.3 Legal Obligations

- **Tax Compliance**: GST/HST record-keeping (payment data)
- **Privacy Compliance**: PIPEDA compliance, data retention policies

---

## 3. Privacy Risks Assessment

### Risk 1: Unauthorized Access to User Accounts

**Risk Level**: Medium  
**Likelihood**: Medium  
**Impact**: High

**Description**: Unauthorized access to user accounts could expose meal plans, preferences, and personal information.

**Mitigation**:
- ✅ Strong password requirements (minimum 8 characters, complexity)
- ✅ Password hashing (bcrypt, never stored in plain text)
- ✅ Rate limiting on login attempts
- ✅ Multi-factor authentication (MFA) option (future)
- ✅ Encryption in transit (HTTPS) and at rest

**Residual Risk**: Low (mitigations in place)

---

### Risk 2: Data Breach

**Risk Level**: Medium  
**Likelihood**: Low  
**Impact**: High

**Description**: Data breach could expose user personal information, meal plans, and preferences.

**Mitigation**:
- ✅ Encryption in transit (HTTPS) and at rest
- ✅ Access controls (RBAC, limited access to personal information)
- ✅ Regular security audits
- ✅ Incident response plan (see SOP)
- ✅ Data minimization (collect only necessary data)

**Residual Risk**: Low (security measures in place)

---

### Risk 3: Third-Party Data Sharing

**Risk Level**: Low  
**Likelihood**: Medium  
**Impact**: Medium

**Description**: Sharing data with third-party service providers (Supabase, Stripe, grocery stores) could expose user data.

**Mitigation**:
- ✅ Data processing agreements (DPAs) with service providers
- ✅ Canadian data residency (Supabase Canada)
- ✅ Limited data sharing (only necessary data)
- ✅ No selling data to third parties (explicitly stated in Privacy Policy)

**Residual Risk**: Low (contractual safeguards in place)

---

### Risk 4: Insufficient Data Retention

**Risk Level**: Low  
**Likelihood**: Low  
**Impact**: Medium

**Description**: Retaining data longer than necessary violates PIPEDA principles.

**Mitigation**:
- ✅ Data retention policy (2 years inactivity, then deletion)
- ✅ Automated deletion (inactive accounts)
- ✅ User-initiated deletion (account deletion requests)
- ✅ Regular data audits (quarterly)

**Residual Risk**: Low (retention policy in place)

---

### Risk 5: Lack of User Control

**Risk Level**: Low  
**Likelihood**: Low  
**Impact**: Medium

**Description**: Users may not have adequate control over their data (access, correction, deletion).

**Mitigation**:
- ✅ User data access (DSAR process, 30-day response)
- ✅ Data correction (in-app editing, email requests)
- ✅ Account deletion (in-app deletion, email requests)
- ✅ Consent withdrawal (opt-out analytics, unsubscribe emails)

**Residual Risk**: Low (user rights implemented)

---

## 4. Privacy by Design Measures

### 4.1 Data Minimization

- ✅ Collect only necessary data (name, email, meal plans)
- ✅ No collection of unnecessary data (location, contacts, etc.)
- ✅ Opt-in analytics (not opt-out)

### 4.2 Purpose Limitation

- ✅ Data used only for stated purposes (meal planning, account management)
- ✅ No secondary use without consent
- ✅ Clear purpose specification in Privacy Policy

### 4.3 Data Residency

- ✅ Canadian data residency (Supabase Canada)
- ✅ No transfers outside Canada (except payment processing, PCI-DSS compliant)

### 4.4 Encryption

- ✅ Encryption in transit (HTTPS)
- ✅ Encryption at rest (database encryption)
- ✅ Password hashing (bcrypt)

### 4.5 Access Controls

- ✅ Role-based access control (RBAC)
- ✅ Limited access to personal information (authorized employees only)
- ✅ Audit logs (access tracking)

---

## 5. User Rights (PIPEDA Compliance)

### 5.1 Access

- ✅ Users can access their data (DSAR process, 30-day response)
- ✅ Data export (JSON format, future feature)

### 5.2 Correction

- ✅ Users can correct inaccurate data (in-app editing, email requests)
- ✅ Prompt correction (within 30 days)

### 5.3 Deletion

- ✅ Users can delete their account and data (in-app deletion, email requests)
- ✅ Deletion within 30 days

### 5.4 Consent Withdrawal

- ✅ Users can withdraw consent (opt-out analytics, unsubscribe emails)
- ✅ Effect of withdrawal clearly communicated

---

## 6. Data Retention & Deletion

### 6.1 Retention Periods

- **Active Accounts**: Data retained while account is active
- **Inactive Accounts**: Data retained for 2 years after last activity, then deleted
- **Deleted Accounts**: Data deleted within 30 days of deletion request
- **Payment Data**: Retained for 7 years (tax compliance)

### 6.2 Deletion Process

- ✅ Automated deletion (inactive accounts, 2 years)
- ✅ User-initiated deletion (account deletion requests)
- ✅ Secure deletion (data overwritten, not just marked as deleted)

---

## 7. Incident Response

### 7.1 Breach Notification

- ✅ Incident response plan (see SOP)
- ✅ Breach notification to Privacy Commissioner (within 72 hours, if required)
- ✅ User notification (if breach affects user data)

### 7.2 Documentation

- ✅ Incident logs (breach events, responses)
- ✅ Privacy impact assessments (annual reviews)

---

## 8. Third-Party Risk Assessment

### 8.1 Service Providers

**Supabase** (Database, Authentication):
- ✅ Canadian data residency
- ✅ Data processing agreement (DPA)
- ✅ Security certifications (SOC 2, ISO 27001)

**Stripe** (Payments):
- ✅ PCI-DSS compliant
- ✅ Data processing agreement (DPA)
- ✅ Payment data not stored by us

**Analytics Providers** (Opt-In):
- ✅ Anonymized data only
- ✅ Canadian data residency (where possible)
- ✅ Opt-in consent required

### 8.2 Grocery Store APIs

**Loblaws, Metro, Sobeys**:
- ✅ Limited data sharing (grocery lists only)
- ✅ No personal information shared
- ✅ Grocery stores handle their own data (separate privacy policies)

---

## 9. Recommendations

### 9.1 Immediate Actions

- ✅ Implement data retention policy (automated deletion)
- ✅ Implement DSAR process (user data access)
- ✅ Add privacy controls in-app (data export, deletion)

### 9.2 Short-Term Improvements (0-3 months)

- ✅ Add multi-factor authentication (MFA)
- ✅ Implement data export feature (JSON format)
- ✅ Add privacy dashboard (data visibility, controls)

### 9.3 Long-Term Improvements (3-12 months)

- ✅ Regular privacy audits (quarterly)
- ✅ Privacy training for employees (if applicable)
- ✅ Privacy by design reviews (new features)

---

## 10. Conclusion

**Overall Privacy Risk**: **LOW**

**Key Strengths**:
- ✅ Canadian data residency
- ✅ Data minimization (collect only necessary data)
- ✅ Opt-in analytics (not opt-out)
- ✅ Strong security measures (encryption, access controls)
- ✅ User rights implemented (access, correction, deletion)

**Areas for Improvement**:
- ⚠️ Add MFA (multi-factor authentication)
- ⚠️ Implement data export feature
- ⚠️ Regular privacy audits (quarterly)

**Compliance Status**: ✅ **PIPEDA-COMPLIANT**

---

**Next Review Date**: [Annual review or upon significant changes]

*Last Updated: [Auto-generated via CI]*
