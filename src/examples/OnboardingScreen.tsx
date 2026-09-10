import type { ReactNode } from 'react'
import { useState } from 'react'
import { IoAt, IoCheckmarkCircleOutline, IoCloud, IoDocumentText } from 'react-icons/io5'
import { Steps } from '../components/Steps'
import type { StepItem } from '../components/Steps'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Checkbox } from '../components/Checkbox'
import { IconTile } from '../components/IconTile'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { Text } from '../components/Text'
import { Stack } from '../components/Stack'
import { Sheet } from '../components/Sheet'

/**
 * First-run setup, three steps deep.
 *
 * One piece of state — `step` — drives both the `Steps` strip and which panel
 * is on screen, so the indicator can never fall out of sync with the content
 * it indicates. That sounds obvious and is the single most common bug in a
 * hand-rolled wizard, where the strip is a separate list of booleans.
 *
 * The buttons sit outside the scroller. On a setup screen the way forward has
 * to be reachable without scrolling to find it, and a panel whose content grows
 * (an error message, a longer explanation) must not push the primary action
 * off the bottom of the phone.
 */

const TOTAL_STEPS = 3

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [appleId, setAppleId] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [faceIdOn, setFaceIdOn] = useState(false)
  const [explainerOpen, setExplainerOpen] = useState(false)

  /* The last step is finished rather than in progress, so its marker is
   * overridden — `current` alone would leave a checkmark unearned. */
  const items: StepItem[] = [
    { title: 'Apple ID', description: 'Sign in' },
    { title: 'Face ID', description: 'Unlock' },
    { title: 'Done', description: 'All set', status: step === 2 ? 'complete' : undefined },
  ]

  /* A rough shape check, not validation: the real one happens on the server,
   * and refusing an address here that Apple would accept is worse than letting
   * it through. */
  const appleIdLooksValid = /.+@.+\..+/.test(appleId.trim())
  const canContinue = step === 0 ? appleIdLooksValid && agreed : true

  const continueLabel =
    step === 0 ? 'Continue' : step === 1 ? (faceIdOn ? 'Continue' : 'Set Up Later') : 'Start Using May'

  const goNext = () => setStep((s) => (s + 1) % TOTAL_STEPS)

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
        data-slot="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingInline: 'var(--may-space-5)',
          paddingTop: 'calc(var(--may-inset-top) + var(--may-space-4))',
          paddingBottom: 'var(--may-space-6)',
        }}
      >
        <Steps items={items} current={step} size="sm" aria-label="Setup progress" />

        <div style={{ marginBlockStart: 'var(--may-space-8)' }}>
          {step === 0 && (
            <Stack direction="column" gap={5}>
              <Stack direction="column" gap={2}>
                <Text variant="title-1" as="h2">
                  Sign in with your Apple&nbsp;ID
                </Text>
                <Text variant="callout" tone="secondary">
                  This is the account your purchases, iCloud data and subscriptions already belong
                  to. Signing in here does not move any of it.
                </Text>
              </Stack>

              <Field
                label="Apple ID"
                description="We’ll send a six-digit code to your other trusted devices."
              >
                <Input
                  type="email"
                  value={appleId}
                  onChange={(event) => setAppleId(event.target.value)}
                  placeholder="you@icloud.com"
                  autoComplete="username"
                  inputMode="email"
                  prefix={<AtGlyph />}
                  fullWidth
                />
              </Field>

              <Checkbox
                checked={agreed}
                onCheckedChange={setAgreed}
                description="Includes the Apple Media Services agreement and the iCloud terms."
              >
                I agree to the Terms and Conditions
              </Checkbox>

              <ExplainerLink onOpen={() => setExplainerOpen(true)} />
            </Stack>
          )}

          {step === 1 && (
            <Stack direction="column" gap={5} align="center">
              {/* The one saturated element on the panel. At `lg` it is the
                  60pt home-screen icon, which is the size this kind of
                  full-screen explainer uses on iOS. */}
              <IconTile gradient="spectrum" size="lg">
                <FaceIdGlyph />
              </IconTile>

              <Stack direction="column" gap={2} align="center">
                <Text variant="title-1" as="h2" align="center">
                  Unlock with Face&nbsp;ID
                </Text>
                <Text variant="callout" tone="secondary" align="center">
                  Face ID keeps you signed in without typing your password again. The map of your
                  face is encrypted in the Secure Enclave and never leaves this iPhone.
                </Text>
              </Stack>

              {faceIdOn ? (
                <Stack direction="column" gap={3} align="center" fullWidth>
                  <Text variant="headline" tone="success" align="center">
                    Face ID is ready
                  </Text>
                  <Button variant="gray" size="md" pill onClick={() => setFaceIdOn(false)}>
                    Set Up Again
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="tinted"
                  size="lg"
                  pill
                  leadingIcon={<FaceIdGlyph />}
                  onClick={() => setFaceIdOn(true)}
                >
                  Enable Face ID
                </Button>
              )}

              <ExplainerLink onOpen={() => setExplainerOpen(true)} />
            </Stack>
          )}

          {step === 2 && (
            <Stack direction="column" gap={5}>
              <EmptyState
                glyph={<CheckSealGlyph />}
                title="You’re All Set"
                description={`${appleId.trim() || 'Your Apple ID'} is signed in${
                  faceIdOn ? ' and Face ID is ready' : ''
                }. Everything here can be changed later in Settings.`}
                size="lg"
                as="h2"
              />
              <Text variant="footnote" tone="tertiary" align="center">
                Setup took 3 steps. Nothing was uploaded.
              </Text>
            </Stack>
          )}
        </div>
      </div>

      {/* Pinned by layout, not by `position: fixed` — the root is a flex
          column, so this bar is always the last 88pt of the screen. */}
      <div style={{ flexShrink: 0, background: 'var(--may-color-surface)' }}>
        <Stack
          direction="row"
          gap={3}
          align="center"
          style={{
            padding: 'var(--may-space-4)',
            paddingBottom: 'calc(var(--may-inset-bottom) + var(--may-space-4))',
          }}
        >
          {step > 0 && (
            <Button variant="gray" size="lg" pill onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Button size="lg" pill fullWidth disabled={!canContinue} onClick={goNext}>
              {continueLabel}
            </Button>
          </div>
        </Stack>
      </div>

      {/* Overlays render inline with their own fixed scrim, so the sheet can
          live at the end of the tree and still cover the whole screen. */}
      <Sheet
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        title="Why we need this"
        description="What each step is for, and what leaves the device."
        footer={
          <Button size="lg" pill fullWidth onClick={() => setExplainerOpen(false)}>
            Got It
          </Button>
        }
      >
        <Stack direction="column" gap={5}>
          <Reason
            gradient="blue"
            glyph={<CloudGlyph />}
            title="Your Apple ID"
            body="It identifies the library, purchases and subscriptions this device restores from. We store the address, and nothing else from this screen."
          />
          <Reason
            gradient="green"
            glyph={<FaceIdGlyph />}
            title="Face ID"
            body="Only a yes-or-no answer ever reaches the app. The face data itself stays in the Secure Enclave, where even iOS cannot read it."
          />
          <Reason
            gradient="gray"
            glyph={<DocumentGlyph />}
            title="The terms"
            body="Required once per Apple ID. You can read the full agreement any time from Settings › Media & Purchases."
          />
        </Stack>
      </Sheet>
    </div>
  )
}

