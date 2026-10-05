# ShebaFlow — Passport, NID & A4 Print Tools

A focused bilingual (বাংলা / English) browser-based photo and print utility for Bangladesh. The public product intentionally contains only three tools:

1. **Passport Image** — creates a 40 × 50 mm passport image at 300 DPI.
2. **NID Print Ready** — lays out NID front/back images at the physical card size (85.6 × 54 mm) on an A4, 300 DPI sheet.
3. **A4 Print Ready** — a multi-page A4 document-print workspace with local auto-crop, image cleanup modes, physical print-size controls, PDF export, PNG export, and direct print.

## A4 Print Ready workflow

- Add multiple document images to a page tray.
- Use local edge detection to auto-crop unused space, or adjust crop size and position manually.
- Choose Normal, Color Boost, Grayscale, or Black & White image cleanup.
- Adjust brightness, contrast, saturation, document rotation, print size, position, margin, and page orientation.
- Export every page as a print-ready A4 PDF, export the active page as PNG, or print all pages directly.

## Privacy

Image preparation happens in the browser. Images are not uploaded to a server by these tools.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- jsPDF for client-side PDF export
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
