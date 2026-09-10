import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  IoAdd,
  IoCalendar,
  IoCreateOutline,
  IoEllipsisHorizontal,
  IoFileTrayOutline,
  IoFolderOutline,
  IoShareOutline,
  IoStarOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { Accordion, AccordionItem } from '../components/Accordion'
import { ActionSheet } from '../components/ActionSheet'
import type { ActionSheetAction } from '../components/ActionSheet'
import { Alert } from '../components/Alert'
import { AlertDialog } from '../components/AlertDialog'
import { Avatar, AvatarGroup } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Box } from '../components/Box'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Checkbox } from '../components/Checkbox'
import { Collapsible } from '../components/Collapsible'
import { DescriptionItem, Descriptions } from '../components/Descriptions'
import { EmptyState } from '../components/EmptyState'
import { Fab } from '../components/Fab'
import { Field } from '../components/Field'
import { Grid } from '../components/Grid'
import { Heading } from '../components/Heading'
import { IconButton } from '../components/IconButton'
import { IconTile } from '../components/IconTile'
import { Input } from '../components/Input'
import { Kbd } from '../components/Kbd'
import { Label } from '../components/Label'
import { List, ListRow } from '../components/List'
import { Menu } from '../components/Menu'
import type { MenuItem } from '../components/Menu'
import { Modal } from '../components/Modal'
import { NavigationBar } from '../components/NavigationBar'
import { NoticeBar } from '../components/NoticeBar'
import { Pagination } from '../components/Pagination'
import { Popover } from '../components/Popover'
import { CircularProgress, Progress } from '../components/Progress'
import { Radio, RadioGroup } from '../components/RadioGroup'
import { SafeArea } from '../components/SafeArea'
import { ScrollArea } from '../components/ScrollArea'
import { SearchField } from '../components/SearchField'
import { SegmentedControl } from '../components/SegmentedControl'
import { Select } from '../components/Select'
import { Separator } from '../components/Separator'
import { Sheet } from '../components/Sheet'
import { Skeleton } from '../components/Skeleton'
import { Slider } from '../components/Slider'
import { Spinner } from '../components/Spinner'
import { Stack } from '../components/Stack'
import { Statistic } from '../components/Statistic'
import { Stepper } from '../components/Stepper'
import { Steps } from '../components/Steps'
import { Switch } from '../components/Switch'
import { Table } from '../components/Table'
import type { TableColumn } from '../components/Table'
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs'
import { Tag } from '../components/Tag'
import { Text } from '../components/Text'
import { Textarea } from '../components/Textarea'
import { Toast } from '../components/Toast'
import { Toolbar, ToolbarSpacer } from '../components/Toolbar'
import { Tooltip } from '../components/Tooltip'
import { VisuallyHidden } from '../components/VisuallyHidden'
import './CatalogAdaptive.css'

/**
 * Every specimen on this page is a component, not a workflow.
 *
 * A ListRow is only a ListRow once it navigates, and a NavigationBar without a
 * back button is a title. Both need a handler to take their real shape, and
 * there is nowhere for either to go from a catalogue — so they share this one
 * empty function, named for what it is rather than hidden behind eight
 * anonymous arrows that each look like an unfinished thought.
 */
const inert = () => {}

/* -------------------------------- content -------------------------------- */

interface StorageRow {
  name: string
  kind: string
  size: string
  modified: string
}

const STORAGE: StorageRow[] = [
  { name: 'Kyoto 2024', kind: 'Photos Library', size: '48.2 GB', modified: 'Today, 9:41 AM' },
  { name: 'Halide 4.1.3', kind: 'Application', size: '182.4 MB', modified: 'Yesterday' },
  { name: 'Q3 Review.key', kind: 'Keynote Document', size: '96.7 MB', modified: '12 Oct 2024' },
]

/*
 * `primary` decides which column becomes the row's title once the table
 * collapses on a phone — without it the collapsed shape would lead with
 * whichever column happens to be first, which is only right by accident.
 */
const STORAGE_COLUMNS: TableColumn<StorageRow>[] = [
  { key: 'name', header: 'Name', primary: true },
  { key: 'kind', header: 'Kind' },
  { key: 'size', header: 'Size', numeric: true },
  { key: 'modified', header: 'Modified' },
]

