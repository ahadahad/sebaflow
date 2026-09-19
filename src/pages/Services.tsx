import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { getServices } from '../data/services';
import { getCategories, getCategoryBySlug } from '../data/categories';
import ServiceCard from '../components/ServiceCard';
import { useLanguage } from '../lib/i18n';

export default function ServicesPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialStatus = searchParams.get('status') || 'all';

  const [query, setQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCat);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState<'name' | 'popular'>('name');

  const categories = getCategories(lang);
  const allServices = getServices(lang);

  useEffect(() => {
    const p = new URLSearchParams();
    if (category !== 'all') p.set('category', category);
    if (query) p.set('q', query);
    if (status !== 'all') p.set('status', status);
    setSearchParams(p, { replace: true });
  }, [category, query, status]);

  const filtered = useMemo(() => {
    let list = [...allServices];
    if (category !== 'all') {
      const resolved = getCategoryBySlug(category, lang);
      if (resolved) list = list.filter(s => s.categoryId === resolved.id);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q) || s.longDescription.toLowerCase().includes(q));
    }
    if (status !== 'all') list = list.filter((s) => s.status === status);
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === 'popular') list.sort((a,b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    return list;
  }, [query, category, status, sort, allServices, lang]);

  const clear = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-blue-50 px-3 py-1 text-[11px] font-bold text-violet-700 ring-1 ring-violet-100">
            <Sparkles className="h-3 w-3" /> {allServices.length} {t('services.found')}
          </div>
          <h1 className="mt-3 font-display text-[34px] font-bold leading-[0.9] tracking-tight text-ink-900 sm:text-[46px]">{t('services.title')}</h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-6 text-ink-500">{t('services.desc')}</p>
        </div>
        <div className="rounded-full bg-ink-900 px-4 py-2 text-[12px] font-bold text-white shadow-sm">{filtered.length} {t('services.found')}</div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="h-fit rounded-[24px] border border-ink-100 bg-white p-6 shadow-soft lg:sticky lg:top-[88px]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> {t('services.filters')}
          </div>

          <div className="mt-6">
            <label className="label">{t('services.search')}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('services.searchPh')} className="input-pill pl-11" />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-100 p-1.5 hover:bg-ink-200">
                  <X className="h-3.5 w-3.5 text-ink-600" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="label">{t('services.category')}</label>
            <div className="space-y-2">
              <button onClick={() => setCategory('all')} className={`w-full rounded-xl border px-4 py-3 text-left text-[13.5px] font-semibold transition ${category === 'all' ? 'border-ink-900 bg-ink-900 text-white shadow-sm' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'}`}>
                {t('services.allCat')}
              </button>
              {categories.map((c) => {
                const isActive = category === c.slug || category === c.id;
                return (
                  <button key={c.id} onClick={() => setCategory(c.slug)} className={`w-full rounded-xl border px-4 py-3 text-left text-[13.5px] font-semibold transition ${isActive ? 'border-transparent bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-brand' : 'border-ink-200 bg-white text-ink-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'}`}>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('services.availability')}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-[13px]">
                <option value="all">{t('services.all')}</option>
                <option value="available">{t('services.available')}</option>
                <option value="coming-soon">{t('services.coming')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('services.sort')}</label>
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input text-[13px]">
                <option value="name">{t('services.nameAZ')}</option>
                <option value="popular">{t('services.popularFirst')}</option>
              </select>
            </div>
          </div>

          <button onClick={clear} className="btn-secondary mt-6 w-full justify-center rounded-full border-ink-200">
            {t('services.clear')}
          </button>
        </div>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-ink-200 bg-ink-50/60 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-ink-100">
                <Search className="h-5 w-5 text-ink-500" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-ink-900">{t('services.empty')}</h3>
              <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] leading-6 text-ink-500">{t('services.emptyDesc')}</p>
              <button onClick={clear} className="btn-primary mt-6 rounded-full">
                {t('services.clear')}
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
