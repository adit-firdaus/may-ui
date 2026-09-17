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
      // Runtime packages stay external so consumers resolve one shared copy;
      // their bundler can tree-shake the icons and Motion features they use.
      external: [/^react$/, 'react-dom', 'react/jsx-runtime', /^react-icons/, /^motion(?:\/|$)/],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        /*
         * One output file per input module.
         *
         * Rollup's default grouping put Button in the same chunk as every form
         * control and the toast host, so a consumer importing only Button paid
         * for all of them — their CSS strings included — no matter how well
         * annotated the barrels were.
         *
         * Grouping by component directory instead was worse: IconButton
         * borrows Button's sheet, so hand-drawn chunk boundaries produced a
         * chunk that referenced Button before initialising it. Mirroring the
         * source tree invents no boundaries at all, which is the only version
         * with no cycle to get wrong. A library's output is re-bundled by the
         * consumer, so the file count costs them nothing.
         */
        preserveModules: true,
      },
    },
    sourcemap: true,
  },
})
