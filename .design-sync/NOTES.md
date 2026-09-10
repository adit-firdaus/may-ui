# design-sync notes — mayui (May UI)

Repo-specific findings for future syncs. Read this before touching anything.

## What this design system is

May UI was **completely rebuilt** on Apple's design language (commit `5a3b46d`). The
previous generic violet system is in git history at `f6013b7` and bears no relation to
what is here now — do not use it as a reference for anything.

74 components in three families, one shared token layer:

| Entry | Count | What lives there |
|---|---|---|
| `mayui` | 59 | Adaptive components; they reshape at the breakpoint |
| `mayui/desktop` | 6 | Shapes with no honest phone form (Sidebar, DataTable, CommandPalette…) |
| `mayui/mobile` | 9 | Shapes with no desktop meaning (TabBar, PullToRefresh, SwipeAction…) |

## Setup facts

- **Shape:** storybook. `.storybook/` is at the repo root; `storybookStatic` is
  `.design-sync/sb-reference`.
- **Entry must be passed explicitly** — this is the package's own source repo, so
  `node_modules/mayui` does not exist. `cfg.entry` is `dist/mayui.js`, and
  `cfg.extraEntries` carries `./dist/desktop.js` and `./dist/mobile.js`, because the
  two dedicated families are **separate build outputs** and would otherwise be missing
  from `window.MayUI` entirely.
- **Build first.** `npm run build` regenerates the token and spring CSS, typechecks, and
  emits all three bundles.
- **Machine setup (will NOT survive a fresh clone):** node was installed by hand at
  `~/.local/node` — there is no system node, so every command needs
  `export PATH="$HOME/.local/bin:$PATH"`. Chromium needed
  `npx playwright install-deps chromium` (missing `libnspr4.so`).

## Config decisions

- `titleMap: {"Overview": null}` — `Foundations/Overview` is the token catalog (colour
  swatches, the type ramp, live motion demos), not a component.
- `overrides` — ten components flagged `[GRID_OVERFLOW]`:
  - `cardMode: "column"` for AlertDialog, Fab, Popover, Stepper, Toolbar, Tooltip, NavBar
    (stories wider than a grid cell).
  - `cardMode: "single"` for CommandPalette, FloatingBubble, TabBar (viewport-fixed
    content that escapes any cell), each with a `primaryStory`.
- `readmeHeader: ".design-sync/conventions.md"` — rewritten for the Apple system. Every
  token, component and prop named in it was validated against the built artifacts before
  shipping.

## Findings

### `[GENERAL]` The reference storybook needs `STORYBOOK_BASE=./`

**Build the reference with `STORYBOOK_BASE=./` or every story fails.**

```bash
STORYBOOK_BASE=./ npx storybook build -c .storybook \
  -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference"
```

`.storybook/main.ts` sets `base: '/may-ui/storybook/'` for any PRODUCTION build,
which is right for the GitHub Pages deploy and fatal for a local reference:
`compare.mjs` serves `sb-reference/` over HTTP with that directory as the server
root, so every asset URL resolved to `/may-ui/storybook/assets/…` → 404, the
story JS never loaded, and all 365 stories came back `sb-error`. The build still
exits 0 and `iframe.html` is still ~17 kB, so nothing upstream of the compare
stage notices.

Fixed at the source rather than by patching the built output: `main.ts` now reads
`process.env.STORYBOOK_BASE` and falls back to the Pages path, so the Pages
workflow is unchanged (it sets no such variable) and the sync passes `./`.

Introduced by the Pages work (`ce962de` / `f16ef47`), which landed *after* the
previous sync — which is why no earlier note warned about it. If a future sync
ever sees a roster-wide `sb-error`, check the asset URLs in
`.design-sync/sb-reference/iframe.html` first: they must be relative (`./assets/…`).

### `[GENERAL]` The compare harness cannot see viewport-fixed overlays

