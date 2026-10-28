import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Figtion - Motion Graphics & Animation Lab',
        short_name: 'Figtion',
        description: 'Figma-style browser-based motion design and animation studio',
        theme_color: '#0c0c0e',
        background_color: '#0c0c0e',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // the editor is a 4 MB page loaded in an iframe: always fetch it fresh, never precache it or answer it with index.html
        globIgnores: ['legacy-editor.html'],
        navigateFallbackDenylist: [/^\/legacy-editor/]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
