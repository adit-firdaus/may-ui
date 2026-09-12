import type { Decorator, Preview } from '@storybook/react'
import { MayProvider } from '../src/components/MayProvider'

const withMay: Decorator = (Story, context) => (
  <MayProvider
    theme={{ mode: context.globals.theme ?? 'light' }}
    host={context.title === 'Catalog/Adaptive/MayHost' ? false : undefined}
    inline
  >
    <div style={{ padding: 24, minHeight: '100%' }}>
      <Story />
    </div>
  </MayProvider>
)

const preview: Preview = {
  decorators: [withMay],
  globalTypes: {
    theme: {
      description: 'May UI theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
}

export default preview
