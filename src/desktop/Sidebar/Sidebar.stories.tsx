import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar, SidebarItem, SidebarSection, SidebarToggle } from './Sidebar'

const meta = {
  title: 'Catalog/Desktop/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

/* Mail's glyph set, drawn at the 16px grid the rest of the system uses. */
const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const icons = {
  inbox: 'M1.5 8.5h3l1 2h5l1-2h3M2 4.5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z',
  star: 'M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2 4.4 13.1l.7-4L2.2 6.3l4-.6z',
  flag: 'M4 14V2.5h8l-1.6 3L12 8.5H4',
  send: 'M14 2L7 9m7-7l-4.5 12-2.2-5.3L2 6.5z',
  archive: 'M2 5.5h12V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM1.5 2.5h13v3h-13zM6.5 8.5h3',
  trash: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5',
  cloud: 'M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.7.6 2.7 2.7 0 0 1-.4 5.4z',
  gear: 'M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 1.5l1 1.7 1.9-.4.4 1.9 1.7 1-1 1.7 1 1.7-1.7 1-.4 1.9-1.9-.4-1 1.7-1-1.7-1.9.4-.4-1.9-1.7-1 1-1.7-1-1.7 1.7-1 .4-1.9 1.9.4z',
}

/** Frames the sidebar against a content pane, the way an app actually stages it. */
const Shell = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', height: '32rem', background: 'var(--may-color-bg)' }}>
    {children}
    <div
      style={{
        flex: 1,
        margin: 'var(--may-space-2)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
      }}
    />
  </div>
)

/**
 * A Mail sidebar. Hit the toggle in the header to collapse it to the rail: the
 * width rides `--may-spring-smooth`, labels fade out ahead of the closing edge,
 * and unread counts land on their icons as dots.
 */
export const Collapsible: Story = {
  render: () => {
    const [active, setActive] = useState('inbox')
    return (
      <Shell>
        <Sidebar
          aria-label="Mailboxes"
          header={<SidebarToggle />}
          footer={
            <SidebarItem icon={<Glyph d={icons.gear} />} onClick={() => {}}>
              Settings
            </SidebarItem>
          }
        >
          <SidebarSection title="Favourites">
            <SidebarItem
              icon={<Glyph d={icons.inbox} />}
              badge={12}
              active={active === 'inbox'}
              onClick={() => setActive('inbox')}
            >
              Inbox
            </SidebarItem>
            <SidebarItem
              icon={<Glyph d={icons.star} />}
              badge={3}
              active={active === 'vip'}
              onClick={() => setActive('vip')}
            >
              VIP
            </SidebarItem>
            <SidebarItem
              icon={<Glyph d={icons.flag} />}
              active={active === 'flagged'}
              onClick={() => setActive('flagged')}
            >
              Flagged
            </SidebarItem>
            <SidebarItem
              icon={<Glyph d={icons.send} />}
              active={active === 'sent'}
              onClick={() => setActive('sent')}
            >
              Sent
            </SidebarItem>
          </SidebarSection>

          <SidebarSection title="iCloud">
            <SidebarItem
              icon={<Glyph d={icons.archive} />}
              active={active === 'archive'}
              onClick={() => setActive('archive')}
            >
              Archive
            </SidebarItem>
            <SidebarItem
              icon={<Glyph d={icons.trash} />}
              active={active === 'trash'}
              onClick={() => setActive('trash')}
            >
              Bin
            </SidebarItem>
          </SidebarSection>
        </Sidebar>
      </Shell>
    )
  },
}

/**
 * The rail on its own. Hover an icon with a mouse — or tab to it — and the
 * label comes back as a flyout, so the collapse never costs you the name of
 * where you are going.
 */
export const Rail: Story = {
  render: () => (
    <Shell>
      <Sidebar aria-label="Mailboxes" defaultCollapsed header={<SidebarToggle />}>
        <SidebarSection title="Favourites">
          <SidebarItem icon={<Glyph d={icons.inbox} />} badge={12} active onClick={() => {}}>
            Inbox
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.star} />} badge={3} onClick={() => {}}>
            VIP
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.flag} />} onClick={() => {}}>
            Flagged
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="iCloud">
          <SidebarItem icon={<Glyph d={icons.archive} />} onClick={() => {}}>
            Archive
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.trash} />} onClick={() => {}}>
            Bin
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </Shell>
  ),
}

/**
 * Sections can fold. Their titles are disclosures, and the group's height
 * animates on the same grid track `Collapsible` uses — so a long account never
 * clips and a short one never animates empty space.
 */
export const CollapsibleGroups: Story = {
  render: () => (
    <Shell>
      <Sidebar aria-label="Files" header={<SidebarToggle />}>
        <SidebarSection title="Locations" collapsible>
          <SidebarItem icon={<Glyph d={icons.cloud} />} active onClick={() => {}}>
            iCloud Drive
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.archive} />} onClick={() => {}}>
            On My Mac
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.trash} />} badge="2" onClick={() => {}}>
            Recently Deleted
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="Tags" collapsible defaultOpen={false}>
          <SidebarItem icon={<Glyph d={icons.flag} />} onClick={() => {}}>
            Red
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.flag} />} onClick={() => {}}>
            Orange
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.flag} />} onClick={() => {}}>
            Blue
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </Shell>
  ),
}

/** Items render as real links when given an `href`, so cmd-click still works. */
export const Links: Story = {
  render: () => (
    <Shell>
      <Sidebar aria-label="Documentation" footer={<SidebarToggle />}>
        <SidebarSection title="Guides">
          <SidebarItem icon={<Glyph d={icons.inbox} />} href="#getting-started" active>
            Getting started
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.star} />} href="#tokens">
            Design tokens
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.send} />} href="#motion" badge="New">
            Motion
          </SidebarItem>
          <SidebarItem icon={<Glyph d={icons.gear} />} href="#theming" disabled>
            Theming
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </Shell>
  ),
}
