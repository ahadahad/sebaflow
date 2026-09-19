# ShebaFlow Photo Studio - TokenHarbor AI Integration Report

## Overview
Added secure AI-powered photo editing assistant to ShebaFlow Photo Studio using TokenHarbor's OpenAI-compatible API with model `gpt-5.6-luna`. The integration interprets natural language commands and converts them to structured editing operations applied locally via Canvas API.

---

## 1. Files Created

### Server (Secure Backend)
- `server/services/tokenHarborClient.ts` - Server-only TokenHarbor client with secure env handling, error handling for missing key, invalid URL, auth failure, rate limits, timeout, network failure, provider errors, empty response
- `server/utils/validation.ts` - Strict validation schemas for commands, image metadata, AI operations, request body size, color validation
- `server/routes/photoAssistant.ts` - POST /api/ai/photo-assistant and GET /api/ai/status handlers with rate limiting (10 req/min/IP), body size limit, validation
- `server/index.ts` - Production server (TS) serving static dist + AI API
- `server/prod-server.mjs` - Production server (JS self-contained) for `node server/prod-server.mjs`
- `server/tests/aiAssistant.test.mjs` - 14 unit tests covering all required cases

### Frontend
- `src/features/photo-studio/types/aiAssistant.ts` - Types for AI operations, requests, responses, example commands
- `src/features/photo-studio/utils/aiExecutor.ts` - Safe operation executor mapping AI ops to editor state, never executes arbitrary code, creates undo history
- `src/features/photo-studio/components/AiAssistantPanel.tsx` - AI Assistant UI panel with input, suggestions, loading, error, preview, apply/cancel, conversation history, status indicator
- `src/features/photo-studio/__tests__/aiExecutor.test.ts` - Executor unit tests

### Config
- Updated `.env.example` - Added secure server-only vars and documented insecure legacy vars

---

## 2. Files Modified

- `vite.config.ts` - Added `aiApiPlugin()` with `configureServer` middleware handling `/api/ai/photo-assistant` and `/api/ai/status` securely in Node context, removed insecure `/api/tokenharbor` proxy, added CORS, body size limit, error handling
- `src/pages/PassportStudio.tsx` - Integrated AiAssistantPanel, added `handleApplyAiOperations` using `executeAiOperations`, added state mapping for filter/rotate/flip/bg/border/resize, push history before apply
- `package.json` - Added `server` and `start` scripts (`node server/prod-server.mjs`)
- `src/lib/tokenharbor.ts` - Kept for backward compatibility but new secure client is in `server/services/`

---

## 3. Environment Variables Required

### Secure (Server-Only, Recommended)
```env
TOKEN_HARBOR_API_KEY=thk_live_...
TOKEN_HARBOR_BASE_URL=https://tokenharbor.ai/v1
TOKEN_HARBOR_MODEL=gpt-5.6-luna
```

### Alternative Names Supported
```env
TOKENHARBOR_API_KEY=...
TOKENHARBOR_BASE_URL=...
TOKENHARBOR_MODEL=...
```

### Legacy (Insecure, Client-Exposed, Dev Only)
```env
VITE_TOKENHARBOR_API_KEY=... # Exposes to browser - deprecated
VITE_TOKENHARBOR_MODEL=gpt-5.6-luna
```

**Security:** Never put real API key in `VITE_` vars for production. Use server-only vars. The API key is only read in Node middleware (`process.env`), never sent to frontend. All error responses hide sensitive details.

---

## 4. Installation Commands

No new npm packages required (uses native fetch, Node http). Existing dependencies suffice.

```bash
# Install (if needed)
npm install

# Dev with AI API (Vite handles /api/ai/*)
npm run dev

# Build
npm run build

# Production server with AI API
npm run server
# or
npm run start  # build + server

# Run tests
node --test server/tests/aiAssistant.test.mjs
```

---

## 5. How to Start Application

