# Full Catalog Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all public May UI components as live previews in one sidebar-driven `/components` catalog.

**Architecture:** Keep the existing generated catalog and `PreviewRenderer` as the only component data and rendering sources. Replace only the catalog-index branch of `ComponentsPage` with a May UI `Sidebar`/mobile `Sheet` shell, grouped preview cards, and source-level contract checks; keep component detail pages unchanged.

**Tech Stack:** React 19, TypeScript, May UI, native CSS containment, Vite, Node assertion scripts.

---

### Task 1: Define the catalog-index contract

**Files:**
- Modify: `scripts/check-site.mjs`
- Test: `scripts/check-site.mjs`

- [ ] **Step 1: Write the failing source-contract check**

Read `examples/src/pages/ComponentsPage.tsx` and assert that the catalog index
uses the library shell, stable anchors, live previews, non-link card roots, and
visible/total count text:

```js
check('catalog index renders every component in a responsive app shell', () => {
  const source = readFileSync(resolve(root, 'examples/src/pages/ComponentsPage.tsx'), 'utf8')
  assert.match(source, /<Sidebar/)
  assert.match(source, /<Sheet[^>]+title="Component catalog"/)
  assert.match(source, /id={`component-\${item\.slug}`}/)
  assert.match(source, /<PreviewRenderer entry={item}/)
  assert.match(source, /<article[^>]+site-catalog-card/)
  assert.doesNotMatch(source, /<SiteLink className="site-catalog-card"/)
  assert.match(source, /of \{catalog\.length\} components/)
})
```

- [ ] **Step 2: Run the check and confirm RED**

Run `npm run site:meta && npm run site:build && npm run check:site`.

Expected: `FAIL catalog index renders every component in a responsive app shell`
because the existing index uses linked text cards and no catalog sidebar.

### Task 2: Render the sidebar navigation and all live previews

**Files:**
- Modify: `examples/src/pages/ComponentsPage.tsx`
- Test: `scripts/check-site.mjs`

- [ ] **Step 1: Add the existing May UI shell components**

Import `Sheet` from the adaptive entry and `Sidebar`, `SidebarItem`, and
`SidebarSection` from the desktop entry. Add local `mobileCatalogNav` state.

- [ ] **Step 2: Derive grouped catalog data**

Keep the existing `filtered` array, then derive family/category groups from it:

```ts
const grouped = families.slice(1).map((familyName) => ({
  family: familyName,
  categories: categories.map((categoryName) => ({
    category: categoryName,
    items: filtered.filter((item) => item.family === familyName && item.category === categoryName),
  })).filter((group) => group.items.length),
})).filter((group) => group.categories.length)
```

- [ ] **Step 3: Add one reusable navigation tree**

Inside `ComponentsPage`, define navigation content that uses the current search,
family, category, and capability state. Each family is a `SidebarSection`; each
category uses a `SidebarItem` to apply its filter; each component uses a native
fragment `SidebarItem` with `href={`#component-${item.slug}`}` and closes the
mobile sheet.

- [ ] **Step 4: Replace the index cards with live preview articles**

Render a `site-catalog-shell` with the desktop `Sidebar`, a mobile toolbar and
`Sheet`, and grouped main content. Each result card must use this shape:

```tsx
<article className="site-catalog-card" id={`component-${item.slug}`} key={item.slug}>
  <div className="site-catalog-card__meta">
    <Tag size="sm">{item.family}</Tag><span>{item.category}</span>
  </div>
  <div className={`site-catalog-card__preview site-preview-family-${item.family}`}>
    <PreviewRenderer entry={item} />
  </div>
  <h3>{item.name}</h3>
  <p>{item.description}</p>
  <SiteLink className="site-catalog-card__arrow" href={`/components/${item.slug}`}>
    Open workbench →
  </SiteLink>
</article>
```

Show `{filtered.length} of {catalog.length} components` near the heading. When
there are no matches, render `EmptyState` with one button that resets all four
filters.

- [ ] **Step 5: Run typecheck and the site contract**

Run `npm run site:meta && npm run site:typecheck && npm run site:build && npm run check:site`.

Expected: all site checks pass.

### Task 3: Style the catalog app shell and preview grid

**Files:**
- Modify: `examples/src/site.css`
- Test: production site build and browser acceptance

- [ ] **Step 1: Add the desktop catalog shell**

Create a two-column `.site-catalog-shell` whose `.site-catalog-sidebar` is
sticky below the global header. Give the sidebar an explicit height and make the
main catalog pane the only flexible column.

- [ ] **Step 2: Make preview cards compact and safe**

Change `.site-catalog-card` from a linked text tile to an `article`; add a
minimum-height preview surface, overflow containment, scroll margin, and
family-specific width handling. Keep `content-visibility: auto` and use a taller
intrinsic size matching the new preview card.

- [ ] **Step 3: Add mobile navigation behavior**

Hide `.site-catalog-sidebar` and show `.site-catalog-mobile-toolbar` below
1100px. Collapse the live preview grid to two columns below 1100px and one below
700px. Reuse the same `.site-catalog-navigation` inside the mobile `Sheet`.

- [ ] **Step 4: Build the production site**

Run `npm run site:build`.

Expected: Vite succeeds and the Components route chunk stays within its 50 KiB
gzip budget.

### Task 4: Verify the complete result

**Files:**
- Verify only

- [ ] **Step 1: Run the repository gate**

Run `npm run verify`.

Expected: build, all 91 smoke renders, provider/token/design/size/coverage
checks, site build, and site checks pass.

- [ ] **Step 2: Build Storybook**

Run `npm run build-storybook`.

Expected: Storybook production build succeeds.

- [ ] **Step 3: Browser-check desktop and mobile**

Serve `examples/dist` through Vite preview. At desktop width verify all 91 cards,
sidebar filtering, fragment navigation, overlay launchers, and workbench links.
At phone width verify the catalog toolbar opens the `Sheet`, filters update the
visible count, and previews remain usable. Inspect the console for errors.

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: only the approved design/plan, catalog page, site CSS, and site check
are modified; no generated output is tracked.
