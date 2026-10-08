import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Ánh xạ import tuyệt đối "#src/x.js" sang file nguồn src/x.ts khi chạy test.
  resolve: {
    alias: [{ find: /^#src\/(.*)\.js$/, replacement: resolve(import.meta.dirname, 'src/$1.ts') }],
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
