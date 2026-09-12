import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IoCloudOutline, IoDocumentOutline, IoFolderOutline } from 'react-icons/io5'
import { NavTree } from '.'
import type { NavTreeNode } from '.'
import { Button } from '../../components/Button'

const meta = {
  title: 'Catalog/Desktop/NavTree',
  component: NavTree,
  args: { nodes: [], 'aria-label': 'Files' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NavTree>

export default meta
type Story = StoryObj<typeof meta>

/** The Files app's own hierarchy, near enough to be recognisable. */
const files: NavTreeNode[] = [
  {
    id: 'icloud',
    label: 'iCloud Drive',
    icon: <IoCloudOutline aria-hidden />,
    children: [
      {
        id: 'documents',
        label: 'Documents',
        icon: <IoFolderOutline aria-hidden />,
        children: [
          {
            id: 'projects',
            label: 'Projects',
            icon: <IoFolderOutline aria-hidden />,
            children: [
              { id: 'may-ui', label: 'May UI.sketch', icon: <IoDocumentOutline aria-hidden /> },
              { id: 'tokens', label: 'Tokens.json', icon: <IoDocumentOutline aria-hidden /> },
            ],
          },
          { id: 'invoices', label: 'Invoices', icon: <IoFolderOutline aria-hidden />, badge: 4 },
        ],
      },
      { id: 'desktop', label: 'Desktop', icon: <IoFolderOutline aria-hidden /> },
      { id: 'shortcuts', label: 'Shortcuts', icon: <IoFolderOutline aria-hidden />, disabled: true },
    ],
  },
  {
    id: 'mac',
    label: 'On My Mac',
    icon: <IoFolderOutline aria-hidden />,
    children: [
      { id: 'downloads', label: 'Downloads', icon: <IoFolderOutline aria-hidden />, badge: 12 },
      { id: 'screenshots', label: 'Screenshots', icon: <IoFolderOutline aria-hidden /> },
    ],
  },
  { id: 'shared', label: 'Shared', icon: <IoFolderOutline aria-hidden /> },
]

/**
 * Click a folder to open it — a branch is both a destination and a container,
 * so it does both. The height rides `--may-spring-smooth` and the twisty
 * overshoots past 90° on `--may-spring-bouncy`.
 */
export const Files: Story = {
  render: () => {
    const [selected, setSelected] = useState('documents')
    return (
      <div style={{ maxWidth: '20rem' }}>
        <NavTree
          aria-label="Files"
          nodes={files}
          defaultExpandedIds={['icloud', 'documents']}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
        />
      </div>
    )
  },
}

/**
 * Tab once to enter the tree — the whole thing is a single tab stop. Then:
 * up/down walk the visible rows, right opens a folder and a second right steps
 * into it, left collapses or jumps back to the parent, Home and End go to the
 * ends.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: '20rem' }}>
      <Button variant="gray" size="sm" tone="neutral">
        Tab starts here
      </Button>
      <NavTree
        aria-label="Files"
        nodes={files}
        defaultExpandedIds={['icloud']}
        defaultSelectedId="icloud"
      />
    </div>
  ),
}

/** Deep nesting, to show the indent guides hanging off each parent's twisty. */
export const Deep: Story = {
  render: () => {
    const deep: NavTreeNode[] = [
      {
        id: 'l1',
        label: 'Library',
        icon: <IoFolderOutline aria-hidden />,
        children: [
          {
            id: 'l2',
            label: 'Application Support',
            icon: <IoFolderOutline aria-hidden />,
            children: [
              {
                id: 'l3',
                label: 'com.mayui.app',
                icon: <IoFolderOutline aria-hidden />,
                children: [
                  {
                    id: 'l4',
                    label: 'Caches',
                    icon: <IoFolderOutline aria-hidden />,
                    children: [{ id: 'l5', label: 'metadata.plist', icon: <IoDocumentOutline aria-hidden /> }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    return (
      <div style={{ maxWidth: '22rem' }}>
        <NavTree
          aria-label="Library"
          nodes={deep}
          defaultExpandedIds={['l1', 'l2', 'l3', 'l4']}
          defaultSelectedId="l5"
        />
      </div>
    )
  },
}

/** Expansion can be driven from outside, for an "expand all" affordance. */
export const ControlledExpansion: Story = {
  render: () => {
    const all = ['icloud', 'documents', 'projects', 'mac']
    const [expandedIds, setExpandedIds] = useState<string[]>([])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)', maxWidth: '20rem' }}>
        <div style={{ display: 'flex', gap: 'var(--may-space-2)' }}>
          <Button variant="tinted" size="sm" onClick={() => setExpandedIds(all)}>
            Expand all
          </Button>
          <Button variant="gray" tone="neutral" size="sm" onClick={() => setExpandedIds([])}>
            Collapse all
          </Button>
        </div>
        <NavTree
          aria-label="Files"
          nodes={files}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          defaultSelectedId="icloud"
        />
      </div>
    )
  },
}
