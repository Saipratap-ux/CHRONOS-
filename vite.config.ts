import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({ command, mode }) => {
  // Determine base path:
  // 1. If building in GitHub Actions CI: extract repository name (e.g. '/CHRONOS-/')
  // 2. If explicit BASE_PATH env is set: use that
  // 3. If in production build: default to '/CHRONOS-/'
  // 4. In development mode (AI Studio preview): '/'
  let basePath = '/';
  if (command === 'build' || mode === 'production') {
    if (process.env.BASE_PATH) {
      basePath = process.env.BASE_PATH;
    } else if (process.env.GITHUB_REPOSITORY) {
      basePath = `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`;
    } else {
      basePath = '/CHRONOS-/';
    }
  }

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: basePath,
          name: 'Chronos: Time-Travel Photo Booth',
          short_name: 'TimeTravel',
          description: 'Step into history with an AI-powered photo booth that transports your face into historical eras.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
