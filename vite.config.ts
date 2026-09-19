import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function aiApiPlugin(): Plugin {
  return {
    name: 'shebaflow-ai-api',
    configureServer(server) {
      // Middleware for /api/ai/*
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        
        // Only handle /api/ai/
        if (!url.startsWith('/api/ai/')) {
          return next()
        }

        // Enable CORS for API
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-TokenHarbor-Key, X-Api-Key')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        // Parse body for POST
        let body: any = {}
        if (req.method === 'POST') {
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(chunk as Buffer)
              // Limit body size 1MB
              if (Buffer.concat(chunks).length > 1_000_000) {
                res.statusCode = 413
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Request body too large', code: 'BODY_TOO_LARGE' }))
                return
              }
            }
            const raw = Buffer.concat(chunks).toString('utf-8')
            if (raw) {
              try {
                body = JSON.parse(raw)
              } catch {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON body', code: 'INVALID_JSON' }))
                return
              }
            }
          } catch (err: any) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: 'Failed to read body', code: 'BODY_READ_ERROR' }))
            return
          }
        }

        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown'

        try {
          // Dynamic import to avoid loading in build
          const { handlePhotoAssistant, handleAiStatus } = await import('./server/routes/photoAssistant.ts')

          if (url.startsWith('/api/ai/photo-assistant') && req.method === 'POST') {
            await handlePhotoAssistant({ req, res, body, ip })
            return
          }

          if (url.startsWith('/api/ai/status') && req.method === 'GET') {
            await handleAiStatus(req, res)
            return
          }

          // Unknown AI endpoint
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'AI endpoint not found', code: 'NOT_FOUND' }))
        } catch (err: any) {
          console.error('[AI API Plugin] Error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { clientPort: 443 },
    cors: true,
    // @ts-ignore - allow all hosts for preview environment
    allowedHosts: true as any,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal']
  },
  build: {
    rollupOptions: {
      external: (id) => id.includes('@imgly/background-removal')
    }
  }
})
