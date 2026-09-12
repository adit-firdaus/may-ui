# Catalog Mobile Performance Design

## Goal

Make the full `/components` catalog responsive on older mobile hardware while
preserving all 91 searchable component cards, live nearby previews, the May UI
sidebar/sheet navigation, and each component's full workbench page.

## Measured Baseline

Chrome DevTools profiling used a 412 × 915 mobile viewport, touch input, Fast
4G, and 4× CPU slowdown to approximate the user's Galaxy Note 20 Ultra Exynos.

- Catalog LCP: 462 ms, including 354 ms render delay.
- Catalog mount forced reflow: 43 ms. The largest library contribution comes
  from sliding-thumb geometry reads during React layout effects.
- Catalog document height: about 40,861 px before all intrinsic sizes resolve
  and about 39,429 px after a full scroll.
- Full-scroll CLS: 0.1546, concentrated when catalog categories and cards
  resolve their real sizes and several metadata tags animate.
- SegmentedControl INP under the same throttling: 53 ms.
- Warm desktop catalog interaction: 30–34 ms INP; isolated component: 50 ms.
- SegmentedControl transform transition: about 360 ms observed for a configured
  340 ms settle.

The thumb handler is responsive; the page lag comes from mounting and measuring
every live preview at once, while the thumb's long settle creates a separate
perception of latency.

## Catalog Rendering

All catalog cards remain rendered in document order with their metadata,
descriptions, stable fragment IDs, and workbench links. A single
`IntersectionObserver` owned by the catalog page tracks cards within a generous
vertical root margin. Only cards in that window mount `PreviewRenderer`.

Cards outside the window render a quiet preview placeholder with the same
dimensions. When a card leaves the window, its preview unmounts so long catalog
sessions do not accumulate component state, `ResizeObserver` instances, layout
effects, or GPU layers. Returning to a card remounts its canonical preview; the
detail workbench remains the place for persistent experimentation.

If `IntersectionObserver` is unavailable, previews render normally. This keeps
the catalog functional in unsupported environments without adding a polyfill.
On phone layouts, the CSS-hidden desktop Sidebar is not rendered; the duplicate
91-item navigation tree mounts only while its Sheet is open.

## Stable Layout

Catalog cards use one fixed block size at each responsive breakpoint. The live
preview region is fixed and scroll-contained, while descriptions are visually
clamped to the available space. `contain-intrinsic-size` matches the exact card
size, so content visibility never substitutes a different height.

The metadata `Tag` remains visually identical but its catalog-only entrance
animation is disabled. Component previews retain their own motion and remain
interactive.

While a lazy route is showing the shared loading fallback, its footer is not
rendered. This prevents the footer from shifting out of the viewport when the
full catalog chunk replaces the short loading state.

## Responsive Filtering

The search input keeps its immediate local value. A deferred version drives
catalog filtering and grouping, allowing React to update the result grid without
blocking keystrokes. Family, category, and capability controls remain immediate
because they are discrete interactions.

The observer reconnects to the currently rendered card set after filtering.
Removed cards are unobserved and no stale visible IDs remain.

## Sliding-Thumb Motion

The shared sliding-thumb settle duration changes from 340 ms to 220 ms.
SegmentedControl removes its duplicate 340 ms override and inherits the shared
clock while retaining its component-specific easing. CapsuleTabs, TabBar,
Pagination, Steps, and Selector receive the same quicker settle.

The 90 ms pointer-follow duration, drag geometry, rubber-band behavior, press
scale, reduced-motion behavior, and general `duration.settle` token remain
unchanged. No permanent `will-change` hint is added because allocating many
long-lived compositor layers increases memory pressure on older mobile GPUs.

## Accessibility and Behavior

Placeholder previews are hidden from assistive technology and do not create
dead interactive controls. Card headings, descriptions, counts, fragment
navigation, search, filters, and workbench links remain available regardless of
preview visibility. Focused or interacted-with previews remain inside the
observer window and cannot disappear during the interaction.

## Verification

Extend the existing framework-free site and motion gates to assert:

- one catalog-level `IntersectionObserver` manages preview activation;
- off-window cards retain metadata and stable placeholder dimensions;
- filtering uses `useDeferredValue`;
- the catalog metadata tag animation is disabled only inside catalog cards;
- the desktop catalog navigation is omitted from phone layouts;
- the route footer is omitted while the lazy loading fallback is present;
- the shared thumb settle is 220 ms;
- SegmentedControl has no private settle-duration override.

Run `npm run verify` and `npm run build-storybook`. Re-profile the production
site with the baseline mobile settings and require:

- SegmentedControl interaction latency below 100 ms;
- full-scroll CLS below 0.1;
- forced-reflow time materially lower than the 43 ms baseline;
- no blank preview when a card reaches the viewport;
- all 91 cards still searchable and navigable;
- no console errors.

## Non-goals

Do not paginate the catalog, replace previews with screenshots, change public
component props, alter the general 340 ms motion token, add a virtualization
dependency, or redesign component visuals.

## Verified Result

The production build was re-profiled with the baseline mobile settings:

- all 91 cards remain present while 4 previews are live initially;
- mobile DOM size fell from 1,373 to 1,065 elements;
- cold-navigation and full-scroll CLS are both 0.00;
- the cold-navigation forced-reflow insight no longer fires;
- a 30,000 px scroll accumulates 43 ms of geometry work while previews rotate
  through the viewport, instead of paying that cost for all previews at mount;
- SegmentedControl INP is 56 ms at 4× CPU slowdown;
- observed thumb settle completion fell from about 360 ms to 233 ms;
- the 1024 px JS and CSS catalog breakpoints produce the same Sidebar/Sheet
  branch at 1000 px and 1050 px;
- no browser console errors were reported.
