import componentCss from './Progress.css?inline'
import { Progress as ProgressBase, CircularProgress as CircularProgressBase } from './Progress'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Progress', componentCss)
const componentStyles = [componentStyle] as const

export const Progress = /*#__PURE__*/ mayStyled('Progress', ProgressBase, componentStyles)
export const CircularProgress = /*#__PURE__*/ mayStyled('CircularProgress', CircularProgressBase, componentStyles)
export type { ProgressProps, CircularProgressProps } from './Progress'
