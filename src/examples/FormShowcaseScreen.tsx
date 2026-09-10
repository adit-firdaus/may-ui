import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IoGlobe, IoMail, IoPricetag, IoSpeedometer } from 'react-icons/io5'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../components/Card'
import { Checkbox } from '../components/Checkbox'
import { Field } from '../components/Field'
import { Grid } from '../components/Grid'
import { IconTile } from '../components/IconTile'
import type { IconTileGradient } from '../components/IconTile'
import { Input } from '../components/Input'
import { Radio, RadioGroup } from '../components/RadioGroup'
import { SearchField } from '../components/SearchField'
import { Select } from '../components/Select'
import { Slider } from '../components/Slider'
import { Stack } from '../components/Stack'
import { Stepper } from '../components/Stepper'
import { Switch } from '../components/Switch'
import { Text } from '../components/Text'
import { Textarea } from '../components/Textarea'
import { Toolbar } from '../components/Toolbar'

/** The draft the Textarea opens with, so `autoGrow` has something to grow to. */
const RELEASE_NOTES = `Processes RAW captures up to 4× faster on iPhone 15 Pro.
Adds a live histogram to the capture screen, in both the grid and the loupe.
Fixes a crash when importing a session that was still syncing from iCloud Drive.`

const CATEGORIES = [
  { label: 'Photo & Video', value: 'photo-video' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Graphics & Design', value: 'graphics' },
  { label: 'Developer Tools', value: 'developer' },
  { label: 'Health & Fitness', value: 'health' },
  /* Shipped as its own storefront section, and disabled until the account is
   * enrolled — the option still shows, because hiding it hides the reason. */
  { label: 'Kids (requires enrolment)', value: 'kids', disabled: true },
]

/**
 * Every form control in the system, doing one real job: the App Store Connect
 * submission pane.
 *
 * The screen exists to prove a single claim — that `Field` is the only thing a
 * form has to know about. Every control below sits inside one, so the label,
 * the helper line, the error, the required mark, the disabled state and all
 * three ARIA attributes come from one place instead of being retyped per
 * control. The four-up row near the bottom is the actual proof: one field,
 * four states, no per-state markup.
 *
 * The controls that are NOT wired by that context — `Slider` and `Stepper`,
 * which are composite widgets rather than labelable elements, and `RadioGroup`,
 * which says so in its own docs — carry an `aria-label` of their own. A
 * `<label for>` can only name a real form element, so a visible Field label
 * over any of the three is for sighted users alone unless it is repeated.
 */
export function FormShowcaseScreen() {
  /* Only the values a reviewer would actually move are stateful; the rest are
   * uncontrolled, which is how a form this size is really written. */
  const [rollout, setRollout] = useState(25)
  const [promoCodes, setPromoCodes] = useState(12)
  const [release, setRelease] = useState('automatic')
  const [rating, setRating] = useState('12')
  const [phased, setPhased] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState('4 minutes ago')

  /* A save that resolves instantly reads as a no-op, so the button holds its
   * loading state long enough to be seen. The timer is cleared on unmount:
   * setting state on a screen that has gone is the classic example-code bug. */
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const save = () => {
    setSaving(true)
    timer.current = setTimeout(() => {
      setSaving(false)
      setSavedAt('just now')
    }, 1100)
  }

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
            maxWidth: '46rem',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-6)',
          }}
        >
          <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
            <Text as="h1" variant="large-title">
              Submit for Review
            </Text>
            <Text variant="subheadline" tone="secondary">
              Halide Mark III · Version 4.2 (412) · Most submissions are reviewed within 24 hours.
            </Text>
          </header>

          {/* -------------------------- text entry --------------------------- */}

          <Section
            title="Version Details"
            description="What appears on the product page the day this version ships."
            gradient="blue"
            glyph={<TagGlyph />}
          >
            {/* prefix and suffix sit INSIDE the fill, so the unit and the “v”
              * are part of the tap target rather than decoration beside it. */}
            <Field
              label="Version number"
              description="Must be higher than 4.1.3, the version currently on the App Store."
            >
              <Input fullWidth prefix="v" defaultValue="4.2" inputMode="decimal" />
            </Field>

            <Field
              label="Introductory price"
              description="Charged for the first three months of an annual subscription."
            >
              <Input fullWidth prefix="$" suffix="USD" defaultValue="19.99" inputMode="decimal" />
            </Field>

            {/* autoGrow keeps the whole draft visible. Release notes are proofread
              * before they are submitted, and an internal scrollbar is exactly
              * where the typo survives. */}
            <Field
              label="What’s New in This Version"
              description="Up to 4,000 characters. Localise before submitting to the other 39 storefronts."
            >
              <Textarea fullWidth autoGrow rows={3} defaultValue={RELEASE_NOTES} />
            </Field>

            <Field
              label="Attach a build"
              description="Processing finishes about ten minutes after upload completes."
            >
              <SearchField
                fullWidth
                cancelable
                placeholder="Search builds by version or number"
                defaultValue="4.2 (412)"
              />
            </Field>
          </Section>

          {/* ---------------------------- choices ---------------------------- */}

          <Section
            title="Availability"
            description="How this version reaches the people who already have the app."
            gradient="purple"
            glyph={<GlobeGlyph />}
          >
            <Field
              label="Primary category"
              description="Decides where the app is browsed, and which charts it can appear on."
            >
              <Select fullWidth options={CATEGORIES} defaultValue="photo-video" />
            </Field>

            {/* The Checkbox carries the label and the Field carries the sentence
              * about the answer, not about the control. Labelling both would
              * name one input twice, and VoiceOver reads it as a run-on. */}
            <Field description="Kept on file for a year and shared with U.S. export authorities on request.">
              <Checkbox description="Leave this off if the app uses only HTTPS and Apple’s own crypto libraries.">
                App uses non-exempt encryption
              </Checkbox>
            </Field>

            <Field label="Release" description="Applies the moment review passes.">
              <RadioGroup
                aria-label="Release"
                value={release}
                onValueChange={setRelease}
              >
                <Radio value="automatic" description="Goes live as soon as review passes.">
                  Automatically
                </Radio>
                <Radio value="manual" description="Stays in Pending Developer Release until you press Release.">
                  Manually
                </Radio>
                <Radio value="scheduled" description="Ships 14 Oct at 10:00, in your local time zone.">
                  On a scheduled date
                </Radio>
              </RadioGroup>
            </Field>

            {/* Horizontal is for choices short enough to read as a row — four
              * age brackets, not four sentences. */}
            <Field label="Age rating" description="Derived from your content questionnaire; override only with cause.">
              <RadioGroup
                aria-label="Age rating"
                orientation="horizontal"
                value={rating}
                onValueChange={setRating}
              >
                <Radio value="4">4+</Radio>
                <Radio value="9">9+</Radio>
                <Radio value="12">12+</Radio>
                <Radio value="17">17+</Radio>
              </RadioGroup>
            </Field>

            <Field description="Pausing a phased release keeps the version live for whoever already has it.">
              <Switch
                checked={phased}
                onCheckedChange={setPhased}
                description="Rolls out to a growing share of automatic updates over seven days."
              >
                Phased Release
              </Switch>
            </Field>
          </Section>

          {/* ---------------------------- numbers ---------------------------- */}

          <Section
            title="Rollout"
            description="The two numbers you will be asked about if anything goes wrong."
            gradient="orange"
            glyph={<GaugeGlyph />}
          >
            {/* ticks are given as values rather than `true`: a mark every 5%
              * would read as a solid band, and these five are the shares the
              * phased-release schedule actually stops at. */}
            <Field
              label="Day-one share"
              description={
                phased
                  ? 'Everyone else receives the update over the following six days.'
                  : 'Phased release is off, so this version goes to everyone at once.'
              }
            >
              <Slider
                aria-label="Day-one share"
                value={rollout}
                onValueChange={setRollout}
                min={0}
                max={100}
                step={5}
                ticks={[0, 25, 50, 75, 100]}
                showValue
                formatValue={(value) => `${value}%`}
                disabled={!phased}
              />
            </Field>

            <Field
              label="Promo codes"
              description="Up to 100 per version. Each code expires 28 days after it is issued."
            >
              <Stepper
                aria-label="Promo codes"
                value={promoCodes}
                onValueChange={setPromoCodes}
                min={0}
                max={100}
                formatValue={(value) => `${value} codes`}
              />
            </Field>
          </Section>

          {/* --------------------- one field, four states -------------------- */}

          <Card>
            <CardHeader
              accessory={
                <IconTile gradient="teal" size="md">
                  <MailGlyph />
                </IconTile>
              }
            >
              <CardTitle>One Field, Four States</CardTitle>
              <CardDescription>
                The same control and the same copy each time. Only the Field’s props change.
              </CardDescription>
            </CardHeader>
            <CardBody>
              {/* minColumnWidth rather than a column count: at a narrow window
                * these stack, and the comparison still reads top to bottom. */}
              <Grid minColumnWidth="14rem" gap={4}>
                <StateCell caption="Default">
                  <Field label="Support email" description="Shown on the product page.">
                    <Input fullWidth type="email" defaultValue="support@halide.cam" />
                  </Field>
                </StateCell>

                <StateCell caption="Required">
                  <Field label="Support email" description="Shown on the product page." required>
                    <Input fullWidth type="email" placeholder="you@example.com" />
                  </Field>
                </StateCell>

                {/* `error` is the only way to mark a control invalid, and it
                  * REPLACES the description — one line of small print at a time,
                  * the way iOS shows it. */}
                <StateCell caption="Invalid">
                  <Field
                    label="Support email"
                    description="Shown on the product page."
                    required
                    error="Use an address at a domain you control."
                  >
                    <Input fullWidth type="email" defaultValue="halide@icloud.com" />
                  </Field>
                </StateCell>

                <StateCell caption="Disabled">
                  <Field label="Support email" description="Managed by your account holder." disabled>
                    <Input fullWidth type="email" defaultValue="support@halide.cam" />
                  </Field>
                </StateCell>
              </Grid>

              <Text variant="footnote" tone="tertiary">
                Nothing in the invalid cell asks for red. The error prop sets aria-invalid, swaps the
                description out for the message, points aria-describedby at it and tints the fill —
                so what is announced and what is seen cannot drift apart.
              </Text>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* The bar sits outside the scroller: a submission pane keeps its actions
        * on screen, and a footer that scrolls away is where drafts get lost. */}
      <Toolbar variant="surface" separator align="between" aria-label="Submission actions">
        <Text variant="footnote" tone="tertiary">
          Draft saved {savedAt}
        </Text>
        <Stack direction="row" gap={2} align="center">
          <Button variant="gray">Cancel</Button>
          <Button loading={saving} onClick={save}>
            Save
          </Button>
        </Stack>
      </Toolbar>
    </div>
  )
}