const FILE_ACTIONS: MenuItem[] = [
  { label: 'Get Info', shortcut: '⌘I', onSelect: inert },
  { label: 'Duplicate', shortcut: '⌘D', onSelect: inert },
  { label: 'Quick Look', shortcut: 'Space', onSelect: inert },
  { label: 'Move to Trash', shortcut: '⌘⌫', destructive: true, separator: true, onSelect: inert },
]

/**
 * The adaptive family, once each.
 *
 * This is the page you look at when the question is "does this all belong to
 * the same system?" — which is a question no single screen can answer, because
 * a screen picks the six components it needs and quietly proves nothing about
 * the other fifty-one. Here every adaptive component appears exactly once, in
 * the state it ships in, at a comparable width, grouped by what it is for.
 *
 * Three things follow from that brief:
 *
 * 1. **The chrome is plain HTML.** The masthead, the section headings and the
 *    captions are `h1`/`h2`/`p` styled from tokens, not `Text` and `Heading`.
 *    A catalogue that used the library to label the library would show `Text`
 *    thirty times and make the one-of-each promise unreadable.
 *
 * 2. **Composition still counts as once.** `ButtonGroup` needs buttons and
 *    `Tabs` needs tabs; a required child is part of its parent's specimen, not
 *    a second entry for itself. Every component still owns exactly one caption.
 *
 * 3. **Overlays are closed at rest.** `open` is `false` by default and a
 *    catalogue cannot show four scrims at once, so the modal four (`Sheet`,
 *    `Modal`, `ActionSheet`, `AlertDialog`) share one piece of state behind a
 *    trigger each, and their captions say so. They render inline — no portal —
 *    which is why each one sits in its own cell beside the button that opens it.
 *
 * MayProvider and MayHost are the two members of the family with no specimen
 * here: both are mounted once at the root of an app, and the gallery already
 * supplies them. Rendering a second host would double every toast on screen.
 */
