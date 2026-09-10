import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

let list: MediaQueryList | null = null

/**
 * One MediaQueryList for the page.
 *
 * `getSnapshot` runs on every render of every consumer and again on every
 * tearing check, and `matchMedia` parses the query and registers a fresh
 * target with the document each time it is called. Resolved lazily rather than
 * at module scope so nothing touches `window` during SSR.
 */
function media(): MediaQueryList | null {
  if (list) return list
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return (list = window.matchMedia(QUERY))
}

function subscribe(onChange: () => void): () => void {
  const mq = media()
  if (!mq) return () => {}
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = () => media()?.matches ?? false

/**
 * Whether the user has asked for reduced motion.
 *
 * The CSS in base.css already shortens transitions. This hook exists for the
 * cases CSS cannot reach: a gesture-driven spring, or a bar that slides away
 * entirely. A bar that vanishes is motion, not decoration, so it needs the JS
 * check rather than a shorter duration.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
