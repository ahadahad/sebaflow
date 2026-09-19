import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Crop, Eraser, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  Download, Upload, X, Check, Image as ImageIcon, Sparkles, Settings, Undo2, Redo2,
  ZoomIn, ZoomOut, Maximize2, Trash2, Printer, Save, Home, HelpCircle, Bell, User, Menu,
  Move, SlidersHorizontal, Palette, Layers, FileImage, AlertTriangle, Info, Copy
} from 'lucide-react';
import { getRemoveBgConfig, saveRemoveBgConfig, removeBackground as removeBgApi, type RemoveBgProvider } from '../lib/removeBg';
import { getTokenHarborConfig, saveTokenHarborConfig } from '../lib/tokenharbor';
import { passportSizes as defaultPassportSizes, type BgColor, type PassportSize, type FilterState, defaultFilter } from '../features/photo-studio/types/photoStudio';
import { buildFilterString, analyzeImageSmart, detectFaceBox } from '../features/photo-studio/utils/imageProcessing';
import { validateFile, getFileNameWithoutExt, generateExportName } from '../features/photo-studio/utils/validation';
import { canvasToBlob, downloadDataUrl, getExportFileName } from '../features/photo-studio/utils/exportImage';
import AiAssistantPanel from '../features/photo-studio/components/AiAssistantPanel';
import { executeAiOperations } from '../features/photo-studio/utils/aiExecutor';
import type { AiOperation } from '../features/photo-studio/types/aiAssistant';

