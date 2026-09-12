import { useState } from 'react'
import {
  IoCheckmark,
  IoCopyOutline,
  IoFolderOutline,
  IoHeartOutline,
  IoShareOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { ActionSheet } from '../components/ActionSheet'
import { Badge } from '../components/Badge'
import { Grid } from '../components/Grid'
import { IconButton } from '../components/IconButton'
import { SegmentedControl } from '../components/SegmentedControl'
import { Select } from '../components/Select'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { toast } from '../components/Toast'
import { Toolbar } from '../components/Toolbar'
import { NavBar } from '../mobile/NavBar'

interface Photo {
  /** The camera's own filename, which is what Photos shows in the info panel. */
  id: string
  /** Spoken name of the tile — a picture with no alt text is a hole in the grid. */
  label: string
  /** Stand-in for the image, mixed from the system palette. */
  plate: string
  /** Frames in a burst. Photos stacks them behind one tile with the count on top. */
  burst?: number
  /** Video length, drawn where Photos draws it. */
  duration?: string
}

/**
 * One October afternoon's worth of camera roll. Real filenames, in the order
 * the camera wrote them, because a grid of "Photo 1 / Photo 2" teaches nothing
 * about how a library actually reads.
 */
const PHOTOS: Photo[] = [
  { id: 'IMG_4818', label: 'Fog over the Marin Headlands', plate: 'linear-gradient(155deg, var(--may-teal), var(--may-indigo))' },
  { id: 'IMG_4819', label: 'Ferry Building clock tower', plate: 'linear-gradient(200deg, var(--may-orange), var(--may-pink))' },
  { id: 'IMG_4820', label: 'Sourdough on the counter', plate: 'linear-gradient(165deg, var(--may-yellow), var(--may-brown))' },
  { id: 'IMG_4821', label: 'Sutro Baths at low tide', plate: 'linear-gradient(180deg, var(--may-cyan), var(--may-blue))', burst: 24 },
  { id: 'IMG_4823', label: 'Ella on the swing', plate: 'linear-gradient(140deg, var(--may-green), var(--may-teal))', duration: '0:18' },
  { id: 'IMG_4824', label: 'Succulents on the fire escape', plate: 'linear-gradient(190deg, var(--may-mint), var(--may-green))' },
  { id: 'IMG_4826', label: 'Golden Gate from Baker Beach', plate: 'linear-gradient(160deg, var(--may-red), var(--may-orange))' },
  { id: 'IMG_4827', label: 'Cable car on Hyde Street', plate: 'linear-gradient(200deg, var(--may-brown), var(--may-yellow))' },
  { id: 'IMG_4828', label: 'Rooftop water tanks', plate: 'linear-gradient(150deg, var(--may-gray), var(--may-blue))' },
  { id: 'IMG_4830', label: 'Sea lions at Pier 39', plate: 'linear-gradient(175deg, var(--may-purple), var(--may-pink))', burst: 8 },
  { id: 'IMG_4831', label: 'Espresso at Caffè Trieste', plate: 'linear-gradient(210deg, var(--may-brown), var(--may-red))' },
  { id: 'IMG_4832', label: 'Painted Ladies at dusk', plate: 'linear-gradient(160deg, var(--may-indigo), var(--may-purple))' },
  { id: 'IMG_4834', label: 'Bay Bridge lights', plate: 'linear-gradient(185deg, var(--may-blue), var(--may-indigo))', duration: '1:02' },
  { id: 'IMG_4836', label: 'Eucalyptus on Mount Sutro', plate: 'linear-gradient(145deg, var(--may-green), var(--may-mint))' },
  { id: 'IMG_4838', label: 'Ocean Beach bonfire', plate: 'linear-gradient(205deg, var(--may-orange), var(--may-red))' },
  { id: 'IMG_4839', label: 'Farmers market dahlias', plate: 'linear-gradient(170deg, var(--may-pink), var(--may-purple))', burst: 132 },
  { id: 'IMG_4841', label: 'Muir Woods trailhead', plate: 'linear-gradient(155deg, var(--may-teal), var(--may-green))' },
  { id: 'IMG_4842', label: 'Rain on the studio window', plate: 'linear-gradient(195deg, var(--may-gray), var(--may-teal))' },
]

const SCOPES = [
  { label: 'Years', value: 'years' },
  { label: 'Months', value: 'months' },
  { label: 'Days', value: 'days' },
  { label: 'All Photos', value: 'all' },
]

/**
 * The Photos library.
 *
 * Two things here are worth copying. First, the grid is `minColumnWidth`, not a
 * fixed column count: the wall reflows from three columns on a phone to six on
 * a tablet with no media query and no resize listener, and the tiles stay
 * square because each one owns its own aspect ratio.
 *
 * Second, the bottom bar acts on a SELECTION, so its actions are disabled until
 * there is something to act on — a share sheet raised over an empty selection
 * is the classic ported-toolbar bug. Share opens an `ActionSheet`, which is the
 * whole point of that component: the same four actions present as an iOS sheet
 * under a thumb and as an anchored menu under a mouse.
 */
export function PhotosScreen() {
  const [scope, setScope] = useState('all')
  const [selected, setSelected] = useState<string[]>(['IMG_4821', 'IMG_4826'])
  const [shareOpen, setShareOpen] = useState(false)

  const count = selected.length
  const noun = count === 1 ? 'Photo' : 'Photos'

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--may-color-bg)' }}>
      {/*
       * The scroller, not the screen, is what NavBar sticks inside: a sticky
       * element needs a scrolling ancestor, and the flex column above it never
       * scrolls. `minHeight: 0` is what lets this pane shrink below its content
       * so the toolbar keeps its place at the bottom.
       */}
      <div data-slot="scroll-area" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <NavBar
          title="Library"
          trailing={
            <Select
              size="sm"
              aria-label="Filter library"
              defaultValue="all"
              options={[
                { label: 'All Items', value: 'all' },
                { label: 'Favourites', value: 'favourites' },
                { label: 'Screenshots', value: 'screenshots' },
                { label: 'Shared with You', value: 'shared' },
              ]}
            />
          }
        />

        <div style={{ padding: 'var(--may-space-3) var(--may-space-4)' }}>
          <SegmentedControl
            aria-label="Library scope"
            options={SCOPES}
            value={scope}
            onValueChange={setScope}
            fullWidth
          />
        </div>

        <Stack
          direction="row"
          align="baseline"
          justify="between"
          style={{ padding: '0 var(--may-space-4) var(--may-space-2)' }}
        >
          <Text variant="headline">Tuesday, 14 October</Text>
          <Text variant="footnote" tone="secondary">
            San Francisco
          </Text>
        </Stack>

        {/*
         * gap 1 rather than 0: a hairline of page showing between tiles is what
         * separates two photos that happen to share an edge colour. The grid
         * runs full-bleed — a photo wall inset from the screen edges reads as a
         * widget rather than as the library.
         */}
        <Grid minColumnWidth={110} gap={1}>
          {PHOTOS.map((photo) => {
            const isSelected = selected.includes(photo.id)
            return (
              <button
                key={photo.id}
                type="button"
                className="may-photo-tile"
                aria-pressed={isSelected}
                aria-label={photo.label}
                onClick={() => toggle(photo.id)}
              >
                <span className="may-photo-tile__plate" style={{ background: photo.plate }} />
                {photo.burst !== undefined && (
                  <Badge
                    className="may-photo-tile__badge"
                    variant="solid"
                    tone="neutral"
                    count={photo.burst}
                  />
                )}
                {photo.duration && (
                  <Text
                    as="span"
                    className="may-photo-tile__duration"
                    variant="caption-2"
                    weight="semibold"
                    mono
                  >
                    {photo.duration}
                  </Text>
                )}
                {isSelected && (
                  <span className="may-photo-tile__check" aria-hidden>
                    <IoCheckmark aria-hidden />
                  </span>
                )}
              </button>
            )
          })}
        </Grid>

        <Text
          variant="footnote"
          tone="secondary"
          align="center"
          style={{ padding: 'var(--may-space-5) var(--may-space-4)' }}
        >
          1,284 Photos · 62 Videos
        </Text>
      </div>

      {/*
       * A real bar in the layout rather than a floating one: the scroller above
       * already stops where the bar starts, so nothing is ever hidden behind it
       * and no bottom padding has to be guessed.
       */}
      <Toolbar placement="bottom" variant="surface" separator safeArea align="between">
        <IconButton
          aria-label={`Share ${count} ${noun.toLowerCase()}`}
          disabled={count === 0}
          onClick={() => setShareOpen(true)}
        >
          <IoShareOutline aria-hidden />
        </IconButton>

        <Text variant="subheadline" weight="semibold" tone={count === 0 ? 'tertiary' : 'default'}>
          {count === 0 ? 'Select Items' : `${count} ${noun} Selected`}
        </Text>

        <Stack direction="row" gap={1}>
          <IconButton
            aria-label="Add to favourites"
            disabled={count === 0}
            onClick={() => toast(`Added ${count} ${noun.toLowerCase()} to Favourites`)}
          >
            <IoHeartOutline aria-hidden />
          </IconButton>
          <IconButton
            aria-label="Delete"
            tone="danger"
            disabled={count === 0}
            onClick={() => {
              setSelected([])
              toast(`${count} ${noun} deleted`, { tone: 'danger' })
            }}
          >
            <IoTrashOutline aria-hidden />
          </IconButton>
        </Stack>
      </Toolbar>

      {/*
       * Overlays render inline with a fixed scrim, so the sheet can live right
       * here beside the bar that raises it instead of at some portal root.
       * Destructive last, always: iOS sorts it there so a thumb travelling to
       * Cancel never passes over Delete.
       */}
      <ActionSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${count} ${noun} Selected`}
        description="Shared items keep their edits and location."
        actions={[
          { label: 'AirDrop', icon: <AirDropIcon />, onSelect: () => toast('Sent to Marco’s iPhone', { tone: 'success' }) },
          { label: 'Copy', icon: <IoCopyOutline aria-hidden />, onSelect: () => toast(`${count} ${noun} copied`) },
          { label: 'Save to Files', icon: <IoFolderOutline aria-hidden />, onSelect: () => toast('Saved to iCloud Drive') },
          {
            label: `Delete ${count} ${noun}`,
            icon: <IoTrashOutline aria-hidden />,
            destructive: true,
            onSelect: () => {
              setSelected([])
              toast(`${count} ${noun} deleted`, { tone: 'danger' })
            },
          },
        ]}
      />

    </div>
  )
}

/* ------------------------------- glyph set -------------------------------- */
/* AirDrop only: Ionicons has no AirDrop mark, and the nearest arcs in the set
 * are Wi-Fi, which means reception rather than a transfer. */

/** The AirDrop radar: an arc stack over a droplet. */
function AirDropIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6.4 14.6a7.9 7.9 0 0111.2 0" />
        <path d="M9.1 17.3a4.1 4.1 0 015.8 0" />
        <path d="M3.7 11.9a11.7 11.7 0 0116.6 0" />
      </g>
      <circle cx="12" cy="19.9" r="1.6" fill="currentColor" />
    </svg>
  )
}
