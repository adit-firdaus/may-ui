import type { ReactNode } from 'react'
import type { MayProviderProps } from '@adit_firdaus/may-ui'

export type SiteProviderConfig = Pick<
  MayProviderProps,
  'theme' | 'components' | 'platform' | 'host'
>

export interface CatalogProp {
  name: string
  description: string
  required: boolean
  type: string
  defaultValue: string | null
}

export interface CatalogControl {
  prop: string
  kind: 'boolean' | 'number' | 'string' | 'enum'
  options: string[]
  defaultValue: string | number | boolean | null
  providerDefault: boolean
  description: string
}

export interface CatalogEntry {
  name: string
  slug: string
  family: 'adaptive' | 'desktop' | 'mobile'
  category: string
  description: string
  importPath: string
  source: string
  props: CatalogProp[]
  controls: CatalogControl[]
  related: string[]
}

export type CatalogSummary = Omit<CatalogEntry, 'props' | 'source' | 'related'>

export interface SearchItem {
  id: string
  label: string
  description?: string
  href: string
  group: 'Navigate' | 'Components' | 'Patterns'
  icon?: ReactNode
}
