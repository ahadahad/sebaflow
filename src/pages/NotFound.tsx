import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export default function NotFound() {
  const { t, lang } = useLanguage();
  return (
    <div className="container-shell py-20 text-center">
      <div className="mx-auto max-w-[480px] rounded-[32px] border border-ink-100 bg-white p-10 shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white font-display font-bold">{lang === 'bn' ? '৪০৪' : '404'}</div>
        <h1 className="mt-5 font-display text-[24px] font-bold text-ink-900">{t('404.title')}</h1>
        <p className="mt-2 text-[14px] leading-6 text-ink-500">{t('404.desc')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary rounded-full">{t('404.home')}</Link>
          <Link to="/services" className="btn-secondary rounded-full">{t('common.browse')}</Link>
        </div>
      </div>
    </div>
  );
}
