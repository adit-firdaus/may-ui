import type { Meta, StoryObj } from '@storybook/react'
import { IoAdd } from 'react-icons/io5'
import { Button } from './Button'

const meta = {
  title: 'Catalog/Adaptive/Button',
  component: Button,
  args: { children: 'Continue' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tinted', 'gray', 'plain'] },
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

export const Default: Story = {}

/** There is no `outline` variant — nothing here is separated by a stroke. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      <Button {...args} variant="filled">Filled</Button>
      <Button {...args} variant="tinted">Tinted</Button>
      <Button {...args} variant="gray">Gray</Button>
      <Button {...args} variant="plain">Plain</Button>
    </Row>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)' }}>
      <Row>
        {(['tint', 'neutral', 'success', 'warning', 'danger'] as const).map((t) => (
          <Button key={t} tone={t}>{t}</Button>
        ))}
      </Row>
      <Row>
        {(['tint', 'neutral', 'success', 'warning', 'danger'] as const).map((t) => (
          <Button key={t} tone={t} variant="tinted">{t}</Button>
        ))}
      </Row>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <Button key={s} size={s}>{s}</Button>
      ))}
    </Row>
  ),
}

/** Pills are for prominent standalone actions, the way iOS uses them. */
export const Pills: Story = {
  render: () => (
    <Row>
      <Button pill size="lg">Get Started</Button>
      <Button pill size="lg" variant="tinted">Learn More</Button>
      <Button pill size="lg" variant="gray">Not Now</Button>
    </Row>
  ),
}

export const States: Story = {
  render: () => (
    <Row>
      <Button>Default</Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button leadingIcon={<IoAdd aria-hidden />}>With icon</Button>
    </Row>
  ),
}
