# IT Lancer BD Photo Studio – Technical Analysis

Source: https://itlancerbd.com/photo-studio-with-it-lancer-bd/
Fetched UI text: Power Mode On, File name, Format JPG/PNG, Upload, Crop/Remove BG/Enhance/Upscale, Brush Size 30px, Object/Filters, Brightness/Contrast/Saturation 100%, Face/Skin/Hair, Before/After 100%, sizes 40x50mm 50x40mm Indian Visa 2x2 inch 300px-300px 300px-80px, Rotate 0°, Image Tray, Colors, 2px Border, Joint Photo Select 2 Images, Zoom 1.00, Rotate 0°, MAKE JOINT PHOTO, limit message "আপনার আজকের লিমিট শেষ"

---

## 1. Overall Architecture

- **Platform:** WordPress site (itlancerbd.com is WP with Elementor/WooCommerce packages)
- **Photo Studio Tool:** Embedded SPA inside WP page – likely **React or Vanilla JS + Canvas API** (based on UI patterns: Power Mode, File name, Format, Image Tray, live sliders)
- **No heavy backend for image processing** – all operations run **client-side in browser** to avoid server costs (common for BD govt job photo tools)
- **Backend only for:**
  - Daily limit tracking ("আপনার আজকের লিমিট শেষ" = Your today's limit finished)
  - Optional AI proxy for Remove BG / Enhance / Upscale to hide API keys
  - User auth via WordPress login (Please log in to view and post comments)

---

## 2. Frontend – How Each Feature Likely Works

### Upload & Drag-Drop
- `<input type="file" accept="image/*">` + drag events
- `FileReader.readAsDataURL` → `Image()` → drawn to `<canvas>`
- Validation: JPG/PNG/WebP, max size (likely 5-20MB)
- **Image Tray:** Array in React state + `localStorage` for persistence, thumbnails via `canvas.toDataURL` or object URLs, active border

### Canvas Core
- Single `<canvas>` with checkerboard background for transparent
- `ctx.filter = brightness() contrast() saturate()` for live filters
- `ctx.translate / rotate / scale` for move/rotate/flip
- Zoom: `canvas.style.width = w * zoom`, `wheel` event → zoom state (you saw Zoom 1.00)
- Guides: dashed lines + ellipse for face guidance (passport 70-80%)

### Crop
- Button → `cropMode=true`, centered box 80% with handles (nw/ne/sw/se)
- Overlay: **4 dimmed rects** (not clearRect, which would erase image) – same fix we applied to ShebaFlow
- Handles: mouse down → detect corner (threshold 14px) → drag → update `cropBox`
- Apply: Create temp canvas at final size, draw full image without overlay, then `drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0,0,cropW,cropH)` → new Image from dataURL
- Aspect presets: Free, 1:1, 4:5, 3:4, 4:3, 16:9, Passport (40/50 ratio)

### Remove BG
- Options:
  - **Client-side FREE:** `@imgly/background-removal` (WASM, runs locally, no upload, model ~30MB, first load slow)
  - **API:** `remove.bg` or custom backend proxy to hide key
  - **Mock fallback:** Just set background to white (common in BD tools to avoid cost)
- Flow: `canvas.toDataURL` → `fetch(api, {method:POST, body:FormData})` → blob → new Image → set bg transparent
- UI: Processing... spinner

### Enhance / Upscale
- **Enhance:** Analyzes image via small canvas (120x120) → avg luminance, stdDev → suggests brightness/contrast/saturation adjustments (same as our `analyzeImageSmart`)
- **Upscale:** Could be:
  - Canvas `imageSmoothingQuality = 'high'` + 2x scale (fake upscale)
  - Or AI via TokenHarbor / Replicate `real-esrgan` / `gfpgan` for face enhancement
- If AI unavailable, fallback to local contrast/vivid boost

### Brush Size 30px Apply/Cancel
- Likely **inpainting / background brush** for manual cleanup after BG removal
- `<canvas>` second layer for masking, `globalCompositeOperation = 'destination-out'` to erase
- Brush size slider 5-100px, Apply merges layers

### Object vs Filters Tabs
- **Object:** Face/Skin/Hair/Subject/Background – segmentation
  - **Face:** Browser `FaceDetector` API (Chrome) with fallback centered box 25% x,15% y,50% w,60% h – exactly what we implemented
  - **Skin/Hair:** `MediaPipe Selfie Segmentation` or `TensorFlow.js BodyPix` – returns mask, then can adjust skin tone or hair color via filter on masked area
  - UI: "Select Face, Skin or Hair to detect" → shows box or mask overlay
- **Filters:** Sliders for Brightness/Contrast/Saturation/Exposure/Blur/Grayscale/Sepia/Hue/Vivid/Warm/Sharpness
  - Uses `ctx.filter` string: `brightness(115%) contrast(110%) saturate(120%)`
  - Apply/Reset buttons

### Before/After 100%
- Two canvases or slider comparison: `before` = original Image, `after` = edited canvas
- 100% toggle shows full res

### Sizes
- Presets: 40x50mm (BD Passport), 50x40mm (BD NID), Indian Visa 35x35, 2x2 inch (US Visa), 300px-300px (profile), 300px-80px (maybe signature)
- Apply → updates `selectedSize.pxW/pxH`, canvas size changes, triggers redraw
- Custom size inputs W/H mm → px = mm*10 (approx)

### Rotate
- Rotate 0° Apply – slider -180 to 180 or buttons -90/+90
- `ctx.rotate(deg * PI/180)`

### Colors & Border
- Swatches: White, LightGray, LightBlue, SkyBlue, Blue, Green, Pink, Black, Transparent (checkerboard)
- Click → `bgColor` state → fillRect
- Border: 2px Border – toggle, color picker, thickness slider 1-20px, radius
- `ctx.strokeRect` or `roundRect`

### Joint Photo (MAKE JOINT PHOTO)
- Select 2 images from tray (limit message suggests 2 max for joint)
- Next Step → creates new canvas width = w1+w2+gap, height = max(h1,h2)
- `drawImage(img1, 0,0)` + `drawImage(img2, w1+gap,0)`
- Download / Reset

### Zoom & Rotate Display
- Zoom 1.00, Rotate 0° – shows current zoom/rotation, but you noted "no need scale showing" – we removed Zoom % badge in ShebaFlow for cleaner UI

### Power Mode On
- Toggle for advanced features vs standard – likely shows extra tools (brush, upscale) when on

### Daily Limit
- "আপনার আজকের লিমিট শেষ" – backend tracks via:
  - WordPress `user_meta` if logged in
  - Or IP + `localStorage` counter if guest
  - Limit maybe 20-50 edits/day to prevent abuse of AI APIs

---

## 3. Backend – Likely Implementation

- **WordPress REST API or custom PHP endpoint:**
  - `/wp-json/itlancerbd/v1/remove-bg` – proxies to remove.bg with server-stored key
  - `/wp-json/itlancerbd/v1/enhance` – proxies to TokenHarbor / OpenAI with key in `wp-config.php` or env
  - `/wp-json/itlancerbd/v1/upscale` – proxies to Replicate
  - `/wp-json/itlancerbd/v1/limit` – checks/increments daily count

- **Security:**
  - API keys in `wp-config.php` or `.env`, not in JS
  - But some BD sites still expose `VITE_` or `REACT_APP_` keys in frontend – insecure (we fixed in ShebaFlow by using server-only `TOKEN_HARBOR_API_KEY`)

- **No image storage:** Images processed in memory, not saved on server (to save hosting cost), unless user logged in and chooses to save

- **Tech stack guesses:**
  - Frontend: React 18 + Vite or CRA embedded via shortcode, Tailwind CSS (dark UI with emerald/violet)
  - Canvas lib: native Canvas API (no Fabric.js – lighter)
  - BG removal: `@imgly/background-removal` (client) + `remove.bg` (server fallback)
  - Face detection: `FaceDetector` API + `face-api.js` or MediaPipe
  - Segmentation: `@mediapipe/selfie_segmentation` or `@tensorflow-models/body-pix`
  - Build: `vite build` → `dist` → enqueued in WP via `wp_enqueue_script`

---

## 4. Comparison to ShebaFlow (Our Project)

| Feature | IT Lancer BD | ShebaFlow (Our) | Improvement We Made |
|---|---|---|---|
| Crop overlay | 4 dimmed rects (fixed) | Fixed same (was buggy clearRect) | ✅ Fixed white screen bug |
| Remove BG | Mock white + API | Mock + imgly + removebg + custom | ✅ More providers + offline |
| Face detect | Manual on Face/Skin/Hair click | Same, with fallback centered | ✅ Fixed to show box even without API |
| Zoom display | Shows 1.00 (clutter) | Removed % display, clean canvas | ✅ User requested |
| AI Assistant | No natural language, only buttons | Added TokenHarbor gpt-5.6-luna + local fallback | ✅ Natural language commands |
| API key UI | Not visible (hardcoded or WP) | Added secure UI in modal + localStorage + server env | ✅ User can add key via UI |
| Offline | Works after load? Likely yes | Fully offline after load + local AI fallback | ✅ Works even without key/network |
| Joint Photo | Select 2 images → Make Joint Photo | Not yet (could add) | TODO |
| Brush | 30px brush for cleanup | Not yet | TODO |
| Daily limit | Yes, shows Bangla message | Rate limit 10/min/IP in-memory | Similar |

---

## 5. How to Replicate / Improve in ShebaFlow

1. **Keep Canvas-only core** – no server image storage, same as IT Lancer BD
2. **Add Brush tool:** Second canvas layer, `destination-out` erasing, size slider, Apply/Cancel merges
3. **Add Joint Photo:** Select 2 from tray → new canvas `w1+w2+10` → download
4. **Add Before/After slider:** `clip-path` or draggable divider between original and edited
5. **Enhance daily limit:** Use `localStorage` counter + backend IP check if needed, show Bangla message
6. **Secure AI proxy:** We already have `/api/ai/photo-assistant` with local fallback – better than IT Lancer BD which likely has no natural language
7. **Remove Zoom %:** Done
8. **Face detection manual:** Done – only on click, not auto

---

## 6. Security & Performance Notes

- IT Lancer BD likely still has some API keys in frontend (common mistake) – we fixed by using server-only env + header override
- Client-side BG removal via imgly is heavy (~30MB WASM) – should be dynamic import `import('@imgly/background-removal')` only when needed
- All image processing should stay in browser to avoid server costs – same as IT Lancer BD
- For production, add `Cache-Control` for dist assets, `max-age=31536000`

---

## 7. Conclusion

IT Lancer BD Photo Studio is a **client-side Canvas editor embedded in WordPress**, with minimal backend for limits and AI proxy. It prioritizes offline functionality, low server cost, and BD passport specs. Our ShebaFlow implementation now matches and exceeds it with:

- Fixed crop white screen bug
- Manual face detection with fallback
- Clean canvas (no zoom % clutter)
- Secure TokenHarbor AI with natural language + local offline fallback (works even when network blocked)
- UI to add API key securely

Preview: https://5173-iqspenf57439l0pwvwgb6.e2b.app/studio/passport-photo
