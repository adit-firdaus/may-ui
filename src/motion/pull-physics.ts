/**
 * Pull-to-refresh physics, deliberately split from touch handling so it can be
 * unit-tested without simulating a single pointer event.
 */

import { easeOutCubic } from 'easing-utils'

export type PullStatus = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'complete'

export interface PullConfig {
  /** Distance at which releasing triggers a refresh. */
  threshold?: number
  /** Hard ceiling; the damping curve approaches this asymptotically. */
  max?: number
}

/**
 * Damp a raw pull distance. Linear until roughly a third of the threshold,
 * then increasingly resistant, so the start feels direct and the end feels
 * like it is being held back.
 */
export function dampPull(distance: number, { threshold = 64, max = 140 }: PullConfig = {}): number {
  if (distance <= 0) return 0
  const soft = threshold / 3
  if (distance <= soft) return distance
  const over = distance - soft
  const room = max - soft
  return soft + room * easeOutCubic(Math.min(1, over / (room * 1.8)))
}

export function resolvePullStatus(
  damped: number,
  isRefreshing: boolean,
  { threshold = 64 }: PullConfig = {},
): PullStatus {
  if (isRefreshing) return 'refreshing'
  if (damped <= 0) return 'idle'
  return damped >= threshold ? 'ready' : 'pulling'
}

export function shouldTriggerRefresh(
  damped: number,
  velocity: number,
  { threshold = 64 }: PullConfig = {},
): boolean {
  // A decisive flick counts even if it stopped short of the line.
  return damped >= threshold || (damped >= threshold * 0.6 && velocity > 0.5)
}

/** 0→1 progress for the spinner arc, so it fills as the pull approaches the threshold. */
export function pullProgress(damped: number, { threshold = 64 }: PullConfig = {}): number {
  return Math.min(1, damped / threshold)
}
