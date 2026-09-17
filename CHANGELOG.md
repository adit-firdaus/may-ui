# Changelog

Notable changes to `@adit_firdaus/may-ui`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- **`--may-color-on-warning`, `--may-color-on-success`, `--may-on-bright`** —
  the foreground for a bright fill, named once instead of chosen by hand in
  five component sheets.

- **`FieldContextValue.labelId`** — the id of the Field's `<label>`, for a
  control that cannot be the target of `htmlFor`. `<label for>` only names
  labelable elements, so a `role="group"` or `role="radiogroup"` needs
  `aria-labelledby` instead.

- **`--may-knob`**, the white of a physical knob. `Slider`'s and `Switch`'s
  knobs read `--may-on-color` only because it happened to be white — their own
  comments say they want white, "the way the iOS knob stays white on a dark
  track". Now that dark's contrast tier darkens `--may-on-color` for text on a
  bright fill, the two jobs need separate names, or Increase Contrast would
  turn both knobs near-black.

- **`@media (prefers-contrast: more)` support.** Apple's own palette sits below
  WCAG AA in several of Apple's own pairings, so the default keeps Apple's
  values and the platform's Increase Contrast setting swaps in AA-safe
  primitives. Audited with axe-core against all three catalogues: 58 library
  contrast violations in the default palette, **zero** under the contrast tier,
  and zero violations of every other WCAG 2.1 A/AA rule in all three families.
  The exact values are documented in the README and reachable through
  `theme={{ light, dark }}` if you need AA by default.
- **Eight components now forward arbitrary props.** `Popover`, `Menu`,
  `Tooltip`, `ActionSheet`, `CommandPalette`, mobile `Popup`, mobile `Selector`
  and `MayProvider` had closed prop types, so `data-testid`, `id` and extra
  `aria-*` were all refused — while Modal's own comment described that set as
  "the things every other component already allows". Each extends
  `HTMLAttributes` now, omitting only the props it genuinely redefines: `role`
  on Popover, `title` on ActionSheet and Popup, `children` on Tooltip,
  `onSelect` on CommandPalette, `onChange` and `defaultValue` on Selector.
  `dir="rtl"` on `MayProvider` is now the natural place to put it, since the
  provider owns the element every component inherits from.
- **`Menu` rows take any node.** `label` was the one item descriptor in the
  package still forced to a string, because type-ahead needs text to compare.
  It is `ReactNode` now, with `textValue` carrying the text for type-ahead and
  the row key — needed only when the label is not already a string. Selector,
  Steps, Breadcrumb, TabBar and CapsuleTabs already allowed nodes, so no
  `renderItem` prop was added to any of them.
- **`Combobox`.** A searchable, optionally multi-select picker: grouped rows,
  two-line rows, `renderOption` to replace a row's insides while keeping its
  semantics, and one hidden input per value so `FormData.getAll` works.
  `Select` stays a real `<select>` — it is the right answer whenever the
  native picker is — but it cannot search, cannot hold several values legibly
  and cannot draw a row, so long lists had no component here at all.
- **Mobile `Popup` owns its state too.** It was the last controlled-only
  surface in the package: `visible` was required. It takes `defaultVisible`,
  `onVisibleChange` and `trigger` now, all passed straight through to `Sheet`
  rather than copied — Popup is a prop-shape adapter, and a second
  controlled/uncontrolled branch is how the two would end up disagreeing about
  what `visible` means.
- **Overlays own their open state.** `Modal`, `Sheet`, `AlertDialog`,
  `ActionSheet` and `CommandPalette` take `trigger`, `defaultOpen` and
  `onOpenChange`, so showing a dialog no longer costs a `useState` and two
  handlers. Passing `open` still takes over completely, so every existing call
  site is unchanged. `AlertDialog` closes itself once `onConfirm` has run.
