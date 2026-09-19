/**
 * Validation for AI photo assistant
 */

export type OperationType =
  | 'setBrightness'
  | 'setContrast'
  | 'setSaturation'
  | 'setExposure'
  | 'setFilter'
  | 'crop'
  | 'resize'
  | 'rotate'
  | 'flipHorizontal'
  | 'flipVertical'
  | 'setBackground'
  | 'setTransparency'
  | 'setBorder'
  | 'resetAdjustments'
  | 'exportSuggestion'
  | 'unsupported';

export interface BaseOperation {
  type: OperationType;
}

export interface SetBrightnessOp extends BaseOperation {
  type: 'setBrightness';
  value: number;
}
export interface SetContrastOp extends BaseOperation {
  type: 'setContrast';
  value: number;
}
export interface SetSaturationOp extends BaseOperation {
  type: 'setSaturation';
  value: number;
}
export interface SetExposureOp extends BaseOperation {
  type: 'setExposure';
  value: number;
}
export interface SetFilterOp extends BaseOperation {
  type: 'setFilter';
  filter: string;
}
export interface CropOp extends BaseOperation {
  type: 'crop';
  preset?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
export interface ResizeOp extends BaseOperation {
  type: 'resize';
  width?: number;
  height?: number;
  preset?: string;
}
export interface RotateOp extends BaseOperation {
  type: 'rotate';
  degrees: number;
}
export interface FlipHOp extends BaseOperation {
  type: 'flipHorizontal';
}
export interface FlipVOp extends BaseOperation {
  type: 'flipVertical';
}
export interface SetBackgroundOp extends BaseOperation {
  type: 'setBackground';
  color?: string;
  transparent?: boolean;
}
export interface SetTransparencyOp extends BaseOperation {
  type: 'setTransparency';
  value?: boolean;
}
export interface SetBorderOp extends BaseOperation {
  type: 'setBorder';
  enabled?: boolean;
  color?: string;
  thickness?: number;
  radius?: number;
}
export interface ResetOp extends BaseOperation {
  type: 'resetAdjustments';
}
export interface ExportOp extends BaseOperation {
  type: 'exportSuggestion';
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}
export interface UnsupportedOp extends BaseOperation {
  type: 'unsupported';
  reason: string;
}

export type AiOperation =
  | SetBrightnessOp
  | SetContrastOp
  | SetSaturationOp
  | SetExposureOp
  | SetFilterOp
  | CropOp
  | ResizeOp
  | RotateOp
  | FlipHOp
  | FlipVOp
  | SetBackgroundOp
  | SetTransparencyOp
  | SetBorderOp
  | ResetOp
  | ExportOp
  | UnsupportedOp;

export interface AiAssistantResponse {
  operations: AiOperation[];
  explanation: string;
  confidence?: number;
}

export interface PhotoAssistantRequest {
  command: string;
  imageMetadata?: {
    width?: number;
    height?: number;
    mimeType?: string;
  };
  currentEditState?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    rotation?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    backgroundColor?: string;
  };
}

const VALID_FILTERS = ['grayscale', 'sepia', 'vivid', 'warm', 'cool', 'vintage', 'original', 'none', 'blur', 'sharpen'];
const VALID_CROP_PRESETS = ['free', '1:1', '4:5', '3:4', '4:3', '16:9', 'passport', 'square', 'portrait', 'landscape'];
const VALID_RESIZE_PRESETS = ['passport', 'profile', 'social-square', 'fb-post', 'insta-post', 'insta-story', 'yt-thumb', 'bd-passport', 'in-visa', 'custom'];
const VALID_EXPORT_FORMATS = ['png', 'jpg', 'webp'];
const NAMED_COLORS = ['white', 'black', 'transparent', 'red', 'green', 'blue', 'lightblue', 'skyblue', 'lightgray', 'gray', 'pink', 'lightpink', 'beige'];

function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
}

function isValidRgbColor(color: string): boolean {
  return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color) || /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(color);
}

function isValidColor(color: string): boolean {
  if (!color) return false;
  const lower = color.toLowerCase().trim();
  if (isValidHexColor(lower)) return true;
  if (isValidRgbColor(lower)) return true;
  if (NAMED_COLORS.includes(lower)) return true;
  // Allow some common names
  if (/^[a-z]+$/.test(lower) && lower.length <= 20) return true;
  return false;
}

export function validateCommand(command: string): { valid: boolean; error?: string } {
  if (!command || typeof command !== 'string') {
    return { valid: false, error: 'Command is required and must be a string' };
  }
  const trimmed = command.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: 'Command cannot be empty' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Command too long (max 500 characters)' };
  }
  // Basic XSS check
  if (/<script|javascript:|onerror=|onload=/i.test(trimmed)) {
    return { valid: false, error: 'Invalid command content' };
  }
  return { valid: true };
}

