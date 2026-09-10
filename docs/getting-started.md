# Getting started

## Install

```bash
npm install @adit_firdaus/may-ui
# or: bun add @adit_firdaus/may-ui
```

`react` and `react-dom` (18+) are peer dependencies.
[`react-icons`](https://react-icons.github.io/react-icons/) is a dependency —
May UI draws its glyphs from Ionicons (`react-icons/io5`) and keeps it external
so your bundler tree-shakes it per icon.

## Set up the root

Import the stylesheet once, wrap your tree in `MayProvider`, and mount `MayHost`
once for imperative surfaces (toasts, dialogs opened from code):

```tsx
import '@adit_firdaus/may-ui/styles.css'
import { MayProvider, MayHost, Card, CardTitle, Stack, Text, Button } from '@adit_firdaus/may-ui'

export function App() {
  return (
    <MayProvider theme="system">
      <MayHost />
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

`theme` is `'system'` (default), `'light'` or `'dark'` — see [Theming](theming.md).

## The stylesheet is a cascade layer

`styles.css` ships wrapped in `@layer may-ui`. Unlayered CSS beats every layered
rule whatever its specificity, so this is what lets a utility or an override at
your call site win against a component's own rule — which is the way round most
people expect:

```jsx
<Skeleton className="h-7" />   /* 28px: your utility wins */
```

Plain CSS of your own needs nothing: unlayered always beats layered.

**With Tailwind**, layer order decides, and layers rank in the order they are
first declared. Declare the order yourself so it cannot depend on import order:

```css
@layer theme, base, may-ui, components, utilities;   /* declare order first */
@import 'tailwindcss';
@import '@adit_firdaus/may-ui/styles.css' layer(may-ui);
```

With `may-ui` ahead of `utilities`, every Tailwind utility wins on a May
component. Move it after `utilities` if you would rather May won.

## The three entry points

```tsx
import { Button, Card, Tabs } from '@adit_firdaus/may-ui'          // adaptive
import { Sidebar, CommandPalette } from '@adit_firdaus/may-ui/desktop'
import { TabBar, CapsuleTabs } from '@adit_firdaus/may-ui/mobile'
```

Start with the adaptive family — those components reshape at the breakpoint on
their own. Reach into `/desktop` or `/mobile` for shapes that only make sense on
one. Importing `@adit_firdaus/may-ui` never pulls the desktop or mobile code into
your bundle. More in [Components](components.md).

## Styling your own markup

Every colour, space, radius, shadow and duration is a `--may-*` custom property,
so your own elements can sit inside the same system without importing anything:

```tsx
<div style={{
  background: 'var(--may-color-surface)',
  padding: 'var(--may-space-4)',
  borderRadius: 'var(--may-radius-lg)',
  color: 'var(--may-color-text)',
}} />
```

Style against the **semantic** tokens (`--may-color-text`, not `--may-label`) so
your markup follows the theme. The full token map is in [Theming](theming.md).

## Next

- [Theming](theming.md) — pin light/dark, scope a region, re-point the accent.
- [Motion](motion.md) — the spring tokens and the gesture layer.
- [Storybook](https://adit-firdaus.github.io/may-ui/storybook/) — props for every
  component.
