import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  IoAlbums,
  IoAlbumsOutline,
  IoBriefcase,
  IoCar,
  IoEllipsisHorizontal,
  IoFlag,
  IoGrid,
  IoGridOutline,
  IoHeart,
  IoHeartOutline,
  IoLinkOutline,
  IoMail,
  IoMoon,
  IoPerson,
  IoRadioButtonOn,
  IoSearchOutline,
  IoTime,
} from 'react-icons/io5'
import { Badge } from '../components/Badge'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Grid } from '../components/Grid'
import { IconButton } from '../components/IconButton'
import { List, ListRow } from '../components/List'
import { Text } from '../components/Text'
import { CapsuleTabs } from '../mobile/CapsuleTabs'
import { FloatingBubble } from '../mobile/FloatingBubble'
import { NavBar } from '../mobile/NavBar'
import { Popup } from '../mobile/Popup'
import { PullToRefresh } from '../mobile/PullToRefresh'
import { SearchBar } from '../mobile/SearchBar'
import { Selector } from '../mobile/Selector'
import { SwipeAction } from '../mobile/SwipeAction'
import { TabBar } from '../mobile/TabBar'
import './CatalogMobile.css'

/**
 * Every component in `mayui/mobile`, once, on one page.
 *
 * Nine components, in the state each one ships in — not nine demos of what
 * each one can be talked into. The page exists to answer a question no
 * per-component story can: do these belong to each other? Read down it and the
 * family should look like one designer drew it on one afternoon; the moment a
 * component reads as a guest here, that is the finding.
 *
 * Three things about the layout are decisions rather than styling.
 *
 * The bars go in frames. TabBar is `position: fixed` by default, NavBar is
 * sticky, and Popup's scrim is fixed — none of them means anything without
 * something to be fixed *to*, so each sits in a tile carrying
 * `transform: translateZ(0)` and real `--may-inset-*` values. Shown loose on a
 * page they would pin to the browser window and the catalog would be a lie.
 *
 * FloatingBubble gets the opposite treatment, and its tile is the only one
 * with no transform anywhere in it. The bubble is fixed against the *display*
 * on purpose — that is what an AssistiveTouch bubble is — so framing it would
 * hide the one behaviour worth judging. It parks on the window's edge instead,
 * over this page, which is exactly where it would park over an app.
 *
 * And Popup is behind a tap rather than open on arrival. An always-open sheet
 * would hold the focus trap and the body scroll lock for the whole catalog:
 * every other component below it would be unreachable by keyboard. A modal's
 * honest resting state is closed.
 */
