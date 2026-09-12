import type { Meta, StoryObj } from '@storybook/react'
import { IoFolderOutline } from 'react-icons/io5'
import { Breadcrumb } from '.'

const meta = {
  title: 'Catalog/Adaptive/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'iCloud Drive', onClick: () => {} },
      { label: 'Documents', onClick: () => {} },
      { label: 'Design', onClick: () => {} },
      { label: 'Specs' },
    ],
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

/** The last crumb is where you are: not a link, not pressable, marked `aria-current`. */
export const Default: Story = {}

/**
 * Past `maxItems` the middle folds away. Pressing the ellipsis expands it in
 * place, and the surviving crumbs slide from where they were — a FLIP, not a
 * reflow you watch happen.
 */
export const Collapsed: Story = {
  args: {
    maxItems: 4,
    items: [
      { label: 'Macintosh HD', onClick: () => {} },
      { label: 'Users', onClick: () => {} },
      { label: 'dana', onClick: () => {} },
      { label: 'Projects', onClick: () => {} },
      { label: 'mayui', onClick: () => {} },
      { label: 'src', onClick: () => {} },
      { label: 'components' },
    ],
  },
}

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'iCloud Drive', icon: <IoFolderOutline aria-hidden />, href: '#' },
      { label: 'Shared', icon: <IoFolderOutline aria-hidden />, href: '#' },
      { label: 'Q3 Launch', icon: <IoFolderOutline aria-hidden /> },
    ],
  },
}

/** Any node can stand in for the chevron — Finder's own trail uses a slash. */
export const CustomSeparator: Story = {
  args: {
    separator: <span>/</span>,
    size: 'sm',
    items: [
      { label: 'src', onClick: () => {} },
      { label: 'components', onClick: () => {} },
      { label: 'Breadcrumb', onClick: () => {} },
      { label: 'Breadcrumb.tsx' },
    ],
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <Breadcrumb {...args} size="sm" />
      <Breadcrumb {...args} size="md" />
      <Breadcrumb {...args} size="lg" />
    </div>
  ),
}
