import type { ComponentType } from 'react'
import { useRef, useState } from 'react'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { IconTile } from '../components/IconTile'
import { List, ListRow } from '../components/List'
import { NavigationBar } from '../components/NavigationBar'
import { SegmentedControl } from '../components/SegmentedControl'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'

/**
 * Wallet: the card stack, then the transactions belonging to the card on top.
 *
 * The stack is the interesting part. Each card is a plain `Box` carrying one
 * of the eleven `--may-grad-*` tokens, and the overlap is a negative block
 * margin expressed in the spacing scale — `calc(var(--may-space-8) * -1)` —
 * never a magic pixel. Paint order does the rest: a later sibling sits on top
 * of an earlier one, so the cards stack front-to-back in source order with no
 * `z-index` anywhere, and each one's `shadow="lg"` falls on the card behind
 * it exactly as it does in Wallet.
 *
 * Copy on a gradient is the one place a colour has to be stated inline, and
 * `--may-on-color` is the token for it: white-on-colour, defined once, correct
 * in both themes because a gradient does not invert when the theme does.
 */
export function WalletScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState('month')

  const shown = TRANSACTIONS.filter((t) => t.range.includes(range))

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}
      >
        <NavigationBar
          title="Wallet"
          largeTitle
          scrollRef={scrollRef}
          trailing={
            <IconButton aria-label="Scan to add a card" variant="plain">
              <ScanIcon />
            </IconButton>
          }
        />

        <Stack
          gap={5}
          style={{
            padding: 'var(--may-space-4)',
            paddingBlockStart: 'var(--may-space-2)',
            // Clears the home indicator without swallowing the page gutter.
            paddingBlockEnd: 'calc(var(--may-inset-bottom) + var(--may-space-4))',
          }}
        >
          {/* ----------------------------- the stack ------------------------- */}
          <Stack gap={0}>
            {CARDS.map((card, index) => (
              <PaymentCard
                key={card.name}
                {...card}
                overlapped={index > 0}
                covered={index < CARDS.length - 1}
              />
            ))}
          </Stack>

          <Stack align="center">
            <Button variant="tinted" pill leadingIcon={<PlusIcon />}>
              Add Card
            </Button>
          </Stack>

          {/* -------------------------- transactions ------------------------- */}
          {/*
           * The control is controlled — `value` plus `onValueChange` — because
           * the list under it is derived from the selection. Left uncontrolled
           * the thumb would still slide and the rows would never change, which
           * is the most convincing kind of broken.
           */}
          <SegmentedControl
            fullWidth
            aria-label="Transaction range"
            value={range}
            onValueChange={setRange}
            options={[
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' },
              { label: 'All', value: 'all' },
            ]}
          />

          <List
            header="Latest Transactions"
            footer="Transactions from the last 30 days are stored on this iPhone."
          >
            {shown.map((t) => (
              <ListRow
                key={t.merchant + t.amount}
                leading={
                  <IconTile gradient={t.gradient}>
                    <t.icon />
                  </IconTile>
                }
                title={t.merchant}
                subtitle={t.category}
                detail={
                  // A credit is not the same event as a charge, and the two
                  // must not be told apart by a minus sign alone.
                  <Text
                    as="span"
                    variant="body"
                    tone={t.credit ? 'success' : 'danger'}
                    weight="medium"
                  >
                    {t.amount}
                  </Text>
                }
                onClick={() => {}}
              />
            ))}
          </List>
        </Stack>
      </div>
    </div>
  )
}

/* ------------------------------- the cards --------------------------------- */

interface PaymentCardProps {
  name: string
  /** One of the eleven app-icon gradients in the token layer. */
  gradient: 'green' | 'indigo' | 'spectrum'
  lastFour: string
  balance: string
  note: string
  /** Pulled up over the card behind it. Every card but the first. */
  overlapped?: boolean
  /** Has a card in front of it, so it carries the room that card will hide. */
  covered?: boolean
}

const CARDS: Omit<PaymentCardProps, 'overlapped' | 'covered'>[] = [
  {
    name: 'Apple Cash',
    gradient: 'green',
    lastFour: '•••• 2091',
    balance: '$86.40',
    note: 'Available balance',
  },
  {
    name: 'Sapphire Reserve',
    gradient: 'indigo',
    lastFour: '•••• 4013',
    balance: '$2,318.44',
    note: 'Statement balance · due Oct 2',
  },
  {
    name: 'Apple Card',
    gradient: 'spectrum',
    lastFour: '•••• 8842',
    balance: '$412.09',
    note: 'No payment due — you are all caught up',
  },
]

