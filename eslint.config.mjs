import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  languageOptions: {
    globals: {
      // Define any global variables you need
      process: 'readonly',
      console: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 12,
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
  },
});
