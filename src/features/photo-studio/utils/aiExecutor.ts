/**
 * Safe AI operation executor
 * Maps validated AI operations to existing editor functions
 * Never executes arbitrary code
 */

import type { AiOperation } from '../types/aiAssistant';
import type { FilterState, BgColor, PassportSize } from '../types/photoStudio';

export interface EditorState {
  filter: FilterState;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  bgColor: BgColor;
  border: { enabled: boolean; color: string; thickness: number; radius: number };
  selectedSize: PassportSize;
  resizeW: number;
  resizeH: number;
  customBg: string;
}

export interface ExecutorResult {
  applied: AiOperation[];
  unsupported: AiOperation[];
  errors: string[];
  newState: Partial<EditorState>;
}

const BG_SWATCHES: BgColor[] = [
  { id: 'transparent', hex: 'transparent', name: 'Transparent', bn: 'স্বচ্ছ' },
  { id: 'white', hex: '#ffffff', name: 'White', bn: 'সাদা' },
  { id: 'lightgray', hex: '#f1f5f9', name: 'Light Gray', bn: 'হালকা ধূসর' },
  { id: 'lightblue', hex: '#bae6fd', name: 'Light Blue', bn: 'হালকা নীল' },
  { id: 'sky', hex: '#38bdf8', name: 'Sky Blue', bn: 'আকাশী' },
  { id: 'blue', hex: '#2563eb', name: 'Blue', bn: 'নীল' },
  { id: 'green', hex: '#10b981', name: 'Green', bn: 'সবুজ' },
  { id: 'pink', hex: '#f472b6', name: 'Pink', bn: 'গোলাপি' },
  { id: 'black', hex: '#000000', name: 'Black', bn: 'কালো' },
];

const RESIZE_PRESETS: Record<string, { w: number; h: number }> = {
  passport: { w: 400, h: 500 },
  profile: { w: 500, h: 500 },
  'social-square': { w: 1080, h: 1080 },
  'fb-post': { w: 1200, h: 630 },
  'insta-post': { w: 1080, h: 1080 },
  'insta-story': { w: 1080, h: 1920 },
  'yt-thumb': { w: 1280, h: 720 },
  'bd-passport': { w: 400, h: 500 },
  'in-visa': { w: 350, h: 350 },
  custom: { w: 400, h: 500 },
};

const CROP_PRESET_TO_RESIZE: Record<string, { w: number; h: number }> = {
  '1:1': { w: 500, h: 500 },
  '4:5': { w: 400, h: 500 },
  '3:4': { w: 300, h: 400 },
  '4:3': { w: 400, h: 300 },
  '16:9': { w: 1280, h: 720 },
  passport: { w: 400, h: 500 },
  free: { w: 400, h: 500 },
};

function findBgByColor(color: string): BgColor {
  const lower = color.toLowerCase();
  const found = BG_SWATCHES.find(s => s.hex.toLowerCase() === lower || s.id === lower || s.name.toLowerCase() === lower);
  if (found) return found;
  // Custom color
  if (lower.startsWith('#') || lower === 'transparent') {
    return { id: 'custom', hex: lower, name: 'Custom', bn: 'কাস্টম' };
  }
  // Named color mapping
  const namedMap: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    red: '#ef4444',
    green: '#10b981',
    blue: '#2563eb',
    lightblue: '#bae6fd',
    skyblue: '#38bdf8',
    lightgray: '#f1f5f9',
    gray: '#64748b',
    pink: '#f472b6',
  };
  const mapped = namedMap[lower] || '#ffffff';
  return { id: 'custom', hex: mapped, name: 'Custom', bn: 'কাস্টম' };
}

