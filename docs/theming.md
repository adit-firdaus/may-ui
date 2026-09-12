# Provider and theming

## Controlled appearance

`MayProvider` is configuration, not a state store. Keep a theme toggle in the
application and pass its value through `theme.mode`:

```tsx
const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system')

<MayProvider theme={{ mode }}>
  <App />
</MayProvider>
```

`useMayTheme()` returns the read-only `{ mode, resolvedMode }`. System mode
follows `prefers-color-scheme`; the server snapshot is light while CSS media
queries paint the correct appearance before hydration.

## Typed token overrides

Every public `--may-*` token has a camel-case `MayTokens` property. Common
values apply to both appearances, and mode maps override the common value:

```tsx
<MayProvider
  theme={{
    mode: 'system',
    tokens: {
      radiusCard: '18px',
      fontSans: 'Inter, sans-serif',
    },
    light: { colorPrimary: '#0066ff' },
    dark: { colorPrimary: '#4d8dff' },
  }}
>
  <App />
</MayProvider>
```

`useMayTokens()` returns the fully resolved token map for the active appearance.
Tint and primary remain separate: `colorTint` is brand-as-text and
`colorPrimary` is brand-as-fill.

## Component defaults

Provider defaults cover curated presentation and interaction-policy props.
They never supply content, state, callbacks, IDs, accessibility labels, or DOM
attributes. Explicit component props win.

```tsx
<MayProvider
  components={{
    Button: { size: 'lg', variant: 'tinted' },
    Modal: { size: 'lg', closeOnScrimClick: false },
  }}
>
  <Button>Large tinted default</Button>
  <Button size="sm">Explicitly small</Button>
</MayProvider>
```

Providers nest. Token maps merge by key and component maps merge by component
and prop, so a child can change one default without repeating its parent:

```tsx
<MayProvider components={{ Button: { size: 'lg', variant: 'tinted' } }}>
  <MayProvider
    theme={{ mode: 'dark' }}
    components={{ Button: { size: 'sm' } }}
  >
    <Button>Small, tinted, dark</Button>
  </MayProvider>
</MayProvider>
```

`useMayConfig()` returns the complete effective read-only configuration.

## CSP

Pass the document style nonce to the outer provider. With streaming SSR, pass
the same style nonce to React's renderer so managed resources receive it:

```tsx
const app = <MayProvider styleNonce={nonce}><App /></MayProvider>

renderToPipeableStream(app, {
  nonce: { style: nonce },
  onAllReady() { /* pipe the response */ },
})
```

Nested providers inherit the outer nonce.

## Breaking migration

| Before | Now |
|---|---|
| `import '@adit_firdaus/may-ui/styles.css'` | Remove it |
| `theme="dark"` | `theme={{ mode: 'dark' }}` |
| `accent="purple"` | `theme={{ tokens: { colorTint: 'purple', colorPrimary: 'purple' } }}` |
| `useMayTheme().setTheme(...)` | Store mode in application state |
| `<MayHost />` | Remove it; configure `MayProvider.host` |

The internal generated CSS remains the browser-facing implementation of media
queries, pseudo-elements, and motion. Consumers receive it only through React
resources; the package emits no stylesheet asset.
