import type React from "react"
import {
  CURRENCIES,
  CURRENCY_LABELS,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  PAYMENT_FREQUENCY_LABELS,
  REINVESTMENT_BEHAVIORS,
  REINVESTMENT_BEHAVIOR_LABELS,
} from "@/domain/investments"
import { InvestmentFormPreview } from "@/app/screens/invest/InvestmentFormPreview"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const INVESTMENT_TYPE_OPTIONS = [
  INVESTMENT_TYPES.fixedTerm,
  INVESTMENT_TYPES.openEnded,
] as const

const PAYMENT_FREQUENCY_OPTIONS = [
  PAYMENT_FREQUENCIES.daily,
  PAYMENT_FREQUENCIES.weekly,
  PAYMENT_FREQUENCIES.monthly,
  PAYMENT_FREQUENCIES.atMaturity,
] as const

const REINVESTMENT_BEHAVIOR_OPTIONS = [
  REINVESTMENT_BEHAVIORS.automatic,
  REINVESTMENT_BEHAVIORS.toCash,
] as const

const CURRENCY_OPTIONS = [CURRENCIES.mxn] as const

export function InvestmentForm() {
  return (
    <form className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>
            Name the investment and where the money lives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Investment name" htmlFor="investment-name">
            <Input
              id="investment-name"
              name="investmentName"
              placeholder="CETES 6 months"
            />
          </Field>

          <Field label="Institution" htmlFor="institution-name">
            <Input
              id="institution-name"
              name="institutionName"
              placeholder="CETES Directo"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>
            These values drive the future projection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="investment-type">
              <Select
                name="investmentType"
                defaultValue={INVESTMENT_TYPES.fixedTerm}
              >
                <SelectTrigger id="investment-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPE_OPTIONS.map((investmentType) => (
                    <SelectItem key={investmentType} value={investmentType}>
                      {INVESTMENT_TYPE_LABELS[investmentType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Currency" htmlFor="currency">
              <Select name="currency" defaultValue={CURRENCIES.mxn}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {CURRENCY_LABELS[currency]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Original amount" htmlFor="original-amount">
              <Input
                id="original-amount"
                name="originalAmount"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="10000"
              />
            </Field>

            <Field label="Annual rate" htmlFor="annual-rate">
              <Input
                id="annual-rate"
                name="annualRate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="11.25"
              />
            </Field>
          </div>

          <Field label="End date" htmlFor="end-date">
            <Input id="end-date" name="endDate" type="date" />
            <p className="text-xs leading-5 text-muted-foreground">
              Required for fixed-term investments. Hidden later for open-ended
              investments.
            </p>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
          <CardDescription>
            Define how often returns are paid and where they go.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Payment frequency" htmlFor="payment-frequency">
            <Select
              name="paymentFrequency"
              defaultValue={PAYMENT_FREQUENCIES.monthly}
            >
              <SelectTrigger id="payment-frequency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_FREQUENCY_OPTIONS.map((paymentFrequency) => (
                  <SelectItem key={paymentFrequency} value={paymentFrequency}>
                    {PAYMENT_FREQUENCY_LABELS[paymentFrequency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Reinvestment" htmlFor="reinvestment">
            <Select
              name="reinvestmentBehavior"
              defaultValue={REINVESTMENT_BEHAVIORS.automatic}
            >
              <SelectTrigger id="reinvestment" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REINVESTMENT_BEHAVIOR_OPTIONS.map((reinvestmentBehavior) => (
                  <SelectItem
                    key={reinvestmentBehavior}
                    value={reinvestmentBehavior}
                  >
                    {REINVESTMENT_BEHAVIOR_LABELS[reinvestmentBehavior]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Optional context for future you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            placeholder="Example: rate renewal expected after maturity."
          />
        </CardContent>
      </Card>

      <InvestmentFormPreview />

      <Button type="button" className="w-full" disabled>
        Save investment
      </Button>
    </form>
  )
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode
  htmlFor: string
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
