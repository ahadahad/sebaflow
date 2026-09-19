import type { FilterState } from '../types/photoStudio';

export function buildFilterString(f: FilterState): string {
  const parts: string[] = [];
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
  if (f.exposure !== 0) parts.push(`brightness(${100 + f.exposure}%)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hue !== 0) parts.push(`hue-rotate(${f.hue}deg)`);
  // vivid approximated as saturate + contrast boost
  if (f.vivid > 0) parts.push(`saturate(${100 + f.vivid * 1.5}%) contrast(${100 + f.vivid * 0.5}%)`);
  if (f.warm > 0) parts.push(`sepia(${f.warm * 0.3}%) saturate(${100 + f.warm * 0.2}%)`);
  if (f.sharpness > 0) {
    // sharpness can't be done via filter alone, we approximate with contrast
    parts.push(`contrast(${100 + f.sharpness * 0.4}%)`);
  }
  return parts.length ? parts.join(' ') : 'none';
}

export function analyzeImageSmart(img: HTMLImageElement) {
  const c = document.createElement('canvas');
  const size = 120;
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let totalLum = 0;
  let minLum = 255, maxLum = 0;
  const lums: number[] = [];
  let totalR = 0, totalG = 0, totalB = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const lum = 0.299*r + 0.587*g + 0.114*b;
    lums.push(lum);
    totalLum += lum;
    totalR += r; totalG += g; totalB += b;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }
  const avgLum = totalLum / lums.length;
  let variance = 0;
  lums.forEach(l => variance += (l - avgLum) ** 2);
  const stdDev = Math.sqrt(variance / lums.length);
  const isDark = avgLum < 90;
  const isBright = avgLum > 170;
  const isLowContrast = stdDev < 45;
  const maxAvg = Math.max(totalR, totalG, totalB) / lums.length;
  const minAvg = Math.min(totalR, totalG, totalB) / lums.length;
  const colorVariance = maxAvg - minAvg;
  const isLowSat = colorVariance < 15;

  let brightAdj = 0, contrastAdj = 0, satAdj = 0;
  const tips: string[] = [];

  if (isDark) {
    brightAdj = Math.round((100 - avgLum) * 0.25);
    brightAdj = Math.min(25, Math.max(5, brightAdj));
    tips.push(`🌙 Dark detected (avg ${Math.round(avgLum)}) → Brightness +${brightAdj}%`);
  } else if (isBright) {
    brightAdj = Math.round((avgLum - 150) * -0.2);
    brightAdj = Math.max(-15, brightAdj);
    if (brightAdj < 0) tips.push(`☀️ Bright image → Brightness ${brightAdj}%`);
  }
  if (isLowContrast) {
    contrastAdj = Math.round((50 - stdDev) * 0.4);
    contrastAdj = Math.min(25, Math.max(8, contrastAdj));
    tips.push(`📊 Low contrast (σ ${Math.round(stdDev)}) → Contrast +${contrastAdj}%`);
  }
  if (isLowSat) {
    satAdj = 15;
    tips.push(`🎨 Low color → Saturation +${satAdj}%`);
  }
  if (avgLum >= 90 && avgLum <= 170 && !isLowContrast) tips.push(`✅ Lighting is good`);
  tips.push(`✅ Face check: 70-80% frame`);

  return {
    brightness: brightAdj,
    contrast: contrastAdj,
    saturation: satAdj,
    avgLum: Math.round(avgLum),
    stdDev: Math.round(stdDev),
    isDark,
    isLowContrast,
    tips,
    score: Math.round(100 - (isDark ? 15 : 0) - (isLowContrast ? 15 : 0) - (isLowSat ? 5 : 0))
  };
}

export async function detectFaceBox(img: HTMLImageElement): Promise<{x:number;y:number;w:number;h:number; detected:boolean; method:string}> {
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      // @ts-ignore
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(img);
      if (faces && faces.length > 0) {
        const box = faces[0].boundingBox;
        return {
          x: box.x / img.width,
          y: box.y / img.height,
          w: box.width / img.width,
          h: box.height / img.height,
          detected: true,
          method: 'FaceDetector API'
        };
      }
    }
  } catch {}
  // Fallback centered - still show box for UX, marked as auto-centered
  return { x: 0.25, y: 0.15, w: 0.5, h: 0.6, detected: true, method: 'Auto Center (Browser API not supported)' };
}
