import type { Lang } from '../lib/i18n';

export type Category = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  iconName: 'files' | 'graduation' | 'camera' | 'monitor';
  color: string;
  gradient: string;
};

type CategoryData = {
  id: string;
  slug: string;
  iconName: 'files' | 'graduation' | 'camera' | 'monitor';
  color: string;
  gradient: string;
  en: Omit<Category, 'id' | 'slug' | 'iconName' | 'color' | 'gradient'>;
  bn: Omit<Category, 'id' | 'slug' | 'iconName' | 'color' | 'gradient'>;
};

const categoriesData: CategoryData[] = [
  {
    id: 'gov',
    slug: 'government-documents',
    iconName: 'files',
    color: 'bg-blue-50 text-blue-700 ring-blue-200',
    gradient: 'from-blue-500 to-cyan-500',
    en: {
      name: 'Government & Documents',
      shortName: 'Government',
      description: 'Assistance with official forms, document information, and organized guidance.',
      longDescription: 'Get clear, step-by-step assistance for government-related documents and online forms. We provide organized information, checklists, and friendly support — without promising approvals.',
    },
    bn: {
      name: 'সরকারি ও ডকুমেন্ট সেবা',
      shortName: 'সরকারি',
      description: 'সরকারি ফরম, ডকুমেন্ট তথ্য এবং গোছানো নির্দেশনার সহায়তা।',
      longDescription: 'পাসপোর্ট, ভিসা, এনআইডি, জন্ম নিবন্ধন সহ বিভিন্ন সরকারি ডকুমেন্টের তথ্য, চেকলিস্ট এবং সহজ নির্দেশনা পাবেন। আমরা অনুমোদনের নিশ্চয়তা দিই না, শুধু প্রস্তুতিতে সাহায্য করি।',
    }
  },
  {
    id: 'edu',
    slug: 'education-career',
    iconName: 'graduation',
    color: 'bg-violet-50 text-violet-700 ring-violet-200',
    gradient: 'from-violet-500 to-fuchsia-500',
    en: {
      name: 'Education & Career',
      shortName: 'Education',
      description: 'Support for admissions, scholarships, CVs, and academic formatting.',
      longDescription: 'From admission forms to scholarship applications and professional CVs — get structured help to present your information clearly and confidently.',
    },
    bn: {
      name: 'শিক্ষা ও ক্যারিয়ার',
      shortName: 'শিক্ষা',
      description: 'ভর্তি, স্কলারশিপ, সিভি এবং একাডেমিক ফরম্যাটিং সেবা।',
      longDescription: 'অনলাইন ভর্তি ফরম থেকে শুরু করে স্কলারশিপ আবেদন, প্রফেশনাল সিভি তৈরি এবং শিক্ষাগত ডকুমেন্ট ফরম্যাটিং — সবকিছু গোছানোভাবে।',
    }
  },
  {
    id: 'photo',
    slug: 'photo-design',
    iconName: 'camera',
    color: 'bg-amber-50 text-amber-700 ring-amber-200',
    gradient: 'from-amber-500 to-orange-500',
    en: {
      name: 'Photo & Design',
      shortName: 'Photo & Design',
      description: 'Professional photo preparation, editing, scanning and printing help.',
      longDescription: 'Passport photos, background removal, enhancement and document digitization — all prepared to common specifications with care.',
    },
    bn: {
      name: 'ফটো ও ডিজাইন সেবা',
      shortName: 'ফটো ও ডিজাইন',
      description: 'পাসপোর্ট ছবি, এডিটিং, স্ক্যানিং ও প্রিন্টিং সহায়তা।',
      longDescription: 'পাসপোর্ট সাইজ ছবি, ব্যাকগ্রাউন্ড রিমুভ, ছবি এনহ্যান্সমেন্ট এবং ডকুমেন্ট স্ক্যানিং — সবকিছু নির্ধারিত স্পেসিফিকেশন অনুযায়ী।',
    }
  },
  {
    id: 'digital',
    slug: 'digital-technical',
    iconName: 'monitor',
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    gradient: 'from-emerald-500 to-teal-500',
    en: {
      name: 'Digital & Technical',
      shortName: 'Digital',
      description: 'Everyday digital tasks, form filling, and document assistance.',
      longDescription: 'We help with online form filling, digital document preparation, PDF tasks, and general computer guidance — made simple and organized.',
    },
    bn: {
      name: 'ডিজিটাল ও টেকনিক্যাল',
      shortName: 'ডিজিটাল',
      description: 'অনলাইন ফরম পূরণ, ডিজিটাল ডকুমেন্ট এবং কম্পিউটার সহায়তা।',
      longDescription: 'অনলাইন ফরম পূরণ, ডিজিটাল ডকুমেন্ট তৈরি, পিডিএফ এডিট এবং সাধারণ কম্পিউটার সহায়তা — সহজ ভাষায়, ধাপে ধাপে।',
    }
  },
];

export function getCategories(lang: Lang): Category[] {
  return categoriesData.map(d => ({
    id: d.id,
    slug: d.slug,
    iconName: d.iconName,
    color: d.color,
    gradient: d.gradient,
    ...d[lang],
  }));
}

export const categories: Category[] = getCategories('bn');

export const getCategoryBySlug = (slug: string, lang: Lang = 'bn') => getCategories(lang).find(c => c.slug === slug);
export const getCategoryById = (id: string, lang: Lang = 'bn') => getCategories(lang).find(c => c.id === id);
export const getCategoryDataById = (id: string) => categoriesData.find(c => c.id === id);
