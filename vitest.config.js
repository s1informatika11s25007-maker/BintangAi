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
