import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FilePlus2,
  ImagePlus,
  Info,
  LayoutTemplate,
  LoaderCircle,
  Maximize2,
  Move,
  Palette,
  Printer,
  RefreshCw,
  RotateCcw,
  RotateCw,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import ToolTopBar from '../components/ToolTopBar';
import { useLanguage } from '../lib/i18n';

type A4Orientation = 'portrait' | 'landscape';
type DocumentMode = 'normal' | 'color' | 'grayscale' | 'bw';
type Notice = { type: 'success' | 'error' | 'info'; text: string } | null;

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DocumentAdjustments = {
  mode: DocumentMode;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
};

type PrintLayout = {
  x: number;
  y: number;
  widthPercent: number;
  rotation: number;
  marginMm: number;
};

type DocumentPage = {
  id: string;
  image: HTMLImageElement;
  url: string;
  fileName: string;
  crop: CropRect;
  adjustments: DocumentAdjustments;
  layout: PrintLayout;
};

const DPI = 300;
const PX_PER_MM = DPI / 25.4;
const A4_PORTRAIT = { width: 2480, height: 3508, widthMm: 210, heightMm: 297 };
const DEFAULT_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };
const DEFAULT_ADJUSTMENTS: DocumentAdjustments = {
  mode: 'normal',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
};
const DEFAULT_LAYOUT: PrintLayout = {
  x: 50,
  y: 50,
  widthPercent: 92,
  rotation: 0,
  marginMm: 10,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatFileName(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'document';
}

function getA4Size(orientation: A4Orientation) {
  if (orientation === 'portrait') return A4_PORTRAIT;
  return {
    width: A4_PORTRAIT.height,
    height: A4_PORTRAIT.width,
    widthMm: A4_PORTRAIT.heightMm,
    heightMm: A4_PORTRAIT.widthMm,
  };
}

function getCanvasFilter(adjustments: DocumentAdjustments) {
  const brightness = clamp(100 + adjustments.brightness, 40, 180);
  const contrast = clamp(100 + adjustments.contrast, 30, 250);
  const saturation = adjustments.mode === 'grayscale' || adjustments.mode === 'bw'
    ? 0
    : clamp(100 + adjustments.saturation + (adjustments.mode === 'color' ? 22 : 0), 0, 220);
  const grayscale = adjustments.mode === 'grayscale' || adjustments.mode === 'bw' ? 1 : 0;
  const extraContrast = adjustments.mode === 'bw' ? 2.6 : 1;
  return `brightness(${brightness}%) contrast(${contrast * extraContrast}%) saturate(${saturation}%) grayscale(${grayscale})`;
}

function detectLocalCrop(image: HTMLImageElement): CropRect {
  const targetWidth = 360;
  const targetHeight = Math.max(120, Math.round((targetWidth / image.naturalWidth) * image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return DEFAULT_CROP;

  try {
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    const pixels = context.getImageData(0, 0, targetWidth, targetHeight).data;
    const luminance = new Uint8Array(targetWidth * targetHeight);
    for (let i = 0, pixel = 0; i < pixels.length; i += 4, pixel += 1) {
      luminance[pixel] = (pixels[i] * 77 + pixels[i + 1] * 150 + pixels[i + 2] * 29) >> 8;
    }

    const rowDifference = (y: number) => {
      let total = 0;
      let count = 0;
      for (let x = Math.round(targetWidth * 0.16); x < Math.round(targetWidth * 0.84); x += 3) {
        total += Math.abs(luminance[y * targetWidth + x] - luminance[(y + 1) * targetWidth + x]);
        count += 1;
      }
      return total / Math.max(1, count);
    };
    const columnDifference = (x: number) => {
      let total = 0;
      let count = 0;
      for (let y = Math.round(targetHeight * 0.16); y < Math.round(targetHeight * 0.84); y += 3) {
        total += Math.abs(luminance[y * targetWidth + x] - luminance[y * targetWidth + x + 1]);
        count += 1;
      }
      return total / Math.max(1, count);
    };
    const strongest = (start: number, end: number, scorer: (position: number) => number) => {
      let bestPosition = start;
      let bestScore = 0;
      for (let position = start; position < end; position += 1) {
        const score = scorer(position);
        if (score > bestScore) {
          bestScore = score;
          bestPosition = position;
        }
      }
      return { position: bestPosition, score: bestScore };
    };

    const top = strongest(1, Math.max(2, Math.round(targetHeight * 0.34)), rowDifference);
    const bottom = strongest(Math.round(targetHeight * 0.66), targetHeight - 2, rowDifference);
    const left = strongest(1, Math.max(2, Math.round(targetWidth * 0.34)), columnDifference);
    const right = strongest(Math.round(targetWidth * 0.66), targetWidth - 2, columnDifference);
    const edgeStrength = Math.min(top.score, bottom.score, left.score, right.score);
    const x = left.position / targetWidth;
    const y = top.position / targetHeight;
    const width = (right.position - left.position) / targetWidth;
    const height = (bottom.position - top.position) / targetHeight;

    if (edgeStrength < 11 || width < 0.45 || height < 0.45 || width > 0.98 || height > 0.98) return DEFAULT_CROP;
    return {
      x: clamp(x, 0, 0.92),
      y: clamp(y, 0, 0.92),
      width: clamp(width, 0.08, 1),
      height: clamp(height, 0.08, 1),
    };
  } catch {
    return DEFAULT_CROP;
  }
}

function drawPageOnA4(
  canvas: HTMLCanvasElement,
  page: DocumentPage | undefined,
  orientation: A4Orientation,
) {
  const size = getA4Size(orientation);
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size.width, size.height);
  if (!page) return;

  const { crop, image, adjustments, layout } = page;
  const sourceX = crop.x * image.naturalWidth;
  const sourceY = crop.y * image.naturalHeight;
  const sourceWidth = crop.width * image.naturalWidth;
  const sourceHeight = crop.height * image.naturalHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const margin = layout.marginMm * PX_PER_MM;
  const availableWidth = Math.max(1, size.width - margin * 2);
  const availableHeight = Math.max(1, size.height - margin * 2);
  let drawWidth = availableWidth * (layout.widthPercent / 100);
  let drawHeight = drawWidth / sourceRatio;

  if (drawHeight > availableHeight) {
    drawHeight = availableHeight * (layout.widthPercent / 100);
    drawWidth = drawHeight * sourceRatio;
  }

  const centerX = (layout.x / 100) * size.width;
  const centerY = (layout.y / 100) * size.height;
  context.save();
  context.beginPath();
  context.rect(0, 0, size.width, size.height);
  context.clip();
  context.translate(centerX, centerY);
  context.rotate(((layout.rotation + adjustments.rotation) * Math.PI) / 180);
  context.filter = getCanvasFilter(adjustments);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
}

export default function A4DocumentStudio() {
  const { lang } = useLanguage();
  const isBangla = lang === 'bn';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(new Set<string>());

  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [orientation, setOrientation] = useState<A4Orientation>('portrait');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoCropping, setIsAutoCropping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const text = isBangla
    ? {
        title: 'A4 প্রিন্ট রেডি',
        subtitle: 'ডকুমেন্ট পরিষ্কার করুন, সাজান এবং A4 PDF বা PNG হিসেবে প্রিন্ট-রেডি করুন',
        specification: 'A4 • 300 DPI • ব্রাউজারে প্রসেসিং',
        upload: 'ডকুমেন্ট যোগ করুন',
        addPages: 'আরও পেজ যোগ করুন',
        dragDrop: 'ডকুমেন্টের ছবি এখানে টেনে আনুন অথবা ক্লিক করে বেছে নিন',
        imageOnly: 'JPG, PNG বা WEBP ছবি ব্যবহার করুন',
        pageTray: 'পেজ তালিকা',
        noPages: 'এখনও কোনো পেজ নেই',
        page: 'পেজ',
        delete: 'মুছুন',
        previous: 'আগের পেজ',
        next: 'পরের পেজ',
        processing: 'ইমেজ ক্লিনআপ',
        mode: 'মোড',
        normal: 'স্বাভাবিক',
        color: 'রঙ উন্নত',
        grayscale: 'গ্রেস্কেল',
        bw: 'সাদা-কালো',
        brightness: 'উজ্জ্বলতা',
        contrast: 'কনট্রাস্ট',
        colorAmount: 'রঙ',
        crop: 'ক্রপ ও স্ক্যান',
        autoCrop: 'অটো ক্রপ',
        cropHint: 'লোকাল এজ ডিটেকশন ব্যবহার করে ডকুমেন্টের চারপাশের অতিরিক্ত জায়গা বাদ দেয়।',
        cropWidth: 'ক্রপ প্রস্থ',
        cropHeight: 'ক্রপ উচ্চতা',
        cropX: 'বাম / ডান অবস্থান',
        cropY: 'উপর / নিচ অবস্থান',
        resetCrop: 'সম্পূর্ণ ছবি',
        rotation: 'ঘোরান',
        rotateLeft: 'বামে ৯০°',
        rotateRight: 'ডানে ৯০°',
        layout: 'প্রিন্ট লেআউট',
        orientation: 'পেজের দিক',
        portrait: 'পোর্ট্রেট',
        landscape: 'ল্যান্ডস্কেপ',
        scale: 'প্রিন্ট সাইজ',
        positionX: 'বাম / ডান অবস্থান',
        positionY: 'উপর / নিচ অবস্থান',
        margin: 'পেজ মার্জিন',
        fitPage: 'পেজে ফিট',
        fullWidth: 'পুরো প্রস্থ',
        halfPage: 'অর্ধেক পেজ',
        center: 'মাঝখানে',
        applyAll: 'সব পেজে প্রয়োগ',
        physicalSize: 'আসল প্রিন্ট সাইজ',
        output: 'ডাউনলোড ও প্রিন্ট',
        downloadPng: 'এই পেজ PNG',
        downloadPdf: 'সব পেজ PDF',
        printing: 'সব পেজ প্রিন্ট',
        preview: 'A4 প্রিন্ট প্রিভিউ',
        noDocument: 'প্রিভিউ দেখতে একটি ডকুমেন্টের ছবি যোগ করুন',
        privacy: 'আপনার ডকুমেন্ট শুধু এই ব্রাউজারেই থাকে। কোনো সার্ভারে আপলোড করা হয় না।',
        ready: 'প্রিন্ট-রেডি ফাইল তৈরি হয়েছে।',
        pagesAdded: 'টি পেজ যোগ করা হয়েছে।',
        imageInvalid: 'শুধু ছবি ফাইল যোগ করুন।',
        loadError: 'এক বা একাধিক ছবি খোলা যায়নি।',
        cropped: 'লোকাল অটো ক্রপ প্রয়োগ করা হয়েছে।',
        popupBlocked: 'প্রিন্ট উইন্ডো খোলা যায়নি। ব্রাউজারের পপ-আপ অনুমতি দিন।',
        reset: 'সেটিংস রিসেট',
        fileFormat: 'ফাইল ফরম্যাট',
        fileInfo: 'প্রতিটি PDF পেজ A4, 300 DPI এবং নির্বাচিত লেআউটে তৈরি হবে।',
        cropLoading: 'ডকুমেন্টের প্রান্ত খোঁজা হচ্ছে…',
        exporting: 'PDF তৈরি হচ্ছে…',
      }
    : {
        title: 'A4 Print Ready',
        subtitle: 'Clean up, arrange, and export documents as print-ready A4 PDF or PNG files',
        specification: 'A4 • 300 DPI • Browser-only processing',
        upload: 'Add document',
        addPages: 'Add more pages',
        dragDrop: 'Drop document images here, or click to choose them',
        imageOnly: 'Use JPG, PNG, or WEBP images',
        pageTray: 'Page tray',
        noPages: 'No pages added yet',
        page: 'Page',
        delete: 'Delete',
        previous: 'Previous page',
        next: 'Next page',
        processing: 'Image cleanup',
        mode: 'Mode',
        normal: 'Normal',
        color: 'Color boost',
        grayscale: 'Grayscale',
        bw: 'Black & white',
        brightness: 'Brightness',
        contrast: 'Contrast',
        colorAmount: 'Color',
        crop: 'Crop & scan',
        autoCrop: 'Auto crop',
        cropHint: 'Uses local edge detection to trim unused space around a document.',
        cropWidth: 'Crop width',
        cropHeight: 'Crop height',
        cropX: 'Left / right position',
        cropY: 'Up / down position',
        resetCrop: 'Full image',
        rotation: 'Rotation',
        rotateLeft: 'Rotate left 90°',
        rotateRight: 'Rotate right 90°',
        layout: 'Print layout',
        orientation: 'Page orientation',
        portrait: 'Portrait',
        landscape: 'Landscape',
        scale: 'Print size',
        positionX: 'Left / right position',
        positionY: 'Up / down position',
        margin: 'Page margin',
        fitPage: 'Fit page',
        fullWidth: 'Full width',
        halfPage: 'Half page',
        center: 'Center',
        applyAll: 'Apply to all pages',
        physicalSize: 'Physical print size',
        output: 'Download & print',
        downloadPng: 'This page PNG',
        downloadPdf: 'All pages PDF',
        printing: 'Print all pages',
        preview: 'A4 print preview',
        noDocument: 'Add a document image to see the preview',
        privacy: 'Your documents stay in this browser. Nothing is uploaded to a server.',
        ready: 'Your print-ready file has been created.',
        pagesAdded: 'page(s) added.',
        imageInvalid: 'Please add image files only.',
        loadError: 'One or more images could not be opened.',
        cropped: 'Local auto crop has been applied.',
        popupBlocked: 'The print window could not open. Please allow browser pop-ups.',
        reset: 'Reset settings',
        fileFormat: 'File format',
        fileInfo: 'Each PDF page is generated at A4, 300 DPI, with the selected layout.',
        cropLoading: 'Finding document edges…',
        exporting: 'Creating PDF…',
      };

  const activePage = pages[activeIndex];
  const pageSize = getA4Size(orientation);
  const hasPages = pages.length > 0;

  const revokePage = useCallback((page: DocumentPage | undefined) => {
    if (page && urlsRef.current.has(page.url)) {
      URL.revokeObjectURL(page.url);
      urlsRef.current.delete(page.url);
    }
  }, []);

  useEffect(() => () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  }, []);

  const updateActivePage = useCallback((update: (page: DocumentPage) => DocumentPage) => {
    setPages((currentPages) => currentPages.map((page, index) => index === activeIndex ? update(page) : page));
  }, [activeIndex]);

  const loadPage = useCallback((file: File) => new Promise<DocumentPage>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('INVALID_FILE'));
      return;
    }

    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    const image = new Image();
    image.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        image,
        url,
        fileName: file.name,
        crop: { ...DEFAULT_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        layout: { ...DEFAULT_LAYOUT },
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
      reject(new Error('LOAD_ERROR'));
    };
    image.src = url;
  }), []);

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setIsLoading(true);
    const currentLength = pages.length;
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      setNotice({ type: 'error', text: text.imageInvalid });
      setIsLoading(false);
      return;
    }

    const results = await Promise.allSettled(imageFiles.map(loadPage));
    const nextPages = results
      .filter((result): result is PromiseFulfilledResult<DocumentPage> => result.status === 'fulfilled')
      .map((result) => result.value);
    if (nextPages.length) {
      setPages((currentPages) => [...currentPages, ...nextPages]);
      setActiveIndex(currentLength);
      setNotice({ type: 'success', text: `${nextPages.length} ${text.pagesAdded}` });
    }
    if (nextPages.length !== imageFiles.length) setNotice({ type: 'error', text: text.loadError });
    setIsLoading(false);
  }, [loadPage, pages.length, text.imageInvalid, text.loadError, text.pagesAdded]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const deletePage = (index: number) => {
    const nextLength = pages.length - 1;
    revokePage(pages[index]);
    setPages((currentPages) => currentPages.filter((_, pageIndex) => pageIndex !== index));
    setActiveIndex((current) => Math.max(0, Math.min(current > index ? current - 1 : current, nextLength - 1)));
  };

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPageOnA4(canvas, activePage, orientation);
  }, [activePage, orientation]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const updateCrop = (key: keyof CropRect, value: number) => {
    updateActivePage((page) => {
      const crop = { ...page.crop };
      if (key === 'x') crop.x = clamp(value, 0, 1 - crop.width);
      if (key === 'y') crop.y = clamp(value, 0, 1 - crop.height);
      if (key === 'width') {
        crop.width = clamp(value, 0.15, 1 - crop.x);
      }
      if (key === 'height') {
        crop.height = clamp(value, 0.15, 1 - crop.y);
      }
      return { ...page, crop };
    });
  };

  const autoCrop = async () => {
    if (!activePage) return;
    setIsAutoCropping(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 20));
    const crop = detectLocalCrop(activePage.image);
    updateActivePage((page) => ({ ...page, crop }));
    setIsAutoCropping(false);
    setNotice({ type: 'success', text: text.cropped });
  };

  const resetActivePage = () => {
    updateActivePage((page) => ({
      ...page,
      crop: { ...DEFAULT_CROP },
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      layout: { ...DEFAULT_LAYOUT },
    }));
    setNotice(null);
  };

  const rotateDocument = (amount: number) => {
    updateActivePage((page) => ({
      ...page,
      adjustments: { ...page.adjustments, rotation: (page.adjustments.rotation + amount + 360) % 360 },
    }));
  };

  const updateAdjustment = (key: keyof DocumentAdjustments, value: number | DocumentMode) => {
    updateActivePage((page) => ({
      ...page,
      adjustments: { ...page.adjustments, [key]: value } as DocumentAdjustments,
    }));
  };

  const updateLayout = (key: keyof PrintLayout, value: number) => {
    updateActivePage((page) => ({
      ...page,
      layout: { ...page.layout, [key]: value },
    }));
  };

  const applyLayoutToAll = () => {
    if (!activePage) return;
    const layout = { ...activePage.layout };
    setPages((currentPages) => currentPages.map((page) => ({ ...page, layout: { ...layout } })));
    setNotice({ type: 'success', text: text.ready });
  };

  const renderActiveCanvas = () => {
    const canvas = document.createElement('canvas');
    drawPageOnA4(canvas, activePage, orientation);
    return canvas;
  };

  const downloadPng = () => {
    if (!activePage) return;
    const canvas = renderActiveCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formatFileName(activePage.fileName)}-a4-print-ready.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice({ type: 'success', text: text.ready });
    }, 'image/png');
  };

  const downloadPdf = async () => {
    if (!pages.length) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const size = getA4Size(orientation);
      pages.forEach((page, index) => {
        if (index > 0) pdf.addPage('a4', orientation);
        const canvas = document.createElement('canvas');
        drawPageOnA4(canvas, page, orientation);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, size.widthMm, size.heightMm, undefined, 'FAST');
      });
      pdf.save('shebaflow-a4-print-ready.pdf');
      setNotice({ type: 'success', text: text.ready });
    } catch {
      setNotice({ type: 'error', text: text.loadError });
    } finally {
      setIsExporting(false);
    }
  };

  const printAll = () => {
    if (!pages.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNotice({ type: 'error', text: text.popupBlocked });
      return;
    }
    const images = pages.map((page) => {
      const canvas = document.createElement('canvas');
      drawPageOnA4(canvas, page, orientation);
      return canvas.toDataURL('image/png');
    });
    const pageCss = orientation === 'portrait'
      ? '@page { size: A4 portrait; margin: 0; } .page { width: 210mm; height: 297mm; }'
      : '@page { size: A4 landscape; margin: 0; } .page { width: 297mm; height: 210mm; }';
    const pagesMarkup = images.map((src) => `<img class="page" src="${src}" alt="A4 print page">`).join('');
    printWindow.document.write(`<!doctype html><html><head><title>${text.title}</title><style>html,body{margin:0;padding:0;background:#fff;}${pageCss}.page{display:block;page-break-after:always;break-after:page;}</style></head><body>${pagesMarkup}<script>window.onload=()=>window.print();</script></body></html>`);
    printWindow.document.close();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(Array.from(event.dataTransfer.files));
  };

  const physicalSize = activePage
    ? (() => {
        const sourceWidth = activePage.image.naturalWidth * activePage.crop.width;
        const sourceHeight = activePage.image.naturalHeight * activePage.crop.height;
        const ratio = sourceWidth / sourceHeight;
        const margin = activePage.layout.marginMm * PX_PER_MM;
        const availableWidth = pageSize.width - margin * 2;
        const availableHeight = pageSize.height - margin * 2;
        let width = availableWidth * (activePage.layout.widthPercent / 100);
        let height = width / ratio;
        if (height > availableHeight) {
          height = availableHeight * (activePage.layout.widthPercent / 100);
          width = height * ratio;
        }
        return {
          width: Number((width / PX_PER_MM).toFixed(1)),
          height: Number((height / PX_PER_MM).toFixed(1)),
        };
      })()
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ToolTopBar showBack />
      <main className="mx-auto max-w-[1760px] px-3 py-4 sm:px-5 sm:py-6">
        <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 shadow-2xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-amber-300" />
              <h1 className="truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">{text.title}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">{text.subtitle}</p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 sm:self-auto">
            <ScanLine className="h-4 w-4 text-teal-300" />
            {text.specification}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
          <aside className="order-2 space-y-4 xl:order-1">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-teal-300" />
                  <h2 className="text-sm font-extrabold text-white">{text.pageTray}</h2>
                </div>
                <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">{pages.length}</span>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal-400/60 bg-teal-400/5 px-3 py-3 text-xs font-bold text-teal-100 transition hover:bg-teal-400/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
                {hasPages ? text.addPages : text.upload}
              </button>
              <p className="mt-2 text-center text-[10px] text-slate-500">{text.imageOnly}</p>

              <div className="mt-4 space-y-2">
                {pages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">{text.noPages}</div>
                ) : pages.map((page, index) => (
                  <button
                    type="button"
                    key={page.id}
                    onClick={() => setActiveIndex(index)}
                    className={`group flex w-full items-center gap-2 rounded-xl border p-2 text-left transition ${index === activeIndex ? 'border-teal-400 bg-teal-400/10' : 'border-slate-800 bg-slate-950/45 hover:border-slate-700'}`}
                  >
                    <img src={page.url} alt="" className="h-11 w-9 rounded border border-slate-700 bg-white object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold text-slate-200">{text.page} {index + 1}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-500">{page.fileName}</span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        deletePage(index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          deletePage(index);
                        }
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300"
                      aria-label={`${text.delete} ${text.page} ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] leading-5 text-slate-400">
              <p className="flex items-center gap-2 font-bold text-slate-200"><Info className="h-4 w-4 text-teal-300" /> {isBangla ? 'গোপনীয়তা' : 'Privacy'}</p>
              <p className="mt-2">{text.privacy}</p>
            </section>
          </aside>

          <section className="order-1 flex min-h-[540px] flex-col rounded-2xl border border-slate-800 bg-[#111827] p-3 shadow-2xl shadow-slate-950/30 xl:order-2 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-sm font-extrabold text-white">{text.preview}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{pageSize.width} × {pageSize.height} px · A4 · 300 DPI</p>
              </div>
              {activePage && (
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setActiveIndex((index) => Math.max(0, index - 1))} disabled={activeIndex === 0} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 disabled:opacity-35" aria-label={text.previous}><ChevronLeft className="h-4 w-4" /></button>
                  <span className="rounded-lg bg-slate-900 px-2 py-1.5 text-[11px] font-bold text-slate-300">{activeIndex + 1} / {pages.length}</span>
                  <button type="button" onClick={() => setActiveIndex((index) => Math.min(pages.length - 1, index + 1))} disabled={activeIndex === pages.length - 1} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 disabled:opacity-35" aria-label={text.next}><ChevronRight className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            <div
              className={`relative flex min-h-[455px] flex-1 items-center justify-center overflow-auto rounded-xl border border-slate-800 p-4 ${isDragging ? 'bg-teal-400/10 ring-2 ring-teal-400' : 'bg-slate-950/55'}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <div className="relative mx-auto max-w-full">
                <canvas ref={canvasRef} className="block max-h-[64vh] max-w-full rounded-sm bg-white shadow-2xl" aria-label={text.preview} />
                {!hasPages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex min-h-[270px] w-full min-w-[220px] flex-col items-center justify-center gap-3 rounded-sm bg-slate-900/80 px-6 text-center transition hover:bg-slate-900/90"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200"><Upload className="h-7 w-7" /></span>
                    <span className="max-w-[280px] text-sm font-bold text-white">{text.dragDrop}</span>
                    <span className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-extrabold text-slate-950">{text.upload}</span>
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 px-1 text-center text-[11px] leading-5 text-slate-500">{text.privacy}</p>
          </section>

          <aside className="order-3 space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-teal-300" />
                <h2 className="text-sm font-extrabold text-white">{text.processing}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['normal', text.normal],
                  ['color', text.color],
                  ['grayscale', text.grayscale],
                  ['bw', text.bw],
                ] as [DocumentMode, string][]).map(([mode, label]) => (
                  <button
                    type="button"
                    key={mode}
                    disabled={!activePage}
                    onClick={() => updateAdjustment('mode', mode)}
                    className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${activePage?.adjustments.mode === mode ? 'border-teal-400 bg-teal-400/15 text-teal-100' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <StudioRange label={`${text.brightness} · ${activePage?.adjustments.brightness || 0}`} value={activePage?.adjustments.brightness || 0} min={-40} max={40} disabled={!activePage} onChange={(value) => updateAdjustment('brightness', value)} />
                <StudioRange label={`${text.contrast} · ${activePage?.adjustments.contrast || 0}`} value={activePage?.adjustments.contrast || 0} min={-45} max={70} disabled={!activePage} onChange={(value) => updateAdjustment('contrast', value)} />
                <StudioRange label={`${text.colorAmount} · ${activePage?.adjustments.saturation || 0}`} value={activePage?.adjustments.saturation || 0} min={-100} max={100} disabled={!activePage} onChange={(value) => updateAdjustment('saturation', value)} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-300" />
                <h2 className="text-sm font-extrabold text-white">{text.crop}</h2>
              </div>
              <p className="mb-3 text-[11px] leading-5 text-slate-400">{text.cropHint}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={!activePage || isAutoCropping} onClick={() => void autoCrop()} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-400/50 bg-teal-400/10 px-2 py-2.5 text-xs font-bold text-teal-100 transition hover:bg-teal-400/15 disabled:opacity-40">
                  {isAutoCropping ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {isAutoCropping ? text.cropLoading : text.autoCrop}
                </button>
                <button type="button" disabled={!activePage} onClick={() => updateActivePage((page) => ({ ...page, crop: { ...DEFAULT_CROP } }))} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-2 py-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 disabled:opacity-40">
                  <Maximize2 className="h-3.5 w-3.5" />
                  {text.resetCrop}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <StudioRange label={`${text.cropWidth} · ${Math.round((activePage?.crop.width || 1) * 100)}%`} value={activePage?.crop.width || 1} min={0.15} max={1} step={0.01} disabled={!activePage} onChange={(value) => updateCrop('width', value)} />
                <StudioRange label={`${text.cropHeight} · ${Math.round((activePage?.crop.height || 1) * 100)}%`} value={activePage?.crop.height || 1} min={0.15} max={1} step={0.01} disabled={!activePage} onChange={(value) => updateCrop('height', value)} />
                <StudioRange label={text.cropX} value={activePage?.crop.x || 0} min={0} max={Math.max(0, 1 - (activePage?.crop.width || 1))} step={0.01} disabled={!activePage} onChange={(value) => updateCrop('x', value)} />
                <StudioRange label={text.cropY} value={activePage?.crop.y || 0} min={0} max={Math.max(0, 1 - (activePage?.crop.height || 1))} step={0.01} disabled={!activePage} onChange={(value) => updateCrop('y', value)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" disabled={!activePage} onClick={() => rotateDocument(-90)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 py-2 text-[11px] font-bold text-slate-300 transition hover:border-slate-600 disabled:opacity-40"><RotateCcw className="h-3.5 w-3.5" />{text.rotateLeft}</button>
                <button type="button" disabled={!activePage} onClick={() => rotateDocument(90)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 py-2 text-[11px] font-bold text-slate-300 transition hover:border-slate-600 disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" />{text.rotateRight}</button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Move className="h-4 w-4 text-amber-300" />
                <h2 className="text-sm font-extrabold text-white">{text.layout}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['portrait', text.portrait],
                  ['landscape', text.landscape],
                ] as [A4Orientation, string][]).map(([value, label]) => (
                  <button type="button" key={value} onClick={() => setOrientation(value)} className={`rounded-xl border py-2.5 text-xs font-bold transition ${orientation === value ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}>{label}</button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: text.fitPage, scale: 92 },
                  { label: text.fullWidth, scale: 100 },
                  { label: text.halfPage, scale: 50 },
                ].map((preset) => (
                  <button type="button" key={preset.label} disabled={!activePage} onClick={() => updateActivePage((page) => ({ ...page, layout: { ...page.layout, widthPercent: preset.scale, x: 50, y: 50, rotation: 0 } }))} className="rounded-lg border border-slate-700 bg-slate-800 px-1 py-2 text-[10px] font-bold text-slate-300 transition hover:border-slate-600 disabled:opacity-40">{preset.label}</button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <StudioRange label={`${text.scale} · ${activePage?.layout.widthPercent || 0}%`} value={activePage?.layout.widthPercent || 0} min={20} max={100} disabled={!activePage} onChange={(value) => updateLayout('widthPercent', value)} />
                <StudioRange label={text.positionX} value={activePage?.layout.x || 50} min={5} max={95} disabled={!activePage} onChange={(value) => updateLayout('x', value)} />
                <StudioRange label={text.positionY} value={activePage?.layout.y || 50} min={5} max={95} disabled={!activePage} onChange={(value) => updateLayout('y', value)} />
                <StudioRange label={`${text.rotation} · ${activePage?.layout.rotation || 0}°`} value={activePage?.layout.rotation || 0} min={-180} max={180} step={1} disabled={!activePage} onChange={(value) => updateLayout('rotation', value)} />
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-slate-300">{text.margin}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {([0, 5, 10, 20] as const).map((margin) => (
                    <button type="button" disabled={!activePage} key={margin} onClick={() => updateLayout('marginMm', margin)} className={`rounded-lg border py-2 text-[10px] font-bold transition disabled:opacity-40 ${activePage?.layout.marginMm === margin ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}>{margin} mm</button>
                  ))}
                </div>
              </div>
              {physicalSize && <div className="mt-4 rounded-xl border border-teal-400/20 bg-teal-400/5 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-teal-200">{text.physicalSize}</p><p className="mt-1 text-sm font-extrabold text-white">{physicalSize.width} × {physicalSize.height} mm</p></div>}
              <button type="button" disabled={!activePage} onClick={applyLayoutToAll} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 disabled:opacity-40"><Check className="h-3.5 w-3.5 text-teal-300" />{text.applyAll}</button>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2"><Printer className="h-4 w-4 text-teal-300" /><h2 className="text-sm font-extrabold text-white">{text.output}</h2></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{text.fileFormat}</p><p className="mt-1 text-sm font-bold text-white">PNG · PDF · A4 300 DPI</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{text.fileInfo}</p></div>
              <div className="mt-3 grid gap-2">
                <button type="button" disabled={!activePage} onClick={downloadPng} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:from-teal-300 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4" />{text.downloadPng}</button>
                <button type="button" disabled={!hasPages || isExporting} onClick={() => void downloadPdf()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-400/50 bg-teal-400/10 px-4 py-3 text-sm font-extrabold text-teal-100 transition hover:bg-teal-400/15 disabled:cursor-not-allowed disabled:opacity-40">{isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}{isExporting ? text.exporting : text.downloadPdf}</button>
                <button type="button" disabled={!hasPages} onClick={printAll} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-extrabold text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><Printer className="h-4 w-4" />{text.printing}</button>
                <button type="button" disabled={!activePage} onClick={resetActivePage} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"><RefreshCw className="h-3.5 w-3.5" />{text.reset}</button>
              </div>
            </section>

            {notice && <div className={`rounded-2xl border p-3 text-xs leading-5 ${notice.type === 'success' ? 'border-teal-400/25 bg-teal-400/10 text-teal-100' : notice.type === 'error' ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-sky-400/25 bg-sky-400/10 text-sky-100'}`}>{notice.text}</div>}
          </aside>
        </div>
      </main>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleInputChange} />
    </div>
  );
}

type StudioRangeProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function StudioRange({ label, value, min, max, step = 1, disabled = false, onChange }: StudioRangeProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-300"><Palette className="h-3.5 w-3.5 text-teal-300" />{label}</span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-teal-400 disabled:cursor-not-allowed" />
    </label>
  );
}
