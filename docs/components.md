# Components

Three families, three entry points. For props, states and live examples, open
**[Storybook](https://adit-firdaus.github.io/may-ui/storybook/)** — it is the
per-component reference. This page is the map.

## Choosing a family

- **Adaptive** (`@adit_firdaus/may-ui`) — start here. One component per concern,
  reshaping at the breakpoint on its own.
- **Desktop** (`@adit_firdaus/may-ui/desktop`) — shapes with no honest phone
  form: a sidebar, a command palette, a data table.
- **Mobile** (`@adit_firdaus/may-ui/mobile`) — shapes with no desktop meaning: a
  bottom tab bar, pull-to-refresh, swipe actions.

Importing `@adit_firdaus/may-ui` never pulls the desktop or mobile code into your
bundle — each family is a separate entry.

## Adaptive — `@adit_firdaus/may-ui`

| Group | Components |
|---|---|
| Foundation | `MayProvider`, `MayHost`, `useMayTheme`, `PlatformProvider`, `usePlatform`, `useIsDesktop` |
| Layout | `Box`, `Stack`, `Grid`, `Separator`, `SafeArea`, `ScrollArea` |
| Typography | `Heading`, `Text`, `Label`, `Kbd` |
| Actions | `Button`, `IconButton`, `ButtonGroup`, `Fab`, `Toolbar`, `ToolbarSpacer` |
| Forms | `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `Stepper`, `SearchField`, `SegmentedControl` |
| Data display | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`, `Badge`, `Tag`, `Avatar`, `AvatarGroup`, `IconTile`, `Table`, `List`, `ListRow`, `Descriptions`, `DescriptionItem`, `Statistic`, `EmptyState` |
| Feedback | `Alert`, `NoticeBar`, `Progress`, `CircularProgress`, `Spinner`, `Skeleton`, `Toast`, `toast`, `useToast` |
| Navigation | `Tabs`, `TabList`, `Tab`, `TabPanel`, `NavigationBar`, `Breadcrumb`, `Pagination`, `Steps`, `Accordion`, `AccordionItem`, `Collapsible` |
| Overlays | `Sheet`, `Modal`, `AlertDialog`, `ActionSheet`, `Menu`, `Popover`, `Tooltip` |
| Utility | `VisuallyHidden`, `cx`, `motion`, `initialsFrom`, `usePressFeedback`, `useReducedMotion` |

## Desktop — `@adit_firdaus/may-ui/desktop`

`Sidebar`, `SidebarSection`, `SidebarItem`, `SidebarToggle`, `NavTree`,
`DataTable`, `CommandPalette`, `ContextMenu`, `SplitPane`

## Mobile — `@adit_firdaus/may-ui/mobile`

`TabBar`, `NavBar`, `SearchBar`, `PullToRefresh`, `SwipeAction`, `CapsuleTabs`,
`Selector`, `Popup`, `FloatingBubble`

## Toasts and imperative surfaces

Toasts, and dialogs opened from code, render through the single `MayHost` you
mount at the root:

```tsx
import { toast } from '@adit_firdaus/may-ui'
toast('Saved', { tone: 'success' })
```
