import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spa-404-fallback',
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, 'dist');
          const indexHtml = path.join(distDir, 'index.html');
          const notFoundHtml = path.join(distDir, '404.html');
          if (fs.existsSync(indexHtml)) {
            fs.copyFileSync(indexHtml, notFoundHtml);
            const verifyDir = path.join(distDir, 'payment', 'verify');
            fs.mkdirSync(verifyDir, { recursive: true });
            fs.copyFileSync(indexHtml, path.join(verifyDir, 'index.html'));
          }
        } catch (err) {
          console.warn('Could not generate 404/verify fallback:', err);
        }
      },
    },
  ],
  server: {
    port: 5176,
    host: true,
  },
});
