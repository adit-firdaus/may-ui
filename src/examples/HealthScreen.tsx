import { useRef } from 'react'
import {
  IoFootsteps,
  IoHeart,
  IoLocation,
  IoMoon,
  IoPersonOutline,
  IoSunny,
  IoWalk,
} from 'react-icons/io5'
import { Box } from '../components/Box'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/Card'
import { Grid } from '../components/Grid'
import { IconButton } from '../components/IconButton'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { NavigationBar } from '../components/NavigationBar'
import { CircularProgress } from '../components/Progress'
import { Stack } from '../components/Stack'
import { Statistic } from '../components/Statistic'
import { Text } from '../components/Text'

/**
 * A day in Health's Summary tab.
 *
 * Two structural things are worth copying out of this screen.
 *
 * The scroller is ours, not the page's: `NavigationBar` is `position: sticky`
 * and collapses against whatever container it is handed, so the large title
 * only animates if it is *inside* the overflow element and `scrollRef` points
 * at that same element. Sticky against the window would be wrong here — a
 * phone screen has its own scroll box.
 *
 * And nothing on the page carries a width. The rings sit in a `justify=
 * "between"` row, the tiles come from a `minColumnWidth` grid that is one
 * column on a phone and three on a tablet, and the bar chart's bars are flex
 * children — so the same component fills a 390pt screen and a split view
 * without a single media query.
 */
export function HealthScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}
      >
        <NavigationBar
          title="Summary"
          largeTitle
          scrollRef={scrollRef}
          trailing={
            <IconButton aria-label="Your profile" round variant="gray">
              <PersonIcon />
            </IconButton>
          }
        />

        <Stack
          gap={4}
          style={{
            padding: 'var(--may-space-4)',
            paddingBlockStart: 'var(--may-space-2)',
            // Clears the home indicator: the safe-area inset is added to the
            // page's own gutter rather than replacing it.
            paddingBlockEnd: 'calc(var(--may-inset-bottom) + var(--may-space-4))',
          }}
        >
          {/* ------------------------- activity rings ------------------------ */}
          {/*
           * Three rings, three tones — Move is `danger`, Exercise `success`,
           * Stand `tint`. The percentage rides inside the ring as `children`,
           * which wins over `showValue`, and the goal is spelled out
           * underneath: a ring alone tells you how far round you are but never
           * what the target was.
           */}
          <Card variant="grouped" padding="md">
            <CardHeader
              accessory={
                <Text variant="footnote" tone="tertiary">
                  Today
                </Text>
              }
            >
              <CardTitle>Activity</CardTitle>
              <CardDescription>Two rings left to close.</CardDescription>
            </CardHeader>

            {/* The Card's own --may-card-gap already separates this from the
                header, so the row adds no spacing of its own. */}
            <Stack direction="row" justify="between" align="start">
              <RingStat
                tone="danger"
                value={462}
                max={500}
                centre="92%"
                label="Move"
                detail="462/500 KCAL"
              />
              <RingStat
                tone="success"
                value={38}
                max={30}
                centre="100%"
                label="Exercise"
                detail="38/30 MIN"
              />
              <RingStat
                tone="tint"
                value={9}
                max={12}
                centre="75%"
                label="Stand"
                detail="9/12 HRS"
              />
            </Stack>
          </Card>

          {/* --------------------------- metric tiles ------------------------ */}
          {/*
           * `minColumnWidth` rather than `columns`, and the floor is set by
           * the longest label: a Statistic's label never wraps, so "Resting
           * Heart Rate" beside a 44pt tile is what decides that a phone gets
           * one column and a tablet gets three. A fixed `columns={2}` would
           * have shipped an ellipsis at 390pt.
           *
           * Resting heart rate carries `invertDelta` — falling is the good
           * direction, and the green arrow has to agree with that.
           */}
          <Grid minColumnWidth="12rem" gap={3}>
            <Statistic
              variant="card"
              label="Steps"
              value="9,412"
              delta="6%"
              direction="up"
              trailing={
                <IconTile gradient="orange" size="md">
                  <ShoeIcon />
                </IconTile>
              }
            />
            <Statistic
              variant="card"
              label="Distance"
              value="4.1"
              unit="mi"
              delta="0.3 mi"
              direction="up"
              trailing={
                <IconTile gradient="teal" size="md">
                  <MapPinIcon />
                </IconTile>
              }
            />
            <Statistic
              variant="card"
              label="Flights Climbed"
              value="14"
              delta="2"
              direction="down"
              trailing={
                <IconTile gradient="green" size="md">
                  <StairsIcon />
                </IconTile>
              }
            />
            <Statistic
              variant="card"
              label="Resting Heart Rate"
              value="54"
              unit="bpm"
              delta="3 bpm"
              direction="down"
              invertDelta
              trailing={
                <IconTile gradient="pink" size="md">
                  <HeartIcon />
                </IconTile>
              }
            />
          </Grid>

          {/* -------------------------- the week's steps --------------------- */}
          {/*
           * A chart with no charting library: seven `Box` bars whose heights
           * are steps on the 4px scale, in a row that aligns them to a shared
           * baseline. Sunday is the tall one, and it is the only bar drawn in
           * the tint — the rest are quaternary fill, so the week reads as
           * context and today reads as the value.
           */}
          <Card variant="grouped" padding="md">
            <CardHeader
              accessory={
                <Text variant="footnote" tone="tint">
                  9,412 avg
                </Text>
              }
            >
              <CardTitle>Steps</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>

            {/*
             * Bars and their axis labels are ONE child of the card, gapped at
             * 2 — dropped in as two children they would inherit the card's own
             * 4 and the labels would float away from the week they name.
             */}
            <Stack gap={2}>
              <Stack
                direction="row"
                align="end"
                justify="between"
                gap={2}
                // Seven unlabelled divs say nothing to a screen reader, so the
                // chart is one image with the week spoken as a sentence.
                role="img"
                aria-label="Steps each day this week, Monday through Sunday: 7,204; 8,860; 5,932; 11,418; 9,077; 4,315; 9,412."
              >
                {WEEK.map((day) => (
                  <Bar key={day.id} {...day} />
                ))}
              </Stack>

              {/* Same gap and the same `flex: 1 1 0` as the bars, which is what
                  keeps every letter centred under its own column. */}
              <Stack direction="row" justify="between" gap={2}>
                {WEEK.map((day) => (
                  <Text
                    key={day.id}
                    as="span"
                    variant="caption-2"
                    align="center"
                    tone={day.today ? 'default' : 'tertiary'}
                    weight={day.today ? 'semibold' : undefined}
                    style={{ flex: '1 1 0' }}
                  >
                    {day.label}
                  </Text>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* ---------------------------- highlights ------------------------- */}
          {/*
           * The Settings shape reused as a feed: an IconTile leads each row,
           * the trend is the subtitle, and `onClick` turns every row into a
           * real button with its own chevron.
           */}
          <List header="Highlights" footer="Highlights update as new data arrives from your devices.">
            <ListRow
              leading={
                <IconTile gradient="pink">
                  <HeartIcon />
                </IconTile>
              }
              title="Cardio Fitness"
              subtitle="VO2 max 42.8 — above average for your age"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="indigo">
                  <MoonIcon />
                </IconTile>
              }
              title="Sleep"
              subtitle="7 hr 12 min average, 18 min more than last week"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="yellow">
                  <SunIcon />
                </IconTile>
              }
              title="Time in Daylight"
              subtitle="42 min a day — your best week since April"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="teal">
                  <WalkIcon />
                </IconTile>
              }
              title="Walking Steadiness"
              subtitle="OK, and steady across the last 12 months"
              onClick={() => {}}
            />
          </List>
        </Stack>
      </div>
    </div>
  )
}

