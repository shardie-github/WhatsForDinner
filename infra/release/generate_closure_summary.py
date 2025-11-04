#!/usr/bin/env python3
"""
Generate PROJECT_CLOSURE_SUMMARY.md from readiness data and system state.
"""
import json
import os
import subprocess
from pathlib import Path
from datetime import datetime, timezone

def read_json_safe(p):
    """Read JSON file safely."""
    try:
        with open(p, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def get_git_info():
    """Get git branch and latest commit."""
    try:
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True).strip()
        commit = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], text=True).strip()
        return branch, commit
    except:
        return "unknown", "unknown"

def get_latest_tag():
    """Get latest git tag."""
    try:
        tag = subprocess.check_output(['git', 'describe', '--tags', '--abbrev=0'], text=True).strip()
        return tag
    except:
        return None

def main():
    audit_dir = Path("docs/audit_investor_suite")
    audit_dir.mkdir(parents=True, exist_ok=True)
    
    readiness_file = audit_dir / "READINESS.json"
    closure_file = audit_dir / "PROJECT_CLOSURE_SUMMARY.md"
    issue_register = audit_dir / "ISSUE_REGISTER.json"
    
    readiness = read_json_safe(readiness_file)
    issues = read_json_safe(issue_register)
    
    branch, commit = get_git_info()
    latest_tag = get_latest_tag()
    
    score = readiness.get('score', 0)
    threshold = readiness.get('threshold', 90)
    gate_passes = readiness.get('gate_passes', False)
    sub_scores = readiness.get('sub_scores', {})
    critical_blockers = readiness.get('critical_blockers', 0)
    notes = readiness.get('notes', [])
    
    # Count issues by status
    issue_list = issues.get('issues', [])
    total_issues = len(issue_list)
    resolved_issues = len([i for i in issue_list if i.get('status') == 'resolved'])
    open_critical = len([i for i in issue_list if i.get('severity') == 'CRITICAL' and i.get('status') != 'resolved'])
    
    # Generate summary
    summary = f"""# Project Closure Summary

**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Branch:** `{branch}`  
**Commit:** `{commit}`  
**Latest Tag:** {latest_tag or 'None'}

---

## Readiness Assessment

### Overall Score: **{score}/100** (Threshold: {threshold})

**Gate Status:** {"✅ **PASSED**" if gate_passes else "❌ **FAILED**"}

### Sub-Scores Breakdown

| Domain | Score | Max | Status |
|--------|-------|-----|--------|
| Technical | {sub_scores.get('technical', 0)} | 20 | {"✅" if sub_scores.get('technical', 0) >= 15 else "⚠️"} |
| Product | {sub_scores.get('product', 0)} | 20 | {"✅" if sub_scores.get('product', 0) >= 15 else "⚠️"} |
| GTM | {sub_scores.get('gtm', 0)} | 20 | {"✅" if sub_scores.get('gtm', 0) >= 15 else "⚠️"} |
| Finance | {sub_scores.get('finance', 0)} | 20 | {"✅" if sub_scores.get('finance', 0) >= 15 else "⚠️"} |
| Governance | {sub_scores.get('governance', 0)} | 20 | {"✅" if sub_scores.get('governance', 0) >= 15 else "⚠️"} |

### Critical Blockers

**Open Critical Issues:** {critical_blockers}

{"⚠️ **Release blocked** - Critical issues must be resolved before release." if critical_blockers > 0 else "✅ **No critical blockers**"}

---

## Issue Status

- **Total Issues:** {total_issues}
- **Resolved:** {resolved_issues}
- **Open Critical:** {open_critical}
- **Open Non-Critical:** {total_issues - resolved_issues - open_critical}

---

## Assessment Notes

"""
    
    for note in notes:
        summary += f"- {note}\n"
    
    summary += f"""
---

## Artifacts Status

### Required Artifacts
"""
    
    # Check artifacts
    artifacts = {
        "EXEC_SUMMARY_FIXED.md": audit_dir / "EXEC_SUMMARY_FIXED.md",
        "VALIDATION_REPORT.md": audit_dir / "VALIDATION_REPORT.md",
        "ISSUE_REGISTER.json": issue_register,
        ".github/workflows/project-governance.yml": Path(".github/workflows/project-governance.yml"),
        ".github/workflows/remediation_orchestrator.yml": Path(".github/workflows/remediation_orchestrator.yml"),
    }
    
    for name, path in artifacts.items():
        status = "✅" if path.exists() else "❌"
        summary += f"- {status} `{name}`\n"
    
    summary += f"""
### Governance Documents
"""
    
    gov_docs = {
        "SECURITY.md": Path("SECURITY.md"),
        "CODEOWNERS": Path("CODEOWNERS"),
        "SUPPORT.md": Path("SUPPORT.md"),
        ".github/FUNDING.yml": Path(".github/FUNDING.yml"),
        "LICENSE": Path("LICENSE"),
    }
    
    for name, path in gov_docs.items():
        status = "✅" if path.exists() else "❌"
        summary += f"- {status} `{name}`\n"
    
    summary += f"""
---

## Release Decision

"""
    
    if gate_passes:
        summary += f"""### ✅ **RELEASE APPROVED**

The project meets the readiness threshold (score ≥ {threshold}) and has no critical blockers.

**Next Steps:**
1. Run the release workflow: `.github/workflows/final_assurance_release.yml`
2. Review and merge any pending PRs
3. Create release tag and GitHub Release
4. Attach artifacts (investor pack, SBOMs, checksums)
"""
    else:
        summary += f"""### ❌ **RELEASE BLOCKED**

The project does not meet the readiness threshold or has critical blockers.

**Blocking Issues:**
- Readiness Score: {score} < {threshold}
- Critical Blockers: {critical_blockers}

**Remediation Required:**
1. Review missing artifacts and generate them
2. Resolve critical issues
3. Re-run readiness assessment
4. See `PR_PLAN_FINAL_REPAIRS.md` for detailed action items
"""
    
    summary += f"""
---

## vNext Roadmap Seeds

### Hardening & Stability
- [ ] Performance budget enforcement
- [ ] Additional test coverage
- [ ] Security hardening passes

### GTM Experiments
- [ ] Channel mix optimization
- [ ] Conversion funnel improvements
- [ ] Customer segmentation refinement

### Compliance Tasks
- [ ] SOC 2 Type II preparation
- [ ] Additional regulatory certifications
- [ ] Privacy policy updates

### Technical Debt
- [ ] Architecture refactoring
- [ ] Dependency updates
- [ ] Documentation improvements

---

## Timestamp

Generated: {datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')}
"""
    
    # Write summary
    with open(closure_file, 'w') as f:
        f.write(summary)
    
    print(f"✅ Generated PROJECT_CLOSURE_SUMMARY.md")
    
    if not gate_passes:
        # Generate repair plan
        repair_file = audit_dir / "PR_PLAN_FINAL_REPAIRS.md"
        repair_plan = f"""# PR Plan: Final Repairs for Release Readiness

**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Current Score:** {score}/100  
**Required Score:** {threshold}/100  
**Gap:** {threshold - score} points

---

## Action Items

### 1. Missing Artifacts (Priority: High)

"""
        
        missing = []
        if not (audit_dir / "EXEC_SUMMARY_FIXED.md").exists():
            missing.append("- [ ] Generate `EXEC_SUMMARY_FIXED.md` - Run remediation orchestrator or create executive summary")
        if not (audit_dir / "VALIDATION_REPORT.md").exists():
            missing.append("- [ ] Generate `VALIDATION_REPORT.md` - Run validation script: `npm run remediation:validate`")
        if not (audit_dir / "PRODUCT_AUDIT.md").exists():
            missing.append("- [ ] Generate `PRODUCT_AUDIT.md` - Run: `npm run remediation:audit:product`")
        if not (audit_dir / "GTM_AUDIT.md").exists():
            missing.append("- [ ] Generate `GTM_AUDIT.md` - Run: `npm run remediation:audit:gtm`")
        if not (audit_dir / "FINANCIAL_FORECAST.md").exists():
            missing.append("- [ ] Generate `FINANCIAL_FORECAST.md` - Run: `npm run remediation:audit:finance`")
        
        if missing:
            repair_plan += "\n".join(missing) + "\n"
        else:
            repair_plan += "- ✅ All required artifacts present\n"
        
        repair_plan += f"""
### 2. Critical Issues (Priority: Critical)

"""
        
        if critical_blockers > 0:
            repair_plan += f"- [ ] Resolve {critical_blockers} critical issue(s) in ISSUE_REGISTER.json\n"
            repair_plan += "- [ ] Review issue register: `docs/audit_investor_suite/ISSUE_REGISTER.json`\n"
            repair_plan += "- [ ] Apply fixes and update status to 'resolved'\n"
        else:
            repair_plan += "- ✅ No critical blockers\n"
        
        repair_plan += f"""
### 3. Sub-Score Improvements

"""
        
        if sub_scores.get('technical', 0) < 20:
            repair_plan += f"- [ ] Improve technical score ({sub_scores.get('technical', 0)}/20) - Ensure VALIDATION_REPORT.md and EXEC_SUMMARY_FIXED.md exist\n"
        if sub_scores.get('product', 0) < 20:
            repair_plan += f"- [ ] Improve product score ({sub_scores.get('product', 0)}/20) - Generate PRODUCT_AUDIT.md\n"
        if sub_scores.get('gtm', 0) < 20:
            repair_plan += f"- [ ] Improve GTM score ({sub_scores.get('gtm', 0)}/20) - Generate GTM_AUDIT.md\n"
        if sub_scores.get('finance', 0) < 20:
            repair_plan += f"- [ ] Improve finance score ({sub_scores.get('finance', 0)}/20) - Generate FINANCIAL_FORECAST.md\n"
        
        repair_plan += f"""
### 4. Validation

- [ ] Re-run readiness assessment: `python3 infra/release/compute_readiness.py`
- [ ] Verify score ≥ {threshold}
- [ ] Confirm zero critical blockers
- [ ] Run final assurance workflow: `.github/workflows/final_assurance_release.yml`

---

## Estimated Effort

- **Missing Artifacts:** ~2-4 hours (depending on existing data)
- **Critical Issues:** Variable (review ISSUE_REGISTER.json)
- **Validation:** ~30 minutes

---

## Next Steps After Completion

1. Re-run readiness computation
2. Verify gate passes
3. Proceed with release workflow
4. Monitor release artifacts generation
"""
        
        with open(repair_file, 'w') as f:
            f.write(repair_plan)
        
        print(f"✅ Generated PR_PLAN_FINAL_REPAIRS.md")

if __name__ == "__main__":
    main()
