import { useState } from 'react'
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLogoApple,
  IoLogoGoogle,
  IoSparkles,
} from 'react-icons/io5'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Checkbox } from '../components/Checkbox'
import { Field } from '../components/Field'
import { Heading } from '../components/Heading'
import { IconButton } from '../components/IconButton'
import { IconTile } from '../components/IconTile'
import { Input } from '../components/Input'
import { Separator } from '../components/Separator'
import { Text } from '../components/Text'

/**
 * Sign in — the one screen a design system is judged on before anything else,
 * and the one that has to hold up at 320px and at 1600px without a breakpoint.
 *
 * The card caps at 380px and centres; nothing inside it is measured in pixels,
 * so it is the same screen on a phone, in a sheet, and on a Studio Display.
 *
 * Two things to copy from the form itself: the reveal control is an
 * `IconButton` in the Input's `suffix`, which keeps it inside the fill instead
 * of beside it; and the error state is set by handing `Field` an `error`, which
 * is the *only* way to mark a control invalid — the Field then flips
 * `aria-invalid`, swaps the description for the message and points
 * `aria-describedby` at it, so what is painted and what is announced cannot
 * drift apart.
 */
export function AuthScreen() {
  return (
    <div
      data-slot="scroll-area"
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        background: 'var(--may-color-bg)',
      }}
    >
      {/*
        `1 0 auto`, not `1`: the track grows to centre its content when there is
        room and falls back to its own height when there is not. `flex: 1` would
        pin it to the viewport, and a centred overflow then hides its own top
        edge above the scroll origin — the classic way a sign-in card gets
        beheaded on a short window.
      */}
      <div
        style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--may-space-10)',
          padding: 'var(--may-space-10) var(--may-space-4)',
        }}
      >
        <SignInCard />

        {/* The same composition again, after a rejected attempt. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--may-space-3)',
            width: '100%',
          }}
        >
          <Text variant="caption-1" tone="tertiary" align="center">
            The same form after a failed attempt
          </Text>
          <SignInCard
            headingLevel={2}
            emailValue="ada@mayui.dev"
            passwordError="Incorrect password. 3 attempts remaining before the account locks."
          />
        </div>
      </div>
    </div>
  )
}

interface SignInCardProps {
  /** Rank follows the page, never the size — the size prop covers the look. */
  headingLevel?: 1 | 2
  emailValue?: string
  passwordError?: string
}

function SignInCard({ headingLevel = 1, emailValue, passwordError }: SignInCardProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <Card padding="lg" style={{ width: '100%', maxWidth: '23.75rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-5)' }}>
        {/* ------------------------------- the mark ------------------------------ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--may-space-3)',
            textAlign: 'center',
          }}
        >
          {/* An app icon sits *in* the surface — IconTile deliberately casts no
              shadow, and adding one is the fastest way to make this read as a
              web page rather than as software. */}
          <IconTile gradient="spectrum" size="lg">
            <SparkIcon />
          </IconTile>
          <div>
            <Heading level={headingLevel} size="title-2">
              Sign in to May
            </Heading>
            <Text variant="subheadline" tone="secondary">
              Use your May Account to continue to Design Systems.
            </Text>
          </div>
        </div>

        {/* -------------------------------- fields ------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
          <Field label="Email">
            <Input
              type="email"
              fullWidth
              placeholder="name@mayui.dev"
              autoComplete="username"
              defaultValue={emailValue}
            />
          </Field>

          {/* `error` replaces `description` rather than stacking under it — iOS
              shows one line of small print at a time, never two. */}
          <Field label="Password" error={passwordError}>
            <Input
              type={revealed ? 'text' : 'password'}
              fullWidth
              placeholder="Required"
              autoComplete="current-password"
              defaultValue={passwordError ? 'brunelleschi' : undefined}
              suffix={
                <IconButton
                  aria-label={revealed ? 'Hide password' : 'Show password'}
                  size="sm"
                  tone="neutral"
                  onClick={() => setRevealed((value) => !value)}
                >
                  {revealed ? <EyeOffIcon /> : <EyeIcon />}
                </IconButton>
              }
            />
          </Field>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--may-space-2)',
            }}
          >
            <Checkbox defaultChecked>Keep me signed in</Checkbox>
            <Button variant="plain" size="sm" onClick={() => {}}>
              Forgot password?
            </Button>
          </div>
        </div>

        {/* iOS reserves the pill for the one prominent standalone action. */}
        <Button pill fullWidth size="lg" onClick={() => {}}>
          Sign In
        </Button>

        {/* ----------------------------- other routes ---------------------------- */}
        <Separator label="or" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
          <Button variant="gray" fullWidth leadingIcon={<AppleIcon />} onClick={() => {}}>
            Continue with Apple
          </Button>
          <Button variant="gray" fullWidth leadingIcon={<GoogleIcon />} onClick={() => {}}>
            Continue with Google
          </Button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--may-space-1)',
            flexWrap: 'wrap',
          }}
        >
          <Text as="span" variant="footnote" tone="secondary">
            New to May?
          </Text>
          <Button variant="plain" size="sm" onClick={() => {}}>
            Create an account
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* --------------------------------- glyph set -------------------------------- */

/** The app mark: a four-point spark, symmetric about the tile's centre. */
function SparkIcon() {
  return <IoSparkles aria-hidden />
}

function EyeIcon() {
  return <IoEyeOutline aria-hidden />
}

function EyeOffIcon() {
  return <IoEyeOffOutline aria-hidden />
}

function AppleIcon() {
  return <IoLogoApple aria-hidden />
}

function GoogleIcon() {
  return <IoLogoGoogle aria-hidden />
}
