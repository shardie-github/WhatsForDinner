# Daily Operations Routine — Automated Venture Operations

**Time Budget:** 15 minutes/day  
**Focus:** Review automated reports, fix critical issues, approve releases

---

## 🌅 Morning Startup Checklist (15 min)

### Automated Systems Check (5 min)
1. **Review Ops Dashboard**
   ```bash
   npm run ops doctor
   ```
   - Check health status: ✅ Green / ⚠️ Yellow / 🔴 Red
   - Review automated alerts from last 24h
   - Check database backup status (runs nightly)

2. **Review Automated Reports**
   - `/ops/dashboards/reports/daily-summary-YYYY-MM-DD.csv` (auto-generated)
   - Marketing dashboard: Leads captured, conversions, traffic sources
   - Finance dashboard: Revenue (CAD), expenses, GST/HST tracking
   - Support dashboard: Open tickets, resolved count, avg response time

3. **Check CI/CD Status**
   - Visit GitHub Actions tab
   - Verify nightly backups completed
   - Check for failed deployments or test failures

### Quick Actions (5 min)
4. **Fix Critical Issues** (if any)
   - Red alerts → Immediate action required
   - Yellow alerts → Schedule for next sprint
   - Review auto-generated PRs from `ops:fix` commands

5. **Approve Automated Releases** (if applicable)
   ```bash
   npm run ops release --dry-run  # Preview
   npm run ops release patch       # If all checks pass
   ```

### Weekly Tasks (5 min)
6. **Monday: Weekly Review**
   - Growth report: `/ops/dashboards/reports/weekly-growth-YYYY-MM-DD.md`
   - Review investor outreach pipeline (if fundraising)
   - Plan content calendar for week

7. **Friday: End-of-Week Wrap**
   - Weekly finance snapshot (CAD totals)
   - Update investor CRM if applicable
   - Schedule next week's content posts

---

## 🤖 What Runs Automatically (No Action Needed)

### Every Hour
- **Analytics Collection**: User events → Supabase → Marketing dashboard
- **Health Checks**: Synthetic monitors hit prod endpoints
- **Support Ticket Routing**: New tickets auto-assigned by priority

### Daily (Nightly)
- **Database Backup**: Supabase snapshot → Encrypted storage
- **Analytics Reports**: Daily summary CSV generated
- **Finance Snapshot**: Revenue, expenses logged to finance dashboard
- **Marketing Automation**: Follow-up emails sent (Zapier/Make)
- **Content Publishing**: Scheduled social posts go live

### Weekly (Sunday Night)
- **Growth Report**: Cohort analysis, LTV, churn metrics
- **Security Audit**: Automated secret rotation check
- **Performance Benchmarks**: Lighthouse CI runs
- **Compliance Check**: Privacy audit, data retention policies

### Monthly (1st of Month)
- **DR Rehearsal**: Disaster recovery test (automated)
- **Dependencies Update**: Security patches applied
- **Finance Reconciliation**: GST/HST calculations (CAD)
- **Investor Update**: If fundraising, auto-generated report

---

## 🚨 Manual Intervention Scenarios

### When to Break Routine
1. **Red Alert**: System down, security breach, payment failure
   - Action: Follow `/ops/runbooks/DR.md`
   - Escalation: Contact hosting provider if needed

2. **Customer Escalation**: High-priority support ticket
   - Action: Review `/ops/support/helpdesk-playbook.md`
   - Response time target: < 2 hours

3. **Regulatory Notice**: Privacy/GDPR/PIPEDA request
   - Action: Follow `/ops/compliance/privacy-matrix.yaml`
   - Timeline: Respond within 30 days (legal requirement)

4. **Investor Inquiry**: Due diligence request
   - Action: Review `/ops/funding/seed-prep-playbook.md`
   - Provide access to investor data room

---

## 📊 Daily Metrics to Track

| Metric | Target | Dashboard |
|--------|--------|-----------|
| System Uptime | > 99.9% | Ops dashboard |
| New Leads | Varies | Marketing dashboard |
| Conversion Rate | > 2% | Marketing dashboard |
| Support Tickets | < 5 open | Support dashboard |
| Revenue (CAD) | Track daily | Finance dashboard |
| Active Users | Track weekly | Growth dashboard |

---

## 🔄 Automation Dependencies

### Required Services (Free Tier OK)
- **Supabase**: Database, auth, functions
- **Vercel**: Hosting, CI/CD
- **GitHub**: Code repo, Actions
- **Zapier/Make**: Marketing automation (free tier: 100 tasks/month)
- **Google Sheets**: Finance dashboard (free)
- **Airtable**: CRM (free tier: 1,200 records)

### Fallback (If Automation Fails)
All scripts include `--manual` flags for offline/fallback execution:
```bash
npm run ops:snapshot --manual
npm run ops:restore <snapshot-id> --manual
```

---

## 📝 Notes

- **Time Zone**: All times in EST/EDT (Eastern Time)
- **Currency**: All financials in CAD (Canadian Dollars)
- **GST/HST**: Tracked automatically in finance dashboard
- **Offline Mode**: If internet is down, scripts write to local CSV, sync when online

---

**Last Updated:** 2025-01-XX  
**Next Review:** Quarterly (or when automation changes)
