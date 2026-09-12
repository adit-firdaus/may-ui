# Motion SegmentedControl Design

## Goal

Replace only SegmentedControl's custom sliding-thumb implementation with Motion
for React, using an actual segment-sized thumb and Motion layout projection to
test and address the Galaxy Note 20 Ultra Exynos frame-pacing problem.

## Scope

SegmentedControl moves to `motion/react`. CapsuleTabs, TabBar, Pagination,
Steps, Selector, Tabs, overlays, generated springs, and the shared
`useSlidingThumb` runtime remain unchanged.

The public SegmentedControl API, BEM class names, provider defaults, markup
semantics, controlled/uncontrolled behavior, disabled options, keyboard
navigation, and appearance remain compatible.

## Dependency and Build

Add `motion` as a required runtime dependency. Externalize `motion` and its
subpaths from the library build so consumers resolve their installed copy and
May UI does not bundle a duplicate. Update runtime-dependency verification and
documentation that currently claim `react-icons` is the only runtime package.

The unified site and Storybook bundle Motion normally. Their budgets are changed
only if the measured tree-shaken production result exceeds the existing limit;
any adjustment is rounded to the next KiB with no speculative headroom.

## Thumb Layout

Wrap each SegmentedControl in a uniquely named `LayoutGroup`. The selected
segment renders one `motion.span` with a namespaced `layoutId`.
The thumb is positioned inside that segment at its real width and height instead
of stretching a one-pixel element by a large scale factor.

When selection changes, Motion measures the old and new segment-sized thumb and
projects between them with transforms. The layout transition uses a short spring
targeting the current 220 ms feel. `MotionConfig reducedMotion="user"` disables
layout transforms for users requesting reduced motion.

## Tap and Keyboard Selection

Buttons retain their existing tab roles and roving tab index. Click and arrow
key commits keep the existing controlled/uncontrolled data flow. A selection
render moves the namespaced Motion thumb to the new button. The track publishes
a Motion press variant so any enabled segment press puffs the blue thumb from
1 to 1.16 and release settles it back to 1, restoring the feedback removed by
the initial Motion rewrite. Disabled options are never selected.

The layout projection is a 220 ms tween using Motion's `backOut` easing. That
curve applies to the horizontal selection travel and gives the thumb a small
arrival overshoot. The scale response uses its own short ease-out transition so
horizontal travel and press feedback do not borrow one timing function.

## Drag Selection

The selected segment starts Motion drag through `useDragControls`; unselected
buttons remain ordinary tap targets. The thumb drags on the x axis within the
track ref, with low elasticity, no momentum, and snap-to-origin behavior. Drag
keeps direct pointer tracking and the 1.16 held scale; `backOut` applies only to
selection layout settling, never to live pointer following.

At drag start, read segment rectangles once into a ref. `onDrag` compares
Motion's pointer point with those cached numeric bounds and updates preview state
only when the pointer crosses into another enabled segment. It performs no
layout reads per frame. `onDragEnd` commits the last enabled hit and clears drag
state. The track's existing `data-dragging` and segment `data-hit` styling keep
label contrast correct while the thumb moves.

## Styling

Remove the transform geometry assumptions that belong to the one-pixel thumb:
fixed one-pixel width, transform origin correction, runtime border-radius
correction, and track pointerdown ownership. The Motion thumb fills its segment
and retains the current primary fill, radius, and pressed elevation.

No color, shadow, font-weight, width, or inset animation is introduced. The
thumb's visible travel remains transform-only.

## Verification

Add framework-free gates that assert:

- SegmentedControl imports Motion and no longer imports `useSlidingThumb`;
- the thumb uses a namespaced `layoutId` and a real-sized layout box;
- tap and drag publish the 1.16 press scale, while layout uses `backOut`;
- Motion drag is constrained, momentum-free, and uses cached segment bounds;
- ARIA, controlled, uncontrolled, disabled, and keyboard contracts remain;
- `motion` is declared and externalized;
- shared thumb consumers other than SegmentedControl remain unchanged;
- dependency and bundle budgets reflect the measured production result.

Run `npm run verify` and `npm run build-storybook`. Browser verification covers
tap, keyboard, drag, disabled options, reduced motion, SSR, nested/multiple
controls, catalog windowing, and console output.

Profile the production build at 412 × 915 touch with 4× CPU slowdown. Require
INP below 100 ms, CLS 0, transform-only visual travel, and no per-frame layout
reads. Deploy the replacement for final confirmation on the physical Exynos
phone; this hardware test is the only proof that Motion's real-sized layout
projection fixes the device-specific FPS issue.

## Non-goals

Do not migrate other May UI motion, add new public props, redesign the control,
or remove `useSlidingThumb` while other components still consume it.
