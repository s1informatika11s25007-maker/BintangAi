import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mascot.png'],
      manifest: {
        name: 'BintangAi — Pembelajaran Inklusif',
        short_name: 'BintangAi',
        description: 'Platform belajar inklusif untuk siswa SD kelas 1–6, guru, dan orang tua.',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [{
          urlPattern: ({ url }) => url.origin === self.location.origin && !url.pathname.startsWith('/rest/') && !url.pathname.startsWith('/functions/'),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'bintangai-static-v2', expiration: { maxEntries: 80, maxAgeSeconds: 7 * 24 * 60 * 60 } }
        }]
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { host: true, allowedHosts: ['.vercel.run', '.vusercontent.net', '.v0.app'] }
});
