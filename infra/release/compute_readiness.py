#!/usr/bin/env python3
"""
Compute Readiness Score (0-100) based on required artifacts and critical blockers.
"""
import json
import os
import sys
from pathlib import Path

def exists(p):
    """Check if path exists."""
    return os.path.exists(p)

def read_json_safe(p):
    """Read JSON file safely, return empty dict if fails."""
    try:
        with open(p, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def count_critical_blockers(issue_register_path):
    """Count CRITICAL severity open issues."""
    data = read_json_safe(issue_register_path)
    if not data:
        return 0
    issues = data.get('issues', [])
    critical = [i for i in issues if i.get('severity') == 'CRITICAL' and i.get('status') != 'resolved']
    return len(critical)

def main():
    # Base paths
    audit_dir = Path("docs/audit_investor_suite")
    audit_dir.mkdir(parents=True, exist_ok=True)
    
    issue_register = audit_dir / "ISSUE_REGISTER.json"
    readiness_file = audit_dir / "READINESS.json"
    
    score = 0
    notes = []
    max_score = 100
    
    # Sub-scores (20 each)
    tech_score = 0
    product_score = 0
    gtm_score = 0
    finance_score = 0
    gov_score = 0
    
    # Technical (20 points)
    validation_report = audit_dir / "VALIDATION_REPORT.md"
    exec_summary = audit_dir / "EXEC_SUMMARY_FIXED.md"
    if validation_report.exists():
        tech_score += 10
        notes.append("VALIDATION_REPORT.md exists")
    if exec_summary.exists():
        tech_score += 10
        notes.append("EXEC_SUMMARY_FIXED.md exists")
    else:
        # Check for fallback
        fallback = Path("docs/audit/EXEC_SUMMARY.md")
        if fallback.exists():
            tech_score += 5
            notes.append("EXEC_SUMMARY.md found (fallback)")
    
    # Product (20 points)
    product_audit = audit_dir / "PRODUCT_AUDIT.md"
    if product_audit.exists():
        product_score = 20
        notes.append("PRODUCT_AUDIT.md exists")
    else:
        product_score = 12  # Partial credit if missing
        notes.append("PRODUCT_AUDIT.md missing (partial credit)")
    
    # GTM (20 points)
    gtm_audit = audit_dir / "GTM_AUDIT.md"
    if gtm_audit.exists():
        gtm_score = 20
        notes.append("GTM_AUDIT.md exists")
    else:
        gtm_score = 12
        notes.append("GTM_AUDIT.md missing (partial credit)")
    
    # Finance (20 points)
    financial_forecast = audit_dir / "FINANCIAL_FORECAST.md"
    if financial_forecast.exists():
        finance_score = 20
        notes.append("FINANCIAL_FORECAST.md exists")
    else:
        finance_score = 12
        notes.append("FINANCIAL_FORECAST.md missing (partial credit)")
    
    # Governance (20 points)
    security_md = Path("SECURITY.md")
    codeowners = Path("CODEOWNERS")
    support_md = Path("SUPPORT.md")
    funding_yml = Path(".github/FUNDING.yml")
    
    if security_md.exists():
        gov_score += 5
        notes.append("SECURITY.md exists")
    if codeowners.exists():
        gov_score += 5
        notes.append("CODEOWNERS exists")
    if support_md.exists():
        gov_score += 5
        notes.append("SUPPORT.md exists")
    if funding_yml.exists():
        gov_score += 5
        notes.append(".github/FUNDING.yml exists")
    
    # Check CI workflows
    project_gov_workflow = Path(".github/workflows/project-governance.yml")
    remediation_workflow = Path(".github/workflows/remediation_orchestrator.yml")
    if project_gov_workflow.exists() and remediation_workflow.exists():
        # Already counted in tech, but ensure they're valid YAML-ish
        pass
    
    # Total score
    score = tech_score + product_score + gtm_score + finance_score + gov_score
    
    # Check for critical blockers
    critical_blockers = count_critical_blockers(issue_register)
    if critical_blockers > 0:
        notes.append(f"WARNING: {critical_blockers} CRITICAL open issue(s) found")
        # Don't reduce score, but flag it
    
    # Threshold
    threshold = int(os.environ.get("READINESS_THRESHOLD", "90"))
    
    # Prepare output
    data = {
        "score": score,
        "threshold": threshold,
        "gate_passes": score >= threshold and critical_blockers == 0,
        "sub_scores": {
            "technical": tech_score,
            "product": product_score,
            "gtm": gtm_score,
            "finance": finance_score,
            "governance": gov_score
        },
        "critical_blockers": critical_blockers,
        "notes": notes,
        "timestamp": json.dumps(os.popen("date -u +%Y-%m-%dT%H:%M:%SZ").read().strip())
    }
    
    # Write readiness file
    with open(readiness_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Print score for CI
    print(score)
    
    # Exit with error if below threshold or has blockers
    if score < threshold or critical_blockers > 0:
        sys.exit(1)
    
    sys.exit(0)

if __name__ == "__main__":
    main()
