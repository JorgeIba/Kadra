import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocale } from "@/app/i18n"
import type { TFunction } from "i18next"
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"
import {
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  isCalendarDateString,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
} from "@/domain/investments"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import {
  getInvestmentTypeLabels,
  getPaymentFrequencyLabels,
  getReinvestmentBehaviorLabels,
} from "@/app/i18n/labels"
import {
  Field,
  FormSection,
} from "@/app/screens/record-change/RecordChangeFormPrimitives"
import { getFieldAccessibilityProps } from "@/app/screens/record-change/record-change-form-field-accessibility"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const FORM_FIELD_IDS = {
  annualRate: "record-change-annual-rate",
  effectiveDate: "record-change-effective-date",
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
  const { t } = useTranslation()

  return (
    <FormSection
      title={t("recordChange.form.sections.effectiveDate.title")}
      description={t("recordChange.form.sections.effectiveDate.description")}
    >
      <Field
        error={errors.effectiveDate?.message}
        label={t("recordChange.form.fields.transactionDateQuestion")}
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
  const { t } = useTranslation()
  const paymentFrequencyOptions =
    investmentType === INVESTMENT_TYPES.openEnded
      ? PAYMENT_FREQUENCY_OPTIONS.filter((frequency) => {
          return frequency !== PAYMENT_FREQUENCIES.atMaturity
        })
      : PAYMENT_FREQUENCY_OPTIONS
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const paymentFrequencyLabels = getPaymentFrequencyLabels(t)
  const reinvestmentBehaviorLabels = getReinvestmentBehaviorLabels(t)

  return (
    <FormSection
      title={t("recordChange.form.sections.currentTerms.title")}
      description={t("recordChange.form.sections.currentTerms.description")}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field
          error={errors.investmentType?.message}
          label={t("recordChange.form.fields.investmentType")}
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
                        ? t("recordChange.form.select.investmentType")
                        : investmentTypeLabels[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {investmentTypeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          error={errors.annualRate?.message}
          label={t("recordChange.form.fields.annualRate")}
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
          label={t("recordChange.form.fields.maturityDate")}
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
        label={t("recordChange.form.fields.paymentFrequency")}
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
                      ? t("recordChange.form.select.paymentFrequency")
                      : paymentFrequencyLabels[value]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentFrequencyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {paymentFrequencyLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field
        error={errors.reinvestmentBehavior?.message}
        label={t("recordChange.form.fields.reinvestment")}
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
                      ? t("recordChange.form.select.reinvestment")
                      : reinvestmentBehaviorLabels[value]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REINVESTMENT_BEHAVIOR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {reinvestmentBehaviorLabels[option]}
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
  const { t } = useTranslation()
  const { activeLocale } = useLocale()
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
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const paymentFrequencyLabels = getPaymentFrequencyLabels(t)

  return (
    <section className="rounded-lg border border-border/70 bg-card/45 p-4">
      <div className="space-y-1">
        <h2 className="text-base font-bold leading-tight text-foreground">
          {t("recordChange.form.summary.title")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("recordChange.form.summary.description")}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <SummaryItem
          label={t("recordChange.form.summary.effectiveDate")}
          value={
            effectiveDate === undefined || !isCalendarDateString(effectiveDate)
              ? t("recordChange.form.summary.selectDate")
              : formatDisplayDate(effectiveDate, activeLocale)
          }
        />
        <SummaryItem
          label={t("recordChange.form.summary.movement")}
          value={getMovementSummary({ contributionAmount, t, transactionType })}
        />
        <SummaryItem
          label={t("recordChange.form.summary.resultingBalance")}
          value={<MoneyAmount value={resultingBalance} />}
        />
        <SummaryItem
          label={t("recordChange.form.summary.annualRate")}
          value={
            typeof annualRate === "number" && Number.isFinite(annualRate)
              ? formatPercentage(annualRate, activeLocale)
              : t("recordChange.form.summary.enterRate")
          }
        />
        <SummaryItem
          label={t("recordChange.form.summary.type")}
          value={
            investmentType === undefined
              ? t("recordChange.form.summary.selectType")
              : investmentTypeLabels[investmentType]
          }
        />
        <SummaryItem
          label={t("recordChange.form.summary.payout")}
          value={
            paymentFrequency === undefined
              ? t("recordChange.form.select.payout")
              : paymentFrequencyLabels[paymentFrequency]
          }
        />
        {investmentType === INVESTMENT_TYPES.fixedTerm ? (
          <SummaryItem
            label={t("recordChange.form.summary.maturity")}
            value={
              maturityDate === undefined || !isCalendarDateString(maturityDate)
                ? t("recordChange.form.summary.selectMaturityDate")
                : formatDisplayDate(maturityDate, activeLocale)
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
  const { t } = useTranslation()

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
          {t("recordChange.form.actions.saveRecord")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancelRequest}
        >
          {t("recordChange.form.actions.backToDetail")}
        </Button>
      </div>
    </div>
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
  t,
  transactionType,
}: {
  contributionAmount: number | undefined
  t: TFunction
  transactionType: RecordChangeSummaryProps["transactionType"]
}) {
  if (
    transactionType === "contribution" &&
    isFinitePositiveNumber(contributionAmount)
  ) {
    return (
      <>
        {t("recordChange.form.moneyMovement.options.contribution.label")}{" "}
        <MoneyAmount value={contributionAmount} />
      </>
    )
  }

  if (
    transactionType === "withdrawal" &&
    isFinitePositiveNumber(contributionAmount)
  ) {
    return (
      <>
        {t("recordChange.form.moneyMovement.options.withdrawal.label")}{" "}
        <MoneyAmount value={contributionAmount} />
      </>
    )
  }

  if (transactionType === "contribution") {
    return t("recordChange.form.summary.pendingDeposit")
  }

  if (transactionType === "withdrawal") {
    return t("recordChange.form.summary.pendingWithdrawal")
  }

  return t("recordChange.form.summary.noMoneyMovement")
}

function isFinitePositiveNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}
