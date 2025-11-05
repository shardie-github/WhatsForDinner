# Internationalization (i18n) Readiness

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

## Overview

This document outlines our internationalization (i18n) strategy, current state, and readiness for multi-language support.

---

## Current State

### Language Support

- **Current Language:** English (en)
- **Language Attribute:** Hardcoded to "en" in layout
- **RTL Support:** Not implemented
- **Date/Number Formatting:** Default locale (en-US)

### Infrastructure

- **i18n Library:** Not yet integrated
- **Translation Management:** Not yet implemented
- **Key Extraction:** Manual process
- **Fallback Strategy:** English hardcoded

---

## i18n Strategy

### Phase 1: Infrastructure (Current)

- [x] Document i18n readiness
- [ ] Add language attribute support
- [ ] Add direction (LTR/RTL) support
- [ ] Identify i18n library (recommend: next-intl or react-i18next)

### Phase 2: Content Extraction (Future)

- [ ] Extract translatable strings
- [ ] Create translation key structure
- [ ] Set up translation management system
- [ ] Create translation workflow

### Phase 3: Initial Languages (Future)

- [ ] Add Spanish (es)
- [ ] Add French (fr)
- [ ] Add German (de)
- [ ] Add Japanese (ja)

### Phase 4: Full Support (Future)

- [ ] Language switcher UI
- [ ] Locale detection
- [ ] Date/number formatting hooks
- [ ] RTL layout support

---

## i18n Key Extraction Strategy

### Key Structure

```
[namespace].[component].[key]

Examples:
- common.buttons.save
- common.buttons.cancel
- navigation.home
- navigation.settings
- errors.validation.required
```

### Extraction Methods

1. **Automated:** Use i18n extraction tools (e.g., i18next-scanner)
2. **Manual:** Review components for hardcoded strings
3. **CI/CD:** Automated checks prevent hardcoded strings

### Key Naming Conventions

- **Lowercase:** All keys lowercase
- **Dot Notation:** Use dots for hierarchy
- **Descriptive:** Keys should be self-documenting
- **Namespace:** Group by feature/domain

---

## Date and Number Formatting

### Current Implementation

- **Dates:** Default JavaScript Date formatting
- **Numbers:** Default JavaScript number formatting
- **Locale:** Hardcoded to en-US

### Target Implementation

```typescript
// Example with next-intl
import { useFormatter } from 'next-intl';

const formatter = useFormatter();
const date = formatter.dateTime(new Date(), { dateStyle: 'long' });
const number = formatter.number(1234.56, { style: 'currency', currency: 'USD' });
```

### Supported Formats

- **Dates:** Long, short, relative (e.g., "2 hours ago")
- **Numbers:** Currency, percentage, decimal
- **Times:** 12-hour, 24-hour formats

---

## RTL (Right-to-Left) Support

### Current State

- **RTL Languages:** Not supported
- **CSS:** No RTL-specific styles
- **Layout:** Hardcoded LTR

### RTL-Ready Languages

- Arabic (ar)
- Hebrew (he)
- Persian (fa)
- Urdu (ur)

### Implementation Plan

1. **CSS:** Use logical properties (margin-inline-start vs margin-left)
2. **Layout:** Flexbox/Grid with direction awareness
3. **Icons:** Mirror icons for RTL
4. **Text:** Set `dir="rtl"` attribute

### Example CSS

```css
/* LTR (default) */
.container {
  margin-left: 1rem;
}

/* RTL support */
.container {
  margin-inline-start: 1rem;
}
```

---

## Translation Fallbacks

### Fallback Strategy

1. **Exact Locale:** en-US
2. **Language:** en
3. **Default:** en (English)

### Implementation

```typescript
// Example fallback chain
const translations = {
  'en-US': { ... },
  'en': { ... },
  'es': { ... },
  'fr': { ... },
};

function getTranslation(locale: string, key: string) {
  // Try exact locale
  if (translations[locale]?.[key]) return translations[locale][key];
  
  // Try language code
  const lang = locale.split('-')[0];
  if (translations[lang]?.[key]) return translations[lang][key];
  
  // Fallback to English
  return translations['en'][key] || key;
}
```

---

## Non-Blocking Loading

### Strategy

- **Initial Load:** English (default)
- **Lazy Load:** Translations loaded on demand
- **Progressive Enhancement:** Works without JavaScript

### Implementation

```typescript
// Lazy load translations
const translations = await import(`./locales/${locale}.json`);

// Use Suspense for loading states
<Suspense fallback={<Loading />}>
  <TranslatedComponent />
</Suspense>
```

---

## Recommended Libraries

### Option 1: next-intl (Recommended for Next.js)

- **Pros:** Built for Next.js, server components support
- **Cons:** Next.js-specific
- **Installation:** `npm install next-intl`

### Option 2: react-i18next

- **Pros:** Mature, flexible, framework-agnostic
- **Cons:** Requires more setup
- **Installation:** `npm install react-i18next i18next`

### Option 3: next-i18next

- **Pros:** Next.js + i18next integration
- **Cons:** Less active maintenance
- **Installation:** `npm install next-i18next`

---

## Implementation Checklist

### Phase 1: Foundation

- [ ] Choose i18n library
- [ ] Add language attribute support to layout
- [ ] Add direction (LTR/RTL) support
- [ ] Create translation key structure
- [ ] Set up translation files structure

### Phase 2: Content

- [ ] Extract all translatable strings
- [ ] Create translation keys
- [ ] Set up translation management
- [ ] Create English translations (baseline)

### Phase 3: Infrastructure

- [ ] Add locale detection
- [ ] Implement language switcher
- [ ] Add date/number formatting hooks
- [ ] Test RTL layout

### Phase 4: Languages

- [ ] Add Spanish translations
- [ ] Add French translations
- [ ] Add German translations
- [ ] Add Japanese translations

---

## Testing Strategy

### Manual Testing

- [ ] Test all routes in each language
- [ ] Test RTL layout
- [ ] Test date/number formatting
- [ ] Test fallback behavior

### Automated Testing

- [ ] Test translation key completeness
- [ ] Test missing translation detection
- [ ] Test locale switching
- [ ] Test RTL CSS

---

## Current Limitations

1. **Hardcoded Language:** English only, hardcoded in layout
2. **No RTL Support:** Layout assumes LTR
3. **No Date/Number Formatting:** Default JavaScript formatting
4. **No Translation Management:** Manual process
5. **No Language Switcher:** Users cannot change language

---

## Future Enhancements

- [ ] Automatic locale detection from browser
- [ ] User preference storage
- [ ] Translation management UI
- [ ] Community translations
- [ ] Pluralization support
- [ ] Context-aware translations

---

## Contact

### i18n Questions
- **Email:** i18n@whatsfordinner.com

### General Support
- **Email:** support@whatsfordinner.com
- **Help Center:** [/help](/help)

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0
