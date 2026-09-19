import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import type { Service } from '../data/services';
import { getCategoryById } from '../data/categories';
import { ServiceIcon } from './Icons';
import { useLanguage } from '../lib/i18n';

const gradients: Record<string, { from: string; to: string; light: string }> = {
  passport: { from: '#2563eb', to: '#06b6d4', light: '#eff6ff' },
  plane: { from: '#0ea5e9', to: '#2563eb', light: '#f0f9ff' },
  idcard: { from: '#7c3aed', to: '#4f46e5', light: '#f5f3ff' },
  baby: { from: '#ec4899', to: '#f43f5e', light: '#fdf2f8' },
  'file-pen': { from: '#f59e0b', to: '#f97316', light: '#fffbeb' },
  form: { from: '#10b981', to: '#059669', light: '#ecfdf5' },
  school: { from: '#8b5cf6', to: '#7c3aed', light: '#f5f3ff' },
  award: { from: '#f59e0b', to: '#eab308', light: '#fefce8' },
  'file-text': { from: '#1e293b', to: '#0f172a', light: '#f1f5f9' },
  briefcase: { from: '#2563eb', to: '#4f46e5', light: '#eff6ff' },
  book: { from: '#f97316', to: '#ef4444', light: '#fff7ed' },
  camera: { from: '#d946ef', to: '#ec4899', light: '#fdf4ff' },
  eraser: { from: '#06b6d4', to: '#2563eb', light: '#ecfeff' },
  sparkles: { from: '#8b5cf6', to: '#d946ef', light: '#f5f3ff' },
  image: { from: '#ec4899', to: '#f97316', light: '#fdf2f8' },
  scan: { from: '#14b8a6', to: '#10b981', light: '#f0fdfa' },
  printer: { from: '#475569', to: '#1e293b', light: '#f8fafc' },
  file: { from: '#3b82f6', to: '#8b5cf6', light: '#eff6ff' },
  pdf: { from: '#ef4444', to: '#f97316', light: '#fef2f2' },
  user: { from: '#6366f1', to: '#8b5cf6', light: '#eef2ff' },
  monitor: { from: '#059669', to: '#06b6d4', light: '#ecfdf5' },
};

export default function ServiceCard({ service }: { service: Service }) {
  const { lang, t } = useLanguage();
  const category = getCategoryById(service.categoryId, lang);
  const colors = gradients[service.iconName] || gradients['file'];
  const comingText = lang === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon';

  return (
    <div className="group relative flex h-full flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-violet-200">
      {/* Colorful top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[20px]" style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }} />
      
      {service.status === 'coming-soon' && (
        <span className="absolute right-4 top-6 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">{comingText}</span>
      )}

      {/* ICON - Always visible, colorful */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
          <div className="text-white">
            <ServiceIcon name={service.iconName} className="h-6 w-6" />
          </div>
        </div>
        {category && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">{category.name}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="mt-4 line-clamp-2 font-display text-[15px] font-bold leading-5 text-slate-900">{service.name}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-[12.5px] leading-5 text-slate-500">{service.shortDescription}</p>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        <span>{service.estimatedTime}</span>
      </div>

      {/* Button - Always visible */}
      <Link to={`/services/${service.slug}`} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]" style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }}>
        {t('detail.viewDetails')} <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
