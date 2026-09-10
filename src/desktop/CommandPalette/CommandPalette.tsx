import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { Kbd } from '../../components/Kbd/Kbd'
/* Kbd arrives as a module, so its stylesheet comes with it. */
import './CommandPalette.css'

export interface CommandItem {
  id: string
  /** The matched, highlighted line. A plain string, because the filter reads it. */
  label: string
  /** Muted second line — what the command actually does, or where it lives. */
  hint?: ReactNode
  icon?: ReactNode
  /** Kbd tokens, e.g. `['cmd', 'shift', 'n']`. Rendered as real keycaps. */
  shortcut?: string[]
  /** Extra words the filter matches but never shows. "trash" finding "Delete". */
  keywords?: string[]
  disabled?: boolean
  /** Tints the row destructive, the way a red menu item reads. */
  destructive?: boolean
  onSelect?: () => void
}

export interface CommandGroup {
  id: string
  heading?: string
  items: CommandItem[]
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandGroup[]
  /** Fired before the item's own `onSelect`. */
  onSelect?: (item: CommandItem) => void
  /** Controlled query. */
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /** Ids listed under Recent while the query is empty, most recent first. */
  recentIds?: readonly string[]
  /** @default 5 */
  maxRecent?: number
  /** @default 'Recent' */
  recentHeading?: string
  /** @default 'Search commands' */
  placeholder?: string
  /**
   * Register a global ⌘K / Ctrl-K that toggles the palette. Pass another letter
   * to move it, or `false` when the host app owns the shortcut.
   * @default 'k'
   */
  hotkey?: string | false
  /** Shown when nothing matches. */
  emptyState?: ReactNode
  /** Drop the keyboard-hint footer. */
  hideFooter?: boolean
  /** Accessible name for the dialog. @default 'Commands' */
  label?: string
  className?: string
}

/** A matched slice of a label, as [start, end). */
type MatchRange = [number, number]

interface FuzzyMatch {
  score: number
  ranges: MatchRange[]
}

/** A run of matched characters is worth far more than the same count scattered. */
const CONSECUTIVE_BONUS = 12
/** Matching the first letter of a word — "np" finding "New Project". */
const BOUNDARY_BONUS = 10
/** The very first character of the label. */
const PREFIX_BONUS = 14
/** Charged per skipped character, so an early match outranks a late one. */
const GAP_PENALTY = 1
/** A keyword hit is a real hit, but a label hit should always outrank it. */
const KEYWORD_PENALTY = 40

const isBoundary = (text: string, index: number): boolean => {
  if (index === 0) return true
  const previous = text[index - 1]!
  return (
    previous === ' ' ||
    previous === '-' ||
    previous === '_' ||
    previous === '/' ||
    previous === '.' ||
    // camelCase: the capital is the boundary, not the character before it.
    (previous === previous.toLowerCase() && text[index] !== text[index]!.toLowerCase())
  )
}

/**
 * Greedy subsequence match with a score.
 *
 * Every letter of the query has to appear in order, which is what makes "gp"
 * find "Go to Project" and not "Paragraph". The score exists so that when four
 * commands all contain the letters, the one where they sit together and at word
 * starts is the one under the cursor — a fuzzy filter without scoring is barely
 * better than a substring test, and much more surprising.
 *
 * Returns the matched ranges too, so the row can show exactly which characters
 * earned the hit rather than leaving the user to guess.
 */
function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  if (!query) return { score: 0, ranges: [] }

  const haystack = text.toLowerCase()
  const needle = query.toLowerCase()
  const ranges: MatchRange[] = []

  let score = 0
  let cursor = 0
  let previous = -2

  for (const char of needle) {
    const found = haystack.indexOf(char, cursor)
    if (found === -1) return null

    if (found === previous + 1) {
      score += CONSECUTIVE_BONUS
      // Extend the open range rather than starting a new one, so the highlight
      // is one span per run instead of one per character.
      ranges[ranges.length - 1]![1] = found + 1
    } else {
      score -= (found - cursor) * GAP_PENALTY
      ranges.push([found, found + 1])
    }

    if (found === 0) score += PREFIX_BONUS
    else if (isBoundary(text, found)) score += BOUNDARY_BONUS

    previous = found
    cursor = found + 1
  }

  // Among equally-matched labels the shorter one is the more specific answer.
  return { score: score - text.length * 0.1, ranges }
}

