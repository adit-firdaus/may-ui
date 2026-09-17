import { useEffect, useState } from 'react'

/**
 * Keeps a closed overlay mounted for the length of its exit animation.
 *
 * Unmounting the moment `open` goes false makes every dismissal instant, which
 * next to an entrance that springs reads as a glitch rather than a decision.
 *
 * This used to live in `Popover.tsx` and was imported out of it by six other
 * components. It is overlay mechanics, not popover behaviour, so it belongs
 * beside the rest of them; `Popover` re-exports it for anyone who took it from
 * there.
 */
export function useExitDelay(open: boolean, ms: number): boolean {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    if (!mounted) return
    const timer = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(timer)
  }, [open, mounted, ms])

  return mounted
}