// Extended bg colors
const bgSwatches: BgColor[] = [
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

const passportPresets = defaultPassportSizes;
const resizePresets = [
  { id: 'passport', label: 'Passport Photo', w: 400, h: 500 },
  { id: 'profile', label: 'Profile Photo', w: 500, h: 500 },
  { id: 'social-square', label: 'Social Square', w: 1080, h: 1080 },
  { id: 'fb-post', label: 'Facebook Post', w: 1200, h: 630 },
  { id: 'insta-post', label: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'insta-story', label: 'Instagram Story', w: 1080, h: 1920 },
  { id: 'yt-thumb', label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { id: 'bd-passport', label: 'BD Passport 40x50', w: 400, h: 500 },
  { id: 'in-visa', label: 'Indian Visa 35x35', w: 350, h: 350 },
];

type TrayImage = { id: string; src: string; name: string; width: number; height: number };
type CropBox = { x: number; y: number; w: number; h: number };
type HistoryEntry = {
  filter: FilterState;
  imgPos: { x: number; y: number; scale: number };
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  bgColor: BgColor;
  border: { enabled: boolean; color: string; thickness: number; radius: number };
  selectedSize: PassportSize;
};

export default function PassportStudio() {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Core image state
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [tray, setTray] = useState<TrayImage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // keep original for reference and undo
  useEffect(() => { if (activeImage && !originalImage) setOriginalImage(activeImage); }, [activeImage, originalImage]);

  // Editing state
  const [filter, setFilter] = useState<FilterState>({ ...defaultFilter });
  const [imgPos, setImgPos] = useState({ x: 0, y: 0, scale: 1 });
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [bgColor, setBgColor] = useState<BgColor>(bgSwatches[1]);
  const [customBg, setCustomBg] = useState('#ffffff');
  const [border, setBorder] = useState({ enabled: false, color: '#ffffff', thickness: 2, radius: 0 });
  const [selectedSize, setSelectedSize] = useState<PassportSize>(passportPresets[0]);
  const [customSize, setCustomSize] = useState({ w: 400, h: 500 });
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(true);

  // Crop
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [cropAspect, setCropAspect] = useState<string>('free');

  // Resize
  const [resizeW, setResizeW] = useState(400);
  const [resizeH, setResizeH] = useState(500);
  const [lockAspect, setLockAspect] = useState(true);

  // UI
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const [mobileTab, setMobileTab] = useState<'tools' | 'canvas' | 'background' | 'export'>('canvas');
  const [objectTab, setObjectTab] = useState<'object' | 'filters'>('filters');
  const [faceTab, setFaceTab] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [powerMode, setPowerMode] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Export
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState(90);
  const [fileName, setFileName] = useState(generateExportName());
  const [exportProgress, setExportProgress] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // History undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Processing & toasts
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // API settings
  const [apiKey, setApiKey] = useState(() => getRemoveBgConfig().apiKey || '');
  const [apiProvider, setApiProvider] = useState<RemoveBgProvider>(() => getRemoveBgConfig().provider);
  const [apiEndpoint, setApiEndpoint] = useState(() => getRemoveBgConfig().endpoint || '');
  const [thApiKey, setThApiKey] = useState(() => getTokenHarborConfig().apiKey || '');
  const [thModel, setThModel] = useState(() => getTokenHarborConfig().model || 'gpt-5.6-luna');
  const [thEndpoint, setThEndpoint] = useState(() => getTokenHarborConfig().endpoint || 'https://tokenharbor.ai/v1/chat/completions');
  const [thReasoning, setThReasoning] = useState(() => getTokenHarborConfig().reasoningEffort || 'medium');
  const [aiStatus, setAiStatus] = useState<any>(null);

  const t = (en: string, bn: string) => lang === 'bn' ? bn : en;

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch AI status when settings modal opens
  useEffect(() => {
    if (showApiSettings) {
      fetch('/api/ai/status')
        .then(r => r.json())
        .then(data => setAiStatus(data))
        .catch(() => setAiStatus({ status: 'AI Unavailable', configured: false }));
    }
  }, [showApiSettings]);

  // Save history snapshot
  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = {
      filter: { ...filter },
      imgPos: { ...imgPos },
      rotate,
      flipH,
      flipV,
      bgColor,
      border: { ...border },
      selectedSize,
    };
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, entry];
      if (next.length > 30) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
    setHasUnsaved(true);
  }, [filter, imgPos, rotate, flipH, flipV, bgColor, border, selectedSize, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    if (!entry) return;
    setFilter(entry.filter);
    setImgPos(entry.imgPos);
    setRotate(entry.rotate);
    setFlipH(entry.flipH);
    setFlipV(entry.flipV);
    setBgColor(entry.bgColor);
    setBorder(entry.border);
    setSelectedSize(entry.selectedSize);
    setHistoryIndex(i => i - 1);
    showToast(t('Undo', 'পূর্বাবস্থা'), 'info');
  }, [history, historyIndex, t]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    if (!entry) return;
    setFilter(entry.filter);
    setImgPos(entry.imgPos);
    setRotate(entry.rotate);
    setFlipH(entry.flipH);
    setFlipV(entry.flipV);
    setBgColor(entry.bgColor);
    setBorder(entry.border);
    setSelectedSize(entry.selectedSize);
    setHistoryIndex(i => i + 1);
    showToast(t('Redo', 'পুনরায়'), 'info');
  }, [history, historyIndex, t]);

  // Canvas drawing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = selectedSize.pxW;
    const h = selectedSize.pxH;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w * zoom}px`;
    canvas.style.height = `${h * zoom}px`;
    ctx.scale(dpr, dpr);

    // Background with checkerboard for transparent
    if (bgColor.hex === 'transparent') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      const size = 16;
      ctx.fillStyle = '#e2e8f0';
      for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
          if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) ctx.fillRect(x, y, size, size);
        }
      }
    } else {
      ctx.fillStyle = bgColor.hex;
      ctx.fillRect(0, 0, w, h);
    }

    // Filters
    ctx.filter = buildFilterString(filter);
    ctx.save();
    ctx.translate(w / 2 + imgPos.x, h / 2 + imgPos.y);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale((flipH ? -1 : 1) * imgPos.scale, (flipV ? -1 : 1) * imgPos.scale);
    const imgAspect = activeImage.width / activeImage.height;
    const canvasAspect = w / h;
    let drawW, drawH;
    if (imgAspect > canvasAspect) { drawH = h; drawW = drawH * imgAspect; }
    else { drawW = w; drawH = drawW / imgAspect; }
    ctx.drawImage(activeImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    ctx.filter = 'none';

    // Border
    if (border.enabled) {
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.thickness;
      if (border.radius > 0) {
        const r = Math.min(border.radius, w / 2, h / 2);
        ctx.beginPath();
        // @ts-ignore roundRect may not exist in all
        if (ctx.roundRect) ctx.roundRect(0, 0, w, h, r);
        else ctx.rect(0, 0, w, h);
        ctx.stroke();
      } else {
        ctx.strokeRect(border.thickness / 2, border.thickness / 2, w - border.thickness, h - border.thickness);
      }
    }

    // Passport guides
    if (showGuides && !cropMode) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
      ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(16,185,129,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.45, w * 0.28, h * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(251,191,36,0.9)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.38);
      ctx.lineTo(w * 0.8, h * 0.38);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Crop overlay - FIXED: draw 4 dimmed rects, don't clear image
    if (cropMode && cropBox) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, w, cropBox.y);
      ctx.fillRect(0, cropBox.y + cropBox.h, w, h - (cropBox.y + cropBox.h));
      ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
      ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, w - (cropBox.x + cropBox.w), cropBox.h);
      ctx.restore();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
      ctx.setLineDash([]);
      const handles = [
        { x: cropBox.x, y: cropBox.y },
        { x: cropBox.x + cropBox.w, y: cropBox.y },
        { x: cropBox.x, y: cropBox.y + cropBox.h },
        { x: cropBox.x + cropBox.w, y: cropBox.y + cropBox.h },
      ];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      handles.forEach(hd => {
        ctx.fillRect(hd.x - 5, hd.y - 5, 10, 10);
        ctx.strokeRect(hd.x - 5, hd.y - 5, 10, 10);
      });
    }

    // Face box - drawn after crop so always visible
    if (faceBox) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(faceBox.x * w, faceBox.y * h, faceBox.w * w, faceBox.h * h);
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('FACE', faceBox.x * w + 4, Math.max(10, faceBox.y * h - 6));
    }
  }, [activeImage, filter, imgPos, rotate, flipH, flipV, bgColor, border, selectedSize, zoom, showGuides, cropMode, cropBox, faceBox]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // Handle upload
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    const errors: string[] = [];
    Array.from(files).forEach(f => {
      const v = validateFile(f);
      if (v.valid) validFiles.push(f);
      else if (v.error) errors.push(v.error);
    });
    if (errors.length) showToast(errors[0], 'error');
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const id = Date.now().toString() + Math.random().toString(36).slice(2);
          const trayItem: TrayImage = { id, src, name: file.name, width: img.width, height: img.height };
          setTray(prev => [...prev, trayItem].slice(-20));
          if (!activeImage) {
            setActiveImage(img);
            setOriginalImage(img);
            setActiveId(id);
            setFileName(getFileNameWithoutExt(file.name));
            setImgPos({ x: 0, y: -img.height * 0.02, scale: img.width > 1000 ? 1.15 : 1.25 });
            setResizeW(img.width);
            setResizeH(img.height);
            pushHistory();
          }
        };
        img.onerror = () => showToast(t('Corrupt image', 'ছবি নষ্ট'), 'error');
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const selectTrayImage = (item: TrayImage) => {
    const img = new Image();
    img.onload = () => {
      setActiveImage(img);
      setOriginalImage(img);
      setActiveId(item.id);
      setImgPos({ x: 0, y: 0, scale: 1 });
      setFilter({ ...defaultFilter });
      setRotate(0);
      setFlipH(false);
      setFlipV(false);
      setFileName(getFileNameWithoutExt(item.name));
      setResizeW(img.width);
      setResizeH(img.height);
      showToast(t('Image selected', 'ছবি নির্বাচিত'), 'success');
    };
    img.src = item.src;
  };

  const removeTrayImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasUnsaved && !confirm(t('Delete image with unsaved changes?', 'অসংরক্ষিত পরিবর্তন সহ মুছবেন?'))) return;
    setTray(prev => prev.filter(i => i.id !== id));
    if (activeId === id) {
      setActiveImage(null);
      setOriginalImage(null);
      setActiveId(null);
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Canvas interactions
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropDrag, setCropDrag] = useState<null | 'move' | 'nw' | 'ne' | 'sw' | 'se'>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!activeImage || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (selectedSize.pxW / rect.width);
    const y = (e.clientY - rect.top) * (selectedSize.pxH / rect.height);

    if (cropMode && cropBox) {
      const th = 14;
      if (Math.abs(x - cropBox.x) < th && Math.abs(y - cropBox.y) < th) setCropDrag('nw');
      else if (Math.abs(x - (cropBox.x + cropBox.w)) < th && Math.abs(y - cropBox.y) < th) setCropDrag('ne');
      else if (Math.abs(x - cropBox.x) < th && Math.abs(y - (cropBox.y + cropBox.h)) < th) setCropDrag('sw');
      else if (Math.abs(x - (cropBox.x + cropBox.w)) < th && Math.abs(y - (cropBox.y + cropBox.h)) < th) setCropDrag('se');
      else if (x > cropBox.x && x < cropBox.x + cropBox.w && y > cropBox.y && y < cropBox.y + cropBox.h) setCropDrag('move');
      else setCropDrag(null);
      setDragStart({ x, y });
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - imgPos.x, y: e.clientY - imgPos.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (cropMode && cropDrag && cropBox && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (selectedSize.pxW / rect.width);
      const y = (e.clientY - rect.top) * (selectedSize.pxH / rect.height);
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      let nb = { ...cropBox };
      if (cropDrag === 'move') {
        nb.x = Math.max(0, Math.min(selectedSize.pxW - nb.w, cropBox.x + dx));
        nb.y = Math.max(0, Math.min(selectedSize.pxH - nb.h, cropBox.y + dy));
      } else if (cropDrag === 'se') {
        nb.w = Math.max(40, Math.min(selectedSize.pxW - cropBox.x, cropBox.w + dx));
        nb.h = Math.max(40, Math.min(selectedSize.pxH - cropBox.y, cropBox.h + dy));
        if (cropAspect !== 'free') {
          const ratio = getAspectRatio(cropAspect);
          if (ratio) nb.h = nb.w / ratio;
        }
      } else if (cropDrag === 'sw') {
        const newW = Math.max(40, cropBox.w - dx);
        nb.x = cropBox.x + cropBox.w - newW;
        nb.w = newW;
        nb.h = Math.max(40, Math.min(selectedSize.pxH - cropBox.y, cropBox.h + dy));
        if (cropAspect !== 'free') {
          const ratio = getAspectRatio(cropAspect);
          if (ratio) nb.h = nb.w / ratio;
        }
      } else if (cropDrag === 'ne') {
        nb.w = Math.max(40, Math.min(selectedSize.pxW - cropBox.x, cropBox.w + dx));
        const newH = Math.max(40, cropBox.h - dy);
        nb.y = cropBox.y + cropBox.h - newH;
        nb.h = newH;
        if (cropAspect !== 'free') {
          const ratio = getAspectRatio(cropAspect);
          if (ratio) nb.w = nb.h * ratio;
        }
      } else if (cropDrag === 'nw') {
        const newW = Math.max(40, cropBox.w - dx);
        const newH = Math.max(40, cropBox.h - dy);
        nb.x = cropBox.x + cropBox.w - newW;
        nb.y = cropBox.y + cropBox.h - newH;
        nb.w = newW;
        nb.h = newH;
        if (cropAspect !== 'free') {
          const ratio = getAspectRatio(cropAspect);
          if (ratio) nb.w = nb.h * ratio;
        }
      }
      setCropBox(nb);
      setDragStart({ x, y });
      return;
    }
    if (!isDragging) return;
    setImgPos(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleCanvasMouseUp = () => {
    if (isDragging) pushHistory();
    setIsDragging(false);
    setCropDrag(null);
  };

  const getAspectRatio = (aspect: string): number | null => {
    switch (aspect) {
      case '1:1': return 1;
      case '4:5': return 4 / 5;
      case '3:4': return 3 / 4;
      case '4:3': return 4 / 3;
      case '16:9': return 16 / 9;
      case 'passport': return selectedSize.w / selectedSize.h;
      default: return null;
    }
  };

  const startCrop = () => {
    if (!activeImage) { showToast(t('Upload image first', 'আগে ছবি আপলোড করুন'), 'error'); return; }
    setCropMode(true);
    const w = selectedSize.pxW;
    const h = selectedSize.pxH;
    // centered box 80%
    setCropBox({ x: w * 0.1, y: h * 0.1, w: w * 0.8, h: h * 0.8 });
    setShowGuides(true);
  };

  const applyCrop = () => {
    if (!activeImage || !cropBox) return;
    try {
      const w = selectedSize.pxW;
      const h = selectedSize.pxH;
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = w;
      fullCanvas.height = h;
      const fCtx = fullCanvas.getContext('2d');
      if (!fCtx) throw new Error('Canvas error');
      if (bgColor.hex === 'transparent') {
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 0, w, h);
        const size = 16;
        fCtx.fillStyle = '#e2e8f0';
        for (let y = 0; y < h; y += size) {
          for (let x = 0; x < w; x += size) {
            if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) fCtx.fillRect(x, y, size, size);
          }
        }
      } else {
        fCtx.fillStyle = bgColor.hex;
        fCtx.fillRect(0, 0, w, h);
      }
      fCtx.filter = buildFilterString(filter);
      fCtx.save();
      fCtx.translate(w / 2 + imgPos.x, h / 2 + imgPos.y);
      fCtx.rotate((rotate * Math.PI) / 180);
      fCtx.scale((flipH ? -1 : 1) * imgPos.scale, (flipV ? -1 : 1) * imgPos.scale);
      const imgAspect = activeImage.width / activeImage.height;
      const canvasAspect = w / h;
      let drawW, drawH;
      if (imgAspect > canvasAspect) { drawH = h; drawW = drawH * imgAspect; }
      else { drawW = w; drawH = drawW / imgAspect; }
      fCtx.drawImage(activeImage, -drawW / 2, -drawH / 2, drawW, drawH);
      fCtx.restore();
      fCtx.filter = 'none';
      if (border.enabled) {
        fCtx.strokeStyle = border.color;
        fCtx.lineWidth = border.thickness;
        fCtx.strokeRect(0, 0, w, h);
      }
      const cropW = Math.round(cropBox.w);
      const cropH = Math.round(cropBox.h);
      const cropX = Math.round(cropBox.x);
      const cropY = Math.round(cropBox.y);
      if (cropW < 10 || cropH < 10) {
        showToast(t('Crop too small', 'ক্রপ অনেক ছোট'), 'error');
        return;
      }
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropW;
      tempCanvas.height = cropH;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) throw new Error('Canvas error');
      tCtx.drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const newImg = new Image();
      newImg.onload = () => {
        setActiveImage(newImg);
        setOriginalImage(newImg);
        setCropMode(false);
        setCropBox(null);
        setImgPos({ x: 0, y: 0, scale: 1 });
        setSelectedSize({ ...selectedSize, pxW: cropW, pxH: cropH });
        setResizeW(cropW);
        setResizeH(cropH);
        pushHistory();
        showToast(t('Crop applied', 'ক্রপ প্রয়োগ হয়েছে'), 'success');
      };
      newImg.onerror = () => showToast('Crop failed', 'error');
      newImg.src = tempCanvas.toDataURL('image/png');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Crop failed', 'error');
    }
  };

  const cancelCrop = () => {
    setCropMode(false);
    setCropBox(null);
  };

  const handleRemoveBg = async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = activeImage.width;
      tempCanvas.height = activeImage.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) throw new Error('Canvas error');
      tCtx.drawImage(activeImage, 0, 0);
      const imageSrc = tempCanvas.toDataURL('image/png');
      const config = getRemoveBgConfig();
      let resultUrl: string;
      if (config.provider === 'mock') {
        // Local/demo fallback clearly marked
        setBgColor(bgSwatches[1]);
        setSuggestion({ method: 'Local BG Remove (Demo) ⚠️', confidence: 75, tips: ['✅ White background applied (demo fallback)', '💡 Set API key in settings for real AI removal', 'Please verify: this is NOT AI-powered unless API connected'] });
        setIsProcessing(false);
        showToast(t('Demo background removed - white applied', 'ডেমো বিজি রিমুভ - সাদা প্রয়োগ'), 'info');
        return;
      }
      resultUrl = await removeBgApi(imageSrc, config);
      const newImg = new Image();
      newImg.crossOrigin = 'anonymous';
      newImg.onload = () => {
        setActiveImage(newImg);
        setBgColor(bgSwatches[0]); // transparent
        setImgPos({ x: 0, y: 0, scale: 1 });
        setIsProcessing(false);
        pushHistory();
        showToast(t('Background removed', 'ব্যাকগ্রাউন্ড রিমুভ হয়েছে'), 'success');
      };
      newImg.onerror = () => { throw new Error('Failed to load'); };
      newImg.src = resultUrl;
    } catch (err: any) {
      setBgColor(bgSwatches[1]);
      setSuggestion({ method: 'Local BG (Fallback) ⚠️', confidence: 70, tips: ['✅ White BG applied (fallback)', `Note: ${err.message?.substring(0, 80)}`, 'Set API key for real AI'] });
      setIsProcessing(false);
      showToast(err.message || 'Remove BG failed', 'error');
    }
  };

  const handleAutoEnhance = () => {
    if (!activeImage) return;
    setIsProcessing(true);
    setTimeout(() => {
      const analysis = analyzeImageSmart(activeImage);
      if (!analysis) { setIsProcessing(false); return; }
      setFilter(prev => ({
        ...prev,
        brightness: analysis.brightness ? Math.min(140, Math.max(60, prev.brightness + analysis.brightness)) : prev.brightness,
        contrast: analysis.contrast ? Math.min(140, Math.max(60, prev.contrast + analysis.contrast)) : prev.contrast,
        saturation: analysis.saturation ? Math.min(140, Math.max(40, prev.saturation + analysis.saturation)) : prev.saturation,
      }));
      setSuggestion({ method: `AI Enhance 🤖 ${analysis.score}%`, confidence: analysis.score, tips: analysis.tips });
      setIsProcessing(false);
      pushHistory();
      showToast(t('Auto enhanced', 'অটো ইনহ্যান্স'), 'success');
    }, 600);
  };

  const handleDetectFace = async () => {
    if (!activeImage) return;
    const fb = await detectFaceBox(activeImage) as any;
    setFaceBox({ x: fb.x, y: fb.y, w: fb.w, h: fb.h });
    setFaceDetected(true);
    const isFallback = fb.method?.includes('Auto Center');
    showToast(isFallback ? t('Face area centered (adjust if needed)', 'মুখের এলাকা কেন্দ্রে রাখা হয়েছে') : t('Face detected', 'মুখ শনাক্ত'), 'success');
  };

  const handleApplyAiOperations = (operations: AiOperation[]) => {
    if (!operations.length) return;
    try {
      const result = executeAiOperations(operations, {
        filter,
        rotate,
        flipH,
        flipV,
        bgColor,
        border,
        selectedSize,
        resizeW,
        resizeH,
        customBg,
      });

      if (result.newState.filter) setFilter(result.newState.filter);
      if (result.newState.rotate !== undefined) setRotate(result.newState.rotate);
      if (result.newState.flipH !== undefined) setFlipH(result.newState.flipH);
      if (result.newState.flipV !== undefined) setFlipV(result.newState.flipV);
      if (result.newState.bgColor) setBgColor(result.newState.bgColor);
      if (result.newState.border) setBorder(result.newState.border);
      if (result.newState.selectedSize) setSelectedSize(result.newState.selectedSize);
      if (result.newState.resizeW !== undefined) setResizeW(result.newState.resizeW);
      if (result.newState.resizeH !== undefined) setResizeH(result.newState.resizeH);
      if (result.newState.customBg) setCustomBg(result.newState.customBg);

      if (result.applied.length > 0) {
        showToast(t(`Applied ${result.applied.length} AI edits`, `${result.applied.length}টি AI এডিট প্রয়োগ`), 'success');
        setHasUnsaved(true);
      }
      if (result.unsupported.length > 0) {
        showToast(t(`${result.unsupported.length} unsupported`, `${result.unsupported.length}টি অসমর্থিত`), 'info');
      }
      if (result.errors.length > 0) {
        console.warn('AI executor errors:', result.errors);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to apply AI edits', 'error');
    }
  };

  const handleResizeApply = () => {
    if (resizeW <= 0 || resizeH <= 0) { showToast(t('Invalid dimensions', 'অবৈধ মাপ'), 'error'); return; }
    if (resizeW > 5000 || resizeH > 5000) { showToast(t('Too large max 5000', 'অনেক বড়'), 'error'); return; }
    setSelectedSize(prev => ({ ...prev, pxW: resizeW, pxH: resizeH, w: resizeW / 10, h: resizeH / 10 }));
    setCustomSize({ w: resizeW, h: resizeH });
    pushHistory();
    showToast(t('Resized', 'রিসাইজ হয়েছে'), 'success');
  };

  const handleExport = async () => {
    if (!activeImage || !canvasRef.current) { showToast(t('No image', 'ছবি নেই'), 'error'); return; }
    if (exportFormat === 'jpg' && bgColor.hex === 'transparent') {
      if (!confirm(t('JPG does not support transparency. White background will be used. Continue?', 'JPG স্বচ্ছতা সমর্থন করে না। সাদা ব্যাকগ্রাউন্ড ব্যবহার হবে। চালিয়ে যাবেন?'))) return;
    }
    setExportProgress(true);
    try {
      // Create final export canvas with actual size
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = selectedSize.pxW;
      finalCanvas.height = selectedSize.pxH;
      const fCtx = finalCanvas.getContext('2d');
      if (!fCtx) throw new Error('Canvas error');

      // Draw same as main canvas but at final size without zoom
      if (bgColor.hex === 'transparent' && exportFormat !== 'jpg') {
        // checker not needed for export, keep transparent
        fCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
      } else {
        fCtx.fillStyle = bgColor.hex === 'transparent' ? '#ffffff' : bgColor.hex;
        fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      }

      fCtx.filter = buildFilterString(filter);
      fCtx.save();
      fCtx.translate(finalCanvas.width / 2 + imgPos.x, finalCanvas.height / 2 + imgPos.y);
      fCtx.rotate((rotate * Math.PI) / 180);
      fCtx.scale((flipH ? -1 : 1) * imgPos.scale, (flipV ? -1 : 1) * imgPos.scale);
      const imgAspect = activeImage.width / activeImage.height;
      const canvasAspect = finalCanvas.width / finalCanvas.height;
      let drawW, drawH;
      if (imgAspect > canvasAspect) { drawH = finalCanvas.height; drawW = drawH * imgAspect; }
      else { drawW = finalCanvas.width; drawH = drawW / imgAspect; }
      fCtx.drawImage(activeImage, -drawW / 2, -drawH / 2, drawW, drawH);
      fCtx.restore();
      fCtx.filter = 'none';

      if (border.enabled) {
        fCtx.strokeStyle = border.color;
        fCtx.lineWidth = border.thickness;
        fCtx.strokeRect(0, 0, finalCanvas.width, finalCanvas.height);
      }

      const blob = await canvasToBlob(finalCanvas, exportFormat, exportQuality);
      const url = URL.createObjectURL(blob);
      const finalName = getExportFileName(fileName.trim() || generateExportName(), exportFormat);
      downloadDataUrl(url, finalName);
      setExportSuccess(finalName);
      setHasUnsaved(false);
      showToast(t('Exported successfully', 'সফলভাবে এক্সপোর্ট'), 'success');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      showToast(e.message || 'Export failed', 'error');
    } finally {
      setExportProgress(false);
    }
  };

  const handleReset = () => {
    if (hasUnsaved && !confirm(t('Reset? Unsaved changes will be lost', 'রিসেট? অসংরক্ষিত পরিবর্তন হারাবে'))) return;
    setFilter({ ...defaultFilter });
    setImgPos({ x: 0, y: 0, scale: 1 });
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    setBorder({ enabled: false, color: '#ffffff', thickness: 2, radius: 0 });
    setBgColor(bgSwatches[1]);
    setCropMode(false);
    setCropBox(null);
    setFaceBox(null);
    setSuggestion(null);
    setHistory([]);
    setHistoryIndex(-1);
    setHasUnsaved(false);
    showToast(t('Reset done', 'রিসেট হয়েছে'), 'info');
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const win = window.open('');
    if (!win) return;
    win.document.write(`<img src="${canvasRef.current.toDataURL()}" style="max-width:100%">`);
    win.print();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await canvasToBlob(canvasRef.current, 'png', 100);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast(t('Copied to clipboard', 'ক্লিপবোর্ডে কপি'), 'success');
    } catch {
      showToast(t('Copy not supported', 'কপি সমর্থিত নয়'), 'error');
    }
  };

  // Unsaved warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  // Keyboard accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); handleExport(); }
      }
      if (e.key === 'Delete' && activeImage) {
        if (confirm(t('Delete image?', 'ছবি মুছবেন?'))) {
          setActiveImage(null);
          setOriginalImage(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, activeImage, t]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans">
      {/* Top Navigation - ShebaFlow branding */}
      <header className="h-[64px] sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 gap-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center font-black text-[#0f172a] text-sm">S</div>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-black text-[18px] tracking-tight hidden sm:block">ShebaFlow</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <Link to="/" className="px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"><Home size={14} /> {t('Home', 'হোম')}</Link>
            <Link to="/services" className="px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800">{t('Services', 'সেবা')}</Link>
            <span className="px-3 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white">{t('Photo Studio', 'ফটো স্টুডিও')}</span>
            <Link to="/contact" className="px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"><HelpCircle size={14} /> {t('Help', 'সহায়তা')}</Link>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">{t('Photo Studio', 'ফটো স্টুডিও')}</span>
            <button onClick={() => setPowerMode(!powerMode)} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${powerMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${powerMode ? 'bg-emerald-400' : 'bg-slate-500'}`} /> {powerMode ? t('POWER ON', 'পাওয়ার অন') : t('Standard Mode', 'স্ট্যান্ডার্ড')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-800 p-1">
            <button onClick={undo} disabled={historyIndex < 0} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-30"><Undo2 size={14} /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-30"><Redo2 size={14} /></button>
            <button onClick={handleReset} title="Reset" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"><RotateCcw size={14} /></button>
            <button onClick={handleAutoEnhance} disabled={!activeImage || isProcessing} title="Auto Enhance" className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-30"><Sparkles size={14} /></button>
          </div>
          <button onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')} className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-400">{lang === 'bn' ? 'EN' : 'বাং'}</button>
          <button className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"><Bell size={16} /></button>
          <button className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"><User size={16} /></button>
          <button onClick={handlePrint} title="Print" className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"><Printer size={16} /></button>
          <button onClick={handleExport} disabled={!activeImage} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-500 disabled:opacity-40"><Download size={14} /> {t('Download', 'ডাউনলোড')}</button>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300"><Menu size={16} /></button>
        </div>
      </header>

      {showMobileMenu && (
        <div className="lg:hidden bg-[#162032] border-b border-slate-800 p-3 flex flex-col gap-2">
          <Link to="/" className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">Home</Link>
          <Link to="/services" className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">Services</Link>
          <span className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Photo Studio</span>
          <div className="flex gap-2 pt-2">
            <button onClick={undo} className="flex-1 rounded-lg bg-slate-800 py-2 text-xs">Undo</button>
            <button onClick={redo} className="flex-1 rounded-lg bg-slate-800 py-2 text-xs">Redo</button>
            <button onClick={handleReset} className="flex-1 rounded-lg bg-slate-800 py-2 text-xs">Reset</button>
          </div>
        </div>
      )}

      {/* Mobile Tabs */}
      <div className="lg:hidden flex gap-1 p-2 bg-[#162032] border-b border-slate-800 overflow-x-auto">
        {[
          { id: 'tools', label: t('Tools', 'টুলস'), icon: SlidersHorizontal },
          { id: 'canvas', label: t('Canvas', 'ক্যানভাস'), icon: ImageIcon },
          { id: 'background', label: t('Background', 'ব্যাকগ্রাউন্ড'), icon: Palette },
          { id: 'export', label: t('Export', 'এক্সপোর্ট'), icon: FileImage },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMobileTab(tab.id as any)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${mobileTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="flex flex-1 min-h-[calc(100vh-64px)] flex-col lg:flex-row">
        {/* Left Panel */}
        <div className={`w-full lg:w-[300px] shrink-0 border-r border-slate-800 bg-[#162032] flex-col overflow-y-auto max-h-[calc(100vh-64px)] lg:flex ${mobileTab === 'tools' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="p-4 flex flex-col gap-4">
            {/* Primary Actions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('Primary Actions', 'প্রধান কাজ')}</span>
                <button onClick={() => setShowApiSettings(true)} className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-400 border border-slate-700"><Settings size={12} /> API</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={startCrop} disabled={!activeImage} className="flex items-center justify-center gap-2 rounded-xl bg-teal-900/40 border border-teal-700/30 text-teal-300 px-3 py-3 text-xs font-semibold hover:bg-teal-800/50 disabled:opacity-40"><Crop size={14} /> {t('Crop', 'ক্রপ')}</button>
                <button onClick={handleRemoveBg} disabled={!activeImage || isProcessing} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900/40 border border-emerald-700/30 text-emerald-300 px-3 py-3 text-xs font-semibold hover:bg-emerald-800/50 disabled:opacity-40"><Eraser size={14} /> {isProcessing ? '...' : t('Remove BG', 'বিজি রিমুভ')}</button>
                <button onClick={() => setMobileTab('background')} className="flex items-center justify-center gap-2 rounded-xl bg-violet-900/40 border border-violet-700/30 text-violet-300 px-3 py-3 text-xs font-semibold"><Move size={14} /> {t('Resize', 'রিসাইজ')}</button>
                <button onClick={handleAutoEnhance} disabled={!activeImage || isProcessing} className="flex items-center justify-center gap-2 rounded-xl bg-amber-900/40 border border-amber-700/30 text-amber-300 px-3 py-3 text-xs font-semibold disabled:opacity-40"><Sparkles size={14} /> {t('Enhance', 'ইনহ্যান্স')}</button>
                <button onClick={() => { setRotate(r => r - 90); pushHistory(); }} disabled={!activeImage} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-slate-300 px-3 py-2.5 text-xs hover:bg-slate-700 disabled:opacity-40"><RotateCcw size={14} /> 90°</button>
                <button onClick={() => { setRotate(r => r + 90); pushHistory(); }} disabled={!activeImage} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-slate-300 px-3 py-2.5 text-xs hover:bg-slate-700 disabled:opacity-40"><RotateCw size={14} /> 90°</button>
                <button onClick={() => { setFlipH(v => !v); pushHistory(); }} disabled={!activeImage} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-slate-300 px-3 py-2.5 text-xs hover:bg-slate-700 disabled:opacity-40"><FlipHorizontal size={14} /> {t('Flip H', 'উল্টান')}</button>
                <button onClick={() => { setFlipV(v => !v); pushHistory(); }} disabled={!activeImage} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-slate-300 px-3 py-2.5 text-xs hover:bg-slate-700 disabled:opacity-40"><FlipVertical size={14} /> {t('Flip V', 'উল্টান')}</button>
              </div>
              {cropMode && (
                <div className="mt-3 rounded-xl bg-slate-800 p-3 flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-slate-300">{t('Crop Mode', 'ক্রপ মোড')} - {t('Drag handles to resize', 'হ্যান্ডেল টেনে সাইজ করুন')}</div>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { id: 'free', label: 'Free' },
                      { id: '1:1', label: '1:1' },
                      { id: '4:5', label: '4:5' },
                      { id: '3:4', label: '3:4' },
                      { id: '4:3', label: '4:3' },
                      { id: '16:9', label: '16:9' },
                      { id: 'passport', label: 'Passport' },
                    ].map(a => (
                      <button key={a.id} onClick={() => setCropAspect(a.id)} className={`px-2.5 py-1 rounded-full text-[11px] ${cropAspect === a.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{a.label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={applyCrop} className="rounded-lg bg-emerald-600 text-white py-2 text-xs font-bold">Apply</button>
                    <button onClick={cancelCrop} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant Panel - TokenHarbor Integration */}
            <AiAssistantPanel
              hasImage={!!activeImage}
              imageMetadata={activeImage ? { width: activeImage.width, height: activeImage.height, mimeType: 'image/png' } : undefined}
              currentEditState={{
                brightness: filter.brightness,
                contrast: filter.contrast,
                saturation: filter.saturation,
                rotation: rotate,
                flipHorizontal: flipH,
                flipVertical: flipV,
                backgroundColor: bgColor.hex,
              }}
              onApplyOperations={handleApplyAiOperations}
              onPushHistory={pushHistory}
              onOpenSettings={() => setShowApiSettings(true)}
              t={t}
              lang={lang}
            />

            {/* Suggestion */}
            {suggestion && (
              <div className="rounded-xl bg-emerald-900/20 border border-emerald-700/30 p-3">
                <div className="text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1"><Crop size={12} /> {suggestion.method} {suggestion.confidence ? `• ${suggestion.confidence}%` : ''}</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">{Array.isArray(suggestion.tips) ? suggestion.tips.join(' • ') : suggestion.tips}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSuggestion(null)} className="text-[10px] bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">Dismiss</button>
                  <button onClick={handleReset} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full">Reset</button>
                </div>
              </div>
            )}

            {/* Passport Sizes */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('Passport Size', 'পাসপোর্ট সাইজ')} - BD/IN</div>
              <div className="grid gap-1 max-h-[200px] overflow-y-auto pr-1">
                {passportPresets.map(s => (
                  <button key={s.id} onClick={() => { setSelectedSize(s); setResizeW(s.pxW); setResizeH(s.pxH); pushHistory(); }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-[11px] text-left ${selectedSize.id === s.id ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}>
                    <span className="font-semibold">{lang === 'bn' ? s.bn : s.label} {s.country && <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-slate-600">{s.country}</span>}</span>
                    <span className="text-[9px] opacity-70">{lang === 'bn' ? s.bnDesc : s.desc}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowCustomSize(!showCustomSize)} className="mt-2 text-[11px] text-blue-400 hover:text-blue-300">+ {t('Custom Size', 'কাস্টম সাইজ')}</button>
              {showCustomSize && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="number" value={customSize.w} onChange={e => setCustomSize({ ...customSize, w: Number(e.target.value) })} className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" placeholder="W mm" />
                  <input type="number" value={customSize.h} onChange={e => setCustomSize({ ...customSize, h: Number(e.target.value) })} className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" placeholder="H mm" />
                  <button onClick={() => { const ns: PassportSize = { id: `custom-${customSize.w}x${customSize.h}`, label: `${customSize.w}x${customSize.h} mm`, bn: `${customSize.w}x${customSize.h} মিমি`, w: customSize.w, h: customSize.h, pxW: customSize.w * 10, pxH: customSize.h * 10, desc: 'Custom', bnDesc: 'কাস্টম' }; setSelectedSize(ns); }} className="col-span-2 rounded-lg bg-blue-600 text-white py-1.5 text-xs">Apply Custom</button>
                </div>
              )}
              <div className="mt-2 text-[10px] text-amber-300/70 bg-amber-900/20 border border-amber-700/20 rounded-lg p-2">
                ⚠️ {t('Please verify the required photo specifications before submission.', 'জমা দেওয়ার আগে প্রয়োজনীয় ছবির স্পেসিফিকেশন যাচাই করুন।')}
              </div>
            </div>

            {/* Object / Filters Tabs */}
            <div className="flex gap-2">
              <button onClick={() => setObjectTab('object')} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${objectTab === 'object' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Layers size={12} /> {t('Object', 'অবজেক্ট')}</button>
              <button onClick={() => setObjectTab('filters')} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${objectTab === 'filters' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}><SlidersHorizontal size={12} /> {t('Filters', 'ফিল্টার')}</button>
            </div>

            {objectTab === 'object' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'face', label: t('Face', 'মুখ') },
                    { id: 'skin', label: t('Skin', 'ত্বক') },
                    { id: 'hair', label: t('Hair', 'চুল') },
                    { id: 'subject', label: t('Subject', 'বিষয়') },
                    { id: 'background', label: t('Background', 'ব্যাকগ্রাউন্ড') },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => { const next = faceTab === tab.id ? null : tab.id; setFaceTab(next); if (next && ['face','skin','hair'].includes(tab.id)) handleDetectFace(); if (!next) setFaceBox(null); }} className={`flex flex-col items-center gap-1 rounded-xl p-3 text-[11px] border ${faceTab === tab.id ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                      <span className="text-sm">{tab.id === 'face' ? '😊' : tab.id === 'skin' ? '🧑' : tab.id === 'hair' ? '💇' : tab.id === 'subject' ? '🎯' : '🖼️'}</span>{tab.label}
                      {faceTab === tab.id && faceDetected && <span className="text-[9px]">✅</span>}
                    </button>
                  ))}
                </div>
                {faceTab && (
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    {['face', 'skin', 'hair'].includes(faceTab) ? (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-amber-300 capitalize">{faceTab} {faceDetected ? '✅' : ''}</div>
                        <div className="text-[11px] text-slate-400">{t('Face detection uses browser FaceDetector API with fallback. Adjust manually if needed.', 'মুখ শনাক্তকরণ ব্রাউজার API ব্যবহার করে।')}</div>
                        <div className="flex gap-2">
                          <button onClick={handleDetectFace} className="flex-1 rounded-lg bg-amber-600 text-white py-1.5 text-xs">Detect Face</button>
                          <button onClick={() => setFaceBox(null)} className="flex-1 rounded-lg bg-slate-700 text-slate-300 py-1.5 text-xs">Clear</button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 p-3 text-[11px] text-amber-200 flex gap-2">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span>This feature will be connected to AI processing in the next version.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 space-y-3">
                {[
                  { k: 'brightness', label: t('Brightness', 'উজ্জ্বলতা'), min: 0, max: 200 },
                  { k: 'contrast', label: t('Contrast', 'কনট্রাস্ট'), min: 0, max: 200 },
                  { k: 'saturation', label: t('Saturation', 'স্যাচুরেশন'), min: 0, max: 200 },
                  { k: 'exposure', label: t('Exposure', 'এক্সপোজার'), min: -50, max: 50 },
                  { k: 'blur', label: t('Blur', 'ব্লার'), min: 0, max: 20 },
                  { k: 'grayscale', label: t('Grayscale', 'গ্রেস্কেল'), min: 0, max: 100 },
                  { k: 'sepia', label: t('Sepia', 'সেপিয়া'), min: 0, max: 100 },
                  { k: 'hue', label: t('Hue Rotate', 'হিউ'), min: -180, max: 180 },
                  { k: 'vivid', label: t('Vivid', 'ভিভিড'), min: 0, max: 100 },
                  { k: 'warm', label: t('Warm', 'উষ্ণ'), min: 0, max: 100 },
                  { k: 'sharpness', label: t('Sharpness', 'শার্পনেস'), min: 0, max: 100 },
                ].map(f => (
                  <div key={f.k}>
                    <div className="flex justify-between text-[11px] mb-1"><span className="text-slate-300">{f.label}</span><span className="text-slate-400">{(filter as any)[f.k]}{f.k === 'hue' ? '°' : f.k === 'blur' ? 'px' : '%'}</span></div>
                    <input type="range" min={f.min} max={f.max} value={(filter as any)[f.k]} onChange={e => { setFilter(prev => ({ ...prev, [f.k]: Number(e.target.value) })); setHasUnsaved(true); }} className="w-full accent-cyan-500 h-1" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button onClick={() => { setFilter({ ...defaultFilter }); setHasUnsaved(true); }} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">{t('Original', 'আসল')}</button>
                  <button onClick={handleReset} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">{t('Reset', 'রিসেট')}</button>
                  <button onClick={() => { pushHistory(); showToast(t('Applied', 'প্রয়োগ হয়েছে'), 'success'); }} className="rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold">{t('Apply', 'প্রয়োগ')}</button>
                </div>
              </div>
            )}

            {/* Resize Tool */}
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
              <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-widest">{t('Resize', 'রিসাইজ')}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">{t('Width', 'প্রস্থ')}</label>
                  <input type="number" value={resizeW} onChange={e => { const v = Number(e.target.value); setResizeW(v); if (lockAspect && activeImage) setResizeH(Math.round(v * (activeImage.height / activeImage.width))); }} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">{t('Height', 'উচ্চতা')}</label>
                  <input type="number" value={resizeH} onChange={e => { const v = Number(e.target.value); setResizeH(v); if (lockAspect && activeImage) setResizeW(Math.round(v * (activeImage.width / activeImage.height))); }} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 cursor-pointer"><input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} className="rounded" /> {t('Lock aspect ratio', 'অনুপাত লক')}</label>
              {activeImage && <div className="mt-2 text-[10px] text-slate-500">{t('Current', 'বর্তমান')}: {activeImage.width}x{activeImage.height} • {t('Canvas', 'ক্যানভাস')}: {selectedSize.pxW}x{selectedSize.pxH}</div>}
              <div className="mt-2 flex flex-wrap gap-1">
                {resizePresets.map(p => (
                  <button key={p.id} onClick={() => { setResizeW(p.w); setResizeH(p.h); }} className="px-2 py-1 rounded-full bg-slate-700 text-[10px] text-slate-300 hover:bg-slate-600">{p.label}</button>
                ))}
              </div>
              <button onClick={handleResizeApply} className="mt-3 w-full rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold">{t('Apply Resize', 'রিসাইজ প্রয়োগ')}</button>
            </div>

            <Link to="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 mt-auto pt-4"><X size={14} /> {t('Back to ShebaFlow', 'শেবা ফ্লোতে ফিরুন')}</Link>
          </div>
        </div>

        {/* Center Canvas */}
        <div className={`flex-1 flex flex-col bg-[#1e293b] min-w-0 ${mobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'}`}>
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
            {!activeImage ? (
              <div className="w-full max-w-[640px] rounded-2xl border border-slate-700 bg-[#2a364e] p-8 flex flex-col items-center gap-4 shadow-2xl min-h-[500px] justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400"><Upload size={28} /></div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">{t('Upload your photo', 'আপনার ছবি আপলোড করুন')}</h3>
                  <p className="text-slate-400 text-sm mt-1">{t('Drag and drop an image here', 'এখানে ছবি টেনে আনুন')}</p>
                  <p className="text-slate-500 text-xs mt-1">{t('Supported formats: JPG, PNG, WebP', 'সমর্থিত: JPG, PNG, WebP')} • Max 20MB</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20">{t('Upload image', 'ছবি আপলোড করুন')}</button>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 text-[10px] text-slate-500 text-center w-full">
                  <div className="rounded-lg bg-slate-800/50 p-2">40x50mm<br />BD Passport</div>
                  <div className="rounded-lg bg-slate-800/50 p-2">35x35mm<br />Indian Visa</div>
                  <div className="rounded-lg bg-slate-800/50 p-2">2x2 inch<br />US Visa</div>
                  <div className="rounded-lg bg-slate-800/50 p-2">1080x1080<br />Social</div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative rounded-xl overflow-hidden bg-[#0f172a] shadow-2xl border border-white/10">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    onWheel={e => { e.preventDefault(); setZoom(z => Math.max(0.2, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1)))); }}
                    className="block max-w-[90vw] lg:max-w-[600px] max-h-[65vh] cursor-move select-none"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Move size={12} /> {t('Drag to move • Scroll to zoom', 'টেনে সরান • স্ক্রল জুম')}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1">{selectedSize.label} • {selectedSize.pxW}x{selectedSize.pxH}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-800/80 backdrop-blur rounded-full px-4 py-2 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <ZoomOut size={14} className="text-slate-400" />
                    <input type="range" min={0.2} max={3} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-20 accent-blue-500" />
                    <ZoomIn size={14} className="text-slate-400" />
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <button onClick={() => setZoom(1)} className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"><Maximize2 size={12} /> {t('Reset view', 'ভিউ রিসেট')}</button>
                  <button onClick={() => { setZoom(1); setImgPos({ x: 0, y: 0, scale: 1 }); }} className="text-[11px] text-slate-300 hover:text-white">{t('Fit', 'ফিট')}</button>
                  <button onClick={() => { if (confirm(t('Delete image?', 'ছবি মুছবেন?'))) { setActiveImage(null); setOriginalImage(null); } }} className="w-7 h-7 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center hover:bg-red-800"><Trash2 size={12} /></button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`w-full lg:w-[320px] shrink-0 border-l border-slate-800 bg-[#162032] flex-col overflow-y-auto max-h-[calc(100vh-64px)] gap-5 p-4 ${mobileTab === 'background' || mobileTab === 'export' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Image Tray */}
          <div className={mobileTab === 'export' ? 'hidden lg:block' : 'block'}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-semibold text-slate-200 flex items-center gap-2"><ImageIcon size={14} /> {t('Image Tray', 'ছবির ট্রে')}</span>
              <span className="text-[10px] text-slate-500">{tray.length}/20</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-600/10 text-blue-400 text-[10px] hover:bg-blue-600/20"><Upload size={16} /> {t('Add', 'যোগ')}</button>
              {tray.map(img => (
                <div key={img.id} className="relative group">
                  <button onClick={() => selectTrayImage(img)} className={`aspect-square w-full overflow-hidden rounded-xl border-2 ${activeId === img.id ? 'border-emerald-500' : 'border-slate-700'} bg-slate-800 p-0 hover:border-slate-500`}>
                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                  </button>
                  <button onClick={(e) => removeTrayImage(img.id, e)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                  {activeId === img.id && <div className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] px-1 py-0.5 rounded-full">Active</div>}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-500 mt-2">{t('Click to select • Hover to remove', 'ক্লিক করে নির্বাচন • হোভার করে মুছুন')}</div>
          </div>

          {/* Background */}
          <div className={mobileTab === 'export' ? 'hidden lg:block' : 'block'}>
            <div className="text-[13px] font-semibold text-slate-200 mb-3 flex items-center gap-2"><Palette size={14} /> {t('Background', 'ব্যাকগ্রাউন্ড')}</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {bgSwatches.map(c => (
                <button key={c.id} onClick={() => { setBgColor(c); pushHistory(); }} title={c.name} className={`w-8 h-8 rounded-lg border-2 ${bgColor.id === c.id ? 'border-white scale-110' : 'border-transparent'} shadow-md transition-all flex items-center justify-center overflow-hidden`} style={{ background: c.hex === 'transparent' ? 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%)' : c.hex }}>
                  {c.id === 'transparent' && <span className="text-[8px] font-bold text-slate-600">T</span>}
                </button>
              ))}
              <input type="color" value={customBg} onChange={e => { setCustomBg(e.target.value); setBgColor({ id: 'custom', hex: e.target.value, name: 'Custom', bn: 'কাস্টম' }); }} className="w-8 h-8 rounded-lg border-2 border-slate-700 bg-transparent cursor-pointer" title="Custom picker" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => bgFileInputRef.current?.click()} className="flex-1 rounded-lg bg-slate-800 border border-slate-700 py-2 text-[11px] text-slate-300">{t('Upload BG', 'বিজি আপলোড')}</button>
              <button onClick={() => { setBgColor(bgSwatches[1]); pushHistory(); }} className="flex-1 rounded-lg bg-slate-800 border border-slate-700 py-2 text-[11px] text-slate-300">{t('Reset BG', 'রিসেট')}</button>
            </div>
            <div className="mt-3 rounded-xl bg-slate-800 border border-slate-700 p-3">
              <div className="text-[11px] font-semibold text-slate-300 mb-2">{t('Border', 'বর্ডার')}</div>
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer"><input type="checkbox" checked={border.enabled} onChange={e => { setBorder({ ...border, enabled: e.target.checked }); pushHistory(); }} /> {t('Enable border', 'বর্ডার চালু')}</label>
              {border.enabled && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input type="color" value={border.color} onChange={e => setBorder({ ...border, color: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-600" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-400">{t('Thickness', 'পুরুত্ব')} {border.thickness}px</div>
                      <input type="range" min={1} max={20} value={border.thickness} onChange={e => setBorder({ ...border, thickness: Number(e.target.value) })} className="w-full accent-blue-500" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('Radius', 'গোল')} {border.radius}px</div>
                    <input type="range" min={0} max={50} value={border.radius} onChange={e => setBorder({ ...border, radius: Number(e.target.value) })} className="w-full accent-blue-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export */}
          <div className={`rounded-xl bg-slate-800 border border-slate-700 p-4 ${mobileTab === 'background' ? 'hidden lg:block' : 'block'}`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><FileImage size={12} /> {t('Export', 'এক্সপোর্ট')}</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">{t('File Name', 'ফাইলের নাম')}</label>
                <input value={fileName} onChange={e => setFileName(e.target.value)} className="w-full mt-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none" placeholder="shebaflow-photo" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">{t('Format', 'ফরম্যাট')}</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {(['png', 'jpg', 'webp'] as const).map(fmt => (
                    <button key={fmt} onClick={() => setExportFormat(fmt)} className={`rounded-lg py-2 text-xs font-semibold border ${exportFormat === fmt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{fmt.toUpperCase()}</button>
                  ))}
                </div>
                {exportFormat === 'jpg' && bgColor.hex === 'transparent' && (
                  <div className="mt-2 flex gap-1.5 rounded-lg bg-amber-900/30 border border-amber-700/30 p-2 text-[10px] text-amber-200"><AlertTriangle size={12} className="shrink-0" /> {t('JPG does not support transparency', 'JPG স্বচ্ছতা সমর্থন করে না')}</div>
                )}
              </div>
              {(exportFormat === 'jpg' || exportFormat === 'webp') && (
                <div>
                  <div className="flex justify-between text-[11px]"><span className="text-slate-400">{t('Quality', 'গুণমান')}</span><span className="text-slate-300">{exportQuality}%</span></div>
                  <input type="range" min={10} max={100} value={exportQuality} onChange={e => setExportQuality(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">{t('Final Width', 'চূড়ান্ত প্রস্থ')}</label>
                  <div className="text-xs text-white font-mono">{selectedSize.pxW}px</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">{t('Final Height', 'চূড়ান্ত উচ্চতা')}</label>
                  <div className="text-xs text-white font-mono">{selectedSize.pxH}px</div>
                </div>
              </div>
              <button onClick={handleExport} disabled={!activeImage || exportProgress} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 text-sm font-bold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 flex items-center justify-center gap-2">
                {exportProgress ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Download size={16} />}
                {exportProgress ? t('Exporting...', 'এক্সপোর্ট হচ্ছে...') : `${t('Export', 'এক্সপোর্ট')} ${exportFormat.toUpperCase()}`}
              </button>
              {exportSuccess && <div className="rounded-lg bg-emerald-900/30 border border-emerald-700/30 p-2 text-[11px] text-emerald-300 flex items-center gap-1.5"><Check size={12} /> {exportSuccess} ✓</div>}
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={handlePrint} disabled={!activeImage} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-[11px] flex items-center justify-center gap-1 disabled:opacity-40"><Printer size={12} /> {t('Print', 'প্রিন্ট')}</button>
                <button onClick={handleCopy} disabled={!activeImage} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-[11px] flex items-center justify-center gap-1 disabled:opacity-40"><Copy size={12} /> {t('Copy', 'কপি')}</button>
                <button onClick={() => { setActiveImage(null); setTray([]); setFileName(generateExportName()); setHasUnsaved(false); }} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-[11px] flex items-center justify-center gap-1"><Trash2 size={12} /> {t('New', 'নতুন')}</button>
              </div>
              <div className="text-[10px] text-slate-500 text-center">{selectedSize.label} • 300 DPI • {exportFormat.toUpperCase()} • {fileName}.{exportFormat}</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2"><ImageIcon size={14} /> {t('Passport Tips', 'পাসপোর্ট টিপস')}</div>
            <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <li className="flex gap-1.5"><Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> {t('Face 70-80% centered, eyes 50-60% from top', 'মুখ ৭০-৮০% কেন্দ্রে, চোখ ৫০-৬০% উপরে')}</li>
              <li className="flex gap-1.5"><Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> {t('White/light blue background, no shadows', 'সাদা/হালকা নীল ব্যাকগ্রাউন্ড, ছায়া নেই')}</li>
              <li className="flex gap-1.5"><Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> 300 DPI {t('for print, neutral expression', 'প্রিন্টের জন্য, নিরপেক্ষ অভিব্যক্তি')}</li>
            </ul>
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleReset} className="rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-xs text-slate-400 hover:bg-slate-700">{t('Reset Workspace', 'ওয়ার্কস্পেস রিসেট')}</button>
              <button onClick={handleExport} disabled={!activeImage} className="rounded-xl bg-blue-600 text-white py-2.5 text-xs font-bold hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center gap-1"><Save size={12} /> {t('Save', 'সেভ')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white border border-slate-700'}`}>
          {toast.type === 'error' ? <AlertTriangle size={14} /> : toast.type === 'success' ? <Check size={14} /> : <Info size={14} />} {toast.msg}
        </div>
      )}

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowApiSettings(false)}>
          <div className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#162032] border border-slate-700 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={18} /> API Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Remove BG & TokenHarbor - offline fallback available</p>
              </div>
              <button onClick={() => setShowApiSettings(false)} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              {/* TokenHarbor AI */}
              <div className="rounded-xl bg-violet-900/10 border border-violet-800/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-violet-300 flex items-center gap-2"><Sparkles size={14} /> TokenHarbor AI — gpt-5.6-luna</div>
                  {aiStatus && (
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${aiStatus.configured ? 'bg-emerald-900/30 border-emerald-700/30 text-emerald-300' : 'bg-amber-900/20 border-amber-700/30 text-amber-300'}`}>
                      {aiStatus.configured ? '● Connected' : '○ Not configured'} • {aiStatus.model || thModel}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400">API Key (thk_live_...) — Stored locally in browser, never in code</label>
                    <div className="relative mt-1">
                      <input type="password" value={thApiKey} onChange={e => setThApiKey(e.target.value)} placeholder="thk_live_..." className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white pr-10" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {thApiKey && <button onClick={() => setThApiKey('')} className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center"><X size={12} /></button>}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Get from <a href="https://tokenharbor.ai/dashboard" target="_blank" className="text-violet-400 hover:underline">tokenharbor.ai/dashboard</a> — One key for OpenAI, Anthropic, Gemini, etc.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Model</label>
                      <select value={thModel} onChange={e => setThModel(e.target.value)} className="w-full mt-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white">
                        <option value="gpt-5.6-luna">gpt-5.6-luna 🌙 NEW</option>
                        <option value="gpt-5.6">gpt-5.6</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Reasoning Effort</label>
                      <select value={thReasoning} onChange={e => setThReasoning(e.target.value as any)} className="w-full mt-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white">
                        <option value="none">none</option>
                        <option value="low">low</option>
                        <option value="medium">medium (default)</option>
                        <option value="high">high</option>
                        <option value="xhigh">xhigh</option>
                        <option value="max">max</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Endpoint (optional custom backend to hide key)</label>
                    <input type="text" value={thEndpoint} onChange={e => setThEndpoint(e.target.value)} placeholder="https://tokenharbor.ai/v1/chat/completions" className="w-full mt-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" />
                    <div className="text-[10px] text-slate-500 mt-1">Leave default for direct TokenHarbor, or use <code className="bg-slate-800 px-1 rounded">/api/ai/photo-assistant</code> for secure backend.</div>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5 text-[11px] text-slate-400">
                    <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1"><Info size={12} /> How it works (secure)</div>
                    <ul className="space-y-1 list-disc pl-4 text-[10px]">
                      <li><b className="text-violet-300">Server-only (recommended):</b> Set <code className="bg-slate-700 px-1 rounded">TOKEN_HARBOR_API_KEY</code> in <code className="bg-slate-700 px-1 rounded">.env</code> on server — never exposed to browser</li>
                      <li><b className="text-amber-300">Browser (dev convenience):</b> Paste key here — stored in <code className="bg-slate-700 px-1 rounded">localStorage</code>, sent to <code className="bg-slate-700 px-1 rounded">/api/ai/photo-assistant</code> as header, not in JS bundle</li>
                      <li>AI only returns JSON operations, never executes code. Local Canvas editor applies changes.</li>
                      <li>Offline: If AI unavailable, you can still edit manually.</li>
                    </ul>
                  </div>
                  {aiStatus && !aiStatus.configured && (
                    <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 p-2.5 text-[11px] text-amber-200">
                      ⚠️ {aiStatus.status || 'Not configured'} — Set API key in .env (server) or here (browser) to enable AI. Local editing works offline.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-900/10 border border-emerald-800/30 p-4">
                <div className="text-sm font-bold text-emerald-300 mb-3">Remove BG Provider</div>
                <select value={apiProvider} onChange={e => setApiProvider(e.target.value as any)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white">
                  <option value="mock">Mock — White bg (Offline Demo) ✅ Offline</option>
                  <option value="imgly">imgly — FREE AI (needs npm install)</option>
                  <option value="removebg">remove.bg — API key required</option>
                  <option value="custom">Custom Backend</option>
                </select>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API key (if needed)" className="w-full mt-3 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white" />
                {(apiProvider === 'custom' || apiProvider === 'removebg') && (
                  <input type="text" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="https://your-api.com/remove-bg" className="w-full mt-2 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white" />
                )}
                <div className="mt-3 text-[11px] text-slate-400">Basic editing (crop, resize, rotate, filters, bg color, border, export) works <b className="text-emerald-400">fully offline</b> after app loads. No external API needed.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  saveRemoveBgConfig({ apiKey, provider: apiProvider, endpoint: apiEndpoint });
                  saveTokenHarborConfig({ apiKey: thApiKey, model: thModel, endpoint: thEndpoint, reasoningEffort: thReasoning as any });
                  // Also save to secure backend via localStorage for frontend to send as header
                  if (thApiKey) localStorage.setItem('shebaflow_th_key', thApiKey);
                  else localStorage.removeItem('shebaflow_th_key');
                  setShowApiSettings(false);
                  showToast('API settings saved', 'success');
                  // Refresh AI status
                  fetch('/api/ai/status').then(r=>r.json()).then(d=>setAiStatus(d)).catch(()=>{});
                }} className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-bold">💾 Save & Close</button>
                <button onClick={() => setShowApiSettings(false)} className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm text-slate-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      <input ref={bgFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { const src = ev.target?.result as string; setBgColor({ id: 'bg-image', hex: `url(${src})`, name: 'Image', bn: 'ছবি', style: `url(${src})` }); }; r.readAsDataURL(f); }} />

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        @media (max-width: 1024px) {
          div[style*="display: flex"][style*="min-height: calc(100vh - 64px)"] { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
