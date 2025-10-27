# Internationalization (i18n) Guide

This guide covers the internationalization infrastructure for What's For Dinner, including string extraction, ICU message format, pluralization, and localization best practices.

## Overview

Internationalization (i18n) enables our application to support multiple languages and regions, providing a localized experience for users worldwide.

## Quick Start

### 1. Extract User-Visible Strings

```bash
# Extract strings from codebase
pnpm run i18n:extract

# Extract with specific locale
pnpm run i18n:extract --locale en

# Extract with watch mode
pnpm run i18n:extract --watch
```

### 2. Generate Translation Files

```bash
# Generate translation files
pnpm run i18n:generate

# Generate for specific locale
pnpm run i18n:generate --locale es

# Generate all locales
pnpm run i18n:generate --all
```

### 3. Test Translations

```bash
# Test translation completeness
pnpm run i18n:test

# Test specific locale
pnpm run i18n:test --locale fr

# Test ICU message format
pnpm run i18n:test --icu
```

## Architecture

### 1. String Extraction

**Source**: User-visible strings in React components, API responses, and configuration files
**Output**: JSON files with extracted strings and metadata
**Format**: ICU Message Format with support for pluralization and formatting

### 2. Translation Management

**Structure**:
```
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── meals.json
│   │   └── errors.json
│   ├── es/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── meals.json
│   │   └── errors.json
│   └── fr/
│       ├── common.json
│       ├── auth.json
│       ├── meals.json
│       └── errors.json
```

### 3. Runtime Localization

**Features**:
- Dynamic locale switching
- Fallback to default locale
- ICU message formatting
- Pluralization support
- Date/time formatting
- Number formatting

## Implementation

### 1. String Extraction

#### React Components
```tsx
// Before
function WelcomeMessage({ name, mealCount }) {
  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <p>You have {mealCount} meals planned for this week.</p>
    </div>
  );
}

// After
import { useTranslation } from 'react-i18next';

function WelcomeMessage({ name, mealCount }) {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome.title', { name })}</h1>
      <p>{t('welcome.mealCount', { count: mealCount })}</p>
    </div>
  );
}
```

#### API Responses
```typescript
// Before
const errorMessage = 'Invalid email address';

// After
const errorMessage = t('errors.invalidEmail');
```

#### Configuration Files
```json
// Before
{
  "title": "What's For Dinner",
  "description": "Plan your meals with AI-powered recommendations"
}

// After
{
  "title": "{{app.title}}",
  "description": "{{app.description}}"
}
```

### 2. ICU Message Format

#### Basic Messages
```json
{
  "welcome": {
    "title": "Welcome, {name}!",
    "subtitle": "Let's plan your meals for {date}"
  }
}
```

#### Pluralization
```json
{
  "meals": {
    "count": "{count, plural, =0 {No meals planned} =1 {1 meal planned} other {# meals planned}}",
    "ingredients": "{count, plural, =0 {No ingredients} =1 {1 ingredient} other {# ingredients}}"
  }
}
```

#### Date/Time Formatting
```json
{
  "schedule": {
    "mealTime": "Meal scheduled for {date, date, short} at {time, time, short}",
    "lastUpdated": "Last updated {date, date, medium}"
  }
}
```

#### Number Formatting
```json
{
  "nutrition": {
    "calories": "{calories, number} calories",
    "price": "Price: {price, number, currency}"
  }
}
```

#### Conditional Messages
```json
{
  "dietary": {
    "restrictions": "{restrictions, plural, =0 {No dietary restrictions} =1 {1 dietary restriction} other {# dietary restrictions}}",
    "vegetarian": "{isVegetarian, select, true {Vegetarian} false {Not vegetarian} other {Unknown}}"
  }
}
```

### 3. Translation Files

#### English (en/common.json)
```json
{
  "welcome": {
    "title": "Welcome, {name}!",
    "subtitle": "Let's plan your meals for {date}"
  },
  "meals": {
    "count": "{count, plural, =0 {No meals planned} =1 {1 meal planned} other {# meals planned}}",
    "ingredients": "{count, plural, =0 {No ingredients} =1 {1 ingredient} other {# ingredients}}"
  },
  "errors": {
    "invalidEmail": "Invalid email address",
    "requiredField": "This field is required"
  }
}
```

