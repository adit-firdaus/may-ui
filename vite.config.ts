import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

/**
 * Ship the stylesheet inside a cascade layer.
 *
 * Unlayered rules beat every layered rule, whatever their specificity. Tailwind
 * v4 puts utilities in `@layer utilities`, so an unlayered May UI won every
 * collision on its own components — a consumer's `<Skeleton className="h-7" />`
 * measured 44px instead of 28px, because `.may-skeleton`'s height outranked
 * `.h-7`. That is backwards: a utility at the call site is the more specific
 * intent. Inside a layer, a consumer's unlayered CSS and any later layer both
 * win, which is what people expect.
 *
 * Applied to the emitted asset rather than the source because component CSS is
 * imported from each `.tsx`, so there is no single authored file to wrap.
 */
function cssLayer(name: string) {
  return {
    name: 'may-css-layer',
    enforce: 'post' as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; source?: string | Uint8Array }>) {
      for (const [fileName, file] of Object.entries(bundle)) {
        if (file.type !== 'asset' || !fileName.endsWith('.css')) continue
        const text = typeof file.source === 'string' ? file.source : new TextDecoder().decode(file.source)
        if (!text.trim() || text.startsWith('@layer')) continue
        file.source = `@layer ${name}{${text}}`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['src/**/*.stories.tsx'], rollupTypes: true }),
    cssLayer('may-ui'),
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
