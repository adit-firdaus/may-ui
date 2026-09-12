# Getting started

## Install

```bash
npm install @adit_firdaus/may-ui
# or: bun add @adit_firdaus/may-ui
```

`react` and `react-dom` 19 are peer dependencies. May UI has no stylesheet to
import: each component renders its own React stylesheet resource, which React
hoists and de-duplicates. `react-icons` supplies the Ionicons glyph set, and
`motion` drives SegmentedControl's layout-projected selection thumb.

## Render a component

Components carry their built-in tokens and styles without a provider:

```tsx
import { Button, Card, CardTitle } from '@adit_firdaus/may-ui'

export function Promote() {
  return (
    <Card>
      <CardTitle>Production deploy</CardTitle>
      <Button>Promote</Button>
    </Card>
  )
}
```

Add `MayProvider` when the app needs shared theme, component defaults, routing,
platform overrides, a CSP nonce, or imperative toasts. The outer provider
mounts the toast host automatically.

```tsx
import { MayProvider, Stack, Text, Button } from '@adit_firdaus/may-ui'

export function App() {
  return (
    <MayProvider
      theme={{ mode: 'system' }}
      components={{ Button: { size: 'lg' } }}
      host={{ position: 'top-end', max: 4 }}
    >
      <Stack gap={4}>
        <Text>All 14 health checks passed.</Text>
        <Button>Promote</Button>
      </Stack>
    </MayProvider>
  )
}
```

Use `host={false}` on a secondary sibling React root so only one root renders
the global toast queue.

## Routing

Anything that renders an `href` uses a plain `<a>` by default. Supply a router
link once for the configured subtree:

```tsx
import { Link } from '@tanstack/react-router'

const RouterLink = ({ href, ...props }) => <Link to={href} {...props} />

<MayProvider linkComponent={RouterLink}>…</MayProvider>
```

For one control, `Button`, `IconButton`, and `Fab` support `asChild`:

```tsx
<Button asChild>
  <Link to="/albums">Open albums</Link>
</Button>
```

## Cascade and Tailwind

May UI resources live in `@layer may-ui`. Unlayered application CSS wins over
them. Tailwind users can declare layer order without importing a May UI asset:

```css
@layer theme, base, may-ui, components, utilities;
@import 'tailwindcss';
```

## Entry points

```tsx
import { Button, Card, Tabs } from '@adit_firdaus/may-ui'
import { Sidebar, CommandPalette } from '@adit_firdaus/may-ui/desktop'
import { TabBar, CapsuleTabs } from '@adit_firdaus/may-ui/mobile'
```

Start with adaptive components. Desktop and mobile families are separate
tree-shakable entries for shapes that do not have an honest adaptive form.

## Styling custom React UI

Use `useMayTokens()` when custom markup should share the resolved theme without
authoring CSS:

```tsx
const tokens = useMayTokens()

return (
  <div style={{
    background: tokens.colorSurface,
    color: tokens.colorText,
    borderRadius: tokens.radiusCard,
    padding: tokens.space4,
  }} />
)
```

See [Theming](theming.md) for token overrides, nesting, and migration details.
