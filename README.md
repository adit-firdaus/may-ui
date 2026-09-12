# May UI

Apple's design language as a React library — iOS 26 / macOS shapes, real spring physics,
and a token layer you can theme.

- **74 components** across three families — adaptive, desktop-only, mobile-only
- **No borders** — surfaces separate by value, translucent fill and hairline separators
- **Real springs** — damped-oscillator curves sampled into CSS `linear()`, no runtime JS
- **Token-first** — every colour, space, radius, shadow and duration is a `--may-*` property
- **Light and dark** — follows the OS by default, pinnable per subtree
- **Typed** — bundled `.d.ts` per entry, JSDoc on every prop

**[Website & Catalog](https://adit-firdaus.github.io/may-ui/)** · **[Docs](https://adit-firdaus.github.io/may-ui/docs/getting-started)** · **[Storybook](https://adit-firdaus.github.io/may-ui/storybook/)** · **[Contributing](CONTRIBUTING.md)**

## Install

```bash
npm install @adit_firdaus/may-ui
```

`react` and `react-dom` 19 are peer dependencies. [`react-icons`](https://react-icons.github.io/react-icons/)
is a dependency — May UI draws its glyphs from Ionicons (`react-icons/io5`), and it stays
external so your bundler tree-shakes it per icon.

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

- **`tone`** — `tint` · `neutral` · `success` · `warning` · `danger`
- **`size`** — `sm` · `md` · `lg`

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
| Forms | `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `Stepper`, `SearchField`, `SegmentedControl` |
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

## Development

```bash
npm run dev          # Vite playground
npm run storybook    # component workshop
npm run site         # unified website, docs, catalog and playground
npm run examples     # alias for npm run site
npm run site:preview # preview the production Pages build
npm run build        # library build (four entries) + types
npm run verify       # library gates plus the unified site build and contract
```

`npm run generate` regenerates `src/styles/tokens.css`,
`src/styles/tokens.generated.ts`, and `src/styles/motion.css`. **Never edit those
files by hand** — they are build output.

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
