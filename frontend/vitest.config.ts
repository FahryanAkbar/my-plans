import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
// import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        // 'components/atoms/**/*.{ts,tsx}',
        'components/molecules/**/*.{ts,tsx}'
      ],
      exclude: [
        'components/**/*.{test,stories}.{ts,tsx}',
        'lib/**/*.{test,stories}.{ts,tsx}',
        'hooks/**/*.{test,stories}.{ts,tsx}',
        'components/templates/**',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      }
    },
    projects: [
      // {
      //   extends: true,
      //   plugins: [
      //     // The plugin will run tests for the stories defined in your Storybook config
      //     // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      //     storybookTest({ configDir: path.join(dirname, '.storybook') }),
      //   ],
      //   test: {
      //     name: 'storybook',
      //     browser: {
      //       enabled: true,
      //       headless: true,
      //       provider: playwright({}),
      //       instances: [{ browser: 'chromium' }],
      //     },
      //   },
      //   resolve: {
      //     alias: {
      //       '@': path.resolve(dirname, '.'),
      //     },
      //   },
      // },
      {
        test: {
          name: 'unit',
          css: false,
          globals: true,
          environment: 'jsdom',
          alias: {
            '@': path.resolve(dirname, './'),
          },
          include: [
            // 'components/atoms/**/*.test.{ts,tsx}',
            'components/molecules/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['vitest.setup.ts'],
        },
      },
    ],
  },
});
