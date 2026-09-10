import { useRef, useState } from 'react'
import {
  IoArrowRedoOutline,
  IoArrowUndoOutline,
  IoAttachOutline,
  IoEllipsisHorizontal,
  IoFlagOutline,
  IoFolderOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { Avatar } from '../components/Avatar'
import { IconButton } from '../components/IconButton'
import { Menu } from '../components/Menu'
import { Separator } from '../components/Separator'
import { Stack } from '../components/Stack'
import { Tag } from '../components/Tag'
import { Text } from '../components/Text'
import { Toolbar, ToolbarSpacer } from '../components/Toolbar'
import { NavBar } from '../mobile/NavBar'

/**
 * One message, opened.
 *
 * The reading pane is the counterpart to the inbox: the inbox is a list on the
 * grouped background, so this screen sits on `--may-color-surface` instead and
 * the chrome above and below it inherits the same value. That is the whole
 * reason it reads as a *document* rather than as another card.
 *
 * Two compositions are worth copying out of here:
 *
 * - **The overflow menu is a `Menu` whose trigger is an `IconButton`.** The
 *   trigger is cloned to carry the open state, so it has to be a single
 *   ref-forwarding element — not a fragment, not a wrapper div. `shortcut` is
 *   drawn muted on the trailing edge and `destructive` tints Trash red, which
 *   together are how a native menu ranks its own items.
 *
 * - **The toolbar reads left-to-right as risk, then intent.** Trash sits alone
 *   at the leading edge, a `ToolbarSpacer` opens the gap, and the two actions
 *   you actually came for finish the bar under the thumb.
 */
export function MailDetailScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [flagged, setFlagged] = useState(false)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-surface)',
      }}
    >
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        {/* Sticky by default, which works because this div is the scroller. */}
        <NavBar
          backLabel="Inbox"
          onBack={() => {}}
          scrollRef={scrollRef}
          trailing={
            <Menu
              placement="bottom-end"
              aria-label="Message actions"
              trigger={
                <IconButton aria-label="More">
                  <IoEllipsisHorizontal aria-hidden />
                </IconButton>
              }
              items={[
                { label: 'Reply', icon: <IoArrowUndoOutline aria-hidden />, shortcut: '⌘R', onSelect: () => {} },
                { label: 'Reply All', icon: <ReplyAllIcon />, shortcut: '⇧⌘R', onSelect: () => {} },
                { label: 'Forward', icon: <IoArrowRedoOutline aria-hidden />, shortcut: '⇧⌘F', onSelect: () => {} },
                {
                  label: flagged ? 'Unflag' : 'Flag',
                  icon: <IoFlagOutline aria-hidden />,
                  shortcut: '⇧⌘L',
                  separator: true,
                  onSelect: () => setFlagged((v) => !v),
                },
                { label: 'Move to Folder…', icon: <IoFolderOutline aria-hidden />, shortcut: '⇧⌘M', onSelect: () => {} },
                /* `separator` opens a break ABOVE the item, which is how the
                   destructive action is fenced off from everything above it. */
                {
                  label: 'Trash',
                  icon: <IoTrashOutline aria-hidden />,
                  shortcut: '⌘⌫',
                  destructive: true,
                  separator: true,
                  onSelect: () => {},
                },
              ]}
            />
          }
        />

        <div
          style={{
            padding:
              'var(--may-space-2) var(--may-space-4) calc(var(--may-inset-bottom) + var(--may-space-6))',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-4)',
          }}
        >
          {/* The sender block: who it is on the leading edge, when it landed on
              the trailing one, exactly as Mail arranges it. */}
          <Stack direction="row" gap={3} align="start" fullWidth>
            <Avatar name="Priya Raghunathan" size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text variant="headline" as="span" style={{ display: 'block' }}>
                Priya Raghunathan
              </Text>
              <Text variant="footnote" tone="secondary" as="span" style={{ display: 'block' }}>
                to me
              </Text>
            </div>
            <Stack direction="row" gap={2} align="center">
              {flagged && <FlagBadge />}
              <Text variant="footnote" tone="tertiary" as="span">
                9:41 AM
              </Text>
            </Stack>
          </Stack>

          <Text variant="title-3">Milestone 3 — where the rebuild actually stands</Text>

          <Separator />

          <Stack direction="column" gap={4}>
            <Text variant="body">
              Morning. Ahead of Thursday I wanted to get the real state of the rebuild in
              front of everyone in writing, rather than leaving it to twenty minutes of
              screen sharing.
            </Text>
            <Text variant="body">
              All seventy-four components are through review and on the new token layer.
              The three that were still carrying their own colours — the toolbar, the
              swipe row and the pull indicator — now read from the semantic tier like
              everything else, so a theme change is one file again. Dark mode came out of
              that for free, which was the part I was least sure about.
            </Text>
            <Text variant="body">
              The one genuinely open question is the phone toolbar. On a 390-point screen
              a five-item bar leaves each target under the 44-point minimum, so I have
              cut it to four and moved Move to Folder into the overflow menu. Nobody has
              complained in the internal build, but it is a behaviour change and I would
              rather we decided it than discovered it.
            </Text>
            <Text variant="body">
              Numbers, so nobody has to ask: the bundle is 118 KB gzipped, down from
              186 KB; first paint in the gallery is 240 ms on the reference iPhone; and
              the visual diff run is green apart from two intentional shifts in the
              search pill. Both are in the attached review deck.
            </Text>
            <Text variant="body">
              If the toolbar call goes our way I can have the release candidate cut by
              Friday lunchtime.
            </Text>
            <Text variant="body" tone="secondary">
              — Priya
            </Text>
          </Stack>

          {/* Attachments as static chips: no `onRemove`, so no trailing X. */}
          <Stack direction="row" gap={2} wrap>
            <Tag leadingIcon={<IoAttachOutline aria-hidden />}>Milestone-3-Review.pdf · 2.4 MB</Tag>
            <Tag leadingIcon={<IoAttachOutline aria-hidden />}>Burndown-September.png · 812 KB</Tag>
          </Stack>
        </div>
      </div>

      <Toolbar placement="bottom" separator safeArea>
        <IconButton aria-label="Move to Trash" tone="danger">
          <IoTrashOutline aria-hidden />
        </IconButton>
        <ToolbarSpacer />
        <IconButton aria-label="Reply">
          <IoArrowUndoOutline aria-hidden />
        </IconButton>
        <IconButton aria-label="Forward">
          <IoArrowRedoOutline aria-hidden />
        </IconButton>
      </Toolbar>
    </div>
  )
}

/** The flag, shown beside the timestamp once the menu has set it. */
function FlagBadge() {
  return (
    <span
      aria-label="Flagged"
      role="img"
      style={{ display: 'inline-flex', color: 'var(--may-color-warning)' }}
    >
      <IoFlagOutline aria-hidden />
    </span>
  )
}

/* ------------------------------- glyph set -------------------------------- */
/* Reply All stays hand-drawn: Ionicons carries no reply-all mark, and reusing
 * the plain reply arrow would print the same glyph on two different items. */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function ReplyAllIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <path d="M5.5 4.5.5 9l5 4.5" {...stroke} />
      <path d="M10 4.5 5 9l5 4.5V11c3.6 0 5.9 1.4 7.5 4.5.2-5.6-2.2-8.6-7.5-8.8z" {...stroke} />
    </svg>
  )
}
