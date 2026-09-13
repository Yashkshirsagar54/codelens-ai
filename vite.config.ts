import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './db'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          codemirror: [
            '@uiw/react-codemirror',
            '@codemirror/theme-one-dark',
            '@codemirror/lang-javascript',
            '@codemirror/lang-python',
            '@codemirror/lang-java',
            '@codemirror/lang-cpp',
            '@codemirror/lang-html',
            '@codemirror/lang-css',
            '@codemirror/lang-json',
          ],
          icons: ['lucide-react'],
          motion: ['framer-motion', 'motion'],
          jspdf: ['jspdf'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