export function validateImageMetadata(meta?: PhotoAssistantRequest['imageMetadata']): { valid: boolean; error?: string } {
  if (!meta) return { valid: true };
  if (meta.width !== undefined) {
    if (!Number.isInteger(meta.width) || meta.width <= 0 || meta.width > 10000) {
      return { valid: false, error: 'Invalid image width' };
    }
  }
  if (meta.height !== undefined) {
    if (!Number.isInteger(meta.height) || meta.height <= 0 || meta.height > 10000) {
      return { valid: false, error: 'Invalid image height' };
    }
  }
  if (meta.mimeType) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!allowed.includes(meta.mimeType.toLowerCase())) {
      return { valid: false, error: `Unsupported mime type: ${meta.mimeType}` };
    }
  }
  return { valid: true };
}

export function validateAiOperation(op: any): { valid: boolean; error?: string; sanitized?: AiOperation } {
  if (!op || typeof op !== 'object') {
    return { valid: false, error: 'Operation must be an object' };
  }
  if (!op.type || typeof op.type !== 'string') {
    return { valid: false, error: 'Operation type is required' };
  }

  const type = op.type as OperationType;
  const validTypes: OperationType[] = [
    'setBrightness',
    'setContrast',
    'setSaturation',
    'setExposure',
    'setFilter',
    'crop',
    'resize',
    'rotate',
    'flipHorizontal',
    'flipVertical',
    'setBackground',
    'setTransparency',
    'setBorder',
    'resetAdjustments',
    'exportSuggestion',
    'unsupported',
  ];

  if (!validTypes.includes(type)) {
    return { valid: false, error: `Unknown operation type: ${type}` };
  }

  // Validate each type
  switch (type) {
    case 'setBrightness':
    case 'setContrast':
    case 'setSaturation': {
      const v = Number(op.value);
      if (isNaN(v) || v < -100 || v > 100) {
        return { valid: false, error: `${type} value must be between -100 and 100` };
      }
      return { valid: true, sanitized: { type, value: Math.round(v) } };
    }
    case 'setExposure': {
      const v = Number(op.value);
      if (isNaN(v) || v < -100 || v > 100) {
        return { valid: false, error: 'Exposure value must be between -100 and 100' };
      }
      return { valid: true, sanitized: { type, value: Math.round(v) } };
    }
    case 'setFilter': {
      const f = String(op.filter || '').toLowerCase();
      if (!VALID_FILTERS.includes(f) && !f.includes('vivid') && !f.includes('warm')) {
        // Allow but warn, sanitize to known
        if (f.length > 30) return { valid: false, error: 'Filter name too long' };
      }
      return { valid: true, sanitized: { type, filter: f } };
    }
    case 'crop': {
      if (op.preset) {
        const p = String(op.preset).toLowerCase();
        if (!VALID_CROP_PRESETS.includes(p)) {
          return { valid: false, error: `Invalid crop preset: ${p}` };
        }
        return { valid: true, sanitized: { type, preset: p } };
      }
      // Custom crop with coordinates
      const x = op.x !== undefined ? Number(op.x) : undefined;
      const y = op.y !== undefined ? Number(op.y) : undefined;
      const w = op.width !== undefined ? Number(op.width) : op.w !== undefined ? Number(op.w) : undefined;
      const h = op.height !== undefined ? Number(op.height) : op.h !== undefined ? Number(op.h) : undefined;
      if (w !== undefined && (isNaN(w) || w <= 0 || w > 10000)) return { valid: false, error: 'Invalid crop width' };
      if (h !== undefined && (isNaN(h) || h <= 0 || h > 10000)) return { valid: false, error: 'Invalid crop height' };
      if (x !== undefined && (isNaN(x) || x < 0 || x > 10000)) return { valid: false, error: 'Invalid crop x' };
      if (y !== undefined && (isNaN(y) || y < 0 || y > 10000)) return { valid: false, error: 'Invalid crop y' };
      return { valid: true, sanitized: { type, x, y, width: w, height: h } };
    }
    case 'resize': {
      if (op.preset) {
        const p = String(op.preset).toLowerCase();
        if (!VALID_RESIZE_PRESETS.includes(p) && p.length > 30) {
          return { valid: false, error: `Invalid resize preset: ${p}` };
        }
        // Allow preset even if not in list, but sanitize length
        return { valid: true, sanitized: { type, preset: p, width: op.width ? Number(op.width) : undefined, height: op.height ? Number(op.height) : undefined } };
      }
      const w = op.width ? Number(op.width) : undefined;
      const h = op.height ? Number(op.height) : undefined;
      if (w !== undefined && (!Number.isInteger(w) || w <= 0 || w > 10000)) return { valid: false, error: 'Invalid resize width' };
      if (h !== undefined && (!Number.isInteger(h) || h <= 0 || h > 10000)) return { valid: false, error: 'Invalid resize height' };
      if (!w && !h && !op.preset) return { valid: false, error: 'Resize requires width, height, or preset' };
      return { valid: true, sanitized: { type, width: w, height: h, preset: op.preset } };
    }
    case 'rotate': {
      const d = Number(op.degrees ?? op.value ?? op.angle);
      if (isNaN(d) || d < -360 || d > 360) {
        return { valid: false, error: 'Rotation must be between -360 and 360' };
      }
      return { valid: true, sanitized: { type, degrees: Math.round(d) } };
    }
    case 'flipHorizontal':
    case 'flipVertical': {
      return { valid: true, sanitized: { type } };
    }
    case 'setBackground': {
      if (op.transparent === true) {
        return { valid: true, sanitized: { type, color: 'transparent', transparent: true } };
      }
      const color = String(op.color || '').trim();
      if (!color) return { valid: false, error: 'Background color is required' };
      if (!isValidColor(color)) {
        return { valid: false, error: `Invalid background color: ${color}` };
      }
      // Normalize color
      return { valid: true, sanitized: { type, color: color.toLowerCase(), transparent: color.toLowerCase() === 'transparent' } };
    }
    case 'setTransparency': {
      const v = op.value !== undefined ? Boolean(op.value) : true;
      return { valid: true, sanitized: { type, value: v } };
    }
    case 'setBorder': {
      const enabled = op.enabled !== undefined ? Boolean(op.enabled) : true;
      const result: any = { type, enabled };
      if (op.color) {
        if (!isValidColor(String(op.color))) return { valid: false, error: `Invalid border color: ${op.color}` };
        result.color = String(op.color).toLowerCase();
      }
      if (op.thickness !== undefined) {
        const t = Number(op.thickness);
        if (isNaN(t) || t < 0 || t > 50) return { valid: false, error: 'Border thickness must be 0-50' };
        result.thickness = Math.round(t);
      }
      if (op.radius !== undefined) {
        const r = Number(op.radius);
        if (isNaN(r) || r < 0 || r > 100) return { valid: false, error: 'Border radius must be 0-100' };
        result.radius = Math.round(r);
      }
      return { valid: true, sanitized: result };
    }
    case 'resetAdjustments': {
      return { valid: true, sanitized: { type } };
    }
    case 'exportSuggestion': {
      const result: any = { type };
      if (op.format) {
        const f = String(op.format).toLowerCase();
        if (!VALID_EXPORT_FORMATS.includes(f as any)) return { valid: false, error: `Invalid export format: ${f}` };
        result.format = f;
      }
      if (op.quality !== undefined) {
        const q = Number(op.quality);
        if (isNaN(q) || q < 10 || q > 100) return { valid: false, error: 'Quality must be 10-100' };
        result.quality = Math.round(q);
      }
      return { valid: true, sanitized: result };
    }
    case 'unsupported': {
      const reason = String(op.reason || 'Operation not supported').substring(0, 300);
      return { valid: true, sanitized: { type, reason } };
    }
    default:
      return { valid: false, error: `Unhandled operation type: ${type}` };
  }
}

