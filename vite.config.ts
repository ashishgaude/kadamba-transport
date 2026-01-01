import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'gtfs/*.txt'], // Cache GTFS data for offline use
      manifest: {
        name: 'Kadamba Transport Visualizer',
        short_name: 'Kadamba Bus',
        description: 'Interactive map and schedule browser for Goa\'s state bus network.',
        theme_color: '#2563eb', // Matches the blue brand color
        background_color: '#f8fafc', // Matches slate-50 background
        display: 'standalone', // Removes browser UI
        orientation: 'any',
        start_url: './',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Increase maximum file size to cache (for GTFS files like fare_rules.txt which is ~27MB)
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,txt}']
      }
    })
  ],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  }
})
