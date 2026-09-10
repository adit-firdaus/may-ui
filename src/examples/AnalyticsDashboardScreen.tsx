import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  IoBag,
  IoBarChartOutline,
  IoFlash,
  IoFunnelOutline,
  IoGlobeOutline,
  IoPeople,
  IoTime,
} from 'react-icons/io5'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../components/Card'
import { Checkbox } from '../components/Checkbox'
import { Grid } from '../components/Grid'
import { IconTile } from '../components/IconTile'
import { Popover } from '../components/Popover'
import { Progress } from '../components/Progress'
import { SegmentedControl } from '../components/SegmentedControl'
import { Statistic } from '../components/Statistic'
import { Stack } from '../components/Stack'
import { Table } from '../components/Table'
import type { TableColumn } from '../components/Table'
import { Tag } from '../components/Tag'
import { Text } from '../components/Text'

/* ------------------------------------------------------------------ *
 * Data
 *
 * One range's worth of numbers per key, so switching the
 * SegmentedControl moves every tile at once rather than animating a
 * single decorative widget.
 * ------------------------------------------------------------------ */

type Range = '7d' | '30d' | '12m'

interface Tile {
  label: string
  value: string
  unit?: string
  delta: string
  direction: 'up' | 'down' | 'flat'
  /** True when going DOWN is the good news — crashes, refunds, latency. */
  invert?: boolean
  gradient: 'blue' | 'green' | 'orange' | 'purple'
  glyph: ReactNode
}

const glyphs = {
  people: <IoPeople aria-hidden />,
  bag: <IoBag aria-hidden />,
  clock: <IoTime aria-hidden />,
  bolt: <IoFlash aria-hidden />,
  chart: <IoBarChartOutline aria-hidden />,
  globe: <IoGlobeOutline aria-hidden />,
  filter: <IoFunnelOutline aria-hidden />,
}

const tiles: Record<Range, Tile[]> = {
  '7d': [
    { label: 'Active Devices', value: '48,206', delta: '6.2%', direction: 'up', gradient: 'blue', glyph: glyphs.people },
    { label: 'Paid Conversions', value: '1,914', delta: '3.1%', direction: 'up', gradient: 'green', glyph: glyphs.bag },
    { label: 'Avg. Session', value: '4:12', delta: '18s', direction: 'up', gradient: 'purple', glyph: glyphs.clock },
    { label: 'Crash-Free Rate', value: '99.87', unit: '%', delta: '0.04%', direction: 'down', invert: true, gradient: 'orange', glyph: glyphs.bolt },
  ],
  '30d': [
    { label: 'Active Devices', value: '186,540', delta: '11.4%', direction: 'up', gradient: 'blue', glyph: glyphs.people },
    { label: 'Paid Conversions', value: '8,077', delta: '2.6%', direction: 'down', invert: true, gradient: 'green', glyph: glyphs.bag },
    { label: 'Avg. Session', value: '3:58', delta: 'No change', direction: 'flat', gradient: 'purple', glyph: glyphs.clock },
    { label: 'Crash-Free Rate', value: '99.91', unit: '%', delta: '0.02%', direction: 'up', gradient: 'orange', glyph: glyphs.bolt },
  ],
  '12m': [
    { label: 'Active Devices', value: '1.42M', delta: '34.8%', direction: 'up', gradient: 'blue', glyph: glyphs.people },
    { label: 'Paid Conversions', value: '96,318', delta: '21.5%', direction: 'up', gradient: 'green', glyph: glyphs.bag },
    { label: 'Avg. Session', value: '4:31', delta: '41s', direction: 'up', gradient: 'purple', glyph: glyphs.clock },
    { label: 'Crash-Free Rate', value: '99.78', unit: '%', delta: '0.13%', direction: 'down', invert: true, gradient: 'orange', glyph: glyphs.bolt },
  ],
}

/** Two stacked series per column: paid installs sit on top of free ones. */
interface Bar {
  month: string
  free: number
  paid: number
}

const bars: Bar[] = [
  { month: 'Oct', free: 54, paid: 12 },
  { month: 'Nov', free: 61, paid: 14 },
  { month: 'Dec', free: 88, paid: 26 },
  { month: 'Jan', free: 72, paid: 19 },
  { month: 'Feb', free: 66, paid: 21 },
  { month: 'Mar', free: 74, paid: 24 },
  { month: 'Apr', free: 79, paid: 23 },
  { month: 'May', free: 83, paid: 28 },
  { month: 'Jun', free: 91, paid: 31 },
  { month: 'Jul', free: 97, paid: 36 },
  { month: 'Aug', free: 86, paid: 34 },
  { month: 'Sep', free: 104, paid: 41 },
]

const PEAK = Math.max(...bars.map((bar) => bar.free + bar.paid))

