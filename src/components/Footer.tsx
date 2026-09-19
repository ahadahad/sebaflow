import { Link } from 'react-router-dom';
import { getCategories } from '../data/categories';
import { getLocalizedConfig } from '../data/config';
import { useLanguage } from '../lib/i18n';

export default function Footer() {
  const { lang, t } = useLanguage();
  const categories = getCategories(lang);
  const cfg = getLocalizedConfig(lang);

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-violet-100 bg-gradient-to-br from-violet-50/50 via-white to-blue-50/50">
      <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-200 opacity-20 blur-[100px]" />
      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 opacity-20 blur-[100px]" />
      <div className="container-shell relative py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo-icon.png" alt="ShebaFlow logo" className="h-10 w-10 rounded-xl object-contain shadow-sm ring-1 ring-ink-100" />
              <span className="font-display text-[20px] font-bold tracking-tight text-ink-900">ShebaFlow</span>
            </div>
            <p className="mt-4 max-w-[320px] text-[14px] leading-6 text-ink-600">
              {cfg.description} {lang === 'bn' ? 'সহজ, গোছানো এবং বন্ধুত্বপূর্ণ সহায়তা।' : 'Simple, organized, and friendly assistance.'}
            </p>
            <div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4 shadow-soft">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">{t('footer.demoTitle')}</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink-600">{t('footer.demoDesc')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-ink-900">{t('footer.services')}</h4>
            <ul className="mt-4 space-y-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/services?category=${c.slug}`} className="text-[14px] text-ink-600 hover:text-brand-700 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services" className="text-[14px] font-semibold text-brand-600 hover:text-brand-700">
                  {t('footer.viewAll')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-ink-900">{t('footer.company')}</h4>
            <ul className="mt-4 space-y-3 text-[14px] text-ink-600">
              <li><Link to="/about" className="hover:text-brand-700">{t('footer.about')}</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-brand-700">{t('footer.how')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-700">{t('footer.contact')}</Link></li>
              <li><Link to="/inquiry" className="hover:text-brand-700">{t('footer.inquiry')}</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-700">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-brand-700">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-ink-900">{t('footer.contactTitle')}</h4>
            <div className="mt-4 space-y-3 text-[14px] leading-6 text-ink-600">
              <p>{cfg.contact.phone}<br /><span className="text-[12px] text-ink-400">{t('footer.phoneNote')}</span></p>
              <p>{cfg.contact.email}<br /><span className="text-[12px] text-ink-400">{t('footer.emailNote')}</span></p>
              <p>{cfg.contact.address}</p>
              <p className="text-[12.5px] text-ink-500">{cfg.contact.hours}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-violet-100 pt-6 text-[13px] text-ink-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ShebaFlow. {t('footer.copy')}</p>
          <p className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 px-3 py-1 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200">{t('footer.made')} • {cfg.altTagline}</p>
        </div>
      </div>
    </footer>
  );
}
