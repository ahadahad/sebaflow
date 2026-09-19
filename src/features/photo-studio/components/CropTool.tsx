type Props = {
  aspect: string;
  setAspect: (a: string) => void;
  onApply: () => void;
  onCancel: () => void;
};

export default function CropTool({ aspect, setAspect, onApply, onCancel }: Props) {
  return (
    <div className="rounded-xl bg-slate-800 p-3 space-y-3">
      <div className="text-[11px] font-bold">Crop Tool</div>
      <div className="flex flex-wrap gap-1">
        {['free', '1:1', '4:5', '3:4', '4:3', '16:9', 'passport'].map(a => (
          <button key={a} onClick={() => setAspect(a)} className={`px-2.5 py-1 rounded-full text-[11px] ${aspect === a ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{a}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onApply} className="rounded-lg bg-emerald-600 text-white py-2 text-xs font-bold">Apply</button>
        <button onClick={onCancel} className="rounded-lg bg-slate-700 text-slate-300 py-2 text-xs">Cancel</button>
      </div>
    </div>
  );
}
