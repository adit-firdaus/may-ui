import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { PlatformProvider, type MayPlatform } from '../../hooks/platform'
import '../../styles/index.css'
import './MayProvider.css'

export type MayTheme = 'light' | 'dark' | 'system'

export interface MayProviderProps {
  children?: ReactNode
  /** `'system'` (default) follows the OS setting. */
  theme?: MayTheme
  /**
   * Accent colour. Defaults to Apple's systemBlue. Overriding this re-points
   * both the tint (brand as text) and the primary fill.
   */
  accent?: string
  className?: string
  /** Fill the parent rather than stretching to the viewport. */
  inline?: boolean
  /**
   * Pin what the adaptive components consider the platform, instead of
   * measuring the viewport. Useful inside a simulated device or a preview
   * pane, where the window's width says nothing about the shape being shown.
   * @default 'auto'
   */
  platform?: MayPlatform
}

interface MayContextValue {
  theme: MayTheme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: MayTheme) => void
}

const MayContext = createContext<MayContextValue | null>(null)

/** Read and set the current theme. Must be called inside `<MayProvider>`. */
export function useMayTheme(): MayContextValue {
  const ctx = useContext(MayContext)
  if (!ctx) throw new Error('useMayTheme must be used inside <MayProvider>')
  return ctx
}

const prefersDark = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

/**
 * Root of every May UI tree. Supplies the design tokens, the base layer and
 * theme state. Components render unstyled without it.
 */
export function MayProvider({
  children,
  theme = 'system',
  accent,
  className,
  inline = false,
  platform = 'auto',
}: MayProviderProps) {
  const [current, setCurrent] = useState<MayTheme>(theme)
  const [systemDark, setSystemDark] = useState(prefersDark)

  useEffect(() => setCurrent(theme), [theme])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const value = useMemo<MayContextValue>(() => {
    const resolved = current === 'system' ? (systemDark ? 'dark' : 'light') : current
    return { theme: current, resolvedTheme: resolved, setTheme: setCurrent }
  }, [current, systemDark])

  return (
    <MayContext.Provider value={value}>
      <PlatformProvider platform={platform}>
      <div
        data-slot="root"
        className={cx('may-root', inline && 'may-root--inline', className)}
        data-may-theme={current === 'system' ? undefined : current}
        style={
          accent
            ? ({ '--may-color-tint': accent, '--may-color-primary': accent } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
      </PlatformProvider>
    </MayContext.Provider>
  )
}
