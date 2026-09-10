import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IoAlert, IoCloudOfflineOutline, IoFileTrayOutline } from 'react-icons/io5'
import { Alert } from '../components/Alert'
import { Avatar } from '../components/Avatar'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { Grid } from '../components/Grid'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { NoticeBar } from '../components/NoticeBar'
import { Progress } from '../components/Progress'
import { Skeleton } from '../components/Skeleton'
import { Spinner } from '../components/Spinner'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'

/** The mail that survived to the on-device cache before the connection dropped. */
const CACHED_MESSAGES = [
  {
    from: 'Marina Küçük',
    subject: 'Kyoto line slips a week',
    preview: 'Everything else holds. I have the revised dates attached —',
    time: '9:38 AM',
  },
  {
    from: 'App Store Review',
    subject: 'Halide 4.1.3 is now Ready for Sale',
    preview: 'Your app is available on the App Store in 175 countries.',
    time: '8:12 AM',
  },
  {
    from: 'Devin Raye',
    subject: 'Re: histogram in the loupe',
    preview: 'Shipping it behind a flag first. Watch the frame budget on the —',
    time: 'Yesterday',
  },
]

/**
 * The four conditions a screen spends most of its life in, side by side:
 * waiting, empty, broken, and connected-but-stale.
 *
 * They belong on one page because the differences between them are decisions,
 * not accidents. A skeleton is the silhouette of the thing that has not arrived
 * and never a spinner in a box. An empty state is muted, because a first run is
 * not a failure. An error is the only one of the four allowed to carry red, and
 * it says what actually failed — a host, a timeout, a last-known-good time —
 * rather than "Something went wrong". And the offline cell is the one most
 * apps skip: still useful, honest about its age, one tap from recovering.
 */