export function CatalogAdaptive() {
  /* The modal overlays scrim the page and trap focus, so exactly one can be up
   * at a time — one piece of state rather than a boolean each. */
  const [overlay, setOverlay] = useState<'sheet' | 'modal' | 'actions' | 'alert' | null>(null)
  const close = () => setOverlay(null)

  const [page, setPage] = useState(3)

  const shareActions: ActionSheetAction[] = [
    { label: 'Save to Files', icon: <FolderGlyph />, onSelect: close },
    { label: 'Add to Shared Album', icon: <ShareGlyph />, onSelect: close },
    { label: 'Delete Photo', icon: <TrashGlyph />, destructive: true, onSelect: close },
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
      <div data-slot="scroll-area" className="cat-scroll">
        <div className="cat-inner">
          <header className="cat-masthead">
            <h1 className="cat-title">The Adaptive Family</h1>
            <p className="cat-lede">
              Fifty-seven components, once each, in the state they ship in. Everything here
              reshapes at 1024px — Sheet rises from the bottom edge on a phone and presents as a
              centred dialog on a Mac, ActionSheet becomes an anchored menu, Table collapses into
              grouped rows.
            </p>
          </header>

          {/* ------------------------------ layout ------------------------ */}

          <Section title="Layout" count={7}>
            <Cell name="Box">
              <Box surface="base" radius="card" padding={4} shadow="xs">
                <p className="cat-prose">
                  An elevated surface at the card radius, inset by one 16pt step. Surfaces
                  separate by value here — there is no bordered variant.
                </p>
              </Box>
            </Cell>

            <Cell name="Stack">
              <Stack direction="row" gap={3} align="center">
                <span className="cat-swatch" />
                <span className="cat-swatch" />
                <span className="cat-swatch" />
              </Stack>
            </Cell>

            <Cell name="Grid">
              <Grid minColumnWidth="4rem" gap={3}>
                <span className="cat-swatch cat-swatch--grid" />
                <span className="cat-swatch cat-swatch--grid" />
                <span className="cat-swatch cat-swatch--grid" />
                <span className="cat-swatch cat-swatch--grid" />
              </Grid>
            </Cell>

            <Cell name="Separator">
              <Separator label="or" />
            </Cell>

            <Cell name="SafeArea" note="pads past the notch and the home indicator">
              <SafeArea edges={['left', 'right']}>
                <p className="cat-ghost">
                  A div with padding and nothing else — pure CSS, so it is the right size on the
                  first frame and survives a rotation.
                </p>
              </SafeArea>
            </Cell>

            <Cell name="ScrollArea">
              <ScrollArea maxHeight="6rem">
                <p className="cat-prose">
                  iOS 18.2 — This update introduces Genmoji, adds ProRAW Max capture to the Camera
                  app, and improves Wi-Fi reliability on shared networks. It also fixes an issue
                  where Photos could fail to sync albums created on a Mac, an issue where the
                  keyboard could become unresponsive in Messages, and an issue where Focus filters
                  were not applied to Mail on first launch.
                </p>
              </ScrollArea>
            </Cell>

            <Cell name="VisuallyHidden" note="present in the DOM, invisible on screen">
              <VisuallyHidden>Layout — 7 of 57 components</VisuallyHidden>
              <p className="cat-ghost">Reachable by VoiceOver, drawn nowhere.</p>
            </Cell>
          </Section>

          {/* ---------------------------- typography ---------------------- */}

          <Section title="Typography" count={4}>
            <Cell name="Text">
              <Text>
                Everything in a Mail message, a Settings footnote and an App Store description is
                one of eleven named styles.
              </Text>
            </Cell>

            <Cell name="Heading">
              <Heading level={3}>Continue Watching</Heading>
            </Cell>

            <Cell name="Label">
              <Label>Display Name</Label>
            </Cell>

            <Cell name="Kbd" row>
              <Kbd>⌘K</Kbd>
            </Cell>
          </Section>

          {/* ------------------------------ actions ----------------------- */}

          <Section title="Actions" count={5}>
            <Cell name="Button" row>
              <Button>Continue</Button>
            </Cell>

            <Cell name="IconButton" row>
              <IconButton aria-label="Share">
                <ShareGlyph />
              </IconButton>
            </Cell>

            <Cell name="ButtonGroup" row>
              <ButtonGroup>
                <Button variant="gray">Day</Button>
                <Button variant="gray">Week</Button>
                <Button variant="gray">Month</Button>
              </ButtonGroup>
            </Cell>

            <Cell name="Fab" row>
              <Fab icon={<PlusGlyph />} aria-label="New Note" />
            </Cell>

            <Cell name="Toolbar" note="ToolbarSpacer splits the leading action off" wide>
              <Toolbar placement="bottom" align="start" separator>
                <IconButton aria-label="Compose" onClick={inert}>
                  <ComposeGlyph />
                </IconButton>
                <ToolbarSpacer />
                <IconButton aria-label="Move to Folder" onClick={inert}>
                  <FolderGlyph />
                </IconButton>
                <IconButton aria-label="Delete Message" tone="danger" onClick={inert}>
                  <TrashGlyph />
                </IconButton>
              </Toolbar>
            </Cell>
          </Section>

          {/* ------------------------------- forms ------------------------ */}

          <Section title="Forms" count={10}>
            <Cell name="Field" note="labels and describes the control inside it">
              <Field label="Recovery Email" description="Used only to reset your password.">
                <Input type="email" placeholder="marina@icloud.com" fullWidth />
              </Field>
            </Cell>

            <Cell name="Input">
              <Input placeholder="Album name" fullWidth />
            </Cell>

            <Cell name="Textarea">
              <Textarea rows={3} placeholder="Add a note about this shoot…" fullWidth />
            </Cell>

            <Cell name="SearchField">
              <SearchField placeholder="Search Mail" fullWidth />
            </Cell>

            <Cell name="Select">
              <Select
                fullWidth
                defaultValue="large"
                options={[
                  { label: 'Actual Size — 8064 × 6048', value: 'actual' },
                  { label: 'Large — 2048 px', value: 'large' },
                  { label: 'Medium — 1024 px', value: 'medium' },
                  { label: 'Small — 640 px', value: 'small' },
                ]}
              />
            </Cell>

            <Cell name="Checkbox">
              <Checkbox defaultChecked description="Uses cellular data when Wi-Fi is unavailable.">
                Sync over cellular
              </Checkbox>
            </Cell>

            <Cell name="RadioGroup" note="with Radio">
              <RadioGroup defaultValue="standard">
                <Radio value="standard">Standard — 3 to 5 days</Radio>
                <Radio value="express">Express — 2 days</Radio>
                <Radio value="overnight">Overnight — by 10:30 AM</Radio>
              </RadioGroup>
            </Cell>

            <Cell name="Switch">
              <Switch defaultChecked description="Reduces background activity until fully charged.">
                Low Power Mode
              </Switch>
            </Cell>

            <Cell name="Slider">
              <Slider defaultValue={62} showValue formatValue={(v) => `${v}%`} />
            </Cell>

            <Cell name="Stepper" row>
              <Stepper defaultValue={2} min={1} max={9} />
            </Cell>
          </Section>

          {/* ---------------------------- containment --------------------- */}

          <Section title="Containment" count={6}>
            <Cell name="Card" note="with CardHeader, CardTitle, CardDescription, CardBody, CardFooter">
              <Card>
                <CardHeader>
                  <CardTitle>iCloud Backup</CardTitle>
                  <CardDescription>Last backup: Today, 3:12 AM</CardDescription>
                </CardHeader>
                <CardBody>
                  <p className="cat-prose">
                    4.7 GB of 50 GB available. The next backup runs when this iPhone is locked and
                    on power.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button variant="tinted" size="sm" onClick={inert}>
                    Back Up Now
                  </Button>
                </CardFooter>
              </Card>
            </Cell>

            <Cell name="List" note="with ListRow">
              <List header="Devices" footer="Sign out of any device you no longer use.">
                <ListRow title="Marina’s iPhone 16 Pro" subtitle="This device" detail="iOS 18.2" onClick={inert} />
                <ListRow title="MacBook Pro 14″" subtitle="Kyoto" detail="macOS 15.1" onClick={inert} />
                <ListRow title="iPad Air" subtitle="Last used 3 days ago" detail="iPadOS 18.1" onClick={inert} />
              </List>
            </Cell>

            <Cell name="Accordion" note="with AccordionItem">
              <Accordion defaultValue={['shipping']}>
                <AccordionItem value="shipping" title="When will my order ship?">
                  <p className="cat-prose">
                    Orders placed before 2 PM ship the same business day from Cupertino.
                  </p>
                </AccordionItem>
                <AccordionItem value="returns" title="How do returns work?">
                  <p className="cat-prose">
                    Anything unopened can go back within 14 days, refunded to the original card.
                  </p>
                </AccordionItem>
              </Accordion>
            </Cell>

            <Cell name="Collapsible">
              <Collapsible trigger="Advanced Options">
                <p className="cat-prose">
                  Keep originals on this Mac, and upload ProRAW files at full resolution.
                </p>
              </Collapsible>
            </Cell>

            <Cell name="Descriptions" note="with DescriptionItem">
              <Descriptions header="File Info">
                <DescriptionItem label="Kind" value="ProRAW Image" />
                <DescriptionItem label="Dimensions" value="8064 × 6048" />
                <DescriptionItem label="Size" value="48.2 MB" />
                <DescriptionItem label="Captured" value="14 Oct 2024, 4:12 PM" />
              </Descriptions>
            </Cell>

            <Cell name="EmptyState">
              <EmptyState
                glyph={<TrayGlyph />}
                title="No Downloads"
                description="Films and episodes you download appear here, ready to watch offline."
              />
            </Cell>
          </Section>

          {/* -------------------------------- data ------------------------ */}

          <Section title="Data" count={6}>
            <Cell name="Table" note="collapses into grouped rows below 1024px" wide>
              <Table
                caption="Storage"
                columns={STORAGE_COLUMNS}
                data={STORAGE}
                rowKey="name"
              />
            </Cell>

            <Cell name="Badge" row>
              <Badge>Beta</Badge>
            </Cell>

            <Cell name="Tag" row>
              <Tag>ProRAW</Tag>
            </Cell>

            <Cell name="Avatar" note="with AvatarGroup" row>
              <Avatar name="Marina Küçük" size="lg" />
              <AvatarGroup max={3}>
                <Avatar name="Devin Raye" />
                <Avatar name="Priya Raman" />
                <Avatar name="Tobias Lind" />
                <Avatar name="Hana Osei" />
              </AvatarGroup>
            </Cell>

            <Cell name="IconTile" row>
              <IconTile gradient="indigo" size="md">
                <CalendarGlyph />
              </IconTile>
            </Cell>

            <Cell name="Statistic">
              <Statistic label="Move" value="1,284" unit="kcal" delta="+12.4%" direction="up" />
            </Cell>
          </Section>

          {/* ------------------------------ feedback ---------------------- */}

          <Section title="Feedback" count={6}>
            <Cell name="Alert" wide>
              <Alert tone="warning" title="Storage Almost Full">
                iCloud has 4.7 GB left. Backups will pause once it fills.
              </Alert>
            </Cell>

            <Cell name="NoticeBar" wide>
              <NoticeBar
                action={
                  <Button variant="plain" size="sm" onClick={inert}>
                    Details
                  </Button>
                }
              >
                Low Data Mode is on for “Kyoto Guesthouse”.
              </NoticeBar>
            </Cell>

            <Cell name="Progress" note="with CircularProgress">
              <Progress
                value={68}
                max={100}
                label="Downloading"
                showValue
                formatValue={(v, max) => `${((v / max) * 24).toFixed(1)} MB of 24 MB`}
              />
              <CircularProgress value={68} showValue aria-label="Downloading" />
            </Cell>

            <Cell name="Spinner" row>
              <Spinner />
            </Cell>

            <Cell name="Skeleton">
              <Skeleton lines={3} label="Loading messages" />
            </Cell>

            <Cell name="Toast" note="shown statically; toast() is the imperative API">
              <Toast
                title="Screenshot saved"
                description="Desktop · Screenshot 2024-10-14 at 16.12.png"
                tone="success"
                duration={0}
                dismissible={false}
                closeButton={false}
              />
            </Cell>
          </Section>

          {/* ----------------------------- navigation --------------------- */}

          <Section title="Navigation" count={6}>
            <Cell name="NavigationBar" wide>
              <NavigationBar
                title="Albums"
                subtitle="1,284 Photos"
                sticky={false}
                safeArea={false}
                onBack={inert}
                backLabel="Library"
                trailing={
                  <IconButton aria-label="More" onClick={inert}>
                    <EllipsisGlyph />
                  </IconButton>
                }
              />
            </Cell>

            <Cell name="Tabs" note="with TabList, Tab, TabPanel">
              <Tabs defaultValue="unread">
                <TabList>
                  <Tab value="all">All</Tab>
                  <Tab value="unread" badge="12">
                    Unread
                  </Tab>
                  <Tab value="flagged">Flagged</Tab>
                </TabList>
                <TabPanel value="all">
                  <p className="cat-prose">1,284 messages across four mailboxes.</p>
                </TabPanel>
                <TabPanel value="unread">
                  <p className="cat-prose">12 unread, oldest from Tuesday.</p>
                </TabPanel>
                <TabPanel value="flagged">
                  <p className="cat-prose">3 flagged for follow-up this week.</p>
                </TabPanel>
              </Tabs>
            </Cell>

            <Cell name="SegmentedControl">
              <SegmentedControl
                aria-label="Activity range"
                defaultValue="week"
                options={[
                  { label: 'Day', value: 'day' },
                  { label: 'Week', value: 'week' },
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]}
              />
            </Cell>

            <Cell name="Breadcrumb">
              <Breadcrumb
                items={[
                  { label: 'Macintosh HD', onClick: inert },
                  { label: 'Projects', onClick: inert },
                  { label: 'Kyoto 2024' },
                ]}
              />
            </Cell>

            <Cell name="Pagination">
              <Pagination size="sm" page={page} pageCount={8} onPageChange={setPage} />
            </Cell>

            <Cell name="Steps" wide>
              <Steps
                current={1}
                items={[
                  { title: 'Cart', description: '3 items' },
                  { title: 'Shipping', description: 'Express, 2 days' },
                  { title: 'Payment', description: 'Apple Pay' },
                  { title: 'Review', description: '$1,299.00' },
                ]}
              />
            </Cell>
          </Section>

          {/* ------------------------------ overlays ---------------------- */}

          <Section title="Overlays" count={7}>
            <Cell name="Sheet" note="opens on click" row>
              <Button variant="tinted" onClick={() => setOverlay('sheet')}>
                Open Sheet
              </Button>
              <Sheet
                open={overlay === 'sheet'}
                onClose={close}
                title="Share Photo"
                description="IMG_4022.RAW · 48.2 MB"
                footer={
                  <Button fullWidth onClick={close}>
                    Done
                  </Button>
                }
              >
                <p className="cat-prose">
                  Rises from the bottom edge on a phone, with a grabber and drag-to-dismiss;
                  presents as a centred panel past 1024px.
                </p>
              </Sheet>
            </Cell>

            <Cell name="Modal" note="opens on click" row>
              <Button variant="tinted" onClick={() => setOverlay('modal')}>
                Open Modal
              </Button>
              <Modal
                open={overlay === 'modal'}
                onClose={close}
                title="Rename Album"
                description="This album is shared with 4 people. They will see the new name."
                footer={
                  <>
                    <Button variant="gray" onClick={close}>
                      Cancel
                    </Button>
                    <Button onClick={close}>Rename</Button>
                  </>
                }
              >
                <p className="cat-prose">Currently named “Kyoto 2024”.</p>
              </Modal>
            </Cell>

            <Cell name="ActionSheet" note="opens on click; an anchored menu on desktop" row>
              <Button variant="tinted" onClick={() => setOverlay('actions')}>
                Open ActionSheet
              </Button>
              <ActionSheet
                open={overlay === 'actions'}
                onClose={close}
                title="IMG_4022.RAW"
                description="Taken 14 Oct 2024 in Higashiyama"
                actions={shareActions}
              />
            </Cell>

            <Cell name="AlertDialog" note="opens on click" row>
              <Button variant="tinted" tone="danger" onClick={() => setOverlay('alert')}>
                Open AlertDialog
              </Button>
              <AlertDialog
                open={overlay === 'alert'}
                title="Delete “Kyoto 2024”?"
                description="The album is deleted from every device. The 412 photos in it stay in your library."
                confirmLabel="Delete Album"
                destructive
                onConfirm={close}
                onCancel={close}
              />
            </Cell>

            <Cell name="Popover" note="opens on click, anchored to its trigger" row>
              <Popover
                aria-label="Backup details"
                trigger={<Button variant="gray">Backup Details</Button>}
              >
                <p className="cat-prose">
                  Last backup: Today, 3:12 AM over Wi-Fi. 4.7 GB of 50 GB available.
                </p>
              </Popover>
            </Cell>

            <Cell name="Tooltip" note="appears on hover or focus, after a delay" row>
              <Tooltip label="Add to Favourites">
                <IconButton aria-label="Add to Favourites" onClick={inert}>
                  <StarGlyph />
                </IconButton>
              </Tooltip>
            </Cell>

            <Cell name="Menu" note="opens on click" row>
              <Menu
                aria-label="File actions"
                trigger={<Button variant="gray">File</Button>}
                items={FILE_ACTIONS}
              />
            </Cell>
          </Section>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- chrome -------------------------------- */

/**
 * A group of specimens under one heading.
 *
 * The count is written out rather than derived from `children.length`, because
 * a cell can hold a component and its required parts — `Tabs` with its `Tab`s,
 * `Avatar` with `AvatarGroup` — and the number that matters is how many entries
 * the group claims, not how many React children happen to be in it.
 */
function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="cat-section">
      <div className="cat-section-head">
        <h2 className="cat-section-title">{title}</h2>
        <span className="cat-section-rule" />
        <span className="cat-section-count">{count}</span>
      </div>
      <div className="cat-grid">{children}</div>
    </section>
  )
}

