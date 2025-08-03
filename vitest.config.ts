import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/utils/test-utils.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
        'dist/',
        'build/'
      ]
    }
  }
});