/* ----------------------------- the week's data ----------------------------- */

/**
 * Bar heights are spacing steps, not pixels — the chart is drawn out of the
 * same scale as the gaps around it, so it rescales with the token layer.
 */
const WEEK: BarProps[] = [
  { id: 'Mon', label: 'M', height: 10, steps: '7,204' },
  { id: 'Tue', label: 'T', height: 12, steps: '8,860' },
  { id: 'Wed', label: 'W', height: 8, steps: '5,932' },
  { id: 'Thu', label: 'T', height: 16, steps: '11,418' },
  { id: 'Fri', label: 'F', height: 12, steps: '9,077' },
  { id: 'Sat', label: 'S', height: 6, steps: '4,315' },
  { id: 'Sun', label: 'S', height: 20, steps: '9,412', today: true },
]

interface BarProps {
  /** The key, because four of the seven labels are the same letter. */
  id: string
  label: string
  /** Step on the 4px scale. */
  height: 6 | 8 | 10 | 12 | 16 | 20
  steps: string
  today?: boolean
}

function Bar({ height, steps, id, today }: BarProps) {
  return (
    <Box
      radius="sm"
      title={`${id}: ${steps} steps`}
      style={{
        flex: '1 1 0',
        height: `var(--may-space-${height})`,
        background: today ? 'var(--may-color-primary)' : 'var(--may-color-fill-tertiary)',
      }}
    />
  )
}

/* --------------------------------- rings ---------------------------------- */

interface RingStatProps {
  tone: 'tint' | 'success' | 'danger'
  value: number
  max: number
  centre: string
  label: string
  detail: string
}

/**
 * A ring is anonymous — it has no visible label of its own — so `aria-label`
 * carries the whole sentence and the caption underneath is decoration.
 */
function RingStat({ tone, value, max, centre, label, detail }: RingStatProps) {
  return (
    <Stack align="center" gap={2} style={{ flex: '1 1 0' }}>
      <CircularProgress
        size="lg"
        tone={tone}
        value={value}
        max={max}
        aria-label={`${label}: ${detail}`}
      >
        {centre}
      </CircularProgress>
      <Stack align="center" gap={0}>
        <Text as="span" variant="footnote" weight="semibold">
          {label}
        </Text>
        <Text as="span" variant="caption-2" tone="secondary" align="center">
          {detail}
        </Text>
      </Stack>
    </Stack>
  )
}

/* ------------------------------- glyph set --------------------------------- */

function PersonIcon() {
  return <IoPersonOutline aria-hidden />
}

function HeartIcon() {
  return <IoHeart aria-hidden />
}

function ShoeIcon() {
  return <IoFootsteps aria-hidden />
}

function MapPinIcon() {
  return <IoLocation aria-hidden />
}

function StairsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M20 3.4h-4.6v4.3h-4v4.3h-4v4.3H2.8v4.3h6.2v-4.3h4v-4.3h4V7.7H20z"
        fill="currentColor"
      />
    </svg>
  )
}

function MoonIcon() {
  return <IoMoon aria-hidden />
}

function SunIcon() {
  return <IoSunny aria-hidden />
}

function WalkIcon() {
  return <IoWalk aria-hidden />
}
