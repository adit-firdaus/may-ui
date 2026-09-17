import componentCss from './SearchField.css?inline'
import { SearchField as SearchFieldBase } from './SearchField'
import { mayStyled } from '../../styles/runtime'

export const SearchField = /*#__PURE__*/ mayStyled('SearchField', SearchFieldBase, componentCss)
export type { SearchFieldProps, SearchFieldSize } from './SearchField'
