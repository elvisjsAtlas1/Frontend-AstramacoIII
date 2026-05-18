import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/app/tests/unit/**/*.spec.ts']
  }
});
