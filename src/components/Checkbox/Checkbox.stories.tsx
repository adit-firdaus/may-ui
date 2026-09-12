import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from '.'

const meta = {
  title: 'Catalog/Adaptive/Checkbox',
  component: Checkbox,
  args: { children: 'Sync with iCloud' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
    {children}
  </div>
)

/** The tick draws along its own path — check it and watch the stroke land. */
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false)
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Column>
      <Checkbox {...args} size="sm" defaultChecked>
        Small
      </Checkbox>
      <Checkbox {...args} size="md" defaultChecked>
        Medium
      </Checkbox>
      <Checkbox {...args} size="lg" defaultChecked>
        Large
      </Checkbox>
    </Column>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Column>
        <Checkbox defaultChecked description="Back up photos and videos in their original format.">
          iCloud Photos
        </Checkbox>
        <Checkbox description="Keeps drafts, signatures and rules on every device.">Mail</Checkbox>
        <Checkbox disabled description="Managed by your organisation.">
          Passwords &amp; Keychain
        </Checkbox>
      </Column>
    </div>
  ),
}

/**
 * Mixed state: some of the apps below are on. Toggling the parent commits the
 * whole group, exactly as a Finder or Photos batch selection does.
 */
export const Indeterminate: Story = {
  render: () => {
    const apps = ['Photos', 'Mail', 'Notes', 'Reminders']
    const [on, setOn] = useState<string[]>(['Photos', 'Notes'])
    const all = on.length === apps.length
    const some = on.length > 0 && !all

    return (
      <div style={{ maxWidth: 420 }}>
        <Column>
          <Checkbox
            checked={all}
            indeterminate={some}
            onCheckedChange={(next) => setOn(next ? apps : [])}
            description={`${on.length} of ${apps.length} apps syncing`}
          >
            Apps Using iCloud
          </Checkbox>
          <div style={{ paddingInlineStart: 'var(--may-space-8)' }}>
            <Column>
              {apps.map((app) => (
                <Checkbox
                  key={app}
                  size="sm"
                  checked={on.includes(app)}
                  onCheckedChange={(next) =>
                    setOn((prev) => (next ? [...prev, app] : prev.filter((a) => a !== app)))
                  }
                >
                  {app}
                </Checkbox>
              ))}
            </Column>
          </div>
        </Column>
      </div>
    )
  },
}

/** Invalid is a wash of the destructive tone — no ring, no stroke. */
export const States: Story = {
  render: () => (
    <Column>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Mixed</Checkbox>
      <Checkbox invalid description="Required before you can continue.">
        I agree to the Terms &amp; Conditions
      </Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled, checked
      </Checkbox>
    </Column>
  ),
}
