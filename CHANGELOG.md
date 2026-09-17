# Changelog

Notable changes to `@adit_firdaus/may-ui`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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

### Changed

- Overlay mechanics moved to `src/overlay`: `useOverlay`, `useDismissLayer` and
  `useExitDelay`. `useExitDelay` is re-exported from `Popover` for compatibility.
- `Sheet` now focuses its panel on open rather than its first focusable, matching
  `Modal` — a first focusable is very often a destructive action, and a stray
  Return must not land on it.

### Added

- `check:generated` fails the build when the committed `tokens.css`,
  `motion.css` or `tokens.generated.ts` disagree with their generators. Not
  hand-editing them was already a documented hard rule; nothing enforced it.
- `check:docs` fails when the docs name an `npm run` script that does not exist.
- `check:contract` now rejects a `keydown` listener registered outside
  `src/overlay`, so the layering bug above cannot come back.

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
