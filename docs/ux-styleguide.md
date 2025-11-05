# UX Style Guide - Hardonia

## Visual Identity

### Brand Principles
- **Modern**: Clean, contemporary design language
- **Bold**: High contrast, confident typography
- **Premium**: Refined details, smooth interactions
- **Accessible**: WCAG 2.2 AA compliant

### Color System

Our design system uses CSS variables for theming:

- **Primary**: `hsl(var(--primary))` - Main brand color
- **Secondary**: `hsl(var(--secondary))` - Supporting elements
- **Accent**: `hsl(var(--accent))` - Highlights and CTAs
- **Muted**: `hsl(var(--muted))` - Backgrounds and subtle elements
- **Destructive**: `hsl(var(--destructive))` - Error states

### Typography

- **Display**: For hero headings and large text
- **Body**: Default text size, optimized for readability
- **Small**: Supporting text, captions

### Spacing

Consistent spacing scale:
- Base unit: `0.25rem` (4px)
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius

- **Default**: `14px` (`var(--radius)`)
- **Small**: `calc(var(--radius) - 4px)`
- **Large**: `calc(var(--radius) + 4px)`
- **Pill**: `9999px` (for buttons)

### Motion

- **Transitions**: 150-250ms for microinteractions
- **Spring animations**: For page mounts and reveals
- **Reduced motion**: Always respected via `prefers-reduced-motion`

## Component Usage

### Buttons

```tsx
<Button variant="default" size="md">Primary Action</Button>
<Button variant="outline" size="lg">Secondary</Button>
<Button variant="ghost" size="pill">Tertiary</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Forms

```tsx
<Input type="text" placeholder="Enter text" />
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
</Select>
```

## Accessibility Guidelines

1. **Keyboard Navigation**: All interactive elements must be keyboard accessible
2. **Focus States**: Visible focus rings on all focusable elements
3. **ARIA Labels**: Proper labeling for screen readers
4. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
5. **Skip Links**: Available for keyboard users to skip navigation

## Performance Targets

- **LCP**: ≤ 2.5s (mobile priority)
- **INP**: ≤ 200ms
- **CLS**: ≤ 0.05

## Mobile First

- Touch targets: Minimum 44x44px
- Spacing: Generous padding for thumb navigation
- Typography: Responsive scaling from mobile to desktop
