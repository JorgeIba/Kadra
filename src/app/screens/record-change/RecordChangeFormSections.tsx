import { Controller } from "react-hook-form"
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"
import {
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  PAYMENT_FREQUENCY_LABELS,
  REINVESTMENT_BEHAVIORS,
  REINVESTMENT_BEHAVIOR_LABELS,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
} from "@/domain/investments"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"
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
import { formatMxn } from "@/lib/formatters"
import type { ReactNode } from "react"

const INVESTMENT_TYPE_OPTIONS = [
  INVESTMENT_TYPES.fixedTerm,
  INVESTMENT_TYPES.openEnded,
] as const satisfies ReadonlyArray<InvestmentType>

const PAYMENT_FREQUENCY_OPTIONS = [
  PAYMENT_FREQUENCIES.daily,
  PAYMENT_FREQUENCIES.weekly,
  PAYMENT_FREQUENCIES.monthly,
  PAYMENT_FREQUENCIES.atMaturity,
] as const satisfies ReadonlyArray<PaymentFrequency>

const REINVESTMENT_BEHAVIOR_OPTIONS = [
  REINVESTMENT_BEHAVIORS.automatic,
  REINVESTMENT_BEHAVIORS.toCash,
] as const satisfies ReadonlyArray<ReinvestmentBehavior>

const FORM_FIELD_IDS = {
  annualRate: "record-change-annual-rate",
  contributionAmount: "record-change-contribution-amount",
  effectiveDate: "record-change-effective-date",
  hasContribution: "record-change-has-contribution",
  investmentType: "record-change-investment-type",
  maturityDate: "record-change-maturity-date",
  paymentFrequency: "record-change-payment-frequency",
  reinvestmentBehavior: "record-change-reinvestment",
} as const

interface RecordChangeSectionProps {
  errors: FieldErrors<RecordChangeFormValues>
  register: UseFormRegister<RecordChangeFormValues>
}

interface EffectiveDateSectionProps extends RecordChangeSectionProps {
  maxEffectiveDate: string
}

export function EffectiveDateSection({
  errors,
  maxEffectiveDate,
  register,
}: EffectiveDateSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>When did this change happen?</CardTitle>
        <CardDescription>
          Trafin will append new history from this date onward.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          error={errors.effectiveDate?.message}
          label="Effective date"
          htmlFor={FORM_FIELD_IDS.effectiveDate}
        >
          <Input
            id={FORM_FIELD_IDS.effectiveDate}
            max={maxEffectiveDate}
            type="date"
            {...getFieldAccessibilityProps(
              FORM_FIELD_IDS.effectiveDate,
              errors.effectiveDate?.message,
            )}
            {...register("effectiveDate")}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

interface MoneyMovementSectionProps extends RecordChangeSectionProps {
  availableContribution: number
  hasContribution: boolean
}

export function MoneyMovementSection({
  availableContribution,
  errors,
  hasContribution,
  register,
}: MoneyMovementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Money movement</CardTitle>
        <CardDescription>
          Optional. For now this only records additional money.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor={FORM_FIELD_IDS.hasContribution}
          className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/40 p-3 text-sm"
        >
          <input
            id={FORM_FIELD_IDS.hasContribution}
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            {...register("hasContribution")}
          />
          <span>
            <span className="block font-medium text-foreground">
              Added money to this investment
            </span>
            <span className="mt-1 block leading-5 text-muted-foreground">
              Available contributed capital on this date:{" "}
              {formatMxn(availableContribution)}
            </span>
          </span>
        </label>

        {hasContribution ? (
          <Field
            error={errors.contributionAmount?.message}
            label="Added amount"
            htmlFor={FORM_FIELD_IDS.contributionAmount}
          >
            <Input
              id={FORM_FIELD_IDS.contributionAmount}
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="2500"
              {...getFieldAccessibilityProps(
                FORM_FIELD_IDS.contributionAmount,
                errors.contributionAmount?.message,
              )}
              {...register("contributionAmount", { valueAsNumber: true })}
            />
          </Field>
        ) : null}
      </CardContent>
    </Card>
  )
}

interface CurrentTermsSectionProps extends RecordChangeSectionProps {
  control: Control<RecordChangeFormValues>
  investmentType: InvestmentType
  paymentFrequency: PaymentFrequency
  setValue: UseFormSetValue<RecordChangeFormValues>
}

