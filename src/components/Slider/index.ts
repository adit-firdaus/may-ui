import componentCss from './Slider.css?inline'
import { Slider as SliderBase } from './Slider'
import { mayStyled } from '../../styles/runtime'

export const Slider = /*#__PURE__*/ mayStyled('Slider', SliderBase, componentCss)
export type { SliderProps } from './Slider'
