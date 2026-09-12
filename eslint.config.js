import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Minimal lint config, aimed at one class of bug.
 *
 * Vite compiles JSX without resolving identifiers, so a reference to something
 * that is no longer imported builds cleanly and then throws at runtime — which
 * is exactly how the landing page went blank after the paid tier was removed.
 * `no-undef` catches it; run `npm run lint` before deploying.
 */
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      // React 19's advisory about setState in an effect body. The pages here
      // deliberately flip a loading flag before an async fetch, which is the
      // pattern it flags. Kept visible as a warning rather than failing the
      // build over a performance hint.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js', 'vite.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
  },
];
