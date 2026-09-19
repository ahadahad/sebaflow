import type { BgColor, BorderState } from '../types/photoStudio';

type Props = {
  bgColors: BgColor[];
  selected: BgColor;
  onSelect: (c: BgColor) => void;
  border: BorderState;
  onBorderChange: (b: BorderState) => void;
};

export default function BackgroundTool({ bgColors, selected, onSelect, border, onBorderChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Background</div>
        <div className="flex flex-wrap gap-2">
          {bgColors.map(c => (
            <button key={c.id} onClick={() => onSelect(c)} className={`w-8 h-8 rounded-lg border-2 ${selected.id === c.id ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c.hex === 'transparent' ? 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%)' : c.hex }} />
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
        <label className="flex items-center gap-2 text-[11px] text-slate-400"><input type="checkbox" checked={border.enabled} onChange={e => onBorderChange({ ...border, enabled: e.target.checked })} /> Enable Border</label>
        {border.enabled && (
          <div className="mt-2 space-y-2">
            <input type="color" value={border.color} onChange={e => onBorderChange({ ...border, color: e.target.value })} className="w-8 h-8 rounded" />
            <input type="range" min={1} max={20} value={border.thickness} onChange={e => onBorderChange({ ...border, thickness: Number(e.target.value) })} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
