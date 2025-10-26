/**
 * Internationalization (i18n) and Localization System
 * Provides multi-language support with automatic language detection and region-specific content
 */

import { createClient } from './supabaseClient';

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface Translation {
  key: string;
  value: string;
  locale: string;
  namespace: string;
  context?: string;
  plural?: string;
  variables?: Record<string, any>;
  lastUpdated: string;
  translator?: string;
}

export interface TranslationNamespace {
  name: string;
  description: string;
  keys: string[];
  lastUpdated: string;
}

export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  autoDetect: boolean;
  persistLocale: boolean;
  loadPath: string;
  savePath: string;
}

class I18nManager {
  private config: LocalizationConfig;
  private currentLocale: string;
  private translations: Map<string, Map<string, Translation>> = new Map();
  private namespaces: Map<string, TranslationNamespace> = new Map();
  private loadedNamespaces: Set<string> = new Set();

  constructor(config: Partial<LocalizationConfig> = {}) {
    this.config = {
      defaultLocale: 'en',
      supportedLocales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar'],
      fallbackLocale: 'en',
      autoDetect: true,
      persistLocale: true,
      loadPath: '/api/i18n/translations',
      savePath: '/api/i18n/translations',
      ...config,
    };

    this.currentLocale = this.detectLocale();
    this.initializeLocales();
  }

  /**
   * Detect user's preferred locale
   */
  private detectLocale(): string {
    if (typeof window === 'undefined') {
      return this.config.defaultLocale;
    }

    // Check localStorage first
    if (this.config.persistLocale) {
      const saved = localStorage.getItem('preferred-locale');
      if (saved && this.config.supportedLocales.includes(saved)) {
        return saved;
      }
    }

    // Auto-detect from browser
    if (this.config.autoDetect) {
      const browserLocale = navigator.language.split('-')[0];
      if (this.config.supportedLocales.includes(browserLocale)) {
        return browserLocale;
      }
    }

    return this.config.defaultLocale;
  }

  /**
   * Initialize supported locales
   */
  private initializeLocales() {
    const locales: Locale[] = [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false, currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', numberFormat: { decimal: '.', thousands: ',' } },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false, currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimal: ',', thousands: '.' } },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false, currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimal: ',', thousands: ' ' } },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false, currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: { decimal: ',', thousands: '.' } },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false, currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimal: ',', thousands: '.' } },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false, currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimal: ',', thousands: '.' } },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false, currency: 'JPY', dateFormat: 'YYYY/MM/DD', timeFormat: '24h', numberFormat: { decimal: '.', thousands: ',' } },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false, currency: 'KRW', dateFormat: 'YYYY.MM.DD', timeFormat: '24h', numberFormat: { decimal: '.', thousands: ',' } },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false, currency: 'CNY', dateFormat: 'YYYY/MM/DD', timeFormat: '24h', numberFormat: { decimal: '.', thousands: ',' } },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, currency: 'SAR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: { decimal: '.', thousands: ',' } },
    ];

