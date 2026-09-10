import type { Meta, StoryObj } from '@storybook/react'
import { DeviceFrame, SCREENS, type ExampleScreen } from '../examples'

/**
 * Composed screens — the proof that the 74 components fit together.
 *
 * Every per-component story shows one part in isolation; these show the parts
 * doing a job. Phone screens render inside a DeviceFrame, which supplies the
 * viewport, the safe-area insets, and the containing block that a fixed TabBar
 * pins to. Desktop screens render full-bleed, because Sidebar's rail flyout,
 * CommandPalette and ContextMenu all position against the real viewport.
 */
const meta = {
  title: 'Examples/Screens',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const render = (screen: ExampleScreen) => {
  const Screen = screen.component
  return screen.frame ? (
    <div style={{ padding: 'var(--may-space-6)', display: 'flex', justifyContent: 'center' }}>
      <DeviceFrame device={screen.frame} theme={screen.theme} label={screen.name}>
        <Screen />
      </DeviceFrame>
    </div>
  ) : (
    <Screen />
  )
}

const story = (id: string): Story => ({
  render: () => render(SCREENS.find((s) => s.id === id)!),
})

/* Phone */
export const Settings = story('settings')
export const MailInbox = story('mail-inbox')
export const MailDetail = story('mail-detail')
export const NowPlaying = story('now-playing')
export const Photos = story('photos')
export const Profile = story('profile')
export const Notifications = story('notifications')
export const Checkout = story('checkout')
export const Onboarding = story('onboarding')
export const Health = story('health')
export const Wallet = story('wallet')
export const Search = story('search')

/* Desktop */
export const AppShell = story('app-shell')
export const Analytics = story('analytics')
export const MembersAdmin = story('admin')
export const FileBrowser = story('files')
export const CommandPalette = story('command-palette')
export const Preferences = story('preferences')
export const SplitInbox = story('split-inbox')
export const Team = story('team')

/* Cross-cutting */
export const SignIn = story('auth')
export const FormShowcase = story('forms')
export const EmptyAndLoading = story('states')
export const Overlays = story('overlays')

/**
 * Every phone screen at once — the fastest way to judge whether the system
 * reads as one product rather than twelve unrelated screens.
 */
export const AllPhoneScreens: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--may-space-8)',
        padding: 'var(--may-space-6)',
        justifyContent: 'center',
      }}
    >
      {SCREENS.filter((s) => s.frame).map((screen) => {
        const Screen = screen.component
        return (
          <DeviceFrame key={screen.id} device="phone" theme={screen.theme} label={screen.name}>
            <Screen />
          </DeviceFrame>
        )
      })}
    </div>
  ),
}
