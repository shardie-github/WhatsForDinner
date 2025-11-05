# Incident Communication SOP

**What's for Dinner? — Incident Communication Templates**

## Overview

This document provides templates and procedures for communicating incidents (outages, bugs, security issues) to users, stakeholders, and the public.

**Incident Types**: App outages, data breaches, security issues, performance degradation  
**Communication Channels**: Status page, email, in-app notifications, social media

---

## 1. Incident Classification

### 1.1 Severity Levels

**Critical (P0)**:
- App completely unavailable
- Data loss or corruption
- Security breach
- Payment processing failure

**High (P1)**:
- Core feature broken (meal planning, grocery lists)
- Significant performance degradation
- Partial outage (affects >50% of users)

**Medium (P2)**:
- Minor feature broken (non-critical)
- Performance issues (affects <50% of users)
- Integration issues (grocery stores)

**Low (P3)**:
- UI bugs, display issues
- Minor performance degradation
- Non-critical feature issues

---

## 2. Communication Channels

### 2.1 Status Page

**URL**: https://status.whats-for-dinner.ca  
**Purpose**: Real-time incident updates, maintenance notices

**Updates Required**:
- **Incident Start**: Initial post (within 15 minutes)
- **Updates**: Every 30 minutes (during incident)
- **Resolution**: Final update (within 15 minutes of resolution)

### 2.2 Email Notifications

**Recipients**: All users (for Critical/High incidents)  
**Template**: See Section 3

**Frequency**:
- **Critical**: Immediate (within 1 hour)
- **High**: Within 4 hours
- **Medium/Low**: Optional (status page only)

### 2.3 In-App Notifications

**Purpose**: Alert users about incidents affecting their experience  
**Template**: See Section 4

### 2.4 Social Media

**Channels**: Twitter, LinkedIn (if applicable)  
**Purpose**: Public announcements, transparency

---

## 3. Email Templates

### Template 1: Critical Incident (App Down)

**Subject**: Important: What's for Dinner? Service Interruption

```
Hi [Name],

We're experiencing a service interruption that's affecting [What's for Dinner?] right now.

**What's Happening**:
[Brief description of issue]

**Impact**:
- [Specific impact on users]

**What We're Doing**:
- [Actions being taken]

**Expected Resolution**:
- [Estimated time to resolution]

**Updates**:
- Check our status page for real-time updates: https://status.whats-for-dinner.ca
- We'll send another email when the issue is resolved

We apologize for any inconvenience and appreciate your patience.

Best regards,
[Your Name]
What's for Dinner? Team
```

### Template 2: High Priority Incident (Feature Broken)

**Subject**: Update: [Feature Name] Currently Unavailable

```
Hi [Name],

We're aware that [feature name] is currently experiencing issues.

**What's Happening**:
[Brief description of issue]

**Impact**:
- [Specific impact on users]
- [Workaround, if available]

**What We're Doing**:
- [Actions being taken]

**Expected Resolution**:
- [Estimated time to resolution]

**Updates**:
- Check our status page: https://status.whats-for-dinner.ca

We're working to resolve this as quickly as possible.

Best regards,
[Your Name]
What's for Dinner? Team
```

### Template 3: Security Incident

**Subject**: Important Security Update

```
Hi [Name],

We're writing to inform you about a security incident that may have affected your account.

**What Happened**:
[Brief description of security incident]

**What Information Was Affected**:
[What data was potentially exposed]

**What We're Doing**:
- [Actions being taken]
- [Security measures implemented]

**What You Should Do**:
- [Actions users should take]
- [Password reset, if needed]

**Resources**:
- Privacy Policy: https://whats-for-dinner.ca/privacy
- Security Best Practices: https://whats-for-dinner.ca/security

We take security seriously and apologize for any concern this may cause.

Best regards,
[Your Name]
What's for Dinner? Team
```

### Template 4: Resolution Notification

**Subject**: Issue Resolved: [Issue Description]

```
Hi [Name],

The issue affecting [What's for Dinner?] has been resolved.

**What Was Fixed**:
[Brief description of fix]

**What to Do**:
- [Actions users should take, if any]
- [Refresh app, clear cache, etc.]

**If You're Still Experiencing Issues**:
- Reply to this email
- Contact support@whats-for-dinner.ca

We apologize for any inconvenience and thank you for your patience.

Best regards,
[Your Name]
What's for Dinner? Team
```

---

