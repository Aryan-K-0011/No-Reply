import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite needs this to expose the API_KEY from Vercel to your code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});