/**
 * A bar's height as a fraction of the plot, expressed in tokens: the plot is
 * two of the largest spacing step tall, and every segment is a proportion of
 * it. No literal pixel ever enters the chart, so it rescales with the type
 * ramp the way the rest of the system does.
 */
const PLOT_H = 'calc(var(--may-space-24) * 2)'
/** The month caption sits inside the plot, so the bars only get what is left. */
const BAR_MAX = `calc(${PLOT_H} - var(--may-space-6))`
const segment = (value: number) => `calc(${BAR_MAX} * ${(value / PEAK).toFixed(4)})`

interface Source {
  name: string
  share: number
  visits: string
  tone: 'tint' | 'success' | 'warning' | 'neutral'
}

const sources: Source[] = [
  { name: 'App Store search', share: 42, visits: '78,412 visits', tone: 'tint' },
  { name: 'Featured — Apps We Love', share: 27, visits: '50,308 visits', tone: 'success' },
  { name: 'Web referral', share: 18, visits: '33,520 visits', tone: 'warning' },
  { name: 'Direct link', share: 9, visits: '16,774 visits', tone: 'neutral' },
  { name: 'Shared from Messages', share: 4, visits: '7,486 visits', tone: 'neutral' },
]

interface Page {
  id: string
  path: string
  title: string
  views: number
  avgTime: string
  bounce: number
}

const pages: Page[] = [
  { id: 'p1', path: '/', title: 'Mercury for iPhone', views: 128_402, avgTime: '1:24', bounce: 38 },
  { id: 'p2', path: '/pricing', title: 'Plans and Pricing', views: 61_209, avgTime: '2:47', bounce: 26 },
  { id: 'p3', path: '/whats-new', title: 'What’s New in 4.2', views: 44_871, avgTime: '3:12', bounce: 21 },
  { id: 'p4', path: '/support', title: 'Support', views: 30_665, avgTime: '4:05', bounce: 44 },
  { id: 'p5', path: '/privacy', title: 'Privacy Policy', views: 12_940, avgTime: '0:52', bounce: 71 },
  { id: 'p6', path: '/press', title: 'Press Kit', views: 8_318, avgTime: '1:38', bounce: 55 },
]

const pageColumns: TableColumn<Page>[] = [
  {
    key: 'path',
    header: 'Page',
    primary: true,
    render: (row) => (
      <span style={{ display: 'grid', gap: 'var(--may-space-1)', minWidth: 0 }}>
        <Text as="span" variant="subheadline" weight="medium" clamp={1}>
          {row.title}
        </Text>
        <Text as="span" variant="footnote" tone="secondary" mono clamp={1}>
          {row.path}
        </Text>
      </span>
    ),
  },
  {
    key: 'views',
    header: 'Views',
    numeric: true,
    width: 120,
    render: (row) => row.views.toLocaleString('en-US'),
  },
  { key: 'avgTime', header: 'Avg. Time', numeric: true, width: 120 },
  {
    key: 'bounce',
    header: 'Bounce',
    numeric: true,
    width: 120,
    // Tinted above the 50% line: a bounce rate is the one column here where
    // a high number is bad news, and the colour says so without a legend.
    render: (row) => (
      <Text as="span" variant="subheadline" tone={row.bounce > 50 ? 'danger' : 'default'}>
        {row.bounce}%
      </Text>
    ),
  },
]

const RANGE_LABEL: Record<Range, string> = {
  '7d': 'the last 7 days',
  '30d': 'the last 30 days',
  '12m': 'the last 12 months',
}

/* ------------------------------------------------------------------ *
 * Screen
 * ------------------------------------------------------------------ */

/**
 * An analytics overview: tiles, a chart, a breakdown, then the detail
 * table. The order is deliberate — the shape a dashboard should have is
 * one glanceable row, one trend, then the rows you actually query.
 *
 * No transform on the root: the filter Popover measures the trigger
 * against the real viewport to decide which side to open on, and a
 * transformed ancestor would send it through the top of the card.
 */
