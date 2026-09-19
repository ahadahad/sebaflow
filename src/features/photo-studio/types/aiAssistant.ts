export type AiOperationType =
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

export interface AiOperation {
  type: AiOperationType;
  value?: number;
  filter?: string;
  preset?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  w?: number;
  h?: number;
  degrees?: number;
  color?: string;
  transparent?: boolean;
  enabled?: boolean;
  thickness?: number;
  radius?: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
  reason?: string;
}

export interface AiAssistantResponse {
  success: boolean;
  message?: string;
  operations: AiOperation[];
  explanation: string;
  confidence?: number;
  model?: string;
  error?: string;
  code?: string;
}

export interface AiStatus {
  success: boolean;
  status: 'AI Connected' | 'AI Unavailable' | 'Configuration Required' | 'Request Failed';
  configured: boolean;
  model: string;
  hasApiKey: boolean;
  timestamp: string;
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

export const EXAMPLE_COMMANDS = [
  'Make the background white',
  'Improve the lighting',
  'Make this photo sharper',
  'Create a professional passport-style photo',
  'Change the background to light blue',
  'Remove the background',
  'Make the image brighter and more natural',
  'Crop this image to passport size',
  'Make the photo brighter',
  'Set the background to white',
  'Make the image warmer',
  'Prepare this for passport size',
  'Increase contrast slightly',
  'Reset all adjustments',
];

export const BG_COLOR_MAP: Record<string, string> = {
  white: '#ffffff',
  'light blue': '#bae6fd',
  'sky blue': '#38bdf8',
  blue: '#2563eb',
  'light gray': '#f1f5f9',
  gray: '#64748b',
  black: '#000000',
  transparent: 'transparent',
  green: '#10b981',
  pink: '#f472b6',
};
