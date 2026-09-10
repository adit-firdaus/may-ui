import { useState } from 'react'
import { IoCard, IoLockClosed, IoLogoApple, IoLogoPaypal } from 'react-icons/io5'
import { NavBar } from '../mobile/NavBar'
import { Selector } from '../mobile/Selector'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Box } from '../components/Box'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { Stepper } from '../components/Stepper'
import { Separator } from '../components/Separator'
import { Descriptions, DescriptionItem } from '../components/Descriptions'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Progress } from '../components/Progress'
import { Button } from '../components/Button'

/**
 * Checkout.
 *
 * Every number below one price is derived, never typed twice: the stepper owns
 * the quantity, and subtotal, tax, total and the Pay button's label all fall
 * out of it. A checkout where the button and the summary can disagree is the
 * bug this shape exists to make impossible.
 *
 * The pay bar is a sibling of the scroller rather than a `position: fixed`
 * element — the root is a flex column, so the bar is pinned by layout. Fixed
 * positioning would work inside the device frame and then escape to the
 * viewport the moment the screen were used anywhere else.
 */

/** Cupertino's combined rate, applied to the merchandise total. */
const TAX_RATE = 0.08475
const UNIT_PRICE = 59

const usd = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const PAYMENT_METHODS = [
  {
    value: 'apple-pay',
    label: 'Apple Pay',
    description: 'Double-click the side button to confirm',
    icon: <ApplePayGlyph />,
  },
  {
    value: 'visa-4242',
    label: 'Visa •••• 4242',
    description: 'Expires 09/28 · Julian Reyes',
    icon: <CardGlyph />,
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'j.reyes@icloud.com',
    icon: <PayPalGlyph />,
  },
]

