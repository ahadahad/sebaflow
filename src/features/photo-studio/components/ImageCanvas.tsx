import { useEffect, useRef, useState } from 'react';
import type { FilterState, BgColor, BorderState, PassportSize } from '../types/photoStudio';
import { buildFilterString } from '../utils/imageProcessing';

type Props = {
  activeImage: HTMLImageElement | null;
  filter: FilterState;
  imgPos: { x: number; y: number; scale: number };
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  bgColor: BgColor;
  border: BorderState;
  selectedSize: PassportSize;
  zoom: number;
  cropMode: boolean;
  cropBox: { x: number; y: number; w: number; h: number } | null;
  setCropBox: (b: { x: number; y: number; w: number; h: number }) => void;
  showGuides: boolean;
  faceBox?: { x: number; y: number; w: number; h: number } | null;
  onMove: (dx: number, dy: number) => void;
  onZoom: (delta: number) => void;
};

export default function ImageCanvas({
  activeImage, filter, imgPos, rotate, flipH, flipV, bgColor, border, selectedSize, zoom, cropMode, cropBox, setCropBox, showGuides, faceBox, onMove, onZoom
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingCrop, setDraggingCrop] = useState<null | 'move' | 'nw' | 'ne' | 'sw' | 'se'>(null);

  const draw = () => {
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

    // checkerboard for transparent
    if (bgColor.hex === 'transparent') {
      const size = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e2e8f0';
      for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
          if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    } else {
      ctx.fillStyle = bgColor.hex;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.filter = buildFilterString(filter);
    ctx.save();
    ctx.translate(w / 2 + imgPos.x, h / 2 + imgPos.y);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale((flipH ? -1 : 1) * imgPos.scale, (flipV ? -1 : 1) * imgPos.scale);
    const imgAspect = activeImage.width / activeImage.height;
    const canvasAspect = w / h;
    let drawW, drawH;
    if (imgAspect > canvasAspect) {
      drawH = h;
      drawW = drawH * imgAspect;
    } else {
      drawW = w;
      drawH = drawW / imgAspect;
    }
    ctx.drawImage(activeImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    ctx.filter = 'none';

    if (border.enabled) {
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.thickness;
      if (border.radius > 0) {
        const r = Math.min(border.radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, r);
        ctx.stroke();
      } else {
        ctx.strokeRect(0, 0, w, h);
      }
    }

    if (showGuides) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1;
      // rule of thirds
      ctx.beginPath();
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
      ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
      ctx.stroke();
      // face oval guide for passport
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(16,185,129,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.45, w * 0.28, h * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      // eye line
      ctx.strokeStyle = 'rgba(251,191,36,0.8)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.38);
      ctx.lineTo(w * 0.8, h * 0.38);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (faceBox) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(faceBox.x * w, faceBox.y * h, faceBox.w * w, faceBox.h * h);
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('FACE', faceBox.x * w + 4, faceBox.y * h - 4);
    }

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
  };

  useEffect(() => { draw(); }, [activeImage, filter, imgPos, rotate, flipH, flipV, bgColor, border, selectedSize, zoom, cropMode, cropBox, showGuides, faceBox]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeImage) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (selectedSize.pxW / rect.width);
    const y = (e.clientY - rect.top) * (selectedSize.pxH / rect.height);

    if (cropMode && cropBox) {
      const threshold = 12;
      if (Math.abs(x - cropBox.x) < threshold && Math.abs(y - cropBox.y) < threshold) setDraggingCrop('nw');
      else if (Math.abs(x - (cropBox.x + cropBox.w)) < threshold && Math.abs(y - cropBox.y) < threshold) setDraggingCrop('ne');
      else if (Math.abs(x - cropBox.x) < threshold && Math.abs(y - (cropBox.y + cropBox.h)) < threshold) setDraggingCrop('sw');
      else if (Math.abs(x - (cropBox.x + cropBox.w)) < threshold && Math.abs(y - (cropBox.y + cropBox.h)) < threshold) setDraggingCrop('se');
      else if (x > cropBox.x && x < cropBox.x + cropBox.w && y > cropBox.y && y < cropBox.y + cropBox.h) setDraggingCrop('move');
      else setDraggingCrop(null);
      setDragStart({ x, y });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - imgPos.x, y: e.clientY - imgPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cropMode && draggingCrop && cropBox) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) * (selectedSize.pxW / rect.width);
      const y = (e.clientY - rect.top) * (selectedSize.pxH / rect.height);
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      let newBox = { ...cropBox };
      if (draggingCrop === 'move') {
        newBox.x = Math.max(0, Math.min(selectedSize.pxW - newBox.w, cropBox.x + dx));
        newBox.y = Math.max(0, Math.min(selectedSize.pxH - newBox.h, cropBox.y + dy));
      } else if (draggingCrop === 'se') {
        newBox.w = Math.max(20, Math.min(selectedSize.pxW - cropBox.x, cropBox.w + dx));
        newBox.h = Math.max(20, Math.min(selectedSize.pxH - cropBox.y, cropBox.h + dy));
      } else if (draggingCrop === 'sw') {
        const newW = Math.max(20, cropBox.w - dx);
        newBox.x = cropBox.x + cropBox.w - newW;
        newBox.w = newW;
        newBox.h = Math.max(20, Math.min(selectedSize.pxH - cropBox.y, cropBox.h + dy));
      } else if (draggingCrop === 'ne') {
        newBox.w = Math.max(20, Math.min(selectedSize.pxW - cropBox.x, cropBox.w + dx));
        const newH = Math.max(20, cropBox.h - dy);
        newBox.y = cropBox.y + cropBox.h - newH;
        newBox.h = newH;
      } else if (draggingCrop === 'nw') {
        const newW = Math.max(20, cropBox.w - dx);
        const newH = Math.max(20, cropBox.h - dy);
        newBox.x = cropBox.x + cropBox.w - newW;
        newBox.y = cropBox.y + cropBox.h - newH;
        newBox.w = newW;
        newBox.h = newH;
      }
      setCropBox(newBox);
      setDragStart({ x, y });
      return;
    }

    if (!isDragging) return;
    onMove(e.clientX - dragStart.x, e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingCrop(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    onZoom(e.deltaY > 0 ? -0.1 : 0.1);
  };

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 bg-[#1e293b] min-h-[500px] relative overflow-auto">
      {!activeImage ? null : (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="block rounded-xl shadow-2xl bg-[#0f172a] cursor-move select-none"
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
        />
      )}
    </div>
  );
}
