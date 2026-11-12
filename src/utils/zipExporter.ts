import JSZip from 'jszip';

export async function exportProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Root configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'chronos-time-travel-photobooth',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite --port=3000 --host',
          build: 'vite build',
          preview: 'vite preview',
          test: 'node scripts/run-tests.js',
        },
        dependencies: {
          '@google/genai': '^2.4.0',
          '@tailwindcss/vite': '^4.3.3',
          '@vitejs/plugin-react': '^6.1.1',
          'canvas-confetti': '^1.9.4',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          tailwindcss: '^4.3.3',
          vite: '^8.3.0',
          'vite-plugin-pwa': '^1.2.0',
        },
        devDependencies: {
          '@types/canvas-confetti': '^1.9.0',
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          typescript: '^7.0.2',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base './' ensures zero-config deployment to GitHub Pages (https://<user>.github.io/<repo>/)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'Chronos: Time-Travel Photo Booth',
        short_name: 'TimeTravel',
        description: 'Step into history with an AI-powered photo booth that transports your face into historical eras.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          types: ['vite/client', 'vite-plugin-pwa/client'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          jsx: 'react-jsx',
          paths: { '@/*': ['./*'] },
          noEmit: true,
        },
      },
      null,
      2
    )
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Chronos: Time-Travel Photo Booth</title>
    <meta name="description" content="Step into history with an AI-powered photo booth that transports your face into historical eras." />
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="icon" type="image/svg+xml" href="icon.svg" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  );

  // 2. GitHub Actions workflow for zero-config GitHub Pages deployment
  zip.file(
    '.github/workflows/deploy.yml',
    `name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`
  );

  // 3. Deployment Guide README.md
  zip.file(
    'README.md',
    `# ⏳ Chronos: Time-Travel Photo Booth

An AI-powered historical photo booth application with Gemini Nano Banana 2.1 image generation, Gemini 4 Argon image analysis, PWA installation, and 10 detailed historical eras.

## 🚀 Instant GitHub Pages Deployment Guide

This repository is pre-configured for one-click deployment to **GitHub Pages**:

### Option 1: Automatic GitHub Actions (Recommended)
1. Push this code to a new GitHub repository (e.g., \`time-travel-photobooth\`).
2. Go to your repository on GitHub: **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in \`.github/workflows/deploy.yml\` will automatically build and publish your site!
5. Your live URL will be: \`https://<username>.github.io/<repo-name>/\`

### Option 2: Local Development
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle for GitHub Pages
npm run build
\`\`\`

## 🌟 Key Features
- **10 Historical Eras**: Ancient Egypt (1340 BCE), Italian Renaissance (1504 CE), Feudal Edo Japan (1615 CE), Roaring Twenties (1925 CE), Wild West Frontier (1878 CE), Apollo Space Age (1969 CE), Victorian Steampunk (1888 CE), Medieval Knight (1215 CE), Belle Époque Paris (1900 CE), and Neo-Tokyo 2099.
- **PWA Ready**: Offline service worker caching, Web App Manifest, home screen installable on Android, Chrome, and iOS Safari.
- **6 Languages (i18n)**: English, Español, Français, Deutsch, 日本語, हिन्दी.
- **Gemini AI Integration**:
  - \`gemini-nano-banana-2.1\` for high-fidelity portrait transformations & custom text prompts.
  - \`gemini-4-argon\` for historical face & era analysis (Temporal Dossier).
- **Photo Booth Strip Generator**: 3-shot and 4-shot classic physical strips with customizable vintage themes and export.
- **Automated Test Runner**: Comprehensive in-browser and CLI automated testing suite.
`
  );

  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' });
}
