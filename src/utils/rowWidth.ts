/**
 * The width one row of an element's children needs.
 *
 * For a row that refuses to shrink — `flex-shrink: 0` keys, buttons that do
 * not wrap — this is the honest requirement, and it stays readable while the
 * row is already overflowing, because the children keep their natural widths.
 *
 * Measured rather than derived from tokens: the sizes are in `rem`, so a
 * reader at 200% text needs a proportionally wider row and no constant can
 * stand in for it. Not `scrollWidth` either, which clamps to the client width
 * whenever the content fits and so reports a roomy row's container as its
 * requirement.
 */
export function rowWidth(row: Element): number {
  const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
  const run = [...row.children].reduce(
    (sum, child) => sum + child.getBoundingClientRect().width,
    0,
  )
  // Rounded up, so sub-pixel jitter cannot re-render on every resize tick.
  return Math.ceil(run + gap * (row.children.length - 1))
}