export function CatalogMobile() {
  /* One piece of state per interactive entry — nothing is shared, because on a
   * catalog page two components moving together would read as coupling. */
  const [tab, setTab] = useState('listen-now')
  const [filter, setFilter] = useState('apps')
  const [focus, setFocus] = useState('work')
  const [share, setShare] = useState(false)
  const [query, setQuery] = useState('')
  const [updated, setUpdated] = useState('Updated 12 minutes ago')
  const [mail, setMail] = useState(MAIL)
  const [swipeNote, setSwipeNote] = useState('Swipe a row: Read leads, Flag and Remind trail.')

  const setRead = (id: string, read: boolean) =>
    setMail((rows) => rows.map((m) => (m.id === id ? { ...m, unread: !read } : m)))

  const toggleFlag = (id: string) =>
    setMail((rows) => rows.map((m) => (m.id === id ? { ...m, flagged: !m.flagged } : m)))

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
      <div
        data-slot="scroll-area"
        style={{ flex: 1, overflowY: 'auto', padding: 'var(--may-space-6) var(--may-space-5)' }}
      >
        <div
          style={{
            maxWidth: '78rem',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-6)',
          }}
        >
          <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
            <Text as="h1" variant="large-title">
              Mobile Family
            </Text>
            <Text variant="subheadline" tone="secondary">
              The nine components that exist only on the phone, each once, in the state it ships
              in. Three sit in miniature phones because their position is fixed to a screen; one
              sits in an unframed box because its position is fixed to the display on purpose.
            </Text>
          </header>

          <Grid minColumnWidth="21rem" gap={5}>
            {/* ------------------------------- NavBar ------------------------ */}

            <Entry name="NavBar" note="Sticky by default — it sticks to the frame's own scroller.">
              <div className="may-catalog-mobile__frame">
                <div className="may-catalog-mobile__frame-scroll" data-slot="scroll-area">
                  <NavBar
                    title="Kyoto, October"
                    backLabel="Albums"
                    onBack={() => {}}
                    trailing={
                      <IconButton aria-label="More actions" size="sm">
                        <EllipsisIcon />
                      </IconButton>
                    }
                  />
                  <div style={{ padding: 'var(--may-space-3)' }}>
                    <List header="Recents">
                      <ListRow title="IMG_4417.HEIC" detail="3.8 MB" onClick={() => {}} />
                      <ListRow title="IMG_4418.HEIC" detail="4.1 MB" onClick={() => {}} />
                      <ListRow title="Fushimi Inari.MOV" detail="182.6 MB" onClick={() => {}} />
                      <ListRow title="IMG_4431.HEIC" detail="3.6 MB" onClick={() => {}} />
                      <ListRow title="Nishiki Market.MOV" detail="96.4 MB" onClick={() => {}} />
                    </List>
                  </div>
                </div>
              </div>
            </Entry>

            {/* ------------------------------- TabBar ------------------------ */}

            <Entry name="TabBar" note="Fixed by default — it pins to the frame's bottom edge.">
              <div className="may-catalog-mobile__frame">
                <div
                  className="may-catalog-mobile__frame-scroll"
                  data-slot="scroll-area"
                  style={{
                    paddingBlockStart: 'calc(var(--may-inset-top) + var(--may-space-2))',
                    /* Room for the bar the content scrolls under, plus the home
                     * indicator it pads itself for. */
                    paddingBlockEnd:
                      'calc(var(--may-tabbar-h) + var(--may-inset-bottom) + var(--may-space-4))',
                    paddingInline: 'var(--may-space-3)',
                  }}
                >
                  <List header="Recently Added">
                    <ListRow
                      title="Songs of a Lost World"
                      subtitle="The Cure"
                      onClick={() => {}}
                    />
                    <ListRow title="Wall of Eyes" subtitle="The Smile" onClick={() => {}} />
                    <ListRow title="Bright Future" subtitle="Adrianne Lenker" onClick={() => {}} />
                  </List>
                </div>

                <TabBar
                  value={tab}
                  onValueChange={setTab}
                  items={[
                    {
                      value: 'listen-now',
                      label: 'Listen Now',
                      icon: <HeartIcon />,
                      activeIcon: <HeartIcon filled />,
                    },
                    {
                      value: 'browse',
                      label: 'Browse',
                      icon: <GridIcon />,
                      activeIcon: <GridIcon filled />,
                      dot: true,
                    },
                    {
                      value: 'library',
                      label: 'Library',
                      icon: <LibraryIcon />,
                      activeIcon: <LibraryIcon filled />,
                    },
                    { value: 'search', label: 'Search', icon: <MagnifierIcon /> },
                  ]}
                />
              </div>
            </Entry>

            {/* -------------------------------- Popup ------------------------ */}

            <Entry name="Popup" note="Modal, so it rests closed: an open sheet holds the focus trap.">
              <div className="may-catalog-mobile__frame">
                <div
                  className="may-catalog-mobile__frame-scroll"
                  data-slot="scroll-area"
                  style={{
                    paddingBlockStart: 'calc(var(--may-inset-top) + var(--may-space-2))',
                    paddingInline: 'var(--may-space-3)',
                  }}
                >
                  <List header="Shared Album" footer="Anyone with the link can add photos.">
                    <ListRow title="Kyoto 2024" subtitle="214 photos · 18 videos" />
                    <ListRow title="halide.cam/g/kyoto-2024" subtitle="Public link · expires 1 Nov" />
                  </List>

                  <div style={{ paddingBlock: 'var(--may-space-4)' }}>
                    <Button
                      variant="tinted"
                      fullWidth
                      leadingIcon={<LinkIcon />}
                      onClick={() => setShare(true)}
                    >
                      Share Link
                    </Button>
                  </div>
                </div>

                <Popup visible={share} onClose={() => setShare(false)} title="Share Link">
                  <List variant="plain">
                    <ListRow title="AirDrop" subtitle="Marina’s MacBook Pro" onClick={() => setShare(false)} />
                    <ListRow title="Copy Link" onClick={() => setShare(false)} />
                    <ListRow title="Add to Shared Album" onClick={() => setShare(false)} />
                    <ListRow title="Stop Sharing" destructive onClick={() => setShare(false)} />
                  </List>
                </Popup>
              </div>
            </Entry>

            {/* ------------------------------ SearchBar ---------------------- */}

            <Entry name="SearchBar" note="Resting state: the magnifier centred, Cancel not yet earned.">
              <div className="may-catalog-mobile__strip">
                <SearchBar
                  value={query}
                  onValueChange={setQuery}
                  onCancel={() => setQuery('')}
                  placeholder="Games, Apps, Stories and More"
                  aria-label="Search the App Store"
                />
              </div>
            </Entry>

            {/* ----------------------------- CapsuleTabs --------------------- */}

            <Entry name="CapsuleTabs" note="A scrolling filter strip — the selected capsule rides a sliding thumb.">
              <div className="may-catalog-mobile__strip">
                <CapsuleTabs
                  value={filter}
                  onValueChange={setFilter}
                  aria-label="Result kind"
                  items={[
                    { value: 'all', label: 'All' },
                    { value: 'apps', label: 'Apps', count: 24 },
                    { value: 'games', label: 'Games', count: 8 },
                    { value: 'arcade', label: 'Arcade' },
                    { value: 'stories', label: 'Stories' },
                  ]}
                />
              </div>
            </Entry>

            {/* ------------------------------ Selector ----------------------- */}

            <Entry name="Selector" note="Cards, two up: every choice visible and one tap away.">
              <div className="may-catalog-mobile__strip">
                <Selector
                  value={focus}
                  onChange={setFocus}
                  aria-label="Focus"
                  columns={2}
                  options={[
                    { value: 'personal', label: 'Personal', icon: <PersonIcon /> },
                    { value: 'work', label: 'Work', icon: <BriefcaseIcon /> },
                    { value: 'sleep', label: 'Sleep', icon: <MoonIcon /> },
                    { value: 'driving', label: 'Driving', icon: <CarIcon /> },
                  ]}
                />
              </div>
            </Entry>

            {/* ---------------------------- SwipeAction ---------------------- */}

            <Entry name="SwipeAction" note="Drag a row: the first item on a side is the one a full swipe fires.">
              <div className="may-catalog-mobile__strip">
                <List header="Inbox" footer={swipeNote}>
                  {mail.map((message) => (
                    <SwipeAction
                      key={message.id}
                      leading={[
                        {
                          label: message.unread ? 'Read' : 'Unread',
                          tone: 'tint',
                          icon: <EnvelopeIcon />,
                          onSelect: () => setRead(message.id, message.unread),
                        },
                      ]}
                      trailing={[
                        {
                          label: message.flagged ? 'Unflag' : 'Flag',
                          tone: 'warning',
                          icon: <FlagIcon />,
                          onSelect: () => toggleFlag(message.id),
                        },
                        {
                          label: 'Remind',
                          tone: 'neutral',
                          icon: <ClockIcon />,
                          onSelect: () => setSwipeNote('Reminded tomorrow at 9:00 AM.'),
                        },
                      ]}
                    >
                      <ListRow
                        title={message.from}
                        subtitle={message.subject}
                        detail={message.at}
                        /* A fixed-width status gutter on every row, empty once
                         * read — it is what keeps the senders on one line. */
                        leading={
                          <span
                            style={{
                              width: 'var(--may-space-3)',
                              display: 'inline-flex',
                              justifyContent: 'center',
                            }}
                          >
                            {message.unread && <Badge dot aria-label="Unread" />}
                            {!message.unread && message.flagged && (
                              <Badge dot tone="warning" aria-label="Flagged" />
                            )}
                          </span>
                        }
                        onClick={() => setRead(message.id, true)}
                      />
                    </SwipeAction>
                  ))}
                </List>
              </div>
            </Entry>

            {/* --------------------------- PullToRefresh --------------------- */}

            <Entry name="PullToRefresh" note="It owns its scroller, so it is given a bounded height and fills it.">
              <div className="may-catalog-mobile__scroller">
                <PullToRefresh
                  style={{ height: '100%' }}
                  onRefresh={async () => {
                    /* A promise, not a duration: the ring holds until the work
                     * settles, which is the difference between a spinner and a
                     * progress report. */
                    await new Promise((resolve) => setTimeout(resolve, 1200))
                    setUpdated('Updated Just Now')
                  }}
                >
                  <div style={{ padding: 'var(--may-space-3)' }}>
                    <List header="Available Updates" footer={updated}>
                      <ListRow title="Halide Mark II" subtitle="Version 4.1.3 · 84.2 MB" detail="Update" onClick={() => {}} />
                      <ListRow title="Overcast" subtitle="Version 2024.9 · 21.6 MB" detail="Update" onClick={() => {}} />
                      <ListRow title="Things 3" subtitle="Version 3.20.4 · 39.1 MB" detail="Update" onClick={() => {}} />
                    </List>
                  </div>
                </PullToRefresh>
              </div>
            </Entry>

            {/* --------------------------- FloatingBubble -------------------- */}

            <Entry
              name="FloatingBubble"
              note="Unframed on purpose: it is fixed to the viewport, so it parks on the window's edge, not this box's."
            >
              <div className="may-catalog-mobile__untransformed">
                <List header="Accessibility" footer="Throw the bubble at either edge of the window.">
                  <ListRow title="AssistiveTouch" detail="On" onClick={() => {}} />
                  <ListRow title="Back Tap" detail="Screenshot" onClick={() => {}} />
                  <ListRow title="Reachability" detail="On" onClick={() => {}} />
                </List>

                <FloatingBubble icon={<RingIcon />} aria-label="AssistiveTouch" />
              </div>
            </Entry>
          </Grid>

          <Text variant="footnote" tone="tertiary">
            Nine components, and only three of them draw chrome. That is the shape of the family:
            mayui/mobile is the phone’s furniture and its two gestures — everything a screen
            actually holds comes from the adaptive set, which is why nothing here is a phone
            variant of a component that already exists.
          </Text>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- catalog --------------------------------- */

