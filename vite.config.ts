import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// Multi-page build: each nav item is a real HTML file (/, /research.html,
// /publications.html, /teaching.html) so every page has its own URL and SEO <head>.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        research: resolve(__dirname, 'research.html'),
        publications: resolve(__dirname, 'publications.html'),
        teaching: resolve(__dirname, 'teaching.html'),
      },
    },
  },
});
