## Building with May UI

May UI is Apple's design language as a React library. Surfaces separate by **value,
not by strokes** — there are no borders anywhere in this system, and adding one is the
fastest way to make a design stop looking like iOS.

### 1. Wrap the tree in `MayProvider`, and mount `MayHost` once

`MayProvider` renders the `.may-root` element carrying every design token and the base
layer. Outside it components fall back to unstyled browser defaults — no colours, no
spacing, no type scale. `MayHost` is the single mount point for imperative surfaces
(toasts); mount it once, near the root.

```jsx
<MayProvider theme="system">   {/* "system" | "light" | "dark" */}
  <MayHost />
  <YourApp />
</MayProvider>
```

Dark mode needs no extra work: `theme="system"` follows the OS, `theme="dark"` pins it.
Read or change it with `useMayTheme()` → `{ theme, resolvedTheme, setTheme }`.
`accent` on the provider re-points the tint.

### 2. Three import paths — pick by shape, not by preference

| Import | What lives there |
|---|---|
| `mayui` | **Adaptive** components. One per concern, reshaping at the breakpoint. Start here. |
| `mayui/desktop` | Shapes with no honest phone form: `Sidebar`, `NavTree`, `DataTable`, `CommandPalette`, `ContextMenu`, `SplitPane` |
| `mayui/mobile` | Shapes with no desktop meaning: `TabBar`, `NavBar`, `PullToRefresh`, `SwipeAction`, `CapsuleTabs`, `Popup`, `SearchBar`, `Selector`, `FloatingBubble` |

The adaptive components genuinely **reshape**, not merely restyle: `Sheet` rises from the
bottom edge with drag-to-dismiss on phones and presents as a centred dialog on desktop;
`ActionSheet` becomes an anchored menu; `Table` collapses into grouped list rows. Write
them once. Reach into `mayui/desktop` only when you want more than the adaptive version
carries — a sidebar with collapsible sections and a rail, a table with column resizing.

### 3. Style with tokens — there are no utility classes

May UI has **no** `bg-*` / `p-*` utility vocabulary, and the `may-*` class names are
internal. Style your own layout two ways, in this order:

**a. Layout primitives first.** `Box`, `Stack`, `Grid`, `Separator` take token-bound props:

```jsx
<Stack direction="horizontal" gap={3} align="center" justify="between">
  <Box surface="base" padding={4} radius="card">…</Box>
</Stack>
<Grid minColumnWidth="220px" gap={4}>…</Grid>
```

`gap` / `padding` take steps on the 4px scale: `0 1 2 3 4 5 6 8 10 12 16 20 24`.
`Box` also takes `surface` (`base` `nested` `grouped`), `radius`, `shadow`.
Note there is **no `bordered` prop** — that is deliberate.

**b. `var(--may-*)` in your own CSS** for anything the primitives don't cover:

```css
.my-panel {
  background: var(--may-color-surface);
  color: var(--may-color-text);
  border-radius: var(--may-radius-card);
  padding: var(--may-space-4);
  box-shadow: var(--may-shadow-sm);
}
```

**To separate two surfaces, never reach for a border.** Use a background-value change
(`--may-color-bg` behind `--may-color-surface`), a soft shadow, or a hairline separator
(`<Separator />`, which draws a true 0.5px device-pixel rule).

Semantic tokens: surfaces `--may-color-bg`, `--may-color-surface`,
`--may-color-surface-nested`; text `--may-color-text`, `--may-color-text-secondary`,
`--may-color-text-tertiary`; fills `--may-color-fill`, `--may-color-fill-secondary`,
`--may-color-fill-tertiary`, `--may-color-fill-quaternary`; lines
`--may-color-separator`; status `--may-color-success`, `--may-color-warning`,
`--may-color-danger`, `--may-color-info`. Apple's system palette is available raw as
`--may-blue`, `--may-green`, `--may-indigo`, `--may-orange`, `--may-pink`,
`--may-purple`, `--may-red`, `--may-teal`, `--may-yellow`, `--may-mint`, `--may-cyan`,
`--may-brown`, plus `--may-gray` through `--may-gray-6`.

**One pair that matters:** `--may-color-tint` is the brand as **text** on a neutral
surface — links, plain buttons, an active tab label. `--may-color-primary` is the brand
as a **fill** carrying white text. Same hue, different jobs; using the fill token for
text is the classic tell that an Apple palette was ported rather than designed.

### 4. Typography is Apple's named styles

`Text` takes `variant`: `large-title`, `title-1`, `title-2`, `title-3`, `headline`,
`body`, `callout`, `subheadline`, `footnote`, `caption-1`, `caption-2`. Each token
carries size, line-height, tracking **and** weight together, because in iOS those four
move as one. `body` and `headline` are the same size — they differ only in weight and
tracking. Never set a raw `font-size`.

### 5. Motion — real springs, already built

Transitions use generated spring curves: `--may-spring-snappy`, `--may-spring-smooth`,
`--may-spring-bouncy`, `--may-spring-playful`, plus `--may-ease-back`,
`--may-ease-elastic`, `--may-ease-bounce`, `--may-ease-expo`, `--may-ease-sheet`.
Durations: `--may-duration-instant`, `-fast`, `-settle`, `-sheet-in`, `-sheet-out`.

```css
.my-thing { transition: transform var(--may-duration-settle) var(--may-spring-bouncy); }
```

This system is meant to feel alive. Prefer a spring over a linear ease.

### 6. Native feel — three rules to preserve

These are what separate a native-feeling app from a web page, and they are easy to undo:

1. **Gate every hover:** `@media (hover: hover) and (pointer: fine)`. An ungated `:hover`
   leaves a tap stuck in hover state on touch.
2. **Chrome is unselectable, content is not.** Controls and nav already set
   `user-select: none`; don't add it to body copy.
3. **Press feedback is asymmetric** — fast down, spring back up. Interactive components
   already carry `may-pressable`; reuse the component rather than rebuilding the feel.

### 7. Forms: wrap every control in `Field`

`Field` owns the label, help text, error, required marker and all `id`/`aria-describedby`
wiring. Passing `error` marks the control invalid — never set `invalid` yourself.

```jsx
<Field label="Email address" description="Used for receipts." required>
  <Input type="email" fullWidth />
</Field>
```

### 8. Where the truth lives

`_ds/<folder>/styles.css` and the `_ds_bundle.css` it imports hold every token
definition and component rule. Each component's `.prompt.md` and `.d.ts` under
`components/<group>/<Name>/` are the authoritative prop contracts.

### 9. An idiomatic screen

```jsx
<MayProvider theme="system">
  <MayHost />
  <NavigationBar title="Settings" largeTitle />
  <Stack gap={4} style={{ padding: 'var(--may-space-4)' }}>
    <SegmentedControl
      aria-label="Scope"
      options={[{ label: 'All', value: 'all' }, { label: 'Mine', value: 'mine' }]}
    />
    <List header="Network" footer="Applies to this device only.">
      <ListRow leading={<IconTile gradient="blue" />} title="Wi-Fi" detail="HomeNet" onClick={open} />
      <ListRow leading={<IconTile gradient="green" />} title="Cellular" accessory={<Switch />} />
      <ListRow title="Reset" destructive onClick={reset} />
    </List>
    <Button pill size="lg" fullWidth>Continue</Button>
  </Stack>
</MayProvider>
```
