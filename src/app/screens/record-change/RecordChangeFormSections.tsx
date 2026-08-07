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
  isCalendarDateString,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
} from "@/domain/investments"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"
import { cn } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Ban, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDisplayDate, formatPercentage } from "@/lib/formatters"
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

const MONEY_MOVEMENT_TONE_STYLES = {
  destructive: {
    check: "border-destructive bg-destructive text-background",
    icon: "border-destructive/35 bg-destructive/10 text-destructive",
    option: "border-destructive/35 bg-destructive/10",
  },
  primary: {
    check: "border-primary bg-primary text-primary-foreground",
    icon: "border-primary/55 bg-primary/15 text-primary",
    option: "border-primary/55 bg-primary/10",
  },
  success: {
    check: "border-success bg-success text-success-foreground",
    icon: "border-success-border bg-success-surface text-success",
    option: "border-success-border bg-success-surface/65",
  },
} as const satisfies Record<MoneyMovementTone, MoneyMovementToneStyle>

type MoneyMovementTone = "primary" | "success" | "destructive"

interface MoneyMovementToneStyle {
  check: string
  icon: string
  option: string
}

const FORM_FIELD_IDS = {
  annualRate: "record-change-annual-rate",
  contributionAmount: "record-change-contribution-amount",
  effectiveDate: "record-change-effective-date",
  transactionType: "record-change-transaction-type",
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
    <FormSection
      title="Effective date"
      description="Kadra will append new history from this date onward."
    >
      <Field
        error={errors.effectiveDate?.message}
        label="When did this change happen?"
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
    </FormSection>
  )
}

interface MoneyMovementSectionProps extends RecordChangeSectionProps {
  availableContribution: number
  activeBalance: number
  transactionType: "none" | "contribution" | "withdrawal"
}

export function MoneyMovementSection({
  availableContribution,
  activeBalance,
  errors,
  transactionType,
  register,
}: MoneyMovementSectionProps) {
  return (
    <FormSection
      title="Money movement"
      description="Optional. Record a deposit or withdrawal on this date."
    >
      <div className="grid gap-2">
        <MoneyMovementOption
          description="Only record rate or term changes."
          icon={<Ban className="h-4 w-4" />}
          isSelected={transactionType === "none"}
          label="No movement"
          tone="primary"
          value="none"
          register={register}
        />
        <MoneyMovementOption
          description="Add new capital to this investment."
          icon={<ArrowDownLeft className="h-4 w-4" />}
          isSelected={transactionType === "contribution"}
          label="Deposit"
          tone="success"
          value="contribution"
          register={register}
        />
        <MoneyMovementOption
          description="Take capital out of this investment."
          icon={<ArrowUpRight className="h-4 w-4" />}
          isSelected={transactionType === "withdrawal"}
          label="Withdrawal"
          tone="destructive"
          value="withdrawal"
          register={register}
        />
      </div>

      <MoneyMovementDetails
        activeBalance={activeBalance}
        availableContribution={availableContribution}
        amountError={errors.contributionAmount?.message}
        transactionType={transactionType}
        register={register}
      />
    </FormSection>
  )
}

/**
 * Everything revealed below the movement picker for a selected deposit or
 * withdrawal. Keeping this region together gives its future enter/exit
 * choreography one stable sibling boundary.
 */
