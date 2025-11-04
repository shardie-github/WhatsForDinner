# Governance System Quick Start

## What Was Installed

1. **GitHub Actions Workflow** - `.github/workflows/project-governance.yml`
   - Runs on PRs and nightly
   - Automatically comments findings on PRs

2. **16 Self-Check Scripts** - `infra/selfcheck/`
   - All scripts are executable and ready to use
   - Write outputs to `docs/audit/`

3. **Documentation** - `docs/GOVERNANCE_EXEC_SUMMARY.md`
   - Complete system overview
   - Usage instructions
   - Maintenance guide

## Quick Test

Run a single check locally:
```bash
./infra/selfcheck/ci_health.sh
```

Generate scenario forecast:
```bash
./infra/selfcheck/scenario_simulator.py
cat docs/scenarios/forecast.md
```

## CI Integration

The workflow will automatically:
- Run on every PR
- Run nightly at 2 AM UTC
- Post findings as PR comments
- Upload artifacts to GitHub Actions

## Next Steps

1. Review `docs/GOVERNANCE_EXEC_SUMMARY.md` for full details
2. Trigger the workflow manually: GitHub Actions → "Project Governance Orchestrator" → "Run workflow"
3. Check `docs/audit/` after first run for baseline metrics

## Customization

All scripts respect environment variables:
- `AUDIT_DIR` - defaults to `docs/audit`
- Scripts gracefully handle missing prerequisites
- Modify thresholds in scripts as needed
