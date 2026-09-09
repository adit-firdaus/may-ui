import type { KeyboardEvent, ReactNode } from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Tabs.css'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  baseId: string
  orientation: 'horizontal' | 'vertical'
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`)
  return ctx
}

export interface TabsProps {
  children?: ReactNode
  /** Controlled active tab value. */
  value?: string
  /** Uncontrolled initial tab value. */
  defaultValue?: string
  /** Fires with the newly selected tab value. */
  onValueChange?: (value: string) => void
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** @default 'line' */
  variant?: 'line' | 'pill'
  className?: string
}

/** Tabbed sections. Compose with `TabList`, `Tab` and `TabPanel`. */
export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'line',
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const baseId = useAutoId()
  const current = value ?? internal

  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: current,
      setValue: (next) => {
        if (value === undefined) setInternal(next)
        onValueChange?.(next)
      },
      baseId,
      orientation,
    }),
    [current, value, onValueChange, baseId, orientation],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div
        className={cx('may-tabs', `may-tabs--${orientation}`, `may-tabs--${variant}`, className)}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabListProps {
  children?: ReactNode
  /** Names the tab list for assistive tech. */
  'aria-label'?: string
  className?: string
}

/** The row of tab triggers. Handles arrow-key roving focus. */
export function TabList({ children, className, ...rest }: TabListProps) {
  const { orientation } = useTabs('TabList')
  const ref = useRef<HTMLDivElement>(null)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    if (!['Home', 'End', nextKey, prevKey].includes(event.key)) return

    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    )
    if (tabs.length === 0) return

    const index = tabs.indexOf(document.activeElement as HTMLButtonElement)
    let next = index
    if (event.key === nextKey) next = (index + 1) % tabs.length
    else if (event.key === prevKey) next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1

    event.preventDefault()
    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cx('may-tabs__list', className)}
    >
      {children}
    </div>
  )
}

export interface TabProps {
  children?: ReactNode
  /** Identifies this tab; matches its `TabPanel`. */
  value: string
  disabled?: boolean
  /** Icon before the label. */
  icon?: ReactNode
  /** Trailing content such as a count `<Badge>`. */
  badge?: ReactNode
  className?: string
}

/** One tab trigger. */
export function Tab({ children, value, disabled = false, icon, badge, className }: TabProps) {
  const ctx = useTabs('Tab')
  const selected = ctx.value === value

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      className={cx('may-tabs__tab', selected && 'may-tabs__tab--selected', className)}
    >
      {icon && (
        <span className="may-tabs__icon" aria-hidden>
          {icon}
        </span>
      )}
      {children}
      {badge}
    </button>
  )
}

export interface TabPanelProps {
  children?: ReactNode
  /** Matches the `value` of its `Tab`. */
  value: string
  /** Keep the panel mounted while hidden. @default false */
  keepMounted?: boolean
  className?: string
}

/** The content for one tab. */
export function TabPanel({ children, value, keepMounted = false, className }: TabPanelProps) {
  const ctx = useTabs('TabPanel')
  const selected = ctx.value === value
  if (!selected && !keepMounted) return null

  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cx('may-tabs__panel', className)}
    >
      {children}
    </div>
  )
}
