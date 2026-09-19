import type { FilterState } from '../types/photoStudio';

type Props = {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
};

export default function FilterTool({ filter, setFilter, onReset, onApply }: Props) {
  const sliders = [
    { k: 'brightness', label: 'Brightness', min: 0, max: 200 },
    { k: 'contrast', label: 'Contrast', min: 0, max: 200 },
    { k: 'saturation', label: 'Saturation', min: 0, max: 200 },
    { k: 'exposure', label: 'Exposure', min: -50, max: 50 },
    { k: 'blur', label: 'Blur', min: 0, max: 20 },
    { k: 'grayscale', label: 'Grayscale', min: 0, max: 100 },
  ] as const;

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 space-y-3">
      {sliders.map(s => (
        <div key={s.k}>
          <div className="flex justify-between text-[11px] mb-1"><span>{s.label}</span><span>{(filter as any)[s.k]}</span></div>
          <input type="range" min={s.min} max={s.max} value={(filter as any)[s.k]} onChange={e => setFilter({ ...filter, [s.k]: Number(e.target.value) } as any)} className="w-full accent-cyan-500" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button onClick={onReset} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">Reset</button>
        <button onClick={onApply} className="rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold">Apply</button>
      </div>
    </div>
  );
}
