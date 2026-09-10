import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Steps } from './Steps'

const SETUP = [
  { title: 'Apple ID', description: 'Sign in to restore your apps and data.' },
  { title: 'Face ID', description: 'Look straight at the camera to enrol.' },
  { title: 'Apple Pay', description: 'Add a card to use in stores and apps.' },
  { title: 'Done', description: 'Your iPhone is ready to use.' },
]

const meta = {
  title: 'Catalog/Adaptive/Steps',
  component: Steps,
  args: { items: SETUP, current: 1 },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Steps>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The connector is a track with a fill that grows along it as each step
 * completes — the growth is what reads as progress, not the colour.
 */
export const Horizontal: Story = {
  args: {
    items: SETUP.map(({ title }) => ({ title })),
    current: 2,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Steps {...args} />
    </div>
  ),
}

/** Vertical is the shape with room for descriptions — a setup checklist. */
export const Vertical: Story = {
  args: { orientation: 'vertical', current: 2 },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Steps {...args} />
    </div>
  ),
}

/**
 * With `clickable`, ground already covered can be pressed to go back to it.
 * Steps ahead stay disabled — a stepper is not a tab strip.
 */
export const Clickable: Story = {
  render: (args) => {
    const [current, setCurrent] = useState(2)
    return (
      <div style={{ maxWidth: 420 }}>
        <Steps {...args} orientation="vertical" clickable current={current} onStepChange={setCurrent} />
      </div>
    )
  },
}

/** `status` on an item overrides what the index implies — nothing about an
 * index says a step failed. */
export const WithError: Story = {
  args: {
    orientation: 'vertical',
    current: 2,
    items: [
      { title: 'Prepare update', description: 'iOS 18.4 — 2.1 GB' },
      { title: 'Download', description: 'Downloaded over Wi-Fi' },
      { title: 'Verify', description: 'Verification failed. Tap to retry.', status: 'error' as const },
      { title: 'Install' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Steps {...args} />
    </div>
  ),
}

export const Sizes: Story = {
  args: { items: SETUP.map(({ title }) => ({ title })), current: 2 },
  render: (args) => (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-8)' }}>
      <Steps {...args} size="sm" />
      <Steps {...args} size="md" />
      <Steps {...args} size="lg" />
    </div>
  ),
}
