# Changelog

Notable changes to `@adit_firdaus/may-ui`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- **`Combobox`.** A searchable, optionally multi-select picker: grouped rows,
  two-line rows, `renderOption` to replace a row's insides while keeping its
  semantics, and one hidden input per value so `FormData.getAll` works.
  `Select` stays a real `<select>` — it is the right answer whenever the
  native picker is — but it cannot search, cannot hold several values legibly
  and cannot draw a row, so long lists had no component here at all.
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

- **One button costs 22 kB gzipped instead of 69 kB.** Every component barrel
  made two unannotated top-level calls, and `withMayStyles` mutated its own
  return value, so no bundler could drop any of them and importing `Button`
  pulled in the CSS of all 74 components. The two helpers merged into one
  `mayStyled` and every call is annotated pure.
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
