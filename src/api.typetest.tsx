/**
 * Negative type assertions.
 *
 * The gate typechecks `src`, which proves the library compiles — it says
 * nothing about whether a prop REFUSES what it should. A union that quietly
 * widened to `string`, or a generic that stopped threading its element's
 * props, would keep compiling and keep passing every other check here.
 *
 * Each `@ts-expect-error` below fails the build in both directions: if the
 * error disappears, TypeScript reports the directive itself as unused. That is
 * the whole mechanism — these lines are assertions, not examples.
 *
 * Not reachable from any entry, so it is never bundled; see check:size, which
 * would notice if it were.
 */
import { Button, Combobox, Modal, Text } from './index'
import { Selector } from './mobile'

// tone is a closed set of roles, not an open string
// @ts-expect-error
export const tone = <Button tone="purple">x</Button>

// size is a rung on the shared scale
// @ts-expect-error
export const size = <Button size="huge">x</Button>

// `as` threads the element's own props: an anchor's href is a string
// @ts-expect-error
export const polymorphic = <Text as="a" href={42} />

// an option without a value cannot be selected
// @ts-expect-error
export const option = <Combobox options={[{ label: 'A' }]} />

// title is a heading node, and a symbol is not one
// @ts-expect-error
export const title = <Modal title={Symbol('x')} />

// the discriminated union pairs multiple={false} with a single value
// @ts-expect-error
export const single = <Selector options={[]} multiple={false} value={['a']} />

// ...and multiple={true} with a list
// @ts-expect-error
export const multiple = <Selector options={[]} multiple value="a" />
