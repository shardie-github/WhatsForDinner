# Automated Venture Operations Suite — Overview

**Purpose:** Systemized workflows, scripts, and dashboards for hands-off Canadian venture operations

---

## 📁 Directory Structure

```
ops/
├── daily-routine.md                    # 15-min daily startup checklist
├── automation-blueprints/              # Automation workflows
│   ├── github-ci-autodeploy.yml       # Auto-deploy to Vercel
│   ├── github-daily-analytics.yml     # Daily analytics reports
│   ├── supabase-maintenance.yml       # Weekly DB backups
│   ├── vercel-autoupdate.yml          # Preview deployments
│   ├── zapier-make-flows.json         # No-code automation blueprints
│   └── recipe-content-sync-flow.md    # Recipe content automation (whatsfordinner)
├── dashboards/                         # Dashboard templates
│   ├── marketing-dashboard-template.csv
│   ├── finance-dashboard-template.csv
│   ├── kpi-tracker-template.csv
│   └── reports/                        # Auto-generated reports
├── marketing/                          # Marketing automation
│   ├── automated-leadflow-guide.md
│   └── crm-integration-guide.md
├── support/                            # Customer support
│   ├── helpdesk-playbook.md
│   └── chatbot-faq-builder.md
├── growth/                             # Growth automation
│   ├── influencer-outreach-automation.md
│   ├── content-seeding-checklist.md
│   └── community-engagement-plan.md
├── legal/                              # Legal templates
│   ├── vendor-contract-template.md
│   └── nda-template.md
└── funding/                            # Fundraising resources
    ├── seed-prep-playbook.md
    ├── investor-outreach-email-bank.md
    └── grant-and-incubator-list-canada.md
```

---

## 🚀 Quick Start

### 1. Daily Routine (15 minutes)

Read [`daily-routine.md`](./daily-routine.md) for your daily startup checklist:
- Review automated reports
- Check system health
- Approve releases (if needed)

### 2. Set Up Automation

**GitHub Actions:**
- Copy workflows from `automation-blueprints/` to `.github/workflows/`
- Configure secrets in GitHub repository settings

**Zapier/Make:**
- Import `zapier-make-flows.json` into Zapier/Make
- Replace placeholder values ({{notion_crm_database_id}}, etc.)
- Connect your accounts

### 3. Initialize Dashboards

**Marketing Dashboard:**
- Open `dashboards/marketing-dashboard-template.csv`
- Import to Google Sheets or Airtable
- Connect Zapier automation to auto-update

**Finance Dashboard:**
- Open `dashboards/finance-dashboard-template.csv`
- Import to Google Sheets
- Connect Stripe webhook to auto-update

**KPI Tracker:**
- Open `dashboards/kpi-tracker-template.csv`
- Update weekly with actual metrics

---

## 📋 Automation Setup Checklist

### GitHub Actions
- [ ] `github-ci-autodeploy.yml` → `.github/workflows/`
- [ ] `github-daily-analytics.yml` → `.github/workflows/`
- [ ] `supabase-maintenance.yml` → `.github/workflows/`
- [ ] `vercel-autoupdate.yml` → `.github/workflows/`
- [ ] Secrets configured (SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN, etc.)

### Zapier/Make
- [ ] Account created (free tier OK)
- [ ] `zapier-make-flows.json` imported
- [ ] Placeholder values replaced
- [ ] Accounts connected (Google, Notion, Stripe, Supabase, Slack)
- [ ] Zaps tested and activated

### Dashboards
- [ ] Marketing dashboard set up (Google Sheets/Airtable)
- [ ] Finance dashboard set up (Google Sheets)
- [ ] KPI tracker set up (Google Sheets)
- [ ] Automation connected (Zapier → Dashboards)

---

## 🎯 What Runs Automatically

### Every Hour
- Analytics collection (user events → Supabase → Marketing dashboard)
- Health checks (synthetic monitors)
- Support ticket routing