- **`name` on `Slider` and `Stepper`.** Both are correctly ARIA-roled — a
  `<button role="slider">` and two buttons in a `role="group"` — and neither
  had a form value, so `name` landed on the wrapping div and a native submit
  sent nothing. Both now render a hidden input, and a smoke assertion fails the
  build if any named control stops reaching `FormData`.
- **`asChild` on the interactive surfaces.** `Card`, `ListRow`, `Tag` and
  `Avatar` join `Button`, `IconButton`, `Fab` and `NavTree`, so a card or a
  settings row can be a real router link rather than a div with a click
  handler — which keeps middle-click, cmd-click and "copy link address"
  working.
- `check:generated` fails the build when the committed `tokens.css`,
  `motion.css` or `tokens.generated.ts` disagree with their generators. Not
  hand-editing them was already a documented hard rule; nothing enforced it.
- `check:docs` fails when the docs name an `npm run` script that does not exist.
- `check:contract` rejects a `keydown` listener registered outside
  `src/overlay`, so the layering bug below cannot come back.

### Changed

- **One button costs 6.8 kB gzipped instead of 69 kB**, foundation tokens,
  springs and base CSS included. Two causes, both measured against a packed
  tarball in a clean project. Every component barrel made two unannotated
  top-level calls and `withMayStyles` mutated its own return value, so no
  bundler could drop any of them; the two helpers merged into one `mayStyled`
  and every call is annotated pure, which took it to 22 kB. Rollup had then
  already grouped `Button` into one chunk with every form control and the toast
  host, so the build preserves modules instead, which took it to 6.8 kB. The
  whole-library figure barely moved, which is the control: a sharp drop there
  would mean exports being shaken away.
- `Selector` reports selection through `onValueChange`, matching the twelve
  other value components. `onChange` still works and is deprecated: it was the
  odd one out, and it was also why `onChange` had to be omitted from the
  HTMLAttributes it now extends — the collision was the symptom of the drift.
- `MayAlign` names the `'start' | 'center' | 'end'` trio that `Table`,
  `DataTable` and `Toolbar` spelled inline while `TextAlign` already named it.
  `TextAlign` stays exported as an alias, so nothing consumers import changes.
- `MayInset` names the `'inset' | 'plain'` pair that `List`, `Accordion` and
  `Descriptions` each spelled out inline. Same values, so no consumer's type
  narrows; `variant` stays per-component everywhere else, because it answers
  "which of this component's looks" and that genuinely differs.
- `size` is one vocabulary. Seventeen components share `Exclude<MaySize, 'xs'>`;
  `Avatar` extends it with `'xl'` and `Modal`/`Sheet` with `'full'`. No runtime
  values changed.
- `SplitPane`'s pixel prop is `paneSize` / `defaultPaneSize` /
  `onPaneSizeChange`, because `size` means a scale step everywhere else.
  `size`, `defaultSize` and `onSizeChange` still work and are deprecated.
- `Text` is generic over `as`, so `<Text as="a" href="…">` typechecks — it
  previously did not.
- Overlay mechanics live in `src/overlay`: `useOverlay`, `useDismissLayer`,
  `useOpenState`, `overlayTrigger` and `useExitDelay`. `useExitDelay` is
  re-exported from `Popover` for compatibility.
- `Sheet` focuses its panel on open rather than its first focusable, matching
  `Modal` — a first focusable is very often a destructive action, and a stray
  Return must not land on it.

### Fixed

- **`prefers-reduced-motion` is honoured without a provider.** The guard was
  written `.may-root *`, and only `MayProvider` renders `.may-root` — but a
  provider is optional, and the getting-started page opens by showing
  components used without one. In exactly that arrangement the selector could
  not match: a bare `Button` has no `.may-root` ancestor, so every animation
  and transition ran at full duration under `prefers-reduced-motion: reduce`,
  while the README said everything collapses. Only `.may-pressable` was
  honoured, and only because it carried no prefix. The guard matches on the
  class now, with a word-boundary test so a consumer's own `maybe-thing` is
  not caught by it.

