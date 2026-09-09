/**
 * May UI — public entry point.
 *
 * Import the stylesheet once, at the root of your app:
 *   import 'mayui/styles.css'
 * then wrap your tree in <MayProvider>.
 */

export * from './types'
export { cx } from './utils/cx'

// Foundation
export * from './components/MayProvider'

// Layout
export * from './components/Box'
export * from './components/Stack'
export * from './components/Grid'
export * from './components/Divider'

// Typography
export * from './components/Heading'
export * from './components/Text'

// Actions
export * from './components/Button'
export * from './components/IconButton'
export * from './components/ButtonGroup'

// Forms
export * from './components/Field'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Switch'

// Data display
export * from './components/Card'
export * from './components/Badge'
export * from './components/Tag'
export * from './components/Avatar'
export * from './components/Table'
export * from './components/Alert'
export * from './components/Progress'
export * from './components/Spinner'
export * from './components/Skeleton'

// Navigation & disclosure
export * from './components/Tabs'
export * from './components/Accordion'
export * from './components/Breadcrumb'
export * from './components/Pagination'

// Overlays
export * from './components/Tooltip'
export * from './components/Modal'
export * from './components/Drawer'
export * from './components/Toast'
