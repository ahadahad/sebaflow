export type BgColor = {
  id: string;
  hex: string;
  name: string;
  bn: string;
  style?: string;
};

export type PassportSize = {
  id: string;
  label: string;
  bn: string;
  w: number;
  h: number;
  pxW: number;
  pxH: number;
  desc: string;
  bnDesc: string;
  country?: string;
};

export type TrayImage = {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
};

export type FilterState = {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hue: number;
  vivid: number;
  warm: number;
  sharpness: number;
};

export type CropState = {
  x: number;
  y: number;
  w: number;
  h: number;
  aspect: string;
};

export type ResizeState = {
  width: number;
  height: number;
  lockAspect: boolean;
};

export type BorderState = {
  enabled: boolean;
  color: string;
  thickness: number;
  radius: number;
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  filter: FilterState;
  imgPos: { x: number; y: number; scale: number };
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  bgColor: BgColor;
  border: BorderState;
  crop: CropState | null;
  selectedSize: PassportSize;
};

export type ExportSettings = {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  fileName: string;
  width: number;
  height: number;
};

export const defaultFilter: FilterState = {
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

export const bgColors: BgColor[] = [
  { id: 'transparent', hex: 'transparent', name: 'Transparent', bn: 'স্বচ্ছ' },
  { id: 'white', hex: '#ffffff', name: 'White', bn: 'সাদা' },
  { id: 'lightgray', hex: '#f1f5f9', name: 'Light Gray', bn: 'হালকা ধূসর' },
  { id: 'lightblue', hex: '#bae6fd', name: 'Light Blue', bn: 'হালকা নীল' },
  { id: 'sky', hex: '#38bdf8', name: 'Sky Blue', bn: 'আকাশী' },
  { id: 'blue', hex: '#2563eb', name: 'Blue', bn: 'নীল' },
  { id: 'green', hex: '#10b981', name: 'Green', bn: 'সবুজ' },
  { id: 'pink', hex: '#f472b6', name: 'Pink', bn: 'গোলাপি' },
  { id: 'black', hex: '#000000', name: 'Black', bn: 'কালো' },
  { id: 'custom', hex: '#f59e0b', name: 'Custom', bn: 'কাস্টম' },
];

export const passportSizes: PassportSize[] = [
  { id: '40x50', label: '40x50 mm', bn: '৪০x৫০ মিমি', w: 40, h: 50, pxW: 400, pxH: 500, desc: 'BD Passport', bnDesc: 'বিডি পাসপোর্ট', country: 'BD' },
  { id: '50x40', label: '50x40 mm', bn: '৫০x৪০ মিমি', w: 50, h: 40, pxW: 500, pxH: 400, desc: 'BD NID', bnDesc: 'এনআইডি', country: 'BD' },
  { id: '35x45', label: '35x45 mm', bn: '৩৫x৪৫ মিমি', w: 35, h: 45, pxW: 350, pxH: 450, desc: 'International', bnDesc: 'আন্তর্জাতিক', country: 'INT' },
  { id: '35x35', label: '35x35 mm', bn: '৩৫x৩৫ মিমি', w: 35, h: 35, pxW: 350, pxH: 350, desc: 'Indian Visa', bnDesc: 'ইন্ডিয়ান ভিসা', country: 'IN' },
  { id: '50x50', label: '2x2 inch', bn: '২x২ ইঞ্চি', w: 50, h: 50, pxW: 500, pxH: 500, desc: 'US Visa', bnDesc: 'ইউএস ভিসা', country: 'US' },
  { id: '30x40', label: '30x40 mm', bn: '৩০x৪০ মিমি', w: 30, h: 40, pxW: 300, pxH: 400, desc: 'Visa', bnDesc: 'ভিসা', country: 'INT' },
  { id: '300x300', label: '300x300 px', bn: '৩০০x৩০০ px', w: 30, h: 30, pxW: 300, pxH: 300, desc: 'Profile', bnDesc: 'প্রোফাইল' },
  { id: '1080x1080', label: '1080x1080', bn: '১০৮০x১০৮০', w: 1080, h: 1080, pxW: 1080, pxH: 1080, desc: 'Instagram Post', bnDesc: 'ইনস্টাগ্রাম' },
  { id: '1080x1920', label: '1080x1920', bn: '১০৮০x১৯২০', w: 1080, h: 1920, pxW: 1080, pxH: 1920, desc: 'Story', bnDesc: 'স্টোরি' },
  { id: '1280x720', label: '1280x720', bn: '১২৮০x৭২০', w: 1280, h: 720, pxW: 1280, pxH: 720, desc: 'YouTube', bnDesc: 'ইউটিউব' },
];