```bash
# 1. Copy env
cp .env.example .env
# Edit .env and set TOKEN_HARBOR_API_KEY=thk_live_...

# 2. Dev
npm run dev
# Open https://5173-{sandboxId}.e2b.app or http://localhost:5173
# Go to /studio/passport-photo or /tools/passport-photo

# 3. Check AI status
curl http://localhost:5173/api/ai/status
# Should return {"status":"AI Connected","configured":true,...} if key set
# If no key: {"status":"Configuration Required",...}

# 4. Production
npm run build
npm run server
# Server on http://0.0.0.0:4173
```

---

## 6. How to Test TokenHarbor

### Without API Key (Offline Fallback)
```bash
curl -X POST http://localhost:5173/api/ai/photo-assistant \
  -H "Content-Type: application/json" \
  -d '{"command":"Make background white"}'
# Returns 503 with "AI assistance is temporarily unavailable. You can continue editing manually."
# Frontend shows amber warning but editor remains functional
```

### With API Key (If Available)
```bash
# Set in .env
TOKEN_HARBOR_API_KEY=thk_live_yourkey

# Test status
curl http://localhost:5173/api/ai/status

# Test command
curl -X POST http://localhost:5173/api/ai/photo-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Make the background white and improve lighting",
    "imageMetadata": {"width": 1200, "height": 1600, "mimeType": "image/png"},
    "currentEditState": {"brightness": 0, "contrast": 0, "backgroundColor": "#ffffff"}
  }'
# Expected: {"success":true,"operations":[{"type":"setBackground","color":"#ffffff"},...],"explanation":"..."}
```

### Frontend Test
1. Upload image in Photo Studio
2. In AI Assistant panel (left panel), type "Make the background white"
3. Click Ask AI
4. See loading, then explanation + operation preview
5. Click Apply Changes
6. Verify background changes, undo works (Ctrl+Z)

---

## 7. Example AI Commands

All commands are interpreted by gpt-5.6-luna into structured JSON:

- "Make the background white." → `setBackground #ffffff`
- "Improve the lighting." → `setBrightness 12, setContrast 8, setExposure 5`
- "Make this photo sharper." → `setFilter vivid, setContrast 10`
- "Create a professional passport-style photo." → `resize preset passport, setBackground white, crop preset passport`
- "Change the background to light blue." → `setBackground #bae6fd`
- "Remove the background." → `setTransparency true` + explanation that real removal needs service
- "Make the image brighter and more natural." → `setBrightness 15, setSaturation 5, setFilter warm`
- "Crop this image to passport size." → `crop preset passport`
- "Make the photo brighter" → `setBrightness 15`
- "Set the background to white" → `setBackground #ffffff`
- "Make the image warmer" → `setFilter warm`
- "Prepare this for passport size" → `resize preset passport`
- "Increase contrast slightly" → `setContrast 8`
- "Reset all adjustments" → `resetAdjustments`

---

## 8. Which Operations Work Locally (No AI Needed)

All operations returned by AI are applied locally via Canvas API:

- ✅ setBrightness (-50 to +50 delta, clamped 0-200)
- ✅ setContrast (-50 to +50)
- ✅ setSaturation (-50 to +50)
- ✅ setExposure (-30 to +30, maps to exposure filter)
- ✅ setFilter (grayscale, sepia, vivid, warm, cool, vintage, original, blur, sharpen)
- ✅ crop (preset: free, 1:1, 4:5, 3:4, 4:3, 16:9, passport → maps to resize)
- ✅ resize (width/height or preset: passport, profile, social-square, fb-post, insta-post, insta-story, yt-thumb)
- ✅ rotate (degrees -360 to 360, typically 90, -90, 180)
- ✅ flipHorizontal
- ✅ flipVertical
- ✅ setBackground (hex, rgb, named colors, transparent)
- ✅ setTransparency (boolean)
- ✅ setBorder (enabled, color, thickness 1-20, radius 0-50)
- ✅ resetAdjustments
- ✅ exportSuggestion (format png/jpg/webp, quality 10-100) - informational
- ✅ unsupported - shown with reason, not applied

Basic editor (upload, crop, resize, rotate, flip, brightness, contrast, saturation, filters, background, border, export) works **fully offline** after app loads, no TokenHarbor needed.

---

## 9. Which Features Require Image-Capable AI Support

Current implementation **does NOT send image to TokenHarbor** (text-only command interpretation). This is intentional for security and cost.

