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
 * How an overlay's footer lays its actions out. See `Sheet`/`Modal`.
 */
export type MayFooterLayout = 'end' | 'stack' | 'fill'
