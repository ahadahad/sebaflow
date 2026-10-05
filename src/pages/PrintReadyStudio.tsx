import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  Check,
  Download,
  FileImage,
  IdCard,
  ImagePlus,
  Info,
  LayoutTemplate,
  Printer,
  RefreshCw,
  RotateCw,
  ScanLine,
  Upload,
  X,
} from 'lucide-react';
import ToolTopBar from '../components/ToolTopBar';
import { useLanguage } from '../lib/i18n';

export type PrintStudioMode = 'passport' | 'nid' | 'a4';

type PrintReadyStudioProps = {
  mode: PrintStudioMode;
};

type LoadedImage = {
  image: HTMLImageElement;
  url: string;
  fileName: string;
};

type ImageTarget = 'main' | 'front' | 'back';
type A4Orientation = 'portrait' | 'landscape';
type A4Fit = 'contain' | 'cover';
type Notice = { type: 'success' | 'error'; text: string } | null;

const DPI = 300;
const PX_PER_MM = DPI / 25.4;
const A4_PORTRAIT = { width: 2480, height: 3508 };
const PASSPORT_WIDTH = Math.round(40 * PX_PER_MM);
const PASSPORT_HEIGHT = Math.round(50 * PX_PER_MM);
const NID_WIDTH = Math.round(85.6 * PX_PER_MM);
const NID_HEIGHT = Math.round(53.98 * PX_PER_MM);

function drawImageWithin(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  fit: A4Fit,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  const scale = fit === 'cover'
    ? sourceRatio > targetRatio ? height / image.naturalHeight : width / image.naturalWidth
    : sourceRatio > targetRatio ? width / image.naturalWidth : height / image.naturalHeight;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawCropMarks(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const mark = 24;
  const gap = 8;
  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - gap - mark, y);
  ctx.lineTo(x - gap, y);
  ctx.moveTo(x, y - gap - mark);
  ctx.lineTo(x, y - gap);
  ctx.moveTo(x + width + gap, y);
  ctx.lineTo(x + width + gap + mark, y);
  ctx.moveTo(x + width, y - gap - mark);
  ctx.lineTo(x + width, y - gap);
  ctx.moveTo(x - gap - mark, y + height);
  ctx.lineTo(x - gap, y + height);
  ctx.moveTo(x, y + height + gap);
  ctx.lineTo(x, y + height + gap + mark);
  ctx.moveTo(x + width + gap, y + height);
  ctx.lineTo(x + width + gap + mark, y + height);
  ctx.moveTo(x + width, y + height + gap);
  ctx.lineTo(x + width, y + height + gap + mark);
  ctx.stroke();
  ctx.restore();
}

function drawPassportImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
  rotation: number,
) {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * baseScale * zoom;
  const drawHeight = image.naturalHeight * baseScale * zoom;
  ctx.save();
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function formatFileName(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'image';
}

export default function PrintReadyStudio({ mode }: PrintReadyStudioProps) {
  const { lang } = useLanguage();
  const isBangla = lang === 'bn';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef(new Set<string>());

  const [mainImage, setMainImage] = useState<LoadedImage | null>(null);
  const [frontImage, setFrontImage] = useState<LoadedImage | null>(null);
  const [backImage, setBackImage] = useState<LoadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [passportBackground, setPassportBackground] = useState('#ffffff');
  const [passportZoom, setPassportZoom] = useState(1);
  const [passportX, setPassportX] = useState(0);
  const [passportY, setPassportY] = useState(0);
  const [passportRotation, setPassportRotation] = useState(0);

  const [nidCopies, setNidCopies] = useState<1 | 2 | 4>(1);
  const [a4Orientation, setA4Orientation] = useState<A4Orientation>('portrait');
  const [a4Fit, setA4Fit] = useState<A4Fit>('contain');
  const [a4Margin, setA4Margin] = useState<0 | 10 | 20>(10);

  const text = isBangla
    ? {
        allTools: 'সব টুল',
        upload: 'ছবি আপলোড করুন',
        replace: 'ছবি পরিবর্তন করুন',
        front: 'সামনের দিক',
        back: 'পেছনের দিক',
        optional: 'ঐচ্ছিক',
        fileReady: 'ফাইল প্রস্তুত',
        dragDrop: 'ছবি টেনে আনুন অথবা ক্লিক করে নির্বাচন করুন',
        imageOnly: 'JPG, PNG, WEBP ছবি ব্যবহার করুন',
        chooseImage: 'ছবি বেছে নিন',
        edit: 'সেটিংস',
        output: 'আউটপুট',
        download: 'PNG ডাউনলোড',
        print: 'প্রিন্ট করুন',
        reset: 'সেটিংস রিসেট',
        privacy: 'আপনার ছবি শুধু এই ব্রাউজারেই থাকে। কোনো সার্ভারে আপলোড করা হয় না।',
        preview: 'প্রিন্ট প্রিভিউ',
        noImage: 'প্রিভিউ দেখতে একটি ছবি আপলোড করুন',
        frontBackHelp: 'এনআইডির সামনে ও পেছনের ছবি আলাদা করে আপলোড করুন। শুধু একটি দিক থাকলেও শিট তৈরি করা যাবে।',
        imageInvalid: 'শুধু ছবি ফাইল আপলোড করুন।',
        loadError: 'ছবিটি খোলা যায়নি। অন্য একটি ছবি ব্যবহার করুন।',
        ready: 'প্রিন্ট-রেডি ফাইল তৈরি হয়েছে।',
        popupBlocked: 'প্রিন্ট উইন্ডো খোলা যায়নি। ব্রাউজারের পপ-আপ অনুমতি দিন।',
        showGuide: 'A4 পেজে আসল প্রিন্ট সাইজ ও ক্রপ মার্ক দেখা যাচ্ছে।',
        copies: 'কপি',
        orientation: 'পেজের দিক',
        portrait: 'পোর্ট্রেট',
        landscape: 'ল্যান্ডস্কেপ',
        layout: 'লেআউট',
        fit: 'ফিট করুন',
        fullBleed: 'পুরো পেজ ভরুন',
        margin: 'মার্জিন',
        noMargin: 'মার্জিন নেই',
        background: 'ব্যাকগ্রাউন্ড',
        white: 'সাদা',
        lightBlue: 'হালকা নীল',
        paleBlue: 'ফিকে নীল',
        zoom: 'জুম',
        moveLeftRight: 'ডানে / বামে সরান',
        moveUpDown: 'উপরে / নিচে সরান',
        rotate: 'ঘোরান',
        passportSpec: '৪০ × ৫০ মিমি • ৩০০ DPI',
        nidSpec: '৮৫.৬ × ৫৪ মিমি প্রতিটি কার্ড • A4 • ৩০০ DPI',
        a4Spec: 'A4 • ৩০০ DPI',
        passportTitle: 'পাসপোর্ট ছবি',
        passportSub: '৪০ × ৫০ মিমি পাসপোর্ট ছবি তৈরি করুন',
        nidTitle: 'এনআইডি প্রিন্ট রেডি',
        nidSub: 'A4 শিটে সঠিক কার্ড সাইজে এনআইডি সাজান',
        a4Title: 'A4 প্রিন্ট রেডি',
        a4Sub: 'ছবি বা ডকুমেন্টকে পরিষ্কার A4 প্রিন্টে প্রস্তুত করুন',
      }
    : {
        allTools: 'All tools',
        upload: 'Upload image',
        replace: 'Replace image',
        front: 'Front side',
        back: 'Back side',
        optional: 'optional',
        fileReady: 'File ready',
        dragDrop: 'Drop an image here, or click to choose one',
        imageOnly: 'Use a JPG, PNG, or WEBP image',
        chooseImage: 'Choose image',
        edit: 'Settings',
        output: 'Output',
        download: 'Download PNG',
        print: 'Print now',
        reset: 'Reset settings',
        privacy: 'Your image stays in this browser. Nothing is uploaded to a server.',
        preview: 'Print preview',
        noImage: 'Upload an image to see the preview',
        frontBackHelp: 'Upload the front and back of the NID separately. You can still make a sheet with one side only.',
        imageInvalid: 'Please upload an image file only.',
        loadError: 'This image could not be opened. Please try another one.',
        ready: 'Your print-ready file has been created.',
        popupBlocked: 'The print window could not open. Please allow browser pop-ups.',
        showGuide: 'The A4 page shows actual print size and crop marks.',
        copies: 'Copies',
        orientation: 'Page orientation',
        portrait: 'Portrait',
        landscape: 'Landscape',
        layout: 'Layout',
        fit: 'Fit image',
        fullBleed: 'Fill page',
        margin: 'Margin',
        noMargin: 'No margin',
        background: 'Background',
        white: 'White',
        lightBlue: 'Light blue',
        paleBlue: 'Pale blue',
        zoom: 'Zoom',
        moveLeftRight: 'Move left / right',
        moveUpDown: 'Move up / down',
        rotate: 'Rotate',
        passportSpec: '40 × 50 mm • 300 DPI',
        nidSpec: '85.6 × 54 mm each card • A4 • 300 DPI',
        a4Spec: 'A4 • 300 DPI',
        passportTitle: 'Passport Image',
        passportSub: 'Make a 40 × 50 mm passport image',
        nidTitle: 'NID Print Ready',
        nidSub: 'Place NID cards at the correct size on A4',
        a4Title: 'A4 Print Ready',
        a4Sub: 'Prepare an image or document for a sharp A4 print',
      };

  const title = mode === 'passport' ? text.passportTitle : mode === 'nid' ? text.nidTitle : text.a4Title;
  const subtitle = mode === 'passport' ? text.passportSub : mode === 'nid' ? text.nidSub : text.a4Sub;
  const specification = mode === 'passport' ? text.passportSpec : mode === 'nid' ? text.nidSpec : text.a4Spec;
  const hasOutput = mode === 'nid' ? Boolean(frontImage || backImage) : Boolean(mainImage);
  const outputDimensions = mode === 'passport'
    ? { width: PASSPORT_WIDTH, height: PASSPORT_HEIGHT }
    : mode === 'nid' || a4Orientation === 'portrait'
      ? A4_PORTRAIT
      : { width: A4_PORTRAIT.height, height: A4_PORTRAIT.width };

  const revokeImage = useCallback((image: LoadedImage | null) => {
    if (image && objectUrlsRef.current.has(image.url)) {
      URL.revokeObjectURL(image.url);
      objectUrlsRef.current.delete(image.url);
    }
  }, []);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  const setImageForTarget = useCallback((target: ImageTarget, next: LoadedImage) => {
    if (target === 'main') {
      setMainImage((current) => {
        revokeImage(current);
        return next;
      });
    } else if (target === 'front') {
      setFrontImage((current) => {
        revokeImage(current);
        return next;
      });
    } else {
      setBackImage((current) => {
        revokeImage(current);
        return next;
      });
    }
  }, [revokeImage]);

  const loadFile = useCallback((file: File, target: ImageTarget) => {
    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', text: text.imageInvalid });
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    const image = new Image();
    image.onload = () => {
      setImageForTarget(target, { image, url, fileName: file.name });
      setNotice({ type: 'success', text: text.fileReady });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
      setNotice({ type: 'error', text: text.loadError });
    };
    image.src = url;
  }, [setImageForTarget, text.fileReady, text.imageInvalid, text.loadError]);

  const onInputChange = useCallback((event: ChangeEvent<HTMLInputElement>, target: ImageTarget) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file, target);
    event.target.value = '';
  }, [loadFile]);

  const openPicker = (target: ImageTarget) => {
    const input = target === 'main' ? mainInputRef.current : target === 'front' ? frontInputRef.current : backInputRef.current;
    input?.click();
  };

  const clearImage = (target: ImageTarget) => {
    if (target === 'main') {
      setMainImage((current) => {
        revokeImage(current);
        return null;
      });
    } else if (target === 'front') {
      setFrontImage((current) => {
        revokeImage(current);
        return null;
      });
    } else {
      setBackImage((current) => {
        revokeImage(current);
        return null;
      });
    }
    setNotice(null);
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = mode === 'passport'
      ? PASSPORT_WIDTH
      : mode === 'nid' || a4Orientation === 'portrait'
        ? A4_PORTRAIT.width
        : A4_PORTRAIT.height;
    const height = mode === 'passport'
      ? PASSPORT_HEIGHT
      : mode === 'nid' || a4Orientation === 'portrait'
        ? A4_PORTRAIT.height
        : A4_PORTRAIT.width;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mode === 'passport') {
      ctx.fillStyle = passportBackground;
      ctx.fillRect(0, 0, width, height);
      if (mainImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
        drawPassportImage(ctx, mainImage.image, width, height, passportZoom, passportX, passportY, passportRotation);
        ctx.restore();
      }
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (mode === 'nid') {
      const sourceCards = [
        ...(frontImage ? [{ image: frontImage, label: 'FRONT' }] : []),
        ...(backImage ? [{ image: backImage, label: 'BACK' }] : []),
      ];
      const cards = Array.from({ length: nidCopies }, () => sourceCards).flat();
      const columns = 2;
      const rows = Math.max(1, Math.ceil(cards.length / columns));
      const gapX = 120;
      const gapY = 150;
      const totalWidth = columns * NID_WIDTH + gapX;
      const totalHeight = rows * NID_HEIGHT + (rows - 1) * gapY;
      const startX = (width - totalWidth) / 2;
      const startY = (height - totalHeight) / 2;

      cards.forEach((card, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + column * (NID_WIDTH + gapX);
        const y = startY + row * (NID_HEIGHT + gapY);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, y, NID_WIDTH, NID_HEIGHT);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, NID_WIDTH, NID_HEIGHT);
        ctx.clip();
        drawImageWithin(ctx, card.image.image, x, y, NID_WIDTH, NID_HEIGHT, 'contain');
        ctx.restore();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, NID_WIDTH, NID_HEIGHT);
        drawCropMarks(ctx, x, y, NID_WIDTH, NID_HEIGHT);
        ctx.fillStyle = '#475569';
        ctx.font = '600 20px sans-serif';
        ctx.fillText(card.label, x, y - 38);
      });
      return;
    }

    if (mainImage) {
      const margin = a4Margin * PX_PER_MM;
      const printWidth = width - margin * 2;
      const printHeight = height - margin * 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(margin, margin, printWidth, printHeight);
      ctx.clip();
      drawImageWithin(ctx, mainImage.image, margin, margin, printWidth, printHeight, a4Fit);
      ctx.restore();
      if (a4Margin > 0) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 10]);
        ctx.strokeRect(margin, margin, printWidth, printHeight);
        ctx.setLineDash([]);
      }
    }
  }, [a4Fit, a4Margin, a4Orientation, backImage, frontImage, mainImage, mode, nidCopies, passportBackground, passportRotation, passportX, passportY, passportZoom]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const resetSettings = () => {
    if (mode === 'passport') {
      setPassportBackground('#ffffff');
      setPassportZoom(1);
      setPassportX(0);
      setPassportY(0);
      setPassportRotation(0);
    } else if (mode === 'nid') {
      setNidCopies(1);
    } else {
      setA4Orientation('portrait');
      setA4Fit('contain');
      setA4Margin(10);
    }
    setNotice(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasOutput) return;
    const defaultName = mode === 'passport'
      ? `${formatFileName(mainImage?.fileName || 'passport')}-passport-40x50.png`
      : mode === 'nid'
        ? 'nid-print-ready-a4.png'
        : `${formatFileName(mainImage?.fileName || 'a4-print')}-a4-print-ready.png`;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = defaultName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice({ type: 'success', text: text.ready });
    }, 'image/png');
  };

  const printCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasOutput) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNotice({ type: 'error', text: text.popupBlocked });
      return;
    }

    const pageCss = mode === 'passport'
      ? '@page { size: 40mm 50mm; margin: 0; } img { width: 40mm; height: 50mm; }'
      : a4Orientation === 'landscape' && mode === 'a4'
        ? '@page { size: A4 landscape; margin: 0; } img { width: 297mm; height: 210mm; }'
        : '@page { size: A4 portrait; margin: 0; } img { width: 210mm; height: 297mm; }';
    printWindow.document.write(`<!doctype html><html><head><title>${title}</title><style>html,body{margin:0;padding:0;background:#fff;}${pageCss}</style></head><body><img src="${dataUrl}" alt="${title}" onload="window.print();"></body></html>`);
    printWindow.document.close();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.type.startsWith('image/'));
    if (file) loadFile(file, mode === 'nid' ? 'front' : 'main');
    else setNotice({ type: 'error', text: text.imageInvalid });
  };

  const uploadCard = (target: ImageTarget, titleText: string, image: LoadedImage | null, optional = false) => (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-bold text-slate-200">
          {titleText} {optional && <span className="font-medium text-slate-500">({text.optional})</span>}
        </p>
        {image && <Check className="h-4 w-4 shrink-0 text-teal-300" />}
      </div>
      {image ? (
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800">
            <img src={image.url} alt="" className="h-full w-full object-cover" />
          </div>
          <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{image.fileName}</span>
          <button
            type="button"
            onClick={() => clearImage(target)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
            aria-label={isBangla ? 'ছবি মুছুন' : 'Remove image'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openPicker(target)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-800/60 px-3 py-3 text-xs font-bold text-slate-300 transition hover:border-teal-400 hover:bg-slate-800 hover:text-white"
        >
          <Upload className="h-4 w-4 text-teal-300" />
          {text.upload}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ToolTopBar showBack />
      <main className="mx-auto max-w-[1700px] px-3 py-4 sm:px-5 sm:py-6">
        <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 shadow-2xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {mode === 'passport' ? <FileImage className="h-5 w-5 text-teal-300" /> : mode === 'nid' ? <IdCard className="h-5 w-5 text-fuchsia-300" /> : <LayoutTemplate className="h-5 w-5 text-amber-300" />}
              <h1 className="truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 sm:self-auto">
            <ScanLine className="h-4 w-4 text-teal-300" />
            {specification}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)_290px]">
          <aside className="order-2 space-y-4 xl:order-1">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-teal-300" />
                <h2 className="text-sm font-extrabold text-white">{text.upload}</h2>
              </div>

              {mode === 'nid' ? (
                <div className="space-y-3">
                  {uploadCard('front', text.front, frontImage)}
                  {uploadCard('back', text.back, backImage, true)}
                  <p className="rounded-xl bg-slate-800/70 p-3 text-[11px] leading-5 text-slate-400">{text.frontBackHelp}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadCard('main', mainImage ? text.replace : text.upload, mainImage)}
                  <p className="rounded-xl bg-slate-800/70 p-3 text-[11px] leading-5 text-slate-400">{text.imageOnly}</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-300" />
                <h2 className="text-sm font-extrabold text-white">{text.edit}</h2>
              </div>

              {mode === 'passport' && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-300">{text.background}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: '#ffffff', label: text.white, className: 'bg-white' },
                        { value: '#bae6fd', label: text.lightBlue, className: 'bg-sky-200' },
                        { value: '#dbeafe', label: text.paleBlue, className: 'bg-blue-100' },
                      ].map((background) => (
                        <button
                          type="button"
                          key={background.value}
                          onClick={() => setPassportBackground(background.value)}
                          className={`rounded-xl border p-2 text-[10px] font-bold transition ${passportBackground === background.value ? 'border-teal-400 bg-slate-800 text-white' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}
                        >
                          <span className={`mx-auto mb-1.5 block h-5 w-8 rounded-md ring-1 ring-black/10 ${background.className}`} />
                          {background.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <RangeControl label={`${text.zoom} · ${Math.round(passportZoom * 100)}%`} value={passportZoom} min={0.7} max={2.4} step={0.01} onChange={setPassportZoom} />
                  <RangeControl label={text.moveLeftRight} value={passportX} min={-140} max={140} step={1} onChange={setPassportX} />
                  <RangeControl label={text.moveUpDown} value={passportY} min={-170} max={170} step={1} onChange={setPassportY} />
                  <RangeControl label={`${text.rotate} · ${passportRotation}°`} value={passportRotation} min={-15} max={15} step={1} onChange={setPassportRotation} />
                </div>
              )}

              {mode === 'nid' && (
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-300">{text.copies}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 4] as const).map((copies) => (
                      <button
                        key={copies}
                        type="button"
                        onClick={() => setNidCopies(copies)}
                        className={`rounded-xl border py-2.5 text-sm font-extrabold transition ${nidCopies === copies ? 'border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-200' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}
                      >
                        {copies}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 rounded-xl bg-slate-800/70 p-3 text-[11px] leading-5 text-slate-400">{text.showGuide}</p>
                </div>
              )}

              {mode === 'a4' && (
                <div className="space-y-4">
                  <ChoiceControl
                    label={text.orientation}
                    value={a4Orientation}
                    onChange={setA4Orientation}
                    options={[
                      { value: 'portrait', label: text.portrait },
                      { value: 'landscape', label: text.landscape },
                    ]}
                  />
                  <ChoiceControl
                    label={text.layout}
                    value={a4Fit}
                    onChange={setA4Fit}
                    options={[
                      { value: 'contain', label: text.fit },
                      { value: 'cover', label: text.fullBleed },
                    ]}
                  />
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-300">{text.margin}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([0, 10, 20] as const).map((margin) => (
                        <button
                          key={margin}
                          type="button"
                          onClick={() => setA4Margin(margin)}
                          className={`rounded-xl border py-2 text-xs font-bold transition ${a4Margin === margin ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}
                        >
                          {margin === 0 ? text.noMargin : `${margin} mm`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={resetSettings}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                {text.reset}
              </button>
            </section>
          </aside>

          <section className="order-1 flex min-h-[440px] flex-col rounded-2xl border border-slate-800 bg-[#111827] p-3 shadow-2xl shadow-slate-950/30 xl:order-2 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-sm font-extrabold text-white">{text.preview}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{outputDimensions.width} × {outputDimensions.height} px · {specification}</p>
              </div>
              {hasOutput && <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-2.5 py-1 text-[11px] font-bold text-teal-200"><Check className="h-3.5 w-3.5" /> {text.fileReady}</span>}
            </div>

            <div
              className={`relative flex min-h-[380px] flex-1 items-center justify-center overflow-auto rounded-xl border border-slate-800 p-4 ${isDragging ? 'bg-teal-400/10 ring-2 ring-teal-400' : 'bg-slate-950/55'}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <div className="relative mx-auto max-w-full">
                <canvas
                  ref={canvasRef}
                  className={`block max-h-[62vh] max-w-full rounded-sm shadow-2xl ${mode === 'passport' ? 'w-auto' : 'h-auto w-auto'}`}
                  aria-label={text.preview}
                />
                {!hasOutput && (
                  <button
                    type="button"
                    onClick={() => openPicker(mode === 'nid' ? 'front' : 'main')}
                    className="absolute inset-0 flex min-h-[260px] w-full min-w-[220px] flex-col items-center justify-center gap-3 rounded-sm bg-slate-900/75 px-6 text-center transition hover:bg-slate-900/85"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200"><Upload className="h-7 w-7" /></span>
                    <span className="max-w-[260px] text-sm font-bold text-white">{text.dragDrop}</span>
                    <span className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-extrabold text-slate-950">{text.chooseImage}</span>
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 px-1 text-center text-[11px] leading-5 text-slate-500">{text.privacy}</p>
          </section>

          <aside className="order-3 space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Printer className="h-4 w-4 text-teal-300" />
                <h2 className="text-sm font-extrabold text-white">{text.output}</h2>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isBangla ? 'ফাইল ফরম্যাট' : 'File format'}</p>
                <p className="mt-1 text-sm font-bold text-white">PNG · {specification}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{outputDimensions.width} × {outputDimensions.height} px</p>
              </div>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  disabled={!hasOutput}
                  onClick={downloadCanvas}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:from-teal-300 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                  {text.download}
                </button>
                <button
                  type="button"
                  disabled={!hasOutput}
                  onClick={printCanvas}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-extrabold text-slate-100 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Printer className="h-4 w-4" />
                  {text.print}
                </button>
              </div>
            </section>

            {notice && (
              <div className={`rounded-2xl border p-3 text-xs leading-5 ${notice.type === 'success' ? 'border-teal-400/25 bg-teal-400/10 text-teal-100' : 'border-rose-400/25 bg-rose-400/10 text-rose-100'}`}>
                {notice.text}
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] leading-5 text-slate-400">
              <p className="flex items-center gap-2 font-bold text-slate-200"><Info className="h-4 w-4 text-teal-300" /> {isBangla ? 'গোপনীয়তা' : 'Privacy'}</p>
              <p className="mt-2">{text.privacy}</p>
            </div>
          </aside>
        </div>
      </main>

      <input ref={mainInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onInputChange(event, 'main')} />
      <input ref={frontInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onInputChange(event, 'front')} />
      <input ref={backInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onInputChange(event, 'back')} />
    </div>
  );
}

type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function RangeControl({ label, value, min, max, step, onChange }: RangeControlProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-300"><RotateCw className="h-3.5 w-3.5 text-teal-300" />{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-teal-400"
      />
    </label>
  );
}

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

type ChoiceControlProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
};

function ChoiceControl<T extends string>({ label, value, onChange, options }: ChoiceControlProps<T>) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-slate-300">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${value === option.value ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
