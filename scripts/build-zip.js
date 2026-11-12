import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function buildPhysicalZip() {
  console.log('--- PACKAGING TIME-TRAVEL PHOTO BOOTH ZIP ARCHIVE ---');
  const zip = new JSZip();

  function addDirRecursively(dirPath, zipFolder) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (
        item === 'node_modules' ||
        item === '.git' ||
        item === 'dist' ||
        item.endsWith('.zip') ||
        item === '.DS_Store'
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item);
        if (subFolder) addDirRecursively(fullPath, subFolder);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item, fileData);
      }
    }
  }

  // Add all project files
  addDirRecursively(path.resolve('.'), zip);

  // Ensure .github/workflows/deploy.yml is included
  const workflowContent = `name: Deploy to GitHub Pages

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
        env:
          BASE_PATH: /CHRONOS-/

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  zip.file('.github/workflows/deploy.yml', workflowContent);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outputPath = path.resolve('time-travel-photobooth.zip');
  fs.writeFileSync(outputPath, zipBuffer);
  console.log(`✅ Generated physical ZIP archive: ${outputPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

  // Also copy to artifacts directory if available
  const artifactDir = '/.aistudio/artifacts/brain/61ae96ff-4910-484b-9f81-705118cf4c8c';
  if (fs.existsSync(artifactDir)) {
    const artifactZip = path.join(artifactDir, 'time-travel-photobooth.zip');
    fs.writeFileSync(artifactZip, zipBuffer);
    console.log(`✅ Copied to artifacts directory: ${artifactZip}`);
  }
}

buildPhysicalZip().catch((err) => {
  console.error('Failed to build zip:', err);
  process.exit(1);
});
