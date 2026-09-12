import { copyFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The gallery builds against the library's SOURCE, not its dist, so it always
 * reflects the working tree — editing a component updates the gallery on the
 * next HMR tick rather than after a rebuild.
 */
/*
 * The version the gallery is built from, read from the library's own
 * package.json so the deployed site can never claim a version it is not.
 */
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf8'),
) as { version: string }

export default defineConfig(({ command }) => ({
  define: { __MAY_VERSION__: JSON.stringify(version) },
  root: __dirname,
  // The unified site is deployed to GitHub Pages under the repo path. Only the
  // production build takes the sub-path; the dev server stays at '/'.
  base: command === 'build' ? '/may-ui/' : '/',
  plugins: [
    react(),
    {
      name: 'may-site-clean-route-fallback',
      closeBundle() {
        if (command === 'build') {
          copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'))
        }
      },
    },
  ],
  resolve: {
    alias: { '@adit_firdaus/may-ui': resolve(__dirname, '../src') },
  },
  server: {
    port: 5173,
    /*
     * Every interface, so localhost and the tailnet address both answer. A
     * server binds one address, so narrowing this to the tailnet IP would take
     * localhost away — which costs more day to day than the LAN exposure it
     * buys.
     */
    host: true,
    /*
     * Vite refuses requests whose Host header it does not recognise, so the
     * tailnet domain has to be named too: a leading dot allows the domain and
     * every device under it, which keeps this working on someone else's tailnet
     * without hardcoding one machine's name.
     */
    allowedHosts: ['.ts.net'],
  },
  build: { outDir: 'dist', emptyOutDir: true, manifest: true },
}))
