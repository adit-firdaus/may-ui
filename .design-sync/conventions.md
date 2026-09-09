## Building with May UI

### 1. Wrap the tree in `MayProvider` — nothing is styled without it

`MayProvider` renders the `.may-root` element that carries the design tokens and the
base typography layer. Outside it every component falls back to unstyled browser
defaults: no colours, no spacing, no type scale. Mount exactly one near the root of
the app (nest a second one only to pin a region to a different theme).

```jsx
<MayProvider theme="system">   {/* "system" | "light" | "dark" */}
  <YourApp />
</MayProvider>
```

Dark mode needs no extra work: `theme="system"` follows the OS setting, and
`theme="dark"` pins it by stamping `data-may-theme="dark"`, which re-points every
semantic token. Read or change it with `useMayTheme()` → `{ theme, resolvedTheme, setTheme }`.

For toasts, mount `ToastProvider` inside `MayProvider` once, then call `useToast()`
anywhere below it: `toast({ title, description, tone, action })`.

### 2. Style with tokens — there are no utility classes

May UI has **no** `bg-*` / `p-*` / `text-*` utility vocabulary. Do not invent one, and
do not hand-write `may-*` class names (they are internal BEM names owned by the
components). Style your own layout glue two ways, in this order:

**a. Layout primitives first.** `Box`, `Stack`, `Grid`, `Divider` take token-bound props,
so they cover most glue without any CSS:

```jsx
<Stack direction="horizontal" gap={3} align="center" justify="between">
  <Box surface="base" padding={4} radius="lg" bordered>…</Box>
</Stack>
<Grid minColumnWidth="220px" gap={4}>…</Grid>
```

`gap` / `padding` / `paddingX` / `paddingY` take steps on the 4px scale:
`0 1 2 3 4 5 6 8 10 12 16 20 24`. `Box` also takes `surface` (`base` `raised` `sunken`
`subtle`), `radius` (`sm` `md` `lg` `xl` `2xl` `full`), `shadow` (`xs` `sm` `md` `lg` `xl`).

**b. `var(--may-*)` in your own CSS** for anything the primitives don't cover. Never
hard-code a colour, radius, spacing or shadow — each one is a token:

```css
.my-panel {
  background: var(--may-color-surface);
  color: var(--may-color-text);
  border: 1px solid var(--may-color-border);
  border-radius: var(--may-radius-lg);
  padding: var(--may-space-4);
  box-shadow: var(--may-shadow-md);
  font-family: var(--may-font-sans);
}
```

Semantic tokens you will actually use — surfaces `--may-color-bg`,
`--may-color-surface`, `--may-color-surface-sunken`; text `--may-color-text`,
`--may-color-text-muted`, `--may-color-text-subtle`; lines `--may-color-border`,
`--may-color-border-strong`; brand `--may-color-brand`, `--may-color-brand-subtle`,
`--may-color-brand-text`, `--may-color-on-brand`; status `--may-color-success`,
`--may-color-warning`, `--may-color-danger`, `--may-color-info` (each with a
`-subtle` companion). Type: `--may-font-sans`, `--may-font-mono`,
`--may-font-size-md`. These all re-point automatically in dark mode; the raw ramps
(`--may-brand-500`, `--may-neutral-900`) do not, so prefer the semantic names.

### 3. Two prop vocabularies repeat everywhere

- `tone`: `brand` · `neutral` · `success` · `warning` · `danger` · `info` — on `Button`,
  `IconButton`, `Badge`, `Tag`, `Alert`, `Progress`, `Toast`.
- `size`: `sm` · `md` · `lg` — on every interactive control.

`Button` additionally takes `variant`: `solid` (the one primary action) · `soft` ·
`outline` · `ghost` · `link`.

### 4. Forms: always wrap a control in `Field`

`Field` owns the label, help text, error message, required marker and all the
`id`/`aria-describedby` wiring; controls read it from context. Passing `error` marks the
control invalid — never set `invalid` yourself.

```jsx
<Field label="Email address" description="Used for billing receipts." required>
  <Input type="email" fullWidth />
</Field>
```

### 5. Where the truth lives

Read these before styling rather than guessing: `_ds/<folder>/styles.css` and the
`_ds_bundle.css` it imports hold every token definition and component rule; each
component's `.prompt.md` and `.d.ts` under `components/<group>/<Name>/` are the
authoritative prop contracts.

### 6. An idiomatic screen

```jsx
<MayProvider theme="system">
  <Stack gap={6} style={{ padding: 'var(--may-space-8)' }}>
    <Heading level={1}>Deployments</Heading>
    <Grid minColumnWidth="260px" gap={4}>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Production</CardTitle>
            <CardDescription>Deployed 4 minutes ago.</CardDescription>
          </div>
          <Badge tone="success" dot>Live</Badge>
        </CardHeader>
        <CardBody>
          <Text tone="muted">All 14 health checks passed.</Text>
        </CardBody>
        <CardFooter>
          <Button variant="outline" tone="neutral">View logs</Button>
          <Button>Promote</Button>
        </CardFooter>
      </Card>
    </Grid>
  </Stack>
</MayProvider>
```
