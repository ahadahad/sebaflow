import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, FileText, ListOrdered, HelpCircle, ChevronDown, ShieldAlert, Camera, Sparkles } from 'lucide-react';
import { getServiceBySlug } from '../data/services';
import { getCategoryById } from '../data/categories';
import { ServiceIcon } from '../components/Icons';
import { useLanguage } from '../lib/i18n';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const service = slug ? getServiceBySlug(slug, lang) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!service) return <Navigate to="/404" replace />;

  const category = getCategoryById(service.categoryId, lang);
  const isPhotoService = ['passport-size-photo-preparation', 'photo-background-removal', 'photo-enhancement', 'photo-editing', 'document-scanning'].includes(service.slug);

  return (
    <div className="container-shell py-8 sm:py-12">
      <Link to="/services" className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-[13px] font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-100">
        <ArrowLeft className="h-4 w-4" /> {t('detail.back')}
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-sm">
              <ServiceIcon name={service.iconName} className="h-6 w-6" />
            </div>
            {category && <span className="rounded-full bg-ink-50 px-3 py-1 text-[12px] font-medium text-ink-700 ring-1 ring-ink-100">{category.name}</span>}
            <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ${service.status === 'available' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
              {service.status === 'available' ? t('services.available') : t('services.coming')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] text-ink-600 shadow-sm ring-1 ring-ink-100">
              <Clock className="h-3.5 w-3.5" /> {service.estimatedTime}
            </span>
          </div>

          <h1 className="mt-5 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink-900 sm:text-[38px]">{service.name}</h1>
          <p className="mt-4 max-w-[680px] text-[16px] leading-7 text-ink-600">{service.longDescription}</p>

          {isPhotoService && (
            <div className="mt-6 rounded-[20px] border border-violet-200 bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-brand">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display flex items-center gap-2 text-[16px] font-bold text-ink-900">
                    {lang === 'bn' ? 'অনলাইন ফটো স্টুডিও চালু করুন' : 'Launch Online Photo Studio'}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> POWER MODE</span>
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-ink-600">{lang === 'bn' ? 'আমাদের প্রো ফটো স্টুডিওতে সরাসরি পাসপোর্ট ছবি তৈরি করুন — ক্রপ, ব্যাকগ্রাউন্ড রিমুভ, কালার চেঞ্জ, জয়েন্ট ফটো প্রিন্ট শীট সহ। আপনার রেফারেন্স ছবির মতো ডার্ক থিম প্রো এডিটর।' : 'Create passport photos directly in our Pro Photo Studio — crop, background remove, color change, joint photo print sheet. Dark theme pro editor like your reference.'}</p>
                  <Link to="/studio/passport-photo" className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-brand transition hover:from-violet-700 hover:to-blue-700 hover:shadow-brand-lg hover:scale-[1.02]">
                    <Sparkles className="h-4 w-4" /> {lang === 'bn' ? '🎨 স্টুডিও খুলুন' : '🎨 Open Studio'} <span>→</span>
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-violet-100"><span className="font-bold text-violet-700">✓</span> 40x50mm BD</div>
                <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-violet-100"><span className="font-bold text-violet-700">✓</span> Remove BG</div>
                <div className="rounded-lg bg-white/70 px-2.5 py-2 ring-1 ring-violet-100"><span className="font-bold text-violet-700">✓</span> Joint Photo</div>
              </div>
            </div>
          )}

          <div className="mt-8 rounded-[20px] border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex gap-2.5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-[13px] leading-5 text-amber-900">{t('detail.warning')}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <div className="rounded-[20px] border border-ink-100 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
                <CheckCircle2 className="h-5 w-5 text-brand-600" /> {t('detail.included')}
              </div>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-[13.5px] leading-5 text-ink-700 ring-1 ring-ink-100">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[20px] border border-ink-100 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
                  <FileText className="h-5 w-5 text-ink-700" /> {t('detail.docs')}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {service.requiredDocuments.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[13.5px] leading-5 text-ink-700">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" /> {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[20px] border border-ink-100 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
                  <ListOrdered className="h-5 w-5 text-ink-700" /> {t('detail.steps')}
                </div>
                <ol className="mt-4 space-y-3">
                  {service.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">{i + 1}</span>
                      <span className="text-[13.5px] leading-5 text-ink-700">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="rounded-[20px] border border-ink-100 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
                <HelpCircle className="h-5 w-5 text-ink-700" /> {t('detail.faq')}
              </div>
              <div className="mt-4 divide-y divide-ink-100 rounded-xl border border-ink-100">
                {service.faqs.map((f, i) => (
                  <div key={i} className="bg-white first:rounded-t-xl last:rounded-b-xl">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left">
                      <span className="text-[14px] font-medium text-ink-900">{f.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-ink-500 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-all ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-[13.5px] leading-6 text-ink-600">{f.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit lg:sticky lg:top-[88px]">
          <div className="rounded-[24px] border border-ink-100 bg-white p-6 shadow-soft-lg">
            <h3 className="font-display text-[18px] font-bold text-ink-900">{t('detail.request')}</h3>
            <p className="mt-2 text-[13.5px] leading-6 text-ink-600">{t('detail.requestDesc')}</p>

            <div className="mt-5 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold uppercase tracking-widest text-ink-500">{t('detail.service')}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${service.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{service.status === 'available' ? t('services.available') : t('services.coming')}</span>
              </div>
              <div className="mt-2 text-[14px] font-semibold text-ink-900">{service.name}</div>
              <div className="mt-1 flex items-center gap-1 text-[12px] text-ink-500"><Clock className="h-3 w-3" /> {service.estimatedTime}</div>
            </div>

            <div className="mt-5 grid gap-3">
              {isPhotoService ? (
                <Link to="/studio/passport-photo" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-[14px] font-bold text-white shadow-brand hover:from-violet-700 hover:to-blue-700">
                  <Camera className="h-4 w-4" /> {lang === 'bn' ? 'ফটো স্টুডিও খুলুন' : 'Open Photo Studio'}
                </Link>
              ) : null}
              <Link to={`/inquiry?service=${service.slug}`} className="btn-primary w-full justify-center">
                {t('detail.requestBtn')}
              </Link>
              <Link to="/contact" className="btn-secondary w-full justify-center">
                {t('detail.contactBtn')}
              </Link>
            </div>

            <p className="mt-4 text-center text-[11.5px] leading-4 text-ink-500">{t('detail.agree')}</p>
          </div>

          <div className="mt-4 rounded-[20px] border border-ink-100 bg-ink-50 p-5">
            <div className="text-[13px] font-semibold text-ink-900">{t('detail.needElse')}</div>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-600">{t('detail.needElseDesc')}</p>
            <Link to="/services" className="btn-secondary mt-3 w-full justify-center text-[13px]">{t('detail.browseAll')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