#### Spanish (es/common.json)
```json
{
  "welcome": {
    "title": "¡Bienvenido, {name}!",
    "subtitle": "Planifiquemos tus comidas para {date}"
  },
  "meals": {
    "count": "{count, plural, =0 {No hay comidas planificadas} =1 {1 comida planificada} other {# comidas planificadas}}",
    "ingredients": "{count, plural, =0 {Sin ingredientes} =1 {1 ingrediente} other {# ingredientes}}"
  },
  "errors": {
    "invalidEmail": "Dirección de correo electrónico inválida",
    "requiredField": "Este campo es obligatorio"
  }
}
```

#### French (fr/common.json)
```json
{
  "welcome": {
    "title": "Bienvenue, {name} !",
    "subtitle": "Planifions vos repas pour {date}"
  },
  "meals": {
    "count": "{count, plural, =0 {Aucun repas planifié} =1 {1 repas planifié} other {# repas planifiés}}",
    "ingredients": "{count, plural, =0 {Aucun ingrédient} =1 {1 ingrédient} other {# ingrédients}}"
  },
  "errors": {
    "invalidEmail": "Adresse e-mail invalide",
    "requiredField": "Ce champ est obligatoire"
  }
}
```

## React Integration

### 1. Setup

```tsx
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      es: { common: es },
      fr: { common: fr }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 2. Component Usage

```tsx
// Basic usage
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome.title', { name: 'John' })}</h1>
      <p>{t('welcome.subtitle', { date: new Date() })}</p>
    </div>
  );
}
```

### 3. Namespace Usage

```tsx
// Multiple namespaces
import { useTranslation } from 'react-i18next';

function MealComponent() {
  const { t } = useTranslation(['meals', 'common']);
  
  return (
    <div>
      <h2>{t('meals:title')}</h2>
      <p>{t('common:description')}</p>
    </div>
  );
}
```

### 4. Language Switching

```tsx
// Language switcher
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

## Testing

### 1. Translation Completeness

```typescript
// i18n.test.ts
import { describe, it, expect } from 'vitest';
import { i18n } from './i18n';

describe('i18n', () => {
  it('should have all required keys in all locales', () => {
    const locales = ['en', 'es', 'fr'];
    const namespaces = ['common', 'auth', 'meals', 'errors'];
    
    locales.forEach(locale => {
      namespaces.forEach(namespace => {
        const keys = Object.keys(i18n.getResourceBundle(locale, namespace));
        expect(keys.length).toBeGreaterThan(0);
      });
    });
  });
});
```

### 2. ICU Message Format

```typescript
// icu.test.ts
import { describe, it, expect } from 'vitest';
import { i18n } from './i18n';

describe('ICU Message Format', () => {
  it('should handle pluralization correctly', () => {
    i18n.changeLanguage('en');
    
    expect(i18n.t('meals.count', { count: 0 })).toBe('No meals planned');
    expect(i18n.t('meals.count', { count: 1 })).toBe('1 meal planned');
    expect(i18n.t('meals.count', { count: 5 })).toBe('5 meals planned');
  });
  
  it('should handle date formatting correctly', () => {
    const date = new Date('2024-12-19');
    const result = i18n.t('schedule.mealTime', { date, time: date });
    expect(result).toContain('12/19/24');
  });
});
```

### 3. Fallback Testing

```typescript
// fallback.test.ts
import { describe, it, expect } from 'vitest';
import { i18n } from './i18n';

describe('i18n Fallback', () => {
  it('should fallback to English for missing translations', () => {
    i18n.changeLanguage('es');
    
    // This key doesn't exist in Spanish, should fallback to English
    const result = i18n.t('common.nonExistentKey');
    expect(result).toBe('common.nonExistentKey'); // i18n fallback behavior
  });
});
```

