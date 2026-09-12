# AGENTS.md

Instructions for any coding agent working on May UI. This is the canonical file;
`CLAUDE.md` imports it, and it is written to be read by Codex, Cursor, Gemini and
the rest. Humans want [`CONTRIBUTING.md`](CONTRIBUTING.md).

## What this is

May UI is an Apple-native React design system — iOS/macOS shapes, real spring
physics compiled to CSS `linear()`, a `--may-*` token layer, and two focused
runtime dependencies: `react-icons` for glyphs and `motion` for
SegmentedControl layout projection. Components ship in three families:
adaptive (`src/components`), desktop-only (`src/desktop`), mobile-only
(`src/mobile`). The full tour is in [`README.md`](README.md).

## Before you claim anything works

Run the gate and let it pass:

```bash
npm run verify
```

It builds, smoke-renders every component, and enforces the design contract —
no `backdrop-filter`, no visible strokes, every `:hover` behind a pointer query,
dark re-resolving the full alias set, hairlines at true device pixels, springs
that are real samples — plus per-entry bundle budgets and example coverage. A
regression fails the build; it is not a suggestion. See
[README → "The gates"](README.md#the-gates).

**There are no unit tests in this repo.** Verification is `npm run verify` plus
looking at the component in Storybook (`npm run storybook`) — drive it and check
the behaviour with evidence. Do not invent `npm test`; do not assert "it works"
without having run the gate.

## Hard rules

- **Never hand-edit `src/styles/tokens.css` or `src/styles/motion.css`.** They
  are generated. Edit `scripts/gen-tokens.mjs` / `scripts/gen-springs.mjs` and
  run `npm run generate`.
- **Style from tokens only** — no literal colour, spacing, radius, shadow or
  duration. If a value you need has no token, add it to the generator.
- **No borders on controls.** Surfaces separate by value (fill + hairline), not
  by strokes. The contract check will reject a visible `border: … solid …`.
- **Class names are BEM**: `may-<component>__element--modifier`. The component
  barrel imports CSS with `?inline`, creates a `mayStyleSheet`, and exports the
  implementation through `withMayStyles`; `.tsx` files never side-effect-import CSS.
- **Glyphs come from `react-icons/io5`**, sized in CSS against
  `.may-<component>__icon > svg` — never with a `:not([width])` guard, which
  react-icons defeats.
- **Tone sets variables, variant consumes them** — a new tone never touches
  variant CSS and vice versa. Copy the pattern in `Button.css`.

Adding a component: follow [README → "Adding a component"](README.md#adding-a-component).

## Philosophy

Take the smallest change that actually works. Question whether the task needs to
exist at all (YAGNI). Prefer the standard library and native platform features
over new dependencies; prefer editing existing code over adding more. Runtime
dependencies remain exceptional: add one only for a measured user-facing need
after a smaller alternative has been ruled out.

## Commits

Conventional Commits, and **no AI attribution** — no `Co-Authored-By`, no
"Generated with" line, no `aider:`-style prefixes, and never change the git
author or committer.

Format: `type(scope): description`, then a body of **three labelled bullets, not
prose**:

- `Problem:` what was wrong, with the case that shows it.
- `Solution:` what the code now does differently — the rule, not the diff.
- `Side effect:` what else it touches, naming the modules. Write
  "Side effect: none" and say why rather than dropping the bullet.

Wrap the body at ~72 columns. Example:

```
fix(pages): drop vite-plugin-dts from the Storybook build

- Problem: Storybook inherits the root vite.config, whose vite-plugin-dts
  runs its rollupTypes step and writes a temporary api-extractor.json —
  harmless locally but a parse failure in CI, which broke the deploy.
- Solution: filter any dts-named plugin out of Storybook's Vite config in
  viteFinal; a preview needs no type declarations.
- Side effect: Storybook builds ~40% faster; the library's own dts output
  (via npm run build) is untouched.
```

## Where things live

| Path | What |
|---|---|
| `src/components/` | Adaptive components — the default family |
| `src/desktop/` | Shapes with no honest phone form (`Sidebar`, `CommandPalette`, `Table`…) |
| `src/mobile/` | Shapes with no desktop meaning (`TabBar`, `CapsuleTabs`, `Selector`…) |
| `src/motion/` | The runtime motion layer — springs, gestures, `useSlidingThumb`, `sliding-thumb.ts` |
| `src/styles/` | React style-resource runtime, `base.css`, and generated token/motion artifacts |
| `scripts/` | Token/spring generators and the `check:*` gates |
| `examples/` | Unified website, docs, catalog, patterns, and provider playground |
| `.storybook/` | Storybook config (the component workshop) |

## Commands

```bash
npm run dev        # Vite playground
npm run storybook  # component workshop
npm run site       # unified website, catalog, patterns and playground
npm run examples   # alias for npm run site
npm run generate   # regenerate tokens.css + motion.css
npm run build      # library build (four entries) + types
npm run verify     # library gates plus unified site build and catalog checks
```