- **`placement="…-start"` and `"…-end"` follow the inline axis.** `types.ts`
  defines that vocabulary as logical — "start and end rather than left and
  right, so a mirrored layout needs no second set of values" — but
  `placeFloating` resolved them to physical left and right. Measured under
  `dir="rtl"`: a `bottom-start` `Popover` aligned its **left** edge with the
  anchor's left, where inline-start is the right one. `Tooltip` and `Combobox`
  place through the same function and were wrong the same way. The *side*
  names stay physical on purpose — `left` means left in any direction — so only
  the cross-axis alignment mirrors, and only when that axis is horizontal.
  Direction is read from the anchor element, so a subtree with its own `dir`
  is right too.

- **`SplitPane` resizes the right way in RTL.** The sized pane is the first
  child, which `dir="rtl"` puts on the right — but the divider added a raw
  pointer delta and read physical arrow keys, so it moved *away* from the
  pointer. Measured: dragging 77px left shrank the pane from 240 to 163
  instead of growing it to 317, and `ArrowLeft` shrank what it should grow.
  The drag, the flick projection and the arrows all read the inline axis now;
  LTR is unchanged.

- **`Slider` works in RTL.** Its fill is width plus `inset-inline-start`, so
  that mirrored on its own — but two things did not follow it. The knob pairs
  the same logical anchor with a *physical* `translate`, so under `dir="rtl"`
  it was pushed off the end: measured at value 30, the knob sat at 127% of the
  track, outside it entirely. And the pointer-to-value mapping read
  left-to-right, so a click at the visually-high left end returned 9 out of 100
  and threw the knob to the far side. Both mirror now — measured in RTL, a
  click near the left edge gives 91 and the knob lands 0.90 of the way in from
  the right; LTR is unchanged at 9 and 0.10 from the left.

- **The sliding thumb now mirrors for RTL.** It is laid out at 1px, anchored
  with `inset-inline-start` and scaled to the width of the item beneath it —
  and under `dir="rtl"` that anchor is the right edge, so both the scale origin
  and the sign of the translate have to flip. Scaling a 1px box about the wrong
  edge moves it by its whole width, not by a pixel: measured on a document with
  `dir="rtl"`, a `CapsuleTabs` thumb sat a full chip clear of the chip it
  belonged to and a `Pagination` thumb 331px away. `Selector`, `Steps` and
  mobile `TabBar` share the same hook and were affected too; `SegmentedControl`
  was not, because Motion's layout projection already handles direction. Fixed
  in the hook rather than in five sheets, and verified in both directions on a
  real document: every thumb now lands exactly on its item.

- **A second toast host now warns instead of doubling every toast.** The queue
  is module-level and each mounted host renders all of it, so a `MayProvider`
  on each of two React roots made one `toast()` call produce two identical
  toasts — measured in a browser, one per root. `host={false}` on the secondary
  root is the documented answer, but forgetting it was silent, and a duplicate
  toast reads as a bug in your own code. The zero-host case already warned;
  this is its mirror. Deferred and re-checked, so a remount — StrictMode, a hot
  reload — passing through two hosts does not warn.

- **A theme token value can no longer carry a second CSS declaration.**
  Overrides land as inline custom properties on the root, which keeps a
  consumer's value out of stylesheet text — but an inline style is still a
  declaration list, so a `;` in a value split it. Measured in a browser:
  `blue: 'red; background: rgb(1,2,3); --may-label: rgb(4,5,6)'` parsed as
  **eleven** declarations, painting a background and overriding the label token
  for the whole subtree. No script can run that way, but a theme is the sort of
  thing an app reads from a CMS, a URL or a saved preference — and this
  package's own examples site drives provider config from the URL. Values
  containing `;`, `{` or `}` are dropped with a development warning; `calc()`
  and `rgba()` are unaffected.

