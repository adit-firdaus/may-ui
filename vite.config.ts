import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['src/**/*.stories.tsx'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MayUI',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'mayui.js' : 'mayui.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'mayui.css',
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
