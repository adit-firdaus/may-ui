import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { TabBar } from './TabBar'
import { List, ListRow } from '../../components/List'

const meta = {
  title: 'Catalog/Mobile/TabBar',
  component: TabBar,
  args: {
    items: [
      { value: 'library', label: 'Library', icon: <LibraryIcon />, activeIcon: <LibraryIcon filled /> },
      { value: 'for-you', label: 'For You', icon: <HeartIcon />, activeIcon: <HeartIcon filled /> },
      { value: 'albums', label: 'Albums', icon: <AlbumsIcon />, activeIcon: <AlbumsIcon filled /> },
      { value: 'search', label: 'Search', icon: <SearchIcon /> },
    ],
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Photos' four tabs. Tapping one pops its glyph — the dip and overshoot ride
 * `--may-spring-bouncy`, and it replays on every tap, including a tap on the
 * tab you are already on.
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('library')
    return (
      <Phone>
        <Screen title="Library" caption="12,481 photos · 214 videos" />
        <TabBar {...args} value={value} onValueChange={setValue} />
      </Phone>
    )
  },
}

/**
 * Mail. A count hangs off the glyph's corner and rides the pop with it; the
 * `dot` form says "something new" without claiming a number.
 */
export const Badges: Story = {
  args: {
    items: [
      { value: 'mailboxes', label: 'Mailboxes', icon: <InboxIcon />, activeIcon: <InboxIcon filled />, badge: 12 },
      { value: 'vip', label: 'VIP', icon: <StarIcon />, activeIcon: <StarIcon filled />, dot: true },
      { value: 'flagged', label: 'Flagged', icon: <FlagIcon />, activeIcon: <FlagIcon filled />, badge: 128 },
      { value: 'search', label: 'Search', icon: <SearchIcon /> },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState('mailboxes')
    return (
      <Phone>
        <Screen title="Mailboxes" caption="Updated Just Now" />
        <TabBar {...args} value={value} onValueChange={setValue} />
      </Phone>
    )
  },
}

/** Labels off — iOS's compact bar. The glyphs take back the space the labels gave up. */
export const IconsOnly: Story = {
  render: (args) => {
    const [value, setValue] = useState('albums')
    return (
      <Phone>
        <Screen title="Albums" caption="Recents, Favourites, People" />
        <TabBar {...args} labels={false} value={value} onValueChange={setValue} />
      </Phone>
    )
  },
}

/**
 * Each system app tints its own bar — Fitness is green, Music is pink. The tone
 * sets one variable; nothing in the item rules changes.
 */
export const Tones: Story = {
  args: {
    items: [
      { value: 'summary', label: 'Summary', icon: <RingsIcon />, activeIcon: <RingsIcon filled /> },
      { value: 'fitness', label: 'Fitness+', icon: <HeartIcon />, activeIcon: <HeartIcon filled /> },
      { value: 'sharing', label: 'Sharing', icon: <PeopleIcon />, activeIcon: <PeopleIcon filled /> },
    ],
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-5)' }}>
      {(['tint', 'success', 'danger'] as const).map((tone) => (
        <div
          key={tone}
          style={{
            width: 320,
            overflow: 'hidden',
            borderRadius: 'var(--may-radius-card)',
            boxShadow: 'var(--may-shadow-md)',
          }}
        >
          <TabBar {...args} tone={tone} fixed={false} defaultValue="summary" aria-label={`Fitness (${tone})`} />
        </div>
      ))}
    </div>
  ),
}

/**
 * The bar over a scrolling screen. It is opaque, because this system has no
 * blur to hide behind — and the last row still clears it, since the scroller
 * pads itself by the bar's height plus the home indicator.
 */
