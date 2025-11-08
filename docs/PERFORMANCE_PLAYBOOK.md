# Performance Playbook

**Last Updated:** 2025-01-27

This playbook outlines performance optimization strategies, monitoring practices, and troubleshooting guides for the What's for Dinner monorepo.

---

## Table of Contents

1. [Performance Budgets](#performance-budgets)
2. [Bundle Optimization](#bundle-optimization)
3. [Runtime Performance](#runtime-performance)
4. [Mobile Performance](#mobile-performance)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Troubleshooting](#troubleshooting)

---

## Performance Budgets

### Web App Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **First Contentful Paint (FCP)** | < 1.8s | 1.8-3.0s | > 3.0s |
| **Largest Contentful Paint (LCP)** | < 2.5s | 2.5-4.0s | > 4.0s |
| **Time to Interactive (TTI)** | < 3.8s | 3.8-7.3s | > 7.3s |
| **Total Blocking Time (TBT)** | < 200ms | 200-600ms | > 600ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1-0.25 | > 0.25 |
| **First Input Delay (FID)** | < 100ms | 100-300ms | > 300ms |

### Bundle Size Targets

| Bundle | Target (gzipped) | Warning | Critical |
|--------|------------------|---------|----------|
| **Initial JS** | < 200KB | 200-300KB | > 300KB |
| **Initial CSS** | < 50KB | 50-100KB | > 100KB |
| **Total Page Weight** | < 500KB | 500-1000KB | > 1000KB |

### Mobile App Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **App Launch Time** | < 2s | 2-3s | > 3s |
| **APK Size** | < 30MB | 30-50MB | > 50MB |
| **Memory Usage** | < 150MB | 150-250MB | > 250MB |

---

## Bundle Optimization

### 1. Code Splitting

**Strategy:**
- Use dynamic imports for route-based splitting
- Lazy load heavy components
- Split vendor bundles by usage frequency

**Implementation:**
```typescript
// Route-based splitting (automatic in Next.js)
// Component lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If client-only
});
```

### 2. Tree Shaking

**Strategy:**
- Use ES modules
- Set `sideEffects: false` in package.json
- Import only what you need

**Verification:**
```bash
# Analyze bundle
cd apps/web
pnpm build:analyze
```

### 3. Image Optimization

**Strategy:**
- Use Next.js Image component
- Optimize images at build time
- Use WebP/AVIF formats
- Implement lazy loading

**Implementation:**
```typescript
import Image from 'next/image';

<Image
  src="/meal.jpg"
  alt="Delicious meal"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. Font Optimization

**Strategy:**
- Use `font-display: swap`
- Subset fonts (already done)
- Preload critical fonts
- Use system fonts when possible

**Current Setup:**
- ✅ `font-display: swap` enabled
- ✅ Font subsets configured
- ✅ Preload for critical fonts

---

## Runtime Performance

### 1. React Optimization

**Best Practices:**
- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback` wisely
- Avoid unnecessary re-renders
- Use React Query for data fetching

**Example:**
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});
```

### 2. State Management

**Strategy:**
- Keep state local when possible
- Use React Query for server state
- Minimize context providers
- Avoid prop drilling

### 3. API Optimization

**Strategy:**
- Implement request caching
- Use React Query for automatic caching
- Batch requests when possible
- Implement request deduplication

---

## Mobile Performance

### 1. Hermes Engine

**Status:** ✅ Enabled for Android

**Benefits:**
- Faster startup time
- Lower memory usage
- Better performance

### 2. ProGuard & Resource Shrinking

**Status:** ✅ Enabled for Android

**Benefits:**
- Smaller APK size (15-20% reduction)
- Better runtime performance
- Obfuscated code

### 3. Image Optimization

**Strategy:**
- Use WebP format
- Compress images
- Implement lazy loading
- Use appropriate sizes

### 4. Native Performance

**Best Practices:**
- Use native components when possible
- Avoid unnecessary bridge calls
- Optimize animations
- Use native drivers for animations

---

## Monitoring & Metrics

### 1. Web Vitals

**Tools:**
- Lighthouse CI (already configured)
- Web Vitals library (already installed)
- Vercel Analytics (if deployed)

**Monitoring:**
```bash
# Run Lighthouse CI
pnpm lhci

# Check performance budgets
pnpm performance:budget
```

### 2. Bundle Analysis

**Tools:**
- `@next/bundle-analyzer` (configured)
- Webpack Bundle Analyzer

**Usage:**
```bash
cd apps/web
pnpm build:analyze
```

### 3. Mobile Monitoring

**Tools:**
- Expo Performance Monitor
- React Native Performance Monitor
- Sentry (already configured)

### 4. CI Integration

**Current Setup:**
- ✅ Lighthouse CI in workflows
- ✅ Performance budgets checked
- ✅ Bundle size tracking

---

## Troubleshooting

### Slow Initial Load

**Symptoms:**
- High FCP/LCP
- Large initial bundle

**Solutions:**
1. Analyze bundle: `pnpm build:analyze`
2. Check for large dependencies
3. Implement code splitting
4. Optimize images
5. Enable compression

### Slow Runtime Performance

**Symptoms:**
- High TBT
- Slow interactions
- High memory usage

**Solutions:**
1. Profile with React DevTools
2. Check for unnecessary re-renders
3. Optimize expensive computations
4. Review state management
5. Check for memory leaks

### Mobile App Issues

**Symptoms:**
- Slow launch time
- Large APK size
- High memory usage

**Solutions:**
1. Verify Hermes is enabled
2. Check ProGuard configuration
3. Optimize images
4. Review native dependencies
5. Profile with React Native Performance Monitor

### Bundle Size Issues

**Symptoms:**
- Bundle exceeds budget
- Slow downloads

**Solutions:**
1. Run bundle analyzer
2. Identify large dependencies
3. Consider alternatives
4. Implement dynamic imports
5. Remove unused code

---

## Performance Checklist

### Before Release

- [ ] Run Lighthouse CI: `pnpm lhci`
- [ ] Check bundle size: `pnpm build:analyze`
- [ ] Verify performance budgets: `pnpm performance:budget`
- [ ] Test on slow 3G connection
- [ ] Verify mobile app performance
- [ ] Check Core Web Vitals scores
- [ ] Review bundle composition
- [ ] Verify image optimization
- [ ] Check font loading
- [ ] Test offline functionality

### Regular Monitoring

- [ ] Weekly Lighthouse runs
- [ ] Monthly bundle analysis
- [ ] Quarterly performance audit
- [ ] Monitor Core Web Vitals
- [ ] Track mobile app metrics
- [ ] Review error rates
- [ ] Check memory usage

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Mobile Performance](https://reactnative.dev/docs/performance)
- [Bundle Analyzer Guide](./BUNDLE_ANALYZER.md)

---

## Quick Reference

```bash
# Performance checks
pnpm lhci                    # Lighthouse CI
pnpm build:analyze           # Bundle analysis
pnpm performance:budget      # Check budgets

# Mobile checks
cd apps/mobile
pnpm build                   # Build mobile app
# Check APK size in build output
```

---

**Remember:** Performance is an ongoing process. Monitor regularly and optimize incrementally.
