#!/usr/bin/env node

/**
 * i18n Testing Script
 * 
 * Tests translation completeness, ICU message format, and fallback behavior
 * Validates translation files and ensures consistency across locales
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const config = {
  localesDir: 'src/locales',
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de', 'it'],
  namespaces: ['common', 'auth', 'meals', 'profile', 'errors', 'validation'],
  icuPatterns: [
    /\{([^}]+)\}/g, // {variable}
    /\{([^,}]+),\s*plural[^}]*\}/g, // {count, plural, ...}
    /\{([^,}]+),\s*select[^}]*\}/g, // {gender, select, ...}
    /\{([^,}]+),\s*date[^}]*\}/g, // {date, date, ...}
    /\{([^,}]+),\s*time[^}]*\}/g, // {time, time, ...}
    /\{([^,}]+),\s*number[^}]*\}/g // {number, number, ...}
  ]
};

class I18nTester {
  constructor() {
    this.results = {
      summary: {
        totalLocales: 0,
        totalNamespaces: 0,
        totalKeys: 0,
        missingTranslations: 0,
        icuErrors: 0,
        fallbackTests: 0
      },
      locales: {},
      namespaces: {},
      icuTests: [],
      fallbackTests: [],
      errors: []
    };
  }

  /**
   * Run all i18n tests
   */
  async runTests() {
    log('🧪 Running i18n Tests...', 'blue');
    log('========================', 'blue');

    // Test translation completeness
    await this.testTranslationCompleteness();

    // Test ICU message format
    await this.testICUFormat();

    // Test fallback behavior
    await this.testFallbackBehavior();

    // Test translation consistency
    await this.testTranslationConsistency();

    this.generateSummary();
    return this.results;
  }

  /**
   * Test translation completeness
   */
  async testTranslationCompleteness() {
    log('\n📋 Testing Translation Completeness...', 'blue');

    const referenceLocale = config.defaultLocale;
    const referenceKeys = this.getReferenceKeys(referenceLocale);

    for (const locale of config.supportedLocales) {
      const localeResults = {
        totalKeys: 0,
        missingKeys: [],
        extraKeys: [],
        completeness: 0
      };

      for (const namespace of config.namespaces) {
        const namespaceKeys = this.getNamespaceKeys(locale, namespace);
        const referenceNamespaceKeys = referenceKeys[namespace] || [];

        // Check for missing keys
        const missingKeys = referenceNamespaceKeys.filter(key => 
          !namespaceKeys.includes(key)
        );
        localeResults.missingKeys.push(...missingKeys);

        // Check for extra keys
        const extraKeys = namespaceKeys.filter(key => 
          !referenceNamespaceKeys.includes(key)
        );
        localeResults.extraKeys.push(...extraKeys);

        localeResults.totalKeys += namespaceKeys.length;
      }

      localeResults.completeness = 
        (localeResults.totalKeys / Object.values(referenceKeys).flat().length) * 100;

      this.results.locales[locale] = localeResults;
      this.results.summary.totalLocales++;

      if (localeResults.completeness < 100) {
        log(`  ${locale}: ${localeResults.completeness.toFixed(1)}% complete`, 'yellow');
        if (localeResults.missingKeys.length > 0) {
          log(`    Missing: ${localeResults.missingKeys.length} keys`, 'yellow');
        }
      } else {
        log(`  ${locale}: 100% complete`, 'green');
      }
    }
  }

  /**
   * Test ICU message format
   */
  async testICUFormat() {
    log('\n🔤 Testing ICU Message Format...', 'blue');

    for (const locale of config.supportedLocales) {
      for (const namespace of config.namespaces) {
        const translations = this.loadTranslations(locale, namespace);
        
        for (const [key, value] of Object.entries(translations)) {
          const icuErrors = this.validateICUFormat(value, key, locale, namespace);
          this.results.icuTests.push(...icuErrors);
        }
      }
    }

    const errorCount = this.results.icuTests.length;
    this.results.summary.icuErrors = errorCount;

    if (errorCount === 0) {
      log('  ✅ All ICU messages are valid', 'green');
    } else {
      log(`  ❌ Found ${errorCount} ICU errors`, 'red');
    }
  }

  /**
   * Test fallback behavior
   */
  async testFallbackBehavior() {
    log('\n🔄 Testing Fallback Behavior...', 'blue');

    const fallbackTests = [
      {
        locale: 'es',
        key: 'common.welcome.title',
        expectedFallback: 'en'
      },
      {
        locale: 'fr',
        key: 'meals.count',
        expectedFallback: 'en'
      },
      {
        locale: 'de',
        key: 'errors.invalidEmail',
        expectedFallback: 'en'
      }
    ];

    for (const test of fallbackTests) {
      const result = this.testFallback(test.locale, test.key, test.expectedFallback);
      this.results.fallbackTests.push(result);
      this.results.summary.fallbackTests++;
    }

    const passedTests = this.results.fallbackTests.filter(t => t.passed).length;
    log(`  ${passedTests}/${this.results.fallbackTests.length} fallback tests passed`, 
        passedTests === this.results.fallbackTests.length ? 'green' : 'yellow');
  }

  /**
   * Test translation consistency
   */
  async testTranslationConsistency() {
    log('\n🔄 Testing Translation Consistency...', 'blue');

    const referenceLocale = config.defaultLocale;
    const referenceKeys = this.getReferenceKeys(referenceLocale);

    for (const locale of config.supportedLocales) {
      if (locale === referenceLocale) continue;

      const inconsistencies = [];

      for (const [namespace, keys] of Object.entries(referenceKeys)) {
        for (const key of keys) {
          const referenceValue = this.getTranslation(referenceLocale, namespace, key);
          const translatedValue = this.getTranslation(locale, namespace, key);

          if (referenceValue && translatedValue) {
            // Check for placeholder translations
            if (translatedValue === referenceValue) {
              inconsistencies.push({
                locale,
                namespace,
                key,
                issue: 'translation_identical',
                message: 'Translation is identical to reference'
              });
            }

            // Check for missing ICU variables
            const referenceVars = this.extractICUVariables(referenceValue);
            const translatedVars = this.extractICUVariables(translatedValue);
            
            const missingVars = referenceVars.filter(v => !translatedVars.includes(v));
            if (missingVars.length > 0) {
              inconsistencies.push({
                locale,
                namespace,
                key,
                issue: 'missing_icu_variables',
                message: `Missing ICU variables: ${missingVars.join(', ')}`
              });
            }
          }
        }
      }

      if (inconsistencies.length > 0) {
        log(`  ${locale}: ${inconsistencies.length} inconsistencies found`, 'yellow');
      } else {
        log(`  ${locale}: No inconsistencies found`, 'green');
      }
    }
  }

  /**
   * Get reference keys for a locale
   */
  getReferenceKeys(locale) {
    const keys = {};
    
    for (const namespace of config.namespaces) {
      const translations = this.loadTranslations(locale, namespace);
      keys[namespace] = Object.keys(translations);
    }

    return keys;
  }

  /**
   * Get namespace keys for a locale
   */
  getNamespaceKeys(locale, namespace) {
    const translations = this.loadTranslations(locale, namespace);
    return Object.keys(translations);
  }

  /**
   * Load translations for a locale and namespace
   */
  loadTranslations(locale, namespace) {
    const filePath = path.join(config.localesDir, locale, `${namespace}.json`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      this.results.errors.push({
        locale,
        namespace,
        error: `Failed to parse ${filePath}: ${error.message}`
      });
      return {};
    }
  }

  /**
   * Get translation for a specific key
   */
  getTranslation(locale, namespace, key) {
    const translations = this.loadTranslations(locale, namespace);
    return translations[key];
  }

  /**
   * Validate ICU message format
   */
  validateICUFormat(value, key, locale, namespace) {
    const errors = [];

    if (typeof value !== 'string') {
      return errors;
    }

    // Check for balanced braces
    const openBraces = (value.match(/\{/g) || []).length;
    const closeBraces = (value.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push({
        locale,
        namespace,
        key,
        error: 'unbalanced_braces',
        message: `Unbalanced braces: ${openBraces} open, ${closeBraces} close`,
        value
      });
    }

    // Check for valid ICU patterns
    for (const pattern of config.icuPatterns) {
      let match;
      while ((match = pattern.exec(value)) !== null) {
        const icuExpression = match[0];
        
        // Basic validation for ICU expressions
        if (icuExpression.includes('plural') && !icuExpression.includes('other')) {
          errors.push({
            locale,
            namespace,
            key,
            error: 'invalid_plural',
            message: 'Plural expression missing "other" case',
            value: icuExpression
          });
        }

        if (icuExpression.includes('select') && !icuExpression.includes('other')) {
          errors.push({
            locale,
            namespace,
            key,
            error: 'invalid_select',
            message: 'Select expression missing "other" case',
            value: icuExpression
          });
        }
      }
    }

    return errors;
  }

  /**
   * Test fallback behavior
   */
  testFallback(locale, key, expectedFallback) {
    const [namespace, keyName] = key.split('.');
    
    // Try to get translation from target locale
    const targetTranslation = this.getTranslation(locale, namespace, keyName);
    
    // Try to get translation from fallback locale
    const fallbackTranslation = this.getTranslation(expectedFallback, namespace, keyName);
    
    const passed = targetTranslation === fallbackTranslation;
    
    return {
      locale,
      key,
      expectedFallback,
      targetTranslation,
      fallbackTranslation,
      passed
    };
  }

  /**
   * Extract ICU variables from a string
   */
  extractICUVariables(value) {
    const variables = new Set();
    const variablePattern = /\{([^,}]+)/g;
    
    let match;
    while ((match = variablePattern.exec(value)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    log('\n📊 i18n Test Summary', 'bold');
    log('===================', 'bold');

    // Locale completeness
    log('\n🌍 Locale Completeness:', 'blue');
    Object.entries(this.results.locales).forEach(([locale, data]) => {
      const status = data.completeness === 100 ? '✅' : '⚠️';
      const color = data.completeness === 100 ? 'green' : 'yellow';
      log(`  ${status} ${locale}: ${data.completeness.toFixed(1)}%`, color);
    });

    // ICU errors
    log('\n🔤 ICU Format Errors:', 'blue');
    if (this.results.summary.icuErrors === 0) {
      log('  ✅ No ICU format errors', 'green');
    } else {
      log(`  ❌ ${this.results.summary.icuErrors} ICU errors found`, 'red');
    }

    // Fallback tests
    log('\n🔄 Fallback Tests:', 'blue');
    const passedFallbacks = this.results.fallbackTests.filter(t => t.passed).length;
    const totalFallbacks = this.results.fallbackTests.length;
    const fallbackColor = passedFallbacks === totalFallbacks ? 'green' : 'yellow';
    log(`  ${passedFallbacks}/${totalFallbacks} fallback tests passed`, fallbackColor);

    // Overall status
    const hasErrors = this.results.summary.icuErrors > 0 || 
                     this.results.fallbackTests.some(t => !t.passed);
    
    log('\n🎯 Overall Status:', 'bold');
    if (hasErrors) {
      log('❌ Some tests failed', 'red');
    } else {
      log('✅ All tests passed', 'green');
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'i18n-test-results.json');
    const reportsDir = path.dirname(resultsPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    log(`\n📁 Results saved to: ${resultsPath}`, 'blue');
  }
}

// Main execution
async function main() {
  log('🧪 i18n Testing Starting...', 'bold');
  
  const tester = new I18nTester();
  const results = await tester.runTests();
  tester.saveResults();

  // Exit with appropriate code
  const hasErrors = results.summary.icuErrors > 0 || 
                   results.fallbackTests.some(t => !t.passed);
  process.exit(hasErrors ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('i18n testing failed:', error);
    process.exit(1);
  });
}

module.exports = { I18nTester, config };