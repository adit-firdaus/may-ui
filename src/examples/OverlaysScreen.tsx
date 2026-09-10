import { useState } from 'react'
import type { ReactNode } from 'react'
import { ActionSheet } from '../components/ActionSheet'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Field } from '../components/Field'
import { Grid } from '../components/Grid'
import { IconTile } from '../components/IconTile'
import type { IconTileGradient } from '../components/IconTile'
import { Input } from '../components/Input'
import { List, ListRow } from '../components/List'
import { MayHost } from '../components/MayHost'
import { Menu } from '../components/Menu'
import type { MenuItem } from '../components/Menu'
import { Modal } from '../components/Modal'
import { Popover } from '../components/Popover'
import { Sheet } from '../components/Sheet'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { toast } from '../components/Toast'
import { Tooltip } from '../components/Tooltip'
import { Popup } from '../mobile/Popup'

/** The overlays that own the whole screen while they are up. One at a time. */
type ModalOverlay = 'sheet' | 'album' | 'actions' | 'confirm' | 'share'

/**
 * Every overlay in the system, triggerable from one page.
 *
 * The point of collecting them is the taxonomy, which is easy to get wrong:
 *
 *  - `Sheet`, `Modal`, `ActionSheet`, `AlertDialog` and mobile `Popup` are
 *    modal. They scrim the page, trap focus and take Escape, so exactly one can
 *    be up at a time — which is why they share a single piece of state here
 *    rather than owning a boolean each.
 *  - `Popover`, `Menu` and `Tooltip` are anchored and non-modal. They keep
 *    their own open state beside their trigger, and dismiss on outside press,
 *    Escape, or focus leaving.
 *  - `toast()` is imperative and has no trigger relationship at all: it is
 *    called from anywhere and rendered by the one `<MayHost />` at the bottom
 *    of this file.
 *
 * None of these portal. Each renders inline, right beside the button that
 * opened it, and reaches the whole viewport with a fixed scrim — so a Sheet can
 * be written inside the Card whose action opens it, which is where the reader
 * is looking.
 */
