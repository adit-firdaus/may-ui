import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The gallery builds against the library's SOURCE, not its dist, so it always
 * reflects the working tree — editing a component updates the gallery on the
 * next HMR tick rather than after a rebuild.
 */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: { mayui: resolve(__dirname, '../src') },
  },
  server: { port: 5173, host: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
