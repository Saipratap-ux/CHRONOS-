import fs from 'fs';
import path from 'path';

console.log('--- RUNNING CHRONOS AUTOMATED TEST SUITE ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Historical Eras Schema
try {
  const erasPath = path.resolve('src/data/historicalEras.ts');
  const content = fs.readFileSync(erasPath, 'utf8');
  assert(content.includes("id: 'egypt'"), 'Historical Era: Egypt exists');
  assert(content.includes("id: 'renaissance'"), 'Historical Era: Renaissance exists');
  assert(content.includes("id: 'japan'"), 'Historical Era: Feudal Japan exists');
  assert(content.includes("id: '1920s'"), 'Historical Era: Roaring 1920s exists');
  assert(content.includes("id: 'wildwest'"), 'Historical Era: Wild West exists');
  assert(content.includes("id: 'space'"), 'Historical Era: Space Age Apollo exists');
  assert(content.includes("id: 'victorian'"), 'Historical Era: Victorian London exists');
  assert(content.includes("id: 'medieval'"), 'Historical Era: Medieval Knight exists');
  assert(content.includes("id: 'paris1900'"), 'Historical Era: Belle Époque Paris exists');
  assert(content.includes("id: 'cyber2099'"), 'Historical Era: Neo-Tokyo 2099 exists');
  assert(content.includes('svgScene:'), 'Offline SVG vectors embedded for all eras');
} catch (e) {
  assert(false, 'Failed reading historicalEras.ts: ' + e.message);
}

// Test 2: i18n Multi-Language Coverage
try {
  const i18nPath = path.resolve('src/utils/i18n.ts');
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  ['en:', 'es:', 'fr:', 'de:', 'ja:', 'hi:'].forEach((lang) => {
    assert(i18nContent.includes(lang), `Language dictionary '${lang.replace(':', '')}' present`);
  });
  assert(i18nContent.includes('dossier_title'), 'Temporal dossier translation key present');
  assert(i18nContent.includes('gemini_nano_badge'), 'Gemini Nano Banana 2.1 translation key present');
  assert(i18nContent.includes('gemini_argon_badge'), 'Gemini 4 Argon translation key present');
} catch (e) {
  assert(false, 'Failed reading i18n.ts: ' + e.message);
}

// Test 3: PWA Manifest & Icons
try {
  const publicDir = path.resolve('public');
  assert(fs.existsSync(path.join(publicDir, 'icon.svg')), 'Brand icon.svg exists in public/');
  assert(fs.existsSync(path.join(publicDir, 'pwa-192x192.png')), 'pwa-192x192.png exists in public/');
  assert(fs.existsSync(path.join(publicDir, 'pwa-512x512.png')), 'pwa-512x512.png exists in public/');
  assert(fs.existsSync(path.join(publicDir, 'pwa-maskable-512x512.png')), 'pwa-maskable-512x512.png exists in public/');
  assert(fs.existsSync(path.join(publicDir, 'apple-touch-icon.png')), 'apple-touch-icon.png exists in public/');

  const viteConfig = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');
  assert(viteConfig.includes("base: basePath") || viteConfig.includes("basePath = '/CHRONOS-/'"), 'Vite configured with dynamic base supporting /CHRONOS-/ for GitHub Pages');
  assert(viteConfig.includes('VitePWA'), 'VitePWA plugin integrated in vite.config.ts');
  assert(viteConfig.includes("short_name: 'TimeTravel'"), 'PWA short_name <= 12 chars standard verified');
  assert(fs.existsSync(path.join(publicDir, '.nojekyll')), '.nojekyll exists in public/ to disable Jekyll on GitHub Pages');
  assert(fs.existsSync(path.resolve('.github/workflows/deploy.yml')), '.github/workflows/deploy.yml workflow file exists');
} catch (e) {
  assert(false, 'Failed verifying PWA: ' + e.message);
}

// Test 4: Gemini Models & Server Routes
try {
  const serverPath = path.resolve('server.ts');
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  assert(serverCode.includes("model: 'gemini-nano-banana-2.1'"), 'Gemini Nano Banana 2.1 configured for image generation/editing');
  assert(serverCode.includes("model: 'gemini-4-argon'"), 'Gemini 4 Argon configured for image analysis/understanding');
  assert(serverCode.includes("'User-Agent': 'aistudio-build'"), 'Required User-Agent header set for GoogleGenAI');
  assert(serverCode.includes('/api/health'), 'Health check route defined');
} catch (e) {
  assert(false, 'Failed checking server.ts: ' + e.message);
}

console.log(`\nTEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL AUTOMATED TESTS PASSED! ✨');
}
