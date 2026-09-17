import componentCss from './Popover.css?inline'
import { Popover as PopoverBase } from './Popover'
import { mayStyled } from '../../styles/runtime'

export const Popover = /*#__PURE__*/ mayStyled('Popover', PopoverBase, componentCss)
export type {
  PopoverProps,
  PopoverPlacement,
  PopoverSide,
  PopoverAlign,
} from './Popover'
