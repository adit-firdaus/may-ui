import type { Meta, StoryObj } from '@storybook/react'
import {
  IoAdd,
  IoArrowUndo,
  IoClose,
  IoCreate,
  IoEllipsisHorizontal,
  IoFolder,
  IoShareOutline,
  IoTrash,
} from 'react-icons/io5'
import { IconButton } from '.'

const meta = {
  title: 'Catalog/Adaptive/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Share', children: <IoShareOutline aria-hidden focusable="false" /> },
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tinted', 'gray', 'plain'] },
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

export const Default: Story = {}

/** The same four variants as Button — IconButton consumes Button's own rules. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      <IconButton {...args} variant="filled" />
      <IconButton {...args} variant="tinted" />
      <IconButton {...args} variant="gray" />
      <IconButton {...args} variant="plain" />
    </Row>
  ),
}

/** `round` is what a close or overflow button wants; the default square suits a toolbar. */
export const Round: Story = {
  render: () => (
    <Row>
      <IconButton aria-label="Close" round variant="gray" tone="neutral">
        <IoClose aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="More" round variant="gray" tone="neutral">
        <IoEllipsisHorizontal aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="Add contact" round variant="filled">
        <IoAdd aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="Delete message" round variant="tinted" tone="danger">
        <IoTrash aria-hidden focusable="false" />
      </IconButton>
    </Row>
  ),
}

/** xs and sm sit under 44px, so both keep a full-size invisible hit area. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <IconButton {...args} key={s} size={s} variant="gray" tone="neutral" />
      ))}
    </Row>
  ),
}

/** A Mail message toolbar: plain glyphs, tint-coloured, spread across the bar. */
export const MailActions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 380,
        padding: 'var(--may-space-2)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
      }}
    >
      <IconButton aria-label="Move to folder">
        <IoFolder aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="Delete message" tone="danger">
        <IoTrash aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="Reply">
        <IoArrowUndo aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="New message">
        <IoCreate aria-hidden focusable="false" />
      </IconButton>
      <IconButton aria-label="Sending" loading />
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <Row>
      <IconButton {...args} variant="gray" tone="neutral" />
      <IconButton {...args} variant="gray" tone="neutral" loading />
      <IconButton {...args} variant="gray" tone="neutral" disabled />
    </Row>
  ),
}

