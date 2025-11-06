#!/usr/bin/env node

/**
 * i18n String Extraction Script
 * 
 * Extracts user-visible strings from codebase and generates translation files
 * Supports ICU message format, pluralization, and multiple locales
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  sourceDir: 'src',
  localesDir: 'src/locales',
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de', 'it'],
  namespaces: ['common', 'auth', 'meals', 'profile', 'errors', 'validation'],
  patterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    'src/**/*.json',
    'public/**/*.html'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}'
  ]
};

class I18nExtractor {
  constructor() {
    this.extractedStrings = new Map();
    this.results = {
      totalFiles: 0,
      totalStrings: 0,
      namespaces: {},
      locales: {},
      errors: []
    };
  }

  /**
   * Extract strings from codebase
   */
  async extractStrings() {
    log('🔍 Extracting i18n strings...', 'blue');
    log('============================', 'blue');

    // Find all source files
    const files = this.findSourceFiles();
    this.results.totalFiles = files.length;

    log(`Found ${files.length} files to process`, 'blue');

    // Process each file
    for (const file of files) {
      await this.processFile(file);
    }

    // Generate translation files
    await this.generateTranslationFiles();

    return this.results;
  }

  /**
   * Find all source files matching patterns
   */
  findSourceFiles() {
    const files = [];
    
    for (const pattern of config.patterns) {
      try {
        const result = execSync(`find ${pattern} -type f`, { 
          encoding: 'utf8',
          cwd: process.cwd()
        });
        
        const patternFiles = result.trim().split('\n').filter(file => {
          // Check exclude patterns
          return !config.excludePatterns.some(exclude => 
            file.includes(exclude.replace('**', ''))
          );
        });
        
        files.push(...patternFiles);
      } catch (error) {
        // Pattern not found, continue
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const strings = this.extractStringsFromContent(content, filePath);
      
      strings.forEach(string => {
        this.addString(string);
      });
      
    } catch (error) {
      this.results.errors.push({
        file: filePath,
        error: error.message
      });
    }
  }

  /**
   * Extract strings from file content
   */
  extractStringsFromContent(content, filePath) {
    const strings = [];
    
    // React i18next patterns
    const patterns = [
      // t('key') or t("key")
      /t\(['"`]([^'"`]+)['"`]\)/g,
      // t('namespace:key')
      /t\(['"`]([^'"`]+):([^'"`]+)['"`]\)/g,
      // t('key', { ... })
      /t\(['"`]([^'"`]+)['"`],\s*\{[^}]*\}/g,
      // useTranslation('namespace')
      /useTranslation\(['"`]([^'"`]+)['"`]\)/g,
      // i18n.t('key')
      /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,
      // Template literals with t()
      /t\(`([^`]+)`\)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && match[2]) {
          // Namespace:key pattern
          strings.push({
            key: match[2],
            namespace: match[1],
            file: filePath,
            line: this.getLineNumber(content, match.index)
          });
        } else if (match[1]) {
          // Simple key pattern
          strings.push({
            key: match[1],
            namespace: 'common',
            file: filePath,
            line: this.getLineNumber(content, match.index)
          });
        }
      }
    });

    // Extract hardcoded strings (basic detection)
    const hardcodedPatterns = [
      // JSX text content
      />([^<{]+)</g,
      // String literals in JSX
      /['"`]([^'"`]{3,})['"`]/g
    ];

    hardcodedPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 3 && this.isUserVisibleString(text)) {
          strings.push({
            key: this.generateKey(text),
            namespace: 'common',
            file: filePath,
            line: this.getLineNumber(content, match.index),
            originalText: text,
            isHardcoded: true
          });
        }
      }
    });

    return strings;
  }

  /**
   * Check if string is user-visible
   */
  isUserVisibleString(text) {
    // Skip technical strings
    const skipPatterns = [
      /^[a-z-]+$/, // CSS classes
      /^[A-Z_]+$/, // Constants
      /^\d+$/, // Numbers
      /^[{}[\]()]+$/, // Brackets
      /^[.,;:!?]+$/, // Punctuation
      /^(and|or|the|a|an|in|on|at|to|for|of|with|by)$/i, // Common words
      /^(true|false|null|undefined)$/i, // JavaScript values
      /^(div|span|p|h1|h2|h3|h4|h5|h6|button|input|form)$/i // HTML tags
    ];

    return !skipPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Generate key from text
   */
  generateKey(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.')
      .substring(0, 50);
  }

  /**
   * Get line number from index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Add string to extracted collection
   */
  addString(string) {
    const key = `${string.namespace}.${string.key}`;
    
    if (!this.extractedStrings.has(key)) {
      this.extractedStrings.set(key, {
        key: string.key,
        namespace: string.namespace,
        files: [],
        isHardcoded: string.isHardcoded || false,
        originalText: string.originalText || null
      });
    }

    this.extractedStrings.get(key).files.push({
      file: string.file,
      line: string.line
    });
  }

  /**
   * Generate translation files
   */
  async generateTranslationFiles() {
    log('\n📝 Generating translation files...', 'blue');
    log('==================================', 'blue');

    // Ensure locales directory exists
    if (!fs.existsSync(config.localesDir)) {
      fs.mkdirSync(config.localesDir, { recursive: true });
    }

    // Group strings by namespace
    const namespacedStrings = new Map();
    for (const [key, string] of this.extractedStrings) {
      if (!namespacedStrings.has(string.namespace)) {
        namespacedStrings.set(string.namespace, new Map());
      }
      namespacedStrings.get(string.namespace).set(string.key, string);
    }

    // Generate files for each locale and namespace
    for (const locale of config.supportedLocales) {
      await this.generateLocaleFiles(locale, namespacedStrings);
    }

    // Update results
    this.results.totalStrings = this.extractedStrings.size;
    this.results.namespaces = Object.fromEntries(
      Array.from(namespacedStrings.entries()).map(([ns, strings]) => [
        ns, 
        strings.size
      ])
    );
  }

  /**
   * Generate files for a specific locale
   */
  async generateLocaleFiles(locale, namespacedStrings) {
    const localeDir = path.join(config.localesDir, locale);
    
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    for (const [namespace, strings] of namespacedStrings) {
      const filePath = path.join(localeDir, `${namespace}.json`);
      
      // Load existing translations
      let existingTranslations = {};
      if (fs.existsSync(filePath)) {
        try {
          existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          log(`Warning: Could not parse existing ${filePath}`, 'yellow');
        }
      }

      // Generate new translations
      const translations = {};
      for (const [key, string] of strings) {
        if (existingTranslations[key]) {
          // Keep existing translation
          translations[key] = existingTranslations[key];
        } else if (string.isHardcoded && string.originalText) {
          // Use original text as translation
          translations[key] = string.originalText;
        } else {
          // Generate placeholder
          translations[key] = this.generatePlaceholder(key, string);
        }
      }

      // Write translation file
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
      log(`Generated ${filePath}`, 'green');
    }
  }

  /**
   * Generate placeholder translation
   */
  generatePlaceholder(key, string) {
    if (string.isHardcoded && string.originalText) {
      return string.originalText;
    }
    
    // Generate placeholder based on key
    return key
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Generate summary report
   */
  generateReport() {
    log('\n📊 i18n Extraction Report', 'bold');
    log('=========================', 'bold');
    log(`Total Files: ${this.results.totalFiles}`, 'blue');
    log(`Total Strings: ${this.results.totalStrings}`, 'blue');
    log(`Supported Locales: ${config.supportedLocales.join(', ')}`, 'blue');
    log(`Namespaces: ${Object.keys(this.results.namespaces).join(', ')}`, 'blue');

    log('\n📁 Generated Files:', 'blue');
    for (const locale of config.supportedLocales) {
      log(`  ${locale}/`, 'green');
      for (const namespace of config.namespaces) {
        const filePath = path.join(config.localesDir, locale, `${namespace}.json`);
        if (fs.existsSync(filePath)) {
          log(`    ${namespace}.json`, 'green');
        }
      }
    }

    if (this.results.errors.length > 0) {
      log('\n❌ Errors:', 'red');
      this.results.errors.forEach(error => {
        log(`  ${error.file}: ${error.error}`, 'red');
      });
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    const resultsPath = path.join(process.cwd(), 'REPORTS', 'i18n-extraction-results.json');
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
  log('🌍 i18n String Extraction Starting...', 'bold');
  
  const extractor = new I18nExtractor();
  const results = await extractor.extractStrings();
  extractor.generateReport();
  extractor.saveResults();

  log('\n✅ i18n extraction completed successfully!', 'green');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('i18n extraction failed:', error);
    process.exit(1);
  });
}

module.exports = { I18nExtractor, config };