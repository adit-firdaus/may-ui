import componentCss from './Skeleton.css?inline'
import { Skeleton as SkeletonBase } from './Skeleton'
import { mayStyled } from '../../styles/runtime'

export const Skeleton = /*#__PURE__*/ mayStyled('Skeleton', SkeletonBase, componentCss)
export type { SkeletonProps, SkeletonRadius, SkeletonVariant } from './Skeleton'
