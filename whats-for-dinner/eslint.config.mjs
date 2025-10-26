import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Core rules - Enhanced
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',

      // React rules - Enhanced
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unescaped-entities': 'error',
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-no-bind': 'warn',
      'react/jsx-pascal-case': 'error',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'warn',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: true,
          reservedFirst: true,
        },
      ],

      // Performance rules
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

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
