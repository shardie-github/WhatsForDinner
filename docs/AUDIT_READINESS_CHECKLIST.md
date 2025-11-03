# SOC 2 Type II & ISO 27001 Audit Readiness Checklist

## Pre-Audit Preparation (8 weeks before)

### Documentation Review
- [ ] All documentation up-to-date and accessible
- [ ] `docs/SOC2_ISO_EVIDENCE.md` reviewed and accurate
- [ ] `docs/DR_BCP.md` current and tested
- [ ] `docs/INCIDENT_RUNBOOK.md` reflects current procedures
- [ ] `docs/CHANGE_MANAGEMENT.md` process documented
- [ ] `docs/RUNBOOKS.md` operational procedures current
- [ ] `docs/APPSTORE_PRIVACY_PACK.md` privacy disclosures current

### Evidence Collection
- [ ] Generate evidence bundle: `pnpm evidence:bundle`
- [ ] Verify all security scan reports available
- [ ] Confirm audit logs accessible (12 months minimum)
- [ ] Review incident logs for past 12 months
- [ ] Verify backup verification records current
- [ ] Confirm change management records available
- [ ] Review access control logs

### Technical Controls Verification
- [ ] Security scanning workflows operational (`.github/workflows/security.yml`)
- [ ] Backup scripts tested and verified
- [ ] Disaster recovery plan tested (quarterly drill)
- [ ] Monitoring and alerting configured
- [ ] Access controls reviewed and tested
- [ ] Encryption in transit and at rest verified

## 4 Weeks Before Audit

### Gap Analysis
- [ ] Review SOC 2 Common Criteria controls
- [ ] Review ISO 27001 controls
- [ ] Identify any gaps in evidence
- [ ] Document and remediate gaps
- [ ] Update evidence mapping document

### Process Validation
- [ ] Run complete backup/restore test
- [ ] Execute DR drill (if not recent)
- [ ] Review incident response procedures
- [ ] Validate change management process
- [ ] Test access control procedures

### Stakeholder Communication
- [ ] Notify engineering team of audit
- [ ] Assign audit coordinator
- [ ] Schedule audit kickoff meeting
- [ ] Prepare audit scope document

## 2 Weeks Before Audit

### Final Evidence Preparation
- [ ] Generate final evidence bundle
- [ ] Organize evidence by control
- [ ] Create evidence index
- [ ] Verify all evidence links work
- [ ] Prepare auditor access credentials

### System Readiness
- [ ] Verify all monitoring systems operational
- [ ] Confirm backup systems functioning
- [ ] Test alerting systems
- [ ] Review security configurations
- [ ] Confirm compliance with policies

### Team Preparation
- [ ] Schedule auditor interviews
- [ ] Prepare technical team for questions
- [ ] Review common audit questions
- [ ] Prepare process demonstrations

## Week of Audit

### Daily Preparation
- [ ] Review day's audit activities
- [ ] Ensure evidence ready for review
- [ ] Coordinate with technical team
- [ ] Document any issues discovered
- [ ] Follow up on auditor requests

### Evidence Presentation
- [ ] Provide evidence bundle to auditor
- [ ] Grant access to systems (as appropriate)
- [ ] Schedule system walkthroughs
- [ ] Provide documentation access

## Post-Audit Follow-up

### Response to Findings
- [ ] Review audit findings
- [ ] Prioritize remediation actions
- [ ] Assign remediation owners
- [ ] Create remediation timeline
- [ ] Implement fixes

### Continuous Improvement
- [ ] Update documentation based on findings
- [ ] Enhance controls as needed
- [ ] Schedule next audit preparation
- [ ] Update evidence mapping

## Evidence Checklist by Control Domain

### Access Control (CC6 / ISO A.9)
- [ ] Access control policy documented
- [ ] User access provisioning process
- [ ] Access removal procedures
- [ ] Privileged access management
- [ ] Access control logs (12 months)
- [ ] Access review records

### System Operations (CC7 / ISO A.12)
- [ ] Monitoring system evidence
- [ ] Incident response logs
- [ ] Change management records
- [ ] Backup verification records
- [ ] Capacity management evidence

### Change Management (CC8 / ISO A.12.6)
- [ ] Change management policy
- [ ] Code review records
- [ ] Testing evidence
- [ ] Deployment logs
- [ ] Rollback procedures

### Business Continuity (ISO A.17)
- [ ] DR/BCP plan
- [ ] DR drill results (quarterly)
- [ ] Backup procedures
- [ ] Failover procedures
- [ ] Recovery time/point objectives evidence

### Compliance (ISO A.18)
- [ ] Legal/regulatory mapping
- [ ] Privacy policy compliance
- [ ] GDPR compliance evidence
- [ ] App Store privacy disclosures

## Evidence Locations

### Code Evidence
- Repository: `https://github.com/org/nomad`
- Security scans: `.github/workflows/security.yml` artifacts
- Deployment logs: `.github/workflows/deploy.yml` runs

### Documentation
- Location: `docs/` directory
- Evidence mapping: `docs/SOC2_ISO_EVIDENCE.md`

### Logs & Metrics
- Monitoring: Grafana dashboards
- Audit logs: Database (`audit_logs` table)
- Application logs: Loki

### Configuration
- Environment variables: `.env.example` (template)
- Deployment configs: `.github/workflows/`
- Infrastructure: `docker-compose.observability.yml`

## Auditor Access

Provide auditors with:
1. **Evidence Bundle ZIP:** Generated via `pnpm evidence:bundle`
2. **Documentation Access:** `docs/` directory (read-only)
3. **System Access:** Grafana dashboards (read-only)
4. **Repository Access:** GitHub (read-only, specific branch)
5. **Database Access:** Audit logs query (read-only, sanitized)

## Contact Information

**Audit Coordinator:**
- Name: [Your Name]
- Email: compliance@nomad.app
- Phone: [Phone Number]

**Technical Contacts:**
- Engineering Lead: engineering@nomad.app
- Infrastructure: infrastructure@nomad.app
- Security: security@nomad.app

## Revision History

- **v1.0** (2024-01-XX): Initial audit readiness checklist