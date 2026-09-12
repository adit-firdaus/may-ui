import componentCss from './Tag.css?inline'
import { Tag as TagBase } from './Tag'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Tag', componentCss)
const componentStyles = [componentStyle] as const

export const Tag = withMayStyles('Tag', TagBase, componentStyles)
export type { TagProps, TagSize } from './Tag'
