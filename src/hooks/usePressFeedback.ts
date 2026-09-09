import { useCallback, useEffect, useRef, useState } from 'react'

/** Minimum time the pressed state stays visible, in ms. */
const MIN_VISIBLE = 90

/**
 * Press state that a fast tap can actually see.
 *
 * A deliberate tap can be shorter than the press transition, so a naive
 * `:active` style flashes for a frame or never paints at all. This holds the
 * pressed state for a minimum window, which — combined with the asymmetric
 * transition in base.css, where release rides a spring that overshoots — is
 * what makes a 20ms tap still read as a full press-and-bounce.
 *
 * Returns props to spread onto the element. Pointer events cover mouse, touch
 * and pen in one path; `pointercancel` matters because a press that turns into
 * a scroll must not stay stuck down.
 */
export function usePressFeedback(disabled = false) {
  const [pressed, setPressed] = useState(false)
  const pressedAt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const press = useCallback(() => {
    if (disabled) return
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    pressedAt.current = Date.now()
    setPressed(true)
  }, [disabled])

  const release = useCallback(() => {
    const elapsed = Date.now() - pressedAt.current
    const remaining = Math.max(0, MIN_VISIBLE - elapsed)
    if (remaining === 0) {
      setPressed(false)
      return
    }
    timer.current = setTimeout(() => setPressed(false), remaining)
  }, [])

  return {
    pressed,
    pressProps: {
      onPointerDown: press,
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: release,
      'data-pressed': pressed ? ('true' as const) : undefined,
    },
  }
}
