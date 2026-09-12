# Compositor-Only Sliding Thumb Design

## Goal

Make SegmentedControl and the shared sliding thumb maintain 60 FPS on older
mobile GPUs by removing every continuously painted or laid-out property from
the tap animation.

## Evidence

The deployed SegmentedControl records healthy input latency: 38–48 ms INP at a
412 × 915 touch viewport with 4× CPU slowdown. JavaScript frame sampling also
shows no sustained main-thread stalls. The user's Exynos device nevertheless
renders the visible transition at roughly 20–30 FPS, which points to GPU raster
work rather than event handling.

One captured tap starts transitions for:

- the thumb's transform and box shadow;
- the track pseudo-element's top, right, bottom, left, and transform;
- both segment labels' color changes.

Only transform is reliably compositor-friendly. The four inset longhands force
layout/paint, while color and box-shadow transitions require repeated raster.
A runtime CSS experiment that preserves the gesture using only transforms
reduces the transition list to transform events alone.

## Shared Thumb Runtime

`applyThumb` continues to calculate and write only the thumb transform. Its
transition string no longer interpolates `box-shadow`. Pressed shadow state
continues to switch through existing component CSS, but it changes once rather
than repainting throughout the 220 ms movement.

This applies to every `useSlidingThumb` consumer without adding a persistent
`will-change` layer. The existing transform duration, easing, pointer-follow
duration, reduced-motion handling, geometry, and selection behavior remain
unchanged.

## SegmentedControl Track

The track pseudo-element stays at `inset: 0`. Its existing overdrag translation
is combined with a small uniform scale:

- rest: `translateX(overdrag) scale(1)`;
- pressed: `translateX(overdrag) scale(0.98)`.

The pseudo-element transitions only `transform`, using the shared settle clock
at rest and the 90 ms follow clock while dragging. This preserves the pressed
squeeze without animating inset or changing measured track geometry.

## Segment Labels

Label color and font weight still identify the selected or drag-hit segment,
but they switch immediately. The moving solid thumb remains the transition and
visually carries the selection between labels; an additional text fade adds
raster work without adding useful spatial information.

## Verification

Extend the framework-free design contract to assert:

- shared thumb transition strings name only `transform`;
- SegmentedControl's track transitions only `transform`;
- SegmentedControl segment labels have no transition declaration;
- inset remains fixed while the pressed selector changes only transform;
- follow and settle durations remain 90 ms and 220 ms.

Run `npm run verify` and `npm run build-storybook`. In Chrome DevTools, emulate
the Note-class viewport with 4× CPU slowdown, capture one tap, and verify that
all `transitionrun` events inside the preview name only `transform`. Confirm
INP remains below 100 ms, CLS stays 0, reduced motion still collapses duration,
and drag-to-select remains functional.

## Non-goals

Do not change public props, selection semantics, thumb geometry, drag behavior,
the catalog windowing system, general motion tokens, or add permanent
compositor hints.

## Verified Result

The production build was traced at 412 × 915 touch with 4× CPU slowdown. A tap
now emits only three transition events, all for `transform`; the previous inset,
color, and box-shadow events are absent. INP is 45 ms, CLS is 0, pointer drag
still changes selection, and the browser reports no console messages. The full
repository gate and Storybook production build pass.
