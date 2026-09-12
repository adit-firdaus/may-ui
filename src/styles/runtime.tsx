import { createElement, Fragment } from 'react'
import type { ElementType } from 'react'
import { useMayComponentDefaults, useMayStyleNonce } from '../config/context'
import foundationTokens from './tokens.css?inline'
import foundationMotion from './motion.css?inline'
import foundationBase from './base.css?inline'

export interface MayStyleSheet {
  readonly href: string
  readonly css: string
  readonly precedence: 'may-ui-foundation' | 'may-ui-components'
}

export interface MayStyledComponent {
  readonly __mayStyles?: readonly MayStyleSheet[]
}

const hash = (source: string) => {
  let value = 5381
  for (let i = 0; i < source.length; i++) value = (value * 33) ^ source.charCodeAt(i)
  return (value >>> 0).toString(36)
}

export function mayStyleSheet(
  name: string,
  css: string,
  precedence: MayStyleSheet['precedence'] = 'may-ui-components',
): MayStyleSheet {
  const layered = `@layer may-ui{${css}}`
  return Object.freeze({ href: `may-ui:${name}:${hash(layered)}`, css: layered, precedence })
}

export const mayFoundationStyle = mayStyleSheet(
  'foundation',
  `${foundationTokens}\n${foundationMotion}\n${foundationBase}`,
  'may-ui-foundation',
)

export function MayStyles({ sheets = [] }: { sheets?: readonly MayStyleSheet[] }) {
  const nonce = useMayStyleNonce()
  return (
    <>
      {[mayFoundationStyle, ...sheets].map((sheet) => (
        <style
          key={sheet.href}
          href={sheet.href}
          precedence={sheet.precedence}
          nonce={nonce}
        >
          {sheet.css}
        </style>
      ))}
    </>
  )
}

const mergeDefined = (
  defaults: Readonly<Record<string, unknown>>,
  props: Readonly<Record<string, unknown>>,
) => {
  const merged = { ...defaults }
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) merged[key] = value
  }
  return merged
}

export function withMayStyles<T>(
  name: string,
  Component: T,
  sheets: readonly MayStyleSheet[],
): T {
  function MayStyledComponent(props: Record<string, unknown>) {
    const defaults = useMayComponentDefaults(name)
    return createElement(
      Fragment,
      {},
      createElement(MayStyles, { sheets }),
      createElement(Component as ElementType, mergeDefined(defaults, props)),
    )
  }
  MayStyledComponent.displayName = `MayStyled(${name})`
  Object.defineProperty(MayStyledComponent, '__mayStyles', {
    value: Object.freeze([mayFoundationStyle, ...sheets]),
  })
  return MayStyledComponent as unknown as T
}
