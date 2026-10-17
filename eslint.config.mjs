import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', 'public/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.mjs'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'error',
      'no-else-return': 'error',
      'max-depth': ['error', 1],
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', { max: 25, skipBlankLines: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Use `env` de "@/config/env".',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Importe a outra feature pelo index.ts dela ("@/features/<nome>").',
            },
            {
              group: ['../../../*'],
              message: 'Para sair da pasta da feature, use o alias "@/".',
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/config/env.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/app/router.tsx', 'src/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.spec.{ts,tsx}'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['eslint.config.mjs', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['eslint.config.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
);
