import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '.'
import { Text } from '../Text'

const meta = {
  title: 'Catalog/Adaptive/Label',
  component: Label,
  args: { children: 'Device Name' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['headline', 'body', 'callout', 'subheadline', 'footnote', 'caption-1'],
    },
    weight: { control: 'inline-radio', options: ['regular', 'medium', 'semibold', 'bold'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

/** A plain field, styled with tokens only — the real Input lives elsewhere. */
function Field({ id, placeholder, disabled }: { id: string; placeholder: string; disabled?: boolean }) {
  return (
    <input
      id={id}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        height: 'var(--may-control-h)',
        padding: '0 var(--may-space-4)',
        borderRadius: 'var(--may-radius-md)',
        background: 'var(--may-color-fill-tertiary)',
        color: 'var(--may-color-text)',
        font: 'inherit',
        border: 0,
        outline: 'none',
        width: '100%',
        opacity: disabled ? 0.35 : 1,
      }}
    />
  )
}

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)', maxWidth: 360 }}>
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Stack>
      <Label {...args} htmlFor="device-name" />
      <Field id="device-name" placeholder="Ana’s iPhone" />
    </Stack>
  ),
}

/** The asterisk is decorative; "(required)" rides along in the accessible name. */
export const Required: Story = {
  render: () => (
    <Stack>
      <Label htmlFor="apple-id" required>
        Apple ID
      </Label>
      <Field id="apple-id" placeholder="name@icloud.com" />
      <Text variant="caption-1" tone="tertiary">
        Used for iCloud, iMessage and the App Store.
      </Text>
    </Stack>
  ),
}

/** Dimmed and inert: clicking must not focus a control that cannot take it. */
export const Disabled: Story = {
  render: () => (
    <Stack>
      <Label htmlFor="carrier" disabled>
        Carrier Lock
      </Label>
      <Field id="carrier" placeholder="No SIM" disabled />
    </Stack>
  ),
}

/** The Settings section eyebrow — uppercase, tracked out, secondary. */
export const Eyebrow: Story = {
  render: () => (
    <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
        <Label uppercase>Allow access when locked</Label>
        <div
          style={{
            padding: 'var(--may-space-4)',
            borderRadius: 'var(--may-radius-card)',
            background: 'var(--may-color-surface)',
          }}
        >
          <Text variant="body">Notification Center</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
        <Label uppercase>Siri &amp; Search</Label>
        <div
          style={{
            padding: 'var(--may-space-4)',
            borderRadius: 'var(--may-radius-card)',
            background: 'var(--may-color-surface)',
          }}
        >
          <Text variant="body">Show Suggestions</Text>
        </div>
      </div>
    </div>
  ),
}

/** Any named style works — a headline label heads a group, a footnote hints. */
export const Variants: Story = {
  render: () => (
    <Stack>
      <Label variant="headline" htmlFor="a">
        Headline label
      </Label>
      <Label variant="body">
        Body label
      </Label>
      <Label variant="subheadline">
        Subheadline label (default)
      </Label>
      <Label variant="footnote" tone="secondary">
        Footnote label, secondary
      </Label>
      <Field id="a" placeholder="One field, five labels" />
    </Stack>
  ),
}
