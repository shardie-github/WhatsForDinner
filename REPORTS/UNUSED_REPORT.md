# Unused Code Analysis Report

**Generated:** 2025-01-27  
**Tools:** depcheck, ts-prune

## Summary

### Disabled Apps (100% Unused)
The following apps are marked as `.disabled` and have **zero imports** across the codebase:
- `apps/admin.disabled/` - 10 files, only referenced in docs
- `apps/billing.disabled/` - 1 file, only referenced in docs  
- `apps/developers.disabled/` - 1 file, only referenced in docs
- `apps/favorites.disabled/` - 1 file, only referenced in docs
- `apps/landing.disabled/` - 1 file, only referenced in docs
- `apps/pantry.disabled/` - 1 file, only referenced in docs

**Verification:** Grep search found zero imports of these apps in `.ts`/`.tsx` files.

### Backup Files
- `apps/web/package.json.bak.20251105_051457` - Old backup file
- `apps/web/public/*.20251105_051457` - Old backup files

### Unused Exports (from ts-prune)
Many unused exports found, but most are:
- Internal module functions (safe to keep)
- Type definitions (may be used for type checking)
- Test utilities (used in tests)

**Action:** Only removing 100% unused disabled apps and backup files.

## Files to Remove

1. `apps/admin.disabled/` (entire directory)
2. `apps/billing.disabled/` (entire directory)
3. `apps/developers.disabled/` (entire directory)
4. `apps/favorites.disabled/` (entire directory)
5. `apps/landing.disabled/` (entire directory)
6. `apps/pantry.disabled/` (entire directory)
7. `apps/web/package.json.bak.20251105_051457`
8. Backup files in `apps/web/public/` with `.20251105_051457` extension

## Impact Assessment

- **Risk Level:** Low - No code imports these files
- **Breaking Changes:** None
- **Test Impact:** None (disabled apps not in test suite)
