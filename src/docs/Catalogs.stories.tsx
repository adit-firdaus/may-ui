import type { Meta, StoryObj } from '@storybook/react'
import { CatalogAdaptive, CatalogDesktop, CatalogMobile } from '../examples'

/**
 * Every component in a family on one page.
 *
 * The per-component stories answer "how does this work"; these answer "does
 * this belong". Scrolling one page with all 59 adaptive components in the same
 * theme is how an outlier becomes obvious.
 */
const meta = {
  title: 'Examples/Catalog',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Adaptive: Story = { render: () => <CatalogAdaptive /> }
export const Desktop: Story = { render: () => <CatalogDesktop /> }
export const Mobile: Story = { render: () => <CatalogMobile /> }
