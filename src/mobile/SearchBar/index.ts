import componentCss from './SearchBar.css?inline'
import { SearchBar as SearchBarBase } from './SearchBar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SearchBar', componentCss)
const componentStyles = [componentStyle] as const

export const SearchBar = withMayStyles('SearchBar', SearchBarBase, componentStyles)
export type { SearchBarProps, SearchBarSize, SearchBarCancel } from './SearchBar'