export function CheckoutScreen() {
  const [quantity, setQuantity] = useState(2)
  const [method, setMethod] = useState('apple-pay')

  const subtotal = UNIT_PRICE * quantity
  /* Shipping is free over $50, which is why the row says "Free" rather than
   * "$0.00" — a zero in a money column reads as a missing value. */
  const shipping = subtotal >= 50 ? 0 : 6.95
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + shipping + tax

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
        data-slot="scroll-area"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <NavBar title="Checkout" onBack={() => {}} backLabel="Bag" />

        <Stack
          direction="column"
          gap={5}
          style={{
            paddingInline: 'var(--may-space-4)',
            paddingBlock: 'var(--may-space-4)',
          }}
        >
          {/* Three checkout stages, and the bar is the only thing that says
              which one you are in — so it carries the count as text too. */}
          <Progress
            value={2}
            max={3}
            size="sm"
            label="Payment"
            showValue
            formatValue={(value, max) => `Step ${value} of ${max}`}
          />

          <Card variant="grouped" padding="none">
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
              <CardDescription>Arrives Thursday, Sep 18 · Free two-day shipping</CardDescription>
            </CardHeader>

            {/* `padding="none"` zeroes the card's own gap so the summary rows
                can run edge to edge; the body pays its bottom inset back, or
                the last row would sit 8pt from the card's corner. */}
            <CardBody style={{ paddingBottom: 'var(--may-space-2)' }}>
              <Stack
                direction="row"
                gap={4}
                align="start"
                style={{ paddingInline: 'var(--may-space-4)' }}
              >
                {/* Stands in for the product shot. A gradient rather than a
                    grey block: an empty thumbnail makes a real order look
                    broken, and this reads as artwork that has not loaded. */}
                <Box
                  radius="lg"
                  style={{
                    width: 'var(--may-space-16)',
                    height: 'var(--may-space-16)',
                    flexShrink: 0,
                    background: 'var(--may-grad-purple)',
                  }}
                />

                <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="headline" clamp={2}>
                    FineWoven Wallet with MagSafe
                  </Text>
                  <Text variant="footnote" tone="secondary">
                    Mulberry · iPhone 16 Pro
                  </Text>
                  <Stepper
                    value={quantity}
                    onValueChange={setQuantity}
                    min={1}
                    max={9}
                    size="sm"
                    formatValue={(value) => `${value} in bag`}
                    decrementLabel="Remove one"
                    incrementLabel="Add one"
                    style={{ alignSelf: 'flex-start', marginBlockStart: 'var(--may-space-2)' }}
                  />
                </Stack>

                <Text variant="callout" weight="medium">
                  {usd(UNIT_PRICE)}
                </Text>
              </Stack>

              <Separator />

              {/* `plain` because the card is already the surface — an inset
                  Descriptions here would be a card inside a card. */}
              <Descriptions variant="plain" layout="inline">
                <DescriptionItem
                  label={`Subtotal (${quantity} ${quantity === 1 ? 'item' : 'items'})`}
                  value={usd(subtotal)}
                />
                <DescriptionItem
                  label="Shipping"
                  value={
                    shipping === 0 ? (
                      <Text as="span" variant="body" tone="success">
                        Free
                      </Text>
                    ) : (
                      usd(shipping)
                    )
                  }
                />
                <DescriptionItem label="Estimated Tax" value={usd(tax)} />
                <DescriptionItem
                  label="Total"
                  value={
                    <Text as="span" variant="headline" weight="semibold">
                      {usd(total)}
                    </Text>
                  }
                />
              </Descriptions>
            </CardBody>
          </Card>

          <Stack direction="column" gap={3}>
            <Text variant="footnote" tone="secondary">
              PAYMENT METHOD
            </Text>
            {/* One column, not two: a card that has to carry a description
                has no room to sit beside another one at 390pt. */}
            <Selector
              variant="card"
              options={PAYMENT_METHODS}
              value={method}
              onChange={setMethod}
              columns={1}
              aria-label="Payment method"
            />
          </Stack>

          <Stack direction="column" gap={4}>
            <Text variant="footnote" tone="secondary">
              SHIPPING ADDRESS
            </Text>

            <Field label="Full Name">
              <Input defaultValue="Julian Reyes" autoComplete="name" fullWidth />
            </Field>

            <Field label="Street Address" description="Apartment or suite goes on the same line.">
              <Input defaultValue="1180 Guerrero St, Apt 4" autoComplete="street-address" fullWidth />
            </Field>

            <Stack direction="row" gap={3} align="start">
              <div style={{ flex: 2, minWidth: 0 }}>
                <Field label="City">
                  <Input defaultValue="San Francisco" autoComplete="address-level2" fullWidth />
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Field label="ZIP">
                  <Input
                    defaultValue="94110"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    fullWidth
                  />
                </Field>
              </div>
            </Stack>
          </Stack>
        </Stack>
      </div>

      {/* The pay bar. It never scrolls, and its bottom padding clears the home
          indicator rather than sitting under it. */}
      <div style={{ flexShrink: 0, background: 'var(--may-color-surface)' }}>
        <Separator />
        <Stack
          direction="column"
          gap={2}
          style={{
            padding: 'var(--may-space-4)',
            paddingBottom: 'calc(var(--may-inset-bottom) + var(--may-space-4))',
          }}
        >
          <Button size="lg" pill fullWidth leadingIcon={<LockGlyph />}>
            Pay {usd(total)}
          </Button>
          <Text variant="caption-1" tone="tertiary" align="center">
            Free returns within 14 days. Your card is charged when the order ships.
          </Text>
        </Stack>
      </div>
    </div>
  )
}

/* ------------------------------- glyph set -------------------------------- */

/** The Apple Pay mark, drawn as one silhouette so it inherits the row colour. */
function ApplePayGlyph() {
  return <IoLogoApple aria-hidden />
}

function CardGlyph() {
  return <IoCard aria-hidden />
}

function PayPalGlyph() {
  return <IoLogoPaypal aria-hidden />
}

function LockGlyph() {
  return <IoLockClosed aria-hidden />
}
