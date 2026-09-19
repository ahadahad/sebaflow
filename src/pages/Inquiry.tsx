import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getServices, getServiceBySlug } from '../data/services';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  serviceSlug: string;
  contactMethod: string;
  message: string;
  consent: boolean;
};

export default function Inquiry() {
  const { lang, t } = useLanguage();
  const [params] = useSearchParams();
  const preselected = params.get('service') || '';
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const allServices = getServices(lang);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    serviceSlug: preselected,
    contactMethod: 'phone',
    message: '',
    consent: false,
  });

  const selectedService = useMemo(() => (form.serviceSlug ? getServiceBySlug(form.serviceSlug, lang) : null), [form.serviceSlug, lang]);

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) e.fullName = lang === 'bn' ? 'পূর্ণ নাম আবশ্যক।' : 'Full name is required.';
    if (!form.phone.trim()) e.phone = lang === 'bn' ? 'ফোন নম্বর আবশ্যক।' : 'Phone number is required.';
    if (!form.serviceSlug) e.serviceSlug = lang === 'bn' ? 'একটি সেবা নির্বাচন করুন।' : 'Please select a service.';
    if (!form.consent) e.consent = lang === 'bn' ? 'সম্মতি দিতে হবে।' : 'Consent required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = lang === 'bn' ? 'সঠিক ইমেইল দিন।' : 'Enter valid email.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const inquiries = JSON.parse(localStorage.getItem('shebaflow_inquiries') || '[]');
    inquiries.push({ ...form, at: new Date().toISOString(), serviceName: selectedService?.name, lang });
    localStorage.setItem('shebaflow_inquiries', JSON.stringify(inquiries));
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="container-shell py-16 sm:py-24">
        <div className="mx-auto max-w-[560px] rounded-[32px] border border-ink-100 bg-white p-8 text-center shadow-soft-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-[24px] font-bold text-ink-900">{t('inquiry.received')}</h1>
          <p className="mt-3 text-[14px] leading-6 text-ink-500">{t('inquiry.receivedDesc')}</p>
          <div className="mt-6 rounded-2xl bg-ink-50 p-4 text-left ring-1 ring-ink-100">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">{t('inquiry.summary')}</div>
            <div className="mt-2 text-[14px] font-semibold text-ink-900">{selectedService?.name || form.serviceSlug}</div>
            <div className="mt-1 text-[13px] text-ink-600">{form.fullName} • {form.phone}</div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/services" className="btn-secondary flex-1 justify-center rounded-full">{t('inquiry.browse')}</Link>
            <Link to="/" className="btn-primary flex-1 justify-center rounded-full">{t('inquiry.goHome')}</Link>
          </div>
          <button onClick={() => setSubmitted(false)} className="btn-ghost mt-4 w-full">{t('inquiry.another')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[960px] grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-[0.9] tracking-tight text-ink-900 sm:text-[42px]">{t('inquiry.title')}</h1>
          <p className="mt-3 text-[14px] leading-6 text-ink-500">{t('inquiry.desc')}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[32px] border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">{t('inquiry.fullName')}</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input" placeholder={lang === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'} />
                {errors.fullName && <p className="mt-1.5 text-[12px] text-red-600">{errors.fullName}</p>}
              </div>
              <div>
                <label className="label">{t('inquiry.phone')}</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+880 1XXX-XXXXXX" />
                {errors.phone && <p className="mt-1.5 text-[12px] text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">{t('inquiry.email')}</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
                {errors.email && <p className="mt-1.5 text-[12px] text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="label">{t('inquiry.selectService')}</label>
              <select value={form.serviceSlug} onChange={e => setForm({ ...form, serviceSlug: e.target.value })} className="input">
                <option value="">{t('inquiry.choose')}</option>
                {allServices.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
              {errors.serviceSlug && <p className="mt-1.5 text-[12px] text-red-600">{errors.serviceSlug}</p>}
              {selectedService && (
                <div className="mt-3 rounded-2xl bg-ink-50 p-3 text-[12.5px] leading-5 text-ink-600 ring-1 ring-ink-100">
                  <span className="font-semibold text-ink-900">{selectedService.name}</span> — {selectedService.shortDescription}
                </div>
              )}
            </div>

            <div>
              <label className="label">{t('inquiry.contactMethod')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'phone', label: t('inquiry.phoneOpt') },
                  { id: 'email', label: t('inquiry.emailOpt') },
                  { id: 'whatsapp', label: t('inquiry.whatsapp') },
                ].map(o => (
                  <button key={o.id} type="button" onClick={() => setForm({ ...form, contactMethod: o.id })} className={`rounded-full border px-3 py-2.5 text-[13px] font-medium transition ${form.contactMethod === o.id ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">{t('inquiry.message')}</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="input resize-none rounded-[20px]" placeholder={t('inquiry.messagePh')} />
            </div>

            <label className="flex items-start gap-2.5 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100">
              <input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} className="mt-1 h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-900" />
              <span className="text-[12.5px] leading-5 text-ink-600">{t('inquiry.consent')}</span>
            </label>
            {errors.consent && <p className="-mt-3 text-[12px] text-red-600">{errors.consent}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 justify-center rounded-full h-[48px]">{t('inquiry.submit')}</button>
              <Link to="/services" className="btn-secondary flex-1 justify-center rounded-full h-[48px]">{t('inquiry.cancel')}</Link>
            </div>
            <p className="text-center text-[11px] leading-4 text-ink-400">{t('inquiry.note')}</p>
          </form>
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-[88px]">
          <div className="rounded-[28px] border border-ink-100 bg-white p-6 shadow-soft">
            <h3 className="text-[13px] font-semibold tracking-wide text-ink-900 uppercase">{t('inquiry.next')}</h3>
            <ol className="mt-4 space-y-3">
              {[t('inquiry.next1'), t('inquiry.next2'), t('inquiry.next3'), t('inquiry.next4')].map((tStr, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-5 text-ink-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">{i + 1}</span> {tStr}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[28px] bg-ink-900 p-6 text-white">
            <div className="text-[14px] font-semibold">{t('inquiry.help')}</div>
            <p className="mt-2 text-[13px] leading-6 text-white/60">{t('inquiry.helpDesc')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/contact" className="rounded-full bg-white px-4 py-2.5 text-center text-[13px] font-semibold text-ink-900">{t('detail.contactBtn')}</Link>
              <Link to="/services" className="rounded-full bg-white/10 px-4 py-2.5 text-center text-[13px] font-semibold text-white ring-1 ring-white/20">{t('services.title')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
