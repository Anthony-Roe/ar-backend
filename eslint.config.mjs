import { defineConfig } from 'eslint/config';
import globals from 'globals';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser'; // Import the parser

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 2021, // Equivalent to ES2021
      sourceType: 'module',
      parser: typescriptEslintParser, // Use the imported parser
      globals: {
        ...globals.node, // Node.js environment globals
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
]);