### Daily (Nightly)
- Database backup (Supabase snapshot)
- Analytics reports (daily summary CSV)
- Finance snapshot (revenue, expenses)
- Marketing automation (follow-up emails)
- Content publishing (scheduled social posts)

### Weekly (Sunday Night)
- Growth report (cohort analysis, LTV, churn)
- Security audit (secret rotation check)
- Performance benchmarks (Lighthouse CI)
- Compliance check (privacy audit)

### Monthly (1st of Month)
- DR rehearsal (disaster recovery test)
- Dependencies update (security patches)
- Finance reconciliation (GST/HST calculations)
- Investor update (if fundraising)

---

## 📚 Documentation Guide

### Operations
- **[Daily Routine](./daily-routine.md)** - 15-minute daily checklist
- **[Automation Blueprints](./automation-blueprints/)** - GitHub Actions, Zapier/Make flows

### Marketing
- **[Automated Lead Flow](./marketing/automated-leadflow-guide.md)** - Lead capture → CRM → Email
- **[CRM Integration](./marketing/crm-integration-guide.md)** - Notion/Airtable setup

### Support
- **[Helpdesk Playbook](./support/helpdesk-playbook.md)** - Customer support workflows
- **[Chatbot FAQ Builder](./support/chatbot-faq-builder.md)** - Automated FAQ chatbot

### Growth
- **[Influencer Outreach](./growth/influencer-outreach-automation.md)** - Automated influencer partnerships
- **[Content Seeding](./growth/content-seeding-checklist.md)** - Content creation workflow
- **[Community Engagement](./growth/community-engagement-plan.md)** - Reddit, Instagram, Twitter strategy

### Legal
- **[Vendor Contract](./legal/vendor-contract-template.md)** - Simplified contract template
- **[NDA Template](./legal/nda-template.md)** - Mutual NDA template

### Funding
- **[Seed Prep Playbook](./funding/seed-prep-playbook.md)** - Fundraising preparation guide
- **[Investor Email Bank](./funding/investor-outreach-email-bank.md)** - Pre-written email templates
- **[Grants & Incubators](./funding/grant-and-incubator-list-canada.md)** - Canadian funding programs

---

## 🔒 Privacy & Compliance

All automation touches user data. Ensure PIPEDA compliance:
- ✅ User consent captured at form submission
- ✅ Data stored securely (Supabase encryption)
- ✅ User can request deletion via `/api/privacy/delete`
- ✅ Audit logs maintained for all data access

See [`compliance/privacy-matrix.yaml`](../compliance/privacy-matrix.yaml) for details.

---

## 💰 Cost Breakdown (CAD)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| GitHub Actions | 2,000 min/month | Included |
| Zapier | 100 tasks/month | $29.99/month |
| Supabase | Free (50K MAU) | $25/month |
| Vercel | Free (hobby) | $20/month |
| Google Sheets | Free | Free |
| Notion | Free (personal) | $12/month |

**Recommended:** Start with free tiers, upgrade as needed.

---

## 🚨 Manual Fallback

If automation fails, all scripts include `--manual` flags:

```bash
# Manual database backup
npm run ops:snapshot --manual

# Manual analytics report
node scripts/generate-dashboard.ts --manual

# Manual email send (if Zapier down)
# Export CSV → Import to Mailchimp/Brevo → Send
```

---

## ✅ Maintenance

**Weekly:**
- Review automation logs
- Check dashboard accuracy
- Update email templates (if needed)

**Monthly:**
- Optimize automation workflows
- Review costs (upgrade/downgrade services)
- Update documentation

**Quarterly:**
- Review all automation workflows
- Update legal templates (if needed)
- Refresh investor CRM (if fundraising)

---

## 📞 Support

**Issues:**
- Check [`daily-routine.md`](./daily-routine.md) troubleshooting section
- Review automation logs (GitHub Actions, Zapier)
- Consult individual guide documents

**Contributing:**
- Update automation blueprints as needed
- Add new workflows to this directory
- Keep documentation current

---

**Last Updated:** 2025-01-XX  
**Next Review:** Quarterly
