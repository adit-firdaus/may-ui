export { Toast, toast, dismiss, dismissAll, useToast, setToastLimit } from './Toast'
export type {
  ToastProps,
  ToastAction,
  ToastOptions,
  ToastRecord,
  ToastPosition,
  ToastFn,
  UseToastResult,
} from './Toast'

/*
 * The host ships from here too: `toast()` is useless without a mount point, and
 * a consumer should not have to discover a second import path to make the first
 * one work. Re-exported from the module MayHost/index re-exports as well, so
 * the two barrels resolve to one binding rather than colliding in `src/index`.
 */
export { MayHost } from '../MayHost/MayHost'
export type { MayHostProps } from '../MayHost/MayHost'