/* ------------------------------- structure -------------------------------- */

/**
 * One titled group of fields. The gap between controls is `space-5` rather than
 * the card body's own `space-3`: a label, a control and a helper line are three
 * stacked elements, and at the tighter rhythm two adjacent fields read as one.
 */
function Section({
  title,
  description,
  gradient,
  glyph,
  children,
}: {
  title: string
  description: string
  gradient: IconTileGradient
  glyph: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
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
      <CardBody>
        <Stack direction="column" gap={5}>
          {children}
        </Stack>
      </CardBody>
    </Card>
  )
}

/** A labelled slot in the four-up comparison. The caption is chrome, not a label. */
function StateCell({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <Box surface="nested" radius="lg" padding={4}>
      <Stack direction="column" gap={3}>
        <Text variant="caption-1" tone="tertiary" weight="semibold">
          {caption.toUpperCase()}
        </Text>
        {children}
      </Stack>
    </Box>
  )
}

/* -------------------------------- glyph set -------------------------------- */

function TagGlyph() {
  return <IoPricetag aria-hidden />
}

function GlobeGlyph() {
  return <IoGlobe aria-hidden />
}

function GaugeGlyph() {
  return <IoSpeedometer aria-hidden />
}

function MailGlyph() {
  return <IoMail aria-hidden />
}
