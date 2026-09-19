import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'en' | 'bn';

type Translations = Record<string, Record<Lang, string>>;

export const translations: Translations = {
  // Header
  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.services': { en: 'Services', bn: 'সেবা' },
  'nav.how': { en: 'How It Works', bn: 'কিভাবে কাজ করে' },
  'nav.about': { en: 'About', bn: 'আমাদের সম্পর্কে' },
  'nav.contact': { en: 'Contact', bn: 'যোগাযোগ' },
  'nav.getStarted': { en: 'Get Started', bn: 'শুরু করুন' },
  'nav.explore': { en: 'Explore Services', bn: 'সেবা দেখুন' },
  'nav.serviceHub': { en: 'Service Hub', bn: 'সেবা হাব' },

  // Hero
  'hero.badge': { en: 'Your Digital Service Hub • Bangladesh', bn: 'আপনার ডিজিটাল সেবা হাব • বাংলাদেশ' },
  'hero.title1': { en: 'All Your Digital', bn: 'আপনার সব ডিজিটাল' },
  'hero.title2': { en: 'Services,', bn: 'সেবা,' },
  'hero.title3': { en: 'In One Place.', bn: 'এক জায়গায়।' },
  'hero.desc': { en: 'Discover simple, reliable, and convenient digital services through ShebaFlow. Find the assistance you need and get started with confidence.', bn: 'ShebaFlow এর মাধ্যমে সহজ, নির্ভরযোগ্য এবং সুবিধাজনক ডিজিটাল সেবা খুঁজুন। আপনার প্রয়োজনীয় সহায়তা খুঁজে আত্মবিশ্বাসের সাথে শুরু করুন।' },
  'hero.cta1': { en: 'Explore Services', bn: 'সেবা দেখুন' },
  'hero.cta2': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
  'hero.search': { en: 'Search services...', bn: 'সেবা খুঁজুন...' },
  'hero.inquiry': { en: 'Inquiry Received', bn: 'ইনকোয়ারি পেয়েছি' },
  'hero.inquirySub': { en: "We'll contact you shortly", bn: 'শীঘ্রই যোগাযোগ করব' },

  // Trust
  'trust.easy': { en: 'Easy Service Discovery', bn: 'সহজে সেবা খুঁজুন' },
  'trust.easyDesc': { en: 'Browse clearly organized services by category.', bn: 'পরিষ্কারভাবে ক্যাটাগরি অনুযায়ী সাজানো সেবা।' },
  'trust.clear': { en: 'Clear Requirements', bn: 'পরিষ্কার প্রয়োজনীয়তা' },
  'trust.clearDesc': { en: 'Know documents, steps, and time upfront.', bn: 'ডকুমেন্ট, ধাপ এবং সময় আগে থেকেই জানুন।' },
  'trust.friendly': { en: 'Friendly Assistance', bn: 'বন্ধুত্বপূর্ণ সহায়তা' },
  'trust.friendlyDesc': { en: 'Simple guidance without confusing jargon.', bn: 'জটিল ভাষা ছাড়া সহজ নির্দেশনা।' },
  'trust.digital': { en: 'Convenient Digital Support', bn: 'সুবিধাজনক ডিজিটাল সাপোর্ট' },
  'trust.digitalDesc': { en: 'Mobile-friendly, fast, and organized.', bn: 'মোবাইল-ফ্রেন্ডলি, দ্রুত এবং গোছানো।' },

  // Categories
  'cat.title': { en: 'Explore Our Services', bn: 'আমাদের সেবা দেখুন' },
  'cat.subtitle': { en: 'Find the right service for your needs — organized by clear categories.', bn: 'আপনার প্রয়োজন অনুযায়ী সঠিক সেবা খুঁজুন — পরিষ্কার ক্যাটাগরিতে সাজানো।' },
  'cat.view': { en: 'View', bn: 'দেখুন' },
  'cat.services': { en: 'services', bn: 'টি সেবা' },

  // Popular
  'popular.title': { en: 'Popular Services', bn: 'জনপ্রিয় সেবা' },
  'popular.desc': { en: 'Most requested assistance — quick to start, clear requirements.', bn: 'সবচেয়ে বেশি চাহিদাযুক্ত সহায়তা — দ্রুত শুরু, পরিষ্কার প্রয়োজনীয়তা।' },
  'popular.viewAll': { en: 'View All Services', bn: 'সব সেবা দেখুন' },

  // How
  'how.badge': { en: 'HOW IT WORKS', bn: 'কিভাবে কাজ করে' },
  'how.title': { en: 'Simple process, clear guidance', bn: 'সহজ প্রক্রিয়া, পরিষ্কার নির্দেশনা' },
  'how.1.title': { en: 'Browse Services', bn: 'সেবা ব্রাউজ করুন' },
  'how.1.desc': { en: 'Explore categories and find what you need.', bn: 'ক্যাটাগরি দেখে আপনার প্রয়োজনীয় সেবা খুঁজুন।' },
  'how.2.title': { en: 'Choose Your Service', bn: 'সেবা নির্বাচন করুন' },
  'how.2.desc': { en: 'Review requirements, steps, and time.', bn: 'প্রয়োজনীয়তা, ধাপ এবং সময় দেখুন।' },
  'how.3.title': { en: 'Submit an Inquiry', bn: 'ইনকোয়ারি পাঠান' },
  'how.3.desc': { en: 'Share basic details via a simple form.', bn: 'সহজ ফরমের মাধ্যমে প্রাথমিক তথ্য শেয়ার করুন।' },
  'how.4.title': { en: 'Get Assistance', bn: 'সহায়তা পান' },
  'how.4.desc': { en: 'Our team contacts you with next steps.', bn: 'আমাদের টিম পরবর্তী ধাপ নিয়ে যোগাযোগ করবে।' },

  // Why
  'why.title': { en: 'Why ShebaFlow?', bn: 'কেন ShebaFlow?' },
  'why.desc': { en: 'We focus on clarity, organization, and helpful support — not unrealistic promises. Here’s how we help you get things done more easily.', bn: 'আমরা পরিষ্কারতা, গোছানো তথ্য এবং সহায়ক সাপোর্টে ফোকাস করি — অবাস্তব প্রতিশ্রুতি নয়। দেখুন আমরা কীভাবে সাহায্য করি।' },
  'why.1': { en: 'Simple and organized service information', bn: 'সহজ এবং গোছানো সেবার তথ্য' },
  'why.2': { en: 'Transparent requirements and steps', bn: 'স্বচ্ছ প্রয়োজনীয়তা ও ধাপ' },
  'why.3': { en: 'Convenient inquiry process', bn: 'সুবিধাজনক ইনকোয়ারি প্রক্রিয়া' },
  'why.4': { en: 'Mobile-friendly experience', bn: 'মোবাইল-ফ্রেন্ডলি অভিজ্ঞতা' },
  'why.5': { en: 'Helpful customer support', bn: 'সহায়ক কাস্টমার সাপোর্ট' },
  'why.6': { en: 'Regularly updated service details', bn: 'নিয়মিত আপডেটেড সেবার তথ্য' },
  'why.principles': { en: 'ShebaFlow Principles', bn: 'ShebaFlow নীতিমালা' },
  'why.principlesSub': { en: 'What we stand for', bn: 'আমরা যা বিশ্বাস করি' },
  'why.p1.t': { en: 'Clarity First', bn: 'পরিষ্কারতা প্রথম' },
  'why.p1.d': { en: 'Every service shows documents, steps, and estimated time.', bn: 'প্রতিটি সেবায় ডকুমেন্ট, ধাপ এবং আনুমানিক সময় দেওয়া থাকে।' },
  'why.p2.t': { en: 'No False Promises', bn: 'মিথ্যা প্রতিশ্রুতি নয়' },
  'why.p2.d': { en: 'We never claim government approval or guaranteed outcomes.', bn: 'আমরা কখনো সরকারি অনুমোদন বা নিশ্চিত ফলাফলের দাবি করি না।' },
  'why.p3.t': { en: 'Privacy Respect', bn: 'গোপনীয়তার সম্মান' },
  'why.p3.d': { en: 'We never ask for passwords, OTPs, or payment in demo inquiries.', bn: 'আমরা কখনো পাসওয়ার্ড, OTP বা পেমেন্ট চাই না।' },

  // CTA
  'cta.title': { en: 'Need Help Finding the Right Service?', bn: 'সঠিক সেবা খুঁজতে সাহায্য দরকার?' },
  'cta.desc': { en: 'Explore our services or contact our team for assistance. We’ll guide you to the right option.', bn: 'আমাদের সেবা দেখুন বা টিমের সাথে যোগাযোগ করুন। আমরা সঠিক অপশনে গাইড করব।' },

  // Services page
  'services.title': { en: 'All Services', bn: 'সব সেবা' },
  'services.desc': { en: 'Search, filter, and explore organized services. Clear requirements, steps, and estimated time for each.', bn: 'খুঁজুন, ফিল্টার করুন এবং গোছানো সেবা দেখুন। প্রতিটি সেবায় পরিষ্কার প্রয়োজনীয়তা, ধাপ এবং সময় দেওয়া আছে।' },
  'services.found': { en: 'services found', bn: 'টি সেবা পাওয়া গেছে' },
  'services.filters': { en: 'Filters', bn: 'ফিল্টার' },
  'services.search': { en: 'Search', bn: 'সার্চ করুন' },
  'services.searchPh': { en: 'Passport, CV, photo...', bn: 'পাসপোর্ট, সিভি, ছবি...' },
  'services.category': { en: 'Category', bn: 'ক্যাটাগরি' },
  'services.allCat': { en: 'All categories', bn: 'সব ক্যাটাগরি' },
  'services.availability': { en: 'Availability', bn: 'অবস্থা' },
  'services.all': { en: 'All services', bn: 'সব সেবা' },
  'services.available': { en: 'Available', bn: 'উপলব্ধ' },
  'services.coming': { en: 'Coming soon', bn: 'শীঘ্রই আসছে' },
  'services.sort': { en: 'Sort by', bn: 'সাজান' },
  'services.nameAZ': { en: 'Name A-Z', bn: 'নাম অনুযায়ী' },
  'services.popularFirst': { en: 'Popular first', bn: 'জনপ্রিয় আগে' },
  'services.clear': { en: 'Clear filters', bn: 'ফিল্টার মুছুন' },
  'services.empty': { en: 'No services found', bn: 'কোনো সেবা পাওয়া যায়নি' },
  'services.emptyDesc': { en: 'Try adjusting your search or filters. You can also clear all filters to see all services.', bn: 'সার্চ বা ফিল্টার পরিবর্তন করে দেখুন। সব ফিল্টার মুছে সব সেবা দেখতে পারেন।' },

  // Service detail
  'detail.back': { en: 'Back to services', bn: 'সেবা তালিকায় ফিরে যান' },
  'detail.warning': { en: 'We provide informational assistance only. We do not guarantee approvals, submit forms to government portals on your behalf, or request passwords/OTPs. Final decisions are made by respective authorities.', bn: 'আমরা শুধু তথ্যগত সহায়তা দিই। আমরা অনুমোদনের নিশ্চয়তা দিই না, সরকারি পোর্টালে আপনার হয়ে ফরম জমা দিই না এবং পাসওয়ার্ড/OTP চাই না। চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট কর্তৃপক্ষের।' },
  'detail.included': { en: "What's included", bn: 'কী কী অন্তর্ভুক্ত' },
  'detail.docs': { en: 'Required documents', bn: 'প্রয়োজনীয় ডকুমেন্ট' },
  'detail.steps': { en: 'Process steps', bn: 'কাজের ধাপ' },
  'detail.faq': { en: 'Frequently asked questions', bn: 'সাধারণ প্রশ্ন' },
  'detail.request': { en: 'Request this service', bn: 'এই সেবার জন্য আবেদন করুন' },
  'detail.requestDesc': { en: 'Submit a quick inquiry and our team will contact you with next steps. No payment or sensitive credentials required.', bn: 'দ্রুত ইনকোয়ারি পাঠান, আমাদের টিম পরবর্তী ধাপ নিয়ে যোগাযোগ করবে। কোনো পেমেন্ট বা গোপন তথ্য লাগবে না।' },
  'detail.service': { en: 'Service', bn: 'সেবা' },
  'detail.requestBtn': { en: 'Request This Service', bn: 'এই সেবার জন্য আবেদন' },
  'detail.contactBtn': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
  'detail.agree': { en: 'By submitting an inquiry you agree to our Terms and Privacy Policy. Demo flow — no real government submission.', bn: 'ইনকোয়ারি পাঠিয়ে আপনি আমাদের শর্তাবলী ও প্রাইভেসি পলিসিতে সম্মত হচ্ছেন। ডেমো প্রক্রিয়া — কোনো সরকারি জমা নয়।' },
  'detail.needElse': { en: 'Need something else?', bn: 'অন্য কিছু দরকার?' },
  'detail.needElseDesc': { en: 'Browse all services or filter by category to find the right assistance.', bn: 'সব সেবা ব্রাউজ করুন বা ক্যাটাগরি অনুযায়ী ফিল্টার করে সঠিক সহায়তা খুঁজুন।' },
  'detail.browseAll': { en: 'Browse all services', bn: 'সব সেবা দেখুন' },
  'detail.viewDetails': { en: 'View Details', bn: 'বিস্তারিত দেখুন' },

  // Inquiry
  'inquiry.title': { en: 'Service Inquiry', bn: 'সেবা ইনকোয়ারি' },
  'inquiry.desc': { en: 'Tell us what you need. We’ll review your request and guide you with clear next steps. No payment, passwords, or OTPs required.', bn: 'আপনার কী প্রয়োজন জানান। আমরা রিভিউ করে পরিষ্কার পরবর্তী ধাপ জানাব। কোনো পেমেন্ট, পাসওয়ার্ড বা OTP লাগবে না।' },
  'inquiry.received': { en: 'Your inquiry has been received', bn: 'আপনার ইনকোয়ারি পেয়েছি' },
  'inquiry.receivedDesc': { en: 'Our team will contact you with the next steps. This is a demo confirmation — in production, your inquiry would be sent to our support system.', bn: 'আমাদের টিম পরবর্তী ধাপ নিয়ে যোগাযোগ করবে। এটি একটি ডেমো কনফার্মেশন — প্রোডাকশনে আপনার ইনকোয়ারি সাপোর্ট সিস্টেমে যাবে।' },
  'inquiry.summary': { en: 'Summary', bn: 'সারাংশ' },
  'inquiry.browse': { en: 'Browse services', bn: 'সেবা দেখুন' },
  'inquiry.goHome': { en: 'Go home', bn: 'হোমে যান' },
  'inquiry.another': { en: 'Submit another inquiry', bn: 'আরেকটি ইনকোয়ারি পাঠান' },
  'inquiry.fullName': { en: 'Full Name *', bn: 'পূর্ণ নাম *' },
  'inquiry.phone': { en: 'Phone Number *', bn: 'ফোন নম্বর *' },
  'inquiry.email': { en: 'Email Address (optional)', bn: 'ইমেইল (ঐচ্ছিক)' },
  'inquiry.selectService': { en: 'Select Service *', bn: 'সেবা নির্বাচন করুন *' },
  'inquiry.choose': { en: 'Choose a service', bn: 'একটি সেবা বেছে নিন' },
  'inquiry.contactMethod': { en: 'Preferred Contact Method', bn: 'যোগাযোগের পছন্দের মাধ্যম' },
  'inquiry.phoneOpt': { en: 'Phone', bn: 'ফোন' },
  'inquiry.emailOpt': { en: 'Email', bn: 'ইমেইল' },
  'inquiry.whatsapp': { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
  'inquiry.message': { en: 'Message (optional)', bn: 'বার্তা (ঐচ্ছিক)' },
  'inquiry.messagePh': { en: 'Describe what help you need...', bn: 'কী সাহায্য দরকার বিস্তারিত লিখুন...' },
  'inquiry.consent': { en: 'I understand this is a demo inquiry and I agree to be contacted about my request. I have read the Privacy Policy and Terms. *', bn: 'আমি বুঝেছি এটি একটি ডেমো ইনকোয়ারি এবং আমার অনুরোধ নিয়ে যোগাযোগ করা হবে। আমি প্রাইভেসি পলিসি এবং শর্তাবলী পড়েছি। *' },
  'inquiry.submit': { en: 'Submit Inquiry', bn: 'ইনকোয়ারি পাঠান' },
  'inquiry.cancel': { en: 'Cancel', bn: 'বাতিল' },
  'inquiry.note': { en: 'We never ask for passwords, OTPs, or payment information in this demo flow. Your data is stored locally in your browser for demo purposes.', bn: 'আমরা কখনো পাসওয়ার্ড, OTP বা পেমেন্ট তথ্য চাই না। আপনার তথ্য ডেমোর জন্য ব্রাউজারে স্থানীয়ভাবে সংরক্ষিত।' },
  'inquiry.next': { en: 'What happens next?', bn: 'এরপর কী হবে?' },
  'inquiry.next1': { en: 'We review your inquiry and selected service.', bn: 'আমরা আপনার ইনকোয়ারি ও নির্বাচিত সেবা রিভিউ করব।' },
  'inquiry.next2': { en: 'Our team contacts you via your preferred method.', bn: 'আপনার পছন্দের মাধ্যমে টিম যোগাযোগ করবে।' },
  'inquiry.next3': { en: 'We share a clear checklist and next steps.', bn: 'পরিষ্কার চেকলিস্ট ও পরবর্তী ধাপ শেয়ার করব।' },
  'inquiry.next4': { en: 'You proceed with official submission yourself.', bn: 'আপনি নিজে অফিসিয়াল জমা দেওয়ার কাজ এগিয়ে নেবেন।' },
  'inquiry.help': { en: 'Need immediate help?', bn: 'দ্রুত সাহায্য দরকার?' },
  'inquiry.helpDesc': { en: 'Contact us directly or browse FAQs. We keep explanations simple and transparent.', bn: 'সরাসরি যোগাযোগ করুন বা FAQ দেখুন। আমরা সহজ ও স্বচ্ছভাবে বোঝাই।' },

  // About
  'about.badge': { en: 'ABOUT SHEBAFLOW', bn: 'SHEBAFLOW সম্পর্কে' },
  'about.title': { en: 'Making digital services simple and organized.', bn: 'ডিজিটাল সেবাকে সহজ এবং গোছানো করা।' },
  'about.desc': { en: 'ShebaFlow is a modern digital service hub designed for everyday needs in Bangladesh — from document information to education, photo, and technical assistance. We organize information clearly so you know what’s required and what to do next.', bn: 'ShebaFlow বাংলাদেশের প্রতিদিনের প্রয়োজনের জন্য তৈরি একটি আধুনিক ডিজিটাল সেবা হাব — ডকুমেন্ট তথ্য থেকে শুরু করে শিক্ষা, ফটো এবং টেকনিক্যাল সহায়তা পর্যন্ত। আমরা তথ্য পরিষ্কারভাবে সাজাই যাতে আপনি জানেন কী লাগবে এবং এরপর কী করতে হবে।' },
  'about.mission': { en: 'Our Mission', bn: 'আমাদের লক্ষ্য' },
  'about.missionDesc': { en: 'To provide simple, transparent, and friendly guidance for digital and document-related tasks — without confusing jargon or unrealistic promises. We want people to feel confident about their next steps, even if the official process itself is handled by respective authorities.', bn: 'ডিজিটাল এবং ডকুমেন্ট সংক্রান্ত কাজের জন্য সহজ, স্বচ্ছ এবং বন্ধুত্বপূর্ণ নির্দেশনা দেওয়া — জটিল শব্দ বা অবাস্তব প্রতিশ্রুতি ছাড়া। আমরা চাই মানুষ পরবর্তী ধাপ নিয়ে আত্মবিশ্বাসী থাকুক, এমনকি অফিসিয়াল প্রক্রিয়াটি সংশ্লিষ্ট কর্তৃপক্ষ নিজে পরিচালনা করলেও।' },
  'about.what': { en: 'What ShebaFlow Does', bn: 'ShebaFlow কী করে' },
  'about.how': { en: 'How We Help', bn: 'আমরা কীভাবে সাহায্য করি' },
  'about.principles': { en: 'Service Principles', bn: 'আমাদের নীতিমালা' },
  'about.note': { en: 'Note: This website uses demo content. We do not invent company registration numbers, physical office addresses, founder names, or certifications. Update placeholders before publishing.', bn: 'নোট: এই ওয়েবসাইটে ডেমো কনটেন্ট ব্যবহার করা হয়েছে। আমরা কোম্পানি রেজিস্ট্রেশন নম্বর, ফিজিক্যাল অফিস ঠিকানা, প্রতিষ্ঠাতার নাম বা সার্টিফিকেশন উদ্ভাবন করি না। প্রকাশের আগে প্লেসহোল্ডার আপডেট করুন।' },

  // Contact
  'contact.title': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
  'contact.desc': { en: 'Have a question about a service? Send us a message and we’ll get back to you with clear guidance.', bn: 'কোনো সেবা নিয়ে প্রশ্ন আছে? আমাদের বার্তা পাঠান, আমরা পরিষ্কার নির্দেশনা দিয়ে উত্তর দেব।' },
  'contact.phone': { en: 'Phone (Demo)', bn: 'ফোন (ডেমো)' },
  'contact.email': { en: 'Email (Demo)', bn: 'ইমেইল (ডেমো)' },
  'contact.address': { en: 'Address (Demo)', bn: 'ঠিকানা (ডেমো)' },
  'contact.hours': { en: 'Business Hours', bn: 'ব্যবসার সময়' },
  'contact.placeholderNote': { en: 'These are placeholder contact details. Replace with real information in src/data/config.ts before publishing.', bn: 'এগুলো প্লেসহোল্ডার যোগাযোগের তথ্য। প্রকাশের আগে src/data/config.ts ফাইলে আসল তথ্য দিয়ে পরিবর্তন করুন।' },
  'contact.send': { en: 'Send a message', bn: 'বার্তা পাঠান' },
  'contact.fullName': { en: 'Full Name *', bn: 'পূর্ণ নাম *' },
  'contact.phoneLabel': { en: 'Phone *', bn: 'ফোন *' },
  'contact.emailLabel': { en: 'Email', bn: 'ইমেইল' },
  'contact.message': { en: 'Message *', bn: 'বার্তা *' },
  'contact.messagePh': { en: 'How can we help?', bn: 'আমরা কীভাবে সাহায্য করতে পারি?' },
  'contact.sendBtn': { en: 'Send Message', bn: 'বার্তা পাঠান' },
  'contact.received': { en: 'Message received', bn: 'বার্তা পেয়েছি' },
  'contact.receivedDesc': { en: 'Thanks for reaching out. Our team will contact you soon. This is a demo confirmation stored locally.', bn: 'যোগাযোগের জন্য ধন্যবাদ। আমাদের টিম শীঘ্রই যোগাযোগ করবে। এটি একটি ডেমো কনফার্মেশন যা স্থানীয়ভাবে সংরক্ষিত।' },
  'contact.another': { en: 'Send another message', bn: 'আরেকটি বার্তা পাঠান' },

  // Footer
  'footer.demoTitle': { en: 'Demo Notice', bn: 'ডেমো নোটিশ' },
  'footer.demoDesc': { en: 'This is a demo service platform. No government submission or payment processing is performed.', bn: 'এটি একটি ডেমো সেবা প্ল্যাটফর্ম। কোনো সরকারি জমা বা পেমেন্ট প্রসেসিং করা হয় না।' },
  'footer.services': { en: 'Services', bn: 'সেবাসমূহ' },
  'footer.viewAll': { en: 'View all services →', bn: 'সব সেবা দেখুন →' },
  'footer.company': { en: 'Company', bn: 'কোম্পানি' },
  'footer.about': { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  'footer.how': { en: 'How It Works', bn: 'কিভাবে কাজ করে' },
  'footer.contact': { en: 'Contact', bn: 'যোগাযোগ' },
  'footer.inquiry': { en: 'Service Inquiry', bn: 'সেবা ইনকোয়ারি' },
  'footer.privacy': { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' },
  'footer.terms': { en: 'Terms of Service', bn: 'সেবার শর্তাবলী' },
  'footer.contactTitle': { en: 'Contact (Demo)', bn: 'যোগাযোগ (ডেমো)' },
  'footer.phoneNote': { en: 'Phone — placeholder, editable', bn: 'ফোন — প্লেসহোল্ডার, পরিবর্তনযোগ্য' },
  'footer.emailNote': { en: 'Email — placeholder', bn: 'ইমেইল — প্লেসহোল্ডার' },
  'footer.copy': { en: 'All rights reserved. Demo content — review before publishing.', bn: 'সর্বস্বত্ব সংরক্ষিত। ডেমো কনটেন্ট — প্রকাশের আগে রিভিউ করুন।' },
  'footer.made': { en: 'Built with care for Bangladesh', bn: 'বাংলাদেশের জন্য যত্ন সহকারে তৈরি' },

  // 404
  '404.title': { en: 'Page not found', bn: 'পেজ খুঁজে পাওয়া যায়নি' },
  '404.desc': { en: 'The page you’re looking for doesn’t exist or has been moved.', bn: 'আপনি যে পেজটি খুঁজছেন তা নেই বা সরানো হয়েছে।' },
  '404.home': { en: 'Go home', bn: 'হোমে যান' },

  // Common
  'common.browse': { en: 'Browse services', bn: 'সেবা দেখুন' },
  'common.about': { en: 'About us', bn: 'আমাদের সম্পর্কে' },
};

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('shebaflow_lang') as Lang | null;
    return saved === 'en' || saved === 'bn' ? saved : 'bn';
  });

  useEffect(() => {
    localStorage.setItem('shebaflow_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
