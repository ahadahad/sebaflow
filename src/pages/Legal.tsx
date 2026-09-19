import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export function Privacy() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  return (
    <div className="container-shell py-12 sm:py-20">
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-ink-100 bg-white p-8 shadow-soft sm:p-10">
        <h1 className="font-display text-[28px] font-bold leading-[0.9] text-ink-900">{isBn ? 'প্রাইভেসি পলিসি — খসড়া' : 'Privacy Policy — Draft'}</h1>
        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">{isBn ? 'প্লেসহোল্ডার খসড়া — আইনি রিভিউ করুন' : 'Placeholder draft — review legally'}</p>
        <div className="prose prose-sm mt-8 max-w-none text-[14px] leading-7 text-ink-600">
          {isBn ? (
            <>
              <p>ShebaFlow আপনার গোপনীয়তাকে সম্মান করে। এই খসড়া নীতিতে আমরা কী তথ্য সংগ্রহ করি এবং কীভাবে ব্যবহার করি তা ব্যাখ্যা করা হয়েছে।</p>
              <h3 className="mt-6 font-semibold text-ink-900">আমরা যে তথ্য সংগ্রহ করি</h3>
              <ul className="list-disc pl-5"><li>ইনকোয়ারি ও যোগাযোগ ফরমে আপনি যে তথ্য দেন।</li><li>সেবা নির্বাচন ও পছন্দ।</li><li>বেসিক ব্যবহার বিশ্লেষণ।</li></ul>
              <h3 className="mt-6 font-semibold text-ink-900">তথ্য কীভাবে ব্যবহার করি</h3>
              <ul className="list-disc pl-5"><li>আপনার ইনকোয়ারির উত্তর দিতে।</li><li>সেবার তথ্য ও অভিজ্ঞতা উন্নত করতে।</li><li>আমরা ব্যক্তিগত তথ্য বিক্রি করি না।</li></ul>
            </>
          ) : (
            <>
              <p>ShebaFlow respects your privacy. This draft policy explains what information we collect and how we use it.</p>
              <h3 className="mt-6 font-semibold text-ink-900">Information We Collect</h3>
              <ul className="list-disc pl-5"><li>Contact info via inquiry forms.</li><li>Service selection.</li><li>Basic usage analytics if enabled.</li></ul>
              <h3 className="mt-6 font-semibold text-ink-900">How We Use Information</h3>
              <ul className="list-disc pl-5"><li>To respond to inquiries.</li><li>To improve service info.</li><li>We do not sell personal data.</li></ul>
            </>
          )}
        </div>
        <Link to="/" className="btn-secondary mt-8 rounded-full">{t('404.home')}</Link>
      </div>
    </div>
  );
}

export function Terms() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  return (
    <div className="container-shell py-12 sm:py-20">
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-ink-100 bg-white p-8 shadow-soft sm:p-10">
        <h1 className="font-display text-[28px] font-bold leading-[0.9] text-ink-900">{isBn ? 'সেবার শর্তাবলী — খসড়া' : 'Terms of Service — Draft'}</h1>
        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">{isBn ? 'প্লেসহোল্ডার খসড়া — কাস্টমাইজ করুন' : 'Placeholder draft — customize'}</p>
        <div className="prose prose-sm mt-8 max-w-none text-[14px] leading-7 text-ink-600">
          {isBn ? (
            <>
              <p>ShebaFlow এ স্বাগতম। ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন।</p>
              <h3 className="mt-6 font-semibold text-ink-900">সেবার প্রকৃতি</h3>
              <p>ShebaFlow তথ্যগত সহায়তা ও গোছানো নির্দেশনা প্রদান করে। আমরা আইনি পরামর্শ দিই না, সরকারি অনুমোদন, ভিসা, চাকরি বা ভর্তির নিশ্চয়তা দিই না।</p>
            </>
          ) : (
            <>
              <p>Welcome to ShebaFlow. By using our website, you agree to these terms.</p>
              <h3 className="mt-6 font-semibold text-ink-900">Service Nature</h3>
              <p>ShebaFlow provides informational assistance. We do not provide legal advice, guarantee approvals, or submit applications on your behalf unless explicitly stated.</p>
            </>
          )}
        </div>
        <Link to="/" className="btn-secondary mt-8 rounded-full">{t('404.home')}</Link>
      </div>
    </div>
  );
}
