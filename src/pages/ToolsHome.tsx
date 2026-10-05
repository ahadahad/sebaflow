import { ArrowRight, Check, FileImage, IdCard, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolTopBar from '../components/ToolTopBar';
import { useLanguage } from '../lib/i18n';

type ToolCard = {
  id: 'passport' | 'nid' | 'a4';
  to: string;
  icon: typeof FileImage;
  accent: string;
  iconClass: string;
  en: {
    title: string;
    description: string;
    action: string;
    details: string[];
  };
  bn: {
    title: string;
    description: string;
    action: string;
    details: string[];
  };
};

const tools: ToolCard[] = [
  {
    id: 'passport',
    to: '/passport-image',
    icon: FileImage,
    accent: 'from-cyan-400 via-teal-400 to-emerald-500',
    iconClass: 'bg-teal-50 text-teal-700 ring-teal-100',
    en: {
      title: 'Passport Image',
      description: 'Create a clean, correctly sized passport photograph from your own image.',
      action: 'Create passport image',
      details: ['40 × 50 mm at 300 DPI', 'White or light-blue background', 'Download or print-ready output'],
    },
    bn: {
      title: 'পাসপোর্ট ছবি',
      description: 'নিজের ছবি থেকে পরিষ্কার ও সঠিক মাপের পাসপোর্ট ছবি তৈরি করুন।',
      action: 'পাসপোর্ট ছবি তৈরি করুন',
      details: ['৪০ × ৫০ মিমি, ৩০০ DPI', 'সাদা বা হালকা নীল ব্যাকগ্রাউন্ড', 'ডাউনলোড বা প্রিন্ট-রেডি আউটপুট'],
    },
  },
  {
    id: 'nid',
    to: '/nid-print-ready',
    icon: IdCard,
    accent: 'from-violet-500 via-fuchsia-500 to-pink-500',
    iconClass: 'bg-violet-50 text-violet-700 ring-violet-100',
    en: {
      title: 'NID Print Ready',
      description: 'Place your NID front and back at their proper physical card size on an A4 sheet.',
      action: 'Make NID print sheet',
      details: ['Front and back upload', 'Actual 85.6 × 54 mm card size', 'A4 layout with crop marks'],
    },
    bn: {
      title: 'এনআইডি প্রিন্ট রেডি',
      description: 'এনআইডির সামনে ও পেছনের ছবি সঠিক কার্ড সাইজে একটি A4 শিটে সাজান।',
      action: 'এনআইডি প্রিন্ট শিট তৈরি করুন',
      details: ['সামনে ও পেছনের ছবি আপলোড', 'আসল ৮৫.৬ × ৫৪ মিমি কার্ড সাইজ', 'ক্রপ মার্কসহ A4 লেআউট'],
    },
  },
  {
    id: 'a4',
    to: '/a4-print-ready',
    icon: Printer,
    accent: 'from-amber-400 via-orange-500 to-rose-500',
    iconClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    en: {
      title: 'A4 Print Ready',
      description: 'Clean up and arrange multiple document images for sharp A4 printing at 300 DPI.',
      action: 'Prepare A4 documents',
      details: ['Multi-page document tray', 'Local crop and image cleanup', 'A4 PDF, PNG, and direct print'],
    },
    bn: {
      title: 'A4 প্রিন্ট রেডি',
      description: 'একাধিক ডকুমেন্ট ছবি পরিষ্কার করে ৩০০ DPI-তে A4 প্রিন্টের জন্য প্রস্তুত করুন।',
      action: 'A4 ডকুমেন্ট প্রস্তুত করুন',
      details: ['একাধিক পেজের তালিকা', 'লোকাল ক্রপ ও ইমেজ ক্লিনআপ', 'A4 PDF, PNG ও সরাসরি প্রিন্ট'],
    },
  },
];

export default function ToolsHome() {
  const { lang } = useLanguage();
  const isBangla = lang === 'bn';

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <ToolTopBar />

      <main>
        <section className="relative isolate overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_12%,rgba(20,184,166,.23),transparent_26%),radial-gradient(circle_at_90%_0%,rgba(139,92,246,.22),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_58%,#0f172a_100%)]" />
          <div className="absolute left-[8%] top-4 -z-10 h-60 w-60 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-[10%] -z-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-teal-200">
                <Sparkles className="h-3.5 w-3.5" />
                {isBangla ? 'বাংলাদেশের জন্য সহজ ফটো ও প্রিন্ট টুল' : 'Simple photo & print tools for Bangladesh'}
              </span>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {isBangla ? 'আপনার প্রয়োজনীয় ৩টি টুল' : 'Three tools. Everything you need.'}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-7 text-slate-300 sm:text-[17px]">
                {isBangla
                  ? 'পাসপোর্ট ছবি, এনআইডি প্রিন্ট শিট ও A4 প্রিন্ট ফাইল—দ্রুত তৈরি করুন। আপনার ছবি আপনার ব্রাউজারেই থাকে।'
                  : 'Create passport images, NID print sheets, and A4-ready files quickly. Your images stay in your browser.'}
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                {isBangla ? 'কোনো ছবি সার্ভারে আপলোড করা হয় না' : 'No image is uploaded to a server'}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-12 text-slate-900 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3 sm:mb-9">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">
                  {isBangla ? 'টুল বেছে নিন' : 'Choose a tool'}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {isBangla ? 'শুরু করতে নিচের যেকোনো একটি নির্বাচন করুন' : 'Select one tool to get started'}
                </h2>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                {isBangla ? '৩টি টুল উপলব্ধ' : '3 tools available'}
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {tools.map((tool, index) => {
                const content = tool[lang];
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    to={tool.to}
                    className="group relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl sm:p-7"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.accent}`} />
                    <span className="absolute right-6 top-5 text-6xl font-black leading-none text-slate-100 transition group-hover:text-slate-200">
                      0{index + 1}
                    </span>
                    <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${tool.iconClass}`}>
                      <Icon className="h-7 w-7" strokeWidth={2.2} />
                    </span>
                    <h3 className="relative mt-6 text-2xl font-extrabold tracking-tight text-slate-900">{content.title}</h3>
                    <p className="relative mt-3 min-h-[52px] text-[15px] leading-6 text-slate-600">{content.description}</p>
                    <ul className="relative mt-5 space-y-2.5">
                      {content.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={3} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="relative mt-auto inline-flex items-center gap-2 pt-7 text-sm font-extrabold text-teal-700">
                      {content.action}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 px-5 py-5 text-center text-xs text-slate-400 sm:px-6">
        {isBangla ? 'ShebaFlow • শুধু পাসপোর্ট, এনআইডি ও A4 প্রিন্ট টুল' : 'ShebaFlow • Passport, NID and A4 print tools only'}
      </footer>
    </div>
  );
}
