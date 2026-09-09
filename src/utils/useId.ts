import { useId as useReactId } from 'react'

/** Stable id for label/description wiring, with an optional caller override. */
export function useAutoId(provided?: string): string {
  const generated = useReactId()
  return provided ?? `may-${generated.replace(/:/g, '')}`
}
