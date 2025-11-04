# Investor & Growth Remediation Suite

This directory contains all artifacts from the Investor & Growth Remediation Orchestrator.

## Overview

The remediation orchestrator performs comprehensive audits across five domains:
1. **Technical**: Performance, security, CI/CD, scalability
2. **Product**: Roadmap, UX, telemetry, adoption
3. **GTM**: Funnel, CAC/LTV, channel mix
4. **Finance**: Runway, burn, margin proxies, sensitivity
5. **Governance**: Compliance, IP, bus-factor

## Artifacts

### Audit Reports
- `TECHNICAL_AUDIT.json` / `TECHNICAL_AUDIT.md` - Technical audit findings
- `PRODUCT_AUDIT.json` / `PRODUCT_AUDIT.md` - Product audit findings
- `GTM_AUDIT.json` / `GTM_AUDIT.md` - GTM & Growth audit findings
- `FINANCIAL_AUDIT.json` / `FINANCIAL_AUDIT.md` - Financial forecast audit
- `GOVERNANCE_AUDIT.json` / `GOVERNANCE_AUDIT.md` - Governance & compliance scan

### Issue Management
- `ISSUE_REGISTER.json` - Centralized issue registry with severity scoring
- `PR_PLANS/*.md` - Detailed PR plans for each issue

### Models & Data
- `FORECAST_MODEL.json` - Financial forecast model structure
- `GTM_FUNNEL.json` - GTM funnel metrics structure

### Reports
- `EXEC_SUMMARY_FIXED.md` - Executive summary (investor-ready)
- `VALIDATION_REPORT.md` / `VALIDATION_REPORT.json` - Validation & regression results

## Usage

### Run Full Orchestration
```bash
npm run remediation:orchestrate
# or
node scripts/orchestrate_remediation.mjs
```

### Run Individual Audits
```bash
npm run remediation:audit:tech
npm run remediation:audit:product
npm run remediation:audit:gtm
npm run remediation:audit:finance
npm run remediation:audit:governance
```

### Validate Remediation
```bash
npm run remediation:validate
# or
node scripts/validate_remediation.mjs
```

### Open PRs Automatically
```bash
bash infra/fixes/_open_prs.sh
```

## Workflow

1. **Diagnosis**: Run all audits → Generate findings
2. **Classification**: Score issues → Create ISSUE_REGISTER.json
3. **Planning**: Generate PR plans and fix scripts
4. **Remediation**: Apply fixes on topic branches (safe mode)
5. **Validation**: Re-run checks → Produce before/after deltas
6. **Reporting**: Generate executive summary

## Fix Scripts

Fix scripts are located in `infra/fixes/`:
- `fix_*.sh` - Bash fix scripts
- `fix_*.mjs` - Node.js fix scripts
- `fix_*.py` - Python fix scripts
- `_apply_and_stage.sh` - Helper to apply and stage fixes
- `_open_prs.sh` - Helper to open PRs for all fixes

## CI Integration

The orchestrator runs automatically via GitHub Actions:
- `.github/workflows/remediation_orchestrator.yml`

Triggers:
- Manual dispatch
- Pull requests
- Scheduled (daily at 4 AM UTC)

## Quality Bar

- ✅ Every finding is logged with severity and PR plan
- ✅ Critical issues create auto PRs with isolated branches
- ✅ Validation report shows resolved/unresolved status
- ✅ No direct commits to main; only PR-based changes
