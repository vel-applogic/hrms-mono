import baseConfig from './eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
];
