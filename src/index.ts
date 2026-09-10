/**
 * May UI — an Apple-native React design system.
 *
 * Import the stylesheet once at the root of your app:
 *   import 'mayui/styles.css'
 * then wrap your tree in <MayProvider>. Mount <MayHost/> once for the
 * imperative surfaces (toasts).
 *
 * These are the ADAPTIVE components: one per concern, reshaping at the
 * breakpoint. Sheet rises from the bottom edge on phones and presents as a
 * centred dialog on desktop; ActionSheet becomes an anchored menu; Table
 * collapses into grouped list rows. Reach for mayui/desktop or mayui/mobile
 * when you want a shape that only makes sense on one of them.
 */

export * from './types'
export { cx } from './utils/cx'
export * from './hooks'
export * as motion from './motion'

// Foundation
export * from './components/MayProvider'
export * from './components/MayHost'

// Layout
export * from './components/Box'
export * from './components/Stack'
export * from './components/Grid'
export * from './components/Separator'
export * from './components/SafeArea'
export * from './components/ScrollArea'
export * from './components/VisuallyHidden'

// Typography
export * from './components/Text'
export * from './components/Heading'
export * from './components/Label'
export * from './components/Kbd'

// Actions
export * from './components/Button'
export * from './components/IconButton'
export * from './components/ButtonGroup'
export * from './components/Toolbar'
export * from './components/Fab'

// Forms
export * from './components/Field'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/SearchField'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/RadioGroup'
export * from './components/Switch'
export * from './components/Slider'
export * from './components/Stepper'

// Containment
export * from './components/Card'
export * from './components/List'
export * from './components/Accordion'
export * from './components/Collapsible'
export * from './components/Descriptions'
export * from './components/EmptyState'

// Data display
export * from './components/Table'
export * from './components/Badge'
export * from './components/Tag'
export * from './components/Avatar'
export * from './components/IconTile'
export * from './components/Statistic'

// Feedback
export * from './components/Alert'
export * from './components/NoticeBar'
export * from './components/Progress'
export * from './components/Spinner'
export * from './components/Skeleton'
export * from './components/Toast'

// Navigation
export * from './components/NavigationBar'
export * from './components/Tabs'
export * from './components/SegmentedControl'
export * from './components/Breadcrumb'
export * from './components/Pagination'
export * from './components/Steps'

// Overlays
export * from './components/Sheet'
export * from './components/Modal'
export * from './components/ActionSheet'
export * from './components/AlertDialog'
export * from './components/Popover'
export * from './components/Tooltip'
export * from './components/Menu'
