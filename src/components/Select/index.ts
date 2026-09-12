import componentCss from './Select.css?inline'
import { Select as SelectBase } from './Select'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Select', componentCss)
const componentStyles = [componentStyle] as const

export const Select = withMayStyles('Select', SelectBase, componentStyles)
export type { SelectProps, SelectOption } from './Select'
