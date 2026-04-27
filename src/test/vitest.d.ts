import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<R = unknown> extends TestingLibraryMatchers<R, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    void
  > {}
}

declare module 'vite-plus/test' {
  interface Assertion<R = unknown> extends TestingLibraryMatchers<R, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    void
  > {}
}
