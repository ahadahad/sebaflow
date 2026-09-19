import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="container-shell py-12 sm:py-20">
      <div className="mx-auto max-w-[800px]">
        <span className="inline-flex rounded-full border border-ink-200 bg-white px-3 py-1 text-[10px] font-semibold tracking-widest text-ink-500 uppercase">{t('about.badge')}</span>
        <h1 className="mt-5 font-display text-[36px] font-bold leading-[0.9] tracking-tight text-ink-900 sm:text-[56px] text-balance">{t('about.title')}</h1>
        <p className="mt-6 text-[17px] leading-8 text-ink-600">{t('about.desc')}</p>

        <div className="mt-14 grid gap-6">
          <section className="rounded-[28px] border border-ink-100 bg-white p-8 shadow-soft">
            <h2 className="font-display text-[22px] font-bold text-ink-900">{t('about.mission')}</h2>
            <p className="mt-3 text-[14.5px] leading-7 text-ink-600">{t('about.missionDesc')}</p>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[24px] border border-ink-100 bg-white p-6 shadow-soft">
              <h3 className="font-display text-[16px] font-semibold text-ink-900">{t('about.what')}</h3>
              <ul className="mt-4 space-y-2.5 text-[13.5px] leading-6 text-ink-500">
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('why.1')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('why.2')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('why.3')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('why.4')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('why.5')}</li>
              </ul>
            </div>
            <div className="rounded-[24px] border border-ink-100 bg-white p-6 shadow-soft">
              <h3 className="font-display text-[16px] font-semibold text-ink-900">{t('about.how')}</h3>
              <ul className="mt-4 space-y-2.5 text-[13.5px] leading-6 text-ink-500">
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('how.1.desc')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('how.2.desc')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('how.3.desc')}</li>
                <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-ink-900 shrink-0" /> {t('how.4.desc')}</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[32px] bg-ink-900 p-8 text-white">
            <h2 className="font-display text-[22px] font-bold">{t('about.principles')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { t: t('why.p1.t'), d: t('why.p1.d') },
                { t: t('why.p2.t'), d: t('why.p2.d') },
                { t: t('why.p3.t'), d: t('why.p3.d') },
                { t: 'Helpfulness', d: t('trust.friendlyDesc') },
              ].map(p => (
                <div key={p.t} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <div className="text-[13px] font-semibold">{p.t}</div>
                  <div className="mt-1 text-[12.5px] leading-5 text-white/60">{p.d}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-5 text-white/40">{t('about.note')}</p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary rounded-full">{t('popular.viewAll')}</Link>
            <Link to="/contact" className="btn-secondary rounded-full">{t('detail.contactBtn')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
