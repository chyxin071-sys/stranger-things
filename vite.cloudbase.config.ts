import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
});
