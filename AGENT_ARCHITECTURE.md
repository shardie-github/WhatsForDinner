# Unified Hardonia Agent - Architecture

## System Overview

The Unified Hardonia Agent is a self-operating DevOps, FinOps, SecOps, and KnowledgeOps layer that runs continuously across Hardonia-linked repositories.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Unified Hardonia Agent                      │
│                  (agents/unified-agent.ts)                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Repository   │  │   Agent       │  │   Artifacts    │
│   Context     │  │   Modules     │  │   Generator    │
│   Detection   │  │               │  │                │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Reliability   │  │   Security    │  │ Documentation │
│   Agent       │  │   Agent       │  │   Agent       │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Cost Agent    │  │  Planning     │  │ Observability │
│               │  │  Agent        │  │ Agent         │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Component Breakdown

### 1. Core Agent (`agents/unified-agent.ts`)

**Responsibilities**:
- Orchestrates all agent modules
- Manages configuration loading
- Coordinates agent execution
- Generates summary reports

**Key Methods**:
- `detectRepoContext()` - Identifies repository type and stack
- `run()` - Main execution loop
- `runReliabilityAgent()` - Reliability monitoring
- `runSecurityAgent()` - Security & compliance checks
- `runDocumentationAgent()` - Documentation updates
- `runPlanningAgent()` - TODO extraction & roadmap
- `runObservabilityAgent()` - Metrics & telemetry
- `runReflectionAgent()` - Self-improvement

### 2. Repository Context Detection

**Detects**:
- Repository type (webapp, mobile, backend, library, monorepo)
- Technology stack (Next.js, Expo, Supabase, Vercel)
- Package manager (npm, pnpm, yarn)
- Test infrastructure presence
- CI/CD setup

**Implementation**:
- Reads `package.json` for dependencies
- Checks for workspace configuration
- Detects lock files
- Scans for test directories

### 3. Agent Modules

#### Reliability Agent
- **Input**: Build logs, test results, performance metrics
- **Output**: `admin/reliability.json`, `admin/reliability.md`
- **Metrics**: Uptime, latency, error rate, build time, test pass rate
- **Integration**: Uses `scripts/reliability-orchestrator.mjs`

#### Cost Agent
- **Input**: Vercel/Supabase/Expo usage APIs
- **Output**: Cost forecasts, budget alerts
- **Metrics**: Monthly spend, forecasted costs, overruns
- **Integration**: Uses `scripts/reliability-modules/cost-forecast.mjs`

#### Security Agent
- **Input**: Package.json, lock files, codebase
- **Output**: `security/sbom.json`, `admin/compliance.json`
- **Checks**: SBOM generation, npm audit, HTTPS, RLS, CORS, MFA, secrets
- **Integration**: Uses `scripts/secrets-scan.mjs`, `scripts/penetration-testing.mjs`

#### Documentation Agent
- **Input**: Code changes, commit history
- **Output**: `docs/intent-log.md`, `docs/architecture.md`
- **Actions**: Updates intent log, maintains architecture docs
- **Integration**: Git history, file system

#### Planning Agent
- **Input**: Codebase (TODOs, FIXMEs)
- **Output**: `roadmap/current-sprint.md`
- **Actions**: Extracts TODOs, generates roadmap
- **Integration**: Grep/search tools

#### Observability Agent
- **Input**: Runtime metrics, system stats
- **Output**: `/api/metrics`, `admin/metrics.jsx`
- **Actions**: Creates metrics endpoint, generates dashboard
- **Integration**: Node.js process metrics, Supabase telemetry

#### Reflection Agent
- **Input**: All agent results, previous cycles
- **Output**: `auto/next-steps.md`, `.cursor/agent-discoveries.md`
- **Actions**: Analyzes results, proposes improvements
- **Integration**: All other agents

### 4. Artifact Generation

**Artifacts**:
- JSON files for machine-readable data
- Markdown files for human-readable reports
- React components for dashboards
- API endpoints for real-time access

**Structure**:
```
/admin/
  ├── reliability.json      # Machine-readable metrics
  ├── reliability.md        # Human-readable report
  ├── compliance.json       # Security compliance data
  ├── compliance.md         # Compliance report
  └── metrics.jsx           # React dashboard component

/security/
  └── sbom.json             # Software Bill of Materials

/docs/
  └── intent-log.md         # Commit reasoning log

/roadmap/
  └── current-sprint.md     # Auto-generated roadmap

/auto/
  └── next-steps.md         # Agent recommendations

/.cursor/
  ├── config/
  │   └── master-agent.json # Agent configuration
  └── agent-discoveries.md  # Cross-repo knowledge
```

