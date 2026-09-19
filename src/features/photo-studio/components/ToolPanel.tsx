import type { FilterState, PassportSize } from '../types/photoStudio';
import { passportSizes } from '../types/photoStudio';

type Props = {
  activeTab: 'object' | 'filters';
  setActiveTab: (t: 'object' | 'filters') => void;
  filter: FilterState;
  setFilter: (f: FilterState | ((prev: FilterState) => FilterState)) => void;
  selectedSize: PassportSize;
  setSelectedSize: (s: PassportSize) => void;
  faceTab: string | null;
  setFaceTab: (t: any) => void;
  onCrop: () => void;
  onRemoveBg: () => void;
  onEnhance: () => void;
  onResize: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onReset: () => void;
  isProcessing: boolean;
  t: (en: string, bn: string) => string;
};

export default function ToolPanel({
  activeTab, setActiveTab, filter, setFilter, selectedSize, setSelectedSize, faceTab, setFaceTab,
  onCrop, onRemoveBg, onEnhance, onResize, onRotateLeft, onRotateRight, onFlipH, onFlipV, onReset, isProcessing, t
}: Props) {
  return (
    <div className="w-[300px] shrink-0 border-r border-slate-700 bg-[#162032] p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-64px)]">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onCrop} className="flex items-center justify-center gap-2 rounded-xl bg-teal-900/50 border border-teal-700/30 text-teal-300 px-3 py-2.5 text-xs font-semibold hover:bg-teal-800">✂️ {t('Crop', 'ক্রপ')}</button>
        <button onClick={onRemoveBg} disabled={isProcessing} className="flex items-center justify-center gap-2 rounded-xl bg-teal-900/50 border border-teal-700/30 text-teal-300 px-3 py-2.5 text-xs font-semibold hover:bg-teal-800 disabled:opacity-50">🧹 {t('Remove BG', 'বিজি রিমুভ')}</button>
        <button onClick={onEnhance} className="flex items-center justify-center gap-2 rounded-xl bg-amber-900/50 border border-amber-700/30 text-amber-300 px-3 py-2.5 text-xs font-semibold">✨ {t('Enhance', 'ইনহ্যান্স')}</button>
        <button onClick={onResize} className="flex items-center justify-center gap-2 rounded-xl bg-violet-900/50 border border-violet-700/30 text-violet-300 px-3 py-2.5 text-xs font-semibold">📏 {t('Resize', 'রিসাইজ')}</button>
        <button onClick={onRotateLeft} className="rounded-xl bg-slate-800 text-slate-300 px-3 py-2 text-xs">↩️ Left</button>
        <button onClick={onRotateRight} className="rounded-xl bg-slate-800 text-slate-300 px-3 py-2 text-xs">↪️ Right</button>
        <button onClick={onFlipH} className="rounded-xl bg-slate-800 text-slate-300 px-3 py-2 text-xs">↔️ Flip H</button>
        <button onClick={onFlipV} className="rounded-xl bg-slate-800 text-slate-300 px-3 py-2 text-xs">↕️ Flip V</button>
        <button onClick={onReset} className="col-span-2 rounded-xl bg-slate-700 text-slate-300 px-3 py-2 text-xs">Reset</button>
      </div>

      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('Passport Size', 'পাসপোর্ট সাইজ')}</div>
        <div className="grid gap-1 max-h-[180px] overflow-y-auto">
          {passportSizes.map(s => (
            <button key={s.id} onClick={() => setSelectedSize(s)} className={`flex justify-between rounded-lg px-3 py-2 text-[11px] text-left ${selectedSize.id === s.id ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-800/50 text-slate-400'}`}>
              <span className="font-semibold">{s.label}</span><span className="text-[9px] opacity-70">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('object')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeTab === 'object' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Object</button>
        <button onClick={() => setActiveTab('filters')} className={`rounded-full px-3 py-1.5 text-xs ${activeTab === 'filters' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Filters</button>
      </div>

      {activeTab === 'object' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {['face', 'skin', 'hair', 'subject', 'background'].map(tab => (
              <button key={tab} onClick={() => setFaceTab(faceTab === tab ? null : tab)} className={`flex flex-col items-center gap-1 rounded-xl p-3 text-[11px] ${faceTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{tab}</button>
            ))}
          </div>
          {faceTab && ['subject', 'background'].includes(faceTab) && (
            <div className="rounded-xl bg-amber-900/20 border border-amber-700/30 p-3 text-[11px] text-amber-200">
              This feature will be connected to AI processing in the next version.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-800 p-3 space-y-3">
          {[
            { k: 'brightness', label: 'Brightness', min: 0, max: 200 },
            { k: 'contrast', label: 'Contrast', min: 0, max: 200 },
            { k: 'saturation', label: 'Saturation', min: 0, max: 200 },
            { k: 'exposure', label: 'Exposure', min: -50, max: 50 },
            { k: 'blur', label: 'Blur', min: 0, max: 20 },
            { k: 'grayscale', label: 'Grayscale', min: 0, max: 100 },
            { k: 'sepia', label: 'Sepia', min: 0, max: 100 },
            { k: 'hue', label: 'Hue', min: -180, max: 180 },
            { k: 'vivid', label: 'Vivid', min: 0, max: 50 },
            { k: 'warm', label: 'Warm', min: 0, max: 50 },
          ].map(f => (
            <div key={f.k}>
              <div className="flex justify-between text-[11px] mb-1"><span>{f.label}</span><span>{(filter as any)[f.k]}</span></div>
              <input type="range" min={f.min} max={f.max} value={(filter as any)[f.k]} onChange={e => setFilter((prev: any) => ({ ...prev, [f.k]: Number(e.target.value) }))} className="w-full accent-cyan-500" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={() => setFilter({ brightness: 100, contrast: 100, saturation: 100, exposure: 0, blur: 0, grayscale: 0, sepia: 0, hue: 0, vivid: 0, warm: 0, sharpness: 0 })} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">Reset</button>
            <button className="rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
