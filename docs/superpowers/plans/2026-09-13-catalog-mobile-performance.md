# Catalog Mobile Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep all 91 catalog cards while eliminating off-screen live-preview work, scroll instability, and the slow shared thumb settle on older phones.

**Architecture:** `ComponentsPage` remains the catalog owner and adds one native `IntersectionObserver` for every rendered card, mounting `PreviewRenderer` only inside a viewport window. Site CSS fixes card geometry and suppresses catalog-only metadata animation; the shared motion constant becomes the single 220 ms thumb clock.

**Tech Stack:** React 19, TypeScript, IntersectionObserver, May UI, Vite, Node assertion scripts, Chrome DevTools performance traces.

---

### Task 1: Add failing performance contracts

**Files:**
- Modify: `scripts/check-site.mjs`
- Test: `scripts/check-site.mjs`

- [x] **Step 1: Add catalog rendering assertions**

Read `ComponentsPage.tsx`, `site.css`, `sliding-thumb.ts`, and
`SegmentedControl.tsx` inside the existing catalog contract. Assert that the
page uses `useDeferredValue`, one `IntersectionObserver`, a 1000 px root margin,
conditional preview mounting, and a placeholder. Assert that card height and
intrinsic size share one CSS variable and metadata tags disable only their
catalog entrance animation. Assert the shared settle is 220 ms and
SegmentedControl no longer defines or passes a private settle duration.

```js
const catalogSource = readFileSync(resolve(root, 'examples/src/pages/ComponentsPage.tsx'), 'utf8')
const siteCss = readFileSync(resolve(root, 'examples/src/site.css'), 'utf8')
const thumbSource = readFileSync(resolve(root, 'src/motion/sliding-thumb.ts'), 'utf8')
const segmentedSource = readFileSync(resolve(root, 'src/components/SegmentedControl/SegmentedControl.tsx'), 'utf8')

assert.match(catalogSource, /useDeferredValue/)
assert.equal((catalogSource.match(/new IntersectionObserver/g) ?? []).length, 1)
assert.match(catalogSource, /rootMargin: '1000px 0px'/)
assert.match(catalogSource, /visiblePreviews\.has\(item\.slug\)/)
assert.match(catalogSource, /site-catalog-card__placeholder/)
assert.match(siteCss, /--site-catalog-card-height:/)
assert.match(siteCss, /height: var\(--site-catalog-card-height\)/)
assert.match(siteCss, /contain-intrinsic-size: auto var\(--site-catalog-card-height\)/)
assert.match(siteCss, /site-catalog-card__meta \.may-tag[^}]*animation: none/s)
assert.match(thumbSource, /export const SETTLE_MS = 220/)
assert.doesNotMatch(segmentedSource, /const SETTLE_MS|settleMs:/)
```

- [x] **Step 2: Run the contract and verify RED**

Run `npm run check:site`.

Expected: the catalog performance assertions fail because all previews still
mount and the shared settle is 340 ms.

### Task 2: Window live catalog previews

**Files:**
- Modify: `examples/src/pages/ComponentsPage.tsx`
- Test: `scripts/check-site.mjs`

- [x] **Step 1: Defer only the search result computation**

Import `useDeferredValue`, derive `deferredQuery` from `query`, and wrap
`filtered` and `grouped` in `useMemo`. Keep the controlled input bound to
`query`; compare catalog text against `deferredQuery`.

- [x] **Step 2: Add one observer for the current card set**

Add `visiblePreviews` state and an effect that observes every
`[data-catalog-slug]` card with `{ rootMargin: '1000px 0px' }`. Batch each
callback into one copied `Set`, adding intersecting slugs and removing distant
ones unless the card contains `document.activeElement`. Disconnect on filter or
route changes. When `IntersectionObserver` is unavailable, activate every
filtered slug.

Use `useIsDesktop` to omit the desktop Sidebar entirely on phone layouts; the
same navigation tree mounts inside the Sheet only while it is open.

- [x] **Step 3: Preserve stable cards while windowing previews**

