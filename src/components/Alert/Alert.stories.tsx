import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Alert } from './Alert'
import { Button } from '../Button/Button'

const meta = {
  title: 'Catalog/Adaptive/Alert',
  component: Alert,
  args: {
    title: 'iCloud Storage Is Full',
    children: 'Your photos and documents are no longer backing up to iCloud.',
  },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

// `--may-alert-gap` tells a dismissing alert how much of the column's gap to
// take with it, so the neighbours slide the whole way instead of jumping the
// last 12px when the node unmounts.
const Column = ({ children }: { children: React.ReactNode }) => (
  <div
    style={
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-3)',
        maxWidth: 480,
        '--may-alert-gap': 'var(--may-space-3)',
      } as React.CSSProperties
    }
  >
    {children}
  </div>
)

export const Default: Story = {
  args: { tone: 'warning' },
  render: (args) => (
    <Column>
      <Alert {...args} />
    </Column>
  ),
}

export const Tones: Story = {
  render: () => (
    <Column>
      <Alert tone="tint" title="Software Update">
        iOS 26.1 is available and will install tonight while this iPhone is charging.
      </Alert>
      <Alert tone="success" title="Backup Complete">
        Last backed up to iCloud today at 4:12 AM.
      </Alert>
      <Alert tone="warning" title="Low Power Mode">
        Background refresh and automatic downloads are paused.
      </Alert>
      <Alert tone="danger" title="Payment Method Declined">
        Update your billing details to keep your subscription active.
      </Alert>
      <Alert tone="neutral">Screen Time reports are calculated once a day.</Alert>
    </Column>
  ),
}

/** Actions sit under the message, the way an iOS banner stacks them. */
export const WithActions: Story = {
  render: () => (
    <Column>
      <Alert
        tone="tint"
        title="Trust This Computer?"
        actions={
          <>
            <Button size="sm" variant="tinted">
              Trust
            </Button>
            <Button size="sm" variant="plain" tone="neutral">
              Not Now
            </Button>
          </>
        }
      >
        Your settings and data will be accessible from this computer when connected.
      </Alert>
      <Alert
        tone="danger"
        title="Delete “Untitled Note”?"
        actions={
          <Button size="sm" variant="tinted" tone="danger">
            Delete Note
          </Button>
        }
      >
        This note will be deleted from all your devices.
      </Alert>
    </Column>
  ),
}

/** Dismissal is animated: `onDismiss` fires once the alert has actually left. */
export const Dismissible: Story = {
  render: () => <DismissDemo />,
}

const NOTICES = [
  { id: 1, tone: 'warning' as const, title: 'Wi-Fi Not Secure', body: 'HomeNet uses WEP, which is not considered secure.' },
  { id: 2, tone: 'tint' as const, title: 'AirPods Pro Connected', body: 'Noise Cancellation is on.' },
  { id: 3, tone: 'success' as const, title: 'Passcode Updated', body: 'Your new passcode takes effect immediately.' },
]

function DismissDemo() {
  const [notices, setNotices] = useState(NOTICES)

  return (
    <Column>
      {notices.map((notice) => (
        <Alert
          key={notice.id}
          tone={notice.tone}
          title={notice.title}
          onDismiss={() => setNotices((all) => all.filter((n) => n.id !== notice.id))}
          dismissLabel={`Dismiss ${notice.title}`}
        >
          {notice.body}
        </Alert>
      ))}
      {notices.length === 0 && (
        <Button variant="gray" onClick={() => setNotices(NOTICES)}>
          Bring them back
        </Button>
      )}
    </Column>
  )
}
