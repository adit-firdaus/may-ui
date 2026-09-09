import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../components/Button'

const meta = {
  title: 'Foundations/Overview',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* ------------------------------------------------------------------ *
 * shared bits of catalog furniture
 * ------------------------------------------------------------------ */

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--may-space-10)' }}>
      <h2
        style={{
          margin: '0 0 var(--may-space-1)',
          fontSize: 'var(--may-text-title-2)',
          lineHeight: 'var(--may-text-title-2-leading)',
          letterSpacing: 'var(--may-text-title-2-tracking)',
          fontWeight: 'var(--may-text-title-2-weight)' as never,
        }}
      >
        {title}
      </h2>
      {note && (
        <p
          style={{
            margin: '0 0 var(--may-space-4)',
            maxWidth: '60ch',
            fontSize: 'var(--may-text-subheadline)',
            color: 'var(--may-color-text-secondary)',
          }}
        >
          {note}
        </p>
      )}
      {children}
    </section>
  )
}

const grid = (min: string): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`,
  gap: 'var(--may-space-4)',
})

const mono: React.CSSProperties = {
  fontFamily: 'var(--may-font-mono)',
  fontSize: 'var(--may-text-caption-1)',
  color: 'var(--may-color-text-secondary)',
}

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

function Swatch({ token, height = 56 }: { token: string; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
      <div
        style={{
          height,
          borderRadius: 'var(--may-radius-md)',
          background: `var(${token})`,
          boxShadow: 'inset 0 0 0 1px var(--may-color-separator)',
        }}
      />
      <span style={mono}>{token.replace('--may-', '')}</span>
    </div>
  )
}

export const Colour: Story = {
  render: () => (
    <>
      <Section
        title="Semantic colour"
        note="The tier components consume. Override these to restyle the whole system; the raw ramps below are rarely referenced directly."
      >
        <div style={grid('140px')}>
          {[
            '--may-color-bg',
            '--may-color-surface',
            '--may-color-surface-nested',
            '--may-color-fill',
            '--may-color-fill-tertiary',
            '--may-color-separator',
            '--may-color-tint',
            '--may-color-danger',
            '--may-color-success',
            '--may-color-warning',
          ].map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </Section>

      <Section
        title="tint vs primary"
        note="The same hue doing two different jobs. --may-color-tint is the brand as TEXT on a neutral surface: links, plain buttons, an active tab label. --may-color-primary is the brand as a FILL carrying white text. Collapsing these into one token is the most common reason a ported Apple palette looks subtly wrong."
      >
        <div style={{ display: 'flex', gap: 'var(--may-space-4)', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: 'var(--may-space-4) var(--may-space-5)',
              borderRadius: 'var(--may-radius-card)',
              background: 'var(--may-color-surface)',
              color: 'var(--may-color-tint)',
              fontWeight: 600,
            }}
          >
            tint — brand as text
          </div>
          <div
            style={{
              padding: 'var(--may-space-4) var(--may-space-5)',
              borderRadius: 'var(--may-radius-card)',
              background: 'var(--may-color-primary)',
              color: 'var(--may-color-on-primary)',
              fontWeight: 600,
            }}
          >
            primary — brand as fill
          </div>
        </div>
      </Section>

      <Section
        title="System palette"
        note="Apple's own values, each with a dark variant. Switch the toolbar theme to see them re-point."
      >
        <div style={grid('110px')}>
          {['blue', 'green', 'indigo', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow', 'mint', 'cyan', 'brown'].map(
            (c) => (
              <Swatch key={c} token={`--may-${c}`} height={44} />
            ),
          )}
        </div>
      </Section>

      <Section
        title="Fills — what replaces borders"
        note="Nothing in this system is separated by a stroke. A control's shape comes from a translucent fill over the surface beneath it, which is why the same component reads correctly on white, on grouped grey, and on black."
      >
        <div style={grid('140px')}>
          {['--may-fill-primary', '--may-fill-secondary', '--may-fill-tertiary', '--may-fill-quaternary'].map((t) => (
            <Swatch key={t} token={t} height={44} />
          ))}
        </div>
      </Section>
    </>
  ),
}

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

const TEXT_STYLES = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
] as const

export const Typography: Story = {
  render: () => (
    <Section
      title="Apple's named text styles"
      note="Each token carries size, leading, tracking and weight together, because in iOS those four move as one. Note that body and headline are the SAME size — they differ only in weight and tracking. That relationship is the detail most often lost when this palette is ported."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-5)' }}>
        {TEXT_STYLES.map((style) => (
          <div key={style} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--may-space-5)' }}>
            <span style={{ ...mono, width: 96, flexShrink: 0 }}>{style}</span>
            <span
              style={{
                fontSize: `var(--may-text-${style})`,
                lineHeight: `var(--may-text-${style}-leading)`,
                letterSpacing: `var(--may-text-${style}-tracking)`,
                fontWeight: `var(--may-text-${style}-weight)` as never,
              }}
            >
              The quick brown fox
            </span>
          </div>
        ))}
      </div>
    </Section>
  ),
}

/* ------------------------------------------------------------------ *
 * Motion — the catalog that matters most
 * ------------------------------------------------------------------ */

const SPRINGS = ['snappy', 'smooth', 'bouncy', 'playful'] as const
const EASES = ['back', 'elastic', 'bounce', 'expo', 'sheet'] as const

function Runner({ curve, label, note }: { curve: string; label: string; note: string }) {
  const [on, setOn] = useState(false)
  return (
    <div
      style={{
        padding: 'var(--may-space-4)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-3)',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 'var(--may-text-subheadline)' }}>{label}</div>
        <div style={{ ...mono, marginTop: 2 }}>{note}</div>
      </div>
      {/*
       * The track is a query container, so the box can travel its full width
       * with a single transform (100cqw = the track's inline size). Animating
       * `left` instead would force layout on every frame.
       */}
      <div
        onClick={() => setOn((v) => !v)}
        style={{
          position: 'relative',
          containerType: 'inline-size',
          height: 44,
          borderRadius: 'var(--may-radius-md)',
          background: 'var(--may-color-fill-quaternary)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 32,
            height: 32,
            borderRadius: 'var(--may-radius-sm)',
            background: 'var(--may-color-tint)',
            transform: on ? 'translateX(calc(100cqw - 44px))' : 'translateX(0)',
            transition: `transform 600ms ${curve}`,
          }}
        />
      </div>
    </div>
  )
}

export const Motion: Story = {
  render: () => (
    <>
      <Section
        title="Springs"
        note="Real spring physics, sampled at build time into CSS linear() easings. They run on the compositor with no JavaScript on the animation frame, and nothing is shipped to the browser to make them work. Click any track to run it."
      >
        <div style={grid('260px')}>
          {SPRINGS.map((s) => (
            <Runner
              key={s}
              curve={`var(--may-spring-${s})`}
              label={s}
              note={`--may-spring-${s}`}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Named curves"
        note="Sampled from easing-utils, plus iOS's own sheet presentation curve. back / elastic / bounce all overshoot; expo and sheet do not."
      >
        <div style={grid('260px')}>
          {EASES.map((e) => (
            <Runner key={e} curve={`var(--may-ease-${e})`} label={e} note={`--may-ease-${e}`} />
          ))}
        </div>
      </Section>

      <Section
        title="Press feedback"
        note="Asymmetric on purpose. Down is 80ms so it beats the eye; release rides the bouncy spring, overshooting past resting size before settling. usePressFeedback holds the pressed state for a minimum 90ms, so even a 20ms tap shows the whole gesture. Press and release quickly to feel the difference."
      >
        <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap' }}>
          <Button size="lg">Press me</Button>
          <Button size="lg" variant="tinted">
            And me
          </Button>
          <Button size="lg" variant="gray" pill>
            Pill
          </Button>
        </div>
      </Section>
    </>
  ),
}

/* ------------------------------------------------------------------ *
 * Shape and depth
 * ------------------------------------------------------------------ */

export const ShapeAndDepth: Story = {
  render: () => (
    <>
      <Section title="Radius" note="Derived from element scale, not per-component taste.">
        <div style={{ display: 'flex', gap: 'var(--may-space-4)', flexWrap: 'wrap' }}>
          {['xs', 'sm', 'md', 'lg', 'card', 'sheet'].map((r) => (
            <div key={r} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: `var(--may-radius-${r})`,
                  background: 'var(--may-color-surface)',
                  boxShadow: 'var(--may-shadow-sm)',
                }}
              />
              <div style={{ ...mono, marginTop: 'var(--may-space-2)' }}>{r}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Elevation"
        note="No hairline rings: surfaces separate by value, and only genuinely floating layers cast a shadow at all. The dark theme redefines every step rather than reusing the light one."
      >
        <div style={{ display: 'flex', gap: 'var(--may-space-5)', flexWrap: 'wrap' }}>
          {['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--may-radius-card)',
                  background: 'var(--may-color-surface)',
                  boxShadow: `var(--may-shadow-${s})`,
                }}
              />
              <div style={{ ...mono, marginTop: 'var(--may-space-2)' }}>{s}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Icon tiles" note="iOS app-icon gradients at a 22% squircle radius.">
        <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap' }}>
          {['blue', 'green', 'red', 'orange', 'yellow', 'purple', 'pink', 'teal', 'indigo', 'gray', 'spectrum'].map(
            (g) => (
              <div
                key={g}
                title={g}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--may-radius-squircle)',
                  background: `var(--may-grad-${g})`,
                }}
              />
            ),
          )}
        </div>
      </Section>
    </>
  ),
}
