# Unified Background + Composer Agent System

This directory contains the unified agent system for Hardonia-linked repositories. The agent operates as a continuous DevOps, FinOps, SecOps, and KnowledgeOps layer across all connected projects.

## Overview

The Unified Agent system provides:

1. **Self-Awareness**: Detects repository type and applies contextual intelligence
2. **Self-Maintenance**: Auto-updates documentation, dependencies, and tests
3. **Self-Optimization**: Continuously benchmarks performance, cost, reliability
4. **Self-Protection**: Enforces security hygiene, secret safety, and compliance
5. **Self-Documentation**: Maintains living READMEs, CHANGELOGs, and dashboards

## Architecture

```
unified-agent.ts          # Main orchestrator
├── reliability-agent.ts  # Performance & uptime monitoring
├── cost-agent.ts         # Cost tracking & optimization
├── security-agent.ts     # Security audits & compliance
├── documentation-agent.ts # Auto-documentation
├── planning-agent.ts     # Roadmap & sprint planning
├── observability-agent.ts # Telemetry & metrics
├── reflection-agent.ts   # Self-evaluation & improvement
└── learning-agent.ts    # Pattern detection & knowledge
```

## Quick Start

### Run All Agents

```bash
pnpm agent:run
```

### Run Individual Agents

```bash
pnpm agent:reliability    # Performance monitoring
pnpm agent:cost           # Cost analysis
pnpm agent:security       # Security audit
pnpm agent:docs           # Documentation updates
pnpm agent:planning       # Roadmap generation
pnpm agent:observability  # Metrics collection
pnpm agent:reflection     # Self-evaluation
pnpm agent:learning       # Pattern detection
```

## Configuration

Configuration is stored in `.cursor/config/master-agent.json`:

```json
{
  "agentMode": "hardonia-global",
  "autoRun": true,
  "repoType": "monorepo",
  "agents": {
    "reliability": { "enabled": true, "schedule": "0 */6 * * *" },
    "cost": { "enabled": true, "schedule": "0 0 * * *" },
    "security": { "enabled": true, "schedule": "0 */12 * * *" }
  }
}
```

## Generated Artifacts

The agent system generates the following artifacts:

| File | Purpose |
|------|---------|
| `/admin/reliability.json` | Live uptime & latency snapshot |
| `/admin/compliance.json` | Security & privacy baseline |
| `/admin/costs.json` | Cost tracking data |
| `/admin/metrics.jsx` | Dashboard visualization |
| `/docs/intent-log.md` | Commit reasoning trail |
| `/roadmap/current-sprint.md` | Auto sprint summary |
| `/auto/next-steps.md` | Self-reflection & recommendations |
| `/security/sbom.json` | SBOM + license inventory |
| `/.cursor/agent-discoveries.md` | Knowledge ledger |

## Agent Details

### Reliability Agent

Monitors:
- Web vitals (LCP, CLS, TTFB, FID)
- Build times and bundle sizes
- Error rates and uptime
- API latency

Outputs:
- `/admin/reliability.json`
- `/admin/reliability.md`

### Cost Agent

Tracks:
- Vercel spending
- Supabase usage
- Expo/EAS costs
- Monthly forecasts

Outputs:
- `/admin/costs.json`
- `/admin/costs.md`

### Security Agent

Checks:
- Package vulnerabilities
- Outdated dependencies
- Compliance (HTTPS, RLS, CORS, MFA)
- Secrets exposure

Outputs:
- `/security/sbom.json`
- `/admin/compliance.json`
- `SECURITY_COMPLIANCE_REPORT.md`

### Documentation Agent

Maintains:
- README updates
- CHANGELOG entries
- Architecture diagrams
- Intent logs

Outputs:
- `/docs/intent-log.md`
- `/docs/architecture.md`
- `/.cursor/diagrams/architecture.md`

### Planning Agent

Extracts:
- TODO/FIXME comments
- Clusters into epics
- Estimates effort
- Generates roadmap

Outputs:
- `/roadmap/current-sprint.md`

### Observability Agent

Provides:
- `/api/metrics` endpoint
- Regression detection
- Alert generation

### Reflection Agent

Evaluates:
- Change patterns
- Performance trends
- Improvement suggestions
- Self-scoring

Outputs:
- `/auto/next-steps.md`
- `/auto/reflection-history.json`

### Learning Agent

Detects:
- Code patterns
- Duplications
- Reusable utilities
- Consolidation opportunities

Outputs:
- `/.cursor/agent-discoveries.md`

## Scheduling

Agents can be scheduled via GitHub Actions or cron. Example workflow:

```yaml
name: Agent Runner
on:
  schedule:
    - cron: "0 */6 * * *"  # Every 6 hours
jobs:
  run-agents:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm agent:run
```

## Safety & Guardrails

- ✅ Never exposes secret values
- ✅ Skips major upgrades unless CI passes
- ✅ Prefers PR → human merge over direct push
- ✅ Retains last 3 audit snapshots
- ✅ Default mode: Confirm → Log → Auto-PR

## Contributing

When adding new agents:

1. Create agent file in `agents/` directory
2. Export agent class with `run()` method
3. Add to `unified-agent.ts` orchestrator
4. Add npm script in `package.json`
5. Update this README

## License

Part of the Hardonia ecosystem.
