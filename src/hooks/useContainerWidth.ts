import type { RefObject } from 'react'
import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * The element's own content width, kept current as it resizes.
 *
 * `useIsDesktop` answers a question about the WINDOW, which is the right
 * question for a sheet or a modal — those are anchored to the viewport and
 * nothing else. It is the wrong question for a component laid out in flow,
 * whose room comes from its parent:
 *
 *   - a Table filling a 1000px window rendered as a collapsed phone list,
 *     because 1000 < the 1024px desktop breakpoint, with 988px going spare;
 *   - the same Table in a 254px sidebar of a 1400px window rendered as a full
 *     table and scrolled sideways inside the column, which is precisely the
 *     shape the collapsed layout exists to avoid.
 *
 * Both were measured. Neither is reachable from a viewport query, at any
 * breakpoint, because the viewport does not know about the sidebar.
 *
 * Returns `null` until the element has been measured — on the server, before
 * the first layout effect, and in an environment without `ResizeObserver`.
 * Callers treat `null` as "fall back to the viewport", which keeps SSR and
 * hydration exactly as they were.
 */
export function useContainerWidth(ref: RefObject<HTMLElement | null>): number | null {
  const [width, setWidth] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    /*
     * `clientWidth` rather than `getBoundingClientRect().width`: it is an
     * integer and it excludes a scrollbar, so a container that gains one does
     * not report room it no longer has, and a fractional layout does not
     * re-render the component on every sub-pixel reflow.
     */
    const read = () => setWidth((previous) => (previous === el.clientWidth ? previous : el.clientWidth))

    // Measured in the layout effect, before paint: a component that decides
    // its shape from this must not show one shape and then swap to the other.
    read()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return width
}
