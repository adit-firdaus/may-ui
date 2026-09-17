import componentCss from './SearchBar.css?inline'
import { SearchBar as SearchBarBase } from './SearchBar'
import { mayStyled } from '../../styles/runtime'

export const SearchBar = /*#__PURE__*/ mayStyled('SearchBar', SearchBarBase, componentCss)
export type { SearchBarProps, SearchBarSize, SearchBarCancel } from './SearchBar'
