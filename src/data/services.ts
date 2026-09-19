import type { Lang } from '../lib/i18n';

export type ServiceStatus = 'available' | 'coming-soon';

export type Service = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  shortDescription: string;
  longDescription: string;
  benefits: string[];
  estimatedTime: string;
  status: ServiceStatus;
  requiredDocuments: string[];
  steps: string[];
  faqs: { question: string; answer: string }[];
  popular?: boolean;
  iconName: string;
};

type ServiceData = {
  id: string;
  slug: string;
  categoryId: string;
  status: ServiceStatus;
  popular?: boolean;
  iconName: string;
  en: {
    name: string;
    shortDescription: string;
    longDescription: string;
    benefits: string[];
    estimatedTime: string;
    requiredDocuments: string[];
    steps: string[];
    faqs: { question: string; answer: string }[];
  };
  bn: {
    name: string;
    shortDescription: string;
    longDescription: string;
    benefits: string[];
    estimatedTime: string;
    requiredDocuments: string[];
    steps: string[];
    faqs: { question: string; answer: string }[];
  };
};

const servicesData: ServiceData[] = [
  {
    "id": "passport-assist",
    "slug": "passport-application-assistance",
    "categoryId": "gov",
    "status": "available",
    "popular": true,
    "iconName": "passport",
    "en": {
      "name": "Passport Application Assistance",
      "shortDescription": "Guided help to organize your passport application information and documents.",
      "longDescription": "We help you understand the passport application requirements, organize your documents, and prepare your information accurately before submission. This service provides informational assistance and document checklist support — we do not submit applications to government portals on your behalf or guarantee approval.",
      "benefits": [
        "Clear document checklist",
        "Form filling guidance",
        "Photo specification check",
        "Application review before submission"
      ],
      "estimatedTime": "1-2 working days for assistance",
      "requiredDocuments": [
        "National ID or Birth Certificate",
        "Previous passport (if any)",
        "Passport-size photographs",
        "Address proof document"
      ],
      "steps": [
        "Share your basic information and purpose",
        "We provide a personalized checklist",
        "Prepare and verify your documents together",
        "Guide you on next steps for official submission"
      ],
      "faqs": [
        {
          "question": "Do you guarantee passport approval?",
          "answer": "No. We provide assistance and information to help you prepare correctly. Approval decisions are made solely by the issuing authority."
        },
        {
          "question": "Can you submit the application for me?",
          "answer": "Our assistance is informational and preparatory. You will submit your own application through official channels with our guidance."
        }
      ]
    },
    "bn": {
      "name": "পাসপোর্ট আবেদন সহায়তা",
      "shortDescription": "পাসপোর্ট আবেদনের তথ্য গোছানো এবং ডকুমেন্ট চেকলিস্ট সহায়তা।",
      "longDescription": "পাসপোর্ট আবেদনের জন্য কী কী লাগবে, কীভাবে তথ্য সাজাতে হবে এবং আবেদন জমা দেওয়ার আগে কীভাবে যাচাই করবেন — আমরা ধাপে ধাপে গোছানো তথ্য ও চেকলিস্ট দিয়ে সাহায্য করি। আমরা সরকারি পোর্টালে আপনার হয়ে আবেদন জমা দিই না এবং অনুমোদনের নিশ্চয়তা দিই না।",
      "benefits": [
        "সম্পূর্ণ ডকুমেন্ট চেকলিস্ট",
        "ফরম পূরণের নির্দেশনা",
        "ছবির স্পেসিফিকেশন যাচাই",
        "জমা দেওয়ার আগে রিভিউ"
      ],
      "estimatedTime": "সহায়তার জন্য ১-২ কার্যদিবস",
      "requiredDocuments": [
        "জাতীয় পরিচয়পত্র বা জন্ম নিবন্ধন",
        "পুরাতন পাসপোর্ট (যদি থাকে)",
        "পাসপোর্ট সাইজ ছবি",
        "ঠিকানার প্রমাণপত্র"
      ],
      "steps": [
        "আপনার তথ্য ও আবেদনের উদ্দেশ্য শেয়ার করুন",
        "আমরা ব্যক্তিগত চেকলিস্ট দেব",
        "একসাথে ডকুমেন্ট যাচাই করব",
        "অফিসিয়াল জমা দেওয়ার পরবর্তী ধাপ বুঝিয়ে দেব"
      ],
      "faqs": [
        {
          "question": "আপনারা কি পাসপোর্ট অনুমোদনের নিশ্চয়তা দেন?",
          "answer": "না। আমরা শুধু প্রস্তুতিতে সাহায্য করি। অনুমোদন সম্পূর্ণ সরকারি কর্তৃপক্ষের সিদ্ধান্ত।"
        },
        {
          "question": "আপনারা কি আমার হয়ে আবেদন জমা দেবেন?",
          "answer": "না। আপনি নিজের অ্যাকাউন্ট থেকে অফিসিয়াল পোর্টালে জমা দেবেন, আমরা শুধু গাইড করব।"
        }
      ]
    }
  },
  {
    "id": "visa-assist",
    "slug": "visa-application-assistance",
    "categoryId": "gov",
    "status": "available",
    "popular": true,
    "iconName": "plane",
    "en": {
      "name": "Visa Application Assistance",
      "shortDescription": "Organized guidance for visa-related documentation and forms.",
      "longDescription": "Preparing for a visa application involves many documents. We help you organize requirements, understand common form fields, and prepare your supporting documents systematically.",
      "benefits": [
        "Requirement summary by visa type",
        "Document organization",
        "Form guidance",
        "Checklist review"
      ],
      "estimatedTime": "2-3 working days",
      "requiredDocuments": [
        "Valid passport",
        "Photographs as per specification",
        "Invitation or supporting letter (if applicable)",
        "Bank statement or financial proof"
      ],
      "steps": [
        "Tell us your destination and visa type",
        "Receive a tailored document checklist",
        "We help review your documents",
        "You proceed with official submission"
      ],
      "faqs": [
        {
          "question": "Will you ensure my visa is approved?",
          "answer": "No. Visa decisions are made by embassies and consulates. We only help organize and prepare your application materials."
        }
      ]
    },
    "bn": {
      "name": "ভিসা আবেদন সহায়তা",
      "shortDescription": "ভিসার ডকুমেন্ট ও ফরম গোছানোর জন্য সংগঠিত নির্দেশনা।",
      "longDescription": "ভিসা আবেদনে অনেক ডকুমেন্ট লাগে। আমরা ভিসার ধরন অনুযায়ী কী কী লাগবে, ফরমে কী লিখতে হবে এবং কীভাবে ডকুমেন্ট সাজাতে হবে তা সহজভাবে বুঝিয়ে দিই।",
      "benefits": [
        "ভিসার ধরন অনুযায়ী প্রয়োজনীয়তা",
        "ডকুমেন্ট গোছানো",
        "ফরম পূরণ গাইড",
        "চেকলিস্ট রিভিউ"
      ],
      "estimatedTime": "২-৩ কার্যদিবস",
      "requiredDocuments": [
        "বৈধ পাসপোর্ট",
        "স্পেসিফিকেশন অনুযায়ী ছবি",
        "আমন্ত্রণপত্র বা সাপোর্টিং লেটার (যদি প্রযোজ্য)",
        "ব্যাংক স্টেটমেন্ট"
      ],
      "steps": [
        "গন্তব্য ও ভিসার ধরন জানান",
        "উপযুক্ত চেকলিস্ট পান",
        "ডকুমেন্ট রিভিউ সহায়তা",
        "অফিসিয়াল সাবমিশনে এগিয়ে যান"
      ],
      "faqs": [
        {
          "question": "ভিসা পাওয়া কি নিশ্চিত?",
          "answer": "না। ভিসা অনুমোদন দূতাবাস/কনস্যুলেটের সিদ্ধান্ত। আমরা শুধু প্রস্তুতিতে সাহায্য করি।"
        }
      ]
    }
  },
  {
    "id": "nid-assist",
    "slug": "nid-information-assistance",
    "categoryId": "gov",
    "status": "available",
    "iconName": "idcard",
    "en": {
      "name": "NID Information & Assistance",
      "shortDescription": "Help understanding NID services and information correction steps.",
      "longDescription": "National ID related information can be confusing. We provide clear guidance on available NID services, how to check information, and what documents are typically needed for corrections.",
      "benefits": [
        "Clear information on NID services",
        "Correction process overview",
        "Document list preparation"
      ],
      "estimatedTime": "Same day assistance",
      "requiredDocuments": [
        "NID card (if available)",
        "Birth certificate",
        "Supporting document for correction"
      ],
      "steps": [
        "Explain the NID issue or query",
        "Get clear information about the process",
        "Prepare required supporting documents"
      ],
      "faqs": [
        {
          "question": "Can you directly correct my NID?",
          "answer": "No. NID corrections are processed by the Election Commission. We provide informational guidance to help you prepare."
        }
      ]
    },
    "bn": {
      "name": "এনআইডি তথ্য ও সহায়তা",
      "shortDescription": "এনআইডি সেবা ও তথ্য সংশোধনের ধাপগুলো সহজভাবে জানুন।",
      "longDescription": "এনআইডি সংক্রান্ত তথ্য অনেক সময় বিভ্রান্তিকর মনে হয়। আমরা এনআইডি সেবা, তথ্য যাচাই এবং সংশোধনের জন্য সাধারণত কী কী ডকুমেন্ট লাগে তা পরিষ্কারভাবে জানাই।",
      "benefits": [
        "এনআইডি সেবার পরিষ্কার তথ্য",
        "সংশোধন প্রক্রিয়ার ধারণা",
        "ডকুমেন্ট তালিকা প্রস্তুত"
      ],
      "estimatedTime": "একই দিনে সহায়তা",
      "requiredDocuments": [
        "এনআইডি কার্ড (যদি থাকে)",
        "জন্ম নিবন্ধন",
        "সংশোধনের সাপোর্টিং ডকুমেন্ট"
      ],
      "steps": [
        "এনআইডি সমস্যা বা প্রশ্ন জানান",
        "প্রক্রিয়া সম্পর্কে পরিষ্কার তথ্য পান",
        "প্রয়োজনীয় ডকুমেন্ট প্রস্তুত করুন"
      ],
      "faqs": [
        {
          "question": "আপনারা কি সরাসরি এনআইডি সংশোধন করে দেন?",
          "answer": "না। এনআইডি সংশোধন নির্বাচন কমিশন করে। আমরা তথ্য ও প্রস্তুতিতে সাহায্য করি।"
        }
      ]
    }
  },
  {
    "id": "birth-cert",
    "slug": "birth-certificate-assistance",
    "categoryId": "gov",
    "status": "available",
    "iconName": "baby",
    "en": {
      "name": "Birth Certificate Assistance",
      "shortDescription": "Assistance for birth certificate applications and information updates.",
      "longDescription": "We help you understand the birth certificate application process, required documents, and how to organize information for submission to the local authority.",
      "benefits": [
        "Application process explained",
        "Document checklist",
        "Form filling support"
      ],
      "estimatedTime": "1-2 working days",
      "requiredDocuments": [
        "Parents NID copies",
        "Hospital certificate or proof",
        "Address proof"
      ],
      "steps": [
        "Provide birth details",
        "Receive document checklist",
        "Organize documents with our guidance"
      ],
      "faqs": [
        {
          "question": "How long does official processing take?",
          "answer": "Processing time depends on the local authority. We help you prepare so there are fewer delays."
        }
      ]
    },
    "bn": {
      "name": "জন্ম নিবন্ধন সহায়তা",
      "shortDescription": "জন্ম নিবন্ধন আবেদন ও তথ্য আপডেটে সহায়তা।",
      "longDescription": "জন্ম নিবন্ধন আবেদনের প্রক্রিয়া, কী কী ডকুমেন্ট লাগবে এবং কীভাবে তথ্য গোছাতে হবে তা আমরা সহজভাবে বুঝিয়ে দিই।",
      "benefits": [
        "আবেদন প্রক্রিয়া ব্যাখ্যা",
        "ডকুমেন্ট চেকলিস্ট",
        "ফরম পূরণ সহায়তা"
      ],
      "estimatedTime": "১-২ কার্যদিবস",
      "requiredDocuments": [
        "পিতা-মাতার এনআইডি কপি",
        "হাসপাতাল সার্টিফিকেট বা প্রমাণ",
        "ঠিকানার প্রমাণ"
      ],
      "steps": [
        "জন্ম সংক্রান্ত তথ্য দিন",
        "চেকলিস্ট পান",
        "আমাদের নির্দেশনায় ডকুমেন্ট গোছান"
      ],
      "faqs": [
        {
          "question": "অফিসিয়াল প্রসেসিং কতদিন লাগে?",
          "answer": "এটি স্থানীয় কর্তৃপক্ষের উপর নির্ভর করে। আমরা প্রস্তুতি ঠিক রাখতে সাহায্য করি যাতে দেরি কম হয়।"
        }
      ]
    }
  },
  {
    "id": "doc-correction",
    "slug": "document-correction-assistance",
    "categoryId": "gov",
    "status": "available",
    "iconName": "file-pen",
    "en": {
      "name": "Document Correction Assistance",
      "shortDescription": "Guidance for correcting errors in official documents.",
      "longDescription": "Spelling mistakes or mismatched information in documents can cause problems. We help you identify what needs correction, what proof is typically required, and how to approach the correction request.",
      "benefits": [
        "Error identification help",
        "Supporting proof guidance",
        "Application draft assistance"
      ],
      "estimatedTime": "1-3 working days",
      "requiredDocuments": [
        "Original document with error",
        "Correct information proof",
        "NID or supporting ID"
      ],
      "steps": [
        "Describe the error and correct information",
        "We suggest supporting documents",
        "Help draft your correction request"
      ],
      "faqs": [
        {
          "question": "Is correction guaranteed?",
          "answer": "No. We assist with preparation. Approval depends on the issuing authority."
        }
      ]
    },
    "bn": {
      "name": "ডকুমেন্ট সংশোধন সহায়তা",
      "shortDescription": "অফিসিয়াল ডকুমেন্টে ভুল সংশোধনের গাইড।",
      "longDescription": "নাম, বানান বা তথ্যে ভুল থাকলে সমস্যা হয়। আমরা কী সংশোধন করতে হবে, কী প্রমাণ লাগবে এবং কীভাবে আবেদন লিখতে হবে তা সাজিয়ে দিই।",
      "benefits": [
        "ভুল চিহ্নিতকরণে সাহায্য",
        "সাপোর্টিং প্রমাণের নির্দেশনা",
        "আবেদন খসড়া সহায়তা"
      ],
      "estimatedTime": "১-৩ কার্যদিবস",
      "requiredDocuments": [
        "ভুল থাকা মূল ডকুমেন্ট",
        "সঠিক তথ্যের প্রমাণ",
        "এনআইডি বা সাপোর্টিং আইডি"
      ],
      "steps": [
        "ভুল ও সঠিক তথ্য জানান",
        "প্রয়োজনীয় প্রমাণের পরামর্শ পান",
        "সংশোধনের আবেদন খসড়া তৈরিতে সাহায্য"
      ],
      "faqs": [
        {
          "question": "সংশোধন কি নিশ্চিত?",
          "answer": "না। আমরা প্রস্তুতিতে সাহায্য করি। অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের সিদ্ধান্ত।"
        }
      ]
    }
  },
  {
    "id": "gov-form",
    "slug": "online-government-form-assistance",
    "categoryId": "gov",
    "status": "available",
    "iconName": "form",
    "en": {
      "name": "Online Government Form Assistance",
      "shortDescription": "Help filling out various online government service forms.",
      "longDescription": "Many government services now require online forms. We provide friendly assistance to understand form fields, prepare information, and fill forms accurately.",
      "benefits": [
        "Form explanation in simple language",
        "Data preparation help",
        "Review before final submission"
      ],
      "estimatedTime": "Same day to 1 day",
      "requiredDocuments": [
        "Relevant personal information",
        "Supporting documents as per form"
      ],
      "steps": [
        "Share the form or service name",
        "We explain required fields",
        "Fill and review together"
      ],
      "faqs": [
        {
          "question": "Do you have access to government portals?",
          "answer": "No. We guide you through the process. You use your own credentials to submit."
        }
      ]
    },
    "bn": {
      "name": "অনলাইন সরকারি ফরম সহায়তা",
      "shortDescription": "বিভিন্ন সরকারি অনলাইন ফরম পূরণে সহায়তা।",
      "longDescription": "অনেক সরকারি সেবা এখন অনলাইন ফরমের মাধ্যমে। আমরা ফরমের প্রতিটি ঘর সহজ ভাষায় বুঝিয়ে দিই এবং সঠিকভাবে পূরণে সাহায্য করি।",
      "benefits": [
        "সহজ ভাষায় ফরম ব্যাখ্যা",
        "তথ্য প্রস্তুতিতে সাহায্য",
        "চূড়ান্ত জমা দেওয়ার আগে রিভিউ"
      ],
      "estimatedTime": "একই দিন থেকে ১ দিন",
      "requiredDocuments": [
        "সংশ্লিষ্ট ব্যক্তিগত তথ্য",
        "ফরম অনুযায়ী সাপোর্টিং ডকুমেন্ট"
      ],
      "steps": [
        "ফরম বা সেবার নাম শেয়ার করুন",
        "প্রয়োজনীয় ঘরগুলো বুঝিয়ে দেব",
        "একসাথে পূরণ ও রিভিউ"
      ],
      "faqs": [
        {
          "question": "আপনাদের কি সরকারি পোর্টালে অ্যাক্সেস আছে?",
          "answer": "না। আমরা শুধু গাইড করি। আপনি নিজের অ্যাকাউন্ট দিয়ে জমা দেবেন।"
        }
      ]
    }
  },
  {
    "id": "admission",
    "slug": "online-admission-assistance",
    "categoryId": "edu",
    "status": "available",
    "popular": true,
    "iconName": "school",
    "en": {
      "name": "Online Admission Assistance",
      "shortDescription": "Support for online admission forms and document preparation.",
      "longDescription": "Online admissions require careful data entry and document uploads. We help you organize academic information, scan documents correctly, and complete forms without errors.",
      "benefits": [
        "Admission requirement summary",
        "Document scanning guidance",
        "Form filling support"
      ],
      "estimatedTime": "1-2 working days",
      "requiredDocuments": [
        "Academic certificates",
        "Photographs",
        "NID or Birth Certificate"
      ],
      "steps": [
        "Share admission circular or link",
        "Get checklist and timeline",
        "Prepare documents and fill form with guidance"
      ],
      "faqs": [
        {
          "question": "Do you guarantee admission?",
          "answer": "No. We help you apply correctly. Selection is done by the institution."
        }
      ]
    },
    "bn": {
      "name": "অনলাইন ভর্তি সহায়তা",
      "shortDescription": "অনলাইন ভর্তি ফরম ও ডকুমেন্ট প্রস্তুতিতে সহায়তা।",
      "longDescription": "অনলাইন ভর্তিতে সতর্কভাবে তথ্য লিখতে হয় এবং ডকুমেন্ট আপলোড করতে হয়। আমরা একাডেমিক তথ্য গোছানো, সঠিকভাবে স্ক্যান এবং নির্ভুলভাবে ফরম পূরণে সাহায্য করি।",
      "benefits": [
        "ভর্তির প্রয়োজনীয়তা সারাংশ",
        "ডকুমেন্ট স্ক্যান নির্দেশনা",
        "ফরম পূরণ সহায়তা"
      ],
      "estimatedTime": "১-২ কার্যদিবস",
      "requiredDocuments": [
        "একাডেমিক সার্টিফিকেট",
        "ছবি",
        "এনআইডি বা জন্ম নিবন্ধন"
      ],
      "steps": [
        "ভর্তি বিজ্ঞপ্তি বা লিংক শেয়ার করুন",
        "চেকলিস্ট ও সময়সীমা পান",
        "নির্দেশনায় ডকুমেন্ট প্রস্তুত ও ফরম পূরণ"
      ],
      "faqs": [
        {
          "question": "আপনারা কি ভর্তি নিশ্চিত করেন?",
          "answer": "না। আমরা সঠিকভাবে আবেদন করতে সাহায্য করি। নির্বাচন প্রতিষ্ঠান করে।"
        }
      ]
    }
  },
  {
    "id": "scholarship",
    "slug": "scholarship-application-assistance",
    "categoryId": "edu",
    "status": "available",
    "iconName": "award",
    "en": {
      "name": "Scholarship Application Assistance",
      "shortDescription": "Guidance for scholarship applications and required documents.",
      "longDescription": "Scholarship applications often need essays, recommendation formatting, and precise document sets. We help you organize and prepare a complete application package.",
      "benefits": [
        "Requirement breakdown",
        "Essay structure guidance",
        "Document formatting"
      ],
      "estimatedTime": "2-4 working days",
      "requiredDocuments": [
        "Academic transcripts",
        "Recommendation letters",
        "Personal statement draft"
      ],
      "steps": [
        "Share scholarship details",
        "Receive document and writing checklist",
        "Prepare and review together"
      ],
      "faqs": [
        {
          "question": "Can you write my personal statement?",
          "answer": "We can help structure and format your own story — we do not fabricate information."
        }
      ]
    },
    "bn": {
      "name": "স্কলারশিপ আবেদন সহায়তা",
      "shortDescription": "স্কলারশিপ আবেদন ও প্রয়োজনীয় ডকুমেন্ট গাইড।",
      "longDescription": "স্কলারশিপ আবেদনে প্রায়ই রচনা, সুপারিশপত্র ফরম্যাটিং এবং নির্ভুল ডকুমেন্ট সেট লাগে। আমরা সম্পূর্ণ আবেদন প্যাকেজ গোছাতে সাহায্য করি।",
      "benefits": [
        "প্রয়োজনীয়তা ভেঙে বোঝানো",
        "রচনার কাঠামো নির্দেশনা",
        "ডকুমেন্ট ফরম্যাটিং"
      ],
      "estimatedTime": "২-৪ কার্যদিবস",
      "requiredDocuments": [
        "একাডেমিক ট্রান্সক্রিপ্ট",
        "সুপারিশপত্র",
        "ব্যক্তিগত বিবৃতির খসড়া"
      ],
      "steps": [
        "স্কলারশিপের বিস্তারিত শেয়ার করুন",
        "ডকুমেন্ট ও লেখার চেকলিস্ট পান",
        "একসাথে প্রস্তুত ও রিভিউ"
      ],
      "faqs": [
        {
          "question": "আপনারা কি আমার ব্যক্তিগত বিবৃতি লিখে দেবেন?",
          "answer": "আমরা আপনার নিজের গল্প গোছাতে ও ফরম্যাট করতে সাহায্য করি — মিথ্যা তথ্য তৈরি করি না।"
        }
      ]
    }
  },
  {
    "id": "cv-resume",
    "slug": "cv-resume-preparation",
    "categoryId": "edu",
    "status": "available",
    "popular": true,
    "iconName": "file-text",
    "en": {
      "name": "CV / Resume Preparation",
      "shortDescription": "Professional CV and resume formatting and content guidance.",
      "longDescription": "A clean, well-structured CV makes a strong first impression. We help organize your education, experience, and skills into a modern, ATS-friendly format.",
      "benefits": [
        "Modern templates",
        "Content organization",
        "Formatting and proofreading"
      ],
      "estimatedTime": "1-2 working days",
      "requiredDocuments": [
        "Existing CV (if any)",
        "Education and experience details"
      ],
      "steps": [
        "Share your information and target role",
        "We draft and structure your CV",
        "Review and finalize together"
      ],
      "faqs": [
        {
          "question": "Do you guarantee a job?",
          "answer": "No. We help you present your profile professionally. Hiring decisions are made by employers."
        }
      ]
    },
    "bn": {
      "name": "সিভি / রিজিউমি তৈরি",
      "shortDescription": "প্রফেশনাল সিভি ফরম্যাটিং ও কনটেন্ট গাইড।",
      "longDescription": "একটি পরিষ্কার, সুন্দরভাবে সাজানো সিভি প্রথম ইমপ্রেশন ভালো করে। আমরা আপনার শিক্ষা, অভিজ্ঞতা ও দক্ষতা আধুনিক, ATS-ফ্রেন্ডলি ফরম্যাটে সাজিয়ে দিই।",
      "benefits": [
        "আধুনিক টেমপ্লেট",
        "কনটেন্ট গোছানো",
        "ফরম্যাটিং ও প্রুফরিডিং"
      ],
      "estimatedTime": "১-২ কার্যদিবস",
      "requiredDocuments": [
        "পুরাতন সিভি (যদি থাকে)",
        "শিক্ষা ও অভিজ্ঞতার বিস্তারিত"
      ],
      "steps": [
        "আপনার তথ্য ও টার্গেট পদের কথা জানান",
        "আমরা সিভি খসড়া ও কাঠামো তৈরি করি",
        "একসাথে রিভিউ ও ফাইনাল"
      ],
      "faqs": [
        {
          "question": "আপনারা কি চাকরি নিশ্চিত করেন?",
          "answer": "না। আমরা প্রফেশনালভাবে প্রোফাইল উপস্থাপনে সাহায্য করি। নিয়োগ নিয়োগকর্তার সিদ্ধান্ত।"
        }
      ]
    }
  },
  {
    "id": "job-form",
    "slug": "job-application-form-assistance",
    "categoryId": "edu",
    "status": "available",
    "iconName": "briefcase",
    "en": {
      "name": "Job Application Form Assistance",
      "shortDescription": "Help with online job application forms and portals.",
      "longDescription": "Government and private job applications often have detailed online forms. We help you understand each section and fill information accurately.",
      "benefits": [
        "Form section explanations",
        "Data accuracy check",
        "Upload guidance"
      ],
      "estimatedTime": "Same day to 1 day",
      "requiredDocuments": [
        "CV",
        "Academic certificates",
        "Photograph"
      ],
      "steps": [
        "Share job circular or portal link",
        "We explain the form structure",
        "Complete form together"
      ],
      "faqs": [
        {
          "question": "Do you apply using your own account?",
          "answer": "No. You apply using your own account with our guidance."
        }
      ]
    },
    "bn": {
      "name": "চাকরির আবেদন ফরম সহায়তা",
      "shortDescription": "অনলাইন চাকরির আবেদন ফরম ও পোর্টালে সহায়তা।",
      "longDescription": "সরকারি ও বেসরকারি চাকরির আবেদনে বিস্তারিত অনলাইন ফরম থাকে। আমরা প্রতিটি অংশ বুঝিয়ে এবং নির্ভুলভাবে পূরণে সাহায্য করি।",
      "benefits": [
        "ফরমের প্রতিটি অংশ ব্যাখ্যা",
        "তথ্যের নির্ভুলতা যাচাই",
        "আপলোড নির্দেশনা"
      ],
      "estimatedTime": "একই দিন থেকে ১ দিন",
      "requiredDocuments": [
        "সিভি",
        "একাডেমিক সার্টিফিকেট",
        "ছবি"
      ],
      "steps": [
        "চাকরির বিজ্ঞপ্তি বা পোর্টাল লিংক শেয়ার করুন",
        "ফরমের কাঠামো বুঝিয়ে দেব",
        "একসাথে ফরম পূরণ"
      ],
      "faqs": [
        {
          "question": "আপনারা কি নিজের অ্যাকাউন্ট দিয়ে আবেদন করেন?",
          "answer": "না। আপনি নিজের অ্যাকাউন্ট দিয়ে আবেদন করবেন, আমরা গাইড করব।"
        }
      ]
    }
  },
  {
    "id": "edu-format",
    "slug": "educational-document-formatting",
    "categoryId": "edu",
    "status": "available",
    "iconName": "book",
    "en": {
      "name": "Educational Document Formatting",
      "shortDescription": "Formatting for assignments, reports, and academic documents.",
      "longDescription": "We help format academic documents according to common standards — clean typography, proper headings, citations, and print-ready layouts.",
      "benefits": [
        "Consistent formatting",
        "Print-ready export",
        "Citation structure help"
      ],
      "estimatedTime": "1-2 working days",
      "requiredDocuments": [
        "Draft content",
        "Formatting guidelines (if any)"
      ],
      "steps": [
        "Share your document and requirements",
        "We format and structure it",
        "Review and export final file"
      ],
      "faqs": [
        {
          "question": "Do you write assignments?",
          "answer": "No. We help format and organize your own work."
        }
      ]
    },
    "bn": {
      "name": "শিক্ষাগত ডকুমেন্ট ফরম্যাটিং",
      "shortDescription": "অ্যাসাইনমেন্ট, রিপোর্ট ও একাডেমিক ডকুমেন্ট ফরম্যাটিং।",
      "longDescription": "আমরা একাডেমিক ডকুমেন্ট সাধারণ মান অনুযায়ী ফরম্যাট করতে সাহায্য করি — পরিষ্কার টাইপোগ্রাফি, সঠিক হেডিং, সাইটেশন এবং প্রিন্ট-রেডি লেআউট।",
      "benefits": [
        "ধারাবাহিক ফরম্যাটিং",
        "প্রিন্ট-রেডি এক্সপোর্ট",
        "সাইটেশন কাঠামো সহায়তা"
      ],
      "estimatedTime": "১-২ কার্যদিবস",
      "requiredDocuments": [
        "খসড়া কনটেন্ট",
        "ফরম্যাটিং নির্দেশনা (যদি থাকে)"
      ],
      "steps": [
        "ডকুমেন্ট ও প্রয়োজনীয়তা শেয়ার করুন",
        "আমরা ফরম্যাট ও কাঠামো ঠিক করি",
        "রিভিউ ও ফাইনাল ফাইল এক্সপোর্ট"
      ],
      "faqs": [
        {
          "question": "আপনারা কি অ্যাসাইনমেন্ট লিখে দেন?",
          "answer": "না। আমরা আপনার নিজের লেখা গোছানো ও ফরম্যাট করতে সাহায্য করি।"
        }
      ]
    }
  },
  {
    "id": "passport-photo",
    "slug": "passport-size-photo-preparation",
    "categoryId": "photo",
    "status": "available",
    "popular": true,
    "iconName": "camera",
    "en": {
      "name": "Passport-Size Photo Preparation",
      "shortDescription": "Prepare passport-size photos to standard specifications.",
      "longDescription": "We prepare your photos to commonly required passport-size specifications — proper dimensions, background, and resolution for both print and online submissions.",
      "benefits": [
        "Standard size cropping",
        "Background adjustment",
        "Print and digital versions"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Clear original photo"
      ],
      "steps": [
        "Upload a clear photo",
        "We crop and adjust to specification",
        "Receive print-ready and digital files"
      ],
      "faqs": [
        {
          "question": "What photo should I provide?",
          "answer": "A well-lit, front-facing photo with a clear background works best."
        }
      ]
    },
    "bn": {
      "name": "পাসপোর্ট সাইজ ছবি প্রস্তুত",
      "shortDescription": "স্ট্যান্ডার্ড মাপ অনুযায়ী পাসপোর্ট সাইজ ছবি প্রস্তুত।",
      "longDescription": "আমরা আপনার ছবি সাধারণ পাসপোর্ট সাইজের প্রয়োজনীয়তা অনুযায়ী প্রস্তুত করি — সঠিক মাপ, ব্যাকগ্রাউন্ড এবং রেজোলিউশন, প্রিন্ট ও অনলাইন উভয়ের জন্য।",
      "benefits": [
        "স্ট্যান্ডার্ড সাইজ ক্রপ",
        "ব্যাকগ্রাউন্ড অ্যাডজাস্টমেন্ট",
        "প্রিন্ট ও ডিজিটাল ভার্সন"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "পরিষ্কার মূল ছবি"
      ],
      "steps": [
        "পরিষ্কার ছবি আপলোড করুন",
        "আমরা স্পেসিফিকেশন অনুযায়ী ক্রপ ও অ্যাডজাস্ট করি",
        "প্রিন্ট-রেডি ও ডিজিটাল ফাইল পান"
      ],
      "faqs": [
        {
          "question": "কেমন ছবি দিতে হবে?",
          "answer": "ভালো আলোতে তোলা, সামনের দিক থেকে তোলা, পরিষ্কার ব্যাকগ্রাউন্ডের ছবি সবচেয়ে ভালো।"
        }
      ]
    }
  },
  {
    "id": "bg-remove",
    "slug": "photo-background-removal",
    "categoryId": "photo",
    "status": "available",
    "iconName": "eraser",
    "en": {
      "name": "Photo Background Removal",
      "shortDescription": "Clean background removal for professional photos.",
      "longDescription": "Need a white or transparent background for official use? We carefully remove or replace backgrounds while keeping natural edges.",
      "benefits": [
        "Clean edge removal",
        "White / transparent / color background",
        "High resolution export"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Original photo"
      ],
      "steps": [
        "Upload photo",
        "Specify background requirement",
        "Receive edited file"
      ],
      "faqs": [
        {
          "question": "Will quality be reduced?",
          "answer": "We preserve maximum quality and export in suitable resolution."
        }
      ]
    },
    "bn": {
      "name": "ছবির ব্যাকগ্রাউন্ড রিমুভ",
      "shortDescription": "প্রফেশনাল ছবির জন্য পরিষ্কার ব্যাকগ্রাউন্ড রিমুভ।",
      "longDescription": "অফিসিয়াল কাজের জন্য সাদা বা ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড দরকার? আমরা যত্ন সহকারে ব্যাকগ্রাউন্ড রিমুভ বা পরিবর্তন করি, প্রাকৃতিক এজ ঠিক রেখে।",
      "benefits": [
        "পরিষ্কার এজ রিমুভ",
        "সাদা / ট্রান্সপারেন্ট / রঙিন ব্যাকগ্রাউন্ড",
        "হাই রেজোলিউশন এক্সপোর্ট"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "মূল ছবি"
      ],
      "steps": [
        "ছবি আপলোড করুন",
        "ব্যাকগ্রাউন্ডের প্রয়োজনীয়তা জানান",
        "এডিট করা ফাইল পান"
      ],
      "faqs": [
        {
          "question": "ছবির কোয়ালিটি কি কমবে?",
          "answer": "আমরা সর্বোচ্চ কোয়ালিটি ধরে রাখি এবং উপযুক্ত রেজোলিউশনে এক্সপোর্ট করি।"
        }
      ]
    }
  },
  {
    "id": "photo-enhance",
    "slug": "photo-enhancement",
    "categoryId": "photo",
    "status": "available",
    "iconName": "sparkles",
    "en": {
      "name": "Photo Enhancement",
      "shortDescription": "Improve clarity, lighting, and color balance of your photos.",
      "longDescription": "Old or low-light photos can be improved with careful enhancement — adjusting brightness, sharpness, and color without over-editing.",
      "benefits": [
        "Lighting correction",
        "Sharpness improvement",
        "Natural color balance"
      ],
      "estimatedTime": "Same day to 1 day",
      "requiredDocuments": [
        "Original photo"
      ],
      "steps": [
        "Upload photo",
        "Tell us what needs improvement",
        "Receive enhanced version"
      ],
      "faqs": [
        {
          "question": "Can you restore very old damaged photos?",
          "answer": "Basic enhancement is available. Complex restoration may be limited — we will inform you beforehand."
        }
      ]
    },
    "bn": {
      "name": "ছবি এনহ্যান্সমেন্ট",
      "shortDescription": "ছবির ক্ল্যারিটি, আলো ও রঙ উন্নত করা।",
      "longDescription": "পুরাতন বা কম আলোতে তোলা ছবি যত্ন সহকারে উন্নত করা যায় — উজ্জ্বলতা, শার্পনেস ও রঙ ঠিক করে, অতিরিক্ত এডিট ছাড়া।",
      "benefits": [
        "আলো সংশোধন",
        "শার্পনেস উন্নতি",
        "প্রাকৃতিক রঙ ব্যালেন্স"
      ],
      "estimatedTime": "একই দিন থেকে ১ দিন",
      "requiredDocuments": [
        "মূল ছবি"
      ],
      "steps": [
        "ছবি আপলোড করুন",
        "কী উন্নতি দরকার জানান",
        "এনহ্যান্স করা ভার্সন পান"
      ],
      "faqs": [
        {
          "question": "খুব পুরাতন নষ্ট ছবি কি ঠিক করা যাবে?",
          "answer": "বেসিক এনহ্যান্সমেন্ট সম্ভব। জটিল রিস্টোরেশন সীমিত হতে পারে — আমরা আগেই জানিয়ে দেব।"
        }
      ]
    }
  },
  {
    "id": "photo-edit",
    "slug": "photo-editing",
    "categoryId": "photo",
    "status": "available",
    "iconName": "image",
    "en": {
      "name": "Photo Editing",
      "shortDescription": "General photo editing and retouching assistance.",
      "longDescription": "From cropping to color correction and basic retouching, we provide clean, natural-looking edits suitable for official and personal use.",
      "benefits": [
        "Cropping and resizing",
        "Color correction",
        "Basic retouching"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Original photo",
        "Editing instructions"
      ],
      "steps": [
        "Share photo and instructions",
        "We edit and share preview",
        "Finalize after your review"
      ],
      "faqs": [
        {
          "question": "Do you do advanced manipulation?",
          "answer": "We focus on clean, natural edits suitable for official documents."
        }
      ]
    },
    "bn": {
      "name": "ফটো এডিটিং",
      "shortDescription": "সাধারণ ফটো এডিটিং ও রিটাচিং সহায়তা।",
      "longDescription": "ক্রপ থেকে শুরু করে কালার কারেকশন ও বেসিক রিটাচিং — আমরা অফিসিয়াল ও ব্যক্তিগত ব্যবহারের জন্য পরিষ্কার, প্রাকৃতিক এডিট দিই।",
      "benefits": [
        "ক্রপ ও রিসাইজ",
        "কালার কারেকশন",
        "বেসিক রিটাচিং"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "মূল ছবি",
        "এডিটিং নির্দেশনা"
      ],
      "steps": [
        "ছবি ও নির্দেশনা শেয়ার করুন",
        "আমরা এডিট করে প্রিভিউ দেব",
        "আপনার রিভিউর পর ফাইনাল"
      ],
      "faqs": [
        {
          "question": "আপনারা কি অ্যাডভান্স ম্যানিপুলেশন করেন?",
          "answer": "আমরা অফিসিয়াল ডকুমেন্টের জন্য পরিষ্কার, প্রাকৃতিক এডিটে ফোকাস করি।"
        }
      ]
    }
  },
  {
    "id": "doc-scan",
    "slug": "document-scanning",
    "categoryId": "photo",
    "status": "available",
    "iconName": "scan",
    "en": {
      "name": "Document Scanning",
      "shortDescription": "High-quality scanning and digitization of documents.",
      "longDescription": "We help digitize your physical documents into clear, properly cropped PDFs or images suitable for online submissions.",
      "benefits": [
        "Clear, legible scans",
        "Proper cropping",
        "PDF compilation"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Physical documents"
      ],
      "steps": [
        "Provide documents",
        "We scan and optimize",
        "Receive organized digital files"
      ],
      "faqs": [
        {
          "question": "What file format will I get?",
          "answer": "PDF or image format as per your requirement — typically PDF for multi-page documents."
        }
      ]
    },
    "bn": {
      "name": "ডকুমেন্ট স্ক্যানিং",
      "shortDescription": "ডকুমেন্টের হাই-কোয়ালিটি স্ক্যান ও ডিজিটাইজেশন।",
      "longDescription": "আমরা আপনার কাগজের ডকুমেন্টগুলো পরিষ্কার, সঠিকভাবে ক্রপ করা পিডিএফ বা ছবিতে রূপান্তর করতে সাহায্য করি, যা অনলাইন জমা দেওয়ার জন্য উপযুক্ত।",
      "benefits": [
        "পরিষ্কার, পাঠযোগ্য স্ক্যান",
        "সঠিক ক্রপিং",
        "পিডিএফ কম্পাইলেশন"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "কাগজের ডকুমেন্ট"
      ],
      "steps": [
        "ডকুমেন্ট দিন",
        "আমরা স্ক্যান ও অপটিমাইজ করি",
        "গোছানো ডিজিটাল ফাইল পান"
      ],
      "faqs": [
        {
          "question": "কোন ফাইল ফরম্যাট পাব?",
          "answer": "আপনার প্রয়োজন অনুযায়ী পিডিএফ বা ছবি — সাধারণত মাল্টি-পেজের জন্য পিডিএফ।"
        }
      ]
    }
  },
  {
    "id": "doc-print",
    "slug": "document-printing",
    "categoryId": "photo",
    "status": "coming-soon",
    "iconName": "printer",
    "en": {
      "name": "Document Printing",
      "shortDescription": "Professional printing preparation and guidance.",
      "longDescription": "Need documents printed in specific formats? We prepare your files print-ready with correct margins, sizing, and layout guidance.",
      "benefits": [
        "Print-ready formatting",
        "Size and margin setup",
        "Quality check"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Digital file to print"
      ],
      "steps": [
        "Share your file",
        "We prepare print-ready version",
        "Guidance for local printing"
      ],
      "faqs": [
        {
          "question": "Do you provide physical printing?",
          "answer": "Currently we provide preparation and guidance. Physical printing availability depends on location."
        }
      ]
    },
    "bn": {
      "name": "ডকুমেন্ট প্রিন্টিং",
      "shortDescription": "প্রফেশনাল প্রিন্টিং প্রস্তুতি ও নির্দেশনা।",
      "longDescription": "নির্দিষ্ট ফরম্যাটে ডকুমেন্ট প্রিন্ট করতে হবে? আমরা ফাইল প্রিন্ট-রেডি করি — সঠিক মার্জিন, সাইজিং ও লেআউট নির্দেশনা সহ।",
      "benefits": [
        "প্রিন্ট-রেডি ফরম্যাটিং",
        "সাইজ ও মার্জিন সেটআপ",
        "কোয়ালিটি চেক"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "প্রিন্ট করার ডিজিটাল ফাইল"
      ],
      "steps": [
        "ফাইল শেয়ার করুন",
        "আমরা প্রিন্ট-রেডি ভার্সন তৈরি করি",
        "লোকাল প্রিন্টিংয়ের নির্দেশনা"
      ],
      "faqs": [
        {
          "question": "আপনারা কি ফিজিক্যাল প্রিন্ট দেন?",
          "answer": "বর্তমানে আমরা প্রস্তুতি ও নির্দেশনা দিই। ফিজিক্যাল প্রিন্টিং লোকেশন অনুযায়ী নির্ভর করে।"
        }
      ]
    }
  },
  {
    "id": "form-fill",
    "slug": "online-form-filling",
    "categoryId": "digital",
    "status": "available",
    "popular": true,
    "iconName": "form",
    "en": {
      "name": "Online Form Filling",
      "shortDescription": "Assistance with accurately filling any online form.",
      "longDescription": "Online forms can be confusing with many fields. We help you understand each field, organize required information, and fill forms accurately.",
      "benefits": [
        "Field-by-field explanation",
        "Data organization",
        "Accuracy review"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Form link or description",
        "Required information"
      ],
      "steps": [
        "Share the form details",
        "We explain requirements",
        "Fill and review together"
      ],
      "faqs": [
        {
          "question": "Is my data kept private?",
          "answer": "Yes. We do not store sensitive information longer than necessary and never ask for passwords or OTPs."
        }
      ]
    },
    "bn": {
      "name": "অনলাইন ফরম পূরণ",
      "shortDescription": "যেকোনো অনলাইন ফরম নির্ভুলভাবে পূরণে সহায়তা।",
      "longDescription": "অনলাইন ফরমে অনেক ঘর থাকে, বিভ্রান্তিকর মনে হতে পারে। আমরা প্রতিটি ঘর বুঝিয়ে, প্রয়োজনীয় তথ্য গুছিয়ে এবং নির্ভুলভাবে পূরণে সাহায্য করি।",
      "benefits": [
        "প্রতিটি ঘরের ব্যাখ্যা",
        "তথ্য গোছানো",
        "নির্ভুলতা রিভিউ"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "ফরমের লিংক বা বিবরণ",
        "প্রয়োজনীয় তথ্য"
      ],
      "steps": [
        "ফরমের বিস্তারিত শেয়ার করুন",
        "প্রয়োজনীয়তা বুঝিয়ে দেব",
        "একসাথে পূরণ ও রিভিউ"
      ],
      "faqs": [
        {
          "question": "আমার তথ্য কি গোপন থাকবে?",
          "answer": "হ্যাঁ। আমরা প্রয়োজন ছাড়া সংবেদনশীল তথ্য রাখি না এবং কখনো পাসওয়ার্ড বা OTP চাই না।"
        }
      ]
    }
  },
  {
    "id": "digital-doc",
    "slug": "digital-document-preparation",
    "categoryId": "digital",
    "status": "available",
    "iconName": "file",
    "en": {
      "name": "Digital Document Preparation",
      "shortDescription": "Create professional digital documents from your information.",
      "longDescription": "We help transform your handwritten or scattered information into clean, professional digital documents — applications, letters, declarations, and more.",
      "benefits": [
        "Professional formatting",
        "Clear language structuring",
        "Ready-to-use exports"
      ],
      "estimatedTime": "1-2 working days",
      "requiredDocuments": [
        "Source information",
        "Purpose of document"
      ],
      "steps": [
        "Share your information and purpose",
        "We draft and format document",
        "Review and finalize"
      ],
      "faqs": [
        {
          "question": "What types of documents?",
          "answer": "Applications, letters, affidavits drafts (for informational purposes), CVs, and general official letters."
        }
      ]
    },
    "bn": {
      "name": "ডিজিটাল ডকুমেন্ট প্রস্তুত",
      "shortDescription": "আপনার তথ্য থেকে প্রফেশনাল ডিজিটাল ডকুমেন্ট তৈরি।",
      "longDescription": "আমরা আপনার হাতে লেখা বা ছড়িয়ে থাকা তথ্য থেকে পরিষ্কার, প্রফেশনাল ডিজিটাল ডকুমেন্ট তৈরি করতে সাহায্য করি — আবেদনপত্র, চিঠি, ঘোষণা ইত্যাদি।",
      "benefits": [
        "প্রফেশনাল ফরম্যাটিং",
        "পরিষ্কার ভাষায় সাজানো",
        "ব্যবহারযোগ্য এক্সপোর্ট"
      ],
      "estimatedTime": "১-২ কার্যদিবস",
      "requiredDocuments": [
        "মূল তথ্য",
        "ডকুমেন্টের উদ্দেশ্য"
      ],
      "steps": [
        "তথ্য ও উদ্দেশ্য শেয়ার করুন",
        "আমরা খসড়া ও ফরম্যাট করি",
        "রিভিউ ও ফাইনাল"
      ],
      "faqs": [
        {
          "question": "কোন ধরনের ডকুমেন্ট?",
          "answer": "আবেদনপত্র, চিঠি, হলফনামার খসড়া (তথ্যের জন্য), সিভি এবং সাধারণ অফিসিয়াল চিঠি।"
        }
      ]
    }
  },
  {
    "id": "pdf-edit",
    "slug": "pdf-editing-conversion",
    "categoryId": "digital",
    "status": "available",
    "iconName": "pdf",
    "en": {
      "name": "PDF Editing & Conversion",
      "shortDescription": "Edit, merge, split, and convert PDF documents.",
      "longDescription": "Need to edit a PDF, merge multiple files, or convert between formats? We provide quick, accurate PDF assistance while preserving layout.",
      "benefits": [
        "PDF to Word / Word to PDF",
        "Merge and split",
        "Basic text editing"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Original PDF or source file"
      ],
      "steps": [
        "Upload your file",
        "Specify required changes",
        "Receive edited file"
      ],
      "faqs": [
        {
          "question": "Can you unlock protected PDFs?",
          "answer": "No. We only work with files you own and have permission to edit."
        }
      ]
    },
    "bn": {
      "name": "পিডিএফ এডিট ও কনভার্সন",
      "shortDescription": "পিডিএফ এডিট, মার্জ, স্প্লিট ও কনভার্ট।",
      "longDescription": "পিডিএফ এডিট করতে হবে, একাধিক ফাইল মার্জ করতে হবে বা ফরম্যাট পরিবর্তন করতে হবে? আমরা লেআউট ঠিক রেখে দ্রুত ও নির্ভুল পিডিএফ সহায়তা দিই।",
      "benefits": [
        "পিডিএফ থেকে ওয়ার্ড / ওয়ার্ড থেকে পিডিএফ",
        "মার্জ ও স্প্লিট",
        "বেসিক টেক্সট এডিটিং"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "মূল পিডিএফ বা সোর্স ফাইল"
      ],
      "steps": [
        "ফাইল আপলোড করুন",
        "কী পরিবর্তন লাগবে জানান",
        "এডিট করা ফাইল পান"
      ],
      "faqs": [
        {
          "question": "প্রোটেক্টেড পিডিএফ কি আনলক করেন?",
          "answer": "না। আমরা শুধু আপনার নিজের ফাইল নিয়ে কাজ করি যার অনুমতি আপনার আছে।"
        }
      ]
    }
  },
  {
    "id": "account-help",
    "slug": "online-account-assistance",
    "categoryId": "digital",
    "status": "available",
    "iconName": "user",
    "en": {
      "name": "Online Account Assistance",
      "shortDescription": "Help creating and managing online accounts for services.",
      "longDescription": "We provide guidance for creating and organizing online accounts needed for various services — email setup, profile information, and basic security practices.",
      "benefits": [
        "Account creation guidance",
        "Profile setup help",
        "Basic security tips"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Basic personal information",
        "Phone number for verification"
      ],
      "steps": [
        "Tell us what account you need",
        "We guide you through creation",
        "Help organize your account information"
      ],
      "faqs": [
        {
          "question": "Will you keep my passwords?",
          "answer": "No. We never ask for or store passwords. You create and manage your own credentials."
        }
      ]
    },
    "bn": {
      "name": "অনলাইন অ্যাকাউন্ট সহায়তা",
      "shortDescription": "বিভিন্ন সেবার জন্য অনলাইন অ্যাকাউন্ট তৈরি ও ব্যবস্থাপনায় সাহায্য।",
      "longDescription": "বিভিন্ন সেবার জন্য অনলাইন অ্যাকাউন্ট দরকার হয়। আমরা অ্যাকাউন্ট তৈরি, প্রোফাইল তথ্য সাজানো এবং বেসিক নিরাপত্তা টিপস নিয়ে নির্দেশনা দিই।",
      "benefits": [
        "অ্যাকাউন্ট তৈরির নির্দেশনা",
        "প্রোফাইল সেটআপ সহায়তা",
        "বেসিক নিরাপত্তা টিপস"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "বেসিক ব্যক্তিগত তথ্য",
        "ভেরিফিকেশনের জন্য ফোন নম্বর"
      ],
      "steps": [
        "কোন অ্যাকাউন্ট দরকার জানান",
        "তৈরির প্রক্রিয়া ধাপে ধাপে বুঝিয়ে দেব",
        "অ্যাকাউন্ট তথ্য গোছাতে সাহায্য"
      ],
      "faqs": [
        {
          "question": "আপনারা কি আমার পাসওয়ার্ড রাখবেন?",
          "answer": "না। আমরা কখনো পাসওয়ার্ড চাই না বা সংরক্ষণ করি না। আপনি নিজে পাসওয়ার্ড তৈরি ও ব্যবস্থাপনা করবেন।"
        }
      ]
    }
  },
  {
    "id": "computer-help",
    "slug": "general-computer-assistance",
    "categoryId": "digital",
    "status": "available",
    "iconName": "monitor",
    "en": {
      "name": "General Computer Assistance",
      "shortDescription": "Friendly help with everyday computer tasks and troubleshooting.",
      "longDescription": "From file organization to basic software guidance, we provide patient, simple explanations for everyday computer tasks.",
      "benefits": [
        "Simple explanations",
        "Step-by-step guidance",
        "Remote guidance available"
      ],
      "estimatedTime": "Same day",
      "requiredDocuments": [
        "Description of issue or task"
      ],
      "steps": [
        "Describe what you need help with",
        "We provide clear steps",
        "Follow up if needed"
      ],
      "faqs": [
        {
          "question": "Do you provide in-person support?",
          "answer": "Currently assistance is provided through inquiry and guidance. In-person availability depends on location."
        }
      ]
    },
    "bn": {
      "name": "সাধারণ কম্পিউটার সহায়তা",
      "shortDescription": "প্রতিদিনের কম্পিউটার কাজ ও সমস্যায় বন্ধুত্বপূর্ণ সহায়তা।",
      "longDescription": "ফাইল গোছানো থেকে শুরু করে বেসিক সফটওয়্যার নির্দেশনা — আমরা প্রতিদিনের কম্পিউটার কাজের জন্য সহজ, ধৈর্য সহকারে ব্যাখ্যা দিই।",
      "benefits": [
        "সহজ ব্যাখ্যা",
        "ধাপে ধাপে নির্দেশনা",
        "রিমোট গাইডেন্স সম্ভব"
      ],
      "estimatedTime": "একই দিন",
      "requiredDocuments": [
        "সমস্যা বা কাজের বিবরণ"
      ],
      "steps": [
        "কী সাহায্য দরকার জানান",
        "পরিষ্কার ধাপগুলো দেব",
        "প্রয়োজনে ফলো-আপ"
      ],
      "faqs": [
        {
          "question": "আপনারা কি সরাসরি এসে সাহায্য করেন?",
          "answer": "বর্তমানে সহায়তা ইনকোয়ারি ও নির্দেশনার মাধ্যমে দেওয়া হয়। সরাসরি সেবা লোকেশন অনুযায়ী নির্ভর করে।"
        }
      ]
    }
  }
];

export function getServices(lang: Lang): Service[] {
  return servicesData.map(d => ({
    id: d.id,
    slug: d.slug,
    categoryId: d.categoryId,
    status: d.status,
    popular: d.popular,
    iconName: d.iconName,
    ...d[lang],
  }));
}

// default for backward compat
export const services: Service[] = getServices('bn');

export const getServiceBySlug = (slug: string, lang: Lang = 'bn') => getServices(lang).find(s => s.slug === slug);
export const getServicesByCategory = (catId: string, lang: Lang = 'bn') => getServices(lang).filter(s => s.categoryId === catId);
export const getPopularServices = (lang: Lang = 'bn') => getServices(lang).filter(s => s.popular);
export const getServiceDataBySlug = (slug: string) => servicesData.find(s => s.slug === slug);
