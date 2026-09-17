import componentCss from './Combobox.css?inline'
import { Combobox as ComboboxBase } from './Combobox'
import { mayStyled } from '../../styles/runtime'

export const Combobox = /*#__PURE__*/ mayStyled('Combobox', ComboboxBase, componentCss)
export type { ComboboxProps, ComboboxOption } from './Combobox'
