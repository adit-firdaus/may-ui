import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches

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
