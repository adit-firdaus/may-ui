import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import { mayDarkTokens, mayLightTokens } from '../styles/tokens.generated'
import type {
  MayComponentDefaults,
  MayConfigValue,
  MayThemeConfig,
  MayThemeMode,
  MayTokens,
} from './types'

export interface MayConfigState extends MayConfigValue {
  readonly depth: number
  readonly tokenOverrides: Readonly<Required<Pick<MayThemeConfig, 'tokens' | 'light' | 'dark'>>>
}

export const MayConfigContext = createContext<MayConfigState | null>(null)

const subscribe = (notify: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

const clientSnapshot = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches

const serverSnapshot = () => false

export function useSystemDark(): boolean {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
}

export function useResolvedMode(mode: MayThemeMode): 'light' | 'dark' {
  const systemDark = useSystemDark()
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
}

export function mergeComponentDefaults(
  parent: Readonly<MayComponentDefaults>,
  local: MayComponentDefaults | undefined,
): MayComponentDefaults {
  if (!local) return Object.isFrozen(parent) ? parent : Object.freeze({ ...parent })
  const merged: Record<string, unknown> = { ...parent }
  for (const [name, defaults] of Object.entries(local)) {
    const next: Record<string, unknown> = {
      ...(parent[name as keyof MayComponentDefaults] ?? {}),
    }
    for (const [key, value] of Object.entries(defaults ?? {})) {
      if (value !== undefined) next[key] = value
    }
    merged[name] = Object.freeze(next)
  }
  return Object.freeze(merged) as MayComponentDefaults
}

export function resolveTokens(
  mode: 'light' | 'dark',
  overrides: MayConfigState['tokenOverrides'],
): Readonly<MayTokens> {
  return Object.freeze({
    ...(mode === 'dark' ? mayDarkTokens : mayLightTokens),
    ...overrides.tokens,
    ...overrides[mode],
  })
}

const emptyOverrides = Object.freeze({
  tokens: Object.freeze({}),
  light: Object.freeze({}),
  dark: Object.freeze({}),
})

export function useMayParentConfig(): MayConfigState | null {
  return useContext(MayConfigContext)
}

export function useMayConfig(): Readonly<MayConfigValue> {
  const context = useContext(MayConfigContext)
  const resolvedMode = useResolvedMode(context?.theme.mode ?? 'system')
  return useMemo(() => {
    if (context) return context
    return {
      theme: { mode: 'system' as const, resolvedMode },
      tokens: resolveTokens(resolvedMode, emptyOverrides),
      components: Object.freeze({}),
      platform: 'auto' as const,
      linkComponent: 'a' as const,
      host: false as const,
    }
  }, [context, resolvedMode])
}

export function useMayTheme(): Readonly<MayConfigValue['theme']> {
  return useMayConfig().theme
}

export function useMayTokens(): Readonly<MayTokens> {
  return useMayConfig().tokens
}

export function useMayComponentDefaults(name: string): Readonly<Record<string, unknown>> {
  const context = useContext(MayConfigContext)
  return (context?.components[name as keyof MayComponentDefaults] ?? {}) as Readonly<
    Record<string, unknown>
  >
}

export function useMayStyleNonce(): string | undefined {
  return useContext(MayConfigContext)?.styleNonce
}
