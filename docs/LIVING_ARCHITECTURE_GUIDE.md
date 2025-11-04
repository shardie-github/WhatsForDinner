# Living Architecture Guide

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** This guide explains how the system maintains its own architectural integrity through automated validation, self-healing mechanisms, and continuous learning.

---

## Overview

This system transforms static audit findings into **living, enforceable architecture**. Instead of documentation that drifts, we have:

- ✅ **Runtime guarantees** enforced by CI/CD
- ✅ **Automated guardrails** that prevent architectural drift
- ✅ **Self-healing logic** that recovers from failures
- ✅ **Continuous learning** that improves over time
- ✅ **System intelligence map** that narrates why choices exist

---

## What Makes This "Living"?

### 1. Automated Guardrails

Located in `infra/selfcheck/guardrails.yaml`, these are **invariant conditions** derived from audit findings. Each guardrail:

- **Prevents regressions**: Stops architectural drift before it happens
- **Runs in CI**: Every PR is checked against guardrails
- **Provides context**: Links back to audit findings
- **Actionable**: Clear mitigation steps when violations occur

**Example:**
```yaml
- name: no-redis-spof
  description: "Redis connection must have retry logic"
  expression: "grep -r 'new Redis' packages/server/src/queue/ | grep -q 'retryStrategy'"
  severity: critical
  source: "ROOT_CAUSE_AND_DRIFT_MAP.md - SPOF #1"
```

### 2. System Intelligence Map

Located in `src/observability/system_intelligence_map.json`, this map:

- **Links modules to business goals**: Shows why each module exists
- **Tracks resilience dependencies**: What each module needs to be resilient
- **Documents critical paths**: User flows and their dependencies
- **Tracks architectural intent**: What we're trying to achieve and why

**Use Cases:**
- AI documentation bots can query this map
- New developers understand system purpose
- Architecture decisions are traceable
- Resilience requirements are explicit

### 3. Continuous Validation

The system validates itself through:

1. **Pre-merge checks** (`.github/workflows/ci-intent-tests.yml`):
   - Guardrails validation
   - Schema consistency
   - API contract validation
   - Circular dependency detection

2. **Nightly drift reports** (`.github/workflows/nightly-drift-report.yml`):
   - Detects architectural drift
   - Tracks changes over time
   - Suggests rule updates

3. **Self-reflection tests** (`tests/self_reflection.test.js`):
   - Scans repository for regressions
   - Validates guardrails are enforced
   - Fails build if audit findings reappear

---

## File Structure

```
infra/selfcheck/
├── guardrails.yaml              # Architectural invariants
├── validate-guardrails.sh       # Validation script
├── ci-intent-tests.yml          # CI workflow (copy to .github/workflows/)
├── slo-monitors.yml             # SLO monitoring config
├── validate-migrations.js       # Migration validation
├── validate-env-completeness.js # Env var validation
└── check-circular-deps.js       # Circular dependency checker

src/observability/
└── system_intelligence_map.json # Module → goal → resilience map

docs/
└── LIVING_ARCHITECTURE_GUIDE.md # This file

tests/
└── self_reflection.test.js       # Repository self-check

.github/
├── CODEOWNERS                   # Module ownership (generated)
└── pull_request_template.md     # PR template with Architecture Council
```

---

## How It Evolves

### Learning from Drift

The system tracks recurring findings in `infra/selfcheck/drift-history.json`:

```json
{
  "recurring_findings": [
    {
      "finding": "Missing env var validation",
      "occurrences": 3,
      "suggested_rule": "env-validation-schema"
    }
  ]
}
```

When the same issue appears multiple times, the system suggests:
- Adding a new guardrail
- Updating PR templates
- Creating documentation

### Adaptive Rules

Guardrails can be updated based on:
- **Recurring findings**: If a pattern keeps appearing
- **New audit insights**: As system grows
- **Team feedback**: What's actually useful

### Self-Healing

Light self-healing for:
- **Env var defaults**: Safe defaults for development
- **Health check recovery**: Automatic retry on transient failures
- **Queue job retries**: Exponential backoff for failed jobs

---

## Usage

### Running Guardrails Locally

```bash
# Validate all guardrails
./infra/selfcheck/validate-guardrails.sh

# Check specific guardrail
grep -A 10 "no-redis-spof" infra/selfcheck/guardrails.yaml
```

### Adding a New Guardrail

