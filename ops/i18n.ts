/**
 * Internationalization - Extract messages, generate language packs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('i18n-ts');
const I18N_DIR = join(process.cwd(), 'i18n');
const LOCALES_DIR = join(I18N_DIR, 'locales');

interface Message {
  key: string;
  defaultValue: string;
  file: string;
  line: number;
}

async function extractMessages(): Promise<Message[]> {
  const messages: Message[] = [];
  
  // Scan for i18n usage patterns
  const patterns = [
    't("', // t("key")
    "t('", // t('key')
    'useTranslation()', // React i18n
  ];

  const tsxFiles = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '.next/**']
  });

  for (const file of tsxFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Simple extraction - would need more sophisticated parsing
      const tMatches = line.match(/t\(["']([^"']+)["']\)/g);
      if (tMatches) {
        for (const match of tMatches) {
          const keyMatch = match.match(/["']([^"']+)["']/);
          if (keyMatch) {
            messages.push({
              key: keyMatch[1],
              defaultValue: keyMatch[1],
              file,
              line: index + 1
            });
          }
        }
      }
    });
  }

  return messages;
}

async function generateLanguagePacks(): Promise<void> {
    const messages = await extractMessages();

  if (!existsSync(LOCALES_DIR)) {
    mkdirSync(LOCALES_DIR, { recursive: true });
  }

  // Generate JSON packs
  const defaultPack: Record<string, string> = {};
  for (const msg of messages) {
    defaultPack[msg.key] = msg.defaultValue;
  }

  writeFileSync(
    join(LOCALES_DIR, 'en.json'),
    JSON.stringify(defaultPack, null, 2)
  );

  // Generate CSV for translation
  let csv = 'Key,English\n';
  for (const msg of messages) {
    csv += `"${msg.key}","${msg.defaultValue}"\n`;
  }
  writeFileSync(join(LOCALES_DIR, 'translations.csv'), csv);

    }

async function validateTranslations(): Promise<{ passed: boolean; missing: string[] }> {
  const enPack = JSON.parse(
    readFileSync(join(LOCALES_DIR, 'en.json'), 'utf-8')
  );

  const locales = ['es', 'fr', 'de']; // Add more as needed
  const missing: string[] = [];

  for (const locale of locales) {
    const localePath = join(LOCALES_DIR, `${locale}.json`);
    if (!existsSync(localePath)) {
      missing.push(`Locale ${locale} file missing`);
      continue;
    }

    const localePack = JSON.parse(readFileSync(localePath, 'utf-8'));

    for (const key of Object.keys(enPack)) {
      if (!localePack[key]) {
        missing.push(`Missing ${key} in ${locale}`);
      }
    }
  }

  return {
    passed: missing.length === 0,
    missing
  };
}

if (require.main === module) {
  const command = process.argv[2];

  if (command === 'extract') {
    generateLanguagePacks().catch(error => {
      logger.error('Failed to extract messages:', { error });
      process.exit(1);
    });
  } else if (command === 'validate') {
    validateTranslations().then(result => {
      if (!result.passed) {
        logger.error('❌ Translation validation failed:');
        result.missing.forEach(m => logger.error('  - ${m}'));
        process.exit(1);
      }
          });
  } else {
        process.exit(1);
  }
}

export { extractMessages, generateLanguagePacks, validateTranslations };
