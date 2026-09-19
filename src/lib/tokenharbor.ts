/**
 * Token Harbor AI - gpt-5.6-luna for Photo Studio Enhance, Upscale
 * 
 * API Docs: https://tokenharbor.ai/docs/api/curl
 * Base URL: https://tokenharbor.ai/v1/chat/completions
 * Auth: Bearer thk_live_...
 * 
 * Model: gpt-5.6-luna
 * - GPT-5.6 model optimized for cost-sensitive workloads
 * - 1,050,000 context window, 128K max output
 * - Input: text, image | Output: text
 * - Reasoning effort: none, low, medium (default), high, xhigh, max
 * - Pricing: $0.20 / $1.20 per MTok
 * - Knowledge cutoff: Feb 16, 2026
 * 
 * Env:
 * VITE_TOKENHARBOR_API_KEY=thk_live_...
 * VITE_TOKENHARBOR_MODEL=gpt-5.6-luna
 * VITE_TOKENHARBOR_ENDPOINT=https://tokenharbor.ai/v1/chat/completions (optional custom)
 * VITE_TOKENHARBOR_REASONING_EFFORT=medium
 */

export type TokenHarborTask = 'enhance' | 'upscale' | 'crop' | 'background' | 'analyze';

export interface TokenHarborConfig {
  apiKey?: string;
  model?: string;
  endpoint?: string;
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
}

