# Theming

## Light and dark

`MayProvider` takes a `theme` prop:

| `theme` | Behaviour |
|---|---|
| `'system'` (default) | follows `prefers-color-scheme` |
| `'light'` | pinned light |
| `'dark'` | pinned dark |

Read or change it from anywhere below the provider:

```tsx
const { theme, resolvedTheme, setTheme } = useMayTheme()
```

## Scoped themes

Providers nest, so a region can be pinned dark inside an otherwise light page:

```tsx
<MayProvider theme="light">
  <Page />
  <MayProvider theme="dark">
    <Sidebar />   {/* dark, in a light page */}
  </MayProvider>
</MayProvider>
```

This works because the semantic aliases are re-declared in every theme scope — a
scoped `data-may-theme` re-resolves them rather than leaving them stuck at the
outer theme's values. (If you author your own scoped theme, that re-resolution
is exactly what the design contract's "scoped dark re-resolves the semantic
aliases" gate protects.)

## The token layers

Two layers:

- **Primitives** — raw values: `--may-blue`, `--may-gray-6`.
- **Semantic aliases** — point at primitives: `--may-color-text: var(--may-label)`.

**Style against the semantic layer**, so themes work. Reaching for a primitive
directly pins a value that will not follow the theme.

### Semantic tokens

- Surfaces — `--may-color-bg`, `--may-color-surface`, `--may-color-surface-nested`
- Text — `--may-color-text`, `--may-color-text-secondary`, `--may-color-text-tertiary`
- Fills — `--may-color-fill` through `--may-color-fill-quaternary`
- Lines — `--may-color-separator`
- Status — `--may-color-success`, `--may-color-warning`, `--may-color-danger`, `--may-color-info`

Apple's system palette is available raw when you genuinely want a fixed hue:
`--may-blue` `--may-green` `--may-indigo` `--may-orange` `--may-pink`
`--may-purple` `--may-red` `--may-teal` `--may-yellow` `--may-mint` `--may-cyan`.

Plus spacing (`--may-space-*`), radii (`--may-radius-*`), shadows
(`--may-shadow-*`) and durations (`--may-duration-*`).

## tint ≠ primary

`--may-color-tint` and `--may-color-primary` are **not** the same token:

- **tint** is brand-as-text — a link, a selected tab label.
- **primary** is brand-as-fill — a filled button, a selection pill.

Collapsing them is what makes a ported Apple palette look wrong. Keep them
distinct in your own markup too.

## Re-pointing the accent

`accent` on the provider re-points the tint:

```tsx
<MayProvider theme="system" accent="purple">
```

## Overriding tokens

Tokens are plain custom properties, so you can override any of them on a scope:

```css
.my-brand {
  --may-color-tint: var(--may-teal);
  --may-radius-lg: 20px;
}
```

Everything under `.my-brand` picks it up. The generators
(`scripts/gen-tokens.mjs`) are the source of the defaults — never edit the
generated `src/styles/tokens.css` by hand.
