# Full Catalog Sidebar Design

## Goal

Turn `/components` into a complete visual catalog where all 91 public visual
components are present in one page and easy to scan, filter, preview, and open.

## Application Shell

The catalog uses May UI's existing `Sidebar` as its desktop workbench shell.
The global site header continues to own top-level routes; within the catalog,
the sidebar owns component navigation. On small screens, the same navigation is
shown in a May UI `Sheet` opened from a compact catalog toolbar.

The sidebar contains:

- component search;
- Adaptive, Desktop, and Mobile family sections with counts;
- category links under each family;
- individual component links that scroll to the corresponding catalog card.

Family and category links update the active filter. Individual component links
use stable fragment identifiers and preserve the current query state.

## Catalog Content

The main pane renders every matching component as a compact live-preview card,
grouped first by family and then by category. With the default filters, all 91
components are represented in the document at the same time.

Each card contains:

- family and category metadata;
- a constrained live preview using the existing `PreviewRenderer`;
- component name and short description;
- a link to the existing full component workbench.

Overlay components render their existing launch buttons instead of opening on
page load. Desktop-only components render inside a horizontally contained
preview surface. The card itself is not one large link so its interactive
preview remains semantically valid; only its explicit detail action navigates.

## Filtering and Navigation

Search and family/category controls filter the card groups immediately. The
page reports the visible count while retaining the total component count.
Empty results use the existing `EmptyState` and offer one action to clear all
filters.

The desktop sidebar stays available while the main pane scrolls. Active section
state follows the current filter or fragment target without introducing a new
router or scroll-observer abstraction.

## Performance and Accessibility

All cards remain in normal document order, but existing native
`content-visibility: auto` containment prevents off-screen previews from doing
unnecessary paint work. No virtualization or third-party dependency is added.

The page preserves heading hierarchy, keyboard navigation, visible focus,
semantic interactive controls, reduced-motion behavior, and mobile sheet focus
management supplied by May UI. Fragment targets receive a scroll margin below
the sticky site chrome.

## Verification

Extend the existing framework-free site gate to assert that the catalog index:

- renders a `PreviewRenderer` for every filtered catalog entry;
- provides stable component fragment identifiers;
- does not wrap interactive previews in navigation links;
- includes desktop sidebar and mobile sheet navigation;
- reports visible and total component counts.

Run `npm run verify`, build Storybook, then browser-check the deployed-shaped
production build at desktop and phone widths. Verify all 91 default cards,
search/filtering, fragment scrolling, overlay launch buttons, detail links, and
the absence of console errors.

## Non-goals

The component detail pages, public May UI API, generated metadata format,
provider configurator, and Storybook catalog remain unchanged.