export const TOKENHARBOR_MODELS = [
  { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna 🌙 NEW', desc: 'Cost-sensitive, 1.05M ctx, 128K out, image+text input, $0.2/$1.2', category: 'flagship', badge: 'NEW' },
  { id: 'gpt-5.6', label: 'GPT-5.6', desc: 'Flagship GPT-5.6', category: 'flagship', badge: '' },
  { id: 'gpt-5.5', label: 'GPT-5.5', desc: 'Previous flagship', category: 'legacy', badge: '' },
  { id: 'tokenharbor/gpt-5.6-luna', label: 'tokenharbor/gpt-5.6-luna', desc: 'TokenHarbor namespaced ID', category: 'flagship', badge: '' },
] as const;

export function getTokenHarborConfig(): TokenHarborConfig {
  const envKey = import.meta.env.VITE_TOKENHARBOR_API_KEY as string | undefined;
  const envModel = import.meta.env.VITE_TOKENHARBOR_MODEL as string | undefined;
  const envEndpoint = import.meta.env.VITE_TOKENHARBOR_ENDPOINT as string | undefined;
  const envReasoning = import.meta.env.VITE_TOKENHARBOR_REASONING_EFFORT as string | undefined;

  const lsKey = typeof localStorage !== 'undefined' ? localStorage.getItem('tokenharborApiKey') || undefined : undefined;
  const lsModel = typeof localStorage !== 'undefined' ? localStorage.getItem('tokenharborModel') || undefined : undefined;
  const lsEndpoint = typeof localStorage !== 'undefined' ? localStorage.getItem('tokenharborEndpoint') || undefined : undefined;
  const lsReasoning = typeof localStorage !== 'undefined' ? localStorage.getItem('tokenharborReasoningEffort') || undefined : undefined;

  return {
    apiKey: lsKey || envKey,
    model: lsModel || envModel || 'gpt-5.6-luna',
    endpoint: lsEndpoint || envEndpoint || 'https://tokenharbor.ai/v1/chat/completions',
    reasoningEffort: (lsReasoning || envReasoning || 'medium') as any,
  };
}

export function saveTokenHarborConfig(config: Partial<TokenHarborConfig>) {
  if (typeof localStorage === 'undefined') return;
  if (config.apiKey !== undefined) localStorage.setItem('tokenharborApiKey', config.apiKey);
  if (config.model) localStorage.setItem('tokenharborModel', config.model);
  if (config.endpoint !== undefined) localStorage.setItem('tokenharborEndpoint', config.endpoint);
  if (config.reasoningEffort) localStorage.setItem('tokenharborReasoningEffort', config.reasoningEffort);
}

// Convert data URL to base64 without prefix
function dataUrlToBase64(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL');
  return { mimeType: match[1], data: match[2] };
}

async function imageToBase64(imageSrc: string): Promise<{ mimeType: string; data: string }> {
  if (imageSrc.startsWith('data:')) {
    return dataUrlToBase64(imageSrc);
  }
  const res = await fetch(imageSrc);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(dataUrlToBase64(reader.result as string));
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function enhanceWithTokenHarbor(
  imageSrc: string,
  task: TokenHarborTask = 'enhance',
  customPrompt?: string
): Promise<{ imageUrl?: string; text?: string; suggestions?: any }> {
  const config = getTokenHarborConfig();
  const endpointCheck = config.endpoint || '';
  if (!config.apiKey && !endpointCheck.includes('localhost')) {
    // Allow custom endpoint without key for proxy
    if (!config.apiKey) {
      throw new Error('TokenHarbor API key required. Get from https://tokenharbor.ai/dashboard (thk_live_...) and set in settings or .env as VITE_TOKENHARBOR_API_KEY');
    }
  }

  if (!config.endpoint) {
    throw new Error('Endpoint required');
  }
  const { data: b64, mimeType } = await imageToBase64(imageSrc);

  const prompts: Record<TokenHarborTask, string> = {
    enhance: customPrompt || `You are a professional passport photo enhancer (BD 40x50mm, 35x45mm standards). Analyze this photo and return JSON ONLY:
{
  "brightness": 5-20 (adjustment %),
  "contrast": 5-20,
  "sharpness": "low|medium|high",
  "lightingFix": "description of lighting issue",
  "colorBalance": "warm|cool|neutral + adjustment",
  "noiseLevel": "low|medium|high",
  "skinTone": "natural|adjustment needed",
  "faceCoverage": "estimate % of frame face occupies",
  "backgroundOk": true/false,
  "suggestions": ["tip1","tip2"],
  "passportReady": true/false,
  "overallScore": 0-100
}
Return ONLY valid JSON, no markdown, no extra text.`,

    upscale: customPrompt || `You are a photo upscaling expert for passport photos (300 DPI print). Analyze this image and return JSON ONLY:
{
  "currentResolution": "WxH estimate",
  "quality": "low|medium|high",
  "scale": 2-4 (recommended upscale factor),
  "suggestedResolution": "e.g. 3000x4000",
  "details": "what details need enhancement (eyes, hair, etc)",
  "dpi": 150-300,
  "printReady": true/false,
  "enhancements": ["eye sharpness","hair detail"],
  "overallScore": 0-100
}
Return ONLY valid JSON.`,

    crop: `You are a passport photo cropping expert. Analyze face position for 40x50mm BD passport. Return JSON ONLY:
{
  "faceDetected": true,
  "faceBox": {"x":0.2,"y":0.1,"w":0.6,"h":0.7} (normalized 0-1),
  "suggestedCrop": {"x":0.1,"y":0.05,"w":0.8,"h":0.9},
  "confidence": 0-100,
  "eyePosition": "50-60% from top?",
  "faceCoverage": "70-80%?",
  "centered": true/false,
  "tips": ["center face","70-80% frame"]
}
Return ONLY JSON.`,

    background: `Analyze background for passport photo. Return JSON ONLY:
{
  "background": "white|offwhite|lightblue|other",
  "backgroundOk": true/false,
  "needsRemoval": true/false,
  "edgeQuality": "clean|needs work",
  "shadow": "none|light|heavy",
  "suggestions": ["tip"]
}`,

    analyze: `Analyze this passport photo comprehensively for BD standards (40x50mm). Return JSON ONLY:
{
  "faceDetected": true,
  "faceCoverage": 75,
  "background": "white",
  "lighting": "good|needs fix",
  "sharpness": "high",
  "passportReady": true/false,
  "score": 85,
  "issues": ["list"],
  "fixes": ["list"]
}`,
  };

  const prompt = prompts[task];

  // TokenHarbor is OpenAI compatible
  const endpoint = config.endpoint! || 'https://tokenharbor.ai/v1/chat/completions';
  const model = config.model || 'gpt-5.6-luna';
  const reasoningEffort = config.reasoningEffort || 'medium';

  // Build messages with image
  const messages = [
    {
      role: 'system',
      content: 'You are a precise passport photo analysis assistant. Return ONLY valid JSON, no markdown, no explanations, no code blocks. Pure JSON object.',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${b64}`,
            detail: 'high',
          },
        },
      ],
    },
  ];

  const body: any = {
    model,
    messages,
    max_tokens: 2048,
    temperature: 0.2,
  };

  // Add reasoning effort for gpt-5.6-luna if supported
  if (model.includes('5.6-luna') || model.includes('5.6') || model.includes('luna')) {
    body.reasoning_effort = reasoningEffort; // none, low, medium, high, xhigh, max
    // Some gateways use reasoning object
    body.reasoning = { effort: reasoningEffort };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  // Try direct fetch, fallback to vite proxy /api/tokenharbor if CORS fails and endpoint is tokenharbor.ai
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (fetchError: any) {
    // Failed to fetch usually means CORS or network blocked
    // If endpoint is tokenharbor.ai, try vite proxy
    if (endpoint.includes('tokenharbor.ai')) {
      try {
        // Use relative proxy path that vite will forward
        const proxyEndpoint = '/api/tokenharbor';
        response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      } catch (proxyError: any) {
        // Both failed - throw helpful CORS error
        throw new Error(
          `Failed to fetch TokenHarbor (CORS/network). This usually happens when calling tokenharbor.ai directly from browser.\n` +
          `Solutions:\n` +
          `1. Use Vite proxy: set endpoint to /api/tokenharbor (dev) or use custom backend\n` +
          `2. Create backend proxy that forwards to https://tokenharbor.ai/v1/chat/completions with your key\n` +
          `3. For now, using local fallback - no AI needed for passport.\n` +
          `Original: ${fetchError.message}`
        );
      }
    } else {
      throw new Error(
        `Failed to fetch ${endpoint}. Check CORS, network, or use custom backend proxy.\nOriginal: ${fetchError.message}`
      );
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    const trimmed = errText.trim().toLowerCase();
    const isHtml = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.includes('<html') || trimmed.includes('<!doctype html');

    let errMsg = errText;
    if (isHtml) {
      // Cloudflare / gateway HTML page - never expose raw HTML to UI
      if (response.status === 502 || response.status === 503 || response.status === 504 || response.status >= 520) {
        errMsg = `Server temporarily unavailable (status ${response.status}). TokenHarbor may be down or overloaded. Try again later.`;
      } else if (response.status === 401 || response.status === 403) {
        errMsg = `Auth failed (${response.status}). Check API key at tokenharbor.ai/dashboard`;
      } else {
        errMsg = `Server returned HTML page (status ${response.status}) instead of JSON. Endpoint may be wrong or service down.`;
      }
    } else {
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errJson.error?.message?.content || errJson.error || errText;
        // Ensure errMsg is string and not too long
        if (typeof errMsg !== 'string') errMsg = JSON.stringify(errMsg);
        if (errMsg.length > 300) errMsg = errMsg.substring(0, 300) + '...';
      } catch {
        // not JSON, keep trimmed text limited
        if (errMsg.length > 300) errMsg = errMsg.substring(0, 300) + '...';
      }
    }

    if (response.status === 401) {
      throw new Error(`TokenHarbor auth failed: ${errMsg}`);
    }
    if (errMsg.toLowerCase().includes('model') && errMsg.toLowerCase().includes('not found')) {
      throw new Error(`Model ${model} not found on TokenHarbor. Try gpt-5.6-luna.`);
    }
    if (response.status === 502 || response.status === 503 || response.status >= 520) {
      throw new Error(`${errMsg} Local fallback will be used.`);
    }
    throw new Error(`TokenHarbor API error ${response.status}: ${errMsg}`);
  }

  let result: any;
  try {
    const rawText = await response.text();
    const low = rawText.trim().toLowerCase();
    if (low.startsWith('<!doctype') || low.startsWith('<html') || low.includes('<html')) {
      throw new Error(`TokenHarbor returned HTML instead of JSON (status ${response.status} - service may be down or endpoint wrong). Local fallback will be used.`);
    }
    result = JSON.parse(rawText);
  } catch (jsonErr: any) {
    if (jsonErr.message.includes('Local fallback')) throw jsonErr;
    if (jsonErr.message.includes('HTML instead')) throw jsonErr;
    // If already JSON error after text check
    throw new Error(`TokenHarbor returned invalid JSON: ${jsonErr.message}. Local fallback will be used.`);
  }
  const content = result.choices?.[0]?.message?.content || '';

  // Try to parse JSON
  let jsonData: any = null;
  let text = content;

  if (content) {
    try {
      // Direct JSON
      jsonData = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown or text
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0]);
        }
      } catch {}
    }
  }

  // For image tasks, we don't generate images (gpt-5.6-luna is text-only output)
  // Return suggestions for local processing
  return {
    text: text,
    suggestions: jsonData || text,
  };
}

export const isImageModel = (modelId: string) => modelId.includes('image') || modelId.includes('dall-e') || modelId.includes('imagen');
export const isTextOnlyModel = () => true;
