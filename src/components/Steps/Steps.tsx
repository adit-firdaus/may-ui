import type { HTMLAttributes, ReactNode } from 'react'
import { IoAlert, IoCheckmark } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useSlidingThumb } from '../../motion/useSlidingThumb'
import type { MaySize } from '../../types'
import './Steps.css'

/** The marker disc lifts a little under the press. Subtle — it wears a halo. */
const PRESS_SCALE = 1.12

/**
 * `error` is not derived from `current` — it is the only status a caller has
 * to declare, because nothing about an index says a step failed.
 */
export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'

export type StepsOrientation = 'horizontal' | 'vertical'

/** xs is absent: a marker that small stops being a touch target. */
export type StepsSize = Exclude<MaySize, 'xs'>

export interface StepItem {
  title: ReactNode
  description?: ReactNode
  /** Overrides the status derived from `current` — an upload that failed. */
  status?: StepStatus
  /** Replaces the number inside the marker. */
  icon?: ReactNode
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: StepItem[]
  /** Zero-based index of the step in progress. */
  current: number
  /** @default 'horizontal' */
  orientation?: StepsOrientation
  /**
   * Let a finished step be pressed to go back to it. Steps ahead of the
   * current one stay disabled — a stepper is not a tab strip.
   */
  clickable?: boolean
  onStepChange?: (index: number) => void
  /** @default 'md' */
  size?: StepsSize
  /** Accessible name for the sequence. @default 'Progress' */
  'aria-label'?: string
}

/** Spoken, never seen: the marker's colour carries this for everyone else. */
const STATUS_LABEL: Record<StepStatus, string> = {
  complete: 'Completed',
  current: 'Current step',
  upcoming: 'Not started',
  error: 'Failed',
}

interface StepProps {
  item: StepItem
  index: number
  status: StepStatus
  last: boolean
  clickable: boolean
  markerRef: (node: HTMLSpanElement | null) => void
  onSelect?: (index: number) => void
}

function Step({ item, index, status, last, clickable, markerRef, onSelect }: StepProps) {
  // Going forward is the stepper's job, not the user's: only ground already
  // covered can be pressed.
  const interactive = clickable && status !== 'upcoming'
  const { pressProps } = usePressFeedback(!interactive)

  const marker = (
    <span ref={markerRef} className="may-steps__marker" aria-hidden>
      {item.icon ??
        (status === 'complete' ? (
          <IoCheckmark className="may-steps__check" aria-hidden focusable="false" />
        ) : status === 'error' ? (
          <IoAlert aria-hidden focusable="false" />
        ) : (
          index + 1
        ))}
    </span>
  )

  const body = (
    <>
      {marker}
      <span className="may-steps__text">
        <span className="may-steps__title">{item.title}</span>
        {item.description && <span className="may-steps__description">{item.description}</span>}
      </span>
      <span className="may-sr-only">{STATUS_LABEL[status]}</span>
    </>
  )

  return (
    <li
      className="may-steps__step"
      data-slot="step"
      data-status={status}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      {clickable ? (
        <button
          {...pressProps}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(index)}
          className="may-steps__body may-pressable may-hoverable"
        >
          {body}
        </button>
      ) : (
        <span className="may-steps__body">{body}</span>
      )}
      {/* Furniture between two markers; the status word above already says
       * everything this line is drawing. */}
      {!last && <span className="may-steps__connector" aria-hidden />}
    </li>
  )
}

/**
 * Numbered progress through a sequence — a checkout, a device setup, an
 * onboarding flow.
 *
 * The connector between two markers is a track with a tinted fill that grows
 * along it as each step completes, so advancing reads as the line *filling in*
 * rather than a colour changing between frames. Nothing here is drawn with a
 * border: the track is a fill, the markers are fills, and the current one
 * carries a halo rather than a ring.
 */
export function Steps({
  items = [],
  current,
  orientation = 'horizontal',
  clickable = false,
  onStepChange,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Progress',
  ...rest
}: StepsProps) {
  const statusAt = (index: number): StepStatus =>
    items[index]?.status ??
    (index < current ? 'complete' : index === current ? 'current' : 'upcoming')

  /*
   * A filled disc that SLIDES to the current step instead of one marker's fill
   * switching off as another's switches on. Press-only: tapping a finished step
   * is what moves the selection (the step's own button owns that click), and
   * the thumb follows — a stepper is walked, not scrubbed, and a live drag would
   * have to pass the solid disc through the intermediate markers' own fills.
   * Inert unless `clickable`, so a read-only progress display is untouched.
   */
  const { trackRef, thumbRef, registerItem, onPointerDown } = useSlidingThumb<
    HTMLOListElement,
    HTMLSpanElement
  >({
    axis: orientation === 'vertical' ? 'block' : 'inline',
    itemCount: items.length,
    selectedIndex: current,
    roundEnds: true,
    pressScale: PRESS_SCALE,
    enabled: clickable,
  })

  return (
    <ol
      {...rest}
      ref={trackRef}
      aria-label={ariaLabel}
      data-slot="steps"
      data-orientation={orientation}
      data-size={size}
      data-clickable={clickable ? 'true' : undefined}
      className={cx('may-steps', className)}
      onPointerDown={clickable ? onPointerDown : undefined}
    >
      {clickable && <span ref={thumbRef} className="may-steps__thumb" aria-hidden />}
      {items.map((item, index) => (
        <Step
          key={index}
          item={item}
          index={index}
          status={statusAt(index)}
          last={index === items.length - 1}
          clickable={clickable}
          markerRef={registerItem(index)}
          onSelect={onStepChange}
        />
      ))}
    </ol>
  )
}
