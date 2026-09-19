type Props = {
  width: number;
  height: number;
  setWidth: (n: number) => void;
  setHeight: (n: number) => void;
  lockAspect: boolean;
  setLockAspect: (b: boolean) => void;
  onApply: () => void;
};

export default function ResizeTool({ width, height, setWidth, setHeight, lockAspect, setLockAspect, onApply }: Props) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Resize</div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" />
        <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white" />
      </div>
      <label className="flex items-center gap-2 text-[11px] text-slate-400"><input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} /> Lock aspect ratio</label>
      <button onClick={onApply} className="w-full rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold">Apply Resize</button>
    </div>
  );
}
