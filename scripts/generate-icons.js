import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator without external dependencies
function createPNG(width, height, drawPixel) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Icon art renderer: sleek dark cosmic background with gold hourglass & camera aperture
function renderIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.46;

  // Background gradient: slate-950 to indigo-950
  const bgGrad = y / h;
  const rBg = Math.floor(15 + bgGrad * 15);
  const gBg = Math.floor(23 + bgGrad * 10);
  const bBg = Math.floor(42 + bgGrad * 40);

  // Rounded squircle mask if not maskable (maskable expects full bleed background)
  if (!isMaskable && dist > radius) {
    return [0, 0, 0, 0];
  }

  // Outer gold ring
  const ringDist = Math.abs(dist - w * 0.38);
  if (ringDist < w * 0.015) {
    return [234, 179, 8, 255]; // Gold
  }

  // Hourglass geometry
  const ny = (y - cy) / (w * 0.32);
  const nx = (x - cx) / (w * 0.32);
  const boundX = Math.abs(ny);
  if (Math.abs(ny) <= 1.0 && Math.abs(nx) <= boundX + 0.08 && Math.abs(nx) >= boundX - 0.08) {
    return [250, 204, 21, 255]; // Yellow gold
  }

  // Center camera lens aperture
  const lensDist = Math.sqrt(dx * dx + dy * dy);
  if (lensDist < w * 0.12) {
    if (lensDist < w * 0.06) {
      return [250, 204, 21, 255]; // Gold core
    }
    return [15, 23, 42, 255]; // Dark aperture
  }
  if (Math.abs(lensDist - w * 0.12) < w * 0.015) {
    return [56, 189, 248, 255]; // Cyan neon glow ring
  }

  return [rBg, gBg, bBg, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));

console.log('Successfully generated all PWA icons in public/');
