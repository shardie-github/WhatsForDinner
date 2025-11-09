# Code Quality Playbook

This document describes the code quality tools, processes, and policies for maintaining a clean, maintainable codebase.

## Purpose

The code quality playbook ensures:
- Dead code is identified and removed systematically
- Unused dependencies are tracked and removed
- Code structure follows consistent patterns
- Tooling prevents regressions

## Tools We Run

### 1. TypeScript Compiler (`tsc`)
**Command**: `pnpm typecheck`

**Purpose**: Type checking with strict settings including `noUnusedLocals` and `noUnusedParameters`.

**What it catches**:
- Type errors
- Unused local variables
- Unused function parameters

**How to fix**: Remove unused variables or prefix with `_` if intentionally unused.

### 2. ts-prune
**Command**: `pnpm prune:exports`

**Purpose**: Detects unused TypeScript exports across the codebase.

**What it catches**:
- Exported functions/types that are never imported
- Unused public APIs

**How to triage**:
- ✅ **Safe to delete**: Internal utilities, scripts, helpers
- ⚠️ **Quarantine**: Public APIs, types used dynamically, platform-specific code
- ❌ **Keep**: Entry points, default exports from config files

**Output**: `reports/ts-prune.txt`

### 3. Knip
**Command**: `pnpm scan:usage`

**Purpose**: Detects unused files, dependencies, and exports.

**What it catches**:
- Unused files
- Unused dependencies
- Unused exports (complementary to ts-prune)

**How to triage**:
- Check if files are referenced dynamically
- Verify dependencies aren't used in build scripts
- Review false positives (config files, entry points)

**Output**: `reports/knip.json`

### 4. depcheck
**Command**: `pnpm audit:deps`

**Purpose**: Finds unused dependencies in package.json.

**What it catches**:
- Dependencies listed but never imported
- Missing dependencies (imported but not listed)

**How to triage**:
- **Unused dependencies**: Remove if truly unused, keep if:
  - Used in build scripts
  - Used in CI/CD
  - Required by other tools
- **Missing dependencies**: Add to appropriate section (dependencies/devDependencies)

**Output**: `reports/depcheck.json`

### 5. ESLint
**Command**: `pnpm lint`

**Purpose**: Code quality and style enforcement.

**Key rules**:
- `no-unused-vars`: Warns on unused variables
- `no-console`: Warns on console statements (allows warn/error)

**Unused disable directives**: `pnpm lint:unused` finds ESLint disable comments that are no longer needed.

**Output**: `reports/eslint-unused-disables.json`

## How to Read Reports

### ts-prune.txt Format
```
file.ts:123 - exportName
file.ts:456 - anotherExport (used in module)
```

- **No "(used in module)"**: Export is unused → candidate for removal
- **"(used in module)"**: Used internally but not exported → safe to keep

### depcheck.json Format
```json
{
  "dependencies": [],
  "devDependencies": ["unused-package"],
  "missing": {
    "missing-package": ["file.ts"]
  }
}
```

- **dependencies/devDependencies**: Unused packages
- **missing**: Packages imported but not in package.json

### knip.json Format
```json
{
  "files": ["unused-file.ts"],
  "dependencies": ["unused-dep"],
  "exports": {
    "file.ts": ["unusedExport"]
  }
}
```

## Deletion Policy

### Safe to Delete
1. ✅ Files in `.disabled` directories
2. ✅ Unused exports from internal scripts
3. ✅ Unused utility functions
4. ✅ Dead test files

### Quarantine First
1. ⚠️ Public API exports (may be used dynamically)
2. ⚠️ Type definitions (may be used via reflection)
3. ⚠️ Platform-specific code (may be loaded conditionally)
4. ⚠️ Configuration helpers (may be called at runtime)

**Quarantine process**:
1. Move to `/archive/YYYYMMDD/` directory
2. Document reason in `ARCHIVE.md`
3. Monitor for 30 days
4. Delete if no usage found

### Never Delete
1. ❌ Public API entry points
2. ❌ Exports used in tests
3. ❌ Configuration files (next.config.ts, etc.)
4. ❌ Type definitions used in public APIs

## Folder Conventions

