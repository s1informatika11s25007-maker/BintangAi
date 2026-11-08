import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ping-logger',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.includes('ai-ping')) {
            console.log('🤖 \x1b[32mAI Model Ping: Success\x1b[0m');
          }
          if (req.url.includes('supabase-ping')) {
            console.log('📡 \x1b[34mSupabase Ping: Success\x1b[0m');
          }
          next();
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BintangAi',
        short_name: 'BintangAi',
        description: 'Platform Belajar Berbasis AI untuk Siswa Berkebutuhan Khusus',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#4F46E5"/><text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="black" font-size="120">B</text></svg>')}`,
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#4F46E5"/><text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="black" font-size="320">B</text></svg>')}`,
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'sb-2tfphhxfz340.vercel.run',
      'vm-bintangai-2-4.vusercontent.net',
      '.vercel.run',
      '.vusercontent.net',
      '.v0.app'
    ],
    hmr: {
      protocol: 'wss',
      clientPort: 443
    },
    proxy: {
      '/hf-api': {
        target: 'https://router.huggingface.co',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/hf-api/, ''),
        secure: true,
      }
    }
  }
});