/**
 * One tile: the component on the surface it would sit on, and its name under
 * it. The name is monospaced because it is an identifier — the thing you would
 * type to import it — and a catalog that sets identifiers in the UI face is
 * one where you cannot tell `NavBar` the component from "nav bar" the concept.
 */
function Entry({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <Box
      as="section"
      surface="base"
      radius="card"
      padding={4}
      className="may-catalog-mobile__entry"
    >
      <div className="may-catalog-mobile__stage">{children}</div>
      <div className="may-catalog-mobile__caption">
        <Text as="span" variant="caption-1" tone="secondary" mono>
          {name}
        </Text>
        {note && (
          <Text as="span" variant="caption-2" tone="tertiary">
            {note}
          </Text>
        )}
      </div>
    </Box>
  )
}

/* --------------------------------- content --------------------------------- */

interface Message {
  id: string
  from: string
  subject: string
  at: string
  unread: boolean
  flagged: boolean
}

const MAIL: Message[] = [
  {
    id: 'kucuk-kyoto',
    from: 'Marina Küçük',
    subject: 'Kyoto line slips a week',
    at: '9:38 AM',
    unread: true,
    flagged: false,
  },
  {
    id: 'app-store-review',
    from: 'App Store Review',
    subject: 'Halide 4.1.3 is now Ready for Sale',
    at: '8:12 AM',
    unread: false,
    flagged: true,
  },
]