- **A bright fill's foreground no longer follows the theme.** `NoticeBar`,
  `Button`, `Badge`, `Fab` and mobile `SwipeAction` each set a warning fill's
  text to `--may-label` — which is near-black in light and **white in dark**, so
  the rule put white on orange at 2.06:1 while its own comment said the label
  wins because white fails. Under the light contrast tier, where the AA orange
  goes dark, near-black on it measured 3.09:1. All five read the new
  `--may-color-on-warning` / `--may-color-on-success` now, and the warning one
  resolves through `--may-on-bright`, which is theme-independent and inverts
  only under the tier.
- **The AA green was too light to be read on its own wash.** It was chosen for
  white-on-fill (5.33:1), but the same token is the text colour on a 14% wash
  of itself — a success `Tag`, a success cell, a plain success `Button` — where
  it measured 4.39:1 on white and 3.74:1 over a selected row. Blue, red and
  orange clear every such case; green was the only outlier. Now `#076023`,
  worst case 5.29:1.
- **Accessibility is now audited on composed screens, not only catalogues.** 25
  example screens plus all three catalogues in light and dark — 31 surfaces,
  zero violations under the contrast tier. Composition is where structure
  breaks, and across all 25 screens no `heading-order`, `landmark-*`,
  `duplicate-id`, `region` or form-label rule fired.

- **A `<Field>` now reaches every control inside it.** The promise was that
  passing `error` to the Field marks the control invalid; measured, it held for
  five of ten. `Slider` and `Stepper` never called `useFieldControl`, so their
  Field emitted a `<label for>` naming an id that existed nowhere in the markup
  and set neither `aria-invalid` nor `aria-describedby` — the label and error
  were drawn on screen and invisible to a screen reader. `Stepper` and
  `RadioGroup` are divs, which `for` cannot bind to at any id, so they adopt
  the label with `aria-labelledby` via the new `labelId` on the Field context;
  `RadioGroup`'s comment previously told you to repeat the label as an
  `aria-label` instead. `Combobox` passed its own generated id to
  `useFieldControl`, so `own.id ?? field.id` could never reach the Field's.
  `Switch` alone never set `aria-invalid`. All ten are named, marked and
  described now, and a bare control still generates its own id.

- **`Sidebar` and mobile `NavBar` now honour `linkComponent`.** Both rendered a
  literal `<a>` for their `href`, ignoring the provider's link element that
  `Breadcrumb` and `TabBar` already used — so in a TanStack Router / React
  Router / Next app a sidebar click was a full page reload while a breadcrumb
  in the same app routed client-side. Measured before the fix: two of the four
  navigational surfaces routed, two did not. All four do now, and all four
  still render a plain `<a>` when nobody opts in.

- **Next.js App Router now works at all.** No entry carried a `'use client'`
  directive, so a server component — the App Router default — could not build
  against this package. Reproduced with Next.js 15.1: `import { Button } from
  '@adit_firdaus/may-ui'` in `app/page.tsx` fails the build with
  `TypeError: (0 , n.createContext) is not a function`, because
  `src/config/context.tsx` calls `createContext` at module scope and React's
  server build does not export it. `node --conditions=react-server` reproduces
  it without Next at all. The four entries now open with the directive, and the
  same app builds and prerenders — its static HTML carries `.may-root`, the
  button's classes and its CSS. Gated in `check:provider`, for all eight entry
  files across both formats.

- **Dark mode passes the contrast tier too.** The `prefers-contrast: more`
  audit had only ever been run in light. Run in dark it reported violations in
  all three catalogues, and they shared one pairing: white on `#5EA9FF` at
  2.44:1. Dark's AA blues go *lighter*, which is right for brand-as-text on a
  dark surface and wrong for the same value used as a fill, because
  `--may-color-tint` and `--may-color-primary` both read `--may-blue`. Against
  the four AA primitives white runs 1.71-2.82:1 while `#1C1C1E` runs
  6.03-9.93:1 — and white already failed on the dark *defaults* (2.02:1 on
  systemGreen), so the tier worsened a shortfall it did not create. Dark's tier
  now flips `--may-on-color` with the rest. Both modes, all three families,
  zero violations.

