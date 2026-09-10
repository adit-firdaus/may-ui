import { useSyncExternalStore } from 'react'
import { usePlatform } from './platform'

/**
 * Reads the breakpoint from the token layer, so JS and CSS can never disagree
 * about what "desktop" means. (A reference implementation had its JS at 992px
 * and its CSS at 1024px; components and their own styles then took different
 * branches at widths between the two.)
 */
function query(): string {
  if (typeof window === 'undefined') return '(min-width: 1024px)'
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue('--may-breakpoint-desktop')
    .trim()
  return `(min-width: ${token || '1024px'})`
}

let list: MediaQueryList | null = null

/**
 * One MediaQueryList for the page.
 *
 * `getSnapshot` runs on every render of every consumer and again on every
 * tearing check. Doing it the long way meant a `getComputedStyle` on the
 * document element *and* a fresh `matchMedia` per render, across every
 * adaptive component on the page.
 *
 * The breakpoint is therefore resolved once, on first use. It is a build-time
 * constant in practice — `--may-breakpoint-desktop` is emitted once by
 * `gen-tokens.mjs`, on `:root`, and no theme redeclares it — and resolving
 * lazily rather than at module scope keeps a late-loading stylesheet correct.
 */
function media(): MediaQueryList | null {
  if (list) return list
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return (list = window.matchMedia(query()))
}

function subscribe(onChange: () => void): () => void {
  const mq = media()
  if (!mq) return () => {}
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = () => media()?.matches ?? false

/**
 * Server snapshot deliberately reports desktop rather than mobile: adaptive
 * components render their desktop shape during SSR, so the common case
 * hydrates without a visible reflow. A phone corrects itself on first paint,
 * which is the cheaper direction to be wrong in.
 */
const getServerSnapshot = () => true

export function useIsDesktop(): boolean {
  const measured = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  // A pinned platform wins over the viewport. Hooks cannot be called
  // conditionally, so the media query still runs — it is a subscription, not
  // work, and pinning is the uncommon case.
  const platform = usePlatform()
  if (platform === 'phone') return false
  if (platform === 'desktop') return true
  return measured
}
