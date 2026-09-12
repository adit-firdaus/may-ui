import componentCss from './SearchField.css?inline'
import { SearchField as SearchFieldBase } from './SearchField'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SearchField', componentCss)
const componentStyles = [componentStyle] as const

export const SearchField = withMayStyles('SearchField', SearchFieldBase, componentStyles)
export type { SearchFieldProps, SearchFieldSize } from './SearchField'