    // Store locales in a way that can be accessed
    this.locales = locales;
  }

  private locales: Locale[] = [];

  /**
   * Get all supported locales
   */
  getLocales(): Locale[] {
    return this.locales.filter(locale => 
      this.config.supportedLocales.includes(locale.code)
    );
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Set current locale
   */
  async setLocale(locale: string): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    this.currentLocale = locale;

    if (this.config.persistLocale && typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', locale);
    }

    // Load translations for the new locale
    await this.loadTranslations(locale);
  }

  /**
   * Load translations for a specific locale
   */
  async loadTranslations(locale: string, namespace?: string): Promise<void> {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('translations')
        .select('*')
        .eq('locale', locale);

      if (namespace) {
        query = query.eq('namespace', namespace);
      }

      const { data: translations, error } = await query;

      if (error) {
        console.error('Error loading translations:', error);
        return;
      }

      // Store translations in memory
      if (!this.translations.has(locale)) {
        this.translations.set(locale, new Map());
      }

      const localeTranslations = this.translations.get(locale)!;
      
      for (const translation of translations || []) {
        const key = `${translation.namespace}.${translation.key}`;
        localeTranslations.set(key, translation);
      }

      if (namespace) {
        this.loadedNamespaces.add(`${locale}:${namespace}`);
      }

    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  /**
   * Translate a key
   */
  t(key: string, variables?: Record<string, any>, options?: { 
    locale?: string; 
    namespace?: string;
    fallback?: string;
  }): string {
    const locale = options?.locale || this.currentLocale;
    const namespace = options?.namespace || 'common';
    const fullKey = `${namespace}.${key}`;

    // Try to get translation from current locale
    let translation = this.getTranslation(fullKey, locale);

    // Fallback to default locale if not found
    if (!translation && locale !== this.config.fallbackLocale) {
      translation = this.getTranslation(fullKey, this.config.fallbackLocale);
    }

    // Use fallback text if provided
    if (!translation) {
      return options?.fallback || key;
    }

    let text = translation.value;

    // Handle pluralization
    if (variables?.count !== undefined && translation.plural) {
      text = this.getPluralForm(text, translation.plural, variables.count);
    }

    // Replace variables
    if (variables) {
      text = this.replaceVariables(text, variables);
    }

    return text;
  }

  /**
   * Get translation from memory
   */
  private getTranslation(key: string, locale: string): Translation | null {
    const localeTranslations = this.translations.get(locale);
    if (!localeTranslations) {
      return null;
    }
    return localeTranslations.get(key) || null;
  }

  /**
   * Handle pluralization
   */
  private getPluralForm(singular: string, plural: string, count: number): string {
    if (count === 1) {
      return singular;
    }
    return plural;
  }

  /**
   * Replace variables in translation
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.getCurrentLocale();
    const localeData = this.locales.find(l => l.code === locale);
    
    if (!localeData) {
      return number.toString();
    }

    return new Intl.NumberFormat(locale, {
      ...options,
    }).format(number);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency?: string): string {
    const locale = this.getCurrentLocale();
    const localeData = this.locales.find(l => l.code === locale);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || localeData?.currency || 'USD',
    }).format(amount);
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getCurrentLocale();
    
    return new Intl.DateTimeFormat(locale, {
      ...options,
    }).format(date);
  }

  /**
   * Format time according to locale
   */
  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getCurrentLocale();
    
    return new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
      ...options,
    }).format(date);
  }

  /**
   * Extract translatable strings from code
   */
  async extractStrings(filePath: string): Promise<string[]> {
    // This would integrate with a tool like i18next-scanner
    // For now, return empty array
    return [];
  }

  /**
   * Generate translation files
   */
  async generateTranslationFiles(): Promise<void> {
    try {
      const supabase = createClient();
      
      // Get all translations
      const { data: translations, error } = await supabase
        .from('translations')
        .select('*');

      if (error) {
        throw error;
      }

      // Group by locale and namespace
      const grouped = translations?.reduce((acc, translation) => {
        if (!acc[translation.locale]) {
          acc[translation.locale] = {};
        }
        if (!acc[translation.locale][translation.namespace]) {
          acc[translation.locale][translation.namespace] = {};
        }
        acc[translation.locale][translation.namespace][translation.key] = translation.value;
        return acc;
      }, {} as Record<string, Record<string, Record<string, string>>>) || {};

      // Generate JSON files for each locale
      for (const [locale, namespaces] of Object.entries(grouped)) {
        for (const [namespace, keys] of Object.entries(namespaces)) {
          const filePath = `public/locales/${locale}/${namespace}.json`;
          // In a real implementation, you would write the file here
          console.log(`Generated ${filePath}:`, keys);
        }
      }

    } catch (error) {
      console.error('Error generating translation files:', error);
    }
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<{
    totalKeys: number;
    translatedKeys: number;
    completionPercentage: number;
    byLocale: Record<string, { total: number; translated: number; percentage: number }>;
  }> {
    try {
      const supabase = createClient();
      
      const { data: stats, error } = await supabase
        .from('translations')
        .select('locale, key, value');

      if (error) {
        throw error;
      }

      const result = {
        totalKeys: 0,
        translatedKeys: 0,
        completionPercentage: 0,
        byLocale: {} as Record<string, { total: number; translated: number; percentage: number }>,
      };

      // Calculate statistics
      const grouped = stats?.reduce((acc, item) => {
        if (!acc[item.locale]) {
          acc[item.locale] = { total: 0, translated: 0 };
        }
        acc[item.locale].total++;
        if (item.value && item.value.trim()) {
          acc[item.locale].translated++;
        }
        return acc;
      }, {} as Record<string, { total: number; translated: number }>) || {};

      for (const [locale, data] of Object.entries(grouped)) {
        result.byLocale[locale] = {
          ...data,
          percentage: data.total > 0 ? (data.translated / data.total) * 100 : 0,
        };
        result.totalKeys += data.total;
        result.translatedKeys += data.translated;
      }

      result.completionPercentage = result.totalKeys > 0 
        ? (result.translatedKeys / result.totalKeys) * 100 
        : 0;

      return result;

    } catch (error) {
      console.error('Error getting translation stats:', error);
      return {
        totalKeys: 0,
        translatedKeys: 0,
        completionPercentage: 0,
        byLocale: {},
      };
    }
  }
}

// Export singleton instance
export const i18n = new I18nManager();

// React hook for using translations
export function useTranslation(namespace: string = 'common') {
  const [locale, setLocale] = React.useState(i18n.getCurrentLocale());
  const [loading, setLoading] = React.useState(false);

  const t = React.useCallback((key: string, variables?: Record<string, any>, options?: any) => {
    return i18n.t(key, variables, { ...options, namespace });
  }, [namespace]);

  const changeLocale = React.useCallback(async (newLocale: string) => {
    setLoading(true);
    try {
      await i18n.setLocale(newLocale);
      setLocale(newLocale);
    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    t,
    locale,
    changeLocale,
    loading,
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
  };
}