/** Match the label first; fall back to the hidden keywords at a discount. */
function matchItem(query: string, item: CommandItem): FuzzyMatch | null {
  const direct = fuzzyMatch(query, item.label)
  if (direct) return direct

  let best: FuzzyMatch | null = null
  for (const keyword of item.keywords ?? []) {
    const hit = fuzzyMatch(query, keyword)
    if (hit && (!best || hit.score > best.score)) best = hit
  }
  // The ranges belong to the keyword, not the label, so they are dropped —
  // highlighting characters of a word the user cannot see reads as a bug.
  return best ? { score: best.score - KEYWORD_PENALTY, ranges: [] } : null
}

interface Match {
  item: CommandItem
  ranges: MatchRange[]
}

interface RenderGroup {
  id: string
  heading?: string
  matches: Match[]
}

/** Paint the characters the filter actually matched. */
function Highlight({ text, ranges }: { text: string; ranges: MatchRange[] }) {
  if (ranges.length === 0) return <>{text}</>

  const parts: ReactNode[] = []
  let cursor = 0
  ranges.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push(
      <mark key={index} className="may-command__match">
        {text.slice(start, end)}
      </mark>,
    )
    cursor = end
  })
  if (cursor < text.length) parts.push(text.slice(cursor))

  return <>{parts}</>
}

interface CommandRowProps {
  match: Match
  id: string
  active: boolean
  onActivate: () => void
  onHover: () => void
}

/**
 * One row.
 *
 * A real `<button>` carrying `role="option"`. The listbox pattern wants an
 * option, but an option is not something you can click, focus or activate on
 * its own — so the element underneath stays a button and the role sits on top
 * of it. That combination is the only one that satisfies both the ARIA pattern
 * and a keyboard that has never heard of it.
 *
 * Focus never leaves the input: `aria-activedescendant` is what moves. That is
 * why the row swallows its own pointerdown — letting focus land here would
 * close the software keyboard's grip on the query and break type-ahead.
 */
function CommandRow({ match, id, active, onActivate, onHover }: CommandRowProps) {
  const { item } = match
  const { pressProps } = usePressFeedback(item.disabled)

  return (
    <button
      {...pressProps}
      id={id}
      type="button"
      role="option"
      aria-selected={active}
      aria-disabled={item.disabled || undefined}
      // Never a tab stop: the input owns focus for the palette's whole life.
      tabIndex={-1}
      data-active={active ? 'true' : undefined}
      data-destructive={item.destructive ? 'true' : undefined}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={onHover}
      onClick={onActivate}
      /*
       * Two deliberate omissions.
       *
       * No `may-pressable`: a full-width row flashes its background under the
       * finger, exactly as ListRow does, because scaling something this wide
       * reads as the panel wobbling rather than the row being pressed.
       *
       * No `may-hoverable` either — moving the pointer over a row MAKES it
       * active, so the shared hover fill would paint a second, weaker
       * selection on top of the real one. A palette showing two selected rows
       * at once is the bug every hand-rolled one ships with.
       */
      className="may-command__row"
    >
      {item.icon && (
        <span className="may-command__icon" aria-hidden>
          {item.icon}
        </span>
      )}
      <span className="may-command__text">
        <span className="may-command__label">
          <Highlight text={item.label} ranges={match.ranges} />
        </span>
        {item.hint && <span className="may-command__hint">{item.hint}</span>}
      </span>
      {item.shortcut && item.shortcut.length > 0 && (
        <span className="may-command__shortcut">
          {item.shortcut.map((token) => (
            <Kbd key={token} size="xs">
              {token}
            </Kbd>
          ))}
        </span>
      )}
    </button>
  )
}

