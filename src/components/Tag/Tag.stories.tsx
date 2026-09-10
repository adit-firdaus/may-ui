import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tag } from './Tag'
import { Button } from '../Button/Button'

const meta = {
  title: 'Catalog/Adaptive/Tag',
  component: Tag,
  args: { children: 'Photography' },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <Wrap>
      <Tag tone="neutral" onRemove={() => {}}>Weekend</Tag>
      <Tag tone="tint" onRemove={() => {}}>Shared Album</Tag>
      <Tag tone="success" onRemove={() => {}}>Backed Up</Tag>
      <Tag tone="warning" onRemove={() => {}}>Low Storage</Tag>
      <Tag tone="danger" onRemove={() => {}}>Blocked</Tag>
    </Wrap>
  ),
}

/**
 * Mail's To: field. Each recipient is a token, and removing one is the whole
 * point of the chip — so the X owns a 44px target even at `sm`.
 */
export const Recipients: Story = {
  render: () => <RecipientField />,
}

function RecipientField() {
  const [people, setPeople] = useState([
    'Dana Whitfield',
    'Marco Reyes',
    'Priya Nair',
    'Tom Okafor',
  ])

  return (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--may-space-2)',
          alignItems: 'center',
          padding: 'var(--may-space-3)',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
        }}
      >
        <span style={{ color: 'var(--may-color-text-secondary)' }}>To:</span>
        {people.map((person) => (
          <Tag
            key={person}
            tone="tint"
            leadingIcon={<PersonIcon />}
            onRemove={() => setPeople((list) => list.filter((p) => p !== person))}
          >
            {person}
          </Tag>
        ))}
      </div>
      <Wrap>
        <Button
          size="sm"
          variant="gray"
          onClick={() => setPeople((list) => [...list, `Guest ${list.length + 1}`])}
        >
          Add recipient
        </Button>
        <Button size="sm" variant="plain" onClick={() => setPeople([])}>
          Clear
        </Button>
      </Wrap>
    </div>
  )
}

/** Static chips: no `onRemove`, no X — Photos' keyword pills. */
export const Static: Story = {
  render: () => (
    <Wrap>
      <Tag leadingIcon={<PinIcon />}>Big Sur</Tag>
      <Tag>Golden Hour</Tag>
      <Tag>Portrait</Tag>
      <Tag tone="tint">Favourites</Tag>
    </Wrap>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Wrap>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Tag key={s} size={s} tone="tint" onRemove={() => {}}>
          {s}
        </Tag>
      ))}
    </Wrap>
  ),
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="5" r="2.6" fill="currentColor" />
      <path d="M2.8 14c0-2.9 2.3-4.6 5.2-4.6s5.2 1.7 5.2 4.6" fill="currentColor" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 1.8c2.3 0 4.2 1.9 4.2 4.2 0 3-4.2 8-4.2 8S3.8 9 3.8 6c0-2.3 1.9-4.2 4.2-4.2z"
        fill="currentColor"
      />
      <circle cx="8" cy="6" r="1.5" fill="var(--may-color-surface)" />
    </svg>
  )
}
