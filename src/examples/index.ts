/**
 * mayui/examples — composed screens.
 *
 * These are not part of the component library. They exist to prove the system
 * composes, to be browsed in Storybook and the gallery app, and to be uploaded
 * to Claude Design as Pattern cards so a design agent sees whole screens rather
 * than isolated widgets.
 *
 * They are a separate build entry, so importing `mayui` never pulls one in.
 */

import type { ComponentType, ReactNode } from 'react'
import { mayStyleSheet, withMayStyles } from '../styles/runtime'
import deviceFrameCss from './DeviceFrame.css?inline'
import photosCss from './PhotosScreen.css?inline'
import splitInboxCss from './SplitInboxScreen.css?inline'
import catalogAdaptiveCss from './CatalogAdaptive.css?inline'
import catalogMobileCss from './CatalogMobile.css?inline'

import { DeviceFrame as DeviceFrameBase } from './DeviceFrame'
import { PhotosScreen as PhotosScreenBase } from './PhotosScreen'
import { SplitInboxScreen as SplitInboxScreenBase } from './SplitInboxScreen'
import { CatalogAdaptive as CatalogAdaptiveBase } from './CatalogAdaptive'
import { CatalogMobile as CatalogMobileBase } from './CatalogMobile'

export const DeviceFrame = withMayStyles(
  'DeviceFrame',
  DeviceFrameBase,
  [mayStyleSheet('DeviceFrame', deviceFrameCss)],
)
export const PhotosScreen = withMayStyles(
  'PhotosScreen',
  PhotosScreenBase,
  [mayStyleSheet('PhotosScreen', photosCss)],
)
export const SplitInboxScreen = withMayStyles(
  'SplitInboxScreen',
  SplitInboxScreenBase,
  [mayStyleSheet('SplitInboxScreen', splitInboxCss)],
)
export const CatalogAdaptive = withMayStyles(
  'CatalogAdaptive',
  CatalogAdaptiveBase,
  [mayStyleSheet('CatalogAdaptive', catalogAdaptiveCss)],
)
export const CatalogMobile = withMayStyles(
  'CatalogMobile',
  CatalogMobileBase,
  [mayStyleSheet('CatalogMobile', catalogMobileCss)],
)
export type { DeviceFrameProps } from './DeviceFrame'

// Phone
export { SettingsScreen } from './SettingsScreen'
export { MailInboxScreen } from './MailInboxScreen'
export { MailDetailScreen } from './MailDetailScreen'
export { NowPlayingScreen } from './NowPlayingScreen'
export { ProfileScreen } from './ProfileScreen'
export { NotificationsScreen } from './NotificationsScreen'
export { CheckoutScreen } from './CheckoutScreen'
export { OnboardingScreen } from './OnboardingScreen'
export { HealthScreen } from './HealthScreen'
export { WalletScreen } from './WalletScreen'
export { SearchScreen } from './SearchScreen'

// Desktop
export { AppShellScreen } from './AppShellScreen'
export { AnalyticsDashboardScreen } from './AnalyticsDashboardScreen'
export { DataTableAdminScreen } from './DataTableAdminScreen'
export { FileBrowserScreen } from './FileBrowserScreen'
export { CommandPaletteScreen } from './CommandPaletteScreen'
export { PreferencesScreen } from './PreferencesScreen'
export { TeamScreen } from './TeamScreen'

// Cross-cutting
export { AuthScreen } from './AuthScreen'
export { FormShowcaseScreen } from './FormShowcaseScreen'
export { StatesScreen } from './StatesScreen'
export { OverlaysScreen } from './OverlaysScreen'

// Catalogs
export { CatalogDesktop } from './CatalogDesktop'

import { SettingsScreen } from './SettingsScreen'
import { MailInboxScreen } from './MailInboxScreen'
import { MailDetailScreen } from './MailDetailScreen'
import { NowPlayingScreen } from './NowPlayingScreen'
import { ProfileScreen } from './ProfileScreen'
import { NotificationsScreen } from './NotificationsScreen'
import { CheckoutScreen } from './CheckoutScreen'
import { OnboardingScreen } from './OnboardingScreen'
import { HealthScreen } from './HealthScreen'
import { WalletScreen } from './WalletScreen'
import { SearchScreen } from './SearchScreen'
import { AppShellScreen } from './AppShellScreen'
import { AnalyticsDashboardScreen } from './AnalyticsDashboardScreen'
import { DataTableAdminScreen } from './DataTableAdminScreen'
import { FileBrowserScreen } from './FileBrowserScreen'
import { CommandPaletteScreen } from './CommandPaletteScreen'
import { PreferencesScreen } from './PreferencesScreen'
import { TeamScreen } from './TeamScreen'
import { AuthScreen } from './AuthScreen'
import { FormShowcaseScreen } from './FormShowcaseScreen'
import { StatesScreen } from './StatesScreen'
import { OverlaysScreen } from './OverlaysScreen'
import { CatalogDesktop } from './CatalogDesktop'

