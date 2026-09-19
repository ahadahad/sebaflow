import type { ExportSettings } from '../types/photoStudio';

export function exportCanvas(
  canvas: HTMLCanvasElement,
  settings: ExportSettings
): { dataUrl: string; blob?: Blob } {
  const { format, quality } = settings;
  const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const q = format === 'png' ? 1.0 : quality / 100;
  const dataUrl = canvas.toDataURL(mime, q);
  return { dataUrl };
}

export async function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export'));
    }, mime, format === 'png' ? 1.0 : quality / 100);
  });
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

export function getExportFileName(base: string, format: string) {
  const ext = format === 'jpg' ? 'jpg' : format;
  return `${base}.${ext}`;
}
