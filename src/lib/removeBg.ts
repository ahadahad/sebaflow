/**
 * Remove BG API Configuration
 * 
 * WHERE TO SET API KEYS:
 * 
 * 1. .env file (recommended for dev):
 *    VITE_REMOVE_BG_API_KEY=your_remove_bg_key_here
 *    VITE_REMOVE_BG_PROVIDER=removebg|imgly|custom|mock
 *    VITE_REMOVE_BG_ENDPOINT=https://your-backend.com/api/remove-bg
 * 
 * 2. LocalStorage (for users in UI - gear icon):
 *    localStorage.setItem('removeBgApiKey', 'your_key')
 * 
 * 3. Custom Backend (recommended for production to hide API key):
 *    Create endpoint that proxies remove.bg
 */

export type RemoveBgProvider = 'imgly' | 'removebg' | 'custom' | 'mock';

export interface RemoveBgConfig {
  provider: RemoveBgProvider;
  apiKey?: string;
  endpoint?: string;
}

export function getRemoveBgConfig(): RemoveBgConfig {
  const envKey = import.meta.env.VITE_REMOVE_BG_API_KEY as string | undefined;
  const envEndpoint = import.meta.env.VITE_REMOVE_BG_ENDPOINT as string | undefined;
  const envProvider = import.meta.env.VITE_REMOVE_BG_PROVIDER as RemoveBgProvider | undefined;
  const lsKey = typeof localStorage !== 'undefined' ? localStorage.getItem('removeBgApiKey') || undefined : undefined;
  const lsProvider = typeof localStorage !== 'undefined' ? (localStorage.getItem('removeBgProvider') as RemoveBgProvider | null) : null;
  const lsEndpoint = typeof localStorage !== 'undefined' ? localStorage.getItem('removeBgEndpoint') || undefined : undefined;
  return {
    provider: lsProvider || envProvider || 'mock',
    apiKey: lsKey || envKey,
    endpoint: lsEndpoint || envEndpoint,
  };
}

export function saveRemoveBgConfig(config: Partial<RemoveBgConfig>) {
  if (typeof localStorage === 'undefined') return;
  if (config.apiKey !== undefined) localStorage.setItem('removeBgApiKey', config.apiKey);
  if (config.provider) localStorage.setItem('removeBgProvider', config.provider);
  if (config.endpoint !== undefined) localStorage.setItem('removeBgEndpoint', config.endpoint);
}

export async function removeBackground(imageSrc: string, config = getRemoveBgConfig()): Promise<string> {
  const { provider, apiKey, endpoint } = config;
  if (provider === 'imgly') return removeBgWithImgly(imageSrc);
  if (provider === 'removebg') {
    if (!apiKey) throw new Error('Remove.bg API key required. Get from https://www.remove.bg/api and set in settings gear icon.');
    return removeBgWithRemoveBgApi(imageSrc, apiKey, endpoint);
  }
  if (provider === 'custom' && endpoint) return removeBgWithCustomEndpoint(imageSrc, endpoint, apiKey);
  // mock - just return original, UI will set white bg
  return imageSrc;
}

// FREE client-side AI - requires: npm install @imgly/background-removal
async function removeBgWithImgly(imageSrc: string): Promise<string> {
  try {
    // This will only work if user installed @imgly/background-removal
    // Use dynamic import with variable to avoid Vite static analysis error
    const pkgName = '@imgly/background-removal';
    // @ts-ignore
    const mod = await import(/* @vite-ignore */ pkgName);
    const { removeBackground } = mod;
    
    let blob: Blob;
    if (imageSrc.startsWith('data:')) {
      const res = await fetch(imageSrc);
      blob = await res.blob();
    } else {
      const res = await fetch(imageSrc);
      blob = await res.blob();
    }
    const resultBlob = await removeBackground(blob, {});
    return URL.createObjectURL(resultBlob);
  } catch (e) {
    console.error('Imgly failed', e);
    throw new Error('FREE AI not installed. Run: npm install @imgly/background-removal\nOr use remove.bg API key in settings.');
  }
}

async function removeBgWithRemoveBgApi(imageSrc: string, apiKey: string, customEndpoint?: string): Promise<string> {
  const endpoint = customEndpoint || 'https://api.remove.bg/v1.0/removebg';
  let blob: Blob;
  if (imageSrc.startsWith('data:')) {
    const res = await fetch(imageSrc);
    blob = await res.blob();
  } else {
    const res = await fetch(imageSrc);
    blob = await res.blob();
  }
  const formData = new FormData();
  formData.append('image_file', blob);
  formData.append('size', 'auto');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`remove.bg error ${response.status}: ${err}`);
  }
  const resultBlob = await response.blob();
  return URL.createObjectURL(resultBlob);
}

async function removeBgWithCustomEndpoint(imageSrc: string, endpoint: string, apiKey?: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ image: imageSrc }),
  });
  if (!response.ok) throw new Error(`Custom endpoint error: ${response.status}`);
  const ct = response.headers.get('content-type');
  if (ct?.includes('application/json')) {
    const data = await response.json();
    return data.imageUrl || data.url || data.image;
  } else {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
