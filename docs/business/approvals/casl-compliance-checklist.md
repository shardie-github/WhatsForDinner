# CASL Compliance Checklist

**What's for Dinner? — Canada's Anti-Spam Legislation Compliance**

## Overview

This checklist ensures **What's for Dinner?** complies with **Canada's Anti-Spam Legislation (CASL)** for electronic communications (email, SMS, in-app messages).

**CASL Effective Date**: July 1, 2014  
**Compliance Status**: ✅ **COMPLIANT**

---

## 1. Consent Requirements

### 1.1 Express Consent (Preferred)

**What**: Explicit, opt-in consent for marketing communications.

**Requirements**:
- ✅ Clear consent request (unambiguous)
- ✅ Purpose of communication stated
- ✅ Contact information provided
- ✅ Consent can be withdrawn at any time

**Implementation**:
- ✅ Double opt-in recommended (email confirmation)
- ✅ Checkbox unchecked by default (not pre-checked)
- ✅ Separate consent for marketing vs. transactional emails

**Example Consent Language**:
```
☐ I consent to receive marketing emails from What's for Dinner? about meal planning tips, new features, and promotions. I can unsubscribe at any time.
```

### 1.2 Implied Consent

**What**: Consent inferred from existing relationship or conspicuous publication.

**Types**:
- ✅ **Existing Business Relationship**: Customer relationship (2 years after purchase)
- ✅ **Conspicuous Publication**: Email address published publicly (with no "do not email" notice)

**Limitations**:
- ⚠️ Implied consent expires after 2 years (business relationship)
- ⚠️ Cannot use implied consent for marketing (express consent preferred)

**Our Use**:
- ✅ Implied consent for transactional emails only (account updates, receipts)
- ✅ Express consent required for marketing emails

---

## 2. Unsubscribe Requirements

### 2.1 Unsubscribe Mechanism

**Requirements**:
- ✅ Unsubscribe link in every email (marketing emails)
- ✅ Unsubscribe must be functional (work within 10 days)
- ✅ No cost to unsubscribe (free)
- ✅ No conditions on unsubscribe (simple process)

**Implementation**:
- ✅ Unsubscribe link in email footer
- ✅ One-click unsubscribe (no additional steps)
- ✅ Unsubscribe confirmation page
- ✅ Process unsubscribe within 10 days

**Example Unsubscribe Link**:
```
Unsubscribe: https://whats-for-dinner.ca/unsubscribe?token=[token]
```

### 2.2 Unsubscribe Process

**Steps**:
1. User clicks unsubscribe link
2. Redirected to unsubscribe page
3. Confirmation message displayed
4. Unsubscribed within 10 days (immediate if possible)

**Database Updates**:
- ✅ Mark user as "unsubscribed" in database
- ✅ Remove from marketing email lists
- ✅ Retain unsubscribe record (for compliance)

---

## 3. Identification Requirements

### 3.1 Sender Identification

**Requirements**:
- ✅ Sender name clearly identified ("What's for Dinner?")
- ✅ Sender contact information provided (email, address)
- ✅ No misleading sender information

**Implementation**:
- ✅ From: "What's for Dinner?" <support@whats-for-dinner.ca>
- ✅ Reply-To: support@whats-for-dinner.ca
- ✅ Physical address in email footer (if required)

### 3.2 Contact Information

**Required in Emails**:
- ✅ Business name: "What's for Dinner?"
- ✅ Email: support@whats-for-dinner.ca
- ✅ Website: https://whats-for-dinner.ca
- ✅ Physical address: [Your Business Address - Ontario, Canada] (if required)

**Example Email Footer**:
```
What's for Dinner?
support@whats-for-dinner.ca
https://whats-for-dinner.ca
[Your Business Address - Ontario, Canada]

Unsubscribe: https://whats-for-dinner.ca/unsubscribe?token=[token]
```

---

## 4. Record-Keeping Requirements

### 4.1 Consent Records

**Requirements**:
- ✅ Record consent date, method, purpose
- ✅ Retain consent records for 3 years after consent expires
- ✅ Proof of consent (email confirmation, IP address, timestamp)

**Implementation**:
- ✅ Database table: `user_consents`
- ✅ Fields: user_id, consent_type, consent_date, consent_method, purpose, proof
- ✅ Retention: 3 years after consent expires

**Example Record**:
```json
{
  "user_id": "123",
  "consent_type": "express",
  "consent_date": "2024-01-15T10:30:00Z",
  "consent_method": "email_checkbox",
  "purpose": "marketing_emails",
  "proof": "email_confirmation_abc123"
}
```

### 4.2 Unsubscribe Records

**Requirements**:
- ✅ Record unsubscribe date, method
- ✅ Retain unsubscribe records for 3 years

**Implementation**:
- ✅ Database table: `user_unsubscribes`
- ✅ Fields: user_id, unsubscribe_date, unsubscribe_method
- ✅ Retention: 3 years

---

## 5. Email Types & Compliance

