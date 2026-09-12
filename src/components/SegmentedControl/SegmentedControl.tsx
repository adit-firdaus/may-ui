import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'
import { LayoutGroup, MotionConfig, motion, useDragControls } from 'motion/react'
import type { PanInfo } from 'motion/react'
import { cx } from '../../utils/cx'
import type { MaySize } from '../../types'
import { useAutoId } from '../../utils/useId'

const LAYOUT_TRANSITION = { type: 'spring', duration: 0.22, bounce: 0.15 } as const

interface SegmentBounds {
  index: number
  left: number
  right: number
}

export interface SegmentedOption<T extends string = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * Generic over the option value, so a union survives the round trip: with
 * `options` typed `'id' | 'en'`, `onValueChange` hands back `'id' | 'en'`
 * rather than `string`, and the cast every typed call site needed disappears.
 */
export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  /** Controlled value. */
  value?: T
  /** Uncontrolled initial value. */
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * iOS's segmented control.
 *
 * The thumb **slides** between segments and can be dragged, which is the part
 * that reads as iOS. Motion projects the real-sized thumb between buttons and
 * owns the constrained drag, while this component keeps selection and keyboard
 * policy in React.
 */
export function SegmentedControl<T extends string = string>({
  options = [],
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value)
  const [dragging, setDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const current = value ?? internal
  const id = useAutoId()
  const trackRef = useRef<HTMLDivElement>(null)
  const boundsRef = useRef<SegmentBounds[]>([])
  const hitRef = useRef(-1)
  const dragControls = useDragControls()

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  )

  const commit = (next: T) => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const cacheBounds = () => {
    boundsRef.current = [...(trackRef.current?.querySelectorAll<HTMLButtonElement>('.may-segmented__segment') ?? [])]
      .map((segment, index) => {
        const rect = segment.getBoundingClientRect()
        return { index, left: rect.left, right: rect.right }
      })
  }

  const hitAt = (x: number) => boundsRef.current.find(({ left, right }) => x >= left && x <= right)?.index ?? -1

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (index !== selectedIndex || options[index]?.disabled) return
    cacheBounds()
    hitRef.current = index
    setPreviewIndex(index)
    dragControls.start(event)
  }

  const previewDrag = (_event: PointerEvent, info: PanInfo) => {
    const next = hitAt(info.point.x)
    if (next < 0 || options[next]?.disabled || next === hitRef.current) return
    hitRef.current = next
    setPreviewIndex(next)
  }

  const finishDrag = () => {
    const landed = hitRef.current
    setDragging(false)
    setPreviewIndex(null)
    if (landed >= 0 && !options[landed]?.disabled) commit(options[landed]!.value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    let next = selectedIndex
    for (let i = 0; i < options.length; i++) {
      next = (next + delta + options.length) % options.length
      if (!options[next]?.disabled) break
    }
    commit(options[next]!.value)
    trackRef.current
      ?.querySelectorAll<HTMLButtonElement>('.may-segmented__segment')
      [next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={id}>
        <div
          {...rest}
          ref={trackRef}
          role="tablist"
          data-slot="segmented"
          data-size={size}
          data-dragging={dragging ? 'true' : undefined}
          className={cx('may-segmented', fullWidth && 'may-segmented--full', className)}
          onKeyDown={onKeyDown}
        >
          <motion.span
            className="may-segmented__track"
            animate={{ scale: dragging ? 0.98 : 1 }}
            transition={LAYOUT_TRANSITION}
            aria-hidden
          />
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={option.value === current}
              tabIndex={option.value === current ? 0 : -1}
              disabled={option.disabled}
              data-hit={dragging && previewIndex === index ? 'true' : undefined}
              onPointerDown={(event) => startDrag(event, index)}
              onClick={() => commit(option.value)}
              className="may-segmented__segment"
            >
              {index === selectedIndex && (
                <motion.span
                  layoutId={`may-segmented-thumb-${id}`}
                  className="may-segmented__thumb"
                  transition={{ layout: LAYOUT_TRANSITION }}
                  drag="x"
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={trackRef}
                  dragElastic={0.12}
                  dragMomentum={false}
                  dragSnapToOrigin
                  whileDrag={{ scale: 1.08 }}
                  onDragStart={() => setDragging(true)}
                  onDrag={previewDrag}
                  onDragEnd={finishDrag}
                  aria-hidden
                />
              )}
              <span className="may-segmented__label">{option.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
    </MotionConfig>
  )
}
