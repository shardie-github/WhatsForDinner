# Build Failure Runbook

## Severity Assessment

- **P1 (Critical):** Production build failure blocking deployments
- **P2 (Major):** Staging build failure affecting development workflow
- **P3 (Minor):** Build warnings or non-blocking failures

## Detection

### Automated Alerts
- CI/CD pipeline failures
- GitHub Actions workflow failures
- Build timeout alerts
- Deployment failures

### Manual Detection
- Developer reports of build issues
- Failed PR checks
- Deployment dashboard showing failures

## Investigation Checklist

### 1. Immediate Checks (0-5 minutes)

```bash
# Check latest build logs
# GitHub Actions: View workflow run logs
# Vercel: Check deployment logs

# Check build status
curl https://api.vercel.com/v1/deployments?projectId=YOUR_PROJECT | jq

# Check CI status
# GitHub Actions: Check workflow runs
```

### 2. Build Logs Analysis (5-15 minutes)

- [ ] Review error messages in build logs
- [ ] Identify failing step (install, build, test, deploy)
- [ ] Check for dependency issues
- [ ] Verify environment variables

**Common Error Patterns:**
- Dependency resolution failures
- TypeScript compilation errors
- Test failures
- Missing environment variables
- Out of memory errors

### 3. Dependency Issues (15-30 minutes)

- [ ] Check `package.json` and lockfile consistency
- [ ] Verify dependency versions
- [ ] Check for breaking changes in dependencies
- [ ] Review recent dependency updates

**Commands:**
```bash
# Check for dependency issues
pnpm install --frozen-lockfile

# Audit dependencies
pnpm supply-chain:audit

# Check outdated packages
pnpm outdated
```

### 4. Environment & Configuration (30-45 minutes)

- [ ] Verify build environment variables
- [ ] Check Next.js configuration
- [ ] Review TypeScript configuration
- [ ] Verify build scripts

**Common Issues:**
- Missing required env vars
- Incorrect build configuration
- TypeScript strict mode issues
- Build script errors

## Mitigation Steps

### Immediate Actions

1. **Revert Recent Changes**
   ```bash
   # If recent commit caused failure
   git revert HEAD
   # Or rollback to last known good commit
   git reset --hard <last-good-commit>
   ```

2. **Clear Build Cache**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node_modules and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Fix Dependency Issues**
   ```bash
   # Update lockfile
   pnpm install
   
   # Or pin problematic dependency
   # Edit package.json and reinstall
   ```

### Long-term Fixes

1. **Dependency Management**
   - Pin critical dependencies
   - Regular dependency audits
   - Automated dependency updates with testing

2. **Build Optimization**
   - Optimize build scripts
   - Add build caching
   - Parallelize build steps

3. **CI/CD Improvements**
   - Add build health checks
   - Implement build retry logic
   - Add build performance monitoring

## What to Capture

### Build Information
- Build ID and timestamp
- Failing step/command
- Error messages and stack traces
- Build environment (Node version, OS, etc.)
- Dependency versions

### Context
- Recent code changes
- Recent dependency updates
- Environment variable changes
- Configuration changes

### Logs
- Full build logs
- CI/CD workflow logs
- Dependency installation logs
- Test output (if tests failed)

## Dashboards & Tools

- **GitHub Actions:** Workflow runs dashboard
- **Vercel:** Deployment dashboard
- **Build Logs:** CI/CD platform logs
- **Dependency Dashboard:** `pnpm outdated` output

## Common Failure Scenarios

### Scenario 1: Dependency Resolution Failure

**Symptoms:**
- `ERR_PNPM_NO_MATCHING_VERSION`
- Lockfile conflicts
- Peer dependency warnings

**Fix:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Scenario 2: TypeScript Compilation Error

**Symptoms:**
- Type errors in build output
- `tsc --noEmit` failures

**Fix:**
- Review TypeScript errors
- Fix type issues or adjust `tsconfig.json`
- Consider `skipLibCheck` temporarily if needed

### Scenario 3: Out of Memory

**Symptoms:**
- `JavaScript heap out of memory`
- Build process killed

**Fix:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Scenario 4: Missing Environment Variables

**Symptoms:**
- `process.env.VAR is undefined`
- Build-time errors accessing env vars

**Fix:**
- Verify env vars in CI/CD platform
- Check `.env.example` for required vars
- Update build configuration

## Escalation

- **P1:** Immediate escalation to engineering lead
- **P2:** Notify on-call engineer
- **P3:** Log for daily standup

## Post-Incident

1. **Post-Mortem** (within 24 hours)
   - Document root cause
   - Identify contributing factors
   - Create action items
   - Update build documentation

2. **Prevention**
   - Add build health checks
   - Implement pre-commit hooks
   - Add build performance monitoring
   - Regular dependency audits

## Related Runbooks

- [API Latency](./api-latency.md)
- [Database Hotspot](./db-hotspot.md)
- [Main Incident Runbook](../INCIDENT_RUNBOOK.md)

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team