export function StatesScreen() {
  /* Two independent retries, not one shared flag: the broken cell and the stale
   * cell are two different screens, and a button that spins because a button in
   * another card was pressed is the bug this file exists to avoid teaching. */
  const [retrying, retry] = useMomentaryFlag(1600)
  const [reconnecting, reconnect] = useMomentaryFlag(1600)

  return (
    <div
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        data-slot="scroll-area"
        style={{ flex: 1, overflowY: 'auto', padding: 'var(--may-space-6) var(--may-space-5)' }}
      >
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-6)',
          }}
        >
          <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
            <Text as="h1" variant="large-title">
              Mailbox States
            </Text>
            <Text variant="subheadline" tone="secondary">
              One mailbox — Updates, 1,284 messages — in the four conditions it is actually in most
              of the time.
            </Text>
          </header>

          {/* 300px is the width below which a skeleton stops resembling the row
            * it stands in for; the cells wrap rather than compress past it. */}
          <Grid minColumnWidth={300} gap={4}>
            {/* ------------------------------ loading ----------------------- */}

            <Cell caption="Loading" hint="A silhouette, not a spinner in a box.">
              <Card style={{ flex: 1 }}>
                <Stack direction="column" gap={5}>
                  {/* The circle is sized in --may-control-h, which is exactly
                    * what an Avatar at `md` measures — so this placeholder is
                    * the real geometry of the message rows in the offline cell,
                    * not an approximation of them. */}
                  <Stack direction="row" gap={3} align="center">
                    <Skeleton
                      variant="circle"
                      width="var(--may-control-h)"
                      height="var(--may-control-h)"
                      label="Loading messages"
                    />
                    <Stack direction="column" gap={2} fullWidth>
                      <Skeleton width="58%" />
                      <Skeleton width="86%" />
                    </Stack>
                  </Stack>

                  {/* lines={3} ends short, the way a real paragraph does. */}
                  <Skeleton lines={3} />

                  <Stack direction="row" gap={3} align="center">
                    <Spinner label="Syncing mailbox" />
                    <Text variant="subheadline" tone="secondary">
                      Syncing 1,284 messages…
                    </Text>
                  </Stack>

                  {/* Indeterminate, because the attachment count is known but the
                    * bytes are not — a bar that guesses is worse than one that
                    * admits it is still working. */}
                  <Progress indeterminate label="Downloading attachments (18 of 42)" />
                </Stack>
              </Card>
            </Cell>

            {/* ------------------------------- empty ------------------------ */}

            <Cell caption="Empty" hint="Muted. An empty mailbox is not a failure.">
              <Card style={{ flex: 1, justifyContent: 'center' }}>
                <EmptyState
                  glyph={<TrayGlyph />}
                  title="No Mail"
                  description="You have read everything in Updates. New messages are filed here as they arrive."
                  action={<Button variant="tinted">Check for Mail</Button>}
                />
              </Card>
            </Cell>

            {/* ------------------------------- error ------------------------ */}

            <Cell caption="Error" hint="Names the host, the timeout and the last good sync.">
              <Card style={{ flex: 1 }}>
                <Stack direction="column" gap={4}>
                  {/* The tile is the only saturated thing above the fold: the
                    * glyph slot mutes a bare SVG to tertiary label, which is
                    * right for empty and wrong for broken. */}
                  <EmptyState
                    size="sm"
                    glyph={
                      <IconTile gradient="red" size="lg">
                        <ExclamationGlyph />
                      </IconTile>
                    }
                    title="Can’t Connect to iCloud"
                    description="The server stopped responding while fetching Updates."
                    action={
                      <Button variant="tinted" tone="danger" loading={retrying} onClick={retry}>
                        Try Again
                      </Button>
                    }
                  />
                  <Alert tone="danger" title="Connection timed out">
                    imap.mail.me.com did not respond within 30 seconds. Last successful sync was
                    today at 9:41 AM.
                  </Alert>
                </Stack>
              </Card>
            </Cell>

            {/* ------------------------------ offline ----------------------- */}

            <Cell caption="Partial" hint="Still useful, and honest about its age.">
              {/* padding="none" so the bar reaches both edges and the rows sit
                * flush — a banner inset from the card reads as a message about
                * the card rather than about the connection. */}
              <Card padding="none" style={{ flex: 1 }}>
                <NoticeBar
                  tone="warning"
                  icon={<WifiSlashGlyph />}
                  action={
                    <Button variant="plain" size="sm" loading={reconnecting} onClick={reconnect}>
                      Retry
                    </Button>
                  }
                >
                  {reconnecting ? 'Reconnecting…' : 'Offline — showing mail from 9:41 AM'}
                </NoticeBar>

                {/* The stale content stays at full strength. Dimming it would
                  * say "disabled", and these messages are perfectly readable —
                  * they are simply old, which the bar and the footer say. */}
                <List variant="plain">
                  {CACHED_MESSAGES.map((message) => (
                    <ListRow
                      key={message.subject}
                      leading={<Avatar name={message.from} size="md" />}
                      title={message.subject}
                      subtitle={`${message.from} — ${message.preview}`}
                      detail={message.time}
                      onClick={() => {}}
                    />
                  ))}
                </List>

                <Box paddingX={4} paddingY={3}>
                  <Text variant="footnote" tone="tertiary">
                    3 of 1,284 messages available offline · Last updated today at 9:41 AM
                  </Text>
                </Box>
              </Card>
            </Cell>
          </Grid>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- structure -------------------------------- */

/**
 * A flag that turns itself back off — enough to show a control's busy state on
 * a screen that has no network behind it. A retry that resolves instantly reads
 * as a dead button, and the timer is cleared on unmount because setting state
 * on a screen that has gone is the classic example-code bug.
 */
function useMomentaryFlag(ms: number): [boolean, () => void] {
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return [
    on,
    () => {
      setOn(true)
      timer.current = setTimeout(() => setOn(false), ms)
    },
  ]
}

/**
 * One labelled cell. The caption is chrome for this gallery, not part of the
 * pattern — a real screen shows exactly one of these four and never names it.
 */
function Cell({
  caption,
  hint,
  children,
}: {
  caption: string
  hint: string
  children: ReactNode
}) {
  return (
    <Stack direction="column" gap={2} style={{ height: '100%' }}>
      <Stack direction="column" gap={0}>
        <Text variant="caption-1" tone="tertiary" weight="semibold">
          {caption.toUpperCase()}
        </Text>
        <Text variant="caption-1" tone="tertiary">
          {hint}
        </Text>
      </Stack>
      {children}
    </Stack>
  )
}

/* -------------------------------- glyph set -------------------------------- */

function TrayGlyph() {
  return <IoFileTrayOutline aria-hidden />
}

function ExclamationGlyph() {
  return <IoAlert aria-hidden />
}

function WifiSlashGlyph() {
  return <IoCloudOfflineOutline aria-hidden />
}
