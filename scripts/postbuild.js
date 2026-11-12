import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
if (fs.existsSync(distDir)) {
  // 1. Copy index.html to 404.html for GitHub Pages SPA fallback
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✅ Created dist/404.html for GitHub Pages SPA routing');
  }

  // 2. Ensure .nojekyll exists so GitHub Pages serves assets directly without Jekyll filtering
  const nojekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ Created dist/.nojekyll for GitHub Pages');
}
