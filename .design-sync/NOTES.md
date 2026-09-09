# design-sync notes — mayui (May UI)

Repo-specific findings for future syncs. Read this before touching anything.

## Setup facts

- **Shape:** storybook. `.storybook/` is at the repo root; `storybookStatic` is
  `.design-sync/sb-reference`.
- **Entry must be passed explicitly.** This is the package's own source repo, so
  `node_modules/mayui` does not exist — the converter needs `--entry dist/mayui.js`
  (recorded as `cfg.entry`).
- **Build first.** `npm run build` (typecheck + vite lib build) must run before the
  converter; it produces `dist/mayui.js` and `dist/mayui.css`.
- **Machine setup (will NOT survive a fresh clone or a new machine):** node was installed
  by hand at `~/.local/node` — there is no system node, so every command needs
  `export PATH="$HOME/.local/bin:$PATH"`. Chromium also needed
  `npx playwright install-deps chromium` (it was missing `libnspr4.so`) before any render
  check or compare would launch. Expect to repeat both.

## Config decisions

- `titleMap: {"Designtokens": null}` — the `Foundation/Design tokens` story is a
  documentation page (colour swatches, spacing ramp, type scale), not a component.
  Excluded deliberately; without this the build prints `[TITLE_UNMAPPED]`.
- `overrides.Pagination.cardMode: "column"` — the `ManyPages` story (50 pages) renders
  wider than a grid cell; validate flagged `[GRID_OVERFLOW] wide`.
- `overrides.Tooltip.cardMode: "column"` — the `Placements` story lays four triggers out
  horizontally inside 60px padding; same `wide` flag.
- `readmeHeader: ".design-sync/conventions.md"` — the authored conventions header. Every
  token, export and prop named in it was grepped against `_ds_bundle.css` / `_ds_bundle.js`
  / the generated `.d.ts` files before shipping. Keep it true; do not rewrite it wholesale.

## Findings

### `[GENERAL]` Contact sheets invent deltas — always open the raw pair

Three separate fan-out agents independently hit this. The compare sheet downscales hard
enough to fabricate differences that do not exist:

- an unchecked `Checkbox` square read as a **circle**
- `RadioGroup`'s "One payment of $480." read as **"$980."**
- `Progress`/`With Value` read as **"64% vs 84%"**

All three were pixel-identical in `_screenshots/compare/raw/*__sb.png` vs `*__ds.png`. The
storybook column is scaled harder than the preview column, so small glyphs and small
geometry alias differently. **Never grade a small-text or small-shape delta off the sheet** —
open the raw pair first, or you will chase a fix for a resampling artifact.

### `[GENERAL]` No `cfg.provider` needed

`.storybook/preview.tsx` decorators bundle automatically into `preview-decorators.js` and
supply the `<MayProvider theme={...} inline>` wrapper — which is what carries the tokens —
to compiled previews exactly as they do to stories. Confirmed across all four batches
(34 components / 108 stories, zero preview edits). Do not set `cfg.provider` for this repo.

### `[GENERAL]` No remote-asset or webfont exposure

Every icon is an inline SVG, `Avatar` falls back to rendered initials, and typography uses
the system stack (`--may-font-sans` / `--may-font-mono`). `[ASSETS_BLOCKED]` has nothing to
trip on and `[FONT_MISSING]` is not a risk here — both panels render the same real faces.

### `[GENERAL]` Framing differs by design — ignore it

The storybook raw shot is cropped to the story bounds; the preview shot is the full capture
page. So the preview band is wider and content sits at a different x-offset on every sheet.
This is the framing difference the §4 rubric tells you to ignore — it is not a padding or
width bug and needs no per-component fix.

### `[GENERAL]` Story-local helpers compile in correctly

Helpers defined inside story files (the `Item` component in the layout stories, the inline
SVG icon consts in `IconButton`/`Tooltip`/`Button` stories) come through the story-module
compile intact. A missing helper elsewhere would therefore be a genuine bug, not expected
behaviour.

### `[GENERAL]` IconButton depended on a sibling's CSS — fixed at source

`IconButton.tsx` applies `may-button`, `may-button--${variant}` and
`may-button--tone-${tone}`, but those rules live only in `Button.css`; `IconButton.css` has
none of them. Its only reference to Button was `import type { ButtonVariant }`, which is
erased at compile. The shipped bundle was always correct (`vite.config.ts` sets
`cssCodeSplit: false`, so `dist/mayui.css` concatenates everything), but **Storybook
code-splits** — `assets/Button-*.css` vs `assets/IconButton-*.css` — and the IconButton
story never loaded Button's chunk, so the *reference* rendered native unstyled buttons
while the preview rendered correctly.

Graded `match` under the §4 rule "when the REFERENCE side is the artifact", then fixed
properly at source: `IconButton.tsx` now carries a value import of `../Button/Button.css`.
The `dist/mayui.css` byte size did not change (Vite dedupes).

**Pattern to watch:** any component whose CSS comes from a sibling reached only through a
type-only import will under-render on the Storybook side while the shipped bundle stays
correct. If a future component's reference looks unstyled, check its CSS imports before
assuming the preview is wrong.

## Re-sync risks

Things that can silently go stale or mislead the next run:

- **`Modal` and `Drawer` open state is never visually compared.** Both components' stories
  are click-driven, so both panels legitimately render only the trigger buttons, and their
  product cards show triggers too. They were graded `match` on that explicit basis — the
  dialog/panel rendering itself is verified only by the validator's render check, not by the
  compare oracle. If either component's open-state styling regresses, this sync would not
  catch it. Adding an `open`-by-default story upstream would close the gap.
- **`Foundation/Design tokens` is excluded** via `titleMap: {"Designtokens": null}`. If that
  story is ever replaced by a real component, remove the exclusion.
- **Generated `Button.d.ts` declares `style?: CSSProperties` unqualified** (not
  `React.CSSProperties`). The validator's `.d.ts` parse passes and it did not block the sync,
  but the design agent reads these files as prop contracts. Worth watching if the agent
  starts mis-typing `style`.
- **Sibling-trusted grades.** Batch B (Box, Stack, Grid, Divider, Card, Heading) graded its
  primary story from images and marked the remaining stories `sibling-trusted` under the §4
  sampling rule. Those siblings were captured but not individually eyeballed. Everything
  else in the sync was exhaustively image-judged.
- **The reference must be rebuilt whenever DS source changes.** `.design-sync/sb-reference`
  and `dist/` move together; a stale reference makes every grade a comparison against the
  old design. `[REFERENCE_STALE?]` in the capture log means you forgot.
- **No owned previews exist.** `.design-sync/previews/` is empty by design — every generated
  preview was correct. If a future run adds one, remember nothing ever machine-deletes it:
  an owned preview landed for a global cause will permanently shadow the corrected generated
  twin.
