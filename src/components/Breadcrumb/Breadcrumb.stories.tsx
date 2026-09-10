import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb } from './Breadcrumb'

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

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d="M1.75 4.25A1.25 1.25 0 0 1 3 3h3l1.5 1.75h5.5A1.25 1.25 0 0 1 14.25 6v6A1.25 1.25 0 0 1 13 13.25H3A1.25 1.25 0 0 1 1.75 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
      { label: 'iCloud Drive', icon: <FolderIcon />, href: '#' },
      { label: 'Shared', icon: <FolderIcon />, href: '#' },
      { label: 'Q3 Launch', icon: <FolderIcon /> },
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