function MoneyMovementDetails({
  activeBalance,
  amountError,
  availableContribution,
  register,
  transactionType,
}: {
  activeBalance: number
  amountError: string | undefined
  availableContribution: number
  register: UseFormRegister<RecordChangeFormValues>
  transactionType: "none" | "contribution" | "withdrawal"
}) {
  let details: {
    amount: number
    amountLabel: string
    notice: string
    tone: "success" | "destructive"
  }

  switch (transactionType) {
    case "none":
      return null
    case "contribution":
      details = {
        amount: availableContribution,
        amountLabel: "Added amount",
        notice: "Net capital contributed on this date:",
        tone: "success",
      }
      break
    case "withdrawal":
      details = {
        amount: activeBalance,
        amountLabel: "Withdrawn amount",
        notice: "Available active balance to withdraw on this date:",
        tone: "destructive",
      }
      break
  }

  return (
    <div className="space-y-4">
      <InlineNotice tone={details.tone}>
        {details.notice}{" "}
        <span className="font-semibold text-foreground">
          <MoneyAmount value={details.amount} />
        </span>
      </InlineNotice>

      <Field
        error={amountError}
        label={details.amountLabel}
        htmlFor={FORM_FIELD_IDS.contributionAmount}
      >
        <div className="relative flex items-center">
          <span className="absolute left-3.5 border-r py-1 pr-3 text-xs font-semibold text-muted-foreground select-none">
            MXN $
          </span>
          <Input
            id={FORM_FIELD_IDS.contributionAmount}
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="2500"
            className="h-12 pl-20 text-lg font-semibold"
            {...getFieldAccessibilityProps(
              FORM_FIELD_IDS.contributionAmount,
              amountError,
            )}
            {...register("contributionAmount", { valueAsNumber: true })}
          />
        </div>
      </Field>
    </div>
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
    <FormSection
      title="Current terms"
      description="Leave values unchanged unless the current rate or terms changed."
    >
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
                    setValue("paymentFrequency", PAYMENT_FREQUENCIES.monthly, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
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
    </FormSection>
  )
}

interface RecordChangeSummaryProps {
  activeBalance: number
  annualRate: number | undefined
  contributionAmount: number | undefined
  effectiveDate: string | undefined
  investmentType: InvestmentType | undefined
  maturityDate: string | undefined
  paymentFrequency: PaymentFrequency | undefined
  transactionType: "none" | "contribution" | "withdrawal" | undefined
}

export function RecordChangeSummary({
  activeBalance,
  annualRate,
  contributionAmount,
  effectiveDate,
  investmentType,
  maturityDate,
  paymentFrequency,
  transactionType,
}: RecordChangeSummaryProps) {
  const hasMoneyMovement =
    transactionType !== undefined &&
    transactionType !== "none" &&
    isFinitePositiveNumber(contributionAmount)
  const resultingBalance =
    transactionType === "contribution" && hasMoneyMovement
      ? activeBalance + contributionAmount
      : transactionType === "withdrawal" && hasMoneyMovement
        ? activeBalance - contributionAmount
        : activeBalance

  return (
    <section className="rounded-lg border border-border/70 bg-card/45 p-4">
      <div className="space-y-1">
        <h2 className="text-base font-bold leading-tight text-foreground">
          Record summary
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Review what this dated record will append before saving.
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <SummaryItem
          label="Effective date"
          value={
            effectiveDate === undefined || !isCalendarDateString(effectiveDate)
              ? "Select date"
              : formatDisplayDate(effectiveDate)
          }
        />
        <SummaryItem
          label="Movement"
          value={getMovementSummary({ contributionAmount, transactionType })}
        />
        <SummaryItem
          label="Resulting balance"
          value={<MoneyAmount value={resultingBalance} />}
        />
        <SummaryItem
          label="Annual rate"
          value={
            typeof annualRate === "number" && Number.isFinite(annualRate)
              ? formatPercentage(annualRate)
              : "Enter rate"
          }
        />
        <SummaryItem
          label="Type"
          value={
            investmentType === undefined
              ? "Select type"
              : INVESTMENT_TYPE_LABELS[investmentType]
          }
        />
        <SummaryItem
          label="Payout"
          value={
            paymentFrequency === undefined
              ? "Select payout"
              : PAYMENT_FREQUENCY_LABELS[paymentFrequency]
          }
        />
        {investmentType === INVESTMENT_TYPES.fixedTerm ? (
          <SummaryItem
            label="Maturity"
            value={
              maturityDate === undefined || !isCalendarDateString(maturityDate)
                ? "Select date"
                : formatDisplayDate(maturityDate)
            }
          />
        ) : null}
      </dl>
    </section>
  )
}

interface RecordChangeFormActionsProps {
  isValid: boolean
  onCancelRequest: () => void
  submitGuidance?: string
}

export function RecordChangeFormActions({
  isValid,
  onCancelRequest,
  submitGuidance,
}: RecordChangeFormActionsProps) {
  return (
    <div className="grid gap-3">
      {submitGuidance === undefined ? null : (
        <p className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2 text-sm leading-6 text-muted-foreground">
          {submitGuidance}
        </p>
      )}

      <div className="grid gap-2">
        <Button
          type="submit"
          className="w-full disabled:border-border disabled:bg-muted/45 disabled:text-muted-foreground disabled:shadow-none"
          disabled={!isValid}
        >
          Save record
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancelRequest}
        >
          Back to detail
        </Button>
      </div>
    </div>
  )
}

function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="space-y-4 border-t border-border/70 py-5 first:border-t-0">
      <div className="space-y-1.5">
        <h2 className="text-base font-bold leading-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function MoneyMovementOption({
  description,
  icon,
  isSelected,
  label,
  register,
  tone,
  value,
}: {
  description: string
  icon: ReactNode
  isSelected: boolean
  label: string
  register: UseFormRegister<RecordChangeFormValues>
  tone: MoneyMovementTone
  value: "none" | "contribution" | "withdrawal"
}) {
  const toneStyles = MONEY_MOVEMENT_TONE_STYLES[tone]

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 bg-card/45 p-3 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:outline-none hover:bg-muted/25",
        isSelected && toneStyles.option,
      )}
    >
      <input
        type="radio"
        value={value}
        className="sr-only"
        {...register("transactionType")}
      />

      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/35 text-muted-foreground",
          isSelected && toneStyles.icon,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-foreground">
          {label}
        </span>
        <span className="block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>

      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/70 text-background",
          isSelected && toneStyles.check,
        )}
        aria-hidden="true"
      >
        {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
    </label>
  )
}

function InlineNotice({
  children,
  tone,
}: {
  children: ReactNode
  tone: "success" | "destructive"
}) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-xs leading-5",
        tone === "success" &&
          "border-success-border bg-success-surface text-success",
        tone === "destructive" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </p>
  )
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/35 px-3 py-2">
      <dt className="text-[0.68rem] font-medium leading-4 text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-5 text-foreground">
        {value}
      </dd>
    </div>
  )
}

function getMovementSummary({
  contributionAmount,
  transactionType,
}: {
  contributionAmount: number | undefined
  transactionType: RecordChangeSummaryProps["transactionType"]
}) {
  if (
    transactionType === "contribution" &&
    isFinitePositiveNumber(contributionAmount)
  ) {
    return (
      <>
        Deposit <MoneyAmount value={contributionAmount} />
      </>
    )
  }

  if (
    transactionType === "withdrawal" &&
    isFinitePositiveNumber(contributionAmount)
  ) {
    return (
      <>
        Withdraw <MoneyAmount value={contributionAmount} />
      </>
    )
  }

  if (transactionType === "contribution") {
    return "Deposit amount pending"
  }

  if (transactionType === "withdrawal") {
    return "Withdrawal amount pending"
  }

  return "No money movement"
}

function isFinitePositiveNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
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