export const OverAScrollingScreen: Story = {
  args: {
    items: [
      { value: 'today', label: 'Today', icon: <TodayIcon />, activeIcon: <TodayIcon filled /> },
      { value: 'games', label: 'Games', icon: <GamesIcon />, activeIcon: <GamesIcon filled /> },
      { value: 'apps', label: 'Apps', icon: <AlbumsIcon />, activeIcon: <AlbumsIcon filled /> },
      { value: 'arcade', label: 'Arcade', icon: <RingsIcon />, badge: 3 },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState('today')
    return (
      <Phone>
        <div
          data-slot="scroll-area"
          style={{
            height: '100%',
            overflowY: 'auto',
            padding: 'var(--may-space-4)',
            paddingBottom: 'calc(var(--may-tabbar-h) + var(--may-space-8))',
          }}
        >
          <List header="Updated Today">
            {['Things 3', 'Overcast', 'Halide', 'Bear', 'Dark Noise', 'Streaks', 'Carrot Weather'].map(
              (app) => (
                <ListRow key={app} title={app} detail="Update" onClick={() => {}} />
              ),
            )}
          </List>
        </div>
        <TabBar {...args} value={value} onValueChange={setValue} />
      </Phone>
    )
  },
}

/* --------------------------------- frame ---------------------------------- */

/**
 * A phone-sized viewport. The transform is load-bearing: it makes the frame the
 * containing block for the bar's `position: fixed`, so the default `fixed`
 * pins to this frame rather than to the Storybook page.
 */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        transform: 'translateZ(0)',
        display: 'flex',
        flexDirection: 'column',
        width: 340,
        height: 560,
        overflow: 'hidden',
        borderRadius: 'var(--may-radius-sheet)',
        background: 'var(--may-color-bg)',
        boxShadow: 'var(--may-shadow-lg)',
      }}
    >
      {children}
    </div>
  )
}

function Screen({ title, caption }: { title: string; caption: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--may-space-1)',
      }}
    >
      <span style={{ fontSize: 'var(--may-text-title-2)', fontWeight: 'var(--may-text-title-2-weight)' }}>
        {title}
      </span>
      <span style={{ fontSize: 'var(--may-text-footnote)', color: 'var(--may-color-text-secondary)' }}>
        {caption}
      </span>
    </div>
  )
}

/* --------------------------------- glyphs --------------------------------- */

/*
 * Outline and filled in one component: iOS swaps the glyph's weight on
 * selection, and drawing both from the same path keeps them registered.
 */
const outline = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

type Glyph = { filled?: boolean }

const paint = (filled?: boolean) => (filled ? { fill: 'currentColor', stroke: 'none' } : outline)

function LibraryIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" {...paint(filled)} />
      <path d="M3.5 15l4-4 3.5 3.5L14.5 11l6 6" {...outline} stroke={filled ? 'none' : 'currentColor'} />
    </svg>
  )
}

function HeartIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 19.5c-.6 0-7.5-4.3-7.5-9.2A4.3 4.3 0 0112 8.2a4.3 4.3 0 017.5 2.1c0 4.9-6.9 9.2-7.5 9.2z"
        {...paint(filled)}
      />
    </svg>
  )
}

function AlbumsIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="7.5" width="8" height="8" rx="2" {...paint(filled)} />
      <rect x="12.5" y="7.5" width="8" height="8" rx="2" {...paint(filled)} />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="6" {...outline} />
      <path d="M15.5 15.5L20 20" {...outline} />
    </svg>
  )
}

function InboxIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="6" width="17" height="12" rx="3" {...paint(filled)} />
      <path d="M4 8.5l8 5 8-5" {...outline} stroke={filled ? 'var(--may-color-surface)' : 'currentColor'} />
    </svg>
  )
}

function StarIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 10.2l5.4-.8z" {...paint(filled)} />
    </svg>
  )
}

function FlagIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M6 20V5" {...outline} />
      <path d="M6 5.5h11l-2.5 4 2.5 4H6z" {...paint(filled)} />
    </svg>
  )
}

function RingsIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="7.5" {...outline} />
      <circle cx="12" cy="12" r="3.5" {...paint(filled)} />
    </svg>
  )
}

function PeopleIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" {...paint(filled)} />
      <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" {...outline} />
    </svg>
  )
}

function TodayIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="3" {...paint(filled)} />
      <path d="M8 3.5v3M16 3.5v3" {...outline} />
    </svg>
  )
}

function GamesIcon({ filled }: Glyph) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M7.5 8.5h9a4 4 0 013.9 4.9l-.5 2.1a2.6 2.6 0 01-4.7.9L14 15h-4l-1.2 1.4a2.6 2.6 0 01-4.7-.9l-.5-2.1a4 4 0 013.9-4.9z" {...paint(filled)} />
    </svg>
  )
}
