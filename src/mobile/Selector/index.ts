import componentCss from './Selector.css?inline'
import { Selector as SelectorBase } from './Selector'
import { mayStyled } from '../../styles/runtime'

export const Selector = /*#__PURE__*/ mayStyled('Selector', SelectorBase, componentCss)
export type {
  SelectorProps,
  SelectorOption,
  SelectorVariant,
  SelectorSize,
  SelectorColumns,
} from './Selector'
