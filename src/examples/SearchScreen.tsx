import type { ComponentType } from 'react'
import { useState } from 'react'
import {
  IoLeaf,
  IoMic,
  IoMoon,
  IoMusicalNotes,
  IoSearchOutline,
  IoTimeOutline,
} from 'react-icons/io5'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { Separator } from '../components/Separator'
import { Stack } from '../components/Stack'
import { Tag } from '../components/Tag'
import { Text } from '../components/Text'
import { CapsuleTabs } from '../mobile/CapsuleTabs'
import { SearchBar } from '../mobile/SearchBar'

/**
 * The App Store's search tab, mid-query.
 *
 * The header does not scroll: `SearchBar` and `CapsuleTabs` sit outside the
 * overflow element, so the query and the filters stay put while the results
 * move under them. That split is the whole layout — a flex column whose header
 * is `flex: 0 0 auto` and whose scroller is `flex: 1 1 auto; min-height: 0`.
 * Without that `min-height: 0` the scroller refuses to shrink below its
 * content and the page scrolls instead of the list, which is the single most
 * common way a phone layout goes wrong.
 *
 * `showCancel="always"` is right here and nowhere else: this screen exists to
 * be a search, so the way out of it must be visible before the field is
 * touched. Everywhere else Cancel arrives on focus.
 */
export function SearchScreen() {
  const [query, setQuery] = useState('sleep')
  const [tab, setTab] = useState('top')
  const [recents, setRecents] = useState(RECENTS)

  const results = tab === 'top' ? RESULTS : RESULTS.filter((r) => r.kind === tab)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      {/* ------------------------------- header -------------------------------- */}
      <div
        style={{
          flex: '0 0 auto',
          paddingBlockStart: 'var(--may-inset-top)',
          background: 'var(--may-color-surface)',
        }}
      >
        <SearchBar
          value={query}
          onValueChange={setQuery}
          onCancel={() => setQuery('')}
          showCancel="always"
          align="leading"
          placeholder="Games, Apps, Stories and More"
          aria-label="Search the App Store"
        />

        <CapsuleTabs
          value={tab}
          onValueChange={setTab}
          variant="tinted"
          size="sm"
          aria-label="Result kind"
          items={[
            { value: 'top', label: 'Top' },
            { value: 'app', label: 'Apps', count: 24 },
            { value: 'music', label: 'Music', count: 9 },
            { value: 'podcast', label: 'Podcasts', count: 6 },
          ]}
        />
      </div>

      {/* ------------------------------ results -------------------------------- */}
      <div
        data-slot="scroll-area"
        style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}
      >
        <Stack
          gap={5}
          style={{
            padding: 'var(--may-space-4)',
            // Clears the home indicator without swallowing the page gutter.
            paddingBlockEnd: 'calc(var(--may-inset-bottom) + var(--may-space-4))',
          }}
        >
          {/*
           * Recent searches are `Tag`s rather than rows: a chip wraps, a row
           * does not, and five past queries of two or three words each have to
           * wrap. `onRemove` is what makes a chip a chip — without it this is a
           * static label and iOS would not have drawn an X on it. Remove the
           * last one and the whole section goes with it, header included.
           */}
          {recents.length > 0 && (
            <Stack gap={2}>
              <Text variant="footnote" tone="secondary" weight="semibold">
                RECENT
              </Text>
              <Stack direction="row" gap={2} wrap>
                {recents.map((term) => (
                  <Tag
                    key={term}
                    size="sm"
                    leadingIcon={<ClockIcon />}
                    onRemove={() => setRecents((list) => list.filter((t) => t !== term))}
                  >
                    {term}
                  </Tag>
                ))}
              </Stack>
            </Stack>
          )}

          {/*
           * An app row carries a GET button, so it must NOT also carry
           * `onClick`: an interactive ListRow renders a real `<button>`, and a
           * button inside a button is invalid HTML that no browser recovers
           * from cleanly. `accessory` also suppresses the chevron, which is
           * exactly right — the row's action is the download, not a push.
           */}
          <List header={`Results for “${query}”`}>
            {results.map((r) => (
              <ListRow
                key={r.title}
                leading={
                  <IconTile gradient={r.gradient} size="md">
                    <r.icon />
                  </IconTile>
                }
                title={r.title}
                subtitle={r.subtitle}
                detail={r.kind === 'app' ? undefined : r.detail}
                accessory={
                  r.kind === 'app' ? (
                    <Button variant="tinted" size="xs" pill>
                      GET
                    </Button>
                  ) : undefined
                }
                onClick={r.kind === 'app' ? undefined : () => {}}
              />
            ))}
          </List>

          {/*
           * The same screen's other half, shown inline so the pair can be read
           * together: a labelled Separator is the documentation device, not
           * part of the pattern.
           */}
          <Separator label="No results state" />

          <EmptyState
            glyph={<MagnifierIcon />}
            title="No Results for “sleepmaxxing”"
            description="Check the spelling, or try searching for a category such as Health & Fitness."
            action={
              <Button variant="gray" size="sm" pill>
                Clear Search
              </Button>
            }
          />
        </Stack>
      </div>
    </div>
  )
}

/* --------------------------------- content --------------------------------- */

const RECENTS = ['sleep cycle', 'white noise', 'procreate', 'dark noise', 'strava']

interface Result {
  kind: 'app' | 'music' | 'podcast'
  title: string
  subtitle: string
  /** Trailing value. Apps use the GET button instead. */
  detail?: string
  gradient: 'indigo' | 'teal' | 'pink' | 'purple' | 'orange'
  icon: ComponentType
}

const RESULTS: Result[] = [
  {
    kind: 'app',
    title: 'Sleep Cycle',
    subtitle: 'Health & Fitness · 4.7 ★ · In-App Purchases',
    gradient: 'indigo',
    icon: MoonIcon,
  },
  {
    kind: 'app',
    title: 'Calm',
    subtitle: 'Health & Fitness · 4.8 ★ · 512.4 MB',
    gradient: 'teal',
    icon: LeafIcon,
  },
  {
    kind: 'music',
    title: 'Weightless',
    subtitle: 'Song · Marconi Union',
    detail: '8:08',
    gradient: 'pink',
    icon: NoteIcon,
  },
  {
    kind: 'podcast',
    title: 'Nothing Much Happens',
    subtitle: 'Podcast · Kathryn Nicolai',
    detail: 'Mondays',
    gradient: 'purple',
    icon: MicIcon,
  },
  {
    kind: 'podcast',
    title: 'Sleep With Me',
    subtitle: 'Podcast · Night Vale Presents',
    detail: 'Thursdays',
    gradient: 'orange',
    icon: MicIcon,
  },
]

/* -------------------------------- glyph set -------------------------------- */

function ClockIcon() {
  return <IoTimeOutline aria-hidden />
}

function MoonIcon() {
  return <IoMoon aria-hidden />
}

function LeafIcon() {
  return <IoLeaf aria-hidden />
}

function NoteIcon() {
  return <IoMusicalNotes aria-hidden />
}

function MicIcon() {
  return <IoMic aria-hidden />
}

function MagnifierIcon() {
  return <IoSearchOutline aria-hidden />
}
