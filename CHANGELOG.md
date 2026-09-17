# Changelog

Notable changes to `@adit_firdaus/may-ui`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

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
