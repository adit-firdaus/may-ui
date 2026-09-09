import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb } from './Breadcrumb'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Components' }] },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Projects', href: '#' },
      { label: 'May UI', href: '#' },
      { label: 'Components' },
    ],
  },
}

export const Collapsed: Story = {
  render: () => (
    <Stack gap={4}>
      <Breadcrumb
        maxItems={3}
        items={[
          { label: 'Home', href: '#' },
          { label: 'Workspaces', href: '#' },
          { label: 'Acme', href: '#' },
          { label: 'Projects', href: '#' },
          { label: 'May UI', href: '#' },
          { label: 'Settings' },
        ]}
      />
    </Stack>
  ),
}

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb
      separator={<span>/</span>}
      items={[
        { label: 'src', href: '#' },
        { label: 'components', href: '#' },
        { label: 'Button.tsx' },
      ]}
    />
  ),
}