export function executeAiOperations(
  operations: AiOperation[],
  currentState: EditorState
): ExecutorResult {
  const applied: AiOperation[] = [];
  const unsupported: AiOperation[] = [];
  const errors: string[] = [];

  let newFilter = { ...currentState.filter };
  let newRotate = currentState.rotate;
  let newFlipH = currentState.flipH;
  let newFlipV = currentState.flipV;
  let newBgColor = { ...currentState.bgColor };
  let newBorder = { ...currentState.border };
  let newSelectedSize = { ...currentState.selectedSize };
  let newResizeW = currentState.resizeW;
  let newResizeH = currentState.resizeH;
  let newCustomBg = currentState.customBg;

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'setBrightness': {
          const delta = op.value ?? 0;
          // Current brightness is 0-200, default 100, delta -50 to 50
          const newVal = Math.min(200, Math.max(0, newFilter.brightness + delta));
          newFilter.brightness = newVal;
          applied.push(op);
          break;
        }
        case 'setContrast': {
          const delta = op.value ?? 0;
          const newVal = Math.min(200, Math.max(0, newFilter.contrast + delta));
          newFilter.contrast = newVal;
          applied.push(op);
          break;
        }
        case 'setSaturation': {
          const delta = op.value ?? 0;
          const newVal = Math.min(200, Math.max(0, newFilter.saturation + delta));
          newFilter.saturation = newVal;
          applied.push(op);
          break;
        }
        case 'setExposure': {
          const delta = op.value ?? 0;
          const newVal = Math.min(50, Math.max(-50, newFilter.exposure + delta));
          newFilter.exposure = newVal;
          applied.push(op);
          break;
        }
        case 'setFilter': {
          const f = (op.filter || '').toLowerCase();
          // Map filter names to actual filter adjustments
          if (f === 'grayscale') {
            newFilter.grayscale = 100;
            newFilter.sepia = 0;
            newFilter.vivid = 0;
          } else if (f === 'sepia') {
            newFilter.sepia = 80;
            newFilter.grayscale = 0;
          } else if (f === 'vivid') {
            newFilter.vivid = 40;
            newFilter.saturation = Math.min(200, newFilter.saturation + 20);
            newFilter.contrast = Math.min(200, newFilter.contrast + 10);
          } else if (f === 'warm') {
            newFilter.warm = 40;
            newFilter.saturation = Math.min(200, newFilter.saturation + 10);
          } else if (f === 'cool') {
            newFilter.hue = -10;
            newFilter.saturation = Math.min(200, newFilter.saturation + 5);
          } else if (f === 'vintage') {
            newFilter.sepia = 30;
            newFilter.contrast = Math.min(200, newFilter.contrast + 10);
            newFilter.warm = 20;
          } else if (f === 'original' || f === 'none') {
            newFilter = {
              brightness: 100,
              contrast: 100,
              saturation: 100,
              exposure: 0,
              blur: 0,
              grayscale: 0,
              sepia: 0,
              hue: 0,
              vivid: 0,
              warm: 0,
              sharpness: 0,
            };
          } else if (f === 'blur') {
            newFilter.blur = 2;
          } else if (f === 'sharpen' || f === 'sharpness') {
            newFilter.sharpness = 40;
            newFilter.contrast = Math.min(200, newFilter.contrast + 5);
          }
          applied.push(op);
          break;
        }
        case 'crop': {
          // For crop preset, we adjust selectedSize to preset size
          if (op.preset) {
            const preset = op.preset.toLowerCase();
            const size = CROP_PRESET_TO_RESIZE[preset];
            if (size) {
              newResizeW = size.w;
              newResizeH = size.h;
              newSelectedSize = {
                ...newSelectedSize,
                pxW: size.w,
                pxH: size.h,
                w: size.w / 10,
                h: size.h / 10,
              };
              applied.push(op);
            } else {
              unsupported.push(op);
            }
          } else {
            // Custom crop coordinates - we treat as resize suggestion
            if (op.width && op.height) {
              newResizeW = Math.round(op.width);
              newResizeH = Math.round(op.height);
              applied.push(op);
            } else {
              unsupported.push({ type: 'unsupported', reason: 'Custom crop requires width/height' });
            }
          }
          break;
        }
        case 'resize': {
          if (op.preset) {
            const preset = op.preset.toLowerCase();
            const size = RESIZE_PRESETS[preset] || CROP_PRESET_TO_RESIZE[preset];
            if (size) {
              newResizeW = size.w;
              newResizeH = size.h;
              newSelectedSize = {
                ...newSelectedSize,
                pxW: size.w,
                pxH: size.h,
                w: size.w / 10,
                h: size.h / 10,
                label: `${size.w}x${size.h}`,
              };
              applied.push(op);
            } else if (op.width && op.height) {
              newResizeW = op.width;
              newResizeH = op.height;
              newSelectedSize = {
                ...newSelectedSize,
                pxW: op.width,
                pxH: op.height,
                w: op.width / 10,
                h: op.height / 10,
              };
              applied.push(op);
            } else {
              unsupported.push(op);
            }
          } else if (op.width && op.height) {
            newResizeW = op.width;
            newResizeH = op.height;
            newSelectedSize = {
              ...newSelectedSize,
              pxW: op.width,
              pxH: op.height,
              w: op.width / 10,
              h: op.height / 10,
            };
            applied.push(op);
          } else {
            unsupported.push({ type: 'unsupported', reason: 'Resize needs width/height or preset' });
          }
          break;
        }
        case 'rotate': {
          const deg = op.degrees ?? 0;
          newRotate = (newRotate + deg) % 360;
          applied.push(op);
          break;
        }
        case 'flipHorizontal': {
          newFlipH = !newFlipH;
          applied.push(op);
          break;
        }
        case 'flipVertical': {
          newFlipV = !newFlipV;
          applied.push(op);
          break;
        }
        case 'setBackground': {
          if (op.transparent) {
            newBgColor = { id: 'transparent', hex: 'transparent', name: 'Transparent', bn: 'স্বচ্ছ' };
          } else if (op.color) {
            const bg = findBgByColor(op.color);
            newBgColor = bg;
            if (bg.hex.startsWith('#')) {
              newCustomBg = bg.hex;
            }
          }
          applied.push(op);
          break;
        }
        case 'setTransparency': {
          const val = op.value ?? true;
          if (val) {
            newBgColor = { id: 'transparent', hex: 'transparent', name: 'Transparent', bn: 'স্বচ্ছ' };
          } else {
            newBgColor = { id: 'white', hex: '#ffffff', name: 'White', bn: 'সাদা' };
          }
          applied.push(op);
          break;
        }
        case 'setBorder': {
          const enabled = op.enabled ?? true;
          newBorder.enabled = enabled;
          if (op.color) newBorder.color = op.color;
          if (op.thickness !== undefined) newBorder.thickness = op.thickness;
          if (op.radius !== undefined) newBorder.radius = op.radius;
          applied.push(op);
          break;
        }
        case 'resetAdjustments': {
          newFilter = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            exposure: 0,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            hue: 0,
            vivid: 0,
            warm: 0,
            sharpness: 0,
          };
          newRotate = 0;
          newFlipH = false;
          newFlipV = false;
          applied.push(op);
          break;
        }
        case 'exportSuggestion': {
          // Export suggestion doesn't change state, just informs
          applied.push(op);
          break;
        }
        case 'unsupported': {
          unsupported.push(op);
          break;
        }
        default: {
          unsupported.push({ type: 'unsupported', reason: `Unknown operation: ${(op as any).type}` });
        }
      }
    } catch (e: any) {
      errors.push(`Failed to apply ${op.type}: ${e.message}`);
      unsupported.push({ type: 'unsupported', reason: e.message });
    }
  }

  return {
    applied,
    unsupported,
    errors,
    newState: {
      filter: newFilter,
      rotate: newRotate,
      flipH: newFlipH,
      flipV: newFlipV,
      bgColor: newBgColor,
      border: newBorder,
      selectedSize: newSelectedSize,
      resizeW: newResizeW,
      resizeH: newResizeH,
      customBg: newCustomBg,
    },
  };
}

