import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    // Platform-neutral ESM in src/ (the shared edition validator): it runs in
    // the browser, in Node and in the functions, so it gets no globals at all.
    files: ['src/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  },
  {
    // Node-side code: build scripts, the Netlify publish functions and the
    // node:test suite. Browser globals do not exist there; `process`,
    // `Buffer`, `console` and the timers do.
    files: ['scripts/**/*.mjs', 'netlify/**/*.mjs', 'tests/**/*.mjs', 'site-origin.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  },
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
