import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Non-breaking spaces are meaningful in the number/unit formatters.
      'no-irregular-whitespace': ['error', { skipRegExps: true, skipTemplates: true }],
    },
  },
  {
    // Shared modules and route barrels legitimately export hooks, helpers and
    // constants next to components; Fast Refresh granularity is not a concern
    // for them.
    files: [
      'src/lib/**/*.{js,jsx}',
      'src/entry-*.jsx',
      'src/assets/components/LangContext.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
