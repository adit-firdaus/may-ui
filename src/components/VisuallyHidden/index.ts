import componentCss from './VisuallyHidden.css?inline'
import { VisuallyHidden as VisuallyHiddenBase } from './VisuallyHidden'
import { mayStyled } from '../../styles/runtime'

export const VisuallyHidden = /*#__PURE__*/ mayStyled('VisuallyHidden', VisuallyHiddenBase, componentCss)
export type { VisuallyHiddenProps } from './VisuallyHidden'
