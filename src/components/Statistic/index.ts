import componentCss from './Statistic.css?inline'
import { Statistic as StatisticBase } from './Statistic'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Statistic', componentCss)
const componentStyles = [componentStyle] as const

export const Statistic = withMayStyles('Statistic', StatisticBase, componentStyles)
export type { StatisticProps, StatisticDirection, StatisticSize } from './Statistic'