export function OverlaysScreen() {
  const [overlay, setOverlay] = useState<ModalOverlay | null>(null)
  /* The anchored two keep their own state: they are non-modal, so a popover and
   * a menu being open at once is a legitimate thing rather than a bug. */
  const [eventOpen, setEventOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setOverlay(null)

  const mailActions: MenuItem[] = [
    { label: 'Reply', icon: <ReplyGlyph />, shortcut: '⌘R', onSelect: () => toast('Draft started', { description: 'Re: Kyoto line slips a week' }) },
    { label: 'Reply All', shortcut: '⇧⌘R', onSelect: () => toast('Draft started', { description: 'Re: Kyoto line slips a week · 4 recipients' }) },
    { label: 'Forward', shortcut: '⇧⌘F', onSelect: () => toast('Draft started', { description: 'Fwd: Kyoto line slips a week' }) },
    { label: 'Flag', icon: <FlagGlyph />, separator: true, onSelect: () => toast('Flagged') },
    { label: 'Mark as Unread', shortcut: '⇧⌘U', onSelect: () => toast('Marked as Unread') },
    /* Disabled rather than hidden: the thread is already muted, and a menu that
     * changes shape between openings is a menu nobody learns. */
    { label: 'Mute Thread', disabled: true },
    {
      label: 'Delete',
      icon: <TrashGlyph />,
      shortcut: '⌘⌫',
      destructive: true,
      separator: true,
      onSelect: () => toast.danger('Message deleted', { action: { label: 'Undo', onClick: () => {} } }),
    },
  ]

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
              Overlays
            </Text>
            <Text variant="subheadline" tone="secondary">
              Nine ways to interrupt someone, from the gentlest to the most final. Each one opens
              from the card it is written in.
            </Text>
          </header>

          <Grid minColumnWidth="18rem" gap={4}>
            {/* -------------------------------- sheet ----------------------- */}

            <Trigger
              title="Sheet"
              description="Rises from the bottom edge on a phone and presents as a centred dialog past 1024px — one component, both shapes."
              gradient="blue"
              glyph={<ShareGlyph />}
              action={<Button onClick={() => setOverlay('sheet')}>Share via AirDrop</Button>}
            >
              <Sheet
                open={overlay === 'sheet'}
                onClose={close}
                title="AirDrop"
                description="Share “IMG_4021.RAW” with people nearby."
                footer={
                  <>
                    <Button variant="plain" onClick={close}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        close()
                        toast.success('Sent to Marina’s MacBook Pro', {
                          description: '48.2 MB · about 3 seconds',
                        })
                      }}
                    >
                      Send
                    </Button>
                  </>
                }
              >
                <List>
                  <ListRow title="Marina’s MacBook Pro" detail="Nearby" onClick={() => {}} />
                  <ListRow title="Devin’s iPhone" detail="Contacts Only" onClick={() => {}} />
                  <ListRow title="Studio Display" detail="Nearby" onClick={() => {}} />
                </List>
              </Sheet>
            </Trigger>

            {/* -------------------------------- modal ----------------------- */}

            <Trigger
              title="Modal"
              description="A centred dialog for a task with its own form. Escape and the scrim both close it; the work is short enough that nothing is lost."
              gradient="indigo"
              glyph={<AlbumGlyph />}
              action={<Button onClick={() => setOverlay('album')}>New Shared Album</Button>}
            >
              <Modal
                open={overlay === 'album'}
                onClose={close}
                size="sm"
                title="New Shared Album"
                description="Everyone you invite can add their own photos and videos."
                footer={
                  <>
                    <Button variant="plain" onClick={close}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        close()
                        toast.success('“Kyoto 2024” created', { description: 'Invitations sent to 4 people.' })
                      }}
                    >
                      Create
                    </Button>
                  </>
                }
              >
                <Field label="Album name" description="Visible to everyone you invite.">
                  <Input fullWidth defaultValue="Kyoto 2024" />
                </Field>
              </Modal>
            </Trigger>

            {/* ----------------------------- action sheet -------------------- */}

            <Trigger
              title="Action Sheet"
              description="A list of things to do with one object. Destructive first and in red, Cancel detached at the bottom — iOS's own ordering."
              gradient="teal"
              glyph={<PhotoGlyph />}
              action={
                <Button variant="gray" onClick={() => setOverlay('actions')}>
                  Photo actions
                </Button>
              }
            >
              <ActionSheet
                open={overlay === 'actions'}
                onClose={close}
                title="IMG_4021.RAW"
                description="48.2 MB · Shot on iPhone 15 Pro · 14 Oct at 9:41 AM"
                actions={[
                  { label: 'Duplicate', icon: <CopyGlyph />, onSelect: () => toast('Photo duplicated', { description: 'IMG_4022.RAW · 48.2 MB' }) },
                  { label: 'Add to Album…', icon: <AlbumGlyph />, onSelect: () => toast('Added to “Kyoto 2024”') },
                  { label: 'Hide', onSelect: () => toast('Hidden'), disabled: true },
                  {
                    label: 'Delete Photo',
                    icon: <TrashGlyph />,
                    destructive: true,
                    onSelect: () => toast.danger('Moved to Recently Deleted', {
                      description: 'Kept for 30 days.',
                      action: { label: 'Undo', onClick: () => {} },
                    }),
                  },
                ]}
              />
            </Trigger>

            {/* ----------------------------- alert dialog -------------------- */}

            <Trigger
              title="Alert Dialog"
              description="The only overlay that refuses to be dismissed by accident: no scrim click, no Escape shortcut past the choice, and the destructive verb on the button rather than “OK”."
              gradient="red"
              glyph={<TrashGlyph />}
              action={
                <Button tone="danger" variant="tinted" onClick={() => setOverlay('confirm')}>
                  Delete album
                </Button>
              }
            >
              <AlertDialog
                open={overlay === 'confirm'}
                title="Delete “Kyoto 2024”?"
                description="The album and its 248 photos are removed from iCloud on every device signed in to this account."
                confirmLabel="Delete Album"
                cancelLabel="Keep"
                destructive
                onConfirm={() => {
                  close()
                  toast.danger('Album deleted', { description: '248 photos moved to Recently Deleted.' })
                }}
                onCancel={close}
              />
            </Trigger>

            {/* ------------------------------- popover ----------------------- */}

            <Trigger
              title="Popover"
              description="Anchored to its trigger and non-modal: no scrim, no scroll lock. It flips and shifts rather than leaving the viewport."
              gradient="orange"
              glyph={<CalendarGlyph />}
              action={
                <Popover
                  open={eventOpen}
                  onOpenChange={setEventOpen}
                  placement="bottom-start"
                  aria-label="Event details"
                  trigger={<Button variant="tinted">Design Review</Button>}
                >
                  <Stack direction="column" gap={2} style={{ maxWidth: '15rem' }}>
                    <Text variant="headline">Design Review</Text>
                    <Text variant="subheadline" tone="secondary">
                      Thursday, 14 October · 10:00 – 11:00
                    </Text>
                    <Text variant="footnote" tone="tertiary">
                      Apple Park · Caffè Macs, Room 4 · 6 invitees
                    </Text>
                    <Button size="sm" variant="tinted" onClick={() => setEventOpen(false)}>
                      Get Directions
                    </Button>
                  </Stack>
                </Popover>
              }
            />

            {/* --------------------------------- menu ------------------------ */}

            <Trigger
              title="Menu"
              description="Shortcuts on the trailing edge, separators grouping by consequence, and the destructive item alone at the bottom."
              gradient="purple"
              glyph={<MailGlyph />}
              action={
                <Menu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  items={mailActions}
                  aria-label="Message actions"
                  /* A pull-down button wears the chevron. Menu already sets
                   * aria-haspopup on whatever it is given; the glyph is what
                   * says the same thing to everyone else. */
                  trigger={
                    <Button variant="gray" trailingIcon={<ChevronDownGlyph />}>
                      Message
                    </Button>
                  }
                />
              }
            />

            {/* -------------------------------- tooltip ---------------------- */}

            <Trigger
              title="Tooltip"
              description="Names a control without explaining it. Opens on hover or keyboard focus after a beat, never on tap — a touch device gets the label some other way."
              gradient="gray"
              glyph={<StarGlyph />}
              action={
                <Tooltip label="Add to Favourites (⌘D)">
                  <Button variant="gray" leadingIcon={<StarGlyph />}>
                    Favourite
                  </Button>
                </Tooltip>
              }
            />

            {/* --------------------------------- toast ----------------------- */}

            <Trigger
              title="Toast"
              description="The one imperative surface: toast() is called from anywhere and rendered by the single MayHost mounted at the bottom of this screen."
              gradient="green"
              glyph={<BellGlyph />}
              action={
                <Stack direction="row" gap={2} wrap>
                  <Button
                    size="sm"
                    variant="tinted"
                    tone="success"
                    onClick={() =>
                      toast.success('Backup Complete', {
                        description: 'Last backed up to iCloud today at 4:12 AM.',
                      })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    size="sm"
                    variant="tinted"
                    tone="warning"
                    onClick={() =>
                      toast.warning('Low Power Mode', {
                        description: 'Background refresh and automatic downloads are paused.',
                        action: { label: 'Turn Off', onClick: () => {} },
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    size="sm"
                    variant="tinted"
                    tone="danger"
                    onClick={() =>
                      toast.danger('Payment Method Declined', {
                        description: 'Update your billing details to keep iCloud+ active.',
                        action: { label: 'Update', onClick: () => {} },
                        duration: 8000,
                      })
                    }
                  >
                    Danger
                  </Button>
                </Stack>
              }
            />

            {/* -------------------------------- popup ------------------------ */}

            <Trigger
              title="Popup"
              description="The phone-only sheet: raised from the bottom edge, masked, and padded past the home indicator. Used where a Sheet's title bar would be one row too many."
              gradient="pink"
              glyph={<LinkGlyph />}
              action={
                <Button variant="gray" onClick={() => setOverlay('share')}>
                  Share link
                </Button>
              }
            >
              <Popup visible={overlay === 'share'} onClose={close} title="Share Link">
                <List variant="plain">
                  <ListRow
                    title="Copy Link"
                    subtitle="halide.cam/g/kyoto-2024"
                    onClick={() => {
                      close()
                      toast('Link copied')
                    }}
                  />
                  <ListRow title="Add to Reading List" onClick={close} />
                  <ListRow title="Print" detail="HP LaserJet M283" onClick={close} />
                  <ListRow title="Remove Shared Link" destructive onClick={close} />
                </List>
              </Popup>
            </Trigger>
          </Grid>

          <Text variant="footnote" tone="tertiary">
            Sheet, Modal, Action Sheet, Alert Dialog and Popup are modal, so they share one piece of
            state — opening a second would stack two scrims and two focus traps. Popover, Menu and
            Tooltip are anchored and keep their own.
          </Text>
        </div>
      </div>

      {/* Mounted once per app, near the root. Without it toast() enqueues into a
        * store nothing is rendering, and the call silently does nothing. */}
      <MayHost />
    </div>
  )
}

/* ------------------------------- structure -------------------------------- */

/**
 * One card: what the overlay is, when to reach for it, and the control that
 * opens it. `CardFooter` pins the action to the bottom, so a row of cards with
 * descriptions of different lengths still lines its buttons up.
 *
 * `children` is where the overlay itself is written — inline, beside its
 * trigger. The Card clips its own corners, but a fixed-position descendant
 * resolves against the viewport rather than the card, so nothing is cut off.
 */
function Trigger({
  title,
  description,
  gradient,
  glyph,
  action,
  children,
}: {
  title: string
  description: string
  gradient: IconTileGradient
  glyph: ReactNode
  action: ReactNode
  children?: ReactNode
}) {
  return (
    <Card style={{ height: '100%' }}>
      <CardHeader
        accessory={
          <IconTile gradient={gradient} size="md">
            {glyph}
          </IconTile>
        }
      >
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>{action}</CardFooter>
      {children}
    </Card>
  )
}

/* -------------------------------- glyph set -------------------------------- */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 3.5v11M12 3.5L8.5 7M12 3.5L15.5 7M5.5 12.5v6a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5v-6" {...stroke} />
    </svg>
  )
}

function AlbumGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 7.5A1.5 1.5 0 015.5 6h13A1.5 1.5 0 0120 7.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16.5z" {...stroke} />
      <path d="M4 15l4-3.5 3 2.5 3.5-3 5.5 4.5" {...stroke} />
    </svg>
  )
}

function PhotoGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 8.5A1.5 1.5 0 015.5 7h2l1.2-2h6.6L16.5 7h2A1.5 1.5 0 0120 8.5v8a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16.5z" {...stroke} />
      <circle cx="12" cy="12.5" r="3.2" {...stroke} />
    </svg>
  )
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4.5 6.5h15M9.5 4.5h5M7 6.5V19a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0017 19V6.5M10.5 10v6.5M13.5 10v6.5" {...stroke} />
    </svg>
  )
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4.5 8A1.5 1.5 0 016 6.5h12A1.5 1.5 0 0119.5 8v10a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 18zM4.5 10.5h15M8.5 4.5v4M15.5 4.5v4" {...stroke} />
    </svg>
  )
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 8a1.5 1.5 0 011.5-1.5h13A1.5 1.5 0 0120 8v8a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16z" {...stroke} />
      <path d="M4.6 7.6l7.4 5.2 7.4-5.2" {...stroke} />
    </svg>
  )
}

function ReplyGlyph() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <path d="M8 5L3.5 9.5 8 14M4 9.5h7.5a5 5 0 015 5" {...stroke} />
    </svg>
  )
}

