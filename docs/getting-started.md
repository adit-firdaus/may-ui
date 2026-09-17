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

For one control, `asChild` renders May's presentation onto your own element, so
the anchor stays a real anchor — middle-click, cmd-click, open-in-new-tab and
"copy link address" keep working, which `onClick` plus `navigate()` breaks:

```tsx
<Button asChild>
  <Link to="/albums">Open albums</Link>
</Button>
```

`Button`, `IconButton`, `Fab`, `Card`, `ListRow`, `Tag`, `Avatar` and desktop
`NavTree` support it. The child's own props win on conflict; only `className` is
merged. A whole card or a settings row can be the link:

```tsx
<Card asChild>
  <Link to="/albums/reykjavik">
    <CardTitle>Reykjavík</CardTitle>
    <CardDescription>48 photos</CardDescription>
  </Link>
</Card>

<List>
  <ListRow asChild title="Wi-Fi" detail="Kaffibarinn">
    <Link to="/settings/wifi" />
  </ListRow>
</List>
```

## Overlays without state

Every overlay manages its own open state unless you take it over. Hand it a
`trigger` and there is nothing else to wire:

```tsx
<Modal trigger={<Button>Settings</Button>} title="Settings">
  <Text>No useState, no handlers.</Text>
</Modal>
```

The trigger element is cloned, so your own `onClick` still runs and the
`aria-haspopup`, `aria-expanded` and `aria-controls` wiring is done for you.
`Modal`, `Sheet`, `AlertDialog`, `ActionSheet`, `Popover`, `Menu`, mobile
`Popup` and `CommandPalette` all take one; `CommandPalette` needs none at all,
because its hotkey already opens it.

Pass `open` and the component stops managing anything, which is what you want
when the state lives in a router or a store:

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Settings">…</Modal>
```

`defaultOpen` sets the starting state, and `onOpenChange` fires either way.
`AlertDialog` closes itself once `onConfirm` has run.

### One place an overlay does not belong

Every overlay renders inline, right beside the control that opened it — none of
them portal. That is what lets a Sheet be written inside the Card whose button
opens it, and it means putting one inside an **ARIA-structured container** adds
a child the container's role does not allow.

It applies to all of them: the modal surfaces through their scrim, and
`Popover`, `Menu` and `Tooltip` through the wrapper that holds their trigger and
panel together. Measured with axe, each produces an `aria-required-children`
violation on the container:

```tsx
// Wrong: the scrim becomes a non-listitem child of role="list",
// which axe reports as aria-required-children.
<List>
  <AlertDialog trigger={<ListRow title="Sign Out" />} … />
</List>
```

Keep the overlay outside the container and drive it with `open` instead:

```tsx
<List>
  <ListRow title="Sign Out" onClick={() => setSignOutOpen(true)} />
</List>
<AlertDialog open={signOutOpen} onCancel={() => setSignOutOpen(false)} … />
```

The same applies inside `role="tablist"`, `role="radiogroup"` and `role="menu"`,
and to an anchored surface as much as a modal one: put the `Popover` beside the
list rather than in it. Anywhere the parent accepts ordinary flow content — a
Card, a Stack, a toolbar, a page — `trigger` is the shorter and better answer.

## Form libraries

Every control forwards its `ref` to the real DOM element — `Input` to the
`<input>`, `Select` to the `<select>`, `Checkbox` and `Switch` to their
`<input type="checkbox">` — and every one accepts `name`. So a form library's
register spread lands where it expects:

```tsx
const { register } = useForm()

<Field label="Email" error={errors.email?.message}>
  <Input type="email" {...register('email', { required: 'Required' })} />
