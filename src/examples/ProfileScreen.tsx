import { useState } from 'react'
import { IoCard, IoNavigate, IoPencil, IoPeople, IoStar } from 'react-icons/io5'
import { AlertDialog } from '../components/AlertDialog'
import { Avatar, AvatarGroup } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { DescriptionItem, Descriptions } from '../components/Descriptions'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { Progress } from '../components/Progress'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { NavBar } from '../mobile/NavBar'

/** iCloud+ 200 GB, and what this account has actually put in it. */
const STORAGE_TOTAL = 200
const STORAGE_USED = 137.4

/**
 * The Apple Account screen.
 *
 * It is four grouped sections stacked in one scroller, which is the shape every
 * Settings detail view in iOS takes: identity on top, read-only facts, actions,
 * then the one destructive thing — alone at the bottom, far from anything a
 * thumb reaches for by accident.
 *
 * The interesting composition is which container carries which job.
 * `Descriptions` holds the facts, because a label/value pair is a `<dl>` and a
 * screen reader should announce "Serial Number, F2LW48ZXQ1M9" as one term and
 * its definition. `List` holds the destinations, because those are buttons.
 * `Card` holds the storage meter, because a bar with its own actions is a
 * self-contained panel rather than a row.
 */
export function ProfileScreen() {
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--may-color-bg)' }}>
      {/* NavBar sticks inside this pane — a sticky bar needs a scrolling
       * ancestor, and the flex column outside it never scrolls. */}
      <div data-slot="scroll-area" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <NavBar title="Apple Account" onBack={() => {}} backLabel="Settings" />

        <Stack
          gap={5}
          style={{
            padding: `var(--may-space-4) var(--may-space-4)
              calc(var(--may-inset-bottom) + var(--may-space-8))`,
          }}
        >
          {/* Identity. Centred rather than a row: at 390pt a portrait, a full
           * name and a 30-character email do not fit side by side without one
           * of the three truncating, and the name is not negotiable. */}
          <Box surface="base" radius="card" padding={5}>
            <Stack align="center" gap={3}>
              <Avatar size="xl" name="Priya Raghunathan" />
              <Stack align="center" gap={0}>
                <Text variant="title-2">Priya Raghunathan</Text>
                <Text variant="subheadline" tone="secondary">
                  priya.raghunathan@icloud.com
                </Text>
              </Stack>
              <Button variant="tinted" size="sm" pill leadingIcon={<IoPencil aria-hidden />}>
                Edit Profile
              </Button>
            </Stack>
          </Box>

          {/* Facts, not destinations: no row here is tappable, so none of them
           * gets a chevron. */}
          <Descriptions header="Device" footer="This iPhone was activated on 22 September 2025.">
            <DescriptionItem label="Model" value="iPhone 16 Pro" />
            <DescriptionItem label="Serial Number" value="F2LW48ZXQ1M9" />
            <DescriptionItem label="Capacity" value="256 GB" />
            <DescriptionItem label="iOS Version" value="18.6.1" />
            <DescriptionItem label="Warranty" value="AppleCare+ until 3 Mar 2027" />
          </Descriptions>

          <List header="Account">
            <ListRow
              leading={
                <IconTile gradient="blue">
                  <IoCard aria-hidden />
                </IconTile>
              }
              title="Payment & Shipping"
              detail="Apple Card"
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="indigo">
                  <IoStar aria-hidden />
                </IconTile>
              }
              title="Subscriptions"
              detail="3"
              onClick={() => {}}
            />
            {/*
             * An `accessory` suppresses the chevron — deliberately. The faces
             * ARE the row's value, and a chevron beside them would promise a
             * second, different destination. The row is still a real button.
             */}
            <ListRow
              leading={
                <IconTile gradient="green">
                  <IoPeople aria-hidden />
                </IconTile>
              }
              title="Family Sharing"
              subtitle="4 members"
              accessory={
                <AvatarGroup max={3} size="sm">
                  <Avatar name="Devan Raghunathan" />
                  <Avatar name="Anika Raghunathan" />
                  <Avatar name="Leo Mbeki" />
                  <Avatar name="Sofia Marchetti" />
                </AvatarGroup>
              }
              onClick={() => {}}
            />
            <ListRow
              leading={
                <IconTile gradient="teal">
                  <IoNavigate aria-hidden />
                </IconTile>
              }
              title="Find My"
              detail="On"
              onClick={() => {}}
            />
          </List>

          {/* A meter with its own actions is a panel, so it is a Card and not a
           * row: the bar, its breakdown and the button that acts on all of it
           * belong to one another. */}
          <Card>
            <CardHeader accessory={<Badge tone="tint">iCloud+</Badge>}>
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardBody>
              <Stack gap={3}>
                {/*
                 * `formatValue` overrides the printed percentage AND
                 * aria-valuetext, so this is announced as "137.4 GB of 200 GB"
                 * rather than as "69 percent" — which for a storage bar is the
                 * number nobody is looking for.
                 */}
                <Progress
                  label="iCloud Storage"
                  value={STORAGE_USED}
                  max={STORAGE_TOTAL}
                  showValue
                  formatValue={(used, total) => `${used} GB of ${total} GB`}
                />
                <Stack direction="row" gap={4} wrap>
                  <Badge dot tone="tint" size="sm">
                    Photos · 84.2 GB
                  </Badge>
                  <Badge dot tone="success" size="sm">
                    Backups · 38.6 GB
                  </Badge>
                  <Badge dot tone="warning" size="sm">
                    Docs · 14.6 GB
                  </Badge>
                </Stack>
              </Stack>
            </CardBody>
            <CardFooter>
              <Button variant="tinted" fullWidth>
                Manage Storage
              </Button>
            </CardFooter>
          </Card>

          {/* Alone in its own group, with the whole width of the screen between
           * it and the last thing anyone tapped. */}
          <List footer="Signing out removes iCloud Photos, Notes and Messages from this iPhone. Nothing is deleted from iCloud.">
            <ListRow title="Sign Out" destructive onClick={() => setSignOutOpen(true)} />
          </List>
        </Stack>
      </div>

      {/*
       * An alert, not a sheet: there is a decision to make and clicking away is
       * not one of the two answers. `destructive` paints the confirm button red
       * and opens with Cancel focused, so a stray Return does not sign anyone
       * out.
       */}
      <AlertDialog
        open={signOutOpen}
        title="Sign out of your Apple Account?"
        description="Photos, Notes and Messages stored in iCloud will be removed from this iPhone. They stay in iCloud."
        confirmLabel="Sign Out"
        destructive
        onConfirm={() => setSignOutOpen(false)}
        onCancel={() => setSignOutOpen(false)}
      />
    </div>
  )
}
