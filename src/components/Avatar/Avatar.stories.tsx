import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarGroup } from '.'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Avatar',
  component: Avatar,
  args: { name: 'Dana Whitfield' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A stand-in portrait as a data URI — a story must not depend on the network.
 * The colours here are image content, not styling.
 */
function photo(top: string, bottom: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>` +
    `</linearGradient></defs><rect width="96" height="96" fill="url(#g)"/>` +
    `<circle cx="48" cy="37" r="15" fill="rgba(255,255,255,0.88)"/>` +
    `<path d="M15 93c0-18 15-28 33-28s33 10 33 28z" fill="rgba(255,255,255,0.88)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const PEOPLE = [
  { name: 'Dana Whitfield', src: photo('#8ec5ff', '#0a63d6') },
  { name: 'Marco Reyes', src: photo('#ffc07a', '#e06a00') },
  { name: 'Priya Nair', src: photo('#f4a2c8', '#c5307c') },
  { name: 'Tom Okafor', src: photo('#9ee6b4', '#1e9a4d') },
]

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
    {children}
  </div>
)

export const Default: Story = {}

/**
 * With no photo the initials sit on a gradient derived from the name — the
 * same person is the same colour everywhere, forever. Grey circles all the way
 * down read as missing data; these read as people.
 */
export const Initials: Story = {
  render: () => (
    <Row>
      {['Dana Whitfield', 'Marco Reyes', 'Priya Nair', 'Tom Okafor', 'Ana', 'Kwame Boateng'].map(
        (name) => (
          <Avatar key={name} name={name} size="lg" />
        ),
      )}
      <Avatar aria-label="Unknown sender" size="lg" />
    </Row>
  ),
}

export const SizesAndShapes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <Row>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Avatar key={s} size={s} name="Dana Whitfield" src={PEOPLE[0].src} />
        ))}
      </Row>
      <Row>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Avatar key={s} size={s} shape="square" name="Marco Reyes" />
        ))}
      </Row>
    </div>
  ),
}

/**
 * The stack: each avatar punches a hole in the one behind it, so the gap works
 * on any background without a stroke anywhere.
 */
export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <AvatarGroup size="lg">
        {PEOPLE.map((p) => (
          <Avatar key={p.name} name={p.name} src={p.src} />
        ))}
      </AvatarGroup>

      <AvatarGroup max={3}>
        {[...PEOPLE, { name: 'Ines Carvalho' }, { name: 'Kwame Boateng' }].map((p) => (
          <Avatar key={p.name} name={p.name} />
        ))}
      </AvatarGroup>

      <AvatarGroup size="sm" max={5}>
        {[...PEOPLE, { name: 'Ines Carvalho' }, { name: 'Kwame Boateng' }].map((p) => (
          <Avatar key={p.name} name={p.name} />
        ))}
      </AvatarGroup>
    </div>
  ),
}

/** Where avatars actually live: as the leading element of a Messages row. */
export const InRows: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <List header="Messages">
        <ListRow
          leading={<Avatar name="Dana Whitfield" src={PEOPLE[0].src} size="md" />}
          title="Dana Whitfield"
          subtitle="Landing at 4:15 — can you grab the keys?"
          detail="9:41"
          onClick={() => {}}
        />
        <ListRow
          leading={<Avatar name="Marco Reyes" size="md" />}
          title="Marco Reyes"
          subtitle="Sent you a photo"
          detail="Yesterday"
          onClick={() => {}}
        />
        <ListRow
          leading={
            <AvatarGroup size="xs" max={3}>
              {PEOPLE.map((p) => (
                <Avatar key={p.name} name={p.name} />
              ))}
            </AvatarGroup>
          }
          title="Ridge Trail Crew"
          subtitle="Priya: 6am start, bring layers"
          detail="Tue"
          onClick={() => {}}
        />
      </List>
    </div>
  ),
}

/** A src that 404s falls back to the initials rather than leaving a hole. */
export const BrokenImage: Story = {
  render: () => (
    <Row>
      <Avatar size="lg" name="Priya Nair" src="/does-not-exist.jpg" />
      <Avatar size="lg" name="Priya Nair" src={PEOPLE[2].src} />
    </Row>
  ),
}
