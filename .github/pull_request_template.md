## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing completed (if applicable)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Architecture Council Review

**Required if this PR affects system architecture, critical paths, or introduces SPOF risks.**

- [ ] This change affects system architecture
- [ ] I've reviewed the System Intelligence Map (`src/observability/system_intelligence_map.json`)
- [ ] I've checked for SPOF risks and documented mitigation
- [ ] I've updated relevant guardrails in `infra/selfcheck/guardrails.yaml` (if needed)
- [ ] I've validated that guardrails still pass: `./infra/selfcheck/validate-guardrails.sh`
- [ ] I've updated the System Intelligence Map if modules/relationships changed
- [ ] I've considered resilience patterns (circuit breakers, retries, fallbacks)
- [ ] I've documented architectural decisions in code comments or docs

**If this is an architectural change, please provide:**
- **Business Goal**: Which business goal(s) does this change support?
- **Resilience Impact**: What resilience patterns are needed?
- **SPOF Risks**: Are any new SPOFs introduced? How are they mitigated?
- **Critical Paths**: Does this affect any critical user flows?

## Additional Notes
Any additional information that reviewers should know.
