import componentCss from './Skeleton.css?inline'
import { Skeleton as SkeletonBase } from './Skeleton'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Skeleton', componentCss)
const componentStyles = [componentStyle] as const

export const Skeleton = withMayStyles('Skeleton', SkeletonBase, componentStyles)
export type { SkeletonProps, SkeletonRadius, SkeletonVariant } from './Skeleton'
