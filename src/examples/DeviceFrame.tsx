import type { ReactNode } from 'react'
import { cx } from '../utils/cx'
import { PlatformProvider } from '../hooks/platform'

export interface DeviceFrameProps {
  children?: ReactNode
  /** @default 'phone' */
  device?: 'phone' | 'phone-large' | 'tablet'
  /** Pin the frame's theme independently of the page. */
  theme?: 'light' | 'dark'
  /** Caption under the frame. */
  label?: string
  className?: string
}

/**
 * A simulated device viewport for the phone-shaped examples.
 *
 * Two things here are load-bearing rather than decorative:
 *
 * 1. `transform: translateZ(0)` on the screen establishes a containing block,
 *    so `position: fixed` descendants — NavBar, TabBar, Sheet scrims, Fab —
 *    resolve against the frame instead of escaping to the browser viewport.
 *    Without it a bottom tab bar sticks to the bottom of the page and the
 *    example is meaningless. This is the same mechanism behind the
 *    [GRID_OVERFLOW] escape warnings the sync validator raises on those
 *    components: a fixed element needs someone to be fixed *to*.
 *
 * 2. The `--may-inset-*` overrides feed SafeArea and every component that
 *    pads for the notch. `env(safe-area-inset-*)` reports 0 in a desktop
 *    browser, so without these the examples would show none of the safe-area
 *    behaviour they are meant to demonstrate.
 *
 * 3. The platform is pinned. Adaptive components ask `useIsDesktop`, which
 *    measures the real viewport — so on a normal monitor a phone mock-up would
 *    get `Sheet` as a centred dialog and `ActionSheet` as an anchored menu:
 *    the desktop half of every adaptive component, inside a phone. Pinning
 *    makes the frame's contents behave like the device it is drawing.
 *
 * One thing the frame cannot fix: `ContextMenu`, `FloatingBubble` and the
 * Sidebar rail flyout compute coordinates against the real viewport, so they
 * are wrong inside any transformed ancestor. Those belong outside a frame.
 */
export function DeviceFrame({
  children,
  device = 'phone',
  theme,
  label,
  className,
}: DeviceFrameProps) {
  return (
    <figure className={cx('may-device', `may-device--${device}`, className)}>
      <div className="may-device__body">
        <div
          className="may-device__screen"
          data-may-theme={theme}
          data-slot="device-screen"
        >
          <PlatformProvider platform={device === 'tablet' ? 'desktop' : 'phone'}>
            {children}
          </PlatformProvider>
        </div>
        <span className="may-device__notch" aria-hidden />
        <span className="may-device__indicator" aria-hidden />
      </div>
      {label && <figcaption className="may-device__label">{label}</figcaption>}
    </figure>
  )
}
