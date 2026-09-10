import type { ComponentType } from 'react'
import { useRef, useState } from 'react'
import { IoAdd, IoBag, IoBus, IoCafe, IoCash, IoScanOutline, IoSparkles } from 'react-icons/io5'
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
  return <IoScanOutline aria-hidden />
}

function PlusIcon() {
  return <IoAdd aria-hidden />
}

function CupIcon() {
  return <IoCafe aria-hidden />
}

function CashIcon() {
  return <IoCash aria-hidden />
}

function TransitIcon() {
  return <IoBus aria-hidden />
}

function BagIcon() {
  return <IoBag aria-hidden />
}

function SparkleIcon() {
  return <IoSparkles aria-hidden />
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
