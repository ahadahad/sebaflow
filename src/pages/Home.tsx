import { Link } from 'react-router-dom';
import { ArrowRight, Check, Search, Sparkles, Zap, Shield, Layers, Users, Star } from 'lucide-react';
import { getCategories } from '../data/categories';
import { getPopularServices, getServices } from '../data/services';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';
import { ServiceIcon } from '../components/Icons';
import { useLanguage } from '../lib/i18n';

export default function Home() {
  const { lang, t } = useLanguage();
  const categories = getCategories(lang);
  const services = getServices(lang);
  const popular = getPopularServices(lang).slice(0, 6);

  return (
    <div className="overflow-x-hidden">
      {/* HERO - Colorful */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50" />
          <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200 to-blue-200 blur-[100px] opacity-30 animate-float" />
          <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-200 to-orange-200 blur-[100px] opacity-20 animate-float-delayed" />
        </div>

        <div className="container-shell grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 px-4 py-1.5 text-[12px] font-semibold text-violet-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-white"><Sparkles className="h-3 w-3" /></span>
              {t('hero.badge')}
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h1 className="mt-6 max-w-[600px] font-display text-[40px] font-extrabold leading-[0.9] tracking-tight text-ink-900 sm:text-[52px] lg:text-[64px]">
              <span className="block">{t('hero.title1')}</span>
              <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent pb-1">{t('hero.title2')}</span>
              <span className="block">{t('hero.title3')}</span>
            </h1>

            <p className="mt-5 max-w-[480px] text-[16px] leading-7 text-ink-600">{t('hero.desc')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="btn-primary h-[48px] px-7">{t('hero.cta1')} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="btn-secondary h-[48px] px-7 rounded-full">{t('hero.cta2')}</Link>
            </div>

            <div className="mt-10 grid max-w-[520px] grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Zap, label: lang === 'bn' ? 'দ্রুত' : 'Fast', grad: 'from-amber-400 to-orange-500' },
                { icon: Shield, label: lang === 'bn' ? 'নিরাপদ' : 'Secure', grad: 'from-emerald-400 to-teal-500' },
                { icon: Layers, label: lang === 'bn' ? 'গোছানো' : 'Organized', grad: 'from-blue-400 to-violet-500' },
                { icon: Users, label: lang === 'bn' ? 'বন্ধুত্বপূর্ণ' : 'Friendly', grad: 'from-pink-400 to-rose-500' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 rounded-2xl border border-ink-100 bg-white px-3 py-2.5 shadow-soft">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${f.grad} text-white`}><f.icon className="h-4 w-4" /></div>
                  <span className="text-[12px] font-semibold text-ink-700">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${['from-violet-500 to-purple-600','from-blue-500 to-cyan-500','from-pink-500 to-orange-500'][i-1]} flex items-center justify-center text-[10px] font-bold text-white`}>{String.fromCharCode(64+i)}</div>
                ))}
              </div>
              <div className="text-[13px]"><div className="flex items-center gap-1 font-semibold text-ink-900"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5</div><div className="text-ink-500">{lang === 'bn' ? '২,০০০+ ব্যবহারকারী' : '2,000+ users'}</div></div>
            </div>
          </div>

          <div className="relative lg:pl-6">
            <div className="relative rounded-[32px] border border-white bg-white/80 p-3 shadow-soft-lg backdrop-blur">
              <div className="absolute -inset-3 -z-10 rounded-[32px] bg-gradient-to-br from-violet-200 via-blue-200 to-pink-200 blur-xl opacity-40" />
              <div className="rounded-[24px] bg-ink-50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-amber-400" /><div className="h-3 w-3 rounded-full bg-emerald-400" /></div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink-600 shadow-sm ring-1 ring-ink-100"><Search className="h-3 w-3 text-violet-500" />{t('hero.search')}</div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {categories.map((c, i) => (
                    <div key={c.id} className="rounded-xl border border-ink-100 bg-white p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${['from-blue-500 to-cyan-500','from-violet-500 to-purple-500','from-amber-500 to-orange-500','from-emerald-500 to-teal-500'][i]} text-white`}><ServiceIcon name={c.iconName} className="h-4 w-4" /></div>
                      <div className="mt-2 h-2 w-10 rounded-full bg-ink-100" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {services.slice(0,3).map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-sm">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${['from-blue-500 to-cyan-500','from-violet-500 to-purple-500','from-pink-500 to-orange-500'][idx]} text-white`}><ServiceIcon name={s.iconName} className="h-4 w-4" /></div>
                      <div className="flex-1"><div className="h-2 w-24 rounded-full bg-ink-900" /><div className="mt-1 h-1.5 w-16 rounded-full bg-ink-200" /></div>
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-soft-lg lg:flex gap-3 items-center animate-float">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white"><Check className="h-5 w-5" /></div>
                <div><div className="text-[12px] font-bold text-ink-900">{t('hero.inquiry')}</div><div className="text-[11px] text-ink-500">{t('hero.inquirySub')}</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-white">
        <div className="container-shell grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: t('trust.easy'), desc: t('trust.easyDesc'), grad: 'from-blue-500 to-cyan-500' },
            { title: t('trust.clear'), desc: t('trust.clearDesc'), grad: 'from-violet-500 to-purple-500' },
            { title: t('trust.friendly'), desc: t('trust.friendlyDesc'), grad: 'from-pink-500 to-rose-500' },
            { title: t('trust.digital'), desc: t('trust.digitalDesc'), grad: 'from-emerald-500 to-teal-500' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.grad} text-white`}><Check className="h-4 w-4" /></div>
              <div><p className="text-[14px] font-semibold text-ink-900">{item.title}</p><p className="mt-1 text-[12.5px] leading-5 text-ink-500">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-16 sm:py-24">
        <div className="max-w-[520px]">
          <h2 className="font-display text-[32px] font-bold leading-[0.9] tracking-tight text-ink-900 sm:text-[44px]">{t('cat.title')}</h2>
          <p className="mt-3 text-[15px] leading-6 text-ink-500">{t('cat.subtitle')}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(c => {
            const count = services.filter(s => s.categoryId === c.id).length;
            return <CategoryCard key={c.id} category={c} count={count} />;
          })}
        </div>
      </section>

      <section className="bg-ink-50/60 py-16 sm:py-24 border-y border-ink-100">
        <div className="container-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="font-display text-[28px] font-bold tracking-tight text-ink-900 sm:text-[36px]">{t('popular.title')}</h2><p className="mt-2 text-[14px] text-ink-500">{t('popular.desc')}</p></div>
            <Link to="/services" className="btn-secondary hidden sm:inline-flex rounded-full">{t('popular.viewAll')} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-shell py-16 sm:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1.5 text-[11px] font-bold tracking-widest text-white">{t('how.badge')}</span>
          <h2 className="mt-4 font-display text-[32px] font-bold tracking-tight text-ink-900 sm:text-[44px]">{t('how.title')}</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {[
            { n: '01', title: t('how.1.title'), desc: t('how.1.desc'), grad: 'from-blue-500 to-cyan-500' },
            { n: '02', title: t('how.2.title'), desc: t('how.2.desc'), grad: 'from-violet-500 to-purple-500' },
            { n: '03', title: t('how.3.title'), desc: t('how.3.desc'), grad: 'from-pink-500 to-orange-500' },
            { n: '04', title: t('how.4.title'), desc: t('how.4.desc'), grad: 'from-emerald-500 to-teal-500' },
          ].map(step => (
            <div key={step.n} className="relative overflow-hidden rounded-[24px] border border-ink-100 bg-white p-6 shadow-soft">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${step.grad}`} />
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.grad} text-white font-bold text-[13px]`}>{step.n}</div>
              <h3 className="mt-4 text-[16px] font-bold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-ink-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 py-16 sm:py-24 text-white">
        <div className="container-shell grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[32px] font-bold leading-[0.9] sm:text-[48px]">{t('why.title')}</h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-7 text-white/60">{t('why.desc')}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[t('why.1'), t('why.2'), t('why.3'), t('why.4'), t('why.5'), t('why.6')].map(txt => (
                <div key={txt} className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink-900"><Check className="h-3 w-3" /></span>
                  <span className="text-[13px] font-medium text-white/90">{txt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-2">
            <div className="rounded-[20px] bg-ink-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white font-bold">S</div>
                <div><div className="text-[14px] font-bold text-ink-900">{t('why.principles')}</div><div className="text-[12px] text-ink-500">{t('why.principlesSub')}</div></div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { k: t('why.p1.t'), v: t('why.p1.d') },
                  { k: t('why.p2.t'), v: t('why.p2.d') },
                  { k: t('why.p3.t'), v: t('why.p3.d') },
                ].map(p => (
                  <div key={p.k} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
                    <div className="text-[13px] font-bold text-ink-900">{p.k}</div>
                    <div className="mt-1 text-[12px] leading-5 text-ink-500">{p.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 sm:py-24">
        <div className="rounded-[32px] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-[1px] shadow-brand-lg">
          <div className="rounded-[31px] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-[520px]"><h2 className="font-display text-[28px] font-bold leading-tight text-white sm:text-[36px]">{t('cta.title')}</h2><p className="mt-3 text-[15px] leading-6 text-white/80">{t('cta.desc')}</p></div>
              <div className="flex gap-3">
                <Link to="/services" className="inline-flex h-[48px] items-center justify-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold text-ink-900 shadow-lg hover:bg-ink-50">{t('hero.cta1')} <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/contact" className="inline-flex h-[48px] items-center justify-center rounded-full bg-ink-900 px-7 text-[14px] font-semibold text-white ring-1 ring-white/20 hover:bg-black">{t('hero.cta2')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
