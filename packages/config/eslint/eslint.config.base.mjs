import eslintPluginPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**', 'generated/**'],
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', '*.js'],
        },
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      turbo: turboPlugin,
      'only-warn': onlyWarn,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
);
