/** Semantic colour role, shared across the system. */
export type MayTone = 'tint' | 'neutral' | 'success' | 'warning' | 'danger'

/** Control size. Every rung is a proportion of `--may-control-h`. */
export type MaySize = 'xs' | 'sm' | 'md' | 'lg'

/** Apple's named text styles. */
export type MayTextStyle =
  | 'large-title'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption-1'
  | 'caption-2'

/**
 * Whether a grouped container is inset from its background or sits flat on it.
 *
 * `inset` is the iOS Settings shape — a rounded card floated off the grouped
 * background with its own margin. `plain` runs to the edges, which is what a
 * container already inside a card wants. `List`, `Accordion` and `Descriptions`
 * each spelled these two values out inline; naming them keeps one vocabulary
 * and lets a consumer write a function that takes one.
 */
export type MayInset = 'inset' | 'plain'

/**
 * How an overlay's footer lays its actions out. See `Sheet`/`Modal`.
 */
export type MayFooterLayout = 'end' | 'stack' | 'fill'