export interface ExampleScreen {
  id: string
  name: string
  group: 'phone' | 'desktop' | 'cross' | 'catalog'
  component: ComponentType
  /**
   * Render inside a DeviceFrame of this size. Phone screens need it: it supplies
   * the viewport, the safe-area insets, and the containing block a fixed TabBar
   * pins to. Desktop screens must NOT be framed — Sidebar's rail flyout,
   * CommandPalette and ContextMenu all position against the real viewport.
   */
  frame?: 'phone' | 'phone-large' | 'tablet'
  /** Pin the frame's appearance, for screens designed dark. */
  theme?: 'light' | 'dark'
  icon?: ReactNode
  badge?: number
}

/** Every example, in the order the gallery lists them. */
export const SCREENS: ExampleScreen[] = [
  { id: 'settings', name: 'Settings', group: 'phone', component: SettingsScreen, frame: 'phone' },
  { id: 'mail-inbox', name: 'Mail Inbox', group: 'phone', component: MailInboxScreen, frame: 'phone' },
  { id: 'mail-detail', name: 'Mail Detail', group: 'phone', component: MailDetailScreen, frame: 'phone' },
  { id: 'now-playing', name: 'Now Playing', group: 'phone', component: NowPlayingScreen, frame: 'phone', theme: 'dark' },
  { id: 'photos', name: 'Photos', group: 'phone', component: PhotosScreen, frame: 'phone' },
  { id: 'profile', name: 'Profile', group: 'phone', component: ProfileScreen, frame: 'phone' },
  { id: 'notifications', name: 'Notifications', group: 'phone', component: NotificationsScreen, frame: 'phone' },
  { id: 'checkout', name: 'Checkout', group: 'phone', component: CheckoutScreen, frame: 'phone' },
  { id: 'onboarding', name: 'Onboarding', group: 'phone', component: OnboardingScreen, frame: 'phone' },
  { id: 'health', name: 'Health', group: 'phone', component: HealthScreen, frame: 'phone' },
  { id: 'wallet', name: 'Wallet', group: 'phone', component: WalletScreen, frame: 'phone' },
  { id: 'search', name: 'Search', group: 'phone', component: SearchScreen, frame: 'phone' },

  { id: 'app-shell', name: 'App Shell', group: 'desktop', component: AppShellScreen },
  { id: 'analytics', name: 'Analytics', group: 'desktop', component: AnalyticsDashboardScreen },
  { id: 'admin', name: 'Members Admin', group: 'desktop', component: DataTableAdminScreen },
  { id: 'files', name: 'File Browser', group: 'desktop', component: FileBrowserScreen },
  { id: 'command-palette', name: 'Command Palette', group: 'desktop', component: CommandPaletteScreen },
  { id: 'preferences', name: 'Preferences', group: 'desktop', component: PreferencesScreen },
  { id: 'split-inbox', name: 'Split Inbox', group: 'desktop', component: SplitInboxScreen },
  { id: 'team', name: 'Team', group: 'desktop', component: TeamScreen },

  { id: 'auth', name: 'Sign In', group: 'cross', component: AuthScreen },
  { id: 'forms', name: 'Form Showcase', group: 'cross', component: FormShowcaseScreen },
  { id: 'states', name: 'Empty & Loading', group: 'cross', component: StatesScreen },
  { id: 'overlays', name: 'Overlays', group: 'cross', component: OverlaysScreen },

  { id: 'catalog-adaptive', name: 'Adaptive (59)', group: 'catalog', component: CatalogAdaptive },
  { id: 'catalog-desktop', name: 'Desktop (6)', group: 'catalog', component: CatalogDesktop },
  { id: 'catalog-mobile', name: 'Mobile (9)', group: 'catalog', component: CatalogMobile },
]
