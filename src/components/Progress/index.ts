import componentCss from './Progress.css?inline'
import { Progress as ProgressBase, CircularProgress as CircularProgressBase } from './Progress'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Progress', componentCss)
const componentStyles = [componentStyle] as const

export const Progress = withMayStyles('Progress', ProgressBase, componentStyles)
export const CircularProgress = withMayStyles('CircularProgress', CircularProgressBase, componentStyles)
export type { ProgressProps, CircularProgressProps } from './Progress'
