# ShebaFlow — Passport, NID & A4 Print Tools

A focused bilingual (বাংলা / English) browser-based photo and print utility for Bangladesh. The public product intentionally contains only three tools:

1. **Passport Image** — creates a 40 × 50 mm passport image at 300 DPI.
2. **NID Print Ready** — lays out NID front/back images at the physical card size (85.6 × 54 mm) on an A4, 300 DPI sheet.
3. **A4 Print Ready** — prepares one image or document for an A4 300 DPI print in portrait or landscape.

## Privacy

Image preparation happens in the browser. Images are not uploaded to a server by these tools.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Routes

- `/` — three-tool home screen
- `/passport-image` — Passport Image
- `/nid-print-ready` — NID Print Ready
- `/a4-print-ready` — A4 Print Ready

The previous passport studio paths redirect to `/passport-image` for bookmarked users.
