import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLocalizedConfig } from '../data/config';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export default function Contact() {
  const { lang, t } = useLanguage();
  const cfg = getLocalizedConfig(lang);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message || !form.phone) {
      setError(lang === 'bn' ? 'অনুগ্রহ করে নাম, ফোন এবং বার্তা পূরণ করুন।' : 'Please fill name, phone, and message.');
      return;
    }
    setError('');
    const list = JSON.parse(localStorage.getItem('shebaflow_contacts') || '[]');
    list.push({ ...form, at: new Date().toISOString(), lang });
    localStorage.setItem('shebaflow_contacts', JSON.stringify(list));
    setSent(true);
  };

  return (
    <div className="container-shell py-10 sm:py-16">
      <div className="mx-auto max-w-[1080px] grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="font-display text-[34px] font-bold leading-[0.9] tracking-tight text-ink-900 sm:text-[48px]">{t('contact.title')}</h1>
          <p className="mt-4 max-w-[440px] text-[15px] leading-6 text-ink-500">{t('contact.desc')}</p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Phone, label: t('contact.phone'), value: cfg.contact.phone },
              { icon: Mail, label: t('contact.email'), value: cfg.contact.email },
              { icon: MapPin, label: t('contact.address'), value: cfg.contact.address },
              { icon: Clock, label: t('contact.hours'), value: cfg.contact.hours },
            ].map(i => (
              <div key={i.label} className="flex gap-3 rounded-[20px] border border-ink-100 bg-white p-4 shadow-soft">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-700 ring-1 ring-ink-100"><i.icon className="h-4 w-4" /></div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">{i.label}</div>
                  <div className="mt-1 text-[13.5px] font-medium text-ink-900">{i.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-[12px] leading-5 text-amber-900 ring-1 ring-amber-100">
            {t('contact.placeholderNote')}
          </div>

          <div className="mt-6 flex gap-2">
            <Link to="/services" className="btn-secondary rounded-full text-[13px]">{t('common.browse')}</Link>
            <Link to="/about" className="btn-ghost rounded-full text-[13px]">{t('common.about')}</Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          {sent ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">✓</div>
              <h3 className="mt-4 font-display text-[20px] font-semibold text-ink-900">{t('contact.received')}</h3>
              <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] leading-6 text-ink-500">{t('contact.receivedDesc')}</p>
              <button onClick={() => setSent(false)} className="btn-secondary mt-6 rounded-full">{t('contact.another')}</button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-[20px] font-semibold text-ink-900">{t('contact.send')}</h2>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label">{t('contact.fullName')}</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">{t('contact.phoneLabel')}</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+880..." />
                  </div>
                  <div>
                    <label className="label">{t('contact.emailLabel')}</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="label">{t('contact.message')}</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} className="input resize-none rounded-[20px]" placeholder={t('contact.messagePh')} />
                </div>
                {error && <p className="text-[12px] text-red-600">{error}</p>}
                <button type="submit" className="btn-primary w-full justify-center rounded-full h-[48px]">{t('contact.sendBtn')}</button>
                <p className="text-center text-[11px] text-ink-400">Demo form — data saved in localStorage.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