export function getOperationDescription(op: AiOperation): string {
  switch (op.type) {
    case 'setBrightness':
      return `Brightness ${op.value && op.value > 0 ? '+' : ''}${op.value}%`;
    case 'setContrast':
      return `Contrast ${op.value && op.value > 0 ? '+' : ''}${op.value}%`;
    case 'setSaturation':
      return `Saturation ${op.value && op.value > 0 ? '+' : ''}${op.value}%`;
    case 'setExposure':
      return `Exposure ${op.value && op.value > 0 ? '+' : ''}${op.value}`;
    case 'setFilter':
      return `Filter: ${op.filter}`;
    case 'crop':
      return op.preset ? `Crop: ${op.preset}` : `Crop ${op.width}x${op.height}`;
    case 'resize':
      return op.preset ? `Resize: ${op.preset}` : `Resize to ${op.width}x${op.height}`;
    case 'rotate':
      return `Rotate ${op.degrees}°`;
    case 'flipHorizontal':
      return 'Flip Horizontal';
    case 'flipVertical':
      return 'Flip Vertical';
    case 'setBackground':
      return op.transparent ? 'Transparent background' : `Background: ${op.color}`;
    case 'setTransparency':
      return op.value ? 'Make transparent' : 'Remove transparency';
    case 'setBorder':
      return op.enabled ? `Border ${op.thickness ? `${op.thickness}px` : ''} ${op.color || ''}` : 'Remove border';
    case 'resetAdjustments':
      return 'Reset adjustments';
    case 'exportSuggestion':
      return `Export: ${op.format || 'suggested'} ${op.quality ? `${op.quality}%` : ''}`;
    case 'unsupported':
      return `Unsupported: ${op.reason}`;
    default:
      return op.type;
  }
}
