# Business Document Stack — What's for Dinner?

**Canadian Solo Venture Business Documents (CAD, PIPEDA, CASL)**

This directory contains the complete business document stack for **What's for Dinner?** — a Canadian solo venture (side-gig) operating as a sole proprietorship in Ontario.

## 📁 Document Structure

### Venture Brief (`/venture-brief/`)
Core product and business strategy documents:
- **01_one-pager.md** — Customer-facing one-page overview
- **02_problem-solution-fit.md** — Problem validation and solution fit analysis
- **03-value-prop-matrix.md** — Value proposition mapping
- **04-customer-personas.md** — Target customer profiles
- **05-competitive-landscape.md** — Competitive analysis
- **06_mvp-spec.md** — MVP scope and acceptance criteria
- **07-product-roadmap-q1-q4.md** — Quarterly product roadmap

### Approvals (`/approvals/`)
Regulatory and marketplace compliance documents:
- **appstore-apple-listing.md** — Apple App Store listing requirements
- **appstore-google-play-listing.md** — Google Play Store listing requirements
- **shopify-app-listing.md** — Shopify App Store listing (if applicable)
- **merchant-center-readiness.md** — Google Merchant Center setup
- **privacy-policy-pipeda.md** — PIPEDA-compliant privacy policy
- **terms-of-service.md** — Terms of Service (Canadian law)
- **dpia-privacy-impact-assessment.md** — Privacy Impact Assessment
- **casl-compliance-checklist.md** — CASL e-mail marketing compliance
- **accessibility-wcag22-checklist.md** — WCAG 2.2 accessibility checklist

### Operations (`/operations/`)
Operational procedures and policies:
- **sop-customer-support.md** — Customer support standard operating procedures
- **sop-incident-comms.md** — Incident communication templates
- **refund-cancellation-policy.md** — Refund and cancellation policy
- **sla-internal.md** — Internal service level agreements
- **data-retention-policy.md** — Data retention and deletion policy
- **risk-register.md** — Risk register and mitigation strategies

### Marketing (`/marketing/`)
Go-to-market and content strategy:
- **gtm-plan-90days.md** — 90-day launch and growth plan
- **content-calendar-8w.md** — 8-week content calendar
- **launch-press-kit.md** — Press kit for launch
- **social-post-bank.md** — Pre-written social media posts
- **places-to-post-and-why.md** — Distribution channels and posting strategy
- **influencer-outreach-templates.md** — Influencer outreach email templates

### Sales (`/sales/`)
Sales and pricing materials:
- **pricing-pack-cad.md** — Pricing tiers and value metrics (CAD)
- **sales-scripts-and-objection-handling.md** — Sales conversation guides
- **partnership-outreach-emails.md** — Partnership outreach templates

### Finance (`/finance/`)
Financial models and tracking:
- **budget-minimal-stack-cad.md** — Minimal cost stack breakdown
- **unit-economics-cad.xlsx** — Unit economics model (COGS, CAC, LTV)
- **12mo-cashflow-forecast-cad.xlsx** — 12-month cashflow forecast
- **runway-breakeven-scenarios-cad.xlsx** — Breakeven analysis with sensitivity
- **gst-hst-tracker-on.csv** — GST/HST tracking template (Ontario, 13%)

### Investor (`/investor/`)
Fundraising materials:
- **seed-memo-3p.md** — 3-page seed funding memo
- **pitch-deck-outline-10slides.md** — 10-slide pitch deck outline
- **data-room-checklist.md** — Due diligence data room checklist
- **safe-or-note-overview-canada.md** — SAFE/convertible note overview (Canadian context)
- **traction-metrics-template.md** — Traction metrics tracking template

### Telemetry & UX (`/telemetry-ux/`)
Metrics and user experience tracking:
- **kpis-and-dashboard-spec.md** — KPI definitions and dashboard wireframe
- **user-feedback-loops.md** — User feedback collection processes
- **cohort-analysis-template.csv** — Cohort analysis template

## 🇨🇦 Canadian Compliance Notes

### Tax (GST/HST)
- **Province**: Ontario (default; override via `NEXT_PUBLIC_PROVINCE`)
- **HST Rate**: 13% (GST 5% + PST 8%)
- **Registration**: Required once revenue exceeds CAD $30,000 annually
- **Tracking**: Use `gst-hst-tracker-on.csv` for invoice-level tracking

### Privacy (PIPEDA)
- **Compliance**: Personal Information Protection and Electronic Documents Act
- **Data Residency**: Note data storage location (Supabase region disclosure)
- **Individual Access**: Process for Data Subject Access Requests (DSAR)
- **Purpose Limitation**: Clear purpose specification for data collection

### CASL (E-mail Marketing)
- **Consent**: Double opt-in recommended for marketing e-mails
- **Unsubscribe**: Mandatory unsubscribe link in all marketing e-mails
- **Record-Keeping**: Maintain consent records for audit purposes
- **B2B Exception**: Limited exemption for B2B communications (still recommended to obtain consent)

### Business Structure
- **Current**: Sole Proprietorship (Ontario)
- **Future**: Consider incorporation (Corporation) at revenue milestones or when seeking investment
- **Banking**: Stripe/PayPal payouts; minimize FX exposure

## 📄 PDF Generation

All Markdown files are automatically rendered to PDF via GitHub Actions workflow (`.github/workflows/docs-pdf.yml`).

**Manual generation**:
```bash
# Install Marp CLI
npm install -g @marp-team/marp-cli

# Render individual file
marp docs/business/venture-brief/01_one-pager.md --pdf --output docs/business/_pdf/

# Render all files
find docs/business -name "*.md" -exec marp {} --pdf --output docs/business/_pdf/ \;
```

PDFs are generated on:
- Push to `main` branch
- Manual workflow dispatch
- Output location: `/docs/business/_pdf/`

## 🔧 Customization

### Province/Tax Override
Set environment variable `NEXT_PUBLIC_PROVINCE` to override Ontario default:
- `BC` → GST 5% + PST 7% = 12% HST
- `AB`, `SK`, `MB`, `NT`, `NU`, `YT` → GST 5% only
- `QC` → GST 5% + QST 9.975% = 14.975%
- `NB`, `NL`, `NS`, `PE` → HST 15%

### Branding
Apply logo and brand colors in `/docs/.theme/marp-config.json`:
```json
{
  "theme": "default",
  "themeSet": "./theme",
  "size": "A4",
  "author": "What's for Dinner?",
  "title": "Business Document"
}
```

### Placeholders
Replace placeholders marked with `[PLACEHOLDER]`:
- `[COMPANY_NAME]` → "What's for Dinner?"
- `[CONTACT_EMAIL]` → Your support email
- `[SUPPORT_URL]` → Your support page URL
- `[PRIVACY_POLICY_URL]` → URL to privacy policy
- `[TERMS_URL]` → URL to terms of service

## 📊 Quality Checks

- ✅ All currency in CAD $ with proper formatting
- ✅ GST/HST calculations included where applicable
- ✅ PIPEDA compliance referenced in privacy documents
- ✅ CASL compliance checklists included
- ✅ Side-gig hours realistic (nights/weekends, ~10-15 hours/week)
- ✅ No secrets or API keys committed
- ✅ Professional, investor-ready tone

## 📝 License & Usage

These documents are templates for internal use. Customize for your specific venture needs. Legal and financial advice should be obtained from qualified professionals.

**Last Updated**: Generated automatically via CI/CD
