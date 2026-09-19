import { Upload, X } from 'lucide-react';
import type { TrayImage } from '../types/photoStudio';

type Props = {
  tray: TrayImage[];
  activeId: string | null;
  onSelect: (item: TrayImage) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export default function ImageTray({ tray, activeId, onSelect, onRemove, onAdd }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-semibold">Image Tray</span>
        <span className="text-[10px] text-slate-500">{tray.length}/20</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onAdd} className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-600/10 text-blue-400 text-[10px]"><Upload size={16} /> Add</button>
        {tray.map(img => (
          <div key={img.id} className="relative group">
            <button onClick={() => onSelect(img as any)} className={`aspect-square w-full overflow-hidden rounded-xl border-2 ${activeId === img.id ? 'border-emerald-500' : 'border-slate-700'} bg-slate-800`}>
              <img src={img.src} alt="" className="w-full h-full object-cover" />
            </button>
            <button onClick={() => onRemove(img.id)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={10} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
