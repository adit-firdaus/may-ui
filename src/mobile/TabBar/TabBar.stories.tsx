import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  IoAlbums,
  IoAlbumsOutline,
  IoFlag,
  IoFlagOutline,
  IoGameController,
  IoGameControllerOutline,
  IoHeart,
  IoHeartOutline,
  IoImages,
  IoImagesOutline,
  IoMail,
  IoMailOutline,
  IoPeople,
  IoPeopleOutline,
  IoSearchOutline,
  IoStar,
  IoStarOutline,
  IoToday,
  IoTodayOutline,
} from 'react-icons/io5'
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
  return filled ? <IoImages aria-hidden /> : <IoImagesOutline aria-hidden />
}

function HeartIcon({ filled }: Glyph) {
  return filled ? <IoHeart aria-hidden /> : <IoHeartOutline aria-hidden />
}

function AlbumsIcon({ filled }: Glyph) {
  return filled ? <IoAlbums aria-hidden /> : <IoAlbumsOutline aria-hidden />
}

function SearchIcon() {
  return <IoSearchOutline aria-hidden />
}

function InboxIcon({ filled }: Glyph) {
  return filled ? <IoMail aria-hidden /> : <IoMailOutline aria-hidden />
}

function StarIcon({ filled }: Glyph) {
  return filled ? <IoStar aria-hidden /> : <IoStarOutline aria-hidden />
}

function FlagIcon({ filled }: Glyph) {
  return filled ? <IoFlag aria-hidden /> : <IoFlagOutline aria-hidden />
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
  return filled ? <IoPeople aria-hidden /> : <IoPeopleOutline aria-hidden />
}

function TodayIcon({ filled }: Glyph) {
  return filled ? <IoToday aria-hidden /> : <IoTodayOutline aria-hidden />
}

function GamesIcon({ filled }: Glyph) {
  return filled ? <IoGameController aria-hidden /> : <IoGameControllerOutline aria-hidden />
}
