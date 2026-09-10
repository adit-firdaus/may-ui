import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NavTree } from './NavTree'
import type { NavTreeNode } from './NavTree'
import { Button } from '../../components/Button'

const meta = {
  title: 'Catalog/Desktop/NavTree',
  component: NavTree,
  args: { nodes: [], 'aria-label': 'Files' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NavTree>

export default meta
type Story = StoryObj<typeof meta>

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const folder = 'M1.5 4.5A1 1 0 0 1 2.5 3.5h3l1.5 1.5h5.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z'
const doc = 'M3.5 1.5h5L12.5 5.5v9h-9zM8.5 1.5v4h4'
const cloud = 'M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.7.6 2.7 2.7 0 0 1-.4 5.4z'

/** The Files app's own hierarchy, near enough to be recognisable. */
const files: NavTreeNode[] = [
  {
    id: 'icloud',
    label: 'iCloud Drive',
    icon: <Glyph d={cloud} />,
    children: [
      {
        id: 'documents',
        label: 'Documents',
        icon: <Glyph d={folder} />,
        children: [
          {
            id: 'projects',
            label: 'Projects',
            icon: <Glyph d={folder} />,
            children: [
              { id: 'may-ui', label: 'May UI.sketch', icon: <Glyph d={doc} /> },
              { id: 'tokens', label: 'Tokens.json', icon: <Glyph d={doc} /> },
            ],
          },
          { id: 'invoices', label: 'Invoices', icon: <Glyph d={folder} />, badge: 4 },
        ],
      },
      { id: 'desktop', label: 'Desktop', icon: <Glyph d={folder} /> },
      { id: 'shortcuts', label: 'Shortcuts', icon: <Glyph d={folder} />, disabled: true },
    ],
  },
  {
    id: 'mac',
    label: 'On My Mac',
    icon: <Glyph d={folder} />,
    children: [
      { id: 'downloads', label: 'Downloads', icon: <Glyph d={folder} />, badge: 12 },
      { id: 'screenshots', label: 'Screenshots', icon: <Glyph d={folder} /> },
    ],
  },
  { id: 'shared', label: 'Shared', icon: <Glyph d={folder} /> },
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
        icon: <Glyph d={folder} />,
        children: [
          {
            id: 'l2',
            label: 'Application Support',
            icon: <Glyph d={folder} />,
            children: [
              {
                id: 'l3',
                label: 'com.mayui.app',
                icon: <Glyph d={folder} />,
                children: [
                  {
                    id: 'l4',
                    label: 'Caches',
                    icon: <Glyph d={folder} />,
                    children: [{ id: 'l5', label: 'metadata.plist', icon: <Glyph d={doc} /> }],
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
