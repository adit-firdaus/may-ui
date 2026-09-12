import componentCss from './Selector.css?inline'
import { Selector as SelectorBase } from './Selector'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Selector', componentCss)
const componentStyles = [componentStyle] as const

export const Selector = withMayStyles('Selector', SelectorBase, componentStyles)
export type {
  SelectorProps,
  SelectorOption,
  SelectorVariant,
  SelectorSize,
  SelectorColumns,
} from './Selector'
