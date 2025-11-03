import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { ar } from './locales/ar';

export interface I18nConfig {
  lng?: string;
  fallbackLng?: string;
  debug?: boolean;
}

export async function initI18n(config: I18nConfig = {}): Promise<void> {
  await i18next
    .use(LanguageDetector)
    .init({
      lng: config.lng,
      fallbackLng: config.fallbackLng || 'en',
      debug: config.debug || false,
      resources: {
        en: { translation: en },
        fr: { translation: fr },
        ar: { translation: ar },
      },
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    });
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options);
}

// Typed translation keys
export type TranslationKey =
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'
  | 'common.loading'
  | 'common.error'
  | 'auth.login'
  | 'auth.signup'
  | 'auth.logout'
  | 'dashboard.title'
  | 'dashboard.mealPlan'
  | 'dashboard.health'
  | 'dashboard.grocery'
  | 'planner.title'
  | 'planner.addMeal'
  | 'grocery.title'
  | 'grocery.addItem'
  | 'family.title'
  | 'settings.title'
  | 'settings.theme'
  | 'settings.units';

export function useT() {
  return {
    t: (key: TranslationKey | string, options?: Record<string, unknown>) =>
      i18next.t(key, options),
    i18n: i18next,
    ready: i18next.isInitialized,
  };
}

// Date and number formatters
export function formatDate(date: Date, locale?: string): string {
  const lng = locale || i18next.language;
  return new Intl.DateTimeFormat(lng, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string {
  const lng = locale || i18next.language;
  return new Intl.NumberFormat(lng, options).format(value);
}

// RTL support
export function isRTL(locale?: string): boolean {
  const lng = locale || i18next.language;
  return ['ar', 'he', 'fa'].includes(lng);
}

export function getTextDirection(locale?: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
