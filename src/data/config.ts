import type { Lang } from '../lib/i18n';

type Localized = { en: string; bn: string };

type SiteConfig = {
  name: string;
  tagline: Localized;
  altTagline: Localized;
  description: Localized;
  url: string;
  contact: {
    phone: string;
    email: string;
    address: Localized;
    hours: Localized;
  };
};

export const siteConfig: SiteConfig = {
  name: 'ShebaFlow',
  tagline: { en: 'Your Digital Service Hub', bn: 'আপনার ডিজিটাল সেবা হাব' },
  altTagline: { en: 'Simple Services. Smarter Solutions.', bn: 'সহজ সেবা, স্মার্ট সমাধান' },
  description: {
    en: 'Discover convenient digital, document, education, photo, and technical services through ShebaFlow.',
    bn: 'ShebaFlow এর মাধ্যমে ডিজিটাল, ডকুমেন্ট, শিক্ষা, ফটো এবং টেকনিক্যাল সেবা সহজে খুঁজুন। বাংলাদেশের জন্য তৈরি।',
  },
  url: 'https://shebaflow.example.com',
  contact: {
    phone: '+880 1XXX-XXXXXX',
    email: 'support@shebaflow.example.com',
    address: { en: 'Service Hub, Dhaka, Bangladesh (Demo Address)', bn: 'সেবা হাব, ঢাকা, বাংলাদেশ (ডেমো ঠিকানা)' },
    hours: { en: 'Saturday - Thursday: 9:00 AM - 7:00 PM', bn: 'শনিবার - বৃহস্পতিবার: সকাল ৯টা - সন্ধ্যা ৭টা' },
  },
};

export function getLocalizedConfig(lang: Lang) {
  return {
    name: siteConfig.name,
    tagline: siteConfig.tagline[lang],
    altTagline: siteConfig.altTagline[lang],
    description: siteConfig.description[lang],
    url: siteConfig.url,
    contact: {
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      address: siteConfig.contact.address[lang],
      hours: siteConfig.contact.hours[lang],
    },
  };
}
