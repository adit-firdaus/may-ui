import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { IoArrowUndoOutline, IoCreateOutline, IoFolderOutline } from 'react-icons/io5'
import { NavBar } from '.'
import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { List, ListRow } from '../../components/List'

const meta = {
  title: 'Catalog/Mobile/NavBar',
  component: NavBar,
  args: { title: 'Inbox' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['surface', 'plain'] },
    position: { control: 'inline-radio', options: ['static', 'sticky', 'fixed'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NavBar>

export default meta
type Story = StoryObj<typeof meta>

/** A screen with one trailing action — Mail's list view before you open anything. */
export const Default: Story = {
  render: (args) => (
    <Phone>
      <NavBar
        {...args}
        trailing={
          <Button variant="plain" size="sm">
            Edit
          </Button>
        }
      />
      <Body />
    </Phone>
  ),
}

/**
 * Pushed one level in. The chevron carries the previous screen's title, exactly
 * as iOS labels it, and the title stays centred against the bar even though the
 * two sides are nothing like the same width.
 */
export const WithBack: Story = {
  args: { title: 'Ada Lovelace' },
  render: (args) => (
    <Phone>
      <NavBar
        {...args}
        backLabel="Inbox"
        onBack={() => {}}
        trailing={
          <>
            <IconButton aria-label="Move to folder" size="sm">
              <FolderIcon />
            </IconButton>
            <IconButton aria-label="Reply" size="sm">
              <ReplyIcon />
            </IconButton>
          </>
        }
      />
      <Body />
    </Phone>
  ),
}

/**
 * The title truncates rather than wrapping or shoving the actions off the bar —
 * a nav bar is exactly one line tall, on every screen width.
 */
export const LongTitle: Story = {
  args: { title: 'Q3 shipping estimates and the Kyoto line' },
  render: (args) => (
    <Phone>
      <NavBar
        {...args}
        backLabel="Mailboxes"
        onBack={() => {}}
        trailing={
          <IconButton aria-label="Compose" size="sm">
            <ComposeIcon />
          </IconButton>
        }
      />
      <Body />
    </Phone>
  ),
}

/**
 * Scroll the list down and the bar slides away; scroll back up and it returns
 * before you reach the top. It never hides inside its own height, and — because
 * a bar that vanishes is motion rather than decoration — it never hides at all
 * for someone who has asked for reduced motion.
 */
export const HideOnScroll: Story = {
  args: { title: 'Settings' },
  render: (args) => {
    const scroller = useRef<HTMLDivElement>(null)
    return (
      <Phone>
        <div
          ref={scroller}
          data-slot="scroll-area"
          style={{ height: '100%', overflowY: 'auto' }}
        >
          <NavBar {...args} hideOnScroll scrollRef={scroller} />
          <div style={{ padding: 'var(--may-space-4)' }}>
            <List header="General">
              <ListRow title="About" detail="iPhone" onClick={() => {}} />
              <ListRow title="Software Update" detail="1 available" onClick={() => {}} />
              <ListRow title="AirDrop" detail="Contacts Only" onClick={() => {}} />
              <ListRow title="AirPlay & Handoff" onClick={() => {}} />
              <ListRow title="Picture in Picture" onClick={() => {}} />
              <ListRow title="CarPlay" onClick={() => {}} />
            </List>
            <List header="Display">
              <ListRow title="Appearance" detail="Automatic" onClick={() => {}} />
              <ListRow title="Text Size" onClick={() => {}} />
              <ListRow title="Brightness" detail="72%" onClick={() => {}} />
              <ListRow title="Auto-Lock" detail="2 Minutes" onClick={() => {}} />
              <ListRow title="Raise to Wake" onClick={() => {}} />
              <ListRow title="Always On" detail="On" onClick={() => {}} />
            </List>
          </div>
        </div>
      </Phone>
    )
  },
}

/**
 * `plain` over a grouped background: no surface of its own, so the screen's
 * colour runs right up under the bar. Right for a screen that never scrolls
 * content beneath it.
 */
export const Plain: Story = {
  args: { title: 'AirDrop', variant: 'plain', separator: false },
  render: (args) => (
    <Phone>
      <NavBar {...args} backLabel="General" onBack={() => {}} />
      <div style={{ padding: 'var(--may-space-4)' }}>
        <List footer="AirDrop lets you share instantly with people nearby.">
          <ListRow title="Receiving Off" onClick={() => {}} />
          <ListRow title="Contacts Only" detail="✓" onClick={() => {}} />
          <ListRow title="Everyone for 10 Minutes" onClick={() => {}} />
        </List>
      </div>
    </Phone>
  ),
}

/* --------------------------------- frame ---------------------------------- */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: 340,
        height: 480,
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

function Body() {
  return (
    <div style={{ padding: 'var(--may-space-4)', overflow: 'hidden' }}>
      <List>
        <ListRow
          title="Grace Hopper"
          subtitle="Compiler notes — the A-0 write-up is ready for you"
          detail="9:41"
          onClick={() => {}}
        />
        <ListRow
          title="Katherine Johnson"
          subtitle="Re: trajectory review"
          detail="Yesterday"
          onClick={() => {}}
        />
        <ListRow
          title="TestFlight"
          subtitle="Halide 2.11 is ready to test"
          detail="Tuesday"
          onClick={() => {}}
        />
      </List>
    </div>
  )
}

/* --------------------------------- glyphs --------------------------------- */

function FolderIcon() {
  return <IoFolderOutline aria-hidden />
}

function ReplyIcon() {
  return <IoArrowUndoOutline aria-hidden />
}

function ComposeIcon() {
  return <IoCreateOutline aria-hidden />
}
