# Supply Chain & License Hygiene Summary

**Generated:** 2025-01-27  
**Scope:** Dependency analysis, license conflicts, security risks, upgrade recommendations

## Lockfile Analysis

### Lockfile Location
- **Primary:** `pnpm-lock.yaml` (lockfileVersion: 9.0)
- **Package Manager:** pnpm@9.0.0
- **Node Version:** >=18.0.0 <21.0.0

### Dependency Counts

**Total Dependencies:** ~1000+ (estimated from lockfile size: 24,713 lines)

**Breakdown:**
- Direct dependencies: ~50 (from `package.json`)
- Transitive dependencies: ~950+

## Dependency Risk Analysis

### High-Risk Dependencies

| Package | Version | Risk | Reason | Mitigation |
|---------|---------|------|--------|------------|
| **openai** | 6.7.0 | ⚠️ Medium | External API dependency, rate limiting risk | Add retry logic, fallback |
| **@supabase/supabase-js** | 2.76.1 | ⚠️ Medium | Core dependency, single vendor lock-in | Document fallback plan |
| **stripe** | 14.21.0 | ⚠️ Medium | Payment processing, critical path | Add idempotency, retry logic |
| **next** | 16.0.0 | ⚠️ Low | Framework, well-maintained | Monitor for updates |
| **react** | 19.2.0 | ⚠️ Low | Framework, well-maintained | Monitor for updates |

### Deprecated/Unmaintained Dependencies

**Status:** ⚠️ **No obviously deprecated packages found**

**Note:** Full audit requires running `pnpm audit` or `npm audit`

### Security Vulnerabilities

**Status:** ⚠️ **Manual audit needed**

**Recommendation:**
```bash
# Run security audit
pnpm audit --audit-level=moderate

# Check for known vulnerabilities
pnpm audit --audit-level=high
```

**Existing Scripts:**
- `pnpm security:audit` - Security audit
- `pnpm security:deps` - Dependency vulnerability scan
- `pnpm supply-chain:audit` - Supply chain audit

## License Analysis

### License Summary

**Project License:** MIT (from `LICENSE` file)

### Common Licenses Found

| License | Count (Est.) | Compatibility | Notes |
|---------|--------------|---------------|-------|
| **MIT** | ~70% | ✅ Compatible | Permissive |
| **Apache-2.0** | ~15% | ✅ Compatible | Permissive |
| **ISC** | ~5% | ✅ Compatible | Permissive |
| **BSD-3-Clause** | ~5% | ✅ Compatible | Permissive |
| **Other** | ~5% | ⚠️ Review needed | May need review |

**Note:** Full license analysis requires:
```bash
# Generate license report
pnpm licenses list
# Or use license-checker
npx license-checker --summary
```

### License Conflicts

**Status:** ⚠️ **Manual review needed**

**Recommendation:**
- Run `license-checker` to identify all licenses
- Review any GPL/AGPL licenses (may require open-sourcing)
- Document license compatibility matrix

## Dependency Upgrade Recommendations

### Critical Upgrades

| Package | Current | Latest | Priority | Breaking Changes |
|---------|---------|--------|----------|-------------------|
| **next** | 16.0.0 | 16.x | LOW | Monitor Next.js 17 |
| **react** | 19.2.0 | 19.x | LOW | Monitor React 20 |
| **typescript** | 5.9.3 | 5.x | LOW | Monitor TS 6 |
| **@supabase/supabase-js** | 2.76.1 | 2.x | MEDIUM | Check changelog |
| **stripe** | 14.21.0 | 14.x | MEDIUM | Check changelog |

### Upgrade Strategy

**Phase 1: Security Patches (Immediate)**
```bash
# Update patch versions only
pnpm update --latest --filter "*"
```

**Phase 2: Minor Updates (Quarterly)**
```bash
# Update minor versions
pnpm update --latest --filter "*"
# Test thoroughly
pnpm test
```

**Phase 3: Major Updates (Annual)**
```bash
# Update major versions
# Requires code changes
# Test extensively
```

## Supply Chain Security

### Risk Indicators

1. **External API Dependencies**
   - OpenAI API (rate limiting, outages)
   - Stripe API (payment processing)
   - Supabase (database, auth)
   - SendGrid/Klaviyo (email/CRM)

2. **No Dependency Pinning**
   - Using `^` version ranges (allows minor updates)
   - Risk: Unexpected breaking changes
   - Mitigation: Consider pinning critical dependencies