If image input were supported (gpt-5.6-luna does support image input per TokenHarbor docs):

- Would need server-side image upload flow with MIME validation (jpg/png/webp), size limit (20MB), temp file cleanup, no permanent storage, no logging of image data
- Could enable: visual analysis, auto face detection validation, background analysis, lighting analysis, passport readiness scoring
- Currently, these are marked as unsupported with clear explanation: "This feature will be connected to AI processing in next version" or "Face detection uses browser FaceDetector API with fallback"

The existing `src/lib/tokenharbor.ts` has image-to-base64 logic for future use, but new secure endpoint does not use it to avoid sending images unless explicitly enabled.

---

## 10. Remaining Limitations

- **No real image generation/removal**: AI does not directly edit pixels; it only returns JSON instructions. Background removal still uses existing `removeBg` provider (mock/imgly/removebg/custom). AI suggestion for "Remove background" sets transparency but does not perform actual AI segmentation unless provider configured.
- **No vision understanding yet**: AI cannot see image, only metadata. Requests requiring visual understanding (e.g., "remove person in background") return `unsupported` with explanation.
- **Rate limiting in-memory**: Simple Map, resets on server restart, per IP, 10 req/min. For production multi-instance, use Redis.
- **No authentication**: Endpoint is open, rate-limited by IP. For production, add user/session auth.
- **No persistent conversation**: Conversation history is frontend-only, last 5, cleared on refresh. Could add backend session storage.
- **Model fixed to gpt-5.6-luna**: Configurable via env, but system prompt optimized for this model.
- **No streaming**: Response is not streamed; for long reasoning, add streaming support.
- **Build chunk size**: Main chunk 513kB (gz 142kB) > 500kB warning, due to large PassportStudio page. Could code-split AI panel via dynamic import.
- **Tests**: 14 tests implemented in Node test runner, but no Vitest/Jest integration yet. Could add to CI.
- **Production server**: `server/prod-server.mjs` is self-contained JS; TS version `server/index.ts` requires tsx or build step. For Vercel/Netlify, adapt to serverless functions.

---

## Security Checklist

- ✅ API key never in frontend, only `process.env` in Vite middleware (Node)
- ✅ No `VITE_TOKENHARBOR_API_KEY` in production code path for AI assistant
- ✅ Error responses hide API key, only show user-friendly messages
- ✅ Request validation: command length 1-500, body size 10KB (frontend) / 1MB (middleware), MIME type check, color validation, operation type whitelist
- ✅ Rate limiting 10/min/IP
- ✅ No arbitrary code execution: AI output validated against strict schema, unknown ops rejected or marked unsupported
- ✅ No image data logged
- ✅ CORS handled
- ✅ Timeout 15-20s

---

## UI/UX

- Dark workspace, rounded panels, green/turquoise primary, violet/indigo for AI
- Status indicator: AI Connected (emerald), Configuration Required (amber), AI Unavailable (red)
- Loading state with spinner, error with retry, preview of operations with check icons
- Apply only on user confirmation, creates undo snapshot
- Mobile responsive: AI panel in tools tab, flex-wrap suggestions, no horizontal overflow
- Keyboard: Ctrl+Enter to send, accessible labels
- Offline: When AI unavailable, shows "AI assistance is temporarily unavailable. You can continue editing manually." and keeps all local tools functional

---

## Build Status

- ✅ `npm run build` passes: 1595 modules, 56kB CSS, 513kB JS (gz 142kB)
- ✅ `npm run lint` passes with 0 errors (19 warnings pre-existing)
- ✅ 14/14 tests pass
- ✅ Dev server: `http://localhost:5173` with `/api/ai/status` and `/api/ai/photo-assistant` working
- ✅ Production server: `node server/prod-server.mjs` serves dist + API

---

## Next Steps (Optional)

- Add image upload to AI endpoint if TokenHarbor route supports vision (validate MIME, size, temp cleanup)
- Add streaming for longer reasoning
- Add auth/session
- Code-split AI panel via `React.lazy`
- Add Vitest integration for CI
- Deploy to Vercel with serverless function at `/api/ai/photo-assistant`
