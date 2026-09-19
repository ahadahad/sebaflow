import { Link } from 'react-router-dom';
import type { Category } from '../data/categories';
import { CategoryIcon } from './Icons';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const colorMap: Record<string, { from: string; to: string; light: string; ring: string }> = {
  files: { from: '#2563eb', to: '#06b6d4', light: '#eff6ff', ring: '#dbeafe' },
  graduation: { from: '#7c3aed', to: '#a855f7', light: '#f5f3ff', ring: '#ede9fe' },
  camera: { from: '#f59e0b', to: '#f97316', light: '#fffbeb', ring: '#fde68a' },
  monitor: { from: '#10b981', to: '#06b6d4', light: '#ecfdf5', ring: '#a7f3d0' },
};

export default function CategoryCard({ category, count }: { category: Category; count: number }) {
  const { t, lang } = useLanguage();
  const colors = colorMap[category.iconName] || colorMap.files;

  return (
    <Link to={`/services?category=${category.slug}`} className="group relative flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-violet-200">
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[24px]" style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }} />
      
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
        <CategoryIcon name={category.iconName} className="h-7 w-7 text-white" />
      </div>

      <h3 className="mt-5 font-display text-[18px] font-bold leading-6 text-slate-900">{category.name}</h3>
      <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500">{category.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-[11px] font-bold ring-1" style={{ backgroundColor: colors.light, color: colors.from, borderColor: colors.ring }}>
          {count}{lang === 'bn' ? 'টি সেবা' : ` ${t('cat.services')}`}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
          {t('cat.view')}
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-110" style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }}>
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </div>
    </Link>
  );
}
