import { HistoricalEra, PhotoboothStripConfig } from '../types';

/**
 * Loads an image from a data URL or image source
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * High-fidelity client canvas compositor for time-travel portraiture
 */
export async function compositeHistoricalPortrait(
  userPhotoUrl: string,
  era: HistoricalEra,
  width = 800,
  height = 1000
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');

  // 1. Render historical backdrop from SVG
  const svgBlob = new Blob([era.svgScene], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const bgImg = await loadImage(svgUrl);
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch (e) {
    // Fallback gradient if SVG load fails
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, era.color.primary);
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }

  // 2. Draw user photo inside an ornate portrait frame
  const userImg = await loadImage(userPhotoUrl);

  const portraitX = width * 0.15;
  const portraitY = height * 0.16;
  const portraitW = width * 0.70;
  const portraitH = height * 0.62;

  // Save state for clipping oval portrait
  ctx.save();
  ctx.beginPath();
  // Create an elegant arched oval
  ctx.ellipse(
    portraitX + portraitW / 2,
    portraitY + portraitH / 2,
    portraitW / 2,
    portraitH / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  // Draw user image centered & covered
  const scale = Math.max(portraitW / userImg.width, portraitH / userImg.height);
  const scaledW = userImg.width * scale;
  const scaledH = userImg.height * scale;
  const drawX = portraitX + (portraitW - scaledW) / 2;
  const drawY = portraitY + (portraitH - scaledH) / 2;

  ctx.drawImage(userImg, drawX, drawY, scaledW, scaledH);

  // Era-specific lighting tint inside portrait
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = era.color.primary;
  ctx.globalAlpha = 0.28;
  ctx.fillRect(portraitX, portraitY, portraitW, portraitH);
  ctx.restore();

  // 3. Draw ornate gilded frame border around portrait
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    portraitX + portraitW / 2,
    portraitY + portraitH / 2,
    portraitW / 2 + 6,
    portraitH / 2 + 6,
    0,
    0,
    Math.PI * 2
  );
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#eab308'; // Gold ring
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 18;
  ctx.stroke();

  // Inner filigree ring
  ctx.beginPath();
  ctx.ellipse(
    portraitX + portraitW / 2,
    portraitY + portraitH / 2,
    portraitW / 2 + 15,
    portraitH / 2 + 15,
    0,
    0,
    Math.PI * 2
  );
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#fef08a';
  ctx.stroke();
  ctx.restore();

  // 4. Period Filter & Grain Effect
  applyPeriodFilter(ctx, width, height, era.filter);

  // 5. Historical Brass Plaque at the bottom
  const plaqueY = height * 0.82;
  const plaqueH = height * 0.12;

  ctx.save();
  // Plaque drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;

  // Plaque plate gradient (Burnished brass / Gold)
  const plaqueGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
  plaqueGrad.addColorStop(0, '#78350f');
  plaqueGrad.addColorStop(0.2, '#b45309');
  plaqueGrad.addColorStop(0.5, '#fef08a');
  plaqueGrad.addColorStop(0.8, '#b45309');
  plaqueGrad.addColorStop(1, '#451a03');

  ctx.fillStyle = plaqueGrad;
  roundRect(ctx, width * 0.08, plaqueY, width * 0.84, plaqueH, 12);
  ctx.fill();

  // Plaque dark inner bevel
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, width * 0.08 + 4, plaqueY + 4, width * 0.84 - 8, plaqueH - 8, 10);
  ctx.fill();

  // Plaque typography
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';

  // Era title
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 30px "Cinzel", Georgia, serif';
  ctx.fillText(era.defaultName.toUpperCase(), width / 2, plaqueY + 40);

  // Year & Location
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${era.year} • ${era.location}`, width / 2, plaqueY + 68);

  // Official Chronos Seal Badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 13px monospace';
  ctx.fillText('CHRONOS TEMPORAL ARCHIVE • VERIFIED', width / 2, plaqueY + 92);
  ctx.restore();

  // 6. Corner Filigree Ornaments
  drawCornerAccents(ctx, width, height);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Filter processing (Sepia, Grain, Technicolor, Lunar BW, Neon)
 */
function applyPeriodFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filterType: HistoricalEra['filter']
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    if (filterType === 'vintage-sepia' || filterType === 'steampunk') {
      d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    } else if (filterType === 'lunar-bw') {
      const avg = r * 0.299 + g * 0.587 + b * 0.114;
      // High contrast B&W
      const contrast = avg > 128 ? Math.min(255, avg * 1.15) : avg * 0.85;
      d[i] = contrast;
      d[i + 1] = contrast;
      d[i + 2] = contrast;
    } else if (filterType === 'technicolor') {
      d[i] = Math.min(255, r * 1.25);
      d[i + 1] = Math.min(255, g * 1.05);
      d[i + 2] = Math.min(255, b * 0.85);
    } else if (filterType === 'cyber-neon') {
      d[i] = Math.min(255, r * 0.8 + 20);
      d[i + 1] = Math.min(255, g * 1.1 + 10);
      d[i + 2] = Math.min(255, b * 1.35 + 30);
    } else if (filterType === 'edo-wash') {
      const gray = r * 0.3 + g * 0.59 + b * 0.11;
      d[i] = Math.min(255, gray * 0.9 + 25);
      d[i + 1] = Math.min(255, gray * 0.85 + 20);
      d[i + 2] = Math.min(255, gray * 0.8 + 15);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Vignette overlay
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Builds authentic multi-shot vertical photo booth strip
 */
export async function generatePhotoBoothStrip(
  photoUrls: string[],
  config: PhotoboothStripConfig
): Promise<string> {
  const photos = photoUrls.slice(0, config.layout === '4-vertical' ? 4 : 3);
  const count = photos.length;
  if (count === 0) throw new Error('No photos to build strip');

  const itemW = 600;
  const itemH = 600;
  const paddingX = 40;
  const paddingTop = 60;
  const spacingY = 30;
  const footerH = 180;

  const totalW = itemW + paddingX * 2;
  const totalH = paddingTop + count * itemH + (count - 1) * spacingY + footerH;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // Strip background theme
  if (config.theme === 'noir-black') {
    ctx.fillStyle = '#09090b';
  } else if (config.theme === 'art-deco-gold') {
    ctx.fillStyle = '#1c1917';
  } else if (config.theme === 'cyber-slate') {
    ctx.fillStyle = '#020617';
  } else {
    // vintage-cream
    ctx.fillStyle = '#fefce8';
  }
  ctx.fillRect(0, 0, totalW, totalH);

  // Outer border trim
  ctx.strokeStyle = config.theme === 'vintage-cream' ? '#ca8a04' : '#eab308';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, totalW - 20, totalH - 20);

  // Inner delicate frame
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(18, 18, totalW - 36, totalH - 36);
  ctx.setLineDash([]);

  // Render each photo
  for (let i = 0; i < count; i++) {
    const yPos = paddingTop + i * (itemH + spacingY);

    // Photo shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const img = await loadImage(photos[i]);

    // Draw white or black border frame for individual photo
    ctx.fillStyle = config.theme === 'vintage-cream' ? '#ffffff' : '#18181b';
    ctx.fillRect(paddingX - 8, yPos - 8, itemW + 16, itemH + 16);

    // Draw photo
    ctx.drawImage(img, paddingX, yPos, itemW, itemH);
    ctx.restore();

    // Small photo index watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`0${i + 1}`, paddingX + 16, yPos + 30);
  }

  // Footer branding and date stamp
  const footerY = totalH - footerH + 40;
  ctx.textAlign = 'center';

  const textColor = config.theme === 'vintage-cream' ? '#1c1917' : '#f8fafc';
  const accentColor = config.theme === 'vintage-cream' ? '#b45309' : '#eab308';

  // Strip Title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 26px "Cinzel", Georgia, serif';
  ctx.fillText(config.title || 'CHRONOS TIME-TRAVEL BOOTH', totalW / 2, footerY);

  // Subtitle & Date
  ctx.fillStyle = accentColor;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(config.dateStamp || new Date().toLocaleDateString(), totalW / 2, footerY + 32);

  // Punch hole & barcode simulation
  drawStripBarcode(ctx, totalW / 2, footerY + 60);

  return canvas.toDataURL('image/jpeg', 0.94);
}

function drawStripBarcode(ctx: CanvasRenderingContext2D, centerX: number, y: number) {
  ctx.save();
  const startX = centerX - 120;
  ctx.fillStyle = '#94a3b8';
  for (let x = 0; x < 240; x += 4) {
    const barW = (x * 7) % 3 === 0 ? 3 : 1;
    ctx.fillRect(startX + x, y, barW, 26);
  }
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TEMPORAL PASS # ' + Math.floor(Math.random() * 900000 + 100000), centerX, y + 40);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCornerAccents(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;

  const len = 40;
  const pad = 24;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + len);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + len, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, h - pad - len);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + len, h - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - len);
  ctx.stroke();

  ctx.restore();
}
