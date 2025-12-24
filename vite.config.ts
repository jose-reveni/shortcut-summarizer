import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/shortcut-summarizer/',
    plugins: [
      react(),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/shortcut': {
          target: 'https://api.app.shortcut.com/api/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shortcut/, ''),
        },
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ""),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ""),
      'process.env.SHORTCUT_TOKEN': JSON.stringify(env.SHORTCUT_TOKEN || env.VITE_SHORTCUT_TOKEN || "")
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e'],
    },
  };
});
