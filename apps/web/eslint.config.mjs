import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import security from "eslint-plugin-security";
import importPlugin from "eslint-plugin-import";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      security: security,
      import: importPlugin,
    },
    rules: {
      "react/jsx-key": "error",
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      // Import order
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "src/app/admin/**",
      "src/app/developers/**",
      "src/app/partners/**",
      "src/app/billing/**",
      "src/app/auth/**",
      "src/app/favorites/**",
      "src/app/landing/**",
      "src/app/offline/**",
      "src/app/pantry/**",
      "src/app/ugc/**",
      "src/app/api/**",
      "src/lib/agents/**",
      "src/lib/ai*.ts",
      "src/lib/autonomous*.ts",
      "src/lib/cognitive*.ts",
      "src/lib/compliance*.ts",
      "src/lib/federated*.ts",
      "src/lib/feedback*.ts",
      "src/lib/franchise*.ts",
      "src/lib/growth*.ts",
      "src/lib/health*.ts",
      "src/lib/marketing*.ts",
      "src/lib/model*.ts",
      "src/lib/monitoring*.ts",
      "src/lib/observability*.ts",
      "src/lib/performance*.ts",
      "src/lib/predictive*.ts",
      "src/lib/prompt*.ts",
      "src/lib/secrets*.ts",
      "src/lib/security*.ts",
      "src/lib/social*.ts",
      "src/lib/ugc*.ts",
      "src/lib/workflow*.ts",
    ],
  },
];
