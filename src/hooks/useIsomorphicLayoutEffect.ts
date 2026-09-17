import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * Measuring geometry — a popover's placement, a thumb's track — has to happen
 * before paint or the first frame shows the element in the wrong place. But
 * `useLayoutEffect` has no meaning during `renderToString`, and React warns
 * about it, so the server gets the effect that never runs instead.
 *
 * The branch is evaluated once at module scope rather than per render: the
 * answer cannot change for the life of the bundle, and a hook whose identity
 * flipped between renders would break the rules of hooks.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
