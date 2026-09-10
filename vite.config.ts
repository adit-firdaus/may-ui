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
      // Three entries: the adaptive default plus the two dedicated families.
      // Consumers importing only `mayui` never pull the desktop DataTable or
      // the mobile gesture code into their bundle.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        desktop: resolve(__dirname, 'src/desktop.ts'),
        mobile: resolve(__dirname, 'src/mobile.ts'),
      },
      name: 'MayUI',
      formats: ['es', 'cjs'],
      // The main entry keeps its historical filename so the design-sync bundle
      // header and any existing imports stay valid.
      fileName: (format, entryName) =>
        entryName === 'index'
          ? format === 'es'
            ? 'mayui.js'
            : 'mayui.cjs'
          : format === 'es'
            ? `${entryName}.js`
            : `${entryName}.cjs`,
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
