# Internal Service Level Agreements (SLA)

**What's for Dinner? — Internal SLAs**

## Overview

Internal SLAs define service level targets for **What's for Dinner?** operations, including uptime, performance, and support response times.

**Review Frequency**: Quarterly  
**Target Compliance**: 95%+

---

## 1. Uptime SLAs

### 1.1 Application Uptime

**Target**: 99.5% uptime (monthly)

**Calculation**:
- **Monthly Downtime**: ≤ 3.6 hours/month
- **Annual Downtime**: ≤ 43.8 hours/year

**Measurement**:
- **Monitoring**: Uptime monitoring (Pingdom, UptimeRobot, or similar)
- **Measurement**: HTTP 200 responses (not 5xx errors)
- **Exclusions**: Scheduled maintenance (announced 24 hours in advance)

**Current Performance**: [To be measured]

---

### 1.2 API Uptime

**Target**: 99.9% uptime (monthly)

**Calculation**:
- **Monthly Downtime**: ≤ 43 minutes/month
- **Annual Downtime**: ≤ 8.76 hours/year

**Measurement**:
- **Monitoring**: API endpoint monitoring
- **Measurement**: Successful API responses (2xx status codes)
- **Exclusions**: Scheduled maintenance

**Current Performance**: [To be measured]

---

## 2. Performance SLAs

### 2.1 Page Load Time

**Target**: < 3 seconds (first contentful paint)

**Measurement**:
- **Tool**: Lighthouse, WebPageTest
- **Threshold**: 3 seconds (p95)
- **Pages**: Homepage, meal planning, grocery lists

**Current Performance**: [To be measured]

---

### 2.2 API Response Time

**Target**: < 500ms (p95)

**Measurement**:
- **Tool**: APM (Application Performance Monitoring)
- **Threshold**: 500ms (p95)
- **Endpoints**: All API endpoints

**Current Performance**: [To be measured]

---

### 2.3 Database Query Performance

**Target**: < 100ms (p95)

**Measurement**:
- **Tool**: Database monitoring (Supabase)
- **Threshold**: 100ms (p95)
- **Queries**: All database queries

**Current Performance**: [To be measured]

---

## 3. Support SLAs

### 3.1 Response Time

**Target**: Within 24 hours (standard), within 4 hours (urgent)

**Measurement**:
- **Tool**: Support ticket tracking
- **Threshold**: 95% of tickets responded within SLA
- **Categories**: See Customer Support SOP

**Current Performance**: [To be measured]

---

### 3.2 Resolution Time

**Target**: Within 72 hours (standard), within 24 hours (urgent)

**Measurement**:
- **Tool**: Support ticket tracking
- **Threshold**: 90% of tickets resolved within SLA
- **Categories**: See Customer Support SOP

**Current Performance**: [To be measured]

---

## 4. Data SLAs

### 4.1 Data Backup

**Target**: Daily backups, retained for 30 days

**Measurement**:
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Testing**: Monthly restore tests

**Current Performance**: ✅ Implemented

---

### 4.2 Data Recovery Time Objective (RTO)

**Target**: < 4 hours

**Measurement**:
- **Time**: Time to restore from backup
- **Testing**: Quarterly DR drills

**Current Performance**: [To be measured]

---

### 4.3 Data Recovery Point Objective (RPO)

**Target**: < 1 hour

**Measurement**:
- **Data Loss**: Maximum data loss in event of failure
- **Backup Frequency**: Hourly backups (critical data)

**Current Performance**: [To be measured]

---

## 5. Security SLAs

### 5.1 Vulnerability Response

**Target**: Critical vulnerabilities patched within 24 hours

**Measurement**:
- **Severity**: Critical (CVSS 9.0+)
- **Response**: Patch deployed within 24 hours
- **Tracking**: Vulnerability tracking system

**Current Performance**: [To be measured]

---

### 5.2 Security Incident Response

**Target**: Security incidents responded to within 1 hour

**Measurement**:
- **Incident**: Security breaches, data leaks
- **Response**: Incident response team notified within 1 hour
- **Tracking**: Incident tracking system

**Current Performance**: [To be measured]

---

## 6. Compliance SLAs

### 6.1 Privacy Requests (DSAR)

**Target**: Responded within 30 days (PIPEDA requirement)

**Measurement**:
- **Request**: Data Subject Access Request (DSAR)
- **Response**: Data provided within 30 days
- **Tracking**: DSAR tracking system

**Current Performance**: ✅ Compliant

---

### 6.2 CASL Compliance

**Target**: Unsubscribe processed within 10 days

**Measurement**:
- **Unsubscribe**: Marketing email unsubscribe requests
- **Processing**: Unsubscribed within 10 days (CASL requirement)
- **Tracking**: Unsubscribe tracking system

**Current Performance**: ✅ Compliant

---

## 7. Monitoring & Reporting

### 7.1 Monitoring Tools

**Uptime**: Pingdom, UptimeRobot  
**Performance**: Lighthouse, WebPageTest, APM  
**Support**: Email tracking, ticket system  
**Security**: Vulnerability scanning, incident tracking

### 7.2 Reporting

**Frequency**: Monthly  
**Metrics**: Uptime, performance, support SLAs  
**Distribution**: Internal team, stakeholders

---

## 8. SLA Violations

### 8.1 Violation Process

**If SLA is violated**:
1. **Document**: Document violation (root cause, impact)
2. **Notify**: Notify stakeholders
3. **Remediate**: Take corrective action
4. **Review**: Review and update SLAs if needed

### 8.2 Escalation

**Escalation Criteria**:
- **Repeated Violations**: Multiple violations in a month
- **Critical Violations**: Critical SLA violations (uptime, security)

**Escalation Process**: Notify founder/leadership

---

## 9. Continuous Improvement

### 9.1 SLA Reviews

**Frequency**: Quarterly  
**Process**: Review SLAs, update targets, measure performance

### 9.2 Improvement Actions

**Actions**:
- ✅ Optimize performance (reduce response times)
- ✅ Improve uptime (redundancy, monitoring)
- ✅ Enhance support (reduce response times)

---

## 10. Conclusion

**SLA Philosophy**: Set realistic targets, measure performance, continuously improve.

**Key Principles**:
- ✅ Uptime: 99.5%+ (application), 99.9%+ (API)
- ✅ Performance: < 3s (page load), < 500ms (API)
- ✅ Support: < 24h (response), < 72h (resolution)
- ✅ Compliance: PIPEDA (30 days), CASL (10 days)

---

*Last Updated: [Auto-generated via CI]*
