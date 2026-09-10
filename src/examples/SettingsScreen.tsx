import { useRef, useState } from 'react'
import { AlertDialog } from '../components/AlertDialog'
import { Avatar } from '../components/Avatar'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { NavigationBar } from '../components/NavigationBar'
import { SearchField } from '../components/SearchField'
import { Switch } from '../components/Switch'

/**
 * iOS Settings, composed out of the catalogue.
 *
 * Four pieces of the screen are load-bearing rather than decorative, and each
 * of them is a rule the rest of the examples follow:
 *
 * 1. **The scroller is a real element, and the bar knows about it.** The large
 *    title collapses against `scrollRef`, not the window — inside a device
 *    frame (or a split view, or a sheet) the window never scrolls at all, so a
 *    bar left listening on it would sit there uncollapsed forever.
 *
 * 2. **`accessory` suppresses the chevron.** That single rule is the whole
 *    difference between a row that navigates (Wi-Fi → its own screen, chevron,
 *    `detail` showing the current value) and a row that toggles in place
 *    (Airplane Mode → a `Switch`, no chevron, nothing to drill into).
 *
 * 3. **Groups carry their own spacing.** `List` header and footer already pad
 *    above and below the card, so the column between them only needs a small
 *    gap; adding a generous one on top is how grouped lists end up drifting
 *    apart from each other.
 *
 * 4. **The destructive row asks first.** `AlertDialog` renders inline with a
 *    fixed scrim, so it can live at the bottom of the tree next to the state
 *    it guards rather than being hoisted to a portal at the root.
 */
export function SettingsScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [airplaneMode, setAirplaneMode] = useState(false)
  const [hotspot, setHotspot] = useState(true)
  const [confirming, setConfirming] = useState(false)
  /* The footer doubles as the receipt for the reset — grouped lists put their
   * status text exactly here, so there is no need for a banner. */
  const [resetNote, setResetNote] = useState(
    'This will not affect any of your data or media.',
  )

  const resetAll = () => {
    setAirplaneMode(false)
    setHotspot(true)
    setResetNote('All settings were reset to their defaults just now.')
    setConfirming(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: 'var(--may-color-bg)',
        }}
      >
        {/* Sticky inside the scroller above, which is what makes the collapse
            resolve against this pane instead of the page. */}
        <NavigationBar title="Settings" largeTitle scrollRef={scrollRef} />

        <div style={{ padding: '0 var(--may-space-4) var(--may-space-2)' }}>
          <SearchField fullWidth placeholder="Search" aria-label="Search settings" />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-2)',
            padding:
              'var(--may-space-2) var(--may-space-4) calc(var(--may-inset-bottom) + var(--may-space-10))',
          }}
        >
          {/* The Apple ID row. One row, one card — iOS gives the account its
              own group so it never reads as the first item of a section. */}
          <List footer="iCloud+ with 2 TB renews on 12 October.">
            <ListRow
              leading={<Avatar name="Marcus Whitfield" size="lg" />}
              title="Marcus Whitfield"
              subtitle="Apple ID, iCloud, Media & Purchases"
              onClick={() => {}}
            />
          </List>

          <List
            header="Connections"
            footer="Personal Hotspot shares this iPhone's cellular data with your nearby devices."
          >
            {/* Switch rows: `accessory` and no `detail`, so no chevron. */}
            <ListRow
              leading={
                <IconTile gradient="orange">
                  <AirplaneIcon />
                </IconTile>
              }
              title="Airplane Mode"
              accessory={
                <Switch
                  checked={airplaneMode}
                  onCheckedChange={setAirplaneMode}
                  aria-label="Airplane Mode"
                />
              }
            />
            {/* Navigating rows: `detail` carries the current value, and the
                chevron says the real choice lives one level down. */}
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <WifiIcon />
                </IconTile>
              }
              title="Wi-Fi"
              detail={airplaneMode ? 'Off' : 'HomeNet'}
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <BluetoothIcon />
                </IconTile>
              }
              title="Bluetooth"
              detail="On"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="green">
                  <CellularIcon />
                </IconTile>
              }
              title="Cellular"
              detail="12.4 GB used"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="green">
                  <HotspotIcon />
                </IconTile>
              }
              title="Personal Hotspot"
              accessory={
                <Switch checked={hotspot} onCheckedChange={setHotspot} aria-label="Personal Hotspot" />
              }
            />
          </List>

          <List header="System" footer="Screen Time reports cover the last seven days.">
            <ListRow
              leading={
                <IconTile gradient="gray">
                  <GearIcon />
                </IconTile>
              }
              title="General"
              detail="1 Update"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <BrightnessIcon />
                </IconTile>
              }
              title="Display & Brightness"
              detail="Automatic"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="pink">
                  <SpeakerIcon />
                </IconTile>
              }
              title="Sounds & Haptics"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="indigo">
                  <HourglassIcon />
                </IconTile>
              }
              title="Screen Time"
              detail="3h 12m"
              onClick={() => {}}
            />
          </List>

          {/* `destructive` tints the label red; the confirmation is what makes
              it safe, not the colour. `chevron={false}` overrides the default a
              tappable row would otherwise take — nothing is being navigated to,
              an alert is being raised, and a chevron would promise a screen. */}
          <List footer={resetNote}>
            <ListRow
              title="Reset All Settings"
              destructive
              chevron={false}
              onClick={() => setConfirming(true)}
            />
          </List>
        </div>
      </div>

      {/* Inline, next to the state it guards. The scrim resolves against the
          nearest containing block — the device frame here, the page on desktop. */}
      <AlertDialog
        open={confirming}
        title="Reset All Settings?"
        description="Every system setting returns to its default. Your apps, data and media are left alone."
        confirmLabel="Reset"
        destructive
        onConfirm={resetAll}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}

