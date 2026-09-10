import { useEffect } from 'react'

/**
 * Publish how much of the layout viewport the on-screen keyboard covers.
 *
 * Android resizes the layout viewport when the keyboard opens, so CSS sees the
 * space shrink and a sheet's footer rides up on its own. **iOS does not** — it
 * draws the keys over a viewport that stays full height, so the footer, i.e.
 * the Save button, sits underneath them with no way to reach it. Every
 * consumer with a form in a sheet hits this and has to solve it themselves.
 *
 * `visualViewport` is the only thing that reports the difference. The overlap
 * is the layout viewport's height minus the visual viewport's height and its
 * offset; on Android that lands at 0 because the layout viewport already
 * shrank, which is why one measurement covers both platforms.
 *
 * Written to a CSS variable on the root rather than into React state: the
 * value changes for every frame of the keyboard's slide, and a render per
 * frame to move one padding is what a custom property exists to avoid.
 */
export function useKeyboardInset(enabled = true): void {
  useEffect(() => {
    const vv = typeof window === 'undefined' ? null : window.visualViewport
    if (!enabled || !vv) return

    const root = document.documentElement
    let frame = 0
    let last = ''

    const read = () => {
      frame = 0
      // Clamped at 0: over-scrolling the visual viewport can make this negative.
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      const next = `${Math.round(overlap)}px`
      if (next === last) return
      last = next
      root.style.setProperty('--may-keyboard-inset', next)
    }

    // The viewport fires far faster than the screen repaints while the keyboard
    // slides, and a custom-property write invalidates style for the subtree.
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    read()
    vv.addEventListener('resize', onChange)
    vv.addEventListener('scroll', onChange)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      vv.removeEventListener('resize', onChange)
      vv.removeEventListener('scroll', onChange)
      root.style.removeProperty('--may-keyboard-inset')
    }
  }, [enabled])
}
