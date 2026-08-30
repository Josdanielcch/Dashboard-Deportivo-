import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
     server: {
      port: 4000, // <-- Define aquí tu puerto local preferido
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/index.css',
          './src/components/Header.tsx',
          './src/components/Hero.tsx',
          './src/components/FeaturedSports.tsx',
          './src/components/CourtCard.tsx',
          './src/components/Footer.tsx',
        ],
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom/client', 'lucide-react', 'socket.io-client', 'motion', '@react-oauth/google'],
    },
  };
});