/**
 * The ⌘K launcher.
 *
 * A palette is a list you drive entirely from the keyboard, so everything here
 * is arranged around never having to leave it: focus stays in the query field
 * for the palette's whole life and the selection moves as
 * `aria-activedescendant`, the pointer only ever *previews* a row by making it
 * active, and every row that has a shortcut shows it as a real keycap so the
 * palette teaches you how to stop needing it.
 *
 * The filter is a scored fuzzy subsequence match, not a substring test, and it
 * highlights the characters that earned each hit.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  onSelect,
  query: queryProp,
  defaultQuery,
  onQueryChange,
  recentIds,
  maxRecent = 5,
  recentHeading = 'Recent',
  placeholder = 'Search commands',
  hotkey = 'k',
  emptyState,
  hideFooter = false,
  label = 'Commands',
  className,
}: CommandPaletteProps) {
  const id = useAutoId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const [internalQuery, setInternalQuery] = useState(defaultQuery ?? '')
  const query = queryProp ?? internalQuery
  const trimmed = query.trim()

  const commitQuery = (next: string) => {
    if (queryProp === undefined) setInternalQuery(next)
    onQueryChange?.(next)
  }

  /* --------------------------------- hotkey -------------------------------- */

  // Read through a ref so the listener registers once rather than on every
  // change of `open` — a listener that re-binds mid-keystroke drops the chord.
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    if (hotkey === false || typeof window === 'undefined') return
    const target = (hotkey || 'k').toLowerCase()

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return
      if (event.key.toLowerCase() !== target) return
      event.preventDefault()
      // A toggle, not an opener. Every launcher on the platform dismisses on
      // the same chord that summoned it, and a palette that only opens leaves
      // you hunting for Escape.
      onOpenChange(!openRef.current)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey, onOpenChange])

  /* ------------------------------ open lifecycle --------------------------- */

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    // Hiding the page's scrollbar widens the viewport by exactly its width, and
    // the layout behind the scrim jumps sideways unless that width is handed
    // back as padding.
    const gutter = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    inputRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      restoreTo.current?.focus?.()
    }
  }, [open])

  // A palette that reopens holding the last search is a palette you have to
  // clear before you can use it. Controlled callers decide for themselves.
  useEffect(() => {
    if (!open && queryProp === undefined) setInternalQuery('')
  }, [open, queryProp])

  /* --------------------------------- results ------------------------------- */

  const byId = useMemo(() => {
    const map = new Map<string, CommandItem>()
    for (const group of groups) for (const item of group.items) map.set(item.id, item)
    return map
  }, [groups])

  const renderGroups: RenderGroup[] = useMemo(() => {
    if (!trimmed) {
      const recent = (recentIds ?? [])
        .map((recentId) => byId.get(recentId))
        .filter((item): item is CommandItem => Boolean(item))
        .slice(0, maxRecent)

      if (recent.length === 0) {
        return groups.map((group) => ({
          id: group.id,
          heading: group.heading,
          matches: group.items.map((item) => ({ item, ranges: [] })),
        }))
      }

      // A recent command is lifted out of its own group rather than copied into
      // Recent, so the same id never appears twice — two rows that run the same
      // thing make the roving selection read as broken.
      const lifted = new Set(recent.map((item) => item.id))
      return [
        { id: `${id}-recent`, heading: recentHeading, matches: recent.map((item) => ({ item, ranges: [] })) },
        ...groups.map((group) => ({
          id: group.id,
          heading: group.heading,
          matches: group.items
            .filter((item) => !lifted.has(item.id))
            .map((item) => ({ item, ranges: [] as MatchRange[] })),
        })),
      ].filter((group) => group.matches.length > 0)
    }

    return groups
      .map((group) => {
        const matches = group.items
          .map((item) => {
            const hit = matchItem(trimmed, item)
            return hit ? { item, ranges: hit.ranges, score: hit.score } : null
          })
          .filter((entry): entry is Match & { score: number } => entry !== null)
          // Sorted inside the group rather than across all of them: a global
          // ranking shuffles headings around on every keystroke, and the group
          // a command lives in is half of what identifies it.
          .sort((a, b) => b.score - a.score)
        return { id: group.id, heading: group.heading, matches }
      })
      .filter((group) => group.matches.length > 0)
  }, [trimmed, groups, recentIds, maxRecent, recentHeading, byId, id])

  const flat = useMemo(() => renderGroups.flatMap((group) => group.matches), [renderGroups])

  /** Row -> its place in the flat list, so the groups can render independently. */
  const positions = useMemo(
    () => new Map(flat.map((match, position) => [match.item.id, position])),
    [flat],
  )

  /* -------------------------------- selection ------------------------------ */

  const [active, setActive] = useState(0)

  // Every keystroke re-ranks the list, so the selection goes back to the top —
  // leaving it on row four means Enter runs whatever happened to land there.
  useEffect(() => {
    setActive(0)
  }, [trimmed, open])

  useEffect(() => {
    setActive((current) => (current >= flat.length ? 0 : current))
  }, [flat.length])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      // `nearest` keeps the list still when the row is already visible; anything
      // else re-centres the list under the pointer as you arrow through it.
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const move = (delta: number) => {
    if (flat.length === 0) return
    let next = active
    for (let i = 0; i < flat.length; i++) {
      next = (next + delta + flat.length) % flat.length
      if (!flat[next]!.item.disabled) break
    }
    setActive(next)
  }

  const commit = (item: CommandItem) => {
    if (item.disabled) return
    onSelect?.(item)
    item.onSelect?.()
    onOpenChange(false)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(Math.max(0, flat.length - 1))
        break
      case 'Enter': {
        const match = flat[active]
        if (!match) return
        event.preventDefault()
        commit(match.item)
        break
      }
      case 'Escape':
        event.preventDefault()
        onOpenChange(false)
        break
      default:
        break
    }
  }

  if (!open) return null

  const listId = `${id}-list`

  return (
    <div
      className="may-command__scrim"
      data-slot="scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-slot="command-palette"
        className={cx('may-command', className)}
      >
        <div className="may-command__field">
          <IoSearch className="may-command__search" aria-hidden focusable="false" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[active] ? `${id}-option-${flat[active]!.item.id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={query}
            onChange={(event) => commitQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className="may-command__input"
          />
          <Kbd size="sm" live className="may-command__escape">
            esc
          </Kbd>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          data-slot="scroll-area"
          className="may-command__list"
        >
          {flat.length === 0
            ? (emptyState ?? (
                <p className="may-command__empty">
                  No commands match &ldquo;{trimmed}&rdquo;.
                </p>
              ))
            : renderGroups.map((group) => (
                // A real `group` inside the listbox, named by its heading. The
                // heading element itself is presentational — announced as an
                // option it would be a row in the list that cannot be selected.
                <div key={group.id} role="group" aria-label={group.heading} className="may-command__group">
                  {group.heading && (
                    <div className="may-command__heading" role="presentation">
                      {group.heading}
                    </div>
                  )}
                  {group.matches.map((match) => {
                    const position = positions.get(match.item.id) ?? -1
                    return (
                      <CommandRow
                        key={match.item.id}
                        id={`${id}-option-${match.item.id}`}
                        match={match}
                        active={position === active}
                        onActivate={() => commit(match.item)}
                        onHover={() => setActive(position)}
                      />
                    )
                  })}
                </div>
              ))}
        </div>

        {!hideFooter && (
          <div className="may-command__footer">
            <span className="may-command__legend">
              <Kbd size="xs" live>
                up
              </Kbd>
              <Kbd size="xs" live>
                down
              </Kbd>
              Navigate
            </span>
            <span className="may-command__legend">
              <Kbd size="xs" live>
                enter
              </Kbd>
              Select
            </span>
            <span className="may-command__legend">
              <Kbd size="xs" live>
                esc
              </Kbd>
              Close
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
