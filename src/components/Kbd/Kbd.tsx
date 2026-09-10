import type { HTMLAttributes, ReactNode } from 'react'
import { forwardRef, useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import type { MaySize } from '../../types'
import './Kbd.css'

/**
 * Apple's modifier glyphs. Writing "Cmd" on a Mac is the same mistake as
 * writing "Apple key": the OS shows a symbol everywhere, so a cheat sheet that
 * spells it out cannot be matched against what the menu bar is showing.
 */
const GLYPHS: Record<string, string> = {
  cmd: '⌘',
  command: '⌘',
  meta: '⌘',
  mod: '⌘',
  shift: '⇧',
  opt: '⌥',
  option: '⌥',
  alt: '⌥',
  ctrl: '⌃',
  control: '⌃',
  caps: '⇪',
  capslock: '⇪',
  enter: '↩',
  return: '↩',
  esc: '⎋',
  escape: '⎋',
  tab: '⇥',
  backspace: '⌫',
  delete: '⌫',
  space: '␣',
  up: '↑',
  arrowup: '↑',
  down: '↓',
  arrowdown: '↓',
  left: '←',
  arrowleft: '←',
  right: '→',
  arrowright: '→',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
  eject: '⏏',
}

/** Token -> the `KeyboardEvent.key` value the browser actually reports. */
const EVENT_KEYS: Record<string, string> = {
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  mod: 'Meta',
  shift: 'Shift',
  opt: 'Alt',
  option: 'Alt',
  alt: 'Alt',
  ctrl: 'Control',
  control: 'Control',
  caps: 'CapsLock',
  capslock: 'CapsLock',
  enter: 'Enter',
  return: 'Enter',
  esc: 'Escape',
  escape: 'Escape',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Backspace',
  space: ' ',
  up: 'ArrowUp',
  arrowup: 'ArrowUp',
  down: 'ArrowDown',
  arrowdown: 'ArrowDown',
  left: 'ArrowLeft',
  arrowleft: 'ArrowLeft',
  right: 'ArrowRight',
  arrowright: 'ArrowRight',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  home: 'Home',
  end: 'End',
}

const MODIFIER_KEYS = new Set(['Meta', 'Shift', 'Alt', 'Control', 'CapsLock'])

/**
 * What each glyph is called out loud. Keyed by the symbol rather than the
 * token, so the aliases above collapse to one spoken name — "cmd", "command"
 * and "meta" all read as Command.
 */
const SPOKEN: Record<string, string> = {
  '⌘': 'Command',
  '⇧': 'Shift',
  '⌥': 'Option',
  '⌃': 'Control',
  '⇪': 'Caps Lock',
  '↩': 'Return',
  '⎋': 'Escape',
  '⇥': 'Tab',
  '⌫': 'Delete',
  '␣': 'Space',
  '↑': 'Up arrow',
  '↓': 'Down arrow',
  '←': 'Left arrow',
  '→': 'Right arrow',
  '⇞': 'Page Up',
  '⇟': 'Page Down',
  '↖': 'Home',
  '↘': 'End',
  '⏏': 'Eject',
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /** @default 'sm' */
  size?: MaySize
  /** Draw the cap as held down. */
  pressed?: boolean
  /**
   * Light the cap while the real key is held on a physical keyboard. Turns a
   * shortcut list into something you can check yourself against.
   */
  live?: boolean
}

/**
 * A keycap.
 *
 * No stroke: a cap reads as sitting on the surface through a translucent fill
 * and the softest shadow in the ramp, which is also the only version that
 * survives a dark theme — an outlined cap turns into a floating rectangle.
 *
 * Press feel is the same asymmetry as every other control in the system: down
 * is instant, release rides the bouncy spring back up, so a `live` cap tracking
 * a real keypress moves the way the key under the finger does.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, size = 'sm', pressed = false, live = false, className, ...rest },
  ref,
) {
  const token = typeof children === 'string' ? children.trim().toLowerCase() : null
  const glyph = token ? GLYPHS[token] : undefined
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!live || !token) return
    const target = EVENT_KEYS[token] ?? token
    /**
     * `event.key` is the character the OS produced, so ⇧4 arrives as "$" and a
     * cap for 4 would never light. `event.code` is the physical key, which is
     * what a shortcut actually names — so match either.
     */
    const matches = (event: KeyboardEvent) =>
      event.key === target ||
      event.key.toLowerCase() === target.toLowerCase() ||
      event.code.replace(/^(Key|Digit|Numpad)/, '').toLowerCase() === target.toLowerCase()

    const onDown = (event: KeyboardEvent) => {
      if (matches(event)) setHeld(true)
    }
    const onUp = (event: KeyboardEvent) => {
      // macOS swallows the keyup of a character key while Command is down, so a
      // cap for "K" in ⌘K would stay lit forever. Releasing any modifier
      // therefore clears the character caps too.
      if (matches(event) || (!MODIFIER_KEYS.has(target) && MODIFIER_KEYS.has(event.key))) {
        setHeld(false)
      }
    }
    // A key still down when the window loses focus never fires its keyup.
    const reset = () => setHeld(false)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', reset)
    }
  }, [live, token])

  return (
    <kbd
      {...rest}
      ref={ref}
      data-slot="kbd"
      data-size={size}
      data-pressed={pressed || held ? 'true' : undefined}
      className={cx('may-kbd', className)}
    >
      {glyph ? (
        <>
          <span aria-hidden>{glyph}</span>
          {/* Most screen readers announce "⌘" as "place of interest sign", so
            * the spoken name travels alongside it. */}
          <span className="may-sr-only">{SPOKEN[glyph] ?? children}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  )
})
