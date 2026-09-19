/**
 * Production server - self-contained JS version
 * Serves dist + AI API without needing TS compilation
 * Run: node server/prod-server.mjs
 * Includes local fallback parser for offline mode
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const distPath = join(root, 'dist');

const mimeTypes = {
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
};

// ---- Local fallback parser ----
function parseCommandLocally(command) {
  const lower = command.toLowerCase();
  const ops = [];
  let explanation = '';

  if (lower.includes('white background') || lower.includes('background white') || lower.includes('make background white') || lower.includes('set background to white')) {
    ops.push({ type: 'setBackground', color: '#ffffff' });
    explanation += 'Background set to white. ';
  } else if (lower.includes('light blue') || lower.includes('light-blue')) {
    ops.push({ type: 'setBackground', color: '#bae6fd' });
    explanation += 'Background set to light blue. ';
  } else if (lower.includes('blue background') || lower.includes('background blue') || lower.includes('sky blue')) {
    ops.push({ type: 'setBackground', color: '#38bdf8' });
    explanation += 'Background set to sky blue. ';
  } else if (lower.includes('black background')) {
    ops.push({ type: 'setBackground', color: '#000000' });
    explanation += 'Background set to black. ';
  } else if (lower.includes('transparent') || lower.includes('remove background')) {
    ops.push({ type: 'setTransparency', value: true });
    explanation += 'Background set to transparent (real removal needs API). ';
  } else if (lower.includes('background')) {
    if (lower.includes('green')) { ops.push({ type: 'setBackground', color: '#10b981' }); explanation += 'Background set to green. '; }
    else if (lower.includes('pink')) { ops.push({ type: 'setBackground', color: '#f472b6' }); explanation += 'Background set to pink. '; }
  }

  if (lower.includes('improve lighting') || lower.includes('lighting') || lower.includes('improve light')) {
    ops.push({ type: 'setBrightness', value: 12 });
    ops.push({ type: 'setContrast', value: 8 });
    ops.push({ type: 'setExposure', value: 5 });
    explanation += 'Lighting improved with brightness and contrast. ';
  } else {
    if (lower.includes('brighter') || lower.includes('brightness') || lower.includes('bright')) {
      ops.push({ type: 'setBrightness', value: lower.includes('much') ? 20 : 15 });
      explanation += 'Brightness increased. ';
    }
    if (lower.includes('darker') || lower.includes('dark')) {
      ops.push({ type: 'setBrightness', value: -15 });
      explanation += 'Brightness decreased. ';
    }
  }

  if (lower.includes('contrast')) {
    if (lower.includes('increase') || lower.includes('more')) ops.push({ type: 'setContrast', value: 10 });
    else if (lower.includes('decrease')) ops.push({ type: 'setContrast', value: -10 });
    else if (!explanation.includes('contrast')) ops.push({ type: 'setContrast', value: 8 });
    explanation += 'Contrast adjusted. ';
  }

  if (lower.includes('saturation') || lower.includes('natural') || lower.includes('colorful')) {
    ops.push({ type: 'setSaturation', value: 10 });
    explanation += 'Saturation enhanced. ';
  }

  if (lower.includes('sharper') || lower.includes('sharp') || lower.includes('clearer') || lower.includes('enhance')) {
    if (!ops.some(o => o.type === 'setContrast')) ops.push({ type: 'setContrast', value: 10 });
    ops.push({ type: 'setFilter', filter: 'vivid' });
    explanation += 'Sharpness enhanced. ';
  }

  if (lower.includes('warmer') || lower.includes('warm')) {
    ops.push({ type: 'setFilter', filter: 'warm' });
    explanation += 'Warm filter applied. ';
  }
  if (lower.includes('cooler') || lower.includes('cool')) {
    ops.push({ type: 'setFilter', filter: 'cool' });
    explanation += 'Cool filter applied. ';
  }
  if (lower.includes('grayscale') || lower.includes('black and white')) {
    ops.push({ type: 'setFilter', filter: 'grayscale' });
    explanation += 'Grayscale applied. ';
  }
  if (lower.includes('sepia') || lower.includes('vintage')) {
    ops.push({ type: 'setFilter', filter: lower.includes('vintage') ? 'vintage' : 'sepia' });
    explanation += `${lower.includes('vintage') ? 'Vintage' : 'Sepia'} filter applied. `;
  }

  if (lower.includes('passport')) {
    if (!ops.some(o => o.type === 'resize')) ops.push({ type: 'resize', preset: 'passport', width: 400, height: 500 });
    if (!ops.some(o => o.type === 'setBackground')) ops.push({ type: 'setBackground', color: '#ffffff' });
    if (!ops.some(o => o.type === 'crop')) ops.push({ type: 'crop', preset: 'passport' });
    explanation += 'Prepared for passport size (40x50mm) with white background. ';
  }

  if (lower.includes('crop')) {
    if (lower.includes('1:1') || lower.includes('square')) ops.push({ type: 'crop', preset: '1:1' });
    else if (lower.includes('4:5')) ops.push({ type: 'crop', preset: '4:5' });
    else if (lower.includes('16:9')) ops.push({ type: 'crop', preset: '16:9' });
    else if (!ops.some(o => o.type === 'crop')) ops.push({ type: 'crop', preset: 'free' });
    explanation += 'Crop prepared. ';
  }

  if (lower.includes('resize') || lower.includes('profile') || lower.includes('social') || lower.includes('instagram') || lower.includes('youtube')) {
    if (lower.includes('profile')) ops.push({ type: 'resize', preset: 'profile', width: 500, height: 500 });
    else if (lower.includes('story')) ops.push({ type: 'resize', preset: 'insta-story', width: 1080, height: 1920 });
    else if (lower.includes('instagram') || lower.includes('social square')) ops.push({ type: 'resize', preset: 'social-square', width: 1080, height: 1080 });
    else if (lower.includes('youtube') || lower.includes('thumbnail')) ops.push({ type: 'resize', preset: 'yt-thumb', width: 1280, height: 720 });
    else if (!ops.some(o => o.type === 'resize')) ops.push({ type: 'resize', preset: 'passport', width: 400, height: 500 });
    explanation += 'Resize prepared. ';
  }

  if (lower.includes('rotate')) {
    if (lower.includes('90')) {
      const deg = lower.includes('left') ? -90 : 90;
      ops.push({ type: 'rotate', degrees: deg });
    } else if (lower.includes('180')) {
      ops.push({ type: 'rotate', degrees: 180 });
    } else {
      ops.push({ type: 'rotate', degrees: 90 });
    }
    explanation += 'Rotation prepared. ';
  }

  if (lower.includes('flip horizontal') || lower.includes('flip h')) {
    ops.push({ type: 'flipHorizontal' });
    explanation += 'Horizontal flip. ';
  }
  if (lower.includes('flip vertical') || lower.includes('flip v')) {
    ops.push({ type: 'flipVertical' });
    explanation += 'Vertical flip. ';
  }

  if (lower.includes('reset')) {
    ops.push({ type: 'resetAdjustments' });
    explanation += 'Adjustments reset. ';
  }

  if (ops.length === 0) {
    if (lower.includes('remove object') || lower.includes('remove person') || lower.includes('generate')) {
      return {
        operations: [{ type: 'unsupported', reason: `Command "${command}" requires advanced AI not supported locally. Try: background color, brightness, contrast, crop, resize, rotate.` }],
        explanation: `The requested action "${command}" is not supported by local editor. Try simpler commands.`,
        confidence: 30
      };
    }
    ops.push({ type: 'setBrightness', value: 10 });
    ops.push({ type: 'setContrast', value: 8 });
    explanation = `Applied general enhancement for: "${command}". Try specific like "Make background white" or "Improve lighting".`;
  }

  if (!explanation) explanation = `Prepared edits for: "${command}"`;
  return { operations: ops, explanation: explanation.trim(), confidence: 75 };
}

// ---- TokenHarbor Client (JS version) ----
function getEnv(override) {
  const apiKey = (override?.apiKey?.trim()) || process.env.TOKEN_HARBOR_API_KEY || process.env.TOKENHARBOR_API_KEY || '';
  const baseUrl = (override?.baseUrl?.trim() || process.env.TOKEN_HARBOR_BASE_URL || process.env.TOKENHARBOR_BASE_URL || 'https://tokenharbor.ai/v1').replace(/\/$/, '');
  const model = override?.model?.trim() || process.env.TOKEN_HARBOR_MODEL || process.env.TOKENHARBOR_MODEL || 'gpt-5.6-luna';
  return { apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() };
}

function validateEnv(env) {
  if (!env.apiKey) return { valid: false, error: 'TOKEN_HARBOR_API_KEY missing' };
  try { new URL(env.baseUrl); } catch { return { valid: false, error: 'Invalid base URL' }; }
  if (!env.model) return { valid: false, error: 'Model missing' };
  return { valid: true };
}

const SYSTEM_PROMPT = `You are the AI editing assistant for ShebaFlow Photo Studio.
Your job is to convert a user's natural-language photo-editing request into safe, structured editing operations.
You do not directly edit pixels. You only return validated JSON instructions that the local browser editor can apply.
Supported operations: setBrightness, setContrast, setSaturation, setExposure, setFilter, crop, resize, rotate, flipHorizontal, flipVertical, setBackground, setTransparency, setBorder, resetAdjustments, exportSuggestion, unsupported.
Rules: Return valid JSON only. Never return JS, HTML, Markdown, executable code. Use conservative values. If unsupported, return unsupported operation. Keep concise. Respect image dimensions.
Response format: {"operations": [{"type": "setBrightness", "value": 15}], "explanation": "...", "confidence": 85}`;

async function callTokenHarbor(messages, override) {
  const env = getEnv(override);
  const v = validateEnv(env);
  if (!v.valid) {
    const err = new Error(v.error);
    err.code = 'CONFIG_MISSING';
    throw err;
  }
  const endpoint = `${env.baseUrl}/chat/completions`;
  const body = {
    model: env.model,
    messages,
    temperature: 0.2,
    max_tokens: 1200,
    response_format: { type: 'json_object' }
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 401) { const e = new Error('Auth failed'); e.code = 'AUTH_FAILED'; e.status = res.status; throw e; }
      if (res.status === 429) { const e = new Error('Rate limit'); e.code = 'RATE_LIMIT'; e.status = 429; throw e; }
      const e = new Error(`API error ${res.status}: ${text.substring(0,200)}`); e.code = 'API_ERROR'; e.status = res.status; throw e;
    }
    const raw = await res.text();
    if (raw.trim().toLowerCase().startsWith('<!doctype')) { const e = new Error('HTML response'); e.code = 'PROVIDER_HTML'; throw e; }
    const data = JSON.parse(raw);
    const content = data.choices?.[0]?.message?.content;
    if (!content) { const e = new Error('Empty response'); e.code = 'EMPTY_RESPONSE'; throw e; }
    return { content, raw: data };
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') { const err = new Error('Timeout'); err.code = 'TIMEOUT'; throw err; }
    if (e.code) throw e;
    const err = new Error(`Network: ${e.message}`); err.code = 'NETWORK_ERROR'; throw err;
  }
}

// ---- Validation (simplified JS) ----
function validateCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') return { valid: false, error: 'Command required' };
  if (cmd.trim().length < 1) return { valid: false, error: 'Empty command' };
  if (cmd.length > 500) return { valid: false, error: 'Too long max 500' };
  if (/<script|javascript:/i.test(cmd)) return { valid: false, error: 'Invalid content' };
  return { valid: true };
}

function validateOperation(op) {
  if (!op || !op.type) return { valid: false, error: 'Missing type' };
  const validTypes = ['setBrightness','setContrast','setSaturation','setExposure','setFilter','crop','resize','rotate','flipHorizontal','flipVertical','setBackground','setTransparency','setBorder','resetAdjustments','exportSuggestion','unsupported'];
  if (!validTypes.includes(op.type)) return { valid: false, error: `Unknown type ${op.type}` };
  if (['setBrightness','setContrast','setSaturation'].includes(op.type)) {
    const v = Number(op.value); if (isNaN(v) || v < -100 || v > 100) return { valid: false, error: 'Value -100 to 100' };
  }
  if (op.type === 'setBackground' && op.color) {
    if (op.color.length > 50) return { valid: false, error: 'Color too long' };
  }
  return { valid: true, sanitized: op };
}

function validateAiResponse(data) {
  if (!data || !Array.isArray(data.operations)) return { valid: false, error: 'Operations array required' };
  if (data.operations.length > 20) return { valid: false, error: 'Too many ops' };
  if (!data.explanation) return { valid: false, error: 'Explanation required' };
  const sanitizedOps = [];
  for (const op of data.operations) {
    const r = validateOperation(op);
    if (!r.valid) sanitizedOps.push({ type: 'unsupported', reason: r.error });
    else sanitizedOps.push(r.sanitized);
  }
  return { valid: true, sanitized: { operations: sanitizedOps, explanation: String(data.explanation).substring(0,500), confidence: data.confidence } };
}

// ---- Rate limiting ----
const rateMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true, remaining: 9, resetIn: 60000 };
  }
  if (entry.count >= 10) return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  entry.count++;
  return { allowed: true, remaining: 10 - entry.count, resetIn: entry.resetTime - now };
}

// ---- Handlers ----
async function handlePhotoAssistant(req, res, body, ip) {
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded', code: 'RATE_LIMIT' }));
    return;
  }
  const cmdValid = validateCommand(body.command);
  if (!cmdValid.valid) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: cmdValid.error, code: 'VALIDATION_ERROR' }));
    return;
  }

  const headerKey = req.headers['x-tokenharbor-key'] || req.headers['x-api-key'] || '';
  const bodyKey = body.apiKey || body.tokenHarborApiKey || '';
  const override = {};
  if (headerKey) override.apiKey = headerKey;
  else if (bodyKey) override.apiKey = bodyKey;
  if (body.model) override.model = body.model;
  if (body.baseUrl) override.baseUrl = body.baseUrl;

  const env = getEnv(Object.keys(override).length ? override : undefined);
  const envValid = validateEnv(env);
  if (!envValid.valid) {
    // Local fallback even without key
    try {
      const local = parseCommandLocally(body.command);
      const localValidation = validateAiResponse({ operations: local.operations, explanation: local.explanation, confidence: local.confidence });
      if (localValidation.valid) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-AI-Mode', 'local-fallback-no-key');
        res.end(JSON.stringify({
          success: true,
          message: 'I prepared the requested edits (local mode).',
          operations: localValidation.sanitized.operations,
          explanation: local.explanation + ' (Local mode - no API key needed, works offline)',
          confidence: local.confidence,
          model: 'local-fallback',
          fallback: true,
          noApiKey: true
        }));
        return;
      }
    } catch {}
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'AI assistance is temporarily unavailable. You can continue editing manually.', code: 'CONFIG_MISSING', status: 'AI Unavailable' }));
    return;
  }

  const userPrompt = `User command: "${body.command}"\nImage metadata: ${body.imageMetadata ? JSON.stringify(body.imageMetadata) : 'Not provided'}\nCurrent edit state: ${body.currentEditState ? JSON.stringify(body.currentEditState) : 'Default'}\nReturn ONLY valid JSON with operations and explanation.`;

  try {
    const { content } = await callTokenHarbor([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }], Object.keys(override).length ? override : undefined);
    let parsed;
    try { parsed = JSON.parse(content); } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error('Invalid JSON from AI');
    }
    const aiValid = validateAiResponse(parsed);
    if (!aiValid.valid) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: aiValid.error, code: 'INVALID_AI_RESPONSE' }));
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'I prepared the requested edits.', operations: aiValid.sanitized.operations, explanation: aiValid.sanitized.explanation, confidence: aiValid.sanitized.confidence, model: env.model }));
  } catch (e) {
    console.error('AI error:', e.message, e.code);
    // Local fallback for network errors
    const isNetwork = ['NETWORK_ERROR','PROVIDER_ERROR','TIMEOUT','PROVIDER_HTML','EMPTY_RESPONSE','API_ERROR'].includes(e.code) || e.message?.includes('fetch failed');
    if (isNetwork) {
      try {
        const local = parseCommandLocally(body.command);
        const localValidation = validateAiResponse({ operations: local.operations, explanation: local.explanation, confidence: local.confidence });
        if (localValidation.valid) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-AI-Mode', 'local-fallback');
          res.end(JSON.stringify({
            success: true,
            message: 'I prepared the requested edits (local mode - AI unavailable).',
            operations: localValidation.sanitized.operations,
            explanation: local.explanation + ' (Local fallback - works offline)',
            confidence: local.confidence,
            model: env.model + ' (local-fallback)',
            fallback: true,
            originalError: e.code
          }));
          return;
        }
      } catch {}
    }
    let status = 500; let msg = 'AI assistance failed. You can continue editing manually.';
    if (e.code === 'CONFIG_MISSING') { status = 503; msg = 'AI assistance is temporarily unavailable. You can continue editing manually.'; }
    else if (e.code === 'AUTH_FAILED') { status = 502; msg = 'AI service authentication failed.'; }
    else if (e.code === 'RATE_LIMIT') { status = 429; msg = 'AI rate limit exceeded.'; }
    else if (e.code === 'TIMEOUT') { status = 504; msg = 'AI request timed out.'; }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: msg, code: e.code || 'AI_ERROR' }));
  }
}

async function handleStatus(req, res) {
  const env = getEnv();
  const valid = validateEnv(env);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true, status: valid.valid ? 'AI Connected' : 'Configuration Required', configured: valid.valid, model: env.model, hasApiKey: !!env.apiKey, timestamp: new Date().toISOString(), localFallbackAvailable: true }));
}

// ---- Static server ----
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-TokenHarbor-Key, X-Api-Key, Authorization');

  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  const url = req.url || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  if (url.startsWith('/api/')) {
    let body = {};
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
        if (Buffer.concat(chunks).length > 1_000_000) {
          res.statusCode = 413; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Body too large' })); return;
        }
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (raw) { try { body = JSON.parse(raw); } catch { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ success: false, error: 'Invalid JSON' })); return; } }
    }
    if (url.startsWith('/api/ai/photo-assistant') && req.method === 'POST') { await handlePhotoAssistant(req, res, body, ip); return; }
    if (url.startsWith('/api/ai/status') && req.method === 'GET') { await handleStatus(req, res); return; }
    res.statusCode = 404; res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'API not found' })); return;
  }

  let filePath = join(distPath, url === '/' ? 'index.html' : url);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(distPath, 'index.html');
  if (!existsSync(filePath)) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain'); res.end('Not found - run npm run build first'); return; }
  const ext = extname(filePath);
  const mime = mimeTypes[ext] || 'application/octet-stream';
  try {
    const content = readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', mime);
    if (ext !== '.html') res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.end(content);
  } catch { res.statusCode = 500; res.end('Server error'); }
});

const PORT = Number(process.env.PORT) || 4173;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`ShebaFlow production server running on http://0.0.0.0:${PORT}`);
  console.log(`Static: ${distPath}`);
  console.log(`AI API: http://localhost:${PORT}/api/ai/status (local fallback enabled)`);
});