/* ---------------------------------- icons ---------------------------------- */

const EllipsisIcon = () => <IoEllipsisHorizontal aria-hidden />

const MagnifierIcon = () => <IoSearchOutline aria-hidden />

const HeartIcon = ({ filled = false }: { filled?: boolean }) =>
  filled ? <IoHeart aria-hidden /> : <IoHeartOutline aria-hidden />

const GridIcon = ({ filled = false }: { filled?: boolean }) =>
  filled ? <IoGrid aria-hidden /> : <IoGridOutline aria-hidden />

const LibraryIcon = ({ filled = false }: { filled?: boolean }) =>
  filled ? <IoAlbums aria-hidden /> : <IoAlbumsOutline aria-hidden />

const LinkIcon = () => <IoLinkOutline aria-hidden />

const EnvelopeIcon = () => <IoMail aria-hidden />

const FlagIcon = () => <IoFlag aria-hidden />

const ClockIcon = () => <IoTime aria-hidden />

const PersonIcon = () => <IoPerson aria-hidden />

const BriefcaseIcon = () => <IoBriefcase aria-hidden />

const MoonIcon = () => <IoMoon aria-hidden />

const CarIcon = () => <IoCar aria-hidden />

const RingIcon = () => <IoRadioButtonOn aria-hidden />
