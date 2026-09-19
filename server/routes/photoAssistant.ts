/**
 * POST /api/ai/photo-assistant
 * Secure backend endpoint for AI photo editing assistant
 * Includes local fallback when TokenHarbor unavailable (offline mode)
 */

import { callTokenHarbor, AI_SYSTEM_PROMPT, getTokenHarborEnv, validateTokenHarborEnv } from '../services/tokenHarborClient.js';
import { validateRequestBody, validateAiResponse } from '../utils/validation.js';

// Local fallback parser - keyword based, works offline
function parseCommandLocally(command: string): { operations: any[]; explanation: string; confidence: number } {
  const lower = command.toLowerCase();
  const ops: any[] = [];
  let explanation = '';

  // Background
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
    // Generic background
    if (lower.includes('green')) { ops.push({ type: 'setBackground', color: '#10b981' }); explanation += 'Background set to green. '; }
    else if (lower.includes('pink')) { ops.push({ type: 'setBackground', color: '#f472b6' }); explanation += 'Background set to pink. '; }
  }

  // Lighting / Brightness
  if (lower.includes('improve lighting') || lower.includes('lighting') || lower.includes('improve light')) {
    ops.push({ type: 'setBrightness', value: 12 });
    ops.push({ type: 'setContrast', value: 8 });
    ops.push({ type: 'setExposure', value: 5 });
    explanation += 'Lighting improved with brightness and contrast. ';
  } else {
    if (lower.includes('brighter') || lower.includes('brightness') || lower.includes('bright')) {
      if (lower.includes('much') || lower.includes('more')) ops.push({ type: 'setBrightness', value: 20 });
      else ops.push({ type: 'setBrightness', value: 15 });
      explanation += 'Brightness increased. ';
    }
    if (lower.includes('darker') || lower.includes('dark')) {
      ops.push({ type: 'setBrightness', value: -15 });
      explanation += 'Brightness decreased. ';
    }
  }

  // Contrast
  if (lower.includes('contrast')) {
    if (lower.includes('increase') || lower.includes('more') || lower.includes('higher')) ops.push({ type: 'setContrast', value: 10 });
    else if (lower.includes('decrease') || lower.includes('less')) ops.push({ type: 'setContrast', value: -10 });
    else if (!explanation.includes('contrast')) ops.push({ type: 'setContrast', value: 8 });
    explanation += 'Contrast adjusted. ';
  }

  // Saturation / Natural
  if (lower.includes('saturation') || lower.includes('natural') || lower.includes('colorful')) {
    ops.push({ type: 'setSaturation', value: 10 });
    explanation += 'Saturation enhanced for natural look. ';
  }

  // Sharpness
  if (lower.includes('sharper') || lower.includes('sharp') || lower.includes('clearer') || lower.includes('enhance')) {
    if (!ops.some(o => o.type === 'setContrast')) ops.push({ type: 'setContrast', value: 10 });
    ops.push({ type: 'setFilter', filter: 'vivid' });
    explanation += 'Sharpness and vividness enhanced. ';
  }

  // Warm / Cool
  if (lower.includes('warmer') || lower.includes('warm')) {
    ops.push({ type: 'setFilter', filter: 'warm' });
    explanation += 'Warm filter applied. ';
  }
  if (lower.includes('cooler') || lower.includes('cool')) {
    ops.push({ type: 'setFilter', filter: 'cool' });
    explanation += 'Cool filter applied. ';
  }
  if (lower.includes('grayscale') || lower.includes('black and white') || lower.includes('bw')) {
    ops.push({ type: 'setFilter', filter: 'grayscale' });
    explanation += 'Grayscale applied. ';
  }
  if (lower.includes('sepia') || lower.includes('vintage')) {
    ops.push({ type: 'setFilter', filter: lower.includes('vintage') ? 'vintage' : 'sepia' });
    explanation += `${lower.includes('vintage') ? 'Vintage' : 'Sepia'} filter applied. `;
  }

  // Passport
  if (lower.includes('passport')) {
    if (!ops.some(o => o.type === 'resize')) ops.push({ type: 'resize', preset: 'passport', width: 400, height: 500 });
    if (!ops.some(o => o.type === 'setBackground')) ops.push({ type: 'setBackground', color: '#ffffff' });
    if (!ops.some(o => o.type === 'crop')) ops.push({ type: 'crop', preset: 'passport' });
    explanation += 'Prepared for passport size (40x50mm) with white background. ';
  }

  // Crop
  if (lower.includes('crop')) {
    if (lower.includes('1:1') || lower.includes('square')) ops.push({ type: 'crop', preset: '1:1' });
    else if (lower.includes('4:5')) ops.push({ type: 'crop', preset: '4:5' });
    else if (lower.includes('16:9')) ops.push({ type: 'crop', preset: '16:9' });
    else if (!ops.some(o => o.type === 'crop')) ops.push({ type: 'crop', preset: 'free' });
    explanation += 'Crop prepared. ';
  }

  // Resize
  if (lower.includes('resize') || lower.includes('profile') || lower.includes('social') || lower.includes('instagram') || lower.includes('youtube') || lower.includes('thumbnail')) {
    if (lower.includes('profile')) ops.push({ type: 'resize', preset: 'profile', width: 500, height: 500 });
    else if (lower.includes('instagram story') || lower.includes('story')) ops.push({ type: 'resize', preset: 'insta-story', width: 1080, height: 1920 });
    else if (lower.includes('instagram') || lower.includes('social square')) ops.push({ type: 'resize', preset: 'social-square', width: 1080, height: 1080 });
    else if (lower.includes('youtube') || lower.includes('thumbnail')) ops.push({ type: 'resize', preset: 'yt-thumb', width: 1280, height: 720 });
    else if (!ops.some(o => o.type === 'resize')) ops.push({ type: 'resize', preset: 'passport', width: 400, height: 500 });
    explanation += 'Resize prepared. ';
  }

  // Rotate
  if (lower.includes('rotate')) {
    if (lower.includes('90')) {
      const deg = lower.includes('left') || lower.includes('-90') ? -90 : 90;
      ops.push({ type: 'rotate', degrees: deg });
    } else if (lower.includes('180')) {
      ops.push({ type: 'rotate', degrees: 180 });
    } else {
      ops.push({ type: 'rotate', degrees: 90 });
    }
    explanation += 'Rotation prepared. ';
  }

  // Flip
  if (lower.includes('flip horizontal') || lower.includes('flip h') || (lower.includes('flip') && lower.includes('horizontal'))) {
    ops.push({ type: 'flipHorizontal' });
    explanation += 'Horizontal flip. ';
  }
  if (lower.includes('flip vertical') || lower.includes('flip v') || (lower.includes('flip') && lower.includes('vertical'))) {
    ops.push({ type: 'flipVertical' });
    explanation += 'Vertical flip. ';
  }

  // Reset
  if (lower.includes('reset')) {
    ops.push({ type: 'resetAdjustments' });
    explanation += 'Adjustments reset. ';
  }

  // If no ops matched, try generic
  if (ops.length === 0) {
    // Check for unsupported
    if (lower.includes('remove object') || lower.includes('remove person') || lower.includes('generate') || lower.includes('create image') || lower.includes('face detection')) {
      return {
        operations: [{ type: 'unsupported', reason: `Command "${command}" requires advanced AI that needs visual understanding or generation, not supported by local editor. Try: background color, brightness, contrast, crop, resize, rotate.` }],
        explanation: `The requested action "${command}" is not supported by the local editor. Try simpler commands like background color, brightness, or passport size.`,
        confidence: 30
      };
    }
    // Default: slight enhancement
    ops.push({ type: 'setBrightness', value: 10 });
    ops.push({ type: 'setContrast', value: 8 });
    explanation = `Applied general enhancement for: "${command}". For better results, try specific commands like "Make background white" or "Improve lighting".`;
  }

  if (!explanation) explanation = `Prepared edits for: "${command}"`;

  return { operations: ops, explanation: explanation.trim(), confidence: 75 };
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetTime - now };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

