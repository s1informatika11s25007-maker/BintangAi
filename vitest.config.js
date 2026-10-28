import zlib from 'node:zlib';

// Top-level polyfill for undici zlib decompress in Vitest CI startup
if (typeof globalThis.zlib === 'undefined') {
  globalThis.zlib = zlib;
}
if (zlib) {
  if (typeof zlib.createGunzip !== 'function') zlib.createGunzip = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createInflate !== 'function') zlib.createInflate = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createDeflate !== 'function') zlib.createDeflate = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createBrotliDecompress !== 'function') zlib.createBrotliDecompress = () => ({ pipe: () => {}, on: () => {} });
}

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '/src/supabase/client.js': path.resolve(__dirname, './tests/mocks/supabaseClientMock.js'),
      '../supabase/client': path.resolve(__dirname, './tests/mocks/supabaseClientMock.js'),
      '@supabase/supabase-js': path.resolve(__dirname, './tests/mocks/supabaseMock.js')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.js',
    include: ['tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}', 'tests/components/**/*.{test,spec}.{js,ts,jsx,tsx}']
  }
});