</Field>
```

`Slider` and `Stepper` are ARIA-roled buttons rather than inputs, so they carry
a hidden input for `name` instead; register their value through a controller.
`Combobox` emits one hidden input per selected value, which is what
`FormData.getAll` expects.

Passing `error` to the `Field` is what marks the control invalid — it flips
`aria-invalid`, swaps the description for the message and points
`aria-describedby` at it, so the visual and announced states cannot drift apart.

That holds for all ten controls, including the ones that are not a single
input. `Slider`'s thumb is a `<button>`, which `<label for>` can name; `Stepper`
and `RadioGroup` are a `role="group"` and a `role="radiogroup"`, which it
cannot, so they adopt the Field's label with `aria-labelledby` instead. Either
way the label you can see is the control's accessible name, and you never type
an `id`, an `aria-invalid` or an `aria-describedby` yourself.

## Next.js App Router

Every entry ships with a `'use client'` directive, so importing from this
package is safe from anywhere — including a server component, which is the App
Router default:

```tsx
// app/page.tsx — no directive needed here
import { Button, MayProvider } from '@adit_firdaus/may-ui'

export default function Page() {
  return <MayProvider><Button>Continue</Button></MayProvider>
}
```

That builds and prerenders: verified against Next.js 15.1, where the static
output carries `.may-root`, the button's classes and its CSS, hoisted by
React's own style resources with no stylesheet import.

`MayProvider` holds React context, so put it in your root layout and let the
tree below it be server components. The provider itself becomes a client
boundary — that is what the directive is for — and a server component may
still be rendered as its child.

The directive is on the four entries only, not on the ~200 preserved modules
beneath them. A directive marks a boundary and everything the module imports
joins the client graph, so four is sufficient, and `exports` lists no other
path: a deep import throws `ERR_PACKAGE_PATH_NOT_EXPORTED` rather than
quietly bypassing it.

## Content-Security-Policy

Components render their CSS as React style resources, so under a strict
`style-src 'nonce-…'` the nonce has to reach them or every rule is blocked and
the app renders unstyled. Two things are needed, and one of them is easy to get
wrong.

```tsx
<MayProvider styleNonce={nonce}>…</MayProvider>
```

```tsx
renderToPipeableStream(app, { nonce: { style: nonce } })
```

**The render option must be the object form.** React's `nonce` option accepts a
string or `{ script, style }`, and the string applies to **scripts only** —
measured, `nonce: nonce` leaves every May UI style tag bare. React does warn,
but it says to "provide the same style nonce value as a render option", and the
obvious reading of that sentence is the form that does not work. Pass
`{ style: nonce }` (add `script` too if you need it) and every style resource
carries the attribute; `check:provider` asserts that for all of them.

The same nonce covers the provider's own token overrides, so a `theme={{ … }}`
needs nothing extra.

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

## Building your own components on the same seams

Two hooks exist so a component you write behaves like one of May's rather than
merely looking like it. Both were exported and undocumented, which made them
impossible to find.

**`useLinkComponent()`** — the element the provider says to render an `href`
with. Reach for it instead of a literal `<a>` in anything navigational, and
your component routes client-side in a TanStack Router / React Router / Next
app for the same reason `Breadcrumb` and `TabBar` do. It defaults to `'a'`, so
there is nothing to configure for a consumer who has not set `linkComponent`.

```tsx
function MyNavItem({ href, children }) {
  const Link = useLinkComponent()
  return href ? <Link href={href}>{children}</Link> : <button>{children}</button>
}
```

**`useKeyboardInset(enabled?)`** — measures how much of the layout viewport the
on-screen keyboard is covering and publishes it as `--may-keyboard-inset` on
the document element. It returns nothing; the value is a CSS variable, which is
what lets a footer stay above the keys without re-rendering on every frame of
the animation. iOS is the reason it exists: Android resizes the viewport when
the keyboard opens and iOS draws the keys over it. `Sheet` is the only
component that calls it, and only while open, since the listeners are not free.

```tsx
useKeyboardInset(open)          // enable the measurement while your panel is up
// then, in your CSS:
// .my-footer { padding-bottom: var(--may-keyboard-inset); }
```

`usePressFeedback()`, `useReducedMotion()`, `useIsDesktop()` and `usePlatform()`
are public for the same reason: the press physics, the motion opt-out and the
adaptive breakpoint are decisions the system has already made, and a component
that re-decides them is the one that feels out of place.
