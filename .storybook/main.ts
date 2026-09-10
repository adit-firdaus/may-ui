import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  /*
   * Storybook runs a host check of its own, ahead of Vite's and reading from a
   * different place: this one. Without it the catalogue answers on the tailnet
   * IP but returns "Invalid host" to the machine's own MagicDNS name, which is
   * the address anyone would actually type.
   */
  core: { allowedHosts: ['.ts.net'] },
  /*
   * Storybook serves through Vite, and Vite rejects requests whose Host header
   * it does not know. Naming the tailnet domain is what lets the catalogue be
   * opened from another device on the tailnet rather than only from localhost;
   * the leading dot covers every machine under it.
   */
  viteFinal: async (config, { configType }) => ({
    ...config,
    /*
     * Deployed to GitHub Pages under the repo path, beside the examples gallery
     * at the site root. Only the production build takes the sub-path; dev stays
     * at '/'.
     *
     * `STORYBOOK_BASE` overrides it because a production build is not always a
     * Pages build: design-sync builds this storybook into a LOCAL reference
     * directory and loads it off the filesystem, where an absolute
     * `/may-ui/storybook/` asset URL resolves to nothing — the story JS never
     * loads and every story renders empty, which reads as a broken design
     * system rather than a broken path. That sync passes `STORYBOOK_BASE=./`.
     * Unset, behaviour is exactly as before, so the Pages workflow is untouched.
     */
    base:
      configType === 'PRODUCTION'
        ? (process.env.STORYBOOK_BASE ?? '/may-ui/storybook/')
        : config.base,
    /*
     * Storybook inherits the root vite.config, which carries vite-plugin-dts for
     * the LIBRARY build. Storybook needs no type declarations, and the plugin's
     * `rollupTypes` step writes a temporary api-extractor.json that breaks the
     * build in CI. Drop it here — it has no business running for a preview.
     */
    plugins: (config.plugins ?? []).filter(
      (plugin) =>
        !(
          plugin &&
          typeof plugin === 'object' &&
          'name' in plugin &&
          String((plugin as { name?: unknown }).name).includes('dts')
        ),
    ),
    server: {
      ...config.server,
      allowedHosts: [...((config.server?.allowedHosts as string[]) ?? []), '.ts.net'],
    },
  }),
}

export default config
