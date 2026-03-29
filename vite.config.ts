import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      'no-console': 'error'
    }
  },
  fmt: {
    printWidth: 80,
    singleQuote: true
  },
  test: {
    watch: true,
    environment: 'jsdom'
  },
  build: {
    target: 'es2022'
  },
  server: {
    port: 3000
  }
})
