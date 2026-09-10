import type { ReactNode } from 'react'
import { useState } from 'react'

import {
  IoCalendar,
  IoCheckmark,
  IoContrastOutline,
  IoFlash,
  IoMail,
  IoMegaphone,
  IoNotificationsOutline,
  IoOptionsOutline,
  IoPerson,
  IoSettingsOutline,
  IoShieldOutline,
} from 'react-icons/io5'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import { Collapsible } from '../components/Collapsible'
import { Field } from '../components/Field'
import { IconTile } from '../components/IconTile'
import { Input } from '../components/Input'
import { List, ListRow } from '../components/List'
import { RadioGroup, Radio } from '../components/RadioGroup'
import { SegmentedControl } from '../components/SegmentedControl'
import { Select } from '../components/Select'
import { Slider } from '../components/Slider'
import { Stack } from '../components/Stack'
import { Switch } from '../components/Switch'
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs'
import { Text } from '../components/Text'

/* -------------------------------- glyph set -------------------------------- */

const TAB_ICON = {
  general: <IoSettingsOutline aria-hidden />,
  appearance: <IoContrastOutline aria-hidden />,
  notifications: <IoNotificationsOutline aria-hidden />,
  privacy: <IoShieldOutline aria-hidden />,
  advanced: <IoOptionsOutline aria-hidden />,
}

const TILE = {
  mail: <IoMail aria-hidden />,
  person: <IoPerson aria-hidden />,
  calendar: <IoCalendar aria-hidden />,
  bolt: <IoFlash aria-hidden />,
  megaphone: <IoMegaphone aria-hidden />,
}

/* --------------------------------- options --------------------------------- */

const MAILBOXES = [
  { label: 'Inbox — iCloud', value: 'icloud' },
  { label: 'Inbox — Work', value: 'work' },
  { label: 'All Inboxes', value: 'all' },
  { label: 'VIP', value: 'vip' },
]

const FETCH = [
  { label: 'Automatically', value: 'auto' },
  { label: 'Every 5 minutes', value: '5' },
  { label: 'Every 15 minutes', value: '15' },
  { label: 'Every hour', value: '60' },
  { label: 'Manually', value: 'manual' },
]

const QUOTE = [
  { label: 'Include all original text', value: 'all' },
  { label: 'Include selected text only', value: 'selected' },
  { label: 'Do not include original text', value: 'none' },
]

/** macOS ships eight accents plus Graphite; these are the system hues themselves. */
const ACCENTS = [
  { id: 'blue', label: 'Blue', colour: 'var(--may-blue)' },
  { id: 'purple', label: 'Purple', colour: 'var(--may-purple)' },
  { id: 'pink', label: 'Pink', colour: 'var(--may-pink)' },
  { id: 'red', label: 'Red', colour: 'var(--may-red)' },
  { id: 'orange', label: 'Orange', colour: 'var(--may-orange)' },
  { id: 'yellow', label: 'Yellow', colour: 'var(--may-yellow)' },
  { id: 'green', label: 'Green', colour: 'var(--may-green)' },
  { id: 'graphite', label: 'Graphite', colour: 'var(--may-gray)' },
]

/** The text-size rungs iOS and macOS both step through, smallest first. */
const TEXT_SIZES = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large', 'Huge', 'Largest']

const ALERTS = [
  { id: 'new-mail', title: 'New Mail', subtitle: 'Banners, sounds and badges', tile: TILE.mail, tint: 'blue' as const },
  { id: 'vip', title: 'VIP Mail', subtitle: 'Always alert, even in Focus', tile: TILE.person, tint: 'orange' as const },
  { id: 'invites', title: 'Calendar Invitations', subtitle: 'Replies and updates', tile: TILE.calendar, tint: 'red' as const },
  { id: 'updates', title: 'Software Updates', subtitle: 'When an update is ready to install', tile: TILE.bolt, tint: 'indigo' as const },
  { id: 'news', title: 'Product News', subtitle: 'Occasional announcements', tile: TILE.megaphone, tint: 'pink' as const },
]

/* --------------------------------- pieces ---------------------------------- */