function PaymentCard({
  name,
  gradient,
  lastFour,
  balance,
  note,
  overlapped,
  covered,
}: PaymentCardProps) {
  return (
    <Box
      radius="card"
      shadow="lg"
      padding={4}
      style={{
        background: `var(--may-grad-${gradient})`,
        color: 'var(--may-on-color)',
        minHeight: 'var(--may-space-24)',
        // A covered card's bottom padding is its normal 4 plus the 8 the next
        // card will sit over — 12 — so the strip that disappears under the
        // stack is padding and never a line of its own copy. The three numbers
        // are locked together: change the overlap and this one moves with it.
        paddingBlockEnd: covered ? 'var(--may-space-12)' : undefined,
        marginBlockStart: overlapped ? 'calc(var(--may-space-8) * -1)' : undefined,
      }}
    >
      <Stack gap={3}>
        <Stack direction="row" align="center" justify="between" gap={3}>
          <Text as="span" variant="headline" style={{ color: 'var(--may-on-color)' }}>
            {name}
          </Text>
          <Text as="span" variant="footnote" mono style={{ color: 'var(--may-on-color)' }}>
            {lastFour}
          </Text>
        </Stack>

        <Stack gap={0}>
          <Text as="span" variant="title-2" style={{ color: 'var(--may-on-color)' }}>
            {balance}
          </Text>
          <Text as="span" variant="caption-1" style={{ color: 'var(--may-on-color)' }}>
            {note}
          </Text>
        </Stack>
      </Stack>
    </Box>
  )
}

/* ---------------------------- the transactions ----------------------------- */

interface Transaction {
  merchant: string
  category: string
  amount: string
  gradient: 'orange' | 'blue' | 'green' | 'red' | 'teal' | 'purple' | 'gray'
  icon: ComponentType
  credit?: boolean
  /** Which segments this row belongs to. */
  range: string[]
}

const TRANSACTIONS: Transaction[] = [
  {
    merchant: 'Blue Bottle Coffee',
    category: 'Food & Drink · Today',
    amount: '−$6.75',
    gradient: 'orange',
    icon: CupIcon,
    range: ['week', 'month', 'all'],
  },
  {
    merchant: 'Daily Cash',
    category: 'Apple Cash · Today',
    amount: '+$4.62',
    gradient: 'green',
    icon: CashIcon,
    credit: true,
    range: ['week', 'month', 'all'],
  },
  {
    merchant: 'Muni Mobile',
    category: 'Transit · Yesterday',
    amount: '−$2.50',
    gradient: 'blue',
    icon: TransitIcon,
    range: ['week', 'month', 'all'],
  },
  {
    merchant: 'Trader Joe’s',
    category: 'Groceries · Sep 6',
    amount: '−$83.19',
    gradient: 'red',
    icon: BagIcon,
    range: ['month', 'all'],
  },
  {
    merchant: 'Apple Store, Union Square',
    category: 'Shopping · Sep 2',
    amount: '−$249.00',
    gradient: 'gray',
    icon: SparkleIcon,
    range: ['month', 'all'],
  },
  {
    merchant: 'Chevron 0417',
    category: 'Automotive · Aug 28',
    amount: '−$48.62',
    gradient: 'purple',
    icon: FuelIcon,
    range: ['all'],
  },
]

/* -------------------------------- glyph set -------------------------------- */

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M4 4h5v2.2H6.2V9H4zm11 0h5v5h-2.2V6.2H15zM4 15h2.2v2.8H9V20H4zm13.8 0H20v5h-5v-2.2h2.8zM4 10.9h16v2.2H4z"
        fill="currentColor"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M12 4.4a1.1 1.1 0 011.1 1.1v5.4h5.4a1.1 1.1 0 010 2.2h-5.4v5.4a1.1 1.1 0 01-2.2 0v-5.4H5.5a1.1 1.1 0 010-2.2h5.4V5.5A1.1 1.1 0 0112 4.4z"
        fill="currentColor"
      />
    </svg>
  )
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M5.4 5h11.2v3h1.6a2.9 2.9 0 010 5.8h-1.8a5.6 5.6 0 01-11 0zm11.2 5.2v1.4h1.6a.7.7 0 000-1.4zM4.6 19.4h12.8v1.6H4.6z"
        fill="currentColor"
      />
    </svg>
  )
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M3.4 6.4h17.2a1 1 0 011 1v9.2a1 1 0 01-1 1H3.4a1 1 0 01-1-1V7.4a1 1 0 011-1zM12 9.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6z"
        fill="currentColor"
      />
    </svg>
  )
}

function TransitIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M8 2.6h8a3.4 3.4 0 013.4 3.4v9.2a3.4 3.4 0 01-3.4 3.4l1.6 2.2h-2.4l-1.2-2.2H10l-1.2 2.2H6.4L8 18.6A3.4 3.4 0 014.6 15.2V6A3.4 3.4 0 018 2.6zm-1.2 4v4.2h10.4V6.6zm1.6 6.4a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zm7.2 0a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"
        fill="currentColor"
      />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M8.4 7V6a3.6 3.6 0 017.2 0v1h3.2l.8 12.4a1.6 1.6 0 01-1.6 1.6H6a1.6 1.6 0 01-1.6-1.6L5.2 7zm2.2 0h2.8V6a1.4 1.4 0 00-2.8 0z"
        fill="currentColor"
      />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M12 2.6l1.9 5.5 5.5 1.9-5.5 1.9L12 17.4l-1.9-5.5-5.5-1.9 5.5-1.9zM18.6 15l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"
        fill="currentColor"
      />
    </svg>
  )
}

function FuelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M4.6 3.6h8.2a1.6 1.6 0 011.6 1.6v15.2H3V5.2a1.6 1.6 0 011.6-1.6zm1.2 2.6v3.6h5.8V6.2zm10.6.2l2.6 2.6a2 2 0 01.6 1.4v6.4a1.4 1.4 0 01-2.8 0v-5.2h-1.6V6.4z"
        fill="currentColor"
      />
    </svg>
  )
}
