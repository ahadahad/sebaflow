/**
 * Production server for ShebaFlow
 * Serves static dist files + secure AI API
 * Run with: npm run build && node server/index.js (after building TS or using tsx)
 * Or use vite preview for simple static serving (without AI API)
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');
const distPath = join(root, 'dist');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

async function handleApi(req: any, res: any) {
  const url = req.url || '';
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  // Parse body
  let body: any = {};
  if (req.method === 'POST') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
      if (Buffer.concat(chunks).length > 1_000_000) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Body too large' }));
        return true;
      }
    }
    const raw = Buffer.concat(chunks).toString('utf-8');
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        return true;
      }
    }
  }

  if (url.startsWith('/api/ai/photo-assistant') && req.method === 'POST') {
    const { handlePhotoAssistant } = await import('./routes/photoAssistant.js');
    await handlePhotoAssistant({ req, res, body, ip });
    return true;
  }

  if (url.startsWith('/api/ai/status') && req.method === 'GET') {
    const { handleAiStatus } = await import('./routes/photoAssistant.js');
    await handleAiStatus(req, res);
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  // Handle API first
  try {
    if (req.url?.startsWith('/api/')) {
      const handled = await handleApi(req, res);
      if (handled) return;
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
      return;
    }
  } catch (e: any) {
    console.error('API error:', e);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
    return;
  }

  // Serve static files
  let filePath = join(distPath, req.url === '/' ? 'index.html' : req.url || '');

  // If file doesn't exist or is directory, serve index.html for SPA routing
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(distPath, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found - run npm run build first');
    return;
  }

  const ext = extname(filePath);
  const mime = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', mime);
    // Cache static assets
    if (ext !== '.html') {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    res.end(content);
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

const PORT = Number(process.env.PORT) || 4173;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`ShebaFlow production server running on http://0.0.0.0:${PORT}`);
  console.log(`- Static files from: ${distPath}`);
  console.log(`- AI API at: http://localhost:${PORT}/api/ai/status`);
});
