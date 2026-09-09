import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem } from './Accordion'

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Accordion {...args} defaultValue={['billing']}>
        <AccordionItem value="billing" title="How does billing work?">
          You are charged monthly for the seats in use on the first of each month. Adding a seat
          mid-cycle is prorated.
        </AccordionItem>
        <AccordionItem value="cancel" title="Can I cancel at any time?">
          Yes. Your workspace stays active until the end of the paid period, then moves to the free
          plan.
        </AccordionItem>
        <AccordionItem value="refund" title="Do you offer refunds?">
          We refund the current month in full if you cancel within 14 days of a charge.
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Multiple: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Accordion multiple defaultValue={['a', 'b']}>
        <AccordionItem value="a" title="First section" description="Open by default">
          Several sections can be open at once when `multiple` is set.
        </AccordionItem>
        <AccordionItem value="b" title="Second section" description="Also open">
          Toggling one does not close the others.
        </AccordionItem>
        <AccordionItem value="c" title="Third section">
          This one starts closed.
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Borderless: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Accordion bordered={false} defaultValue={['one']}>
        <AccordionItem value="one" title="Without a container">Useful inside a card.</AccordionItem>
        <AccordionItem value="two" title="Second item">No outer border or separators.</AccordionItem>
      </Accordion>
    </div>
  ),
}