export function AnalyticsDashboardScreen() {
  const [range, setRange] = useState<Range>('30d')
  const [platforms, setPlatforms] = useState<string[]>(['ios', 'ipados'])

  const toggle = (id: string) =>
    setPlatforms((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '34rem',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        data-slot="scroll-area"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--may-space-6)' }}
      >
        <Stack gap={6}>
          {/* ------------------------------ header ------------------------------ */}
          <Stack direction="row" align="end" justify="between" gap={4} wrap>
            <Stack gap={1}>
              <Text as="h1" variant="title-1">
                Overview
              </Text>
              <Text variant="subheadline" tone="secondary">
                Mercury for iPhone · {RANGE_LABEL[range]} · {platforms.length} platforms
              </Text>
            </Stack>

            <Stack direction="row" gap={2} align="center">
              <SegmentedControl
                aria-label="Reporting range"
                value={range}
                onValueChange={(value) => setRange(value as Range)}
                size="sm"
                options={[
                  { label: '7 Days', value: '7d' },
                  { label: '30 Days', value: '30d' },
                  { label: '12 Months', value: '12m' },
                ]}
              />

              {/* Checkboxes, not a menu: these are independent filters that
               * stay on together, and a menu would close after each one. */}
              <Popover
                aria-label="Filters"
                placement="bottom-end"
                trigger={
                  <Button
                    variant="gray"
                    size="sm"
                    leadingIcon={glyphs.filter}
                  >
                    Filters
                  </Button>
                }
              >
                <Stack gap={3} style={{ minWidth: 'calc(var(--may-space-24) * 2.5)' }}>
                  <Text variant="footnote" tone="secondary">
                    Platforms
                  </Text>
                  <Stack gap={2}>
                    <Checkbox
                      checked={platforms.includes('ios')}
                      onCheckedChange={() => toggle('ios')}
                    >
                      iOS
                    </Checkbox>
                    <Checkbox
                      checked={platforms.includes('ipados')}
                      onCheckedChange={() => toggle('ipados')}
                    >
                      iPadOS
                    </Checkbox>
                    <Checkbox
                      checked={platforms.includes('macos')}
                      onCheckedChange={() => toggle('macos')}
                    >
                      macOS
                    </Checkbox>
                    <Checkbox
                      checked={platforms.includes('visionos')}
                      onCheckedChange={() => toggle('visionos')}
                      description="No paid tier yet"
                    >
                      visionOS
                    </Checkbox>
                  </Stack>
                </Stack>
              </Popover>
            </Stack>
          </Stack>

          {/* ------------------------------- tiles ------------------------------ */}
          {/* minColumnWidth, not a column count: the row reflows from four
           * across to two to one without a breakpoint being written here. */}
          <Grid minColumnWidth="220px" gap={4}>
            {tiles[range].map((tile) => (
              <Statistic
                key={tile.label}
                variant="card"
                label={tile.label}
                value={tile.value}
                unit={tile.unit}
                delta={tile.delta}
                direction={tile.direction}
                invertDelta={tile.invert}
                trailing={
                  <IconTile gradient={tile.gradient} size="md">
                    {tile.glyph}
                  </IconTile>
                }
              />
            ))}
          </Grid>

          {/* ------------------------------- chart ------------------------------ */}
          <Card>
            <CardHeader
              accessory={
                <Stack direction="row" gap={2} align="center">
                  <Tag tone="tint" size="sm">
                    Free
                  </Tag>
                  <Tag tone="success" size="sm">
                    Paid
                  </Tag>
                </Stack>
              }
            >
              <CardTitle>First-Time Installs</CardTitle>
              <CardDescription>Thousands per month, paid stacked on free.</CardDescription>
            </CardHeader>
            <CardBody>
              {/* The plot scrolls sideways rather than crushing twelve
               * columns into a narrow card. */}
              <div data-slot="scroll-area" style={{ overflowX: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 'var(--may-space-3)',
                    minWidth: 'calc(var(--may-space-24) * 6)',
                    height: PLOT_H,
                  }}
                  role="img"
                  aria-label="Monthly first-time installs for the last twelve months, rising from 66 thousand in October to 145 thousand in September."
                >
                  {bars.map((bar) => (
                    <div
                      key={bar.month}
                      style={{
                        flex: 1,
                        minWidth: 'var(--may-space-5)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 'var(--may-space-1)',
                        height: '100%',
                      }}
                    >
                      {/* Two Boxes, not one gradient: the split is data, and
                       * the rounded cap belongs to the column, not to each
                       * segment — so only the top one rounds. */}
                      <Box
                        fullWidth
                        radius="xs"
                        style={{
                          height: segment(bar.paid),
                          background: 'var(--may-color-success)',
                          borderEndStartRadius: 0,
                          borderEndEndRadius: 0,
                        }}
                      />
                      <Box
                        fullWidth
                        style={{
                          height: segment(bar.free),
                          background: 'var(--may-color-primary)',
                          borderRadius: 'var(--may-radius-xs)',
                          borderStartStartRadius: 0,
                          borderStartEndRadius: 0,
                        }}
                      />
                      <Text as="span" variant="caption-2" tone="tertiary">
                        {bar.month}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ---------------------------- traffic mix --------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Where Installs Came From</CardTitle>
              <CardDescription>Share of attributed sessions, {RANGE_LABEL[range]}.</CardDescription>
            </CardHeader>
            <CardBody>
              <Stack gap={4}>
                {sources.map((source) => (
                  <Progress
                    key={source.name}
                    label={source.name}
                    value={source.share}
                    tone={source.tone}
                    showValue
                    formatValue={(value) => `${value}% · ${source.visits}`}
                  />
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* ------------------------------- detail ----------------------------- */}
          <Table
            caption="Top Pages"
            columns={pageColumns}
            data={pages}
            rowKey="id"
            zebra
          />
        </Stack>
      </div>
    </div>
  )
}
