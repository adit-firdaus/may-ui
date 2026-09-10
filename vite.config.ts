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
      // Four entries: the adaptive default, the two dedicated families, and the
      // example screens. Consumers importing only `mayui` never pull the desktop
      // DataTable, the mobile gesture code, or a demo screen into their bundle.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        desktop: resolve(__dirname, 'src/desktop.ts'),
        mobile: resolve(__dirname, 'src/mobile.ts'),
        // The example screens. A fourth entry rather than part of the main one,
        // so importing 'mayui' never pulls a demo screen into a consumer's bundle.
        examples: resolve(__dirname, 'src/examples/index.ts'),
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
      // react-icons is external so the consumer's bundler tree-shakes it per
      // icon against their own copy. Inlining it would ship every glyph we use
      // AND duplicate whatever they already import.
      external: [/^react$/, 'react-dom', 'react/jsx-runtime', /^react-icons/],
      output: {
        assetFileNames: 'mayui.css',
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