**The most important thing in this file.** `compare.mjs` screenshots the storybook side
with `el.screenshot()` on `#storybook-root`. A story whose entire visible output is a
viewport-fixed overlay leaves that root with only a ~48px in-flow stub, so the reference
shot is a blank grey band. At 314 bytes it clears the `png.length < 200` full-page
fallback guard, so the pair is written, counted as `needs-grade`, and reports
`counts.sb-error = 0` — **it looks gradeable when there is nothing to compare against.**

Confirmed objectively on CommandPalette: three of its four stories have 314-byte
reference shots against 15–32kB preview shots. The fourth escapes only because it renders
an in-flow trigger.

Consequence: the open state of every overlay in this system — Modal, Sheet, ActionSheet,
AlertDialog, Popover, Menu, Popup, Toast, Tooltip, CommandPalette, ContextMenu — is
**not verified by the compare oracle**. Most of those components are also
interaction-gated, so both panels legitimately show only a trigger and grade `match`
without exercising the overlay at all.

A SECOND mechanism reaches the same place, found on the 2026-09-11 sync: a
component whose panel opens on an **interaction** is equally invisible, even
when nothing is viewport-fixed. `ContextMenu` opens on right-click, which the
oracle never performs, so all four of its stories show only the closed trigger
on BOTH sides and grade `match` — that verdict is real but narrow, and is not
evidence that the popup (panel, separators, destructive-item styling) arrived
intact. Read every overlay `match` in this system that way.

A THIRD flavour, and the one most easily misread: a **click-to-open** surface
where BOTH panels are equally untriggered. `MayHost`, `Menu` and `Modal` all
capture with only their trigger row rendered, on both sides, pixel-identical.
That is NOT the blank-reference gap (which shows one side blank against real
content on the other) and needs no override — but it means the verdict covers
the trigger, never the panel.

**Consequence for a change made on 2026-09-11:** `MenuItem.checked` (a tinted
checkmark in the leading slot, with `menuitemcheckbox` semantics) has NO story
that opens the menu, so no story exercises it and this oracle cannot see it. If
that state matters, add a story that renders the menu open — the gap is in the
stories, not in the component.

What *does* cover them: `package-validate.mjs`'s render check (73/73 previews render
cleanly, and that renders the real preview html including open overlays), and
`scripts/smoke.mjs`, which SSR-renders every overlay open and asserts its modal
semantics. Treat those two as the overlay gate, not the sheets.

If overlay fidelity ever needs to be visually verified, the fix is in the harness — fall
back to a full-viewport screenshot when the root box has no painted content, rather than
keying the fallback on PNG byte length — not in any component.

### `[GENERAL]` Contact sheets invent deltas — always open the raw pair

Reproduced on **every** grading run so far, across seven independent agents. The sheets
downscale hard enough to fabricate differences: `$480`→`$980`, `64%`→`84%`,
`$241.59`→`$241.09`, `MacBook Pro 14"`→`MacBook Pro 54"`, `$0.99`→`$0.98`, an unchecked
checkbox reading as a circle. Every one was pixel-identical in
`_screenshots/compare/raw/`. **Never write a mismatch or close verdict from the sheet
alone** when the delta is small text, a digit, small geometry, or an icon's presence.

### `[GENERAL]` Framing differs by construction — not a defect

Storybook shots are cropped tight to the story bounds (e.g. 868×92); preview shots are
always the full 900×700 capture page with a 24px body pad. So the preview band is wider
and content sits at a different x-offset on essentially every pair. On dense components
it also shifts available content width by ~16px, which can move where text wraps. The
rubric classes this as ignorable; it is not a padding bug.

Worked example (2026-09-11): `Grid` → `Auto Fill` wraps "Recently Deleted" onto two
lines in the preview and one in storybook, because auto-fill tracks resolve against
the wider band (868px vs the 900px capture). Do not chase that as a token or CSS
delta.

Second worked example, and the sneakiest form: on `Slider` the framing offset reads
as the THUMB having drifted along its track. It has not — measure the *relative*
fill (thumb position as a fraction of track width), which is identical on both
sides (64.0% on Brightness). Judging a slider, a progress bar or any positioned
indicator by absolute x is judging the framing, not the component.

