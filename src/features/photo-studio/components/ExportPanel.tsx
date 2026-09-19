type Props = {
  format: 'png' | 'jpg' | 'webp';
  setFormat: (f: 'png' | 'jpg' | 'webp') => void;
  quality: number;
  setQuality: (n: number) => void;
  fileName: string;
  setFileName: (s: string) => void;
  onExport: () => void;
  onPrint: () => void;
  isExporting: boolean;
};

export default function ExportPanel({ format, setFormat, quality, setQuality, fileName, setFileName, onExport, onPrint, isExporting }: Props) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Export</div>
      <input value={fileName} onChange={e => setFileName(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white" />
      <div className="grid grid-cols-3 gap-1">
        {(['png', 'jpg', 'webp'] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)} className={`rounded-lg py-2 text-xs font-semibold border ${format === f ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{f.toUpperCase()}</button>
        ))}
      </div>
      {(format === 'jpg' || format === 'webp') && (
        <div>
          <div className="flex justify-between text-[11px]"><span>Quality</span><span>{quality}%</span></div>
          <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
      )}
      <button onClick={onExport} disabled={isExporting} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 text-sm font-bold disabled:opacity-40">{isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}</button>
      <button onClick={onPrint} className="w-full rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">Print</button>
    </div>
  );
}
