# Unified Hardonia Agent

Self-operating DevOps, FinOps, SecOps, and KnowledgeOps layer for Hardonia-linked repositories.

## Quick Start

1. **Setup**:
   ```bash
   pnpm run agent:setup
   ```

2. **Run Agent**:
   ```bash
   pnpm run agent:run
   ```

3. **Check Artifacts**:
   - Reliability: `admin/reliability.json` & `admin/reliability.md`
   - Compliance: `admin/compliance.json`
   - SBOM: `security/sbom.json`
   - Metrics: `admin/metrics.jsx`
   - Intent Log: `docs/intent-log.md`
   - Roadmap: `roadmap/current-sprint.md`
   - Next Steps: `auto/next-steps.md`

## Agent Modes

The unified agent operates in multiple modes:

### 🧠 Repository Context Detection
Automatically detects:
- Project type (webapp, mobile, backend, library, monorepo)
- Technology stack (Next.js, Expo, Supabase, etc.)
- Package manager (npm, pnpm, yarn)
- Test infrastructure
- CI/CD setup

### 📈 Reliability Agent
- Monitors uptime, latency, error rates
- Tracks build times and test pass rates
- Generates reliability reports
- **Schedule**: Every 6 hours

### 💰 Cost & Efficiency Agent
- Tracks usage from Vercel, Supabase, Expo
- Forecasts monthly spend
- Flags cost overruns (>10%)
- **Schedule**: Daily

### 🔐 Security & Compliance Agent
- Generates SBOM (Software Bill of Materials)
- Runs security audits
- Checks compliance (HTTPS, RLS, CORS, MFA)
- Scans for exposed secrets
- **Schedule**: Every 12 hours

### 📚 Documentation & Knowledge Agent
- Updates README, CHANGELOG, architecture docs
- Maintains intent log (commit reasoning)
- Auto-diagrams module dependencies
- **Schedule**: Daily at 2 AM

### 🧮 Planning & Roadmap Agent
- Extracts TODOs and FIXMEs
- Clusters into Epics and Milestones
- Generates sprint roadmap
- **Schedule**: Daily at 3 AM

### 📊 Observability & Telemetry Agent
- Maintains `/api/metrics` endpoint
- Generates metrics dashboard
- Logs telemetry to Supabase
- **Schedule**: Every 15 minutes

### 🔁 Reflection & Auto-Improvement Agent
- Summarizes changes since last cycle
- Proposes optimizations
- Self-evaluates performance
- **Schedule**: Daily at 4 AM

## Configuration

Configuration is stored in `.cursor/config/master-agent.json`:

```json
{
  "agentMode": "hardonia-global",
  "autoRun": true,
  "repoType": "monorepo",
  "agents": {
    "reliability": { "enabled": true },
    "cost": { "enabled": true },
    "security": { "enabled": true },
    ...
  }
}
```

## GitHub Actions

The agent runs automatically via GitHub Actions:
- **Schedule**: Every 12 hours
- **Manual**: Can be triggered via workflow_dispatch
- **Artifacts**: Uploaded and retained for 90 days
- **Auto-commit**: Agent updates are automatically committed

## Safety & Guardrails

- ✅ Never exposes secret values
- ✅ Skips major upgrades unless CI passes
- ✅ Prefers PR → human merge over direct push
- ✅ Retains last 3 audit snapshots
- ✅ Default mode: Confirm → Log → Auto-PR

## Cursor Superpowers Toolkit

Quick commands available:

- `optimize-recursively` - Continuously simplify code & tests
- `unify-shared-modules` - Merge duplicated logic across repos
- `security-sweep` - Deep audit for exposed secrets & weak crypto
- `simulate-users` - Generate synthetic UX data for funnels
- `sync-docs` - Rewrite docs from latest commits
- `cost-analyzer` - Forecast monthly cloud cost
- `sync-schema` - Align Supabase, Prisma & API types
- `plan-sprint` - Build sprint plan from TODOs
- `self-evaluate` - Review last cycle, suggest next actions

## Learning & Continuity

The agent maintains:
- `.cursor/agent-discoveries.md` - Knowledge ledger across repos
- Cross-repo pattern detection
- Automatic utility consolidation suggestions
- Repo unification recommendations (when duplication ≥ 30%)

## Troubleshooting

**Agent fails to start**:
- Check environment variables are set
- Verify Supabase credentials
- Ensure dependencies are installed

**Artifacts not updating**:
- Check GitHub Actions workflow logs
- Verify agent has write permissions
- Check disk space

**Security checks failing**:
- Review `admin/compliance.json`
- Check `security/sbom.json` for vulnerabilities
- Run `pnpm audit` manually

## Integration with Existing Systems

The unified agent integrates with:
- Existing reliability orchestrator (`scripts/reliability-orchestrator.mjs`)
- Ops framework (`ops/cli/index.ts`)
- Security scripts (`scripts/secrets-scan.mjs`)
- Cost guard (`scripts/cost-guard.mjs`)

## Next Steps

1. Review generated artifacts
2. Address recommendations in `auto/next-steps.md`
3. Customize agent schedules in `.cursor/config/master-agent.json`
4. Set up webhooks for alerts (optional)
