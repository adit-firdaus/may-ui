# Component Glue Simplification Design

## Goal

Collapse the per-component style plumbing into one utility, and make the
package tree-shakeable, without changing a single component's API, behaviour,
or appearance. Every component, feature, and visual detail stays exactly as it
is; only the glue between a component and its CSS changes.

## Evidence

The library is not tree-shakeable. Measured by packing the real tarball
(`npm pack`), installing it into a clean project, and bundling with esbuild
against externalised `react`, `react-dom`, `react-icons/io5` and `motion/react`:

| import | gzipped |
|---|---|
| `Button` alone | 68,893 |
| six components | 68,927 |
| the entire library | 70,183 |

Importing one button costs 98% of the whole library. A `Button`-only bundle
retains the CSS of roughly twenty-five unrelated components — accordion,
action-sheet, alert-dialog, avatar, breadcrumb, modal, nav-bar and the rest.

The cause is in each of the 74 component barrels:

```ts
const componentStyle = mayStyleSheet('Button', componentCss)
export const Button = withMayStyles('Button', ButtonBase, componentStyles)
```

Neither top-level call carries `/*#__PURE__*/`, and `withMayStyles` calls
`Object.defineProperty` on the value it returns, so no bundler can prove either
call droppable. All 74 pairs are retained, and each one references its CSS
string and its implementation. `sideEffects: false` does not rescue this,
because Rollup has already hoisted every component into a single 237 kB chunk
in order to serve the package's four entries.

A reverted spike confirmed the fix. Annotating both calls in all 74 barrels,
changing nothing else:

| import | before | after |
|---|---|---|
| `Button` alone | 68,893 | 22,440 |
| six components | 68,927 | 25,177 |
| the entire library | 70,183 | 70,185 |

A 67% reduction for the single-component consumer, with the full-library figure
flat — which is the control: had it dropped, something would have been shaken
out that a consumer asked for. `npm run check:provider` and the SSR smoke suite
passed unchanged under the spike.

The same 74 barrels are also the plumbing that makes the source tedious to
read: 799 lines whose only job is gluing CSS to a component, in a template that
differs between files only by a name.

## One Utility Instead Of Two

`mayStyleSheet(name, css)` and `withMayStyles(name, Component, sheets)` always
appear together and take the same `name`. They are one operation presented as
two. They merge into `mayStyled`, overloaded on the third argument:

```ts
export function mayStyled<T>(name: string, Component: T, css: string): T
export function mayStyled<T>(name: string, Component: T, sheets: readonly MayStyleSheet[]): T
```

`withMayStyles` is deleted and its body absorbed. `mayStyleSheet` remains
exported, because the borrowing barrels below still need to build a sheet they
can pass to more than one component.

The non-enumerable `__mayStyles` property that `withMayStyles` attaches must
survive the merge: `MayProvider` reads it off the wrapped component in order to
collect sheets for a host it renders itself.

## The Three Barrel Shapes

The 74 barrels are not uniform. The 24 that depart from the template are where
a mechanical pass would go wrong, so they are edited individually rather than by
script.

**50 simple barrels** — one component, its own CSS. These are the ones that
shrink, from nine lines to six:

```ts
import componentCss from './Button.css?inline'
import { Button as ButtonBase } from './Button'
import { mayStyled } from '../../styles/runtime'

export const Button = /*#__PURE__*/ mayStyled('Button', ButtonBase, componentCss)
export type { ButtonProps, ButtonVariant } from './Button'
```

**10 multi-component barrels** — several components sharing one sheet (`Card`
wraps six, `Sidebar` and `Tabs` four each, seven more wrap two). They build the
sheet once with `mayStyleSheet` and call `mayStyled` once per component. Their
shape does not change; they gain only the merged import and the annotations.

**14 borrowing barrels** — a component that needs another's CSS as well as its
own (`Toast` takes button, toast and its own; `Kbd`'s sheet is reused). These
pass an explicit array to the second overload.

Counted exactly: 50 simple, 10 multi-component, 14 borrowing. The 50 save three
lines each and the other 24 save one apiece on the merged import, so the source
reduction is 799 lines to roughly 625, about 22%. The utility merge only
collapses the simple case; the weight fix is what applies to all 74.

## Rejected: A Record-Returning Wrapper

A `mayStyledAll('Card', componentCss, { Card, CardHeader, CardTitle, ... })`
returning a destructured record would read tidier than six calls. It is
rejected because it defeats the change's main purpose: one impure call
producing six components means using `CardTitle` retains all six. Per-component
calls are what keep the purity annotation effective.

## Out Of Scope

After the annotations land, a `Button`-only import still retains checkbox,
input, label, radio, search, select, separator, switch, textarea and toast —
roughly 8 kB. Rollup groups the form controls into a shared chunk, and
`MayProvider` pulls in the toast host. Recovering that is chunk configuration
plus decoupling the provider from `Toast`, not source simplification, and it
belongs in its own spec.

No component is removed, no prop is added or renamed, no CSS is edited, and no
consumer-facing API changes. There is no new dependency and no new build step.

## Verification

The repository has no unit tests by policy; verification is `npm run verify`
plus driving Storybook.

`npm run verify` must stay at exit 0. Two of its assertions are the load-bearing
ones here — `every visual component export owns a built style resource`, which
fails if a barrel loses its sheet, and `the package emits and exports no
stylesheet`, which fails if the merge accidentally emits a CSS asset. Both held
under the spike.

The bundle measurement is recorded before and after, using the packed tarball in
a clean project as described under Evidence. `Button` should fall to roughly
22 kB gzipped.

The full-library figure is the control, but "must stay flat" was too strict a
reading of it. Deleting `withMayStyles` and the 50 `componentStyles` arrays is
real code removal, so a small drop is expected — measured at 666 bytes. What
must not change is the export count: 241 from `index.d.ts`, 32 from `desktop`,
31 from `mobile`. If those hold and `all` has only drifted by under a kilobyte,
nothing a consumer asked for was shaken out.

Storybook is driven for the three borrowing components whose sheet wiring
changes shape — `Toast`, `Kbd` and `Card` — confirming each still paints
correctly in light and dark.
