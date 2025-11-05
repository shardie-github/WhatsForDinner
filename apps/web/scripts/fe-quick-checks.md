# FE Quick Checks

## Accessibility Checks

- **Axe DevTools**: No critical violations
- **Keyboard Navigation**: 
  - Header nav fully navigable
  - Drawer/modal focus traps work correctly
  - Skip links functional
- **Screen Reader**: 
  - Proper ARIA labels
  - Live regions for dynamic content
  - Landmarks properly marked

## Performance Checks

- **CLS**: Reserve media sizes; use `aspect-video` or explicit width/height
- **INP**: 
  - Avoid long tasks
  - Defer non-critical JS
  - Prefer CSS for trivial animations
- **LCP**: 
  - Preconnect fonts
  - Hero image priority
  - Avoid blocking CSS

## PWA Checks

- Manifest valid
- Service worker registered
- Offline page accessible
- Icons properly sized

## Motion Checks

- Respects `prefers-reduced-motion`
- Transitions ≤ 250ms
- Spring animations for page mounts
