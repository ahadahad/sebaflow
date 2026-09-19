# ShebaFlow — Your Digital Service Hub

A modern, production-ready service platform for Bangladesh. Built with React + TypeScript + Vite + Tailwind CSS.

**Tagline:** Your Digital Service Hub / Simple Services. Smarter Solutions.

## Features Implemented

- **Homepage** with hero, trust highlights, categories, popular services, how-it-works, why ShebaFlow, CTA
- **Services Directory** `/services` with search, category filter, status filter, sorting, empty state
- **Service Detail** `/services/:slug` with documents, steps, FAQs, sidebar inquiry CTA
- **Inquiry Form** `/inquiry` with validation, localStorage demo persistence, success screen
- **About** `/about`, **Contact** `/contact` with form, **Privacy** `/privacy`, **Terms** `/terms`
- **404** handling, responsive header/footer, accessible navigation
- **22 demo services** across 4 categories (Government, Education, Photo, Digital)
- **Design system**: blue primary (#2563eb), navy ink, rounded cards, soft shadows, Inter + Plus Jakarta Sans

## Tech Stack

- React 19, React Router 7, TypeScript 6, Vite 8, Tailwind CSS 3, Lucide Icons

## How to Run Locally

```bash
# Install
npm install

# Dev (http://localhost:5173)
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Data Architecture

- `src/data/categories.ts` — 4 categories with slugs, colors
- `src/data/services.ts` — 22 services with type `Service` (id, slug, name, categoryId, descriptions, benefits, docs, steps, faqs, status, popular)
- `src/data/config.ts` — editable site contact placeholders (no real credentials)

All content is in structured files — easy to add new services by pushing to `services` array.

## Future Expansion (Admin)

Structure ready for:
- Admin CRUD for services/categories
- Inquiry records API (currently localStorage `shebaflow_inquiries`, `shebaflow_contacts`)
- Backend integration: replace localStorage with POST to `/api/inquiries` with validation, rate limiting

## Security & Compliance Notes

- No passwords, OTPs, payment collected
- No government portal automation — informational guidance only
- No false claims (no 100% success, no government approved)
- Demo notices in footer and service pages

## Deployment

- Static SPA — deploy `dist/` to Vercel, Netlify, Cloudflare Pages
- Ensure SPA fallback to `index.html` for client routing

## Visual Quality

- No horizontal scroll at 320/375/768/1024/1440
- Mobile hamburger menu, sticky header, soft animations
- Empty states, loading states, accessible focus rings

## License

Demo project — review legal placeholder pages before publishing.
