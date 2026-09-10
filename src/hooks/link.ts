import { createContext, createElement, useContext } from 'react'
import type { ElementType, ReactNode } from 'react'

/**
 * The component every navigational surface renders an `href` with.
 *
 * A plain `<a>` inside a TanStack Router / React Router / Next app is a full
 * page reload, so a tab tap or a breadcrumb click stops the SPA being one.
 * That was the single reason a real migration could not adopt `mobile/TabBar`
 * and kept a hand-written bar instead.
 *
 * Set once on the provider and every component that renders a link picks it
 * up, rather than threading a render prop through each item. Defaults to `'a'`,
 * so nothing changes until a consumer opts in.
 */
export const LinkComponentContext = createContext<ElementType>('a')

/** The element to render an `href` with — the provider's, or `'a'`. */
export function useLinkComponent(): ElementType {
  return useContext(LinkComponentContext)
}

export interface LinkComponentProviderProps {
  linkComponent: ElementType
  children?: ReactNode
}

/**
 * Pin the link element for a subtree. Written with `createElement` so this
 * stays a `.ts` file alongside the other hooks.
 */
export function LinkComponentProvider({ linkComponent, children }: LinkComponentProviderProps) {
  return createElement(LinkComponentContext.Provider, { value: linkComponent }, children)
}
