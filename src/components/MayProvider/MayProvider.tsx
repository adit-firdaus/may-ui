import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useEffect, useId, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { LinkComponentProvider } from '../../hooks/link'
import { PlatformProvider, type MayPlatform } from '../../hooks/platform'
import {
  MayConfigContext,
  mergeComponentDefaults,
  resolveTokens,
  useMayParentConfig,
  useResolvedMode,
} from '../../config/context'
import type { MayComponentDefaults, MayHostConfig, MayThemeConfig } from '../../config/types'
import { mayTokenCssNames } from '../../styles/tokens.generated'
import { MayStyles, mayFoundationStyle, mayStyleSheet } from '../../styles/runtime'
import type { MayStyledComponent } from '../../styles/runtime'
import { MayHost } from '../MayHost'
import providerCss from './MayProvider.css?inline'

const providerStyle = mayStyleSheet('MayProvider', providerCss)

declare const process: { env?: { NODE_ENV?: string } } | undefined
const isDevelopment = typeof process === 'undefined' || process.env?.NODE_ENV !== 'production'

export interface MayProviderProps {
  children?: ReactNode
  theme?: MayThemeConfig
  components?: MayComponentDefaults
  platform?: MayPlatform
  linkComponent?: ElementType
  host?: false | MayHostConfig
  styleNonce?: string
  className?: string
  /** Fill the parent rather than stretching to the viewport. */
  inline?: boolean
}

const mergeTokens = <T extends object>(parent: T, local: T | undefined): T => {
  if (!local) return parent
  const merged = { ...parent } as Record<string, unknown>
  for (const [name, value] of Object.entries(local)) {
    if (value !== undefined) merged[name] = value
  }
  return merged as T
}

const tokenVariables = (theme: Required<Pick<MayThemeConfig, 'tokens' | 'light' | 'dark'>>) => {
  const variables: Record<string, string | number> = {}
  for (const [mode, tokens] of Object.entries(theme)) {
    const infix = mode === 'tokens' ? '' : `${mode}-`
    for (const [name, value] of Object.entries(tokens)) {
      if (value === undefined) continue
      variables[`--may-user-${infix}${mayTokenCssNames[name as keyof typeof mayTokenCssNames]}`] = value
    }
  }
  return variables
}

const declarations = (
  common: MayThemeConfig['tokens'],
  mode: MayThemeConfig['light'],
) => {
  const names = new Set([...Object.keys(common ?? {}), ...Object.keys(mode ?? {})])
  return [...names]
    .map((name) => {
      const cssName = mayTokenCssNames[name as keyof typeof mayTokenCssNames]
      const modeValue = mode?.[name as keyof typeof mode]
      const commonValue = common?.[name as keyof typeof common]
      if (modeValue !== undefined && commonValue !== undefined) {
        return `--may-${cssName}:var(--may-user-MODE-${cssName},var(--may-user-${cssName}));`
      }
      if (modeValue !== undefined) return `--may-${cssName}:var(--may-user-MODE-${cssName});`
      return `--may-${cssName}:var(--may-user-${cssName});`
    })
    .join('')
}

const tokenRules = (
  scope: string,
  overrides: Required<Pick<MayThemeConfig, 'tokens' | 'light' | 'dark'>>,
) => {
  const light = declarations(overrides.tokens, overrides.light).replace(/MODE/g, 'light')
  const dark = declarations(overrides.tokens, overrides.dark).replace(/MODE/g, 'dark')
  if (!light && !dark) return ''
  const selector = `[data-may-scope="${scope}"]`
  return `@layer may-ui{${selector}{${light}}${selector}[data-may-theme='dark']{${dark}}` +
    `@media(prefers-color-scheme:dark){${selector}:not([data-may-theme='light']){${dark}}}}`
}

/** Optional configuration boundary for May UI. */
export function MayProvider({
  children,
  theme,
  components,
  platform,
  linkComponent,
  host,
  styleNonce,
  className,
  inline = false,
}: MayProviderProps) {
  const parent = useMayParentConfig()
  const depth = (parent?.depth ?? -1) + 1
  const mode = theme?.mode ?? parent?.theme.mode ?? 'system'
  const resolvedMode = useResolvedMode(mode)
  const scope = `may${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const overrides = useMemo(() => Object.freeze({
    tokens: Object.freeze(mergeTokens(parent?.tokenOverrides.tokens ?? {}, theme?.tokens)),
    light: Object.freeze(mergeTokens(parent?.tokenOverrides.light ?? {}, theme?.light)),
    dark: Object.freeze(mergeTokens(parent?.tokenOverrides.dark ?? {}, theme?.dark)),
  }), [parent, theme?.tokens, theme?.light, theme?.dark])

  const effectiveComponents = useMemo(
    () => mergeComponentDefaults(parent?.components ?? {}, components),
    [parent?.components, components],
  )
  const effectiveHost = parent?.host ?? (host === false ? false : host ?? {})
  const effectiveNonce = parent ? parent.styleNonce : styleNonce
  const effectivePlatform = platform ?? parent?.platform ?? 'auto'
  const effectiveLink = linkComponent ?? parent?.linkComponent ?? 'a'

  const value = useMemo(() => Object.freeze({
    depth,
    theme: { mode, resolvedMode },
    tokenOverrides: overrides,
    tokens: resolveTokens(resolvedMode, overrides),
    components: effectiveComponents,
    platform: effectivePlatform,
    linkComponent: effectiveLink,
    host: effectiveHost,
    styleNonce: effectiveNonce,
  }), [
    depth,
    mode,
    resolvedMode,
    overrides,
    effectiveComponents,
    effectivePlatform,
    effectiveLink,
    effectiveHost,
    effectiveNonce,
  ])

  useEffect(() => {
    if (!isDevelopment || !parent) return
    if (host !== undefined) console.warn('MayProvider: host is only read by the outermost provider')
    if (styleNonce !== undefined) console.warn('MayProvider: styleNonce is only read by the outermost provider')
  }, [parent, host, styleNonce])

  const rules = tokenRules(scope, overrides)
  const variables = tokenVariables(overrides) as CSSProperties

  return (
    <MayConfigContext.Provider value={value}>
      <PlatformProvider platform={effectivePlatform}>
        <LinkComponentProvider linkComponent={effectiveLink}>
          <MayStyles sheets={[providerStyle]} />
          {rules && <style nonce={effectiveNonce}>{rules}</style>}
          <div
            data-slot="root"
            data-may-scope={scope}
            className={cx('may-root', inline && 'may-root--inline', className)}
            data-may-theme={mode === 'system' ? undefined : mode}
            style={variables}
          >
            {!parent && effectiveHost !== false && <MayHost {...effectiveHost} />}
            {children}
          </div>
        </LinkComponentProvider>
      </PlatformProvider>
    </MayConfigContext.Provider>
  )
}

Object.defineProperty(MayProvider, '__mayStyles', {
  value: Object.freeze([
    mayFoundationStyle,
    providerStyle,
    ...((MayHost as typeof MayHost & MayStyledComponent).__mayStyles ?? []),
  ]),
})