/* ------------------------------- glyph set -------------------------------- */

/* One stroke recipe for the whole set, so the tiles read as a single family
 * rather than as eight icons that happened to land in the same list. */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function AirplaneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 3c.9 0 1.4.8 1.4 1.8v4.4l6.6 3.9v1.9l-6.6-2v3.9l2.2 1.6v1.4L12 19.6l-3.6 1.3v-1.4l2.2-1.6V14l-6.6 2v-1.9l6.6-3.9V4.8C10.6 3.8 11.1 3 12 3z" fill="currentColor" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M3.5 9.2a13 13 0 0 1 17 0M6.6 12.6a8.4 8.4 0 0 1 10.8 0M9.7 16a3.8 3.8 0 0 1 4.6 0" {...stroke} />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" />
    </svg>
  )
}

function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M8 7.5 16 16.5 12 20V4l4 3.5L8 16.5" {...stroke} />
    </svg>
  )
}

function CellularIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="3" y="15" width="3" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="11.5" width="3" height="8.5" rx="1" fill="currentColor" />
      <rect x="13" y="8" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="18" y="4.5" width="3" height="15.5" rx="1" fill="currentColor" />
    </svg>
  )
}

function HotspotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" {...stroke} />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" {...stroke} />
      <path d="M12 2.8l1.5 2.1 2.5-.6.6 2.5 2.1 1.5-1.3 2.2 1.3 2.2-2.1 1.5-.6 2.5-2.5-.6L12 21.2l-1.5-2.1-2.5.6-.6-2.5-2.1-1.5 1.3-2.2-1.3-2.2 2.1-1.5.6-2.5 2.5.6z" {...stroke} />
    </svg>
  )
}

function BrightnessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" {...stroke} />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M11.5 4.4 6.8 8.4H3.6v7.2h3.2l4.7 4V4.4z" fill="currentColor" />
      <path d="M15.4 9a4.2 4.2 0 0 1 0 6M18.2 6.2a8 8 0 0 1 0 11.6" {...stroke} />
    </svg>
  )
}

function HourglassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="8.6" {...stroke} />
      <path d="M12 6.8V12l3.4 2.2" {...stroke} />
    </svg>
  )
}
