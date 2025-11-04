#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/audit
{
  echo "## Governance Orchestrator Summary"
  echo "- Date: $(date -u)"
  echo "- Repo: ${GITHUB_REPOSITORY:-local}"
  echo "- Commit: ${GITHUB_SHA:-local}"
  echo ""
  echo "### Self-Check Results"
  echo ""
  if [ -d "docs/audit" ]; then
    echo "Generated audit artifacts:"
    ls -1 docs/audit/*.md docs/audit/*.json docs/audit/*.txt 2>/dev/null | sed 's/^/- /' || echo "- No audit artifacts found"
  fi
  echo ""
  echo "### Next Actions"
  echo "Review the audit artifacts in docs/audit/ for actionable findings."
} > docs/audit/CI_SUMMARY.md
