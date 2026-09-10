import { createContext, createElement, useContext } from 'react'
import type { ReactNode } from 'react'

export type MayPlatform = 'auto' | 'phone' | 'desktop'

/**
 * Overrides what `useIsDesktop` reports for a subtree.
 *
 * Every adaptive component asks `useIsDesktop`, which measures the real
 * viewport. That is right for an app and wrong for anything rendered inside a
 * simulated one: a phone mock-up on a 1440px monitor would get `Sheet` as a
 * centred dialog, `ActionSheet` as an anchored menu and `Table` as a real
 * table — the desktop half of every adaptive component, inside a phone.
 *
 * `'auto'` (the default) keeps the media query. `'phone'` and `'desktop'` pin
 * the answer, which is what a device frame, a responsive preview pane, or a
 * test that needs a deterministic shape actually wants.
 */
export const PlatformContext = createContext<MayPlatform>('auto')

export function usePlatform(): MayPlatform {
  return useContext(PlatformContext)
}

export interface PlatformProviderProps {
  platform: MayPlatform
  children?: ReactNode
}

/**
 * Pin the platform for a subtree without introducing another themed root.
 * Written with `createElement` so this stays a `.ts` file alongside the other
 * hooks rather than becoming the only `.tsx` among them.
 */
export function PlatformProvider({ platform, children }: PlatformProviderProps) {
  return createElement(PlatformContext.Provider, { value: platform }, children)
}
