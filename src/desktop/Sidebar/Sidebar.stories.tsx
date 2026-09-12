import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  IoArchiveOutline,
  IoCloudOutline,
  IoFileTrayOutline,
  IoFlagOutline,
  IoPaperPlaneOutline,
  IoSettingsOutline,
  IoStarOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { Sidebar, SidebarItem, SidebarSection, SidebarToggle } from '.'

const meta = {
  title: 'Catalog/Desktop/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

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
            <SidebarItem icon={<IoSettingsOutline aria-hidden />} onClick={() => {}}>
              Settings
            </SidebarItem>
          }
        >
          <SidebarSection title="Favourites">
            <SidebarItem
              icon={<IoFileTrayOutline aria-hidden />}
              badge={12}
              active={active === 'inbox'}
              onClick={() => setActive('inbox')}
            >
              Inbox
            </SidebarItem>
            <SidebarItem
              icon={<IoStarOutline aria-hidden />}
              badge={3}
              active={active === 'vip'}
              onClick={() => setActive('vip')}
            >
              VIP
            </SidebarItem>
            <SidebarItem
              icon={<IoFlagOutline aria-hidden />}
              active={active === 'flagged'}
              onClick={() => setActive('flagged')}
            >
              Flagged
            </SidebarItem>
            <SidebarItem
              icon={<IoPaperPlaneOutline aria-hidden />}
              active={active === 'sent'}
              onClick={() => setActive('sent')}
            >
              Sent
            </SidebarItem>
          </SidebarSection>

          <SidebarSection title="iCloud">
            <SidebarItem
              icon={<IoArchiveOutline aria-hidden />}
              active={active === 'archive'}
              onClick={() => setActive('archive')}
            >
              Archive
            </SidebarItem>
            <SidebarItem
              icon={<IoTrashOutline aria-hidden />}
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
          <SidebarItem icon={<IoFileTrayOutline aria-hidden />} badge={12} active onClick={() => {}}>
            Inbox
          </SidebarItem>
          <SidebarItem icon={<IoStarOutline aria-hidden />} badge={3} onClick={() => {}}>
            VIP
          </SidebarItem>
          <SidebarItem icon={<IoFlagOutline aria-hidden />} onClick={() => {}}>
            Flagged
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="iCloud">
          <SidebarItem icon={<IoArchiveOutline aria-hidden />} onClick={() => {}}>
            Archive
          </SidebarItem>
          <SidebarItem icon={<IoTrashOutline aria-hidden />} onClick={() => {}}>
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
          <SidebarItem icon={<IoCloudOutline aria-hidden />} active onClick={() => {}}>
            iCloud Drive
          </SidebarItem>
          <SidebarItem icon={<IoArchiveOutline aria-hidden />} onClick={() => {}}>
            On My Mac
          </SidebarItem>
          <SidebarItem icon={<IoTrashOutline aria-hidden />} badge="2" onClick={() => {}}>
            Recently Deleted
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="Tags" collapsible defaultOpen={false}>
          <SidebarItem icon={<IoFlagOutline aria-hidden />} onClick={() => {}}>
            Red
          </SidebarItem>
          <SidebarItem icon={<IoFlagOutline aria-hidden />} onClick={() => {}}>
            Orange
          </SidebarItem>
          <SidebarItem icon={<IoFlagOutline aria-hidden />} onClick={() => {}}>
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
          <SidebarItem icon={<IoFileTrayOutline aria-hidden />} href="#getting-started" active>
            Getting started
          </SidebarItem>
          <SidebarItem icon={<IoStarOutline aria-hidden />} href="#tokens">
            Design tokens
          </SidebarItem>
          <SidebarItem icon={<IoPaperPlaneOutline aria-hidden />} href="#motion" badge="New">
            Motion
          </SidebarItem>
          <SidebarItem icon={<IoSettingsOutline aria-hidden />} href="#theming" disabled>
            Theming
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </Shell>
  ),
}
