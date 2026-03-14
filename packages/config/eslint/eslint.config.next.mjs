import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import baseConfig from './eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['**/component/shadcn/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@repo/ui/component/shadcn/*'],
              message: 'Import from @repo/ui/component/ui/* instead of @repo/ui/component/shadcn/*. The ui/ layer is the customisation layer for shadcn components.',
            },
          ],
        },
      ],
    },
  },
];
