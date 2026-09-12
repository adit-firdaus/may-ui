# Motion SegmentedControl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace SegmentedControl's one-pixel custom thumb with a real-sized Motion layout thumb while preserving its API, accessibility, keyboard, and drag behavior.

**Architecture:** A namespaced `LayoutGroup` moves one `motion.span` between selected segments using layout projection. Motion drag is started from the selected segment, constrained to the track, and resolves cached segment bounds only when the pointer crosses an option.

**Tech Stack:** React 19, Motion for React 13.2, TypeScript, Vite, existing script gates, Chrome DevTools traces.

---

### Task 1: Add failing migration contracts

**Files:**
- Modify: `scripts/check-provider.mjs`
- Modify: `scripts/smoke.mjs`

- [x] Assert SegmentedControl imports `LayoutGroup`, `MotionConfig`, `motion`,
and `useDragControls` from `motion/react`, contains a namespaced `layoutId`,
uses constrained momentum-free x dragging, caches segment bounds, and no longer
imports `useSlidingThumb`.

- [x] Extend the existing SegmentedControl smoke assertion so its selected
button contains `may-segmented__thumb`, while tablist and selected-tab semantics
remain unchanged.

- [x] Run `npm run build && npm run smoke && npm run check:provider`; expect the
new contracts to fail against the custom thumb.

### Task 2: Add and externalize Motion

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `scripts/check-size.mjs`
- Modify: `README.md`
- Modify: `docs/getting-started.md`
- Modify: `docs/README.md`

- [x] Install `motion@^13.2.0` as a runtime dependency.

- [x] Add `/^motion(?:\/|$)/` to the library build external list and add
`motion` to the sanctioned runtime dependency set.

- [x] Update setup and dependency documentation to state that Motion powers
SegmentedControl layout projection while `react-icons` supplies glyphs.

### Task 3: Implement the Motion SegmentedControl

**Files:**
- Modify: `src/components/SegmentedControl/SegmentedControl.tsx`
- Modify: `src/components/SegmentedControl/SegmentedControl.css`

- [x] Replace `useSlidingThumb` with `LayoutGroup`, `MotionConfig`,
`motion.span`, and `useDragControls`. Namespace `layoutId` with `useAutoId`.

- [x] Keep `current` as committed state and add drag-preview index/ref state.
At drag start, cache each enabled segment's left/right bounds once. During drag,
use `PanInfo.point.x` to update preview only when the hit index changes; commit
the last enabled hit on drag end.

- [x] Render the thumb inside the selected button while drag-preview state
tracks label contrast. Configure
`layoutId`, a 220 ms layout transition, `drag="x"`, ref constraints, low
elasticity, no momentum, snap-to-origin, and imperative drag controls. Start
drag only from the currently committed segment.

- [x] Retain role, ARIA selection, roving tab index, disabled options, click,
and arrow-key selection. Wrap the control in `MotionConfig reducedMotion="user"`
and a namespaced `LayoutGroup`.

- [x] Update CSS so segments own the real-sized absolute thumb and their label
content remains above it. Remove one-pixel width, runtime transform-origin,
and track-level custom thumb geometry rules while keeping BEM classes and
selected/drag-hit contrast.

- [x] Run `npm run build && npm run smoke && npm run check:provider` until all
focused contracts pass.

### Task 4: Verify budgets and behavior

**Files:**
- Modify budgets only if the measured build requires it

- [x] Run `npm run verify` and `npm run build-storybook`. If a budget fails,
set only that budget to the first measured result rounded up to the next KiB.

- [x] Run the production site at 412 × 915 touch with 4× CPU slowdown. Verify
tap, keyboard, disabled options, drag selection, multiple instances, reduced
motion, and no console errors.

- [x] Record SegmentedControl INP and CLS. Inspect active animations and confirm
the real-sized Motion thumb projects with transforms and performs no per-frame
layout reads.

### Task 5: Merge and deploy

**Files:**
- Verify only

- [ ] Commit with the repository's Conventional Commit format, fast-forward
into `master`, rerun `npm run verify`, push, and watch GitHub Pages.

- [ ] Repeat the public-build mobile trace and report that Motion is deployed.
Ask the user to verify the physical Exynos phone because emulation cannot prove
device-specific GPU frame pacing.
