# Contributing to May UI

Thanks for helping. This is the human guide; coding agents should read
[`AGENTS.md`](AGENTS.md), which carries the same rules in a form tools parse.

## Setup

```bash
npm install
npm run storybook    # the component workshop, on :6006
npm run examples     # the example-screen gallery
```

## The gate

Before you open a PR, run:

```bash
npm run verify
```

It typechecks, smoke-renders every component, and **enforces the design
contract** rather than trusting it:

- no `backdrop-filter` anywhere — surfaces separate by value, not translucency
- no visible strokes on controls — fills replace borders
- every `:hover` behind a `(hover: hover)` query — no sticky hover on touch
- chrome unselectable, body copy selectable
- dark re-resolves the full semantic alias set
- hairlines at true device pixels; the tint/primary split intact; springs that
  are real `linear()` samples

It also holds per-entry bundle budgets and fails if an exported component appears
in no example. A regression fails the build. There are **no unit tests** — the
verify chain plus a look in Storybook is how you show a change works.

## Generated files

`src/styles/tokens.css`, `src/styles/tokens.generated.ts`, and
`src/styles/motion.css` are **build output**. Never
edit them by hand — change `scripts/gen-tokens.mjs` / `scripts/gen-springs.mjs`
and run `npm run generate`.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`,
   `index.ts` (or `src/desktop/` / `src/mobile/` for a dedicated family).
2. In `index.ts`, import the CSS with `?inline`, create a `mayStyleSheet`, and
   export the implementation through `withMayStyles`.
3. Class names are `may-<component>` with `__element` and `--modifier` (BEM).
4. Style from tokens only — no literal colours, spacings, radii or shadows.
5. Draw glyphs with `react-icons/io5`, sized in CSS against
   `.may-<component>__icon > svg` — never with a `:not([width])` guard, which
   react-icons defeats.
6. Re-export from the matching entry, and use it in at least one example screen
   or `check:coverage` will fail.

The tone pattern is worth copying: tone modifiers **set** CSS variables and
variant modifiers **consume** them, so a new tone never touches variant CSS and
vice versa. See `Button.css`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), and **no AI
attribution** — no `Co-Authored-By`, no "Generated with" line, and don't change
the git author.

`type(scope): description`, then a body of three labelled bullets:

```
fix(alert): stop the stack snapping when one is dismissed

- Problem: dismissing the top alert removed its height in one frame, so
  the alerts below jumped up before the exit had finished.
- Solution: animate the wrapper's height with the exit, and compensate the
  flex gap with a negative margin so the row collapses smoothly.
- Side effect: none — the change is contained to Alert.css and Alert.tsx.
```

Wrap the body at ~72 columns. Write "Side effect: none" and say why rather than
dropping the bullet.

## Docs

Prose docs live in [`docs/`](docs/). The on-site render is built by
`npm run docs:build` (into `docs-site/`) and deployed to the Pages site by CI —
you don't need to build it locally to change a guide.
