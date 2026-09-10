import { useState } from 'react'
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
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M12 2c.9 6.4 3.6 9.1 10 10-6.4.9-9.1 3.6-10 10-.9-6.4-3.6-9.1-10-10 6.4-.9 9.1-3.6 10-10Z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
      <path
        d="M1.9 10S4.9 4.75 10 4.75 18.1 10 18.1 10 15.1 15.25 10 15.25 1.9 10 1.9 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
      <path
        d="M7.6 5.25A7.6 7.6 0 0 1 10 4.75c5.1 0 8.1 5.25 8.1 5.25a15 15 0 0 1-2.6 3.2M4.7 6.6A14.6 14.6 0 0 0 1.9 10S4.9 15.25 10 15.25c1 0 1.9-.2 2.7-.5M8.4 8.5a2.4 2.4 0 0 0 3.3 3.3M3 3l14 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M17.6 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.2-1.2 3.1-2.4 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-3.8ZM15 5.4c.7-.9 1.2-2.1 1.1-3.4-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.4Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M21.4 11.1H12v3h5.4c-.24 1.4-1.7 4.1-5.4 4.1a6 6 0 0 1 0-12c1.85 0 3.08.8 3.79 1.47l2.58-2.49A9.1 9.1 0 0 0 12 2.8a9.2 9.2 0 1 0 0 18.4c5.3 0 8.8-3.73 8.8-8.98 0-.6-.06-1.06-.14-1.52Z" />
    </svg>
  )
}
