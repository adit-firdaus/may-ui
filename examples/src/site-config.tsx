import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mayTokenCssNames } from '../../src/styles/tokens.generated'
import configSchema from './generated/config-schema.json'
import type { SiteProviderConfig } from './site-types'
import {
  encodeState,
  resolveInitialState,
  stableStringify,
  validateSiteConfig,
} from './lib/config-codec.mjs'

const STORAGE_KEY = 'may-ui-site-config:v1'
export const DEFAULT_SITE_CONFIG: SiteProviderConfig = { theme: { mode: 'system' } }
const componentSchema = Object.fromEntries(Object.entries(configSchema).map(([name, controls]) => [
  name,
  Object.fromEntries(controls.map((control) => [
    control.prop,
    { type: control.kind === 'enum' ? 'string' : control.kind },
  ])),
]))
const schema = { tokens: new Set(Object.keys(mayTokenCssNames)), components: componentSchema }

export function validateConfig(value: unknown) {
  return validateSiteConfig(value, schema)
}

interface SiteConfigContextValue {
  config: SiteProviderConfig
  dirty: boolean
  setConfig: (config: SiteProviderConfig) => void
  patchConfig: (patch: Partial<SiteProviderConfig>) => void
  reset: () => void
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null)

const initialConfig = () => {
  const linked = new URLSearchParams(window.location.search).get('config') ?? ''
  const stored = window.localStorage.getItem(STORAGE_KEY) ?? ''
  return resolveInitialState(linked, stored, DEFAULT_SITE_CONFIG, (value: unknown) => validateConfig(value).ok)
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteProviderConfig>(initialConfig)
  const dirty = stableStringify(config) !== stableStringify(DEFAULT_SITE_CONFIG)

  useEffect(() => {
    if (dirty) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    else window.localStorage.removeItem(STORAGE_KEY)
    const search = new URLSearchParams(window.location.search)
    if (dirty) search.set('config', encodeState(config))
    else search.delete('config')
    const query = search.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
    window.dispatchEvent(new Event('may-site:navigate'))
  }, [config, dirty])

  const value = useMemo<SiteConfigContextValue>(() => ({
    config,
    dirty,
    setConfig,
    patchConfig: (patch) => setConfig((current) => ({ ...current, ...patch })),
    reset: () => {
      setConfig(DEFAULT_SITE_CONFIG)
      window.localStorage.removeItem(STORAGE_KEY)
      const search = new URLSearchParams(window.location.search)
      search.delete('config')
      search.delete('props')
      const query = search.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
      window.dispatchEvent(new Event('may-site:reset'))
    },
  }), [config, dirty])

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  const value = useContext(SiteConfigContext)
  if (!value) throw new Error('useSiteConfig must be used inside SiteConfigProvider')
  return value
}
