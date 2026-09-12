# Compositor-Only Sliding Thumb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the sliding-thumb gesture while making every continuously animated SegmentedControl property compositor-friendly.

**Architecture:** Keep `applyThumb` responsible only for transform timing. Rebuild SegmentedControl's pressed track effect as a transform scale and make text/shadow state changes instantaneous, with the existing design gate enforcing the property boundary.

**Tech Stack:** TypeScript, React 19, CSS transforms, existing Node verification scripts, Chrome DevTools traces.

---

### Task 1: Define the compositor-only contract

**Files:**
- Modify: `scripts/check-contract.mjs`
- Test: `scripts/check-contract.mjs`

- [ ] Add `readFileSync` and read `src/motion/sliding-thumb.ts`. Use the existing
`rules(css)` parser to find the exact SegmentedControl pseudo-element, following,
segment, and thumb rule bodies.

- [ ] Add a check requiring shared transition strings to omit `box-shadow`, the
track and following rules to transition only `transform`, the base track to keep
`inset: 0`, the pressed rule to change `transform` rather than `inset`, and the
segment rule to omit `transition`.

- [ ] Run `npm run build && npm run check:contract` and confirm the new check
fails because the current tap animates inset, colors, and box shadow.

### Task 2: Remove shared shadow interpolation

**Files:**
- Modify: `src/motion/sliding-thumb.ts`
- Test: `scripts/check-contract.mjs`

- [ ] Change every `applyThumb` transition string to name only `transform`.
Keep `TINT_MS` exported for compatibility, but update its comment to explain
that consumers may use it for independent decoration rather than the thumb.

- [ ] Run `npm run build && npm run check:contract`; expect the check to remain
red until SegmentedControl CSS is converted.

### Task 3: Convert SegmentedControl to transform-only motion

**Files:**
- Modify: `src/components/SegmentedControl/SegmentedControl.css`
- Test: `scripts/check-contract.mjs`

- [ ] Replace the track pseudo-element transform with
`translateX(calc(var(--may-thumb-overdrag) * 0.25)) scale(1)` and transition only
`transform`.

- [ ] Change the pressed selector from `inset: 2px` to the same translation with
`scale(0.98)`. Change the following selector to transition only transform on
`var(--may-duration-follow) linear`.

- [ ] Remove the segment's color/font-weight transition declaration. Preserve
all selected, dragging, disabled, size, and pointer behavior.

- [ ] Run `npm run build && npm run check:contract`; expect the compositor-only
contract to pass.

### Task 4: Verify, profile, merge, and deploy

**Files:**
- Verify only

- [ ] Run `npm run verify` and `npm run build-storybook`.

- [ ] Run the production site and emulate 412 × 915 touch at 4× CPU slowdown.
Capture one SegmentedControl tap and assert every `transitionrun` inside the
preview names only `transform`, INP remains below 100 ms, and CLS is 0.

- [ ] Verify pointer drag still changes selection, reduced-motion duration still
collapses, and no console errors appear.

- [ ] Commit with the repository's Conventional Commit format, fast-forward to
`master`, rerun `npm run verify`, push, watch Pages, and repeat the live trace.

## Execution status

Implementation and local verification are complete. The production trace emits
only transform transitions, records 45 ms INP and 0 CLS at 4× CPU slowdown, and
preserves drag-to-select without console messages.
