import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';

// Transform .js files in src that contain JSX so Rollup can parse them (Vite only treats .jsx as JSX by default).
function jsxInJsPlugin() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    load(id) {
      if (!id.includes('/src/') || !id.endsWith('.js')) return null;
      try {
        const code = readFileSync(id, 'utf-8');
        if (!code.includes('<') && !code.includes('>')) return null;
        const out = transformSync(code, { loader: 'jsx', jsx: 'automatic', format: 'esm', target: 'es2020' });
        return { code: out.code, map: out.map };
      } catch {
        return null;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    jsxInJsPlugin(),
    react({ include: /\.(jsx|js|tsx|ts)?$/ }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    minify: 'esbuild',
    target: 'es2020',
  },
  publicDir: 'public',
});