Add `data-catalog-slug={item.slug}` to every card. Render the live preview only
when `visiblePreviews.has(item.slug)`; otherwise render:

```tsx
<span className="site-catalog-card__placeholder" aria-hidden="true">
  {item.name} preview
</span>
```

The metadata, heading, description, fragment ID, and workbench link stay
outside the conditional.

- [x] **Step 4: Run the focused checks**

Run `npm run site:typecheck && npm run site:build && npm run check:site`.

Expected: TypeScript, the production site build, route budget, and performance
contract pass.

### Task 3: Stabilize catalog layout and reveal work

**Files:**
- Modify: `examples/src/site.css`
- Test: `scripts/check-site.mjs`

- [x] **Step 1: Give cards exact geometry**

Define `--site-catalog-card-height: 26rem` on `.site-catalog-grid`. Replace the
card's `min-height` with `height: var(--site-catalog-card-height)` and use
`contain-intrinsic-size: auto var(--site-catalog-card-height)`. Give the preview
region a fixed 11 rem basis.

- [x] **Step 2: Bound text and style the placeholder**

Clamp descriptions to three lines with `-webkit-line-clamp`, and make the
placeholder occupy the preview region using secondary text and the existing
fill/radius tokens.

- [x] **Step 3: Remove catalog-only decorative animation**

Add `.site-catalog-card__meta .may-tag { animation: none; }`. Do not disable
motion inside `.site-catalog-card__preview`.

Hide `.site-footer` only while its preceding route contains `.site-loading`, so
the lazy route replacing its short fallback cannot shift the footer onscreen.

- [x] **Step 4: Run the focused checks**

Run `npm run site:build && npm run check:site`.

Expected: the site builds and all site contracts pass.

### Task 4: Shorten the shared sliding-thumb settle

**Files:**
- Modify: `src/motion/sliding-thumb.ts`
- Modify: `src/components/SegmentedControl/SegmentedControl.tsx`
- Test: `scripts/check-site.mjs`

- [x] **Step 1: Make the shared clock 220 ms**

Change `SETTLE_MS` from 340 to 220 and update its explanatory comment. Leave
`FOLLOW_MS`, `TINT_MS`, and `motion.duration.settle` unchanged.

- [x] **Step 2: Remove SegmentedControl's duplicate clock**

Delete its private `SETTLE_MS` constant and the `settleMs` option passed to
`useSlidingThumb`. Keep `SETTLE_EASING` so the component retains its curve.

- [x] **Step 3: Run the focused checks**

Run `npm run build && npm run check:site`.

Expected: the library builds and the 220 ms shared-motion contract passes.

### Task 5: Verify and profile the complete fix

**Files:**
- Verify only

- [x] **Step 1: Run repository verification**

Run `npm run verify`.

Expected: build, 91/91 smoke render, provider, token, design, size, coverage,
site build, and site contracts all pass.

- [x] **Step 2: Build Storybook**

Run `npm run build-storybook`.

Expected: Storybook builds successfully.

- [x] **Step 3: Re-profile the production preview**

Serve the built site and profile `/components` at 412 × 915, device scale 2.625,
touch, Fast 4G, and 4× CPU throttling. Record cold navigation, a complete smooth
scroll, and SegmentedControl interaction. Compare against 43 ms mount reflow,
0.1546 scroll CLS, and 53 ms interaction INP.

Required result: interaction INP remains below 100 ms, scroll CLS is below 0.1,
forced reflow is materially lower, all 91 cards remain present, and no console
errors occur.

- [x] **Step 4: Inspect the final diff**

Run `git diff --check`, `git status --short`, and `git diff --stat`.

Expected: only the approved spec/plan, catalog page/style/check, shared thumb
constant, and SegmentedControl clock cleanup are changed.

## Execution status

All steps completed. The final mobile trace recorded 0.00 cold/scroll CLS,
56 ms SegmentedControl INP, 4 initially live previews out of 91 cards, and a
mobile DOM reduction from 1,373 to 1,065 elements.