- **Every target you press is at least 24x24.** Measured across 382 stories and
  885 rendered targets, with transitions and transforms disabled so a mid-flight
  scale could not be mistaken for a size. Eight were under the WCAG 2.5.8
  minimum: `DataTable`'s column sorter (18px tall — the header cell owns the
  padding, so only the label was clickable), `Table`'s row activator (20px),
  `Tag`'s remove button (19px and 22px on the two smaller tags), `NoticeBar`'s
  close (22px), `Combobox`'s clear (13x13, sized by its glyph alone),
  `SearchField`'s cancel (22px tall), and the clear button in `SearchField` and
  mobile `SearchBar` — which claimed in a comment to be "full-height for the
  vertical reach" and measured 32x18, because `height: 100%` inside a centred
  flex row collapses to the glyph. That one now fills the pill properly, 36 to
  52px. `SplitPane`'s divider stays a hairline on purpose: a pseudo-element
  already extends its hit area 8px each side and it has no neighbour to crowd.

### Added

- **`--may-target-min`** (24px), the floor for anything you press. Reach for
  `--may-control-h` first — 44px is Apple's number and the right one for a
  standalone control. This is for the parts that are a fraction of a control:
  a tag's remove button, a table's column sorter.

- **Text fields have a real focus indicator.** `Input`, `Textarea`, `Combobox`,
  `SearchField` and mobile `SearchBar` drew a 28-30% halo, and `Input`
  suppressed it entirely under `(pointer: coarse)`. Measured with transitions
  disabled, that left 1.46:1 where a pointer is fine and, where it is not,
  only a 1.05:1 background shift that moves the field *closer* to the page —
  no cue at all. The suppression assumed keyboard implies `pointer: fine`; an
  iPad with a Magic Keyboard is coarse. `:has(:focus-visible)` cannot keep the
  split, because a text input matches `:focus-visible` on a mouse click too,
  so the ring is now solid on every pointer. The error ring is solid as well
  (3.18:1 at worst), and a field that is both invalid and focused draws both
  rings concentrically rather than trading one for the other.