function FlagGlyph() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <path d="M5 17V4.2c3-1.6 6-.4 9 0v7.6c-3-1.4-6-2.6-9 0Z" {...stroke} />
    </svg>
  )
}

function CopyGlyph() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <path d="M5.5 5.5V3.2A1.2 1.2 0 016.7 2h6.1A1.2 1.2 0 0114 3.2v6.1a1.2 1.2 0 01-1.2 1.2h-2.3M3.2 5.5h6.1a1.2 1.2 0 011.2 1.2v6.1A1.2 1.2 0 019.3 14H3.2A1.2 1.2 0 012 12.8V6.7a1.2 1.2 0 011.2-1.2z" {...stroke} />
    </svg>
  )
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 4.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 16.5l-4.7 2.46.9-5.23-3.8-3.7 5.25-.77z" {...stroke} />
    </svg>
  )
}

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 4.5a5 5 0 015 5v3.2l1.5 2.8H5.5L7 12.7V9.5a5 5 0 015-5zM10 18.5a2 2 0 004 0" {...stroke} />
    </svg>
  )
}

function LinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M10 13.8a3.4 3.4 0 004.9.35l2.6-2.6a3.4 3.4 0 00-4.8-4.8l-1.3 1.3M14 10.2a3.4 3.4 0 00-4.9-.35l-2.6 2.6a3.4 3.4 0 004.8 4.8l1.3-1.3" {...stroke} />
    </svg>
  )
}

function ChevronDownGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path d="M4 6.25L8 10l4-3.75" {...stroke} />
    </svg>
  )
}
