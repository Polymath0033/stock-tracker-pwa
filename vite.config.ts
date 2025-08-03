import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Stock Tracker PWA',
        short_name: 'StockTracker',
        description: 'Real-time stock price tracking Progressive Web App',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './pwa.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.alphavantage\.co\/query.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
                headers: {
                  'X-From-Cache': 'yes'
                }
              }
            }
          }
        ]
      },
    })
  ]
})
