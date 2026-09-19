/**
 * Tests for AI Executor - run with: npx tsc --noEmit or via vite
 * Simple manual test file
 */

import { executeAiOperations } from '../utils/aiExecutor';
import type { FilterState, BgColor, PassportSize } from '../types/photoStudio';

const mockFilter: FilterState = {
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

const mockBg: BgColor = { id: 'white', hex: '#ffffff', name: 'White', bn: 'সাদা' };
const mockSize: PassportSize = {
  id: '40x50',
  label: '40x50 mm',
  bn: '৪০x৫০ মিমি',
  w: 40,
  h: 50,
  pxW: 400,
  pxH: 500,
  desc: 'BD Passport',
  bnDesc: 'বিডি পাসপোর্ট',
};

const mockState = {
  filter: mockFilter,
  rotate: 0,
  flipH: false,
  flipV: false,
  bgColor: mockBg,
  border: { enabled: false, color: '#ffffff', thickness: 2, radius: 0 },
  selectedSize: mockSize,
  resizeW: 400,
  resizeH: 500,
  customBg: '#ffffff',
};

// Test cases
console.log('Testing AI Executor...');

// Brightness
const brightnessResult = executeAiOperations([{ type: 'setBrightness', value: 15 }], mockState);
console.assert(brightnessResult.applied.length === 1, 'Brightness should be applied');
console.assert(brightnessResult.newState.filter?.brightness === 115, 'Brightness should be 115');
console.log('✓ Brightness');

// Background
const bgResult = executeAiOperations([{ type: 'setBackground', color: '#bae6fd' }], mockState);
console.assert(bgResult.applied.length === 1, 'Background should be applied');
console.assert(bgResult.newState.bgColor?.hex === '#bae6fd', 'Background color should be light blue');
console.log('✓ Background');

// Resize
const resizeResult = executeAiOperations([{ type: 'resize', preset: 'passport' }], mockState);
console.assert(resizeResult.applied.length === 1, 'Resize should be applied');
console.log('✓ Resize');

// Crop
const cropResult = executeAiOperations([{ type: 'crop', preset: '1:1' }], mockState);
console.assert(cropResult.applied.length === 1, 'Crop should be applied');
console.log('✓ Crop');

// Rotate
const rotateResult = executeAiOperations([{ type: 'rotate', degrees: 90 }], mockState);
console.assert(rotateResult.applied.length === 1, 'Rotate should be applied');
console.assert(rotateResult.newState.rotate === 90, 'Rotate should be 90');
console.log('✓ Rotate');

// Unsupported
const unsupportedResult = executeAiOperations([{ type: 'unsupported', reason: 'Object removal not supported' }], mockState);
console.assert(unsupportedResult.unsupported.length === 1, 'Unsupported should be marked');
console.log('✓ Unsupported');

// Reset
const resetResult = executeAiOperations([{ type: 'resetAdjustments' }], { ...mockState, filter: { ...mockFilter, brightness: 150 } });
console.assert(resetResult.newState.filter?.brightness === 100, 'Reset should restore brightness');
console.log('✓ Reset');

console.log('All executor tests passed!');