## Build Integration

### 1. String Extraction

```bash
# Extract strings from codebase
pnpm run i18n:extract

# Extract with specific patterns
pnpm run i18n:extract --pattern "src/**/*.{ts,tsx}"

# Extract with watch mode
pnpm run i18n:extract --watch
```

### 2. Translation Generation

```bash
# Generate translation files
pnpm run i18n:generate

# Generate for specific locale
pnpm run i18n:generate --locale es

# Generate all locales
pnpm run i18n:generate --all
```

### 3. Validation

```bash
# Validate translation files
pnpm run i18n:validate

# Validate specific locale
pnpm run i18n:validate --locale fr

# Validate ICU format
pnpm run i18n:validate --icu
```

## Best Practices

### 1. String Organization

- **Group by feature**: `auth.json`, `meals.json`, `profile.json`
- **Use descriptive keys**: `welcome.title` instead of `title`
- **Consistent naming**: `button.save`, `button.cancel`, `button.delete`
- **Avoid deep nesting**: Max 3 levels deep

### 2. ICU Message Format

- **Use pluralization**: `{count, plural, =0 {...} =1 {...} other {...}}`
- **Format numbers**: `{price, number, currency}`
- **Format dates**: `{date, date, short}`
- **Use select**: `{gender, select, male {...} female {...} other {...}}`

### 3. Translation Management

- **Keep keys short**: `welcome.title` not `welcome.user.greeting.title`
- **Use placeholders**: `{name}` instead of concatenation
- **Avoid HTML in translations**: Use components for formatting
- **Test with real data**: Use realistic placeholder values

### 4. Performance

- **Lazy load translations**: Load only needed locales
- **Bundle splitting**: Separate bundles per locale
- **Caching**: Cache translations in localStorage
- **Preloading**: Preload common translations

## Tools and Libraries

### 1. Core Libraries

- **react-i18next**: React integration for i18next
- **i18next**: Core internationalization framework
- **i18next-browser-languagedetector**: Browser language detection
- **i18next-http-backend**: Load translations from server

### 2. Development Tools

- **i18next-scanner**: Extract strings from code
- **i18next-parser**: Parse translation files
- **i18next-locales-sync**: Sync locales across files
- **i18next-extract**: Extract and validate translations

### 3. Translation Services

- **Crowdin**: Translation management platform
- **Lokalise**: Translation and localization platform
- **Phrase**: Translation management system
- **Weblate**: Open-source translation platform

## CI/CD Integration

### 1. Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm run i18n:validate"
    }
  }
}
```

### 2. GitHub Actions

```yaml
- name: i18n Validation
  run: pnpm run i18n:validate
  if: github.event_name == 'pull_request'
```

### 3. Build Pipeline

```yaml
- name: Extract Strings
  run: pnpm run i18n:extract

- name: Generate Translations
  run: pnpm run i18n:generate

- name: Validate Translations
  run: pnpm run i18n:validate
```

## Monitoring and Analytics

### 1. Translation Coverage

- Track percentage of translated strings
- Monitor missing translations
- Alert on incomplete locales

### 2. Usage Analytics

- Track most used languages
- Monitor language switching patterns
- Analyze user preferences

### 3. Quality Metrics

- Translation accuracy scores
- User feedback on translations
- A/B testing of translations

## Success Metrics

### 1. Technical Metrics

- 100% string extraction coverage
- 0 missing translations in production
- < 1s translation loading time
- 100% ICU format validation

### 2. User Metrics

- Language adoption rates
- User satisfaction scores
- Task completion rates by locale
- Error rates by language

### 3. Business Metrics

- Market expansion readiness
- Localization cost reduction
- Time to market for new locales
- User engagement by region

## Getting Help

### 1. Internal Resources

- i18n team and guidelines
- Translation review process
- Quality assurance procedures
- Training materials

### 2. External Resources

- i18next documentation
- ICU Message Format guide
- React i18next examples
- Translation best practices

This guide provides a comprehensive foundation for building multilingual applications that work seamlessly across different languages and cultures.