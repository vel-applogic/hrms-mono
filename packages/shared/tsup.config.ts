import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  // Avoid wiping dist/ during watch — otherwise consumers can briefly see
  // index.cjs without its index.d.cts (DTS build lags JS), causing TS7016.
  clean: !options.watch,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs'],
}));
