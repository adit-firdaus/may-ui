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

- **Overlay open states are unverified by the compare oracle** (see the harness gap
  above). This is the single biggest coverage gap in this sync. If an overlay's styling
  regresses, the sheets will still read `match`.
- **101 of 332 story verdicts are `sibling-trusted`** — the component's primary story was
  image-judged and its siblings inherited that verdict under the §4 sampling rule. They
  were captured but not individually eyeballed.
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