### `[GENERAL]` NavBar → Long Title has a pre-existing glyph artifact

`NavBar` → `Long Title` renders overlapping glyphs in the title. Verified on the
raw pair (2026-09-11): byte-for-byte identical on BOTH panels, so it is a
renderer quirk in the story itself, not a sync regression. Don't chase it as a
preview defect; if it's worth fixing, it's worth fixing in the story.

### `[GENERAL]` Animated stories capture at an arbitrary phase

Spinner arcs and marquee offsets can differ between panels with no content difference
(seen on Progress → Indeterminate, NoticeBar → Marquee). Judge shape, size and colour,
not animation phase.

### `[GENERAL]` No provider config needed

`.storybook/preview.tsx` decorators bundle automatically and supply the `<MayProvider>`
tokens to previews. Do not set `cfg.provider` for this repo.

### `[GENERAL]` No webfonts, deliberately

The type stack is `-apple-system, system-ui`, so SF Pro on Apple platforms and a system
fallback elsewhere. `--may-font-rounded` uses the `ui-rounded` CSS generic rather than
naming `'SF Pro Rounded'`, which previously tripped `[FONT_MISSING]` by looking like a
webfont reference that never ships. `[ASSETS_BLOCKED]` has nothing to trip on either —
every icon is inline SVG.

## Re-sync risks

*Current as of the 2026-09-11 sync (73 components, 333 stories, all `match`).*

- **The stylesheet now ships inside `@layer may-ui`** (library commit `f6340c4`, shipped
  as 0.2.0). Unlayered CSS beats every layered rule whatever its specificity, which is
  the point for npm consumers — a Tailwind utility should win on a May component — but it
  changes the cascade *inside Claude Design too*: any unlayered CSS the app itself injects
  now outranks May's component rules. **The local render check cannot see this**, because
  it renders previews in a clean page with no competing reset. It is only observable in
  the rendered cards. If components ever look unstyled in the project while
  `package-validate.mjs` is green, this is the first thing to check — and the fix belongs
  in how `styles.css` is emitted for the sync, NOT in the library.
- **Overlay open states are unverified by the compare oracle** (see the harness gap
  above, now documented in all three flavours). Still the single biggest coverage gap.
  If an overlay's styling regresses, the sheets will still read `match`.
- **18 of 333 story verdicts are `sibling-trusted`** — down from 101 of 332 last sync;
  315 stories were individually image-judged this time. The trusted ones were captured
  but not individually eyeballed.
- **`Table` grades only its desktop shape.** It is adaptive and collapses into grouped
  list rows below the breakpoint, but the capture viewport is desktop-width, so the
  mobile reshape is never photographed. Same for every other adaptive component's phone
  form — `Sheet` in particular is graded as a centred dialog, never as a bottom sheet.
- **Apple's label alphas are lower-contrast than ss-ui's tuned values** (0.60/0.30/0.18
  vs 0.75/0.45/0.25). This was a deliberate fidelity-over-contrast choice, taken together
  with Apple's true systemBlue. If secondary text reads faint in use, raising the alphas
  in `scripts/gen-tokens.mjs` is a one-line fix.
- **Two CSS files are generated** — `src/styles/tokens.css` and `src/styles/motion.css`.
  Never hand-edit them; edit `scripts/gen-tokens.mjs` / `scripts/gen-springs.mjs` and run
  `npm run generate`. The spring curves are sampled from real physics at build time.
- **`--may-breakpoint-desktop` is read by both CSS and `useIsDesktop`.** Keep it that
  way; ss-ui's JS (992px) and CSS (1024px) breakpoints disagreed and components took
  different branches between the two.
- **The build gates are the contract.** `npm run verify` runs typecheck, build, an SSR
  smoke over all 90 exports with 22 accessibility assertions, a token audit, the design
  contract (no borders, no blur, gated hover, unselectable chrome), and bundle budgets.
  A design regression fails the build rather than shipping quietly.
