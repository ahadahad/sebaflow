import { ArrowLeft, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

type ToolTopBarProps = {
  showBack?: boolean;
};

export default function ToolTopBar({ showBack = false }: ToolTopBarProps) {
  const { lang, setLang } = useLanguage();
  const isBangla = lang === 'bn';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {showBack && (
            <Link
              to="/"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-teal-400 hover:bg-slate-800 hover:text-white"
              aria-label={isBangla ? 'সব টুলে ফিরে যান' : 'Back to all tools'}
              title={isBangla ? 'সব টুলে ফিরে যান' : 'All tools'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src="/logo-icon.png" alt="ShebaFlow" className="h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-white/15" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[16px] font-bold tracking-tight text-white">ShebaFlow</span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-300">
                {isBangla ? 'ফটো ও প্রিন্ট টুলস' : 'Photo & Print Tools'}
              </span>
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setLang(isBangla ? 'en' : 'bn')}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-bold text-slate-100 transition hover:border-teal-400 hover:bg-slate-800"
          aria-label={isBangla ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
        >
          <Languages className="h-4 w-4 text-teal-300" />
          {isBangla ? 'EN' : 'বাংলা'}
        </button>
      </div>
    </header>
  );
}
