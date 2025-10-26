import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Core rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      // React rules
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unescaped-entities': 'error',
      'react/prop-types': 'off', // Using TypeScript

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    '.husky/**',
    'coverage/**',
    'dist/**',
    // Ignore problematic files
    'public/workbox-*.js',
    'scripts/**',
    'jest.config.js',
    'jest.setup.js',
    'playwright.config.ts',
    'src/__tests__/**',
    'src/app/admin/**',
    'src/app/developers/**',
    'src/app/partners/**',
    'src/app/billing/**',
    'src/app/auth/**',
    'src/app/favorites/**',
    'src/app/landing/**',
    'src/app/offline/**',
    'src/app/pantry/**',
    'src/app/ugc/**',
    'src/app/api/**',
    'src/lib/agents/**',
    'src/lib/ai*.ts',
    'src/lib/autonomous*.ts',
    'src/lib/cognitive*.ts',
    'src/lib/compliance*.ts',
    'src/lib/federated*.ts',
    'src/lib/feedback*.ts',
    'src/lib/franchise*.ts',
    'src/lib/growth*.ts',
    'src/lib/health*.ts',
    'src/lib/marketing*.ts',
    'src/lib/model*.ts',
    'src/lib/monitoring*.ts',
    'src/lib/observability*.ts',
    'src/lib/performance*.ts',
    'src/lib/predictive*.ts',
    'src/lib/prompt*.ts',
    'src/lib/secrets*.ts',
    'src/lib/security*.ts',
    'src/lib/social*.ts',
    'src/lib/ugc*.ts',
    'src/lib/workflow*.ts',
  ]),
]);

export default eslintConfig;