export function validateAiResponse(data: any): { valid: boolean; error?: string; sanitized?: AiAssistantResponse } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Response must be an object' };
  }
  if (!Array.isArray(data.operations)) {
    return { valid: false, error: 'Operations must be an array' };
  }
  if (data.operations.length > 20) {
    return { valid: false, error: 'Too many operations (max 20)' };
  }
  if (!data.explanation || typeof data.explanation !== 'string') {
    return { valid: false, error: 'Explanation is required' };
  }
  if (data.explanation.length > 1000) {
    return { valid: false, error: 'Explanation too long' };
  }

  const sanitizedOps: AiOperation[] = [];
  for (const op of data.operations) {
    const result = validateAiOperation(op);
    if (!result.valid) {
      // Instead of failing entirely, convert to unsupported
      sanitizedOps.push({ type: 'unsupported', reason: result.error || 'Invalid operation' });
    } else if (result.sanitized) {
      sanitizedOps.push(result.sanitized);
    }
  }

  const sanitized: AiAssistantResponse = {
    operations: sanitizedOps,
    explanation: data.explanation.substring(0, 500),
    confidence: data.confidence ? Math.min(100, Math.max(0, Number(data.confidence))) : undefined,
  };

  return { valid: true, sanitized };
}

export function validateRequestBody(body: any): { valid: boolean; error?: string; data?: PhotoAssistantRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be JSON' };
  }

  const cmdResult = validateCommand(body.command);
  if (!cmdResult.valid) return { valid: false, error: cmdResult.error };

  const metaResult = validateImageMetadata(body.imageMetadata);
  if (!metaResult.valid) return { valid: false, error: metaResult.error };

  // Validate currentEditState if present
  if (body.currentEditState) {
    if (typeof body.currentEditState !== 'object') {
      return { valid: false, error: 'currentEditState must be an object' };
    }
  }

  // Check body size (rough)
  const jsonStr = JSON.stringify(body);
  if (jsonStr.length > 10000) {
    return { valid: false, error: 'Request body too large (max 10KB)' };
  }

  return {
    valid: true,
    data: {
      command: body.command.trim(),
      imageMetadata: body.imageMetadata,
      currentEditState: body.currentEditState,
    },
  };
}
