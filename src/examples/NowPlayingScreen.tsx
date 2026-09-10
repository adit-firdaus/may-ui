import { useState } from 'react'
import {
  IoChatboxEllipses,
  IoChevronDown,
  IoEllipsisHorizontal,
  IoHeart,
  IoHeartOutline,
  IoList,
  IoPause,
  IoPlay,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoRepeat,
  IoShuffle,
  IoVolumeHigh,
  IoVolumeLow,
} from 'react-icons/io5'
import { Box } from '../components/Box'
import { IconButton } from '../components/IconButton'
import { Slider } from '../components/Slider'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'

/** The album cut, in seconds. 4:17 — long enough that the scrubber has somewhere to go. */
const DURATION = 257

/** m:ss, the only clock format a track under an hour ever needs. */
function clock(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** off → all → one → off, the order the button cycles in Music. */
type RepeatMode = 'off' | 'all' | 'one'
const NEXT_REPEAT: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' }

/**
 * Now Playing.
 *
 * Pinned dark rather than adaptive: Music's full-screen player is dark in both
 * appearances, because the artwork is the light source and a white page around
 * it would out-shine the thing you came to look at. `data-may-theme="dark"` on
 * the wrapper flips the whole token layer for this subtree alone, which is the
 * one-attribute version of that decision.
 *
 * Everything is laid out in one column with the artwork as the only flexible
 * row, so the controls keep their spacing on a short phone and the artwork
 * gives up the height instead of the transport bar.
 */
export function NowPlayingScreen() {
  const [elapsed, setElapsed] = useState(102)
  const [playing, setPlaying] = useState(true)
  const [volume, setVolume] = useState(62)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [loved, setLoved] = useState(false)

  return (
    <div
      data-may-theme="dark"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-4)',
        background: 'var(--may-color-bg)',
        padding: `calc(var(--may-inset-top) + var(--may-space-3)) var(--may-space-5)
          calc(var(--may-inset-bottom) + var(--may-space-4))`,
      }}
    >
      {/* Dismiss / source / more — the chrome that sits over the artwork. */}
      <Stack direction="row" align="center" justify="between">
        <IconButton aria-label="Minimise player" size="sm" tone="neutral">
          <IoChevronDown aria-hidden />
        </IconButton>
        <Stack gap={0} align="center">
          <Text variant="caption-2" tone="tertiary" weight="semibold" style={{ letterSpacing: '0.08em' }}>
            PLAYING FROM ALBUM
          </Text>
          <Text variant="caption-1" weight="semibold">
            Aurora Drift
          </Text>
        </Stack>
        <IconButton aria-label="More options" size="sm" tone="neutral">
          <IoEllipsisHorizontal aria-hidden />
        </IconButton>
      </Stack>

      {/*
       * The artwork is the only row allowed to give up height, and it stays
       * square while it does: a centred flex line whose child is measured from
       * its height, so the square shrinks symmetrically rather than cropping.
       */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          radius="sheet"
          shadow="2xl"
          aria-label="Album artwork: Aurora Drift by Solar Fields"
          role="img"
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            maxWidth: '100%',
            aspectRatio: '1 / 1',
            // Stand-in for a cover image, mixed from the system palette so it
            // still reads as artwork with no asset to load.
            background:
              'linear-gradient(155deg, var(--may-pink) 0%, var(--may-purple) 46%, var(--may-indigo) 100%)',
            // The press scale of the transport buttons is enough motion on this
            // screen; the artwork only ever settles into its box.
            transform: playing ? 'scale(1)' : 'scale(0.94)',
            transition: 'transform var(--may-duration-settle) var(--may-spring-snappy)',
          }}
        >
          {/* Two soft lights, the way a printed sleeve catches a lamp. */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(70% 55% at 22% 14%, var(--may-orange), transparent 62%)',
              opacity: 0.55,
            }}
          />
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(60% 50% at 84% 88%, var(--may-cyan), transparent 58%)',
              opacity: 0.45,
            }}
          />
          <Stack
            gap={1}
            style={{
              position: 'absolute',
              insetInline: 'var(--may-space-5)',
              insetBlockEnd: 'var(--may-space-5)',
            }}
          >
            <Text
              variant="caption-2"
              weight="bold"
              style={{ color: 'var(--may-on-color)', letterSpacing: '0.22em' }}
            >
              SOLAR FIELDS
            </Text>
            <Text variant="title-3" weight="bold" style={{ color: 'var(--may-on-color)' }}>
              Aurora Drift
            </Text>
          </Stack>
        </Box>
      </div>

      {/* Track identity. The love button sits on the title line, not in the bar. */}
      <Stack direction="row" align="center" justify="between" gap={3}>
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text variant="title-2" clamp={1}>
            Ultraviolet
          </Text>
          <Text variant="body" tone="secondary" clamp={1}>
            Solar Fields
          </Text>
        </Stack>
        <IconButton
          aria-label={loved ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={loved}
          variant="gray"
          round
          tone={loved ? 'danger' : 'neutral'}
          onClick={() => setLoved((v) => !v)}
        >
          {loved ? <IoHeart aria-hidden /> : <IoHeartOutline aria-hidden />}
        </IconButton>
      </Stack>

      {/*
       * Scrubber. The remaining time is negative on purpose — Music counts down
       * on the trailing edge, and a second count-up there would give the same
       * information twice. `formatValue` also feeds aria-valuetext, so the
       * position is announced as a time rather than as "103".
       */}
      <Slider
        aria-label="Playback position"
        value={elapsed}
        max={DURATION}
        onValueChange={setElapsed}
        tone="neutral"
        formatValue={clock}
        leading={
          <Text as="span" variant="caption-1" tone="tertiary" mono>
            {clock(elapsed)}
          </Text>
        }
        trailing={
          <Text as="span" variant="caption-1" tone="tertiary" mono>
            −{clock(DURATION - elapsed)}
          </Text>
        }
      />

      {/* Transport. Play is the one target that grows; the rest stay chrome. */}
      <Stack direction="row" align="center" justify="between">
        <IconButton
          aria-label="Shuffle"
          aria-pressed={shuffle}
          tone={shuffle ? 'tint' : 'neutral'}
          onClick={() => setShuffle((v) => !v)}
        >
          <IoShuffle aria-hidden />
        </IconButton>
        <IconButton
          aria-label="Previous track"
          size="lg"
          tone="neutral"
          style={{ fontSize: 'var(--may-text-title-3)' }}
          onClick={() => setElapsed(0)}
        >
          <IoPlaySkipBack aria-hidden />
        </IconButton>
        <IconButton
          aria-label={playing ? 'Pause' : 'Play'}
          size="lg"
          round
          variant="gray"
          tone="neutral"
          style={{ fontSize: 'var(--may-text-title-1)' }}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? <IoPause aria-hidden /> : <IoPlay aria-hidden />}
        </IconButton>
        <IconButton
          aria-label="Next track"
          size="lg"
          tone="neutral"
          style={{ fontSize: 'var(--may-text-title-3)' }}
          onClick={() => setElapsed(DURATION)}
        >
          <IoPlaySkipForward aria-hidden />
        </IconButton>
        <IconButton
          aria-label={`Repeat: ${repeat}`}
          aria-pressed={repeat !== 'off'}
          tone={repeat === 'off' ? 'neutral' : 'tint'}
          onClick={() => setRepeat((mode) => NEXT_REPEAT[mode])}
        >
          {repeat === 'one' ? <RepeatOneIcon /> : <IoRepeat aria-hidden />}
        </IconButton>
      </Stack>

      {/* Volume. Both glyphs are decoration — the slider carries the label. */}
      <Slider
        aria-label="Volume"
        value={volume}
        onValueChange={setVolume}
        tone="neutral"
        formatValue={(v) => `${v}%`}
        leading={<IoVolumeLow aria-hidden />}
        trailing={<IoVolumeHigh aria-hidden />}
      />

      {/* Lyrics, output and queue — the three destinations Music keeps here. */}
      <Stack direction="row" align="center" justify="center" gap={16}>
        <IconButton aria-label="Lyrics" tone="neutral">
          <IoChatboxEllipses aria-hidden />
        </IconButton>
        <IconButton aria-label="AirPlay: Living Room" tone="tint">
          <AirPlayIcon />
        </IconButton>
        <IconButton aria-label="Playing next" tone="neutral">
          <IoList aria-hidden />
        </IconButton>
      </Stack>
    </div>
  )
}

/* ------------------------------- glyph set -------------------------------- */
/* What is left is what Ionicons does not carry: the set has `repeat` but no
 * repeat-one, and no AirPlay mark at all. Everything else here is an Ionicon. */

function RepeatOneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10.5V9a3 3 0 013-3h9" />
        <path d="M15.4 3.4L18.6 6l-3.2 2.6" />
        <path d="M18 13.5V15a3 3 0 01-3 3H6" />
        <path d="M8.6 15.4L5.4 18l3.2 2.6" />
      </g>
      <path d="M11.4 9.8h1.3v4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AirPlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6.4 16H4.6A2.6 2.6 0 012 13.4V6.2a2.6 2.6 0 012.6-2.6h14.8A2.6 2.6 0 0122 6.2v7.2a2.6 2.6 0 01-2.6 2.6h-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 13.6l5.2 6.8H6.8z" fill="currentColor" />
    </svg>
  )
}
