# Build Configuration Guide

This document describes the TypeScript, module system, and build configuration for this monorepo.

## TypeScript Configuration

### Root Configuration (`tsconfig.json`)

The root `tsconfig.json` serves as the base configuration with strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Package-Specific Configurations

All packages extend from the root configuration:

- **Apps** (`apps/web`, `apps/mobile`): Extend root, add app-specific paths
- **Packages** (`packages/ui`, `packages/utils`, etc.): Extend root, set `composite: true` for project references

### TypeScript Paths

The root `tsconfig.json` defines workspace paths:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@ui/*": ["./packages/ui/*"],
    "@utils/*": ["./packages/utils/*"],
    "@theme/*": ["./packages/theme/*"],
    "@whats-for-dinner/ui": ["./packages/ui/src"],
    "@whats-for-dinner/utils": ["./packages/utils/src"],
    "@whats-for-dinner/theme": ["./packages/theme/src"],
    "@whats-for-dinner/config": ["./packages/config/src"],
    "@whats-for-dinner/server": ["./packages/server/src"]
  }
}
```

**Usage:**
- Use `@whats-for-dinner/*` for workspace package imports (recommended)
- Use `@/*` for app-specific imports within each app
- Use `@ui/*`, `@utils/*`, etc. for direct package imports (less common)

## Module System (ESM/CJS)

### Current Setup

- **TypeScript:** `module: "esnext"`, `moduleResolution: "bundler"`
- **Package Manager:** pnpm 9.0.0 (supports both ESM and CJS)
- **Build Tools:**
  - Next.js 16.0.0 (handles ESM/CJS interop)
  - Expo ~52.0.0 (supports ESM)
  - Turbo 1.13.4 (monorepo orchestration)

### ESM/CJS Alignment

#### Packages

All packages should:
1. Set `"type": "module"` in `package.json` for ESM-only packages
2. Or omit `type` field and use `.mjs`/`.cjs` extensions as needed
3. Use `exports` field in `package.json` for explicit entry points:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

#### Apps

- **Next.js (`apps/web`):** Handles ESM/CJS automatically, no special config needed
- **Expo (`apps/mobile`):** Uses Metro bundler, supports ESM natively

### Best Practices

1. **Prefer ESM** for new code
2. **Use `.mjs` extension** if mixing ESM/CJS in same package
3. **Use `exports` field** instead of `main`/`module` for better compatibility
4. **Test imports** from both ESM and CJS contexts when creating shared packages

## Node Version

- **Required:** Node.js >=18.0.0 <21.0.0
- **Recommended:** Node.js 20 LTS (specified in `.nvmrc`)
- **Package Manager:** pnpm >=8.0.0 (currently 9.0.0)

Use `.nvmrc` for local development:
```bash
nvm use  # Uses Node 20 from .nvmrc
```

## Build Pipeline

### Turbo Configuration

The `turbo.json` defines the build pipeline:

1. **Dependencies:** `dependsOn: ["^build"]` ensures packages build before apps
2. **Caching:** Outputs are cached for faster rebuilds
3. **Environment:** `env` fields specify which env vars invalidate cache

### Build Order

1. Packages (`packages/*`) build first
2. Apps (`apps/*`) build after their dependencies
3. Tests run after builds complete

### Running Builds

```bash
# Build everything
pnpm build

# Build specific app
pnpm build:web
pnpm build:mobile

# Build packages only
pnpm build:packages
```

## CI/CD Configuration

### GitHub Actions

The CI pipeline runs in this order:

1. **Install** - Install dependencies with caching
2. **Typecheck** - TypeScript type checking (parallel)
3. **Lint** - ESLint + Prettier checks (parallel)
4. **Test** - Run test suite (after typecheck + lint)
5. **Build** - Build all packages and apps (after typecheck + lint)
6. **Audit** - Security audit (parallel)

### Node Version in CI

CI uses `.nvmrc` to ensure consistent Node version:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
```

## Troubleshooting

### TypeScript Errors

- **"Cannot find module"**: Check `tsconfig.json` paths configuration
- **"Module not found"**: Ensure package is listed in workspace dependencies
- **Strict mode errors**: All packages must extend root `tsconfig.json` with `strict: true`

### Build Errors

- **"Package not found"**: Run `pnpm install` to link workspace packages
- **"Circular dependency"**: Check Turbo pipeline dependencies
- **"Out of memory"**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096`

### Module Resolution

- **ESM/CJS conflicts**: Ensure `package.json` has correct `type` field
- **Import errors**: Use workspace package names (`@whats-for-dinner/*`) not relative paths
- **Dynamic imports**: Use `import()` syntax, not `require()`

## References

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turbo Build System](https://turbo.build/repo/docs)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Expo TypeScript](https://docs.expo.dev/guides/typescript/)
