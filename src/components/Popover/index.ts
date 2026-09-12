import componentCss from './Popover.css?inline'
import { Popover as PopoverBase } from './Popover'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Popover', componentCss)
const componentStyles = [componentStyle] as const

export const Popover = withMayStyles('Popover', PopoverBase, componentStyles)
export type {
  PopoverProps,
  PopoverPlacement,
  PopoverSide,
  PopoverAlign,
} from './Popover'