### 5. Configuration System

**Location**: `.cursor/config/master-agent.json`

**Structure**:
```json
{
  "agentMode": "hardonia-global",
  "autoRun": true,
  "repoType": "monorepo",
  "detectedStack": {...},
  "agents": {
    "reliability": { "enabled": true, "schedule": "..." },
    ...
  },
  "artifacts": {...},
  "safety": {...}
}
```

### 6. GitHub Actions Integration

**Workflow**: `.github/workflows/unified-agent.yml`

**Triggers**:
- Scheduled (every 12 hours)
- Manual (workflow_dispatch)
- Agent-specific selection

**Steps**:
1. Checkout code
2. Setup Node.js & pnpm
3. Install dependencies
4. Run unified agent
5. Upload artifacts
6. Commit artifacts (if changed)
7. Generate summary comment

### 7. Safety & Guardrails

**Protections**:
- Never exposes secrets
- Requires CI approval for major changes
- Prefers PRs over direct commits
- Retains audit snapshots (last 3)
- Default mode: Confirm → Log → Auto-PR

**Implementation**:
- Secret scanning before commits
- CI checks before merges
- Audit trail in intent log
- Snapshot rotation

## Data Flow

```
1. Agent Starts
   ↓
2. Load Configuration
   ↓
3. Detect Repository Context
   ↓
4. Initialize Supabase (if available)
   ↓
5. Run Enabled Agents (parallel)
   ├── Reliability Agent
   ├── Cost Agent
   ├── Security Agent
   ├── Documentation Agent
   ├── Planning Agent
   ├── Observability Agent
   └── Reflection Agent
   ↓
6. Collect Results
   ↓
7. Generate Artifacts
   ├── JSON files
   ├── Markdown reports
   └── Dashboard components
   ↓
8. Update Intent Log
   ↓
9. Generate Summary
   ↓
10. Commit Artifacts (if changed)
```

## Integration Points

### Existing Systems
- **Reliability Orchestrator**: `scripts/reliability-orchestrator.mjs`
- **Ops Framework**: `ops/cli/index.ts`
- **Secrets Manager**: `scripts/secrets-manager-unified.mjs`
- **Cost Guard**: `scripts/cost-guard.mjs`
- **Security Scripts**: `scripts/secrets-scan.mjs`

### External Services
- **Supabase**: Metrics storage, RLS checks
- **Vercel**: Cost tracking, deployment monitoring
- **Expo**: Mobile build monitoring
- **GitHub**: Issue creation, PR management

## Extension Points

### Adding New Agents
1. Create agent method in `UnifiedHardoniaAgent` class
2. Add configuration to `master-agent.json`
3. Add artifact paths
4. Update documentation

### Custom Artifacts
1. Define artifact path in config
2. Create generator method
3. Add to artifact upload in workflow
4. Document in README

### New Integrations
1. Add service client initialization
2. Create integration module
3. Add to appropriate agent
4. Update configuration

## Performance Considerations

- **Parallel Execution**: Agents run in parallel where possible
- **Caching**: Results cached to avoid redundant work
- **Incremental Updates**: Only changed artifacts are committed
- **Timeout Protection**: Long-running operations have timeouts
- **Resource Limits**: Memory and CPU usage monitored

## Security Considerations

- **Secret Management**: Never logs or exposes secrets
- **Access Control**: Respects repository permissions
- **Audit Trail**: All actions logged in intent log
- **Validation**: Inputs validated before processing
- **Isolation**: Agent runs in isolated environment

## Monitoring & Observability

- **Metrics**: Collected via `/api/metrics` endpoint
- **Dashboard**: Visualized in `admin/metrics.jsx`
- **Logs**: Written to `.cursor/agent-discoveries.md`
- **Alerts**: Generated for critical issues
- **Reports**: Generated in multiple formats

## Future Enhancements

- OpenTelemetry integration
- AI anomaly detection
- Slack/Discord webhooks
- Weekly digest reports
- Cross-repo pattern detection
- Automatic utility consolidation
- Repo unification suggestions
