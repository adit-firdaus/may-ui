# May UI

Apple's design language as a React library — iOS 26 / macOS shapes, real spring physics,
and a token layer you can theme.

- **75 components** across three families — adaptive, desktop-only, mobile-only
- **No borders** — surfaces separate by value, translucent fill and hairline separators
- **Real springs** — damped-oscillator CSS curves plus Motion layout projection
- **Token-first** — every colour, space, radius, shadow and duration is a `--may-*` property
- **Light and dark** — follows the OS by default, pinnable per subtree
- **Typed** — bundled `.d.ts` per entry, JSDoc on every prop

**[Website & Catalog](https://adit-firdaus.github.io/may-ui/)** · **[Docs](https://adit-firdaus.github.io/may-ui/docs/getting-started)** · **[Storybook](https://adit-firdaus.github.io/may-ui/storybook/)** · **[Contributing](CONTRIBUTING.md)**

## Install

```bash
npm install @adit_firdaus/may-ui
```

`react` and `react-dom` 19 are peer dependencies. The two runtime dependencies
stay external, so your bundler shakes the icons and the Motion features you do
not use — `motion` is imported by `SegmentedControl` alone, and
`check:consumer-size` fails the build if any of it reaches a Button-only bundle. [`react-icons`](https://react-icons.github.io/react-icons/)
supplies Ionicons, while [`motion`](https://motion.dev/docs/react) projects
SegmentedControl's real-sized selection thumb. Both stay external to May UI's
build so your bundler tree-shakes the features it uses.

## Use

Components carry their own React stylesheet resources. Add `MayProvider` when
you need shared configuration or imperative surfaces—there is no CSS import or
separate host to mount:

```tsx
import { MayProvider, Card, CardTitle, Stack, Text, Button } from '@adit_firdaus/may-ui'

export function App() {
  return (
    <MayProvider theme={{ mode: 'system' }}>
      <Stack gap={4}>
        <Card>
          <CardTitle>Production deploy</CardTitle>
          <Text tone="secondary">All 14 health checks passed.</Text>
          <Button>Promote</Button>
        </Card>
      </Stack>
    </MayProvider>
  )
}
```

React 19 hoists and de-duplicates the component resources. Components use
built-in tokens without a provider; the provider adds scoped themes, typed
tokens, component defaults, routing, platform overrides, CSP, and one automatic
imperative host.

## Three entry points

| Import | What lives there |
|---|---|
| `@adit_firdaus/may-ui` | **Adaptive** components. One per concern, reshaping at the breakpoint. Start here. |
| `@adit_firdaus/may-ui/desktop` | Shapes with no honest phone form |
| `@adit_firdaus/may-ui/mobile` | Shapes with no desktop meaning |

The adaptive components genuinely reshape rather than restyle: `Sheet` rises from the
bottom with drag-to-dismiss on phones and presents as a centred dialog on desktop,
`ActionSheet` becomes an anchored menu, `Table` collapses into grouped list rows. Reach
into `@adit_firdaus/may-ui/desktop` only when you want more than the adaptive version carries.

Consumers importing `@adit_firdaus/may-ui` never pull the desktop `DataTable` or the mobile gesture code.

## Theming

| `theme.mode` | Behaviour |
|---|---|
| `'system'` (default) | follows `prefers-color-scheme` |
| `'light'` | pinned light |
| `'dark'` | pinned dark |

```tsx
const { mode, resolvedMode } = useMayTheme()
const tokens = useMayTokens()
```

Providers nest, so a region can be pinned dark inside an otherwise light page — the
semantic aliases are re-declared in every theme scope, so a scoped `data-may-theme`
re-resolves them rather than leaving them stuck at the outer theme's values.

The application owns theme state. Configure branding with
`theme.tokens.colorTint` and `theme.tokens.colorPrimary`, plus optional `light`
and `dark` token maps.

## Icons

Glyphs come from Ionicons, which is drawn to Apple's own icon grid:

```tsx
import { IoSettingsOutline, IoAdd } from 'react-icons/io5'

<Button leadingIcon={<IoSettingsOutline />}>Settings</Button>
<IconButton aria-label="Add"><IoAdd /></IconButton>
```

**Do not pass `size`, `width` or `height`.** Each component sizes the glyph to its own slot
in CSS, so one icon is correct in a Button, a Fab and a list row without being told.
react-icons emits `width="1em"` as an *attribute*, which a stylesheet rule always beats.
For a genuine one-off, `style={{ width: 20, height: 20 }}` wins over everything.

Use filled icons (`IoStar`) on tab bars, selected states and coloured `IconTile`s; outline
(`IoStarOutline`) for toolbars, nav actions and list rows.

## Styling your own markup

There are **no utility classes**, and the `may-*` class names are internal. Two ways, in
this order:

**Layout primitives first** — `Box`, `Stack`, `Grid`, `Separator` take token-bound props:

```tsx
<Stack direction="horizontal" gap={3} align="center" justify="between">
  <Box surface="base" padding={4} radius="card">…</Box>
</Stack>
```

`gap` / `padding` take steps on the 4px scale: `0 1 2 3 4 5 6 8 10 12 16 20 24`.

**Then `var(--may-*)` in your own CSS:**

```css
.my-panel {
  background: var(--may-color-surface);
  color: var(--may-color-text);
  border-radius: var(--may-radius-card);
  padding: var(--may-space-4);
  box-shadow: var(--may-shadow-sm);
}
```

To separate two surfaces, **never reach for a border** — use a background-value change, a
soft shadow, or `<Separator />` (a true 0.5px device-pixel rule).

## The token layers

Primitives are raw values (`--may-blue`, `--may-gray-6`); semantic aliases point at them
(`--may-color-text: var(--may-label)`). Style against the **semantic** layer so themes work.

Surfaces `--may-color-bg` `--may-color-surface` `--may-color-surface-nested` · text
`--may-color-text` `--may-color-text-secondary` `--may-color-text-tertiary` · fills
`--may-color-fill` through `--may-color-fill-quaternary` · lines `--may-color-separator` ·
status `--may-color-success` `--may-color-warning` `--may-color-danger` `--may-color-info`.

Apple's system palette is available raw: `--may-blue` `--may-green` `--may-indigo`
`--may-orange` `--may-pink` `--may-purple` `--may-red` `--may-teal` `--may-yellow`
`--may-mint` `--may-cyan`.

`--may-color-tint` and `--may-color-primary` are **not** the same token: tint is
brand-as-text (a link, a selected tab label), primary is brand-as-fill (a filled button).
Collapsing them is what makes a ported Apple palette look wrong.

## Motion

Springs are real damped oscillators sampled at build time into CSS `linear()` — they run
on the compositor with no runtime JS:

`--may-spring-snappy` · `--may-spring-smooth` · `--may-spring-bouncy` (overshoots) ·
`--may-spring-playful`. Durations: `--may-duration-instant|fast|settle`.

The same constants are readable from JS for gesture code:

```tsx
import { motion } from '@adit_firdaus/may-ui'
motion.duration.settle  // 340
```

Everything collapses under `prefers-reduced-motion`.

## Shared vocabulary

- **`tone`** — `tint` · `neutral` · `success` · `warning` · `danger`. Typography
  takes `TextTone` instead, which is Apple's label ramp — `default` ·
  `secondary` · `tertiary` — plus `tint` for a link. A different axis, not a
  subset: one is status, the other is hierarchy.
- **`size`** — `sm` · `md` · `lg` (`Avatar` adds `xl`; `Modal` and `Sheet` add `full`)
- **`align`** — `start` · `center` · `end`, logical rather than left/right so a
  mirrored layout needs no second set. `Toolbar` adds `between`, which
  distributes rather than aligns. `TextAlign` is an alias of it.
- **`placement`** — `PopoverPlacement`, shared by `Popover`, `Menu` and
  `Tooltip`: a side, optionally aligned (`bottom-start`, `left-end`).
- **`variant`** — deliberately per-component, because it answers "which of this
  component's looks" and that differs. `Button` means emphasis
  (`filled` · `tinted` · `gray` · `plain`); `List`, `Accordion` and
  `Descriptions` mean container inset (`MayInset`); `Text` and `Label` mean the
  type style (`MayTextStyle`). Read the component's own type.
- **`asChild`** — render a component's presentation onto your own element
- **`trigger` / `defaultOpen` / `onOpenChange`** — an overlay that owns its state

## Overlays own their state

Hand an overlay a `trigger` and nothing else needs wiring — no `useState`, no
handlers:

```tsx
<Modal trigger={<Button>Settings</Button>} title="Settings">
  <Text>The modal manages itself.</Text>
</Modal>
```

The trigger is cloned, so your own `onClick` still runs and the
`aria-haspopup` / `aria-expanded` / `aria-controls` wiring is done for you.
Pass `open` and the component stops managing anything, which is what you want
when the state lives in a router or a store. Mobile `Popup` takes the same three
under its own phone-centric names — `visible`, `defaultVisible`,
`onVisibleChange`. `AlertDialog` closes itself once `onConfirm` has run, and
`CommandPalette` needs no trigger at all — its hotkey already opens it.

## Composition

`asChild` renders a component's presentation onto the element you supply, so a
link stays a real `<a>`. `onClick` plus `navigate()` is not a substitute: it
loses middle-click, cmd-click, open-in-new-tab, "copy link address" and
crawlability, and hands assistive tech the wrong element.

```tsx
<Card asChild>
  <Link to="/albums/reykjavik">
    <CardTitle>Reykjavík</CardTitle>
  </Link>
</Card>
```

Supported by `Button`, `IconButton`, `Fab`, `Card`, `ListRow`, `Tag`, `Avatar`
and desktop `NavTree`. The child's own props win; only `className` is merged.

## Forms

Wrap every control in a `Field`. It owns the label, help text, error message, required
marker and the `aria-describedby` wiring; the control picks all of it up from context:

```tsx
<Field label="Email" help="We'll only use this to sign you in." error={error}>
  <Input type="email" value={value} onChange={onChange} />
</Field>
```

To wire a control of your own into that machinery, read the context directly:
`useFieldControl()` returns the `id`, `aria-describedby` and invalid state to spread onto
your input; `useFieldContext()` exposes the whole field state for custom layouts.

## Components

**Adaptive** (`@adit_firdaus/may-ui`)

| Group | Components |
|---|---|
| Foundation | `MayProvider`, `useMayConfig`, `useMayTheme`, `useMayTokens`, `PlatformProvider`, `usePlatform`, `useIsDesktop` |
| Layout | `Box`, `Stack`, `Grid`, `Separator`, `SafeArea`, `ScrollArea` |
| Typography | `Heading`, `Text`, `Label`, `Kbd` |
| Actions | `Button`, `IconButton`, `ButtonGroup`, `Fab`, `Toolbar`, `ToolbarSpacer` |
| Forms | `Field`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `Stepper`, `SearchField`, `SegmentedControl` |
| Data display | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`, `Badge`, `Tag`, `Avatar`, `AvatarGroup`, `IconTile`, `Table`, `List`, `ListRow`, `Descriptions`, `DescriptionItem`, `Statistic`, `EmptyState` |
| Feedback | `Alert`, `NoticeBar`, `Progress`, `CircularProgress`, `Spinner`, `Skeleton`, `Toast`, `toast`, `useToast` |
| Navigation | `Tabs`, `TabList`, `Tab`, `TabPanel`, `NavigationBar`, `Breadcrumb`, `Pagination`, `Steps`, `Accordion`, `AccordionItem`, `Collapsible` |
| Overlays | `Sheet`, `Modal`, `AlertDialog`, `ActionSheet`, `Menu`, `Popover`, `Tooltip` |
| Utility | `VisuallyHidden`, `cx`, `motion`, `initialsFrom`, `usePressFeedback`, `useReducedMotion` |

**Desktop** (`@adit_firdaus/may-ui/desktop`) — `Sidebar`, `SidebarSection`, `SidebarItem`, `SidebarToggle`,
`NavTree`, `DataTable`, `CommandPalette`, `ContextMenu`, `SplitPane`

**Mobile** (`@adit_firdaus/may-ui/mobile`) — `TabBar`, `NavBar`, `SearchBar`, `PullToRefresh`,
`SwipeAction`, `CapsuleTabs`, `Selector`, `Popup`, `FloatingBubble`

## Toasts

Wrap the application in `MayProvider`, then call `toast` from anywhere. The
outer provider owns the host:

```tsx
import { toast, dismiss, dismissAll, setToastLimit } from '@adit_firdaus/may-ui'

toast('Saved')
toast.success('Deploy promoted')
toast.danger('Health check failed')
```

`dismiss(id)` closes one toast, `dismissAll()` clears the queue, and `useToast()`
reads it live. Configure stack limits with `MayProvider host={{ max: 3 }}`.

## Example screens

27 composed screens — full app shells, not isolated widgets — live under `@adit_firdaus/may-ui/examples`
and in the unified website's Patterns section:

```bash
npm run site
```

They are a separate entry, so importing `@adit_firdaus/may-ui` never pulls a demo screen into your bundle.

## Accessibility

- `IconButton` requires an `aria-label` at the type level
- Focus rings are never removed, only restyled, and appear on `:focus-visible`
- Overlays trap focus, restore it on close, and close on `Escape`
- Hover styling is gated behind `@media (hover: hover) and (pointer: fine)`, so touch
  devices never get stuck hover
- Everything collapses under `prefers-reduced-motion`, including animation iteration
- RTL mirrors three things, not two. Layout goes through logical properties and
  directional glyphs through a `[dir='rtl']` rule — and geometry **computed in
  JavaScript** reads the direction back off the element. That third one is the
  one that hides: a knob positioned by `translate`, a pointer delta, a scale
  origin and a `start`/`end` alignment all look right at rest, because the CSS
  around them mirrors itself, and are wrong the moment you touch them. `Slider`,
  `SplitPane`, `placeFloating` and the sliding thumb behind five controls each
  read it now. Put `dir` on `MayProvider` or on the document; both work, and a
  mirrored subtree inside an LTR page is read from the nearest element rather
  than from `<html>`
- Modal surfaces mark the rest of the document `inert`, which removes it from the
  accessibility tree as well as from focus order — a Tab cycle only ever contained Tab

### Colour contrast, honestly

All three families pass every WCAG 2.1 A and AA rule under axe-core — **except
colour contrast in the default palette**, and that is a deliberate trade rather
than an oversight.

The default palette is Apple's. Several of Apple's own pairings sit below AA's
4.5:1 for normal text, measured against the real catalogue:

| pairing | measured |
|---|---|
| white on systemBlue (`#007AFF`) — a filled button, light | 4.01:1 |
| systemBlue as text on a tertiary fill — a tinted button, light | 3.14:1 |
| secondaryLabel over a grouped background, light | 3.28:1 |
| white on systemBlue (`#0A84FF`) — a filled button, dark | 3.65:1 |
| white on systemGreen (`#30D158`) — a success fill, dark | 2.02:1 |

Matching Apple is the point of this library, so the default keeps those values
instead of quietly drifting off-brand. `@media (prefers-contrast: more)` — what
Apple's own **Increase Contrast** setting sets — swaps in AA-safe primitives, at
which point all three families report **zero** violations. A reader who needs
the contrast gets it from the OS; nobody has to wire anything.

Audited in **both modes** and on **composed screens**, not just component
catalogues: 25 example screens plus all three catalogues in light and dark —
31 surfaces, axe-core 4.10.2 against `wcag2a wcag2aa wcag21a wcag21aa`, zero
violations under the contrast tier. The screens matter because composition is
where structure breaks; across all 25, no `heading-order`, `landmark-*`,
`duplicate-id`, `region` or form-label rule ever fired. Dark needed one thing light
did not. Its AA blues go *lighter*, which is right for brand-as-text on a dark
surface and wrong for the same value used as a fill — `--may-color-tint` and
`--may-color-primary` both read `--may-blue`, so lifting the primitive put
white text on `#5EA9FF` at 2.44:1. Against those four AA primitives white runs
1.71–2.82:1 while `#1C1C1E` runs 6.03–9.93:1, so in dark the contrast tier
flips `--may-on-color` along with them.

Only the text flips. A `Slider`'s and a `Switch`'s knob are white because they
are knobs, the way iOS keeps them white on a dark track, so they read
`--may-knob` — a separate primitive that the tier never moves.

The screens found two more of the same shape. A bright fill's foreground was
`--may-label`, which follows the theme — so the rule that correctly put
near-black on orange in light put **white** on orange in dark, 2.06:1, while
its own comment said the label wins because white fails. Five components picked
that pair by hand; they read `--may-color-on-warning` and
`--may-color-on-success` now, and the warning token resolves through
`--may-on-bright`, which is theme-independent and inverts only under the tier.
And the AA green was chosen for white-on-fill (5.33:1) without checking the
other direction: the same token is the *text* on a 14% wash of itself in a
success `Tag`, cell or plain `Button`, where it measured 4.39:1 on white and
3.74:1 over a selected row. Blue, red and orange all clear every one of those;
green was the only outlier, and is darker now — worst case 5.29:1.

**One known false positive.** Running axe over the mobile catalogue may report
`may-capsule-tabs__label` and `__count` at roughly 1.1:1 — white text on a light
track. The selected capsule's tint thumb is a transform-positioned *sibling* of
the label rather than an ancestor, so axe reads the track behind it instead.
Measured, the thumb fully covers the label and the real ratio is white on
`--may-color-tint`. It appears only when the thumb has not finished being laid
out, so the same page can report it on one run and not the next. Do not "fix" it
by changing the label colour.

If your audit requires AA in the default state, override the same primitives on
the provider — they are typed token keys, not private variables:

```tsx
<MayProvider
  theme={{
    light: { labelSecondary: 'rgba(60, 60, 67, 0.85)', labelTertiary: 'rgba(60, 60, 67, 0.8)', blue: '#0040dd' },
    dark: { labelSecondary: 'rgba(235, 235, 245, 0.85)', labelTertiary: 'rgba(235, 235, 245, 0.8)', blue: '#5ea9ff' },
  }}
>
```

Those are the exact values `prefers-contrast: more` applies, so the two routes
agree.

## Development

```bash
npm run dev          # alias for npm run storybook
npm run storybook    # component workshop
npm run site         # unified website, docs, catalog and playground
npm run examples     # alias for npm run site
npm run site:preview # preview the production Pages build
npm run build        # library build (four entries) + types
npm run verify       # library gates plus the unified site build and contract
```

Release notes and the 0.2.0 migration table live in
[`CHANGELOG.md`](CHANGELOG.md).

`npm run generate` regenerates `src/styles/tokens.css`,
`src/styles/tokens.generated.ts`, and `src/styles/motion.css`. **Never edit those
files by hand** — they are build output, and `check:generated` fails the build
when the committed artifacts disagree with their generators.

### The gates

`npm run verify` enforces the design contract rather than trusting it: no `backdrop-filter`,
no visible strokes, every `:hover` behind a pointer query, chrome unselectable and body copy
selectable, dark re-resolving the full semantic alias set, hairlines at true device pixels,
the tint/primary split intact, and springs that are real `linear()` samples. It also holds
bundle budgets per entry and fails if any exported component appears in no example.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`, `index.ts`
   (or `src/desktop/` / `src/mobile/` for a dedicated family)
2. In `index.ts`, import the CSS with `?inline`, create a `mayStyleSheet`, and
   export the implementation through `withMayStyles`
3. Class names are `may-<component>` with `__element` and `--modifier` (BEM)
4. Style from tokens only — no literal colours, spacings, radii or shadows
5. Draw glyphs with `react-icons/io5`, and size them in CSS against `.may-<component>__icon > svg`
   — never with a `:not([width])` guard, which react-icons defeats
6. Re-export from the matching entry, and use it in at least one example screen or
   `check:coverage` will fail

The tone pattern is worth copying: tone modifiers **set** CSS variables and variant modifiers
**consume** them, so a new tone never touches variant CSS and vice versa. See `Button.css`.
