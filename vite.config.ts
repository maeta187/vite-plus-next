import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'vite-plus';

const BUILTIN_RULES = new Set(['rules-of-hooks', 'exhaustive-deps']);

// Built-inルールの除外設定
const reactHooksJsRules = Object.fromEntries(
  Object.entries(reactHooks.configs.recommended.rules)
    .filter(([key]) => !BUILTIN_RULES.has(key.replace('react-hooks/', '')))
    .map(([key, severity]) => [
      key.replace('react-hooks/', 'react-hooks-js/'),
      severity,
    ]),
);

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    // TypeScript, React, Import, JSX-a11yのESLint規則を有効化
    plugins: ['typescript', 'react', 'import', 'jsx-a11y'],
    // React Hooksプラグインをカスタムプラグインとして登録
    jsPlugins: [
      { name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' },
    ],
    rules: {
      'no-console': 'error',
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      ...reactHooksJsRules,
    },
  },
  fmt: {
    printWidth: 80,
    singleQuote: true,
  },
  test: {
    watch: true,
    environment: 'jsdom',
  },
  build: {
    target: 'es2022',
  },
  server: {
    port: 3000,
  },
});
