import { useState } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Field,
  Grid,
  Input,
  List,
  ListRow,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  toast,
} from '@adit_firdaus/may-ui'
import { Configurator } from '../Configurator'

export default function PlaygroundPage() {
  const [width, setWidth] = useState('wide')
  return (
    <main className="site-playground">
      <header className="site-playground__header">
        <div><Text variant="caption-1" tone="tint" weight="semibold">PROVIDER LAB</Text><h1 tabIndex={-1}>Configure the whole system.</h1><Text tone="secondary">Every control changes the real MayProvider around this site.</Text></div>
        <SegmentedControl options={[{ label: 'Phone', value: 'phone' }, { label: 'Tablet', value: 'tablet' }, { label: 'Wide', value: 'wide' }]} value={width} onValueChange={setWidth} aria-label="Canvas width" />
      </header>
      <div className="site-playground__layout">
        <div className={`site-playground__canvas site-playground__canvas--${width}`}>
          <Stack gap={6}>
            <div className="site-demo-profile"><Avatar name="Ada Lovelace" size="lg" /><div><CardTitle>Design Systems</CardTitle><Text tone="secondary">A representative May UI canvas</Text></div><Badge count={12} /></div>
            <Alert tone="tint" title="Provider configuration is live">Change tokens and defaults in the panel; this canvas and the site chrome update together.</Alert>
            <Grid minColumnWidth="16rem" gap={4}>
              <Card><CardBody><Stack gap={3}><CardTitle>Create project</CardTitle><Field label="Name"><Input defaultValue="May UI Website" /></Field><Switch defaultChecked>Private preview</Switch><Button onClick={() => toast.success('Project created')}>Create</Button></Stack></CardBody></Card>
              <List header="Preferences"><ListRow title="Appearance" detail="Provider controlled" /><ListRow title="Motion" detail="System" /><ListRow title="Notifications" accessory={<Checkbox defaultChecked aria-label="Notifications enabled" />} /></List>
            </Grid>
          </Stack>
        </div>
        <aside className="site-playground__config"><Configurator /></aside>
      </div>
    </main>
  )
}