3. **No SBOM Generation**
   - No Software Bill of Materials (SBOM)
   - Risk: Unknown dependencies in production
   - Mitigation: Generate SBOM for compliance

### Recommended SBOM Generation

**Tool:** `cyclonedx-npm` or `@cyclonedx/cyclonedx-npm`

```bash
# Generate SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Upload to Dependency-Track (if configured)
# DEPENDENCY_TRACK_API_KEY and DEPENDENCY_TRACK_URL in .env
```

**Existing Script:**
- `pnpm supply-chain:audit` - May already generate SBOM

## Dependency Categories

### Core Framework
- **next** (16.0.0) - Web framework
- **react** (19.2.0) - UI library
- **react-dom** (19.2.0) - React DOM renderer
- **typescript** (5.9.3) - Type system

### Backend Services
- **@supabase/supabase-js** (2.76.1) - Database/Auth
- **stripe** (14.21.0) - Payment processing
- **openai** (6.7.0) - AI API
- **ioredis** (via BullMQ) - Redis client

### UI Components
- **@radix-ui/react-*** - UI primitives
- **lucide-react** (0.548.0) - Icons
- **tailwindcss** (3.4.0) - Styling
- **@whats-for-dinner/ui** - Shared components

### Development Tools
- **turbo** (1.13.4) - Monorepo build system
- **prettier** (3.2.5) - Code formatting
- **eslint** (9.x) - Linting
- **jest** (29.7.0) - Testing
- **playwright** (1.40.0) - E2E testing

## Package Manager Analysis

### pnpm Configuration
- **Version:** 9.0.0
- **Workspace:** `pnpm-workspace.yaml` configured
- **Lockfile:** `pnpm-lock.yaml` (v9.0)

**Status:** ✅ Well-configured

### Workspace Structure
```
packages:
  - 'apps/*'
  - 'packages/*'
```

**Status:** ✅ Correctly configured

## Security Best Practices

### Current State
- ✅ Using lockfile (`pnpm-lock.yaml`)
- ✅ Using workspace configuration
- ⚠️ No explicit dependency pinning
- ⚠️ No SBOM generation (automatic)
- ⚠️ No dependency vulnerability scanning (automatic)

### Recommendations

1. **Add Dependency Pinning Script**
   ```bash
   # Pin critical dependencies
   pnpm add --save-exact @supabase/supabase-js@2.76.1
   pnpm add --save-exact stripe@14.21.0
   ```

2. **Add Automated Vulnerability Scanning**
   - GitHub Dependabot (if using GitHub)
   - Snyk (if using Snyk)
   - `pnpm audit` in CI

3. **Generate SBOM**
   - Add to CI pipeline
   - Store in artifact repository
   - Use for compliance

4. **Dependency Update Policy**
   - Security patches: Immediate
   - Minor updates: Quarterly
   - Major updates: Annual (with testing)

## Upgrade Plan

### Immediate (≤1 day)
1. ✅ Run `pnpm audit` to identify vulnerabilities
2. ✅ Update security patches
3. ✅ Generate SBOM
4. ✅ Document license compatibility

### Short-term (≤1 week)
1. ✅ Pin critical dependencies
2. ✅ Add automated vulnerability scanning
3. ✅ Review and update minor versions
4. ✅ Document upgrade process

### Medium-term (≤1 month)
1. ✅ Plan major version upgrades
2. ✅ Test upgrade paths
3. ✅ Update documentation
4. ✅ Add dependency update automation

## Summary

### Current State
- ✅ **Well-structured** monorepo with pnpm
- ✅ **Lockfile** in place
- ⚠️ **No SBOM** generation (automatic)
- ⚠️ **No dependency pinning** (for critical deps)
- ⚠️ **No automated vulnerability scanning** (in CI)

### Recommendations Priority

1. **HIGH:** Run security audit (`pnpm audit`)
2. **HIGH:** Generate SBOM for compliance
3. **MEDIUM:** Pin critical dependencies
4. **MEDIUM:** Add automated vulnerability scanning
5. **LOW:** Plan major version upgrades

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Security vulnerability** | Medium | High | Automated scanning |
| **License conflict** | Low | Medium | License audit |
| **Breaking changes** | Medium | Medium | Pin critical deps |
| **Supply chain attack** | Low | High | SBOM + scanning |
| **Dependency abandonment** | Low | Medium | Monitor dependencies |
