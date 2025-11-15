# Full-Stack Guardian Agent

The **Autonomous Full-Stack Guardian** is an automated agent that continuously monitors and maintains the health of your entire repository and ecosystem.

## What It Does

The Guardian operates across **five integrated domains**:

### 1. Environment & Secret Drift Elimination
- Detects mismatches between GitHub Secrets, Vercel env vars, Supabase config, and code
- Identifies missing or unused environment variables
- Generates `.env.example` and `ENVIRONMENT.md` documentation
- Maps env vars to frameworks (Next.js, Expo, Edge, Cron)

### 2. Supabase Schema & Migration Sentinel
- Compares Prisma schema with migration files
- Identifies missing tables, columns, indexes, RLS policies
- Validates schema consistency across all systems
- Generates safe migration recommendations

### 3. Vercel Deployment Forensics
- Validates `vercel.json` configuration
- Checks cron job endpoints exist
- Verifies Next.js config compatibility
- Identifies deployment blockers

### 4. Repo Integrity & Code Health
- Finds dead files and unused code
- Detects circular imports
- Validates TypeScript imports
- Maintains documentation (README, API, ARCHITECTURE)

### 5. AI Agent Mesh Orchestration
- Verifies Zapier automation endpoints
- Checks integration configurations (TikTok Ads, Meta Ads, ElevenLabs, etc.)
- Validates webhook handlers
- Ensures cross-system alignment

## Quick Start

### Run Full Audit

```bash
npx tsx scripts/full-stack-guardian.ts
```

This generates:
- `reports/guardian-health-report.json` - Machine-readable report
- `reports/guardian-health-report.md` - Human-readable summary

### Run Schema Health Check

```bash
npx tsx scripts/schema-health-check.ts
```

## Current Status

See `reports/GUARDIAN_INITIAL_AUDIT_SUMMARY.md` for the latest audit results.

### Critical Issues Found

1. **Vercel Config Conflict** 🔴
   - `next.config.ts` has `output: 'export'` which disables API routes
   - Cron jobs in `vercel.json` will not work
   - **Action Required:** Remove `output: 'export'` or move cron jobs to external service

### Fixed Issues ✅

1. **Supabase Client Error Handling** - Added proper validation
2. **Environment Variable Documentation** - Created comprehensive `ENVIRONMENT.md`

## Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Run Full-Stack Guardian Audit
  run: npx tsx scripts/full-stack-guardian.ts
  
- name: Upload Guardian Report
  uses: actions/upload-artifact@v3
  with:
    name: guardian-report
    path: reports/guardian-health-report.*
```

## Scheduled Runs

The Guardian can be run automatically:

- **Weekly:** Full comprehensive audit
- **On PR:** Quick validation check
- **On Deploy:** Pre-deployment verification

## Configuration

The Guardian uses intelligent defaults but can be configured via:

- Environment variables (see `ENVIRONMENT.md`)
- Guardian-specific config (future enhancement)

## Reports

All reports are saved to `reports/` directory:

- `guardian-health-report.json` - Structured data for automation
- `guardian-health-report.md` - Human-readable summary
- `GUARDIAN_INITIAL_AUDIT_SUMMARY.md` - Initial audit findings

## Contributing

The Guardian agent is designed to be self-improving. It:

- Automatically fixes issues when safe
- Generates documentation
- Creates migration scripts
- Provides actionable recommendations

## Support

For issues or questions about the Guardian agent:

1. Check `reports/GUARDIAN_INITIAL_AUDIT_SUMMARY.md`
2. Review generated reports
3. Run `npx tsx scripts/full-stack-guardian.ts` for latest status

---

**Status:** ✅ Operational  
**Last Audit:** See `reports/guardian-health-report.json`  
**Next Run:** Manual or scheduled
