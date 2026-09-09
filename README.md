# May UI

A custom React design system built on CSS-variable design tokens.

- **33 components** — layout, typography, forms, data display, navigation, overlays
- **Token-first** — every colour, space, radius and shadow is a `--may-*` custom property
- **Light and dark** — follows the OS setting by default, overridable per subtree
- **No runtime CSS-in-JS** — plain compiled CSS, zero styling dependencies
- **Typed** — a single bundled `index.d.ts` with JSDoc on every prop

## Install

```bash
npm install mayui
```

`react` and `react-dom` (18+) are peer dependencies.

## Use

Import the stylesheet once at the root of your app, then wrap your tree in `MayProvider`:

```tsx
import 'mayui/styles.css'
import { MayProvider, Button, Card, CardTitle, Stack, Text } from 'mayui'

export function App() {
  return (
    <MayProvider theme="system">
      <Stack gap={4}>
        <Card>
          <CardTitle>Production deploy</CardTitle>
          <Text tone="muted">All 14 health checks passed.</Text>
          <Button>Promote</Button>
        </Card>
      </Stack>
    </MayProvider>
  )
}
```

`MayProvider` supplies the tokens, the base typography layer and theme state. Components render
unstyled without it.

## Theming

Themes resolve in three ways:

| `theme` prop | Behaviour |
|---|---|
| `'system'` (default) | follows `prefers-color-scheme` |
| `'light'` | pinned light |
| `'dark'` | pinned dark |

Read or change the theme from anywhere inside the provider:

```tsx
const { theme, resolvedTheme, setTheme } = useMayTheme()
```

Providers nest, so a single region can be pinned dark inside an otherwise light page.

## Styling your own markup

There are **no utility classes**. Style layout glue in one of two ways, in this order of preference:

1. **`Box`, `Stack` and `Grid`** — token-bound layout primitives. Reach for these first.

   ```tsx
   <Stack direction="horizontal" gap={3} align="center">
     <Box surface="base" padding={4} radius="lg" bordered>…</Box>
   </Stack>
   ```

   `gap` and `padding` take steps on the 4px scale: `0 1 2 3 4 5 6 8 10 12 16 20 24`.

2. **`var(--may-*)` in your own CSS**, for anything the primitives don't cover. Never hard-code a
   colour, radius or shadow — every one of them is a token.

   ```css
   .my-panel {
     background: var(--may-color-surface);
     border: 1px solid var(--may-color-border);
     border-radius: var(--may-radius-lg);
     padding: var(--may-space-5);
   }
   ```

## The token layers

`src/styles/tokens.css` has two layers:

- **Primitives** — raw ramps and scales: `--may-brand-500`, `--may-space-4`, `--may-radius-lg`,
  `--may-shadow-md`, `--may-font-size-lg`. Rarely referenced directly.
- **Semantic** — roles you actually build with: `--may-color-surface`, `--may-color-text-muted`,
  `--may-color-border`, `--may-color-brand`, `--may-color-danger-subtle`.

Rebrand the system by overriding the **semantic** layer only:

```css
:root {
  --may-color-brand: #0f766e;
  --may-color-brand-hover: #0d5f59;
  --may-color-brand-subtle: #ecfdf5;
  --may-color-brand-text: #115e59;
}
```

## Shared vocabulary

Two prop vocabularies repeat across the system, so learning them once covers most components:

- **`tone`** — `brand` · `neutral` · `success` · `warning` · `danger` · `info`
- **`size`** — `sm` · `md` · `lg`

`Button`, `IconButton`, `Badge`, `Tag`, `Alert`, `Progress` and `Toast` all take `tone`.
Every interactive control takes `size`.

## Forms

Wrap every control in a `Field`. It owns the label, help text, error message, required marker and
the `aria-describedby` wiring — the control picks all of that up from context:

```tsx
<Field label="Email address" description="Used for billing receipts." required>
  <Input type="email" fullWidth />
</Field>

<Field label="Email address" error="Enter a valid email address.">
  <Input type="email" fullWidth />
</Field>
```

Passing `error` marks the control invalid; you never set `invalid` by hand.

## Components

| Group | Components |
|---|---|
| Foundation | `MayProvider`, `useMayTheme` |
| Layout | `Box`, `Stack`, `Grid`, `Divider` |
| Typography | `Heading`, `Text` |
| Actions | `Button`, `IconButton`, `ButtonGroup` |
| Forms | `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Switch` |
| Data display | `Card`, `Badge`, `Tag`, `Avatar`, `AvatarGroup`, `Table`, `Alert`, `Progress`, `Spinner`, `Skeleton` |
| Navigation | `Tabs`, `Accordion`, `Breadcrumb`, `Pagination` |
| Overlays | `Tooltip`, `Modal`, `Drawer`, `Toast`, `ToastProvider`, `useToast` |

## Toasts

Mount `ToastProvider` once near the root, then call `useToast()` anywhere beneath it:

```tsx
<MayProvider>
  <ToastProvider position="bottom-right">
    <App />
  </ToastProvider>
</MayProvider>
```

```tsx
const { toast, dismiss, dismissAll } = useToast()

toast({ title: 'Saved', description: 'Your changes are live.', tone: 'success' })
toast({ title: 'Build failed', tone: 'danger', duration: 0 })  // sticky
toast({ title: 'Archived', action: { label: 'Undo', onClick: restore } })
```

## Accessibility

Built in, not bolted on:

- One focus treatment across the system, via `:focus-visible` and `--may-color-focus-ring`
- `Modal` and `Drawer` trap focus, lock body scroll, and restore focus on close
- `Tabs` implements arrow-key roving focus; `Accordion` wires `aria-expanded`/`aria-controls`
- `IconButton` requires an `aria-label` at the type level
- `Field` generates and wires every `id` and `aria-describedby`
- All animation is disabled under `prefers-reduced-motion: reduce`

## Development

```bash
npm install
npm run storybook       # component workshop at :6006
npm run build           # typecheck, then build dist/
npm run verify          # typecheck + build + render smoke test + token audit
npm run typecheck
npm run build-storybook
```

Build output:

| File | Contents |
|---|---|
| `dist/mayui.js` / `dist/mayui.cjs` | ESM and CJS bundles |
| `dist/mayui.css` | every component's styles plus the token layer |
| `dist/index.d.ts` | one bundled declaration file |

`npm run smoke` server-renders every component against the built bundle and asserts the
accessibility wiring; `npm run check:tokens` fails if the stylesheet reads a `--may-*` variable
that nothing declares.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`, `index.ts`
2. Import the CSS from the `.tsx` so the bundler picks it up
3. Class names are `may-<component>` with `__element` and `--modifier` (BEM)
4. Style from tokens only — no literal colours, spacings, radii or shadows
5. Re-export from `src/index.ts`

The tone pattern is worth copying: tone modifiers **set** CSS variables and variant modifiers
**consume** them, so a new tone never touches variant CSS and vice versa. See `Button.css`.
