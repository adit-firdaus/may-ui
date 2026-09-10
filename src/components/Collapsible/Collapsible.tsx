import type { HTMLAttributes, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useAutoId } from '../../utils/useId'
import './Collapsible.css'

export interface CollapsibleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  /** Controlled open state. Leave undefined to let the component own it. */
  open?: boolean
  /** Uncontrolled initial state. @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The always-visible row that toggles the panel. */
  trigger: ReactNode
  /** The panel contents. */
  children?: ReactNode
  /** Trailing disclosure chevron, rotating on the same curve as the panel. @default true */
  chevron?: boolean
  disabled?: boolean
  /** Escape hatches for components built on this primitive (see `Accordion`). */
  triggerClassName?: string
  panelClassName?: string
}

/**
 * The disclosure primitive.
 *
 * The panel animates its HEIGHT via `grid-template-rows: 0fr → 1fr` rather
 * than an animated `max-height`, because a guessed max-height either clips
 * long content or spends the tail of the transition animating empty space —
 * and measuring `scrollHeight` costs a forced layout on every toggle. The
 * grid track resolves to the content's real height, for free, at any length.
 *
 * Closed content stays mounted (so the height has something to animate to) but
 * is made `visibility: hidden` once the collapse finishes, which is what takes
 * it out of the tab order and the accessibility tree — `overflow: hidden`
 * alone would leave focusable children reachable behind a zero-height box.
 */
export function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  children,
  chevron = true,
  disabled = false,
  className,
  triggerClassName,
  panelClassName,
  id,
  ...rest
}: CollapsibleProps) {
  const [internal, setInternal] = useState(defaultOpen)
  const isOpen = open ?? internal
  const autoId = useAutoId(id)
  const panelId = `${autoId}-panel`
  const triggerId = `${autoId}-trigger`
  const { pressProps } = usePressFeedback(disabled)

  const toggle = useCallback(() => {
    if (disabled) return
    const next = !isOpen
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }, [disabled, isOpen, open, onOpenChange])

  return (
    <div
      {...rest}
      id={autoId}
      data-slot="collapsible"
      data-state={isOpen ? 'open' : 'closed'}
      className={cx('may-collapsible', className)}
    >
      <button
        {...pressProps}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        data-slot="collapsible-trigger"
        /* `may-pressable` is deliberately absent, exactly as it is on ListRow:
         * a row highlights on press, it does not scale. usePressFeedback still
         * drives the press — through data-pressed, which CSS turns into the
         * highlight. */
        className={cx('may-collapsible__trigger', 'may-hoverable', triggerClassName)}
      >
        <span className="may-collapsible__label">{trigger}</span>
        {chevron && (
          <svg
            className="may-collapsible__chevron"
            viewBox="0 0 16 16"
            aria-hidden
            focusable="false"
          >
            <path
              d="M6 3.5L10.5 8L6 12.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-slot="collapsible-panel"
        className={cx('may-collapsible__panel', panelClassName)}
      >
        {/* The clipping child the grid track squeezes. Content keeps its own
         * height, so nothing reflows while the track animates. */}
        <div className="may-collapsible__clip">
          <div className="may-collapsible__content" data-slot="content">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
