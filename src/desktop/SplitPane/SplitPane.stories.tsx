import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { SplitPane } from '.'
import { List, ListRow } from '../../components/List'
import { Button } from '../../components/Button'

const meta = {
  title: 'Catalog/Desktop/SplitPane',
  component: SplitPane,
  args: { children: [<div key="a" />, <div key="b" />] },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SplitPane>

export default meta
type Story = StoryObj<typeof meta>

/** Frames the split at a fixed height so the divider has something to divide. */
const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ height: '30rem', background: 'var(--may-color-bg)' }}>{children}</div>
)

const Pane = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div style={{ padding: 'var(--may-space-4)' }}>
    <h3
      style={{
        margin: 0,
        marginBlockEnd: 'var(--may-space-3)',
        fontSize: 'var(--may-text-title-3)',
        lineHeight: 'var(--may-text-title-3-leading)',
        letterSpacing: 'var(--may-text-title-3-tracking)',
        fontWeight: 'var(--may-text-title-3-weight)',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
)

const messages = [
  { from: 'Ada Lovelace', subject: 'Analytical Engine notes', detail: '9:41' },
  { from: 'Grace Hopper', subject: 'Re: compiler timings', detail: 'Yesterday' },
  { from: 'App Store', subject: 'Your receipt', detail: 'Tuesday' },
  { from: 'Katherine Johnson', subject: 'Trajectory review', detail: 'Monday' },
]

/**
 * Drag the divider. It renders as a hairline but hit-tests as a 17px band, so
 * you never have to aim at a single pixel. Double-click resets it to
 * `defaultSize`; with the keyboard, tab to it and use the arrow keys.
 */
export const Horizontal: Story = {
  render: () => (
    <Frame>
      <SplitPane defaultSize={280} min={200} max={480}>
        <Pane title="Mailboxes">
          <List>
            <ListRow title="Inbox" detail="12" onClick={() => {}} />
            <ListRow title="VIP" detail="3" onClick={() => {}} />
            <ListRow title="Flagged" onClick={() => {}} />
            <ListRow title="Sent" onClick={() => {}} />
          </List>
        </Pane>
        <Pane title="Inbox">
          <List>
            {messages.map((message) => (
              <ListRow
                key={message.from}
                title={message.from}
                subtitle={message.subject}
                detail={message.detail}
                onClick={() => {}}
              />
            ))}
          </List>
        </Pane>
      </SplitPane>
    </Frame>
  ),
}

/** The same divider turned on its side, splitting a list from its preview. */
export const Vertical: Story = {
  render: () => (
    <Frame>
      <SplitPane orientation="vertical" defaultSize={200} min={120} max={360}>
        <Pane title="Inbox">
          <List>
            {messages.map((message) => (
              <ListRow key={message.from} title={message.from} detail={message.detail} onClick={() => {}} />
            ))}
          </List>
        </Pane>
        <Pane title="Analytical Engine notes">
          <p style={{ color: 'var(--may-color-text-secondary)', maxWidth: '38rem' }}>
            The Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and
            leaves. I have added a table of operations for the Bernoulli numbers.
          </p>
        </Pane>
      </SplitPane>
    </Frame>
  ),
}

/**
 * With `collapsible`, squeezing the pane past `min` meets rubber-band
 * resistance rather than a wall — pull past half the band and it lets go and
 * shuts. Drag the divider back out, double-click it, or press Enter on it to
 * bring the pane back.
 */
export const Collapsible: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <Frame>
        <SplitPane
          collapsible
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          defaultSize={260}
          min={180}
          max={420}
        >
          <Pane title="Mailboxes">
            <List>
              <ListRow title="Inbox" detail="12" onClick={() => {}} />
              <ListRow title="Archive" onClick={() => {}} />
              <ListRow title="Bin" onClick={() => {}} />
            </List>
          </Pane>
          <Pane title="Inbox">
            <div style={{ marginBlockEnd: 'var(--may-space-4)' }}>
              <Button variant="tinted" size="sm" onClick={() => setCollapsed((value) => !value)}>
                {collapsed ? 'Show mailboxes' : 'Hide mailboxes'}
              </Button>
            </div>
            <List>
              {messages.map((message) => (
                <ListRow
                  key={message.from}
                  title={message.from}
                  subtitle={message.subject}
                  detail={message.detail}
                  onClick={() => {}}
                />
              ))}
            </List>
          </Pane>
        </SplitPane>
      </Frame>
    )
  },
}

/** Splits nest: a sidebar beside a list beside its preview, Mail's own layout. */
export const Nested: Story = {
  render: () => (
    <Frame>
      <SplitPane collapsible defaultSize={220} min={160} max={340}>
        <Pane title="Mailboxes">
          <List>
            <ListRow title="Inbox" detail="12" onClick={() => {}} />
            <ListRow title="VIP" detail="3" onClick={() => {}} />
          </List>
        </Pane>
        <SplitPane orientation="vertical" defaultSize={220} min={140} max={400}>
          <Pane title="Inbox">
            <List>
              {messages.map((message) => (
                <ListRow key={message.from} title={message.from} detail={message.detail} onClick={() => {}} />
              ))}
            </List>
          </Pane>
          <Pane title="Re: compiler timings">
            <p style={{ color: 'var(--may-color-text-secondary)', maxWidth: '38rem' }}>
              Timings attached. The linker is still the long pole — I have a patch that halves it,
              but it wants a review before Friday.
            </p>
          </Pane>
        </SplitPane>
      </SplitPane>
    </Frame>
  ),
}