export function CurrentTermsSection({
  control,
  errors,
  investmentType,
  paymentFrequency,
  register,
  setValue,
}: CurrentTermsSectionProps) {
  const paymentFrequencyOptions =
    investmentType === INVESTMENT_TYPES.openEnded
      ? PAYMENT_FREQUENCY_OPTIONS.filter((frequency) => {
          return frequency !== PAYMENT_FREQUENCIES.atMaturity
        })
      : PAYMENT_FREQUENCY_OPTIONS

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current terms</CardTitle>
        <CardDescription>
          Leave values unchanged unless the current rate or terms changed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            error={errors.investmentType?.message}
            label="Type"
            htmlFor={FORM_FIELD_IDS.investmentType}
          >
            <Controller
              control={control}
              name="investmentType"
              render={({ field: investmentTypeField }) => (
                <Select
                  name={investmentTypeField.name}
                  value={investmentTypeField.value}
                  onValueChange={(value) => {
                    investmentTypeField.onChange(value)

                    if (
                      value === INVESTMENT_TYPES.openEnded &&
                      paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
                    ) {
                      setValue(
                        "paymentFrequency",
                        PAYMENT_FREQUENCIES.monthly,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      )
                    }
                  }}
                >
                  <SelectTrigger
                    id={FORM_FIELD_IDS.investmentType}
                    className="w-full"
                    {...getFieldAccessibilityProps(
                      FORM_FIELD_IDS.investmentType,
                      errors.investmentType?.message,
                    )}
                  >
                    <SelectValue>
                      {(value: InvestmentType | null) =>
                        value === null
                          ? "Select type"
                          : INVESTMENT_TYPE_LABELS[value]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {INVESTMENT_TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            error={errors.annualRate?.message}
            label="Annual rate"
            htmlFor={FORM_FIELD_IDS.annualRate}
          >
            <Input
              id={FORM_FIELD_IDS.annualRate}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="11.25"
              {...getFieldAccessibilityProps(
                FORM_FIELD_IDS.annualRate,
                errors.annualRate?.message,
              )}
              {...register("annualRate", { valueAsNumber: true })}
            />
          </Field>
        </div>

        {investmentType === INVESTMENT_TYPES.fixedTerm ? (
          <Field
            error={errors.maturityDate?.message}
            label="Maturity date"
            htmlFor={FORM_FIELD_IDS.maturityDate}
          >
            <Input
              id={FORM_FIELD_IDS.maturityDate}
              type="date"
              {...getFieldAccessibilityProps(
                FORM_FIELD_IDS.maturityDate,
                errors.maturityDate?.message,
              )}
              {...register("maturityDate")}
            />
          </Field>
        ) : null}

        <Field
          error={errors.paymentFrequency?.message}
          label="Payment frequency"
          htmlFor={FORM_FIELD_IDS.paymentFrequency}
        >
          <Controller
            control={control}
            name="paymentFrequency"
            render={({ field: paymentFrequencyField }) => (
              <Select
                name={paymentFrequencyField.name}
                value={paymentFrequencyField.value}
                onValueChange={paymentFrequencyField.onChange}
              >
                <SelectTrigger
                  id={FORM_FIELD_IDS.paymentFrequency}
                  className="w-full"
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.paymentFrequency,
                    errors.paymentFrequency?.message,
                  )}
                >
                  <SelectValue>
                    {(value: PaymentFrequency | null) =>
                      value === null
                        ? "Select payment frequency"
                        : PAYMENT_FREQUENCY_LABELS[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentFrequencyOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {PAYMENT_FREQUENCY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          error={errors.reinvestmentBehavior?.message}
          label="Reinvestment"
          htmlFor={FORM_FIELD_IDS.reinvestmentBehavior}
        >
          <Controller
            control={control}
            name="reinvestmentBehavior"
            render={({ field: reinvestmentBehaviorField }) => (
              <Select
                name={reinvestmentBehaviorField.name}
                value={reinvestmentBehaviorField.value}
                onValueChange={reinvestmentBehaviorField.onChange}
              >
                <SelectTrigger
                  id={FORM_FIELD_IDS.reinvestmentBehavior}
                  className="w-full"
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.reinvestmentBehavior,
                    errors.reinvestmentBehavior?.message,
                  )}
                >
                  <SelectValue>
                    {(value: ReinvestmentBehavior | null) =>
                      value === null
                        ? "Select reinvestment"
                        : REINVESTMENT_BEHAVIOR_LABELS[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REINVESTMENT_BEHAVIOR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {REINVESTMENT_BEHAVIOR_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

interface RecordChangeFormActionsProps {
  isValid: boolean
  onCancel: () => void
}

export function RecordChangeFormActions({
  isValid,
  onCancel,
}: RecordChangeFormActionsProps) {
  return (
    <div className="grid gap-2">
      <Button type="submit" className="w-full" disabled={!isValid}>
        Save record
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onCancel}
      >
        Back to detail
      </Button>
    </div>
  )
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
}) {
  const errorId = `${htmlFor}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error === undefined ? null : (
        <p id={errorId} className="text-sm leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function getFieldAccessibilityProps(fieldId: string, error?: string) {
  if (error === undefined) {
    return {}
  }

  return {
    "aria-describedby": `${fieldId}-error`,
    "aria-invalid": true,
  } as const
}
