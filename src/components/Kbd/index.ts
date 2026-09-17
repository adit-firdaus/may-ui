import componentCss from './Kbd.css?inline'
import { Kbd as KbdBase } from './Kbd'
import { mayStyled } from '../../styles/runtime'

export const Kbd = /*#__PURE__*/ mayStyled('Kbd', KbdBase, componentCss)
export type { KbdProps } from './Kbd'