/** The three window controls. Colour is the whole affordance, so they are spans, not buttons. */
function TrafficLight({ colour }: { colour: string }) {
  return (
    <span
      style={{
        display: 'block',
        width: 'var(--may-space-3)',
        height: 'var(--may-space-3)',
        borderRadius: 'var(--may-radius-full)',
        background: colour,
      }}
    />
  )
}

function Check() {
  return (
    <IoCheckmark
      aria-hidden
      style={{ width: 'var(--may-space-3)', height: 'var(--may-space-3)' }}
    />
  )
}

/** Every panel is the same column: one measure wide, generous gaps between groups. */
function Panel({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="column"
      gap={6}
      style={{ maxWidth: '34rem', paddingBlock: 'var(--may-space-5)' }}
    >
      {children}
    </Stack>
  )
}

/**
 * A macOS Settings window.
 *
 * The window itself is one `Box` — base surface, sheet radius, the heaviest
 * shadow in the ramp — because that is all a window is in this system: a
 * surface at a different value, floating. No ring, no hairline; those are the
 * two treatments that read as a dialog in light and as a floating rectangle in
 * dark.
 *
 * Panels use `keepMounted`, which is the right trade for a settings window
 * specifically: half-typed server details and a scrolled position both survive
 * a trip to another tab, exactly as they do in the real one.
 */
