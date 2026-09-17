# Motion

May UI's motion is real physics that runs on the compositor. There is almost no
JavaScript on the animation frame — the curves are baked into CSS at build time.

## Springs as `linear()`

`scripts/gen-springs.mjs` simulates a damped harmonic oscillator and samples it
into a CSS `linear()` easing. That means a real spring — overshoot, settle and
all — runs as an ordinary CSS transition, with nothing shipped to the browser
and no rAF loop.

Curve tokens:

- `--may-spring-snappy` — instant but alive, barely overshoots
- `--may-spring-smooth` — critically damped; sheets, heights
- `--may-spring-bouncy` — deliberate overshoot; pills, toasts, selection
- `--may-spring-playful` — the most expressive step

Durations: `--may-duration-instant` · `--may-duration-fast` ·
`--may-duration-settle` (340ms). Everything collapses under
`prefers-reduced-motion`.

The same constants are readable from JS for gesture code:

```tsx
import { motion } from '@adit_firdaus/may-ui'
motion.duration.settle          // 340
motion.spring('bouncy')         // 'var(--may-spring-bouncy)'
```

Never hand-edit `src/styles/motion.css` — it is generated. Change the generator
and run `npm run generate`.

## The sliding thumb

The single most recognisable piece of iOS motion is a selection indicator that
**slides** between items instead of cross-fading. It drives CapsuleTabs, TabBar,
Pagination, Steps and Selector, and it lives in one hook, `useSlidingThumb`
(`src/motion/useSlidingThumb.ts`).

`SegmentedControl` is the exception: its thumb is a Motion layout projection
(`motion/react`) rather than this hook, because it animates a real-sized element
whose fill squeezes under drag. That is the one place the `motion` runtime
dependency is used.

The compositor half of the hook — the part that actually moves the thumb — lives
separately in `src/motion/sliding-thumb.ts`, which also owns the settle timing.

The thumb is laid out once at 1px and positioned entirely with `translate` +
`scale`, so a selection change never touches layout — it stays on the compositor.

```tsx
const { trackRef, thumbRef, registerItem, dragging, onPointerDown } =
  useSlidingThumb({
    itemCount: options.length,
    selectedIndex,
    onSelect: (i) => commit(options[i].value), // present ⇒ drag; absent ⇒ press-only
    roundEnds: true,                            // pill ends, radius-shear corrected
    pressScale: 1.16,                           // puff while held
    axis: 'inline',                             // or 'block' for a vertical strip
  })
```

Two modes, one gesture cut at different lengths:

- **Drag** (`onSelect` present) — the thumb previews the item under the pointer,
  rubber-bands past the ends, and commits selection on release. This was
  SegmentedControl's mode; since that control moved to a Motion layout
  projection, no component in the package uses it, and the capability remains
  for a control that owns its own axis.
- **Press-only** (`onSelect` absent) — the thumb puffs when its own item is
  pressed and settles when selection changes, but never tracks the pointer, so a
  scrolling strip keeps its pan axis. Every current consumer is in this mode:
  CapsuleTabs, TabBar, Pagination, Steps and Selector.

The hook publishes generic gesture state on the track — `data-dragging`,
`data-following`, and a signed `--may-thumb-overdrag` length — so a component's
own decoration (a squeezing fill, say) can read it without the hook
knowing that decoration exists.

## Exits that stay mounted

An element cannot animate while it is being removed from the tree. May UI keeps
overlays mounted through their exit with `useExitDelay` (`src/overlay`): it holds
the element for the exit duration after `open` goes false, then unmounts. Exit transitions animate `opacity` only — an
animation that names `transform` would snap when it interrupts an entrance.
Sheet, Modal, AlertDialog, ActionSheet, CommandPalette and ContextMenu all use
this.

Pass that mounted-through-exit flag — not the raw `open` prop — to `useOverlay`.
Releasing the scroll lock and returning focus when `open` flips does it at the
*start* of the exit: the scrollbar comes back, the viewport narrows under a panel
that is still on screen, and its width snaps mid-dismiss.