/** The same quiet link on both input steps, so it never moves between them. */
function ExplainerLink({ onOpen }: { onOpen: () => void }) {
  return (
    <Button variant="plain" tone="tint" size="sm" onClick={onOpen}>
      Why we need this
    </Button>
  )
}

interface ReasonProps {
  gradient: 'blue' | 'green' | 'gray'
  glyph: ReactNode
  title: string
  body: string
}

function Reason({ gradient, glyph, title, body }: ReasonProps) {
  return (
    <Stack direction="row" gap={4} align="start">
      <IconTile gradient={gradient} size="md">
        {glyph}
      </IconTile>
      <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
        <Text variant="headline">{title}</Text>
        <Text variant="footnote" tone="secondary">
          {body}
        </Text>
      </Stack>
    </Stack>
  )
}

/* ------------------------------- glyph set -------------------------------- */

function AtGlyph() {
  return <IoAt aria-hidden />
}

/** The Face ID mark: bracketed corners around a schematic face. */
function FaceIdGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 8.4V5.6A2.6 2.6 0 015.6 3h2.8v2H5.6a.6.6 0 00-.6.6v2.8zm12.6-5.4h2.8A2.6 2.6 0 0121 5.6v2.8h-2V5.6a.6.6 0 00-.6-.6h-2.8zM3 15.6h2v2.8c0 .3.3.6.6.6h2.8v2H5.6A2.6 2.6 0 013 18.4zm16 0h2v2.8a2.6 2.6 0 01-2.6 2.6h-2.8v-2h2.8a.6.6 0 00.6-.6zM8.6 8.6h1.6v2.8H8.6zm5.2 0h1.6v2.8h-1.6zm-2.6 0h1.5v4.2c0 .5-.4.9-.9.9h-1v-1.4h.4zm-2.9 5.9l1.3-.7c.5.9 1.4 1.4 2.4 1.4s1.9-.5 2.4-1.4l1.3.7c-.8 1.4-2.2 2.2-3.7 2.2s-2.9-.8-3.7-2.2z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckSealGlyph() {
  return <IoCheckmarkCircleOutline aria-hidden />
}

function CloudGlyph() {
  return <IoCloud aria-hidden />
}

function DocumentGlyph() {
  return <IoDocumentText aria-hidden />
}
