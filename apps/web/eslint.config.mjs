import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: 'readonly',
        global: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        Event: 'readonly',
        // DOM types
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        // React globals
        React: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      prettier: prettierPlugin,
    },
    rules: {
      // Core rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
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
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
      '.husky/**',
      'coverage/**',
      'dist/**',
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
    ],
  },
];

export default eslintConfig;
