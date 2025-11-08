# Bundle Analyzer Guide

## Overview

This project uses `@next/bundle-analyzer` to visualize and analyze bundle sizes.

## Usage

### Analyze Bundle Size

```bash
# From root
cd apps/web
pnpm build:analyze

# Or from root
pnpm --filter @whats-for-dinner/web build:analyze
```

This will:
1. Build the Next.js application
2. Generate bundle analysis reports
3. Open interactive HTML reports in your browser

### Reports Generated

- **Client bundles** - `.next/analyze/client.html`
- **Server bundles** - `.next/analyze/server.html`
- **Edge bundles** - `.next/analyze/edge.html` (if applicable)

## Understanding the Reports

### What to Look For

1. **Large Dependencies** - Identify heavy libraries that could be optimized
2. **Duplicate Code** - Find code that's bundled multiple times
3. **Unused Code** - Detect code that's included but not used
4. **Code Splitting** - Verify routes are properly code-split

### Optimization Tips

1. **Dynamic Imports** - Use `next/dynamic` for heavy components
2. **Tree Shaking** - Ensure `sideEffects: false` in package.json
3. **Replace Heavy Libs** - Consider lighter alternatives
4. **Remove Unused Code** - Use depcheck and ts-prune

## CI Integration

To add bundle analysis to CI:

```yaml
- name: Analyze bundle
  run: |
    cd apps/web
    pnpm build:analyze
  env:
    ANALYZE: true
```

## Troubleshooting

### Reports Not Opening

If the browser doesn't open automatically:
1. Check `.next/analyze/` directory
2. Open HTML files manually
3. Ensure build completed successfully

### Build Fails

If `build:analyze` fails:
1. Try regular build first: `pnpm build`
2. Check for TypeScript errors
3. Verify all dependencies are installed

## Best Practices

1. **Run Regularly** - Analyze bundles before major releases
2. **Set Budgets** - Define maximum bundle sizes
3. **Track Over Time** - Monitor bundle size trends
4. **Document Findings** - Keep notes on optimization decisions

## Related Documentation

- [Build Configuration](./BUILD_CONFIGURATION.md)
- [Performance Optimization](./PERFORMANCE.md)
- [Cleanup Report](../CLEANUP_REPORT.md)
