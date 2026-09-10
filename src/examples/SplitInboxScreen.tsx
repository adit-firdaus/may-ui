import { useState } from 'react'
import {
  IoArchiveOutline,
  IoArrowRedoOutline,
  IoArrowUndoOutline,
  IoDocumentOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { SplitPane } from '../desktop/SplitPane'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { IconButton } from '../components/IconButton'
import { List, ListRow } from '../components/List'
import { SearchField } from '../components/SearchField'
import { Separator } from '../components/Separator'
import { Text } from '../components/Text'
import { Toolbar, ToolbarSpacer } from '../components/Toolbar'
import { VisuallyHidden } from '../components/VisuallyHidden'
import './SplitInboxScreen.css'

/**
 * Mail's desktop shape: a message list beside the message it is showing.
 *
 * The whole screen is one `SplitPane`, which takes exactly two children and
 * nothing else — the sized pane, then the pane that takes the rest. Both panes
 * scroll themselves, so each child is `height: 100%` with its own internal
 * scroller; that keeps the search field and the reply toolbar pinned without a
 * single `position: sticky` anywhere.
 */

interface Message {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  unread: boolean
}

const MESSAGES: Message[] = [
  {
    id: 'm1',
    from: 'Ada Lovelace',
    subject: 'Depth sensor calibration, second pass',
    preview: 'The drift is down to 0.4 mm at two metres. Numbers attached.',
    time: '9:41 AM',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Grace Hopper',
    subject: 'Compiler timings for the 3.2 branch',
    preview: 'Clean build is 4:12, incremental 38s. The linker is the long pole.',
    time: '8:15 AM',
    unread: true,
  },
  {
    id: 'm3',
    from: 'App Store Connect',
    subject: 'TestFlight build 412 is ready to test',
    preview: 'Version 3.2 (412) has completed processing and is available.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'm4',
    from: 'Katherine Johnson',
    subject: 'Trajectory review moved to Thursday',
    preview: 'Room 4 was double-booked. Same agenda, one day later.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'm5',
    from: 'Margaret Hamilton',
    subject: 'Priority display: error 1202 write-up',
    preview: 'Short version — the restart logic did exactly what it should.',
    time: 'Tuesday',
    unread: false,
  },
  {
    id: 'm6',
    from: 'Radia Perlman',
    subject: 'Re: spanning tree draft',
    preview: 'Section 3 reads much better. One nit about the tie-break rule.',
    time: 'Tuesday',
    unread: false,
  },
  {
    id: 'm7',
    from: 'Design Systems',
    subject: 'Weekly digest — 14 components shipped',
    preview: 'SegmentedControl now drags its thumb. Full notes inside.',
    time: 'Monday',
    unread: false,
  },
  {
    id: 'm8',
    from: 'iCloud',
    subject: 'Your storage is almost full',
    preview: '196.4 GB of 200 GB used. Upgrade or free up space.',
    time: '8 Sept',
    unread: false,
  },
]

const BODY = [
  'Ran the 3.2 branch through the build farm overnight — three machines, five runs each, so the numbers below are medians rather than best-of.',
  'Clean build is 4:12, down from 5:38 on 3.1. Incremental is 38 seconds and almost all of that is the linker: it alone accounts for 31 of the 38, and it has not moved since March. I have a patch that splits the symbol table work across cores and takes it to 12 seconds, but it wants a careful review before Friday.',
  'The remaining seven seconds are spread thin enough that I would leave them alone this cycle. Full per-target breakdown is in the attachment.',
]

export function SplitInboxScreen() {
  const [selectedId, setSelectedId] = useState('m2')
  const [query, setQuery] = useState('')

  const visible = MESSAGES.filter((message) =>
    `${message.from} ${message.subject} ${message.preview}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  const selected = MESSAGES.find((message) => message.id === selectedId) ?? MESSAGES[0]!
  const unreadCount = MESSAGES.filter((message) => message.unread).length

  return (
    <div
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <SplitPane
        defaultSize={320}
        min={260}
        max={440}
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* -------------------------- the message list -------------------------- */}
        <div style={paneStyle}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--may-space-3)',
              padding: 'var(--may-space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-2)' }}>
              <Text as="span" variant="headline">
                Inbox
              </Text>
              {/* A count badge collapses to a circle at one digit and grows into
                  a pill as digits arrive — no width to guess at. */}
              <Badge count={unreadCount} />
              <Text
                as="span"
                variant="footnote"
                tone="tertiary"
                style={{ marginInlineStart: 'auto' }}
              >
                {MESSAGES.length} messages
              </Text>
            </div>
            <SearchField
              fullWidth
              size="sm"
              placeholder="Search"
              value={query}
              onValueChange={setQuery}
              aria-label="Search inbox"
            />
          </div>

          <Separator />

          <div data-slot="scroll-area" style={scrollerStyle}>
            {/* `plain` rather than `inset`: a list that fills a pane edge to edge
                has no card around it, the way Mail's sidebar does not. */}
            <List variant="plain">
              {visible.map((message) => (
                <ListRow
                  key={message.id}
                  className="may-inbox__row"
                  aria-current={message.id === selectedId ? 'true' : undefined}
                  leading={<UnreadDot unread={message.unread} />}
                  title={message.from}
                  subtitle={message.subject}
                  detail={message.time}
                  chevron={false}
                  onClick={() => setSelectedId(message.id)}
                />
              ))}
            </List>
          </div>
        </div>

        {/* ------------------------- the reading pane -------------------------- */}
        <div style={paneStyle}>
          <div data-slot="scroll-area" style={{ ...scrollerStyle, padding: 'var(--may-space-6)' }}>
            <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--may-space-3)',
                  paddingBlockEnd: 'var(--may-space-5)',
                }}
              >
                {/* No `src`, so Avatar derives both the initials and a stable
                    hue from the name — the same person is the same colour on
                    every screen in the app. */}
                <Avatar name={selected.from} size="lg" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="headline">{selected.from}</Text>
                  <Text variant="footnote" tone="secondary" clamp={1}>
                    To: Ada Lovelace, Margaret Hamilton, 2 others
                  </Text>
                </div>
                <Text as="span" variant="footnote" tone="tertiary">
                  Today at {selected.time}
                </Text>
              </div>

              <Text variant="title-3">{selected.subject}</Text>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--may-space-4)',
                  paddingBlockStart: 'var(--may-space-4)',
                }}
              >
                {BODY.map((paragraph) => (
                  <Text key={paragraph.slice(0, 24)} variant="body" tone="secondary">
                    {paragraph}
                  </Text>
                ))}
                <Text variant="body" tone="secondary">
                  — Grace
                </Text>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--may-space-2)',
                  marginBlockStart: 'var(--may-space-6)',
                  padding: 'var(--may-space-2) var(--may-space-3)',
                  borderRadius: 'var(--may-radius-md)',
                  background: 'var(--may-color-fill-quaternary)',
                }}
              >
                <IoDocumentOutline
                  aria-hidden
                  style={{
                    width: 'var(--may-space-4)',
                    height: 'var(--may-space-4)',
                    flexShrink: 0,
                    color: 'var(--may-color-text-tertiary)',
                  }}
                />
                <Text as="span" variant="footnote">
                  build-timings-3.2.csv
                </Text>
                <Text as="span" variant="footnote" tone="tertiary">
                  48 KB
                </Text>
              </div>
            </div>
          </div>

          {/* Bottom-placed, so the hairline lands on the edge it borders. Not
              `sticky` — the pane's scroller is the sibling above, and the bar is
              already outside it. The spacer pushes the one destructive action
              away from the three you reach for by reflex. */}
          <Toolbar placement="bottom" align="start" separator>
            <IconButton aria-label="Reply" onClick={() => {}}>
              <IoArrowUndoOutline aria-hidden />
            </IconButton>
            <IconButton aria-label="Forward" onClick={() => {}}>
              <IoArrowRedoOutline aria-hidden />
            </IconButton>
            <IconButton aria-label="Archive" onClick={() => {}}>
              <IoArchiveOutline aria-hidden />
            </IconButton>
            <ToolbarSpacer />
            <IconButton aria-label="Move to Bin" tone="danger" onClick={() => {}}>
              <IoTrashOutline aria-hidden />
            </IconButton>
          </Toolbar>
        </div>
      </SplitPane>
    </div>
  )
}

/* ------------------------------ pane scaffolding ---------------------------- */

/**
 * Each SplitPane pane is already `overflow: auto`. Filling it exactly — never
 * more — hands the scrolling to the inner region below, which is what lets the
 * search header and the toolbar stay put while only the middle moves.
 */
const paneStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  minWidth: 0,
  background: 'var(--may-color-surface)',
} as const

const scrollerStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
} as const

/**
 * Mail's unread dot, in a gutter.
 *
 * Two things are deliberate. The slot is rendered for every row, empty or not,
 * so the sender names of read and unread messages sit on one axis. And the
 * gutter is a full `space-8` wide rather than the width of the dot: List insets
 * the hairline between rows past a leading element by the width of an app-icon
 * tile, so a leading element narrower than that leaves the rule starting to the
 * right of the label it is supposed to run under.
 */
function UnreadDot({ unread }: { unread: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        width: 'var(--may-space-8)',
      }}
    >
      {unread && (
        <>
          <Badge dot aria-hidden />
          <VisuallyHidden>Unread</VisuallyHidden>
        </>
      )}
    </span>
  )
}
