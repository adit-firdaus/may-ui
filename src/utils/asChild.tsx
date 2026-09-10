import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cx } from './cx'

/**
 * Render a control's presentation onto the caller's own element.
 *
 * "A link that looks like a button" is one of the most common needs in any app
 * with a router, and `onClick` + `navigate()` is not a substitute: it loses the
 * real anchor, so middle-click, cmd-click, open-in-new-tab, "copy link address"
 * and crawlability all break, and it is the wrong element for assistive tech.
 * Without this, consumers cloned May's classes and data attributes themselves
 * and hard-coded the internal DOM contract — including re-creating the label
 * span, because the gap and truncation rules select it.
 *
 * The child's own props win on conflict, so its `href`/`to`/`onClick` survive;
 * only `className` is merged rather than replaced. A child that sets the same
 * pointer handlers as the press feedback therefore replaces them, which is the
 * documented trade for not shipping an event-composition layer.
 */
export function renderAsChild(
  child: ReactNode,
  own: Record<string, unknown> & { className?: string },
  content: (children: ReactNode) => ReactNode,
): ReactNode | null {
  if (!isValidElement(child)) return null
  const el = child as ReactElement<{ className?: string; children?: ReactNode }>
  const { className, ...presentation } = own
  return cloneElement(
    el,
    {
      ...presentation,
      ...el.props,
      className: cx(className, el.props.className),
    } as Partial<unknown> & Record<string, unknown>,
    content(el.props.children),
  )
}
