# Code Review SLA Policy

**Effective:** 2025-01-XX  
**Purpose:** Reduce code review wait time and improve developer productivity

## Review Time SLAs

### Priority Levels

| Priority | Description | SLA | Examples |
|----------|-------------|-----|----------|
| **Urgent** | Critical bugs, security fixes, production incidents | 4 hours | Hotfixes, security patches |
| **Normal** | Feature work, improvements, refactoring | 24 hours | New features, enhancements |
| **Low** | Documentation, dependencies, config changes | 48 hours | README updates, dependency bumps |

### Auto-Approval Rules

The following PRs are **auto-approved** (no review required):

- ✅ Documentation-only changes (`*.md`, `docs/**`)
- ✅ Dependency updates (if no breaking changes)
- ✅ Configuration changes (`*.json`, `*.yml`, `*.yaml` in config directories)
- ✅ Automated changes (dependabot, renovate, etc.)
- ✅ Pre-merge validation passes
- ✅ CI checks pass

**Note:** Auto-approval can be overridden by adding `[REVIEW REQUIRED]` to PR title.

## Review Process

### For Authors

1. **Create PR with clear description**
   - What changed and why
   - How to test
   - Screenshots (if UI changes)
   - Link to related issues

2. **Request review from appropriate team**
   - Use CODEOWNERS to determine reviewers
   - Tag relevant team members
   - Set PR priority label

3. **Respond to feedback promptly**
   - Address comments within 24 hours
   - Ask for clarification if needed
   - Update PR status

### For Reviewers

1. **Acknowledge review request**
   - Confirm receipt within 2 hours
   - Set expectation if SLA cannot be met

2. **Provide constructive feedback**
   - Be specific and actionable
   - Explain reasoning
   - Suggest improvements

3. **Approve or request changes**
   - Approve if changes are good
   - Request changes with clear requirements
   - Re-review promptly after changes

## Escalation

If SLA is missed:

1. **24 hours overdue:** Ping reviewer in PR comments
2. **48 hours overdue:** Escalate to team lead
3. **72+ hours overdue:** Escalate to engineering manager

## Metrics

We track:
- Average review wait time (target: <8h for 90% of PRs)
- PR queue length (target: <10 open PRs)
- Review comments per PR (target: reduce by 30%)

## Implementation

### GitHub Labels

- `priority:urgent` - 4h SLA
- `priority:normal` - 24h SLA (default)
- `priority:low` - 48h SLA
- `auto-approve` - Auto-approved PRs

### Automation

- GitHub Actions workflow checks PR age
- Comments on PRs approaching SLA deadline
- Weekly report on SLA compliance

---

**Note:** This policy is a guideline. Flexibility is allowed for exceptional circumstances.
