import componentCss from './Statistic.css?inline'
import { Statistic as StatisticBase } from './Statistic'
import { mayStyled } from '../../styles/runtime'

export const Statistic = /*#__PURE__*/ mayStyled('Statistic', StatisticBase, componentCss)
export type { StatisticProps, StatisticDirection, StatisticSize } from './Statistic'