- **The focus ring is now legible.** It was the tint at 45% opacity, in
  `base.css` and hand-rolled again in Checkbox, Radio, Select and Switch —
  five copies of the same wash. Composited over the surfaces it sits on (the
  outline is offset, so that is the page behind, not the control's fill) it
  measured 1.85:1 on white and 1.78:1 on the grouped background, against the
  3:1 asked of a focus indicator. Alpha could not fix it — 0.8 still reads
  2.83:1 on grouped — so the ring is solid now, which measures 4.02:1 white
  and 3.60:1 grouped in light, 4.66:1 and 5.76:1 in dark. axe cannot find
  this, since it does not evaluate focus-state styles.

- **Keyboard focus no longer squares off every rounded control.** The global
  focus rule carried `border-radius: inherit`, intended for the ring. It
  applies to the focused element, and at `.may-root :focus-visible` it
  outranked each component's own radius — so tabbing to a pill `Button` inside
  a square container set the button's radius to that container's `0`. Measured
  in a browser: `9999px` before focus, `0px` under a real Tab press. Only
  keyboard users ever saw it. The declaration is gone; `outline` already
  follows the element's own radius, so the ring still hugs the capsule.
- **`SegmentedControl` accepts DOM attributes.** Its props interface extended
  nothing, so the `...rest` it spreads onto its root was typed `{}` and `id`,
  `aria-describedby` and `data-testid` were type errors. It extends
  `HTMLAttributes<HTMLDivElement>` now, minus the four props Motion redefines
  on that element.

- **`useMayTokens()` returned the legacy curve for every spring and ease.**
  `motion.css` declares each spring twice — the real `linear()` samples in
  `:root`, and a `cubic-bezier` stand-in inside
  `@supports not (animation-timing-function: linear(0, 1))` for browsers that
  cannot parse them. The token generator parsed the file flat, so the fallback
  won on position alone, and all eight curves in `mayLightTokens` and
  `mayDarkTokens` were the stand-in. Components always animated on the real
  samples; only the values a consumer read back were wrong, which is why
  nothing looked broken.

- **Four directional chevrons pointed the wrong way in RTL.** The library
  already supported RTL in six components, but `ListRow`, `Collapsible`,
  `Sidebar` sections, `ContextMenu` submenus, `NavTree` branches and
  `Pagination` arrows mirrored their *layout* through logical properties and
  then pointed against the reading direction inside it. The disclosure
  chevrons mirror by rotation rather than `scaleX`, because a four-class-deep
  open rule outranks a two-class RTL one and left the open state pointing up.
- **`DataTable`'s column resize grip had no value.** It is a focusable
  `role="separator"` — the ARIA window-splitter — which requires
  `aria-valuenow`, so a screen reader announced a splitter with no position.
  `SplitPane`'s divider always reported one; this did not.
- **A dot-only `Badge` dropped its label.** `aria-label` is prohibited on a
  generic element, so the name written for screen readers was the one thing
  they ignored. It now takes `role="img"` when it is a labelled dot.
- **A `Sidebar` badge on the active row was unreadable at 3.79:1** — a
  translucent tint over an already-tinted row against tint-coloured text. It is
  a filled pill now, which is the idiom on both Apple platforms anyway.

- **Escape no longer closes two overlays at once.** `Sheet` and `Popover` each
  registered a capture-phase `keydown` on `document`. Two listeners on the same
  node fire in registration order, and `stopPropagation` does not suppress a
  sibling on that node — so a `Sheet`, having opened first, always heard the key
  first, and a `Popover` or `Menu` opened inside one took the sheet down with it.
  Dismissal now goes through a shared layer stack that asks which layer is on
  top rather than inferring it from listener order.
- **`CommandPalette` now contains focus.** It declared `aria-modal="true"` while
  Tab walked straight out of the dialog into the page behind the scrim.
- **`Sheet` and `ActionSheet` no longer shift the page sideways.** Both locked
  body scroll without handing back the scrollbar's width as padding, which
  `Modal`, `AlertDialog` and `CommandPalette` already did.
- **`Sheet` and `ActionSheet` no longer snap mid-dismiss.** Both released the
  scroll lock and returned focus when `open` flipped — at the *start* of the exit
  animation — so the viewport narrowed under a panel that was still on screen.
- **Screen readers can no longer read through a modal.** Open modal surfaces now
  mark the rest of the document `inert`, which removes it from the accessibility
  tree as well as from focus order. A Tab cycle only ever contained the Tab key.

## [0.2.0] — 2026-09-10

### Changed — breaking

Styling and configuration moved into React. The package no longer ships a
stylesheet asset; component CSS arrives as React 19 style resources, wrapped in
an `@layer may-ui` cascade layer.

| Before | Now |
|---|---|
| `import '@adit_firdaus/may-ui/styles.css'` | Remove it |
| `theme="dark"` | `theme={{ mode: 'dark' }}` |
| `accent="purple"` | `theme={{ tokens: { colorTint: 'purple', colorPrimary: 'purple' } }}` |
| `useMayTheme().setTheme(...)` | Store mode in application state |
| `<MayHost />` | Remove it; configure `MayProvider.host` |

Because the CSS ships inside a cascade layer, unlayered application styles —
including Tailwind utilities — now win over component styles without needing
specificity hacks. See [docs/theming.md](docs/theming.md) and
[docs/getting-started.md](docs/getting-started.md).

[0.2.0]: https://github.com/adit-firdaus/may-ui/releases/tag/v0.2.0
