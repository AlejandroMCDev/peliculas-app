import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const crossFeature = {
  group: ['@/features/*/*'],
  message: 'Import other features only through their public API: @/features/<name>.',
};
const reactImports = ['react', 'react-dom', 'react-router', 'react-router/*'];
const layer = (files, patterns, ignores = []) => ({
  files,
  ignores,
  rules: { 'no-restricted-imports': ['error', { patterns: [crossFeature, ...patterns] }] },
});

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'src/shared/ui/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  layer(['src/**/*.{ts,tsx}'], []),
  layer(
    ['src/features/*/domain/**'],
    [
      { group: reactImports, message: 'domain is plain TypeScript.' },
      {
        group: [
          '**/application/**',
          '**/infrastructure/**',
          '**/presentation/**',
          '**/*.composition',
        ],
        message: 'domain depends on nothing.',
      },
    ],
  ),
  layer(
    ['src/features/*/application/**'],
    [
      { group: reactImports, message: 'use cases are framework-free.' },
      {
        group: ['**/infrastructure/**', '**/presentation/**', '**/*.composition'],
        message: 'application depends only on domain.',
      },
    ],
  ),
  layer(
    ['src/features/*/infrastructure/**'],
    [
      {
        group: ['**/application/**', '**/presentation/**'],
        message: 'infrastructure implements domain ports only.',
      },
    ],
  ),
  layer(
    ['src/features/*/presentation/**'],
    [
      {
        group: ['**/infrastructure/**'],
        message: 'presentation gets repositories from <feature>.composition.ts.',
      },
    ],
  ),
  layer(
    ['src/shared/**'],
    [{ group: ['@/features', '@/features/*'], message: 'shared never depends on a feature.' }],
  ),
  // Tests live in src/test/ and may import internals of any layer, so the layer rules are off there.
  { files: ['src/test/**'], rules: { 'no-restricted-imports': 'off' } },
  prettier,
]);