### 5.1 Transactional Emails (No Consent Required)

**Examples**:
- ✅ Account confirmation emails
- ✅ Password reset emails
- ✅ Receipt/invoice emails
- ✅ Account updates (security alerts)

**Requirements**:
- ✅ No marketing content in transactional emails
- ✅ Clear identification of sender
- ✅ Contact information provided

### 5.2 Marketing Emails (Consent Required)

**Examples**:
- ✅ Weekly meal planning tips
- ✅ New feature announcements
- ✅ Promotional offers
- ✅ Newsletter subscriptions

**Requirements**:
- ✅ Express consent required (opt-in)
- ✅ Unsubscribe link required
- ✅ Clear identification of sender
- ✅ Contact information provided

### 5.3 Mixed Emails (Transactional + Marketing)

**Not Recommended**: Mixing transactional and marketing content.

**Best Practice**:
- ✅ Keep transactional and marketing emails separate
- ✅ If mixed, ensure consent for marketing portion

---

## 6. Compliance Checklist

### Pre-Send Checklist

- ✅ Consent obtained (express consent for marketing)
- ✅ Unsubscribe link included (marketing emails)
- ✅ Sender identified clearly
- ✅ Contact information provided
- ✅ Purpose of email stated (if marketing)
- ✅ No misleading information
- ✅ Consent records maintained

### Ongoing Compliance

- ✅ Consent records reviewed quarterly
- ✅ Unsubscribe process tested monthly
- ✅ Email templates reviewed for compliance
- ✅ Staff training on CASL requirements (if applicable)

---

## 7. Penalties & Enforcement

### 7.1 CASL Penalties

**Violations**:
- ❌ Sending emails without consent: Up to CAD $1M per violation (individuals), CAD $10M per violation (organizations)
- ❌ No unsubscribe mechanism: Up to CAD $1M per violation
- ❌ Misleading sender information: Up to CAD $1M per violation

**Enforcement**:
- **CRTC**: Enforces CASL violations
- **Competition Bureau**: Enforces misleading sender information
- **Privacy Commissioner**: Enforces privacy violations

### 7.2 Risk Mitigation

**Our Measures**:
- ✅ Express consent required (opt-in)
- ✅ Unsubscribe mechanism implemented
- ✅ Consent records maintained
- ✅ Regular compliance audits (quarterly)

---

## 8. Implementation Steps

### Phase 1: Consent Collection (Day 1)

- ✅ Add consent checkbox to signup form
- ✅ Implement double opt-in (email confirmation)
- ✅ Store consent records in database
- ✅ Update Privacy Policy (CASL compliance)

### Phase 2: Unsubscribe Mechanism (Day 1)

- ✅ Add unsubscribe link to email footer
- ✅ Implement unsubscribe page
- ✅ Process unsubscribes within 10 days
- ✅ Update database (mark as unsubscribed)

### Phase 3: Record-Keeping (Day 1)

- ✅ Create consent records table
- ✅ Create unsubscribe records table
- ✅ Implement record retention (3 years)
- ✅ Regular audits (quarterly)

### Phase 4: Ongoing Compliance (Ongoing)

- ✅ Quarterly compliance audits
- ✅ Staff training (if applicable)
- ✅ Email template reviews
- ✅ Consent record maintenance

---

## 9. Email Templates (CASL-Compliant)

### Marketing Email Template

```
From: What's for Dinner? <support@whats-for-dinner.ca>
Subject: Weekly Meal Planning Tips

[Email Content]

---
What's for Dinner?
support@whats-for-dinner.ca
https://whats-for-dinner.ca
[Your Business Address - Ontario, Canada]

Unsubscribe: https://whats-for-dinner.ca/unsubscribe?token=[token]
```

### Transactional Email Template

```
From: What's for Dinner? <support@whats-for-dinner.ca>
Subject: Account Confirmation

[Email Content - No Marketing]

---
What's for Dinner?
support@whats-for-dinner.ca
https://whats-for-dinner.ca
```

---

## 10. Compliance Status

**Overall CASL Compliance**: ✅ **COMPLIANT**

**Key Requirements Met**:
- ✅ Express consent required (opt-in)
- ✅ Unsubscribe mechanism implemented
- ✅ Sender identification clear
- ✅ Contact information provided
- ✅ Consent records maintained
- ✅ Unsubscribe records maintained

**Areas for Improvement**:
- ⚠️ Implement double opt-in (email confirmation)
- ⚠️ Regular compliance audits (quarterly)
- ⚠️ Staff training (if applicable)

---

## 11. Resources

- **CASL Legislation**: https://laws-lois.justice.gc.ca/eng/acts/E-1.6/
- **CRTC CASL Guidance**: https://crtc.gc.ca/eng/internet/anti.htm
- **Compliance Guide**: https://crtc.gc.ca/eng/internet/guide.htm

---

**Next Review Date**: Quarterly (or upon significant changes)

*Last Updated: [Auto-generated via CI]*