### Structure
```
src/
  features/     # Feature modules
  entities/      # Domain entities
  shared/        # Shared utilities
  lib/           # Third-party integrations
  pages|app/     # Route handlers (framework-specific)
  styles/        # Global styles
```

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@ui/*` → `./packages/ui/*`
- `@utils/*` → `./packages/utils/*`
- `@theme/*` → `./packages/theme/*`

**Usage**: Always use aliases instead of relative paths (`@/components/Button` not `../../components/Button`)

### Barrel Files (index.ts)
**Do**:
- ✅ Export specific named exports
- ✅ Re-export from sub-modules explicitly
- ✅ Keep barrel files small (< 20 exports)

**Don't**:
- ❌ Use wildcard re-exports (`export * from './module'`)
- ❌ Create deep barrel hierarchies
- ❌ Export everything from a large module

## Naming Conventions

### Files
- **kebab-case**: `user-profile.ts`, `api-client.ts`
- **PascalCase**: `UserProfile.tsx` (React components)

### Components
- **PascalCase**: `Button`, `UserProfile`, `NavigationMenu`

### Utilities
- **camelCase**: `formatDate`, `validateEmail`, `getUserById`

### Constants
- **UPPER_SNAKE_CASE**: `API_BASE_URL`, `MAX_RETRY_COUNT`

## Test Placement

**Policy**: Tests alongside sources (`*.test.ts[x]`)

**Example**:
```
src/
  components/
    Button.tsx
    Button.test.tsx
  utils/
    formatDate.ts
    formatDate.test.ts
```

**Alternative**: `tests/` directory at package root (pick one and be consistent)

## CI Integration

The `code-hygiene.yml` workflow runs on:
- Pull requests to `main`/`develop`
- Pushes to `main`
- Manual trigger (`workflow_dispatch`)

**What it does**:
1. Runs type checking
2. Runs linting
3. Scans for unused exports
4. Audits dependencies
5. Uploads reports as artifacts

**Reports are available**:
- In GitHub Actions artifacts
- In `reports/` directory locally

## Approval Process

### For Deletions
1. **Automated**: Files in `.disabled` directories → auto-delete
2. **Review required**: Public API exports → require PR approval
3. **Quarantine**: Uncertain items → move to archive first

### PR Naming
Format: `refactor: dead code removal (wave N)`

Example: `refactor: dead code removal (wave 1)`

### PR Description Template
```markdown
## Dead Code Removal Wave N

### Summary
- X files deleted
- Y exports removed
- Z dependencies removed

### Evidence
- [ts-prune report](./reports/ts-prune.txt)
- [knip report](./reports/knip.json)
- [depcheck report](./reports/depcheck.json)

### Verification
- [ ] Build passes
- [ ] Tests pass
- [ ] No breaking changes
```

## False Positives

### Common False Positives

1. **Dynamic imports**: Exports used via `import()` may not be detected
   - **Solution**: Add to `knip.json` ignore list or use `// @ts-expect-error` with comment

2. **Config file exports**: Default exports from config files are often unused
   - **Solution**: Keep them (they're loaded by framework)

3. **Type-only exports**: Types may appear unused but are used for type checking
   - **Solution**: Use `import type` or keep if public API

4. **Platform-specific code**: Code loaded conditionally may appear unused
   - **Solution**: Document in code or add to ignore list

### Reporting False Positives

1. Document in `reports/dead-code-plan.md`
2. Add to tool ignore configs (`knip.json`, etc.)
3. Update this playbook if pattern is common

## Maintenance

### Weekly
- Review `reports/dead-code-plan.md`
- Run `pnpm hygiene` locally
- Check CI hygiene reports

### Monthly
- Review quarantined items in `/archive/`
- Delete items quarantined > 30 days
- Update tool configurations

### Quarterly
- Review folder structure for drift
- Consolidate duplicate modules
- Update this playbook with learnings

## Getting Help

- **Questions**: Open a GitHub discussion
- **False positives**: Document in `reports/dead-code-plan.md`
- **Tool issues**: Check tool documentation or open issue

## References

- [ts-prune docs](https://github.com/nadeesha/ts-prune)
- [knip docs](https://knip.dev/)
- [depcheck docs](https://github.com/depcheck/depcheck)
- [TypeScript unused locals](https://www.typescriptlang.org/tsconfig#noUnusedLocals)