export interface PhotoAssistantHandlerOptions {
  req: any;
  res: any;
  body: any;
  ip: string;
}

export async function handlePhotoAssistant({ req, res, body, ip }: PhotoAssistantHandlerOptions) {
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil(rateLimit.resetIn / 1000).toString());
    res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait a moment.', code: 'RATE_LIMIT', retryAfter: Math.ceil(rateLimit.resetIn / 1000) }));
    return;
  }

  const validation = validateRequestBody(body);
  if (!validation.valid) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: validation.error, code: 'VALIDATION_ERROR' }));
    return;
  }

  const { command, imageMetadata, currentEditState } = validation.data!;

  // Allow API key override from UI (dev convenience) - header or body
  const headerKey = (req.headers['x-tokenharbor-key'] as string) || (req.headers['x-api-key'] as string) || '';
  const bodyKey = (body as any).apiKey || (body as any).tokenHarborApiKey || '';
  const override: any = {};
  if (headerKey) override.apiKey = headerKey;
  else if (bodyKey) override.apiKey = bodyKey;
  // Optional model/baseUrl override from body for advanced users
  if ((body as any).model) override.model = (body as any).model;
  if ((body as any).baseUrl) override.baseUrl = (body as any).baseUrl;

  const env = getTokenHarborEnv(Object.keys(override).length ? override : undefined);
  const envValidation = validateTokenHarborEnv(env);
  if (!envValidation.valid) {
    // Try local fallback even when no API key - works offline
    try {
      const local = parseCommandLocally(command);
      const localValidation = validateAiResponse({ operations: local.operations, explanation: local.explanation, confidence: local.confidence });
      if (localValidation.valid && localValidation.sanitized) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
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
    } catch (fallbackErr: any) {
      console.error('[PhotoAssistant] Local fallback failed:', fallbackErr.message);
    }
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'AI assistance is temporarily unavailable. You can continue editing manually.', code: 'CONFIG_MISSING', details: envValidation.error, status: 'AI Unavailable' }));
    return;
  }

  const userPrompt = `
User command: "${command}"
Image metadata: ${imageMetadata ? JSON.stringify(imageMetadata) : 'Not provided'}
Current edit state: ${currentEditState ? JSON.stringify(currentEditState) : 'Default (no edits yet)'}
Interpret the command and return ONLY valid JSON with operations and explanation.
Be conservative with values. If command requests something unsupported, return unsupported operation.
Examples:
- "Make background white" -> setBackground #ffffff
- "Improve lighting" -> setBrightness 12, setContrast 8
- "Sharper" -> setContrast 10, setFilter vivid
- "Passport style" -> resize preset passport, setBackground white, crop preset passport
- "Light blue background" -> setBackground #bae6fd
- "Remove background" -> setTransparency true
- "Brighter and natural" -> setBrightness 15, setSaturation 5
- "Crop to passport" -> crop preset passport
- "Reset" -> resetAdjustments
Return JSON only, no markdown.
`;

  try {
    const { content } = await callTokenHarbor(
      [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.2, maxTokens: 1200, timeoutMs: 20000, envOverride: Object.keys(override).length ? override : undefined }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('AI returned invalid JSON');
        }
      } else {
        throw new Error('AI response was not valid JSON');
      }
    }

    const aiValidation = validateAiResponse(parsed);
    if (!aiValidation.valid) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Invalid AI response: ${aiValidation.error}`, code: 'INVALID_AI_RESPONSE', raw: content.substring(0, 500) }));
      return;
    }

    const sanitized = aiValidation.sanitized!;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    res.end(JSON.stringify({ success: true, message: 'I prepared the requested edits.', operations: sanitized.operations, explanation: sanitized.explanation, confidence: sanitized.confidence, model: env.model }));
  } catch (e: any) {
    console.error('[PhotoAssistant] Error:', e.message, 'Code:', e.code);

    // Try local fallback for network/provider errors - works offline
    const isNetworkError = ['NETWORK_ERROR', 'PROVIDER_ERROR', 'TIMEOUT', 'PROVIDER_HTML', 'EMPTY_RESPONSE', 'INVALID_JSON', 'API_ERROR'].includes(e.code) || e.message?.includes('fetch failed') || e.message?.includes('Network');
    
    if (isNetworkError) {
      try {
        console.log('[PhotoAssistant] Using local fallback parser for:', command);
        const local = parseCommandLocally(command);
        // Validate local response
        const localValidation = validateAiResponse({ operations: local.operations, explanation: local.explanation, confidence: local.confidence });
        if (localValidation.valid && localValidation.sanitized) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
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
      } catch (fallbackErr: any) {
        console.error('[PhotoAssistant] Local fallback also failed:', fallbackErr.message);
      }
    }

    let statusCode = 500;
    let errorMessage = 'AI assistance failed. You can continue editing manually.';
    let code = e.code || 'AI_ERROR';
    if (e.code === 'CONFIG_MISSING') { statusCode = 503; errorMessage = 'AI assistance is temporarily unavailable. You can continue editing manually.'; }
    else if (e.code === 'AUTH_FAILED') { statusCode = 502; errorMessage = 'AI service authentication failed. Please check configuration.'; }
    else if (e.code === 'RATE_LIMIT') { statusCode = 429; errorMessage = 'AI service rate limit exceeded. Please try again shortly.'; }
    else if (e.code === 'TIMEOUT') { statusCode = 504; errorMessage = 'AI request timed out. Please try again.'; }
    else if (e.code === 'NETWORK_ERROR' || e.code === 'PROVIDER_ERROR') { statusCode = 502; errorMessage = 'AI service temporarily unavailable. You can continue editing manually.'; }
    else if (e.code === 'EMPTY_RESPONSE' || e.code === 'INVALID_JSON') { statusCode = 502; errorMessage = 'AI returned an invalid response. Please try rephrasing your command.'; }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: errorMessage, code, ...(process.env.NODE_ENV !== 'production' ? { details: e.message } : {}) }));
  }
}

export async function handleAiStatus(_req: any, res: any) {
  const env = getTokenHarborEnv();
  const validation = validateTokenHarborEnv(env);
  const status = validation.valid ? 'AI Connected' : 'Configuration Required';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true, status, configured: validation.valid, model: env.model, baseUrl: env.baseUrl ? env.baseUrl.replace(/\/\/.*@/, '//***@') : undefined, hasApiKey: !!env.apiKey, timestamp: new Date().toISOString(), localFallbackAvailable: true }));
}
