export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_SIZE_MB = 20;
export const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    return { valid: false, error: `Unsupported format: ${file.type || file.name}. Use JPG, PNG, WebP` };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max ${MAX_SIZE_MB}MB` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'Empty file' };
  }
  return { valid: true };
}

export function getFileNameWithoutExt(name: string) {
  return name.replace(/\.[^/.]+$/, '') || 'shebaflow-photo';
}

export function generateExportName(base = 'shebaflow-edited-photo') {
  const date = new Date().toISOString().slice(0, 10);
  return `${base}-${date}`;
}
