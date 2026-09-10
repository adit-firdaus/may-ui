import { useRef, useState } from 'react'
import {
  IoAirplane,
  IoBluetooth,
  IoCellular,
  IoHourglass,
  IoRadio,
  IoSettings,
  IoSunny,
  IoVolumeHigh,
  IoWifi,
} from 'react-icons/io5'
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
                  <IoAirplane aria-hidden />
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
                  <IoWifi aria-hidden />
                </IconTile>
              }
              title="Wi-Fi"
              detail={airplaneMode ? 'Off' : 'HomeNet'}
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <IoBluetooth aria-hidden />
                </IconTile>
              }
              title="Bluetooth"
              detail="On"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="green">
                  <IoCellular aria-hidden />
                </IconTile>
              }
              title="Cellular"
              detail="12.4 GB used"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="green">
                  <IoRadio aria-hidden />
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
                  <IoSettings aria-hidden />
                </IconTile>
              }
              title="General"
              detail="1 Update"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <IoSunny aria-hidden />
                </IconTile>
              }
              title="Display & Brightness"
              detail="Automatic"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="pink">
                  <IoVolumeHigh aria-hidden />
                </IconTile>
              }
              title="Sounds & Haptics"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="indigo">
                  <IoHourglass aria-hidden />
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
