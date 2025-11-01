# Release Runbook

## Overview

This runbook describes the release process, versioning, and changelog management.

---

## Semantic Versioning Policy

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (API changes, schema changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes, patches (backward compatible)

### Current Version

Check `package.json` for current version.

---

## Release Checklist

### Pre-Release

- [ ] All tests passing (`pnpm test:ci`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Type checking passing (`pnpm type-check`)
- [ ] Security scan passing (`pnpm secrets:scan`)
- [ ] Bundle size check passing (`pnpm bundle:check`)
- [ ] Coverage threshold met (?70%)
- [ ] Lighthouse CI passing (if applicable)
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped in `package.json`

### Release

- [ ] Create release branch: `release/vX.Y.Z`
- [ ] Final testing on staging
- [ ] Merge to `main`
- [ ] Tag release: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
- [ ] Push tag: `git push origin vX.Y.Z`
- [ ] Monitor deployment
- [ ] Verify post-deploy health checks

### Post-Release

- [ ] Verify production health
- [ ] Monitor error rates
- [ ] Check Sentry for new errors
- [ ] Update release notes (if external)
- [ ] Communicate release to team

---

## Release Process

### 1. Prepare Release

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create release branch
git checkout -b release/v1.2.0

# Update version in package.json
# (Edit manually or use npm version)

# Update CHANGELOG.md (see below)
```

### 2. Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [1.2.0] - 2025-01-21

### Added
- New feature X
- New feature Y

### Changed
- Improved performance of Z
- Updated dependencies

### Fixed
- Fixed bug A
- Fixed bug B

### Security
- Security fix C
```

### 3. Final Testing

```bash
# Run all checks
pnpm lint
pnpm type-check
pnpm test:ci
pnpm build
pnpm bundle:check
pnpm secrets:scan
```

### 4. Create Release PR

```bash
# Commit changes
git add .
git commit -m "chore: release v1.2.0"

# Push branch
git push origin release/v1.2.0

# Create PR on GitHub
# Title: "Release v1.2.0"
# Labels: release
```

### 5. Merge and Tag

After PR approval and merge:

```bash
# Pull latest
git checkout main
git pull origin main

# Create signed tag
git tag -s v1.2.0 -m "Release v1.2.0"

# Push tag
git push origin v1.2.0
```

### 6. Monitor Deployment

- Watch GitHub Actions for deployment
- Monitor health checks: `/api/health`, `/api/readyz`
- Check error rates in Sentry
- Verify critical user flows

---

## Changelog Format

### Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes
```

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Features that will be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

## Release Types

### Major Release (X.0.0)

- Breaking changes
- Requires migration guide
- Requires communication to users
- Extended testing period

### Minor Release (0.X.0)

- New features (backward compatible)
- Standard testing
- Standard release process

### Patch Release (0.0.X)

- Bug fixes only
- Fast-track release
- Minimal testing

---

## Hotfix Process

For urgent fixes:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/v1.2.1

# Make minimal fix
# ... fix code ...

# Test fix
pnpm test
pnpm build

# Commit and push
git add .
git commit -m "fix: [description]"
git push origin hotfix/v1.2.1

# Create PR, merge, tag
```

---

## Release Automation

### GitHub Actions

Release workflow (`.github/workflows/release.yml`) automates:

1. Version bump (via PR)
2. Changelog generation (if automated)
3. Tag creation
4. Deployment

### Manual Release

If automation fails, use manual process above.

---

## Version Bumping

### Using npm/pnpm

```bash
# Patch
pnpm version patch

# Minor
pnpm version minor

# Major
pnpm version major
```

This automatically:
- Updates `package.json`
- Creates git commit
- Creates git tag

### Manual

Edit `package.json` directly, then commit and tag.

---

## Release Notes Template

### Internal Release Notes

```markdown
# Release v1.2.0

**Released**: 2025-01-21

## Highlights

- Feature X now available
- Performance improvements
- Bug fixes

## Breaking Changes

None (or list breaking changes)

## New Features

- Feature X: [description]
- Feature Y: [description]

## Improvements

- Improved performance of Z
- Updated dependencies

## Bug Fixes

- Fixed bug A
- Fixed bug B

## Security

- Security fix C

## Migration Guide

(If applicable)

## Rollback

If issues occur, rollback via [rollback.md](./rollback.md)
```

---

## Release Communication

### Internal

- Post in team Slack/Discord
- Update team wiki
- Notify stakeholders

### External (If Applicable)

- Update website/blog
- Send email to users (if major release)
- Post on social media

---

## Post-Release Monitoring

### First 24 Hours

- Monitor error rates hourly
- Check health endpoints hourly
- Review Sentry alerts
- Monitor performance metrics

### First Week

- Daily error rate review
- Weekly performance review
- User feedback collection

---

## Rollback

If critical issues occur post-release:

1. See [rollback.md](./rollback.md) for detailed procedure
2. Tag previous version as `vX.Y.Z-rollback`
3. Document rollback reason
4. Create issue to fix root cause

---

*Last updated: 2025-01-21*