/** One specimen, and the caption naming it. */
function Cell({
  name,
  note,
  wide = false,
  row = false,
  children,
}: {
  name: string
  /** Anything the specimen cannot say for itself — chiefly "opens on click". */
  note?: string
  /** Span the full row: bars, tables and horizontal steppers need the width. */
  wide?: boolean
  /** Lay the specimen out inline, for the small controls. */
  row?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? 'cat-cell cat-cell--wide' : 'cat-cell'}>
      <div className={row ? 'cat-stage cat-stage--row' : 'cat-stage'}>{children}</div>
      <p className="cat-caption">
        {name}
        {note ? <span className="cat-caption-note"> — {note}</span> : null}
      </p>
    </div>
  )
}

/* --------------------------------- glyphs -------------------------------- */

function ShareGlyph() {
  return <IoShareOutline aria-hidden />
}

function PlusGlyph() {
  return <IoAdd aria-hidden />
}

function ComposeGlyph() {
  return <IoCreateOutline aria-hidden />
}

function FolderGlyph() {
  return <IoFolderOutline aria-hidden />
}

function TrashGlyph() {
  return <IoTrashOutline aria-hidden />
}

function EllipsisGlyph() {
  return <IoEllipsisHorizontal aria-hidden />
}

function CalendarGlyph() {
  return <IoCalendar aria-hidden />
}

function StarGlyph() {
  return <IoStarOutline aria-hidden />
}

function TrayGlyph() {
  return <IoFileTrayOutline aria-hidden />
}