export function PreferencesScreen() {
  const [mailbox, setMailbox] = useState('icloud')
  const [fetch, setFetch] = useState('auto')
  const [quote, setQuote] = useState('all')
  const [threading, setThreading] = useState(true)
  const [photos, setPhotos] = useState(true)
  const [preview, setPreview] = useState(false)
  const [receipts, setReceipts] = useState(false)
  const [appearance, setAppearance] = useState('auto')
  const [accent, setAccent] = useState('blue')
  const [textSize, setTextSize] = useState(3)
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    'new-mail': true,
    vip: true,
    invites: true,
    updates: false,
    news: false,
  })

  return (
    <div
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--may-space-8)',
        background: 'var(--may-color-bg)',
      }}
    >
      <Box
        surface="base"
        radius="sheet"
        shadow="xl"
        style={{
          width: '100%',
          maxWidth: '54rem',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Title bar. Three columns so the title stays optically centred no
          * matter how wide the window gets. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: 'var(--may-space-3) var(--may-space-4)',
          }}
        >
          <Stack direction="row" gap={2} align="center">
            <TrafficLight colour="var(--may-red)" />
            <TrafficLight colour="var(--may-yellow)" />
            <TrafficLight colour="var(--may-green)" />
          </Stack>
          <Text variant="subheadline" weight="semibold">
            Mail Settings
          </Text>
          <span />
        </div>

        <Tabs
          defaultValue="general"
          variant="pill"
          style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingInline: 'var(--may-space-4)',
              paddingBlockEnd: 'var(--may-space-3)',
            }}
          >
            <TabList aria-label="Settings sections">
              <Tab value="general" icon={TAB_ICON.general}>
                General
              </Tab>
              <Tab value="appearance" icon={TAB_ICON.appearance}>
                Appearance
              </Tab>
              <Tab value="notifications" icon={TAB_ICON.notifications}>
                Notifications
              </Tab>
              <Tab value="privacy" icon={TAB_ICON.privacy}>
                Privacy
              </Tab>
              <Tab value="advanced" icon={TAB_ICON.advanced}>
                Advanced
              </Tab>
            </TabList>
          </div>

          <div
            data-slot="scroll-area"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              paddingInline: 'var(--may-space-6)',
              paddingBlockEnd: 'var(--may-space-4)',
            }}
          >
            {/* ------------------------------ General ----------------------------- */}
            <TabPanel value="general" keepMounted>
              <Panel>
                <Field
                  label="Default Mailbox"
                  description="Where new messages land when you have more than one account."
                >
                  <Select options={MAILBOXES} value={mailbox} onValueChange={setMailbox} />
                </Field>

                <Field label="Check for New Messages">
                  <Select options={FETCH} value={fetch} onValueChange={setFetch} />
                </Field>

                {/* One Field, several checkboxes: the label names the group, and
                  * each box says what it does in the first person. */}
                <Field label="Message List">
                  <Stack direction="column" gap={3}>
                    <Checkbox checked={threading} onCheckedChange={setThreading}>
                      Organise by conversation
                    </Checkbox>
                    <Checkbox checked={photos} onCheckedChange={setPhotos}>
                      Show contact photos
                    </Checkbox>
                    <Checkbox
                      checked={preview}
                      onCheckedChange={setPreview}
                      description="Adds two lines of the message body under each subject."
                    >
                      Show message preview
                    </Checkbox>
                  </Stack>
                </Field>

                <Field
                  label="Read Receipts"
                  description="Senders can tell when you have opened their message."
                >
                  <Switch checked={receipts} onCheckedChange={setReceipts}>
                    Send read receipts
                  </Switch>
                </Field>
              </Panel>
            </TabPanel>

            {/* ---------------------------- Appearance ---------------------------- */}
            <TabPanel value="appearance" keepMounted>
              <Panel>
                <Field
                  label="Appearance"
                  description="Auto follows the system between light at sunrise and dark at sunset."
                >
                  <SegmentedControl
                    aria-label="Appearance"
                    value={appearance}
                    onValueChange={setAppearance}
                    options={[
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' },
                      { label: 'Auto', value: 'auto' },
                    ]}
                  />
                </Field>

                <Field label="Accent Colour">
                  <Stack direction="row" gap={3} wrap>
                    {ACCENTS.map((swatch) => (
                      <Box
                        key={swatch.id}
                        as="button"
                        type="button"
                        radius="full"
                        aria-label={swatch.label}
                        aria-pressed={accent === swatch.id}
                        onClick={() => setAccent(swatch.id)}
                        style={{
                          width: 'var(--may-space-6)',
                          height: 'var(--may-space-6)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          // A swatch IS its colour, so nothing is drawn around
                          // it — the chosen one carries a checkmark instead,
                          // which survives both themes and colour blindness.
                          appearance: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          background: swatch.colour,
                          color: 'var(--may-color-on-primary)',
                        }}
                      >
                        {accent === swatch.id && <Check />}
                      </Box>
                    ))}
                  </Stack>
                </Field>

                <Field
                  label="Text Size"
                  description="Applies to the message list and the reading pane."
                >
                  <Slider
                    aria-label="Text size"
                    min={0}
                    max={TEXT_SIZES.length - 1}
                    step={1}
                    ticks
                    showValue
                    value={textSize}
                    onValueChange={setTextSize}
                    formatValue={(value) => TEXT_SIZES[value] ?? ''}
                    leading={
                      <Text as="span" variant="caption-2" tone="secondary">
                        A
                      </Text>
                    }
                    trailing={
                      <Text as="span" variant="title-3" tone="secondary">
                        A
                      </Text>
                    }
                  />
                </Field>
              </Panel>
            </TabPanel>

            {/* --------------------------- Notifications -------------------------- */}
            <TabPanel value="notifications" keepMounted>
              <Panel>
                {/* A Switch in the accessory slot suppresses the row's chevron —
                  * the row is not a destination, the control on it is the whole
                  * interaction. */}
                <List
                  header="Allow Notifications"
                  footer="Focus can still hold these back while you are working."
                >
                  {ALERTS.map((alert) => (
                    <ListRow
                      key={alert.id}
                      leading={
                        <IconTile gradient={alert.tint} size="md">
                          {alert.tile}
                        </IconTile>
                      }
                      title={alert.title}
                      subtitle={alert.subtitle}
                      accessory={
                        <Switch
                          checked={alerts[alert.id] ?? false}
                          onCheckedChange={(next) =>
                            setAlerts((current) => ({ ...current, [alert.id]: next }))
                          }
                          aria-label={alert.title}
                        />
                      }
                    />
                  ))}
                </List>

                <Field label="Notification Sound">
                  <Select
                    defaultValue="ding"
                    options={[
                      { label: 'Ding', value: 'ding' },
                      { label: 'Hero', value: 'hero' },
                      { label: 'Submarine', value: 'submarine' },
                      { label: 'None', value: 'none' },
                    ]}
                  />
                </Field>
              </Panel>
            </TabPanel>

            {/* ------------------------------ Privacy ----------------------------- */}
            <TabPanel value="privacy" keepMounted>
              <Panel>
                <Field
                  label="Mail Privacy Protection"
                  description="Hides what senders can learn about you when you open a message."
                >
                  <Stack direction="column" gap={3}>
                    <Checkbox defaultChecked>Hide IP address from senders</Checkbox>
                    <Checkbox defaultChecked>Block all remote content</Checkbox>
                    <Checkbox description="Trackers can still see that the mailbox exists.">
                      Load remote images in trusted mail
                    </Checkbox>
                  </Stack>
                </Field>

                <Field label="Block Cookies">
                  <RadioGroup defaultValue="visited" aria-label="Block cookies">
                    <Radio value="always" description="Nothing is kept between sessions.">
                      Always
                    </Radio>
                    <Radio value="visited">Allow from websites I visit</Radio>
                    <Radio value="never">Never block</Radio>
                  </RadioGroup>
                </Field>

                <Stack direction="row" gap={3} wrap>
                  <Button variant="gray" size="sm">
                    Manage Website Data…
                  </Button>
                  <Button variant="tinted" tone="danger" size="sm">
                    Remove All Website Data
                  </Button>
                </Stack>
              </Panel>
            </TabPanel>

            {/* ----------------------------- Advanced ----------------------------- */}
            <TabPanel value="advanced" keepMounted>
              <Panel>
                <Text variant="footnote" tone="secondary">
                  These settings apply to the iCloud account only. Changing them can stop mail
                  arriving.
                </Text>

                <Collapsible trigger="Incoming Mail Server" defaultOpen>
                  <Stack
                    direction="column"
                    gap={4}
                    style={{ paddingBlock: 'var(--may-space-3)' }}
                  >
                    <Field label="Host Name">
                      <Input defaultValue="imap.mail.me.com" spellCheck={false} />
                    </Field>
                    <Field label="Port" description="993 with TLS, 143 without.">
                      <Input defaultValue="993" inputMode="numeric" />
                    </Field>
                    <Field label="Authentication">
                      <Select
                        defaultValue="oauth"
                        options={[
                          { label: 'OAuth 2', value: 'oauth' },
                          { label: 'Password', value: 'password' },
                          { label: 'Kerberos v5', value: 'kerberos' },
                          { label: 'None', value: 'none', disabled: true },
                        ]}
                      />
                    </Field>
                  </Stack>
                </Collapsible>

                <Collapsible trigger="Outgoing Mail Server">
                  <Stack
                    direction="column"
                    gap={4}
                    style={{ paddingBlock: 'var(--may-space-3)' }}
                  >
                    {/* `error` is the only way to mark a control invalid, and it
                      * REPLACES the description rather than stacking under it. */}
                    <Field
                      label="Host Name"
                      error="Mail couldn’t reach this server. Check the name and try again."
                    >
                      <Input defaultValue="smtp.mail.me.con" spellCheck={false} />
                    </Field>
                    <Field
                      label="Quoting"
                      description="What gets carried into a reply below your own text."
                    >
                      <Select options={QUOTE} value={quote} onValueChange={setQuote} />
                    </Field>
                    <Checkbox defaultChecked>Use TLS for outgoing mail</Checkbox>
                  </Stack>
                </Collapsible>

                <Collapsible trigger="Offline Storage">
                  <Stack
                    direction="column"
                    gap={4}
                    style={{ paddingBlock: 'var(--may-space-3)' }}
                  >
                    <Field
                      label="Keep Copies of Messages"
                      description="Older messages stay on the server and download when opened."
                    >
                      <Select
                        defaultValue="year"
                        options={[
                          { label: 'All messages and attachments', value: 'all' },
                          { label: 'All messages, attachments on demand', value: 'ondemand' },
                          { label: 'Last 12 months', value: 'year' },
                          { label: 'Last 30 days', value: 'month' },
                        ]}
                      />
                    </Field>
                    <Field
                      label="Mailbox Cache"
                      description="Last rebuilt 214 days ago. Rebuilding re-downloads every message."
                    >
                      <Stack direction="row" gap={3} align="center">
                        <Button variant="gray" size="sm">
                          Rebuild Mailbox
                        </Button>
                        <Text variant="footnote" tone="tertiary">
                          4.2 GB on this Mac
                        </Text>
                      </Stack>
                    </Field>
                  </Stack>
                </Collapsible>
              </Panel>
            </TabPanel>
          </div>
        </Tabs>
      </Box>
    </div>
  )
}
