import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import '../../styles/index.css'
import './MayProvider.css'

export type MayTheme = 'light' | 'dark' | 'system'

export interface MayProviderProps {
  /** Content rendered inside the themed root. */
  children?: ReactNode
  /**
   * Which theme to apply. `'system'` (default) follows the OS setting.
   * @default 'system'
   */
  theme?: MayTheme
  /** Extra class names on the root element. */
  className?: string
  /**
   * Render the root as a plain `<div>` that fills its parent instead of
   * stretching to the viewport height.
   * @default false
   */
  inline?: boolean
}

interface MayThemeContextValue {
  theme: MayTheme
  /** The theme actually in effect once `'system'` is resolved. */
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: MayTheme) => void
}

const MayThemeContext = createContext<MayThemeContextValue | null>(null)

/** Read the current theme. Must be called inside a `<MayProvider>`. */
export function useMayTheme(): MayThemeContextValue {
  const ctx = useContext(MayThemeContext)
  if (!ctx) throw new Error('useMayTheme must be used inside <MayProvider>')
  return ctx
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Root of every May UI tree. Supplies design tokens, the base typography
 * layer and theme state. Components render unstyled without it.
 */
export function MayProvider({
  children,
  theme = 'system',
  className,
  inline = false,
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

  const value = useMemo<MayThemeContextValue>(() => {
    const resolved = current === 'system' ? (systemDark ? 'dark' : 'light') : current
    return { theme: current, resolvedTheme: resolved, setTheme: setCurrent }
  }, [current, systemDark])

  return (
    <MayThemeContext.Provider value={value}>
      <div
        className={cx('may-root', inline && 'may-root--inline', className)}
        data-may-theme={current === 'system' ? undefined : current}
      >
        {children}
      </div>
    </MayThemeContext.Provider>
  )
}
