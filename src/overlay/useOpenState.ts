import { useCallback, useState } from 'react'

export interface OpenStateOptions {
  /** Controlled state. When passed, the component never manages its own. */
  open?: boolean
  /** Starting state when uncontrolled. @default false */
  defaultOpen?: boolean
  /** Fires on every change, controlled or not. */
  onOpenChange?: (open: boolean) => void
}

export interface OpenState {
  open: boolean
  setOpen: (next: boolean) => void
  /** True when the caller owns the state. Overlays use this to decide nothing. */
  controlled: boolean
}

/**
 * One open/closed state that works either way round.
 *
 * Every overlay in the package used to demand `open` and a close handler, so
 * opening a dialog cost the consumer a `useState` and two callbacks before they
 * could write any content. Popover, Menu, Collapsible and Sidebar already took
 * `defaultOpen` and managed themselves; the modal surfaces did not, which meant
 * one library with two contracts.
 *
 * Passing `open` still wins, so every existing controlled call site behaves
 * exactly as before. `onOpenChange` fires in both modes, because a caller who
 * lets the component own the state often still wants to know.
 */
export function useOpenState({
  open,
  defaultOpen = false,
  onOpenChange,
}: OpenStateOptions): OpenState {
  const [internal, setInternal] = useState(defaultOpen)
  const controlled = open !== undefined

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternal(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  return { open: controlled ? open : internal, setOpen, controlled }
}
