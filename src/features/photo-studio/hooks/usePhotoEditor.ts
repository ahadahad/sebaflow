import { useState, useCallback, useRef } from 'react';
import { defaultFilter, type FilterState, type BgColor, type BorderState, type CropState, type PassportSize, passportSizes, bgColors } from '../types/photoStudio';
import { analyzeImageSmart, detectFaceBox } from '../utils/imageProcessing';

export function usePhotoEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [filter, setFilter] = useState<FilterState>({ ...defaultFilter });
  const [imgPos, setImgPos] = useState({ x: 0, y: 0, scale: 1 });
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [bgColor, setBgColor] = useState<BgColor>(bgColors[1]);
  const [border, setBorder] = useState<BorderState>({ enabled: false, color: '#ffffff', thickness: 2, radius: 0 });
  const [crop, setCrop] = useState<CropState | null>(null);
  const [selectedSize, setSelectedSize] = useState<PassportSize>(passportSizes[0]);
  const [zoom, setZoom] = useState(1);
  const [faceBox, setFaceBox] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadImage = useCallback((img: HTMLImageElement) => {
    setActiveImage(img);
    setOriginalImage(img);
    const isLarge = img.width > 1000 || img.height > 1000;
    setImgPos({ x: 0, y: -img.height * 0.02, scale: isLarge ? 1.15 : 1.25 });
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    setFilter({ ...defaultFilter });
    setZoom(1);
    setCrop(null);
    setSuggestion(null);
  }, []);

  const autoCrop = useCallback(async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    const fb = await detectFaceBox(activeImage);
    setFaceBox(fb);
    setFaceDetected(fb.detected);

    const imgW = activeImage.width;
    const imgH = activeImage.height;
    const canvasW = selectedSize.pxW;
    const canvasH = selectedSize.pxH;

    let targetScale = 1;
    let offsetX = 0, offsetY = 0;

    if (fb.detected) {
      const faceCenterX = fb.x + fb.w / 2;
      const faceCenterY = fb.y + fb.h / 2;
      const faceH = fb.h;
      if (faceH < 0.25) targetScale = 2.2;
      else if (faceH < 0.4) targetScale = 1.6;
      else if (faceH < 0.6) targetScale = 1.25;
      else if (faceH > 0.85) targetScale = 0.85;
      else targetScale = 1.1;

      const imgAspect = imgW / imgH;
      const canvasAspect = canvasW / canvasH;
      let baseW, baseH;
      if (imgAspect > canvasAspect) { baseH = canvasH; baseW = baseH * imgAspect; }
      else { baseW = canvasW; baseH = baseW / imgAspect; }

      const faceInDrawX = (faceCenterX * imgW) * (baseW / imgW);
      const faceInDrawY = (faceCenterY * imgH) * (baseH / imgH);
      const desiredX = canvasW / 2;
      const desiredY = canvasH * 0.55;
      const curX = canvasW / 2 + (faceInDrawX - baseW / 2);
      const curY = canvasH / 2 + (faceInDrawY - baseH / 2);
      offsetX = (desiredX - curX) / targetScale;
      offsetY = (desiredY - curY) / targetScale;
    } else {
      targetScale = imgW > 1000 ? 1.15 : 1.25;
      offsetY = (canvasH * 0.55 - canvasH / 2 - 0.4 * canvasH + canvasH / 2) * 0.7;
    }
    targetScale = Math.max(0.6, Math.min(2.8, targetScale));
    setImgPos({ x: offsetX, y: offsetY, scale: targetScale });
    setSuggestion({
      method: fb.detected ? 'FaceDetector API ✅' : 'Auto centered ✅',
      confidence: fb.detected ? 92 : 85,
      tips: fb.detected ? ['✅ Face centered', '70-80% frame', 'Eyes 50-60% from top'] : ['📐 Auto-centered', '70-80% frame', 'Drag to adjust'],
    });
    setIsProcessing(false);
  }, [activeImage, selectedSize]);

  const smartEnhance = useCallback(() => {
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
      setSuggestion({
        method: `AI Enhance 🤖 ${analysis.score}%`,
        confidence: Math.max(75, analysis.score),
        tips: analysis.tips,
      });
      setIsProcessing(false);
    }, 500);
  }, [activeImage]);

  const resetAll = useCallback(() => {
    setFilter({ ...defaultFilter });
    setImgPos({ x: 0, y: 0, scale: 1 });
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    setBorder({ enabled: false, color: '#ffffff', thickness: 2, radius: 0 });
    setCrop(null);
    setSuggestion(null);
  }, []);

  return {
    canvasRef,
    activeImage, originalImage, setActiveImage,
    filter, setFilter,
    imgPos, setImgPos,
    rotate, setRotate,
    flipH, setFlipH, flipV, setFlipV,
    bgColor, setBgColor,
    border, setBorder,
    crop, setCrop,
    selectedSize, setSelectedSize,
    zoom, setZoom,
    faceBox, faceDetected,
    suggestion, setSuggestion,
    isProcessing, setIsProcessing,
    loadImage, autoCrop, smartEnhance, resetAll,
  };
}
