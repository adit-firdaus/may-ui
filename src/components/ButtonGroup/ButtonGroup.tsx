import type { HTMLAttributes, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useContainerWidth } from '../../hooks/useContainerWidth'
import { rowWidth } from '../../utils/rowWidth'
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect'

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Join the children into one cluster with a shared outer radius. Turn it off
   * for a plain row of separate buttons with a normal gap.
   * @default true
   */
  attached?: boolean
  /**
   * Left off, an ATTACHED group turns vertical when its children no longer fit
   * across — the stacked shape the CSS already draws, rounded at both ends
   * with hairline seams between. Wrapping is not the answer for one: the
   * middle child would end a visual row square at both corners and the cluster
   * would read as broken pieces. An unattached group simply wraps, and is
   * unaffected by this.
   *
   * Pass a value to fix the axis either way.
   * @default 'horizontal' until the children stop fitting
   */
  orientation?: 'horizontal' | 'vertical'
  /** Children divide the group's width (or its width, when vertical) equally. */
  fullWidth?: boolean
}

/**
 * A cluster of related actions.
 *
 * Attached children are separated by a hairline-wide **gap**, not a stroke —
 * the surface behind the group shows through it, exactly the way an iOS alert
 * divides its actions. That keeps the divider correct on any background, and
 * keeps the system's "nothing is separated by a line" rule intact.
 *
 * The press is handled at the cluster, not the child: see the note in the CSS.
 */
export function ButtonGroup({
  children,
  attached = true,
  orientation,
  fullWidth = false,
  className,
  ...rest
}: ButtonGroupProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  /*
   * The PARENT's width, not this element's: the group is `inline-flex` and so
   * is sized by its children. Measuring itself would report how wide it
   * currently is rather than how much room it has — and once stacked it is one
   * button wide, which is always narrower than a row, so it could never
   * straighten back out.
   */
  const width = useContainerWidth(rootRef, { from: 'parent' })
  /*
   * What one row of children needs. Measured rather than derived, for the same
   * reason Pagination measures its keys: the sizes are in `rem`, so a reader at
   * 200% text needs a proportionally wider row than any constant would allow.
   * Only read while horizontal — once stacked, the row is one child wide, and
   * storing that would let the group flip straight back and oscillate.
   */
  const [rowNeeded, setRowNeeded] = useState<number | null>(null)

  const resolved =
    orientation ??
    (attached && width !== null && rowNeeded !== null && width < rowNeeded ? 'vertical' : 'horizontal')

  useIsomorphicLayoutEffect(() => {
    if (resolved !== 'horizontal') return
    const root = rootRef.current
    if (!root || root.children.length === 0) return
    const measured = rowWidth(root)
    setRowNeeded((previous) => (previous === measured ? previous : measured))
  })

  return (
    <div
      {...rest}
      ref={rootRef}
      role="group"
      data-slot="button-group"
      data-orientation={resolved}
      data-attached={attached ? 'true' : 'false'}
      className={cx('may-button-group', fullWidth && 'may-button-group--full', className)}
    >
      {children}
    </div>
  )
}