1. **Identify the invariant** from audit findings
2. **Add to `guardrails.yaml`**:
   ```yaml
   - name: my-new-guardrail
     description: "What it checks"
     expression: "command that validates"
     severity: high|critical|medium
     source: "docs/audit/WHERE_IT_CAME_FROM.md"
   ```
3. **Test locally**: `./infra/selfcheck/validate-guardrails.sh`
4. **Commit**: Guardrail will run in CI automatically

### Querying System Intelligence Map

```bash
# Using jq
cat src/observability/system_intelligence_map.json | jq '.modules.module_web_app'

# Find modules for a business goal
cat src/observability/system_intelligence_map.json | jq '.modules | to_entries | map(select(.value.business_goals | contains(["goal_001"])))'
```

---

## Architectural Intent

### Principles

1. **No SPOF**: Critical paths have redundancy
2. **Type Safety**: Validation at boundaries
3. **Observability**: Full visibility into system behavior
4. **Resilience**: Graceful failure handling
5. **Documentation**: Living docs that stay current

### Current Status

See `src/observability/system_intelligence_map.json` → `architectural_intent` for:
- ✅ What's implemented
- ⚠️ What's partially implemented
- 📋 What's planned

---

## Integration with CI/CD

### Pre-Merge Checks

The `.github/workflows/ci-intent-tests.yml` workflow:

1. **Runs guardrails** - Validates architectural invariants
2. **Lints code** - Ensures code quality
3. **Validates schema** - Database consistency
4. **Checks contracts** - API contract validation
5. **Posts results** - PR comments with findings

### Nightly Reports

The `.github/workflows/nightly-drift-report.yml` workflow:

1. **Runs selfcheck** - Full validation
2. **Regenerates intelligence map** - Updates module relationships
3. **Detects drift** - Compares against baseline
4. **Sends report** - Email/Slack summary

---

## Governance

### Architecture Council

For architectural changes, the PR template includes:

```
## Architecture Council Review

- [ ] This change affects system architecture
- [ ] I've reviewed the System Intelligence Map
- [ ] I've checked for SPOF risks
- [ ] I've updated relevant guardrails (if needed)
```

### CODEOWNERS

Generated from dependency graph, `.github/CODEOWNERS` ensures:
- Critical modules have required reviewers
- Changes are reviewed by domain experts
- Architecture changes get extra scrutiny

---

## Maintenance

### Keeping Guardrails Current

1. **Review quarterly**: Do guardrails still match reality?
2. **Update after audits**: New findings → new guardrails
3. **Remove obsolete**: If system changes, remove outdated rules

### Updating System Intelligence Map

1. **After major refactors**: Update module relationships
2. **When adding modules**: Add to map with business goals
3. **When goals change**: Update goal dependencies

### Self-Healing Logic

Self-healing should be:
- **Lightweight**: Don't add complexity
- **Transparent**: Log what's happening
- **Testable**: Can be disabled for testing
- **Documented**: Clear what it does

---

## Troubleshooting

### Guardrail Failing

1. **Check the expression**: Run it manually
2. **Review the source**: Why was this guardrail created?
3. **Update if needed**: Maybe the system evolved
4. **Fix the issue**: If it's a real problem

### System Intelligence Map Out of Date

1. **Review audit findings**: What changed?
2. **Update modules**: Reflect current structure
3. **Update dependencies**: Current relationships
4. **Commit**: Map should stay in sync

### CI Checks Failing

1. **Check guardrail output**: What failed?
2. **Review PR comment**: Detailed findings
3. **Fix issues**: Address root causes
4. **Re-run**: Should pass after fixes

---

## Future Enhancements

### Planned Features

1. **Semantic Code Navigation**: Embedding-based code search
2. **Natural Language PR Summaries**: AI-generated explanations
3. **Automated Rule Suggestions**: AI suggests new guardrails
4. **Visual Architecture Diagrams**: Auto-generated from map

### Research Areas

1. **Predictive Drift Detection**: ML models predict future drift
2. **Automated Refactoring**: System suggests improvements
3. **Self-Documenting APIs**: Generate docs from code + map

---

## References

- **Source Audits**: `docs/audit/`
- **Guardrails**: `infra/selfcheck/guardrails.yaml`
- **System Map**: `src/observability/system_intelligence_map.json`
- **CI Workflow**: `.github/workflows/ci-intent-tests.yml`
- **SLO Monitors**: `infra/selfcheck/slo-monitors.yml`

---

**This is a living document. As the system evolves, so does this guide.**
