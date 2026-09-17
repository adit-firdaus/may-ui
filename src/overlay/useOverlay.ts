import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * What counts as focusable inside an overlay.
 *
 * This lived as five byte-identical copies in Modal, Sheet, AlertDialog,
 * ActionSheet and Popover. They were identical by luck rather than by
 * construction, and a selector that drifts in one overlay produces a focus trap
 * that leaks in exactly one dialog — the kind of bug nobody reproduces on
 * purpose.
 *
 * Toolbar deliberately keeps its own, narrower selector: it drives a roving
 * tabindex across a row of controls rather than containing focus, so the two
 * are different questions that happen to have similar answers.
 */
export const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/*
 * The dismissible-layer stack.
 *
 * Every overlay that takes Escape — modal or anchored — registers here while it
 * is open, and only the layer on top is allowed to act on the key.
 *
 * This replaces two different attempts at the same idea that both failed:
 *
 *   - Modal, AlertDialog and ActionSheet handled the key on their own scrim and
 *     called `stopPropagation`, which works only when the layers genuinely nest
 *     in the DOM.
 *   - Sheet and Popover each registered a CAPTURE-phase listener on `document`.
 *     Two listeners on the same node fire in registration order, and
 *     `stopPropagation` does not suppress a sibling listener on that node —
 *     that needs `stopImmediatePropagation`. So the Sheet, having opened first,
 *     always heard Escape first, and a Popover inside a Sheet took the Sheet
 *     down with it. Popover's own comment described preventing exactly that.
 *
 * An explicit stack answers "who is on top" directly instead of inferring it
 * from DOM position or listener order, so nesting and portalling are both
 * irrelevant to it.
 */
let stack: symbol[] = []

/**
 * Mark everything outside `root` inert, and return the undo.
 *
 * May UI overlays render in place rather than through a portal — a Sheet is
 * written inside the Card whose button opens it, which is where the reader is
 * looking. So containment cannot be "inert every sibling of the portal root";
 * it has to walk up from the scrim and inert each ancestor's OTHER children.
 *
 * `inert` is what makes this correct for assistive tech. A Tab cycle keeps the
 * Tab key inside the dialog but does nothing about a screen reader's virtual
 * cursor, which reads straight through the scrim into the page behind. `inert`
 * removes the subtree from the a11y tree and from focus in one attribute, so it
 * replaces the hand-rolled trap rather than supplementing it.
 *
 * Nodes already inert are left alone and not recorded, so an inner dialog
 * closing cannot un-inert the page behind an outer one that is still open.
 */
function applyInert(root: HTMLElement): () => void {
  const touched: HTMLElement[] = []
  let node: HTMLElement | null = root

  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement
    if (!parent) break
    for (const child of Array.from(parent.children)) {
      if (child === node || !(child instanceof HTMLElement)) continue
      if (child.hasAttribute('inert')) continue
      child.setAttribute('inert', '')
      touched.push(child)
    }
    node = parent
  }

  return () => {
    for (const element of touched) element.removeAttribute('inert')
  }
}

/**
 * Hide the page's scrollbar without letting the layout jump.
 *
 * Hiding the scrollbar widens the viewport by exactly its own width, and the
 * page behind the scrim lurches sideways unless that width is handed back as
 * padding. Modal, AlertDialog and CommandPalette each worked this out
 * separately; Sheet and ActionSheet never did, so they were the two that
 * jumped.
 */
function lockBodyScroll(): () => void {
  const body = document.body
  const previousOverflow = body.style.overflow
  const previousPadding = body.style.paddingRight
  const gutter = window.innerWidth - document.documentElement.clientWidth

  body.style.overflow = 'hidden'
  if (gutter > 0) body.style.paddingRight = `${gutter}px`

  return () => {
    body.style.overflow = previousOverflow
    body.style.paddingRight = previousPadding
  }
}

interface DismissLayerOptions {
  /** Whether the layer is present. Pass the mounted-through-exit flag. */
  open: boolean
  onClose: () => void
  closeOnEscape?: boolean
}

