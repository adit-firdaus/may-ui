import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Drawer } from './Drawer'
import { Button } from '../Button/Button'
import { Field } from '../Field/Field'
import { Input } from '../Input/Input'
import { Select } from '../Select/Select'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import type { DrawerSide } from './Drawer'

const meta = {
  title: 'Overlays/Drawer',
  component: Drawer,
  args: { open: false, onClose: () => {} },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit settings</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Project settings"
          description="Changes apply to the next deployment."
          footer={
            <>
              <Button variant="ghost" tone="neutral" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <Stack gap={5}>
            <Field label="Project name"><Input fullWidth defaultValue="mayui" /></Field>
            <Field label="Region" description="Where builds and functions run.">
              <Select
                fullWidth
                defaultValue="sfo"
                options={[
                  { label: 'San Francisco', value: 'sfo' },
                  { label: 'Frankfurt', value: 'fra' },
                  { label: 'Singapore', value: 'sin' },
                ]}
              />
            </Field>
          </Stack>
        </Drawer>
      </>
    )
  },
}

export const Sides: Story = {
  render: () => {
    const [side, setSide] = useState<DrawerSide | null>(null)
    return (
      <>
        <Stack direction="horizontal" gap={2}>
          {(['left', 'right', 'top', 'bottom'] as const).map((s) => (
            <Button key={s} variant="outline" tone="neutral" onClick={() => setSide(s)}>{s}</Button>
          ))}
        </Stack>
        <Drawer
          open={side !== null}
          onClose={() => setSide(null)}
          side={side ?? 'right'}
          title={`Slides in from the ${side}`}
          footer={<Button onClick={() => setSide(null)}>Close</Button>}
        >
          <Text tone="muted">Left and right panels are sized by width; top and bottom by height.</Text>
        </Drawer>
      </>
    )
  },
}
