import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // `vercel dev` serves the /api functions on 3000; plain `npm run dev`
      // forwards to it so the Stripe flow works in local development.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Markdown study material is bundled as raw strings (see src/data/knowledgebase).
  assetsInclude: ['**/*.md'],
});