/**
 * Registers a dismissible layer and gives it Escape while it is on top.
 *
 * Listening on `document` is safe here precisely because the stack, not the
 * listener order, decides who acts — see the note in `layers.ts` for the two
 * ways this went wrong before.
 */
export function useDismissLayer({
  open,
  onClose,
  closeOnEscape = true,
}: DismissLayerOptions): void {
  // A fresh identity per hook instance, stable across renders. Created lazily
  // rather than as the initial value so every render does not mint a Symbol
  // only to discard it.
  const id = useRef<symbol | null>(null)
  id.current ??= Symbol('may-layer')

  // Read through a ref so re-registering the listener is not tied to the
  // caller passing a stable `onClose`.
  const handler = useRef(onClose)
  handler.current = onClose

  useEffect(() => {
    if (!open) return
    const token = id.current!
    stack.push(token)
    const release = () => { stack = stack.filter((entry) => entry !== token) }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !closeOnEscape) return
      if (stack[stack.length - 1] !== token) return
      // The layer that acts also claims the key, so an application-level
      // Escape binding does not fire behind an overlay it never saw open.
      event.stopPropagation()
      handler.current()
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      release()
    }
  }, [open, closeOnEscape])
}

interface UseOverlayOptions extends DismissLayerOptions {
  /**
   * Contain focus and the accessibility tree, and lock scroll by default.
   * False for anchored, non-modal layers (Popover, Tooltip, Menu).
   */
  modal?: boolean
  /**
   * Split from `modal` for one real case: ActionSheet in `menu` mode is modal
   * in every other respect but deliberately skips the lock, because hiding the
   * page's scrollbar to open a menu jolts the whole layout.
   */
  lockScroll?: boolean
  /**
   * What to focus on open. A callback rather than a policy, because every
   * overlay's answer is a considered one: Modal focuses its panel so a Return
   * does not land on a destructive footer action, AlertDialog focuses Cancel
   * when destructive, ActionSheet focuses its first row because iOS sorts
   * destructive actions last. Defaults to the panel.
   */
  initialFocus?: () => HTMLElement | null
}

interface UseOverlayResult<T extends HTMLElement = HTMLDivElement> {
  /** Attach to the panel. Focused by default on open, and the inert boundary. */
  panelRef: RefObject<T | null>
}

/**
 * Scroll lock, focus handover, Escape and containment for a modal overlay.
 *
 * Pass the mounted-through-exit flag as `open`, not the raw prop: releasing the
 * scroll lock and returning focus at the START of the exit animation is what
 * makes a dialog's width snap mid-dismiss. Modal and AlertDialog already keyed
 * this effect on `mounted`; Sheet and ActionSheet keyed it on `open` and had
 * exactly that glitch.
 */
export function useOverlay<T extends HTMLElement = HTMLDivElement>({
  open,
  onClose,
  closeOnEscape = true,
  modal = true,
  initialFocus,
}: UseOverlayOptions): UseOverlayResult<T> {
  const panelRef = useRef<T | null>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  useDismissLayer({ open, onClose, closeOnEscape })

  // `initialFocus` is read through a ref: it closes over component state, so an
  // inline arrow would otherwise re-run the whole open lifecycle every render.
  const pickFocus = useRef(initialFocus)
  pickFocus.current = initialFocus

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const undo: Array<() => void> = []

    if (modal) {
      undo.push(lockBodyScroll())
      if (panelRef.current) undo.push(applyInert(panelRef.current))
    }

    /*
     * An explicit choice always wins. Otherwise focus the panel itself rather
     * than its first focusable, which is very often a destructive footer
     * action — a stray Return must not be the key that deletes something.
     *
     * The containment check is what lets `autoFocus` keep working: React
     * honours it during commit, before this effect runs, so a consumer who
     * marked a specific control must not have it taken away here.
     */
    const panel = panelRef.current
    const explicit = pickFocus.current?.()
    if (explicit) explicit.focus()
    else if (panel && !panel.contains(document.activeElement)) panel.focus()

    return () => {
      for (const fn of undo.reverse()) fn()
      restoreTo.current?.focus?.()
    }
  }, [open, modal])

  return { panelRef }
}
