import { Undo2, Redo2, RotateCcw, Sparkles, Download, Printer } from 'lucide-react';

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onEnhance: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isProcessing?: boolean;
};

export default function EditorToolbar({ canUndo, canRedo, onUndo, onRedo, onReset, onEnhance, onDownload, onPrint, isProcessing }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1">
      <button onClick={onUndo} disabled={!canUndo} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 disabled:opacity-30" title="Undo"><Undo2 size={14} /></button>
      <button onClick={onRedo} disabled={!canRedo} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 disabled:opacity-30" title="Redo"><Redo2 size={14} /></button>
      <button onClick={onReset} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300" title="Reset"><RotateCcw size={14} /></button>
      <button onClick={onEnhance} disabled={isProcessing} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-600 text-white disabled:opacity-30" title="Auto Enhance"><Sparkles size={14} /></button>
      <button onClick={onPrint} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300" title="Print"><Printer size={14} /></button>
      <button onClick={onDownload} className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white" title="Download"><Download size={14} /></button>
    </div>
  );
}