## 4. Status Page Templates

### Template 1: Incident Start

**Title**: [Service Name] - Investigating

**Status**: 🔴 Investigating

**Description**:
```
We're currently investigating an issue affecting [service/feature]. Some users may be experiencing [symptoms].

We'll provide updates every 30 minutes.
```

**Updates**:
- **[Time]**: Investigating issue
- **[Time]**: [Update]

### Template 2: Incident Update

**Title**: [Service Name] - Identified

**Status**: 🟡 Identified

**Description**:
```
We've identified the issue: [root cause]. We're working on a fix.

Expected resolution: [time].
```

**Updates**:
- **[Time]**: Investigating issue
- **[Time]**: Issue identified
- **[Time]**: Working on fix

### Template 3: Incident Resolved

**Title**: [Service Name] - Resolved

**Status**: ✅ Resolved

**Description**:
```
The issue has been resolved. [Service/feature] is now functioning normally.

If you're still experiencing issues, please contact support@whats-for-dinner.ca
```

**Updates**:
- **[Time]**: Investigating issue
- **[Time]**: Issue identified
- **[Time]**: Fix deployed
- **[Time]**: Resolved

---

## 5. In-App Notification Templates

### Template 1: Service Interruption

**Title**: Service Interruption

**Message**:
```
We're experiencing a service interruption. Some features may be unavailable.

[Status Page Link]

We're working to resolve this quickly. Thank you for your patience.
```

### Template 2: Feature Unavailable

**Title**: [Feature] Temporarily Unavailable

**Message**:
```
[Feature name] is currently experiencing issues. We're working on a fix.

Expected resolution: [time].

[Status Page Link]
```

### Template 3: Maintenance Window

**Title**: Scheduled Maintenance

**Message**:
```
We're performing scheduled maintenance on [date/time].

Expected downtime: [duration].

[Status Page Link]
```

---

## 6. Social Media Templates

### Template 1: Incident Announcement (Twitter)

```
We're currently experiencing an issue with [What's for Dinner?]. Some users may be experiencing [symptoms].

We're working to resolve this quickly. Updates: https://status.whats-for-dinner.ca

We apologize for any inconvenience.
```

### Template 2: Resolution (Twitter)

```
The issue affecting [What's for Dinner?] has been resolved. Everything should be working normally now.

If you're still experiencing issues, please contact support@whats-for-dinner.ca

Thank you for your patience.
```

---

## 7. Post-Incident Communication

### 7.1 Post-Mortem Template

**Subject**: Post-Incident Report: [Issue Description]

**Sections**:
1. **What Happened**: Brief description
2. **Root Cause**: Technical explanation
3. **Impact**: Users affected, duration
4. **What We're Doing**: Preventive measures
5. **Timeline**: Incident timeline

**Distribution**: 
- **Internal**: Team, stakeholders
- **External**: Optional (for Critical incidents)

### 7.2 Follow-Up Actions

- **Customer Communication**: Email update (if applicable)
- **Status Page**: Post-mortem summary
- **Documentation**: Update runbooks, procedures

---

## 8. Communication Timeline

### Critical (P0) Incident

- **0-15 minutes**: Status page update
- **0-1 hour**: Email notification (if applicable)
- **Every 30 minutes**: Status page updates
- **Resolution**: Status page update, email notification

### High (P1) Incident

- **0-30 minutes**: Status page update
- **0-4 hours**: Email notification (if applicable)
- **Every 1 hour**: Status page updates
- **Resolution**: Status page update, email notification

### Medium/Low (P2/P3) Incident

- **0-1 hour**: Status page update
- **As needed**: Status page updates
- **Resolution**: Status page update

---

## 9. Best Practices

### 9.1 Communication Principles

- **Transparency**: Be honest about what's happening
- **Timeliness**: Communicate quickly (within SLA)
- **Clarity**: Use plain language, avoid jargon
- **Empathy**: Acknowledge user impact

### 9.2 What to Avoid

- ❌ Downplaying severity
- ❌ Blaming external factors (without context)
- ❌ Making promises you can't keep
- ❌ Using technical jargon

---

## 10. Conclusion

**Communication Philosophy**: Keep users informed, be transparent, and acknowledge impact.

**Key Principles**:
- Communicate quickly (within SLA)
- Be transparent about what's happening
- Provide regular updates
- Follow up after resolution

---

*Last Updated: [Auto-generated via CI]*
