export { useReducedMotion } from './useReducedMotion'
export { useIsDesktop } from './useIsDesktop'
export { usePressFeedback } from './usePressFeedback'
export { PlatformProvider, usePlatform } from './platform'
export type { MayPlatform, PlatformProviderProps } from './platform'
// LinkComponentProvider stays internal: MayProvider already takes
// `linkComponent`, and a per-subtree override is speculative. The hook is
// public so a consumer can build their own navigational component with it.
export { useLinkComponent } from './link'
export { useKeyboardInset } from './useKeyboardInset'
