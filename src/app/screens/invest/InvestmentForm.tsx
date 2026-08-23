import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import type { TFunction } from "i18next"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  toDateString,
  type Currency,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
} from "@/domain/investments"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import {
  getCurrencyLabels,
  getInvestmentTypeLabels,
  getPaymentFrequencyLabels,
  getReinvestmentBehaviorLabels,
} from "@/app/i18n/labels"
import { getInvestmentFormPreview } from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentFormPreview } from "@/app/screens/invest/InvestmentFormPreview"
import {
  createInvestmentFormSchema,
  type InvestmentFormValues,
} from "@/app/screens/invest/investment-form-schema"
import { AutocompleteField } from "@/components/ui/autocomplete-field"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// UI order for dropdown fields; domain constants still own the allowed values.
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

const CURRENCY_OPTIONS = [CURRENCIES.mxn] as const

// DOM ids used to connect labels, inputs, and accessibility messages.
const FORM_FIELD_IDS = {
  annualRate: "annual-rate",
  currency: "currency",
  endDate: "end-date",
  institutionName: "institution-name",
  investmentType: "investment-type",
  name: "investment-name",
  notes: "investment-notes",
  contributionAmount: "contribution-amount",
  paymentFrequency: "payment-frequency",
  reinvestmentBehavior: "reinvestment",
  startDate: "start-date",
} as const

const SAVE_REQUIREMENTS = [
  { field: "name", label: "investmentName" },
  { field: "institutionName", label: "institution" },
  { field: "contributionAmount", label: "contributionAmount" },
  { field: "annualRate", label: "annualRate" },
  { field: "startDate", label: "startDate" },
  {
    field: "endDate",
    investmentType: INVESTMENT_TYPES.fixedTerm,
    label: "endDate",
  },
] as const satisfies ReadonlyArray<SaveRequirement>

type SaveRequirement = {
  field: keyof InvestmentFormValues
  investmentType?: InvestmentType
  label: string
}

interface InvestmentFormProps {
  institutionSuggestions?: string[]
  initialValues?: InvestmentFormValues
  isStartDateEditable?: boolean
  onCancel?: () => void
  cancelLabel?: string
  onSubmit: (values: InvestmentFormValues) => void
  submitLabel?: string
  successMessage?: string
}

export function InvestmentForm({
  institutionSuggestions = [],
  initialValues,
  isStartDateEditable = true,
  onCancel,
  cancelLabel,
  onSubmit,
  submitLabel,
  successMessage,
}: InvestmentFormProps) {
  const { i18n, t } = useTranslation()
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const resolvedLanguageRef = useRef(i18n.resolvedLanguage)
  const formSchema = useMemo(() => createInvestmentFormSchema(t), [t])
  const {
    control,
    formState: { errors, isDirty, isSubmitSuccessful, isValid },
    handleSubmit,
    register,
    setValue,
    trigger,
  } = useForm<InvestmentFormValues>({
    defaultValues: initialValues ?? {
      currency: CURRENCIES.mxn,
      notes: "",
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: toDateString(new Date()),
      investmentType: INVESTMENT_TYPES.fixedTerm,
    },
    mode: "onChange",
    resolver: zodResolver(formSchema),
    shouldUnregister: true,
  })

  useEffect(() => {
    if (resolvedLanguageRef.current === i18n.resolvedLanguage) {
      return
    }

    resolvedLanguageRef.current = i18n.resolvedLanguage

    // Existing validation messages were created in the previous language.
    if (Object.keys(errors).length > 0) {
      void trigger()
    }
  }, [errors, i18n.resolvedLanguage, trigger])

  function handleValidSubmit(values: InvestmentFormValues) {
    onSubmit(values)
  }

  function handleCancelRequest() {
    if (onCancel === undefined) {
      return
    }

    if (!isDirty) {
      onCancel()
      return
    }

    setIsDiscardDialogOpen(true)
  }

  const investmentType = useWatch({ control, name: "investmentType" })
  const paymentFrequency = useWatch({ control, name: "paymentFrequency" })
  const previewValues = useWatch({ control })
  const previewInvestment = getInvestmentFormPreview(previewValues, { t })
  const paymentFrequencyOptions =
    investmentType === INVESTMENT_TYPES.openEnded
      ? PAYMENT_FREQUENCY_OPTIONS.filter((frequency) => {
          return frequency !== PAYMENT_FREQUENCIES.atMaturity
        })
      : PAYMENT_FREQUENCY_OPTIONS
  const submitGuidance = isValid
    ? undefined
    : getSubmitGuidance(previewValues, investmentType, t)
  const currencyLabels = getCurrencyLabels(t)
  const investmentTypeLabels = getInvestmentTypeLabels(t)
  const paymentFrequencyLabels = getPaymentFrequencyLabels(t)
  const reinvestmentBehaviorLabels = getReinvestmentBehaviorLabels(t)

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="border-y border-border/70">
          <FormSection
            title={t("invest.form.sections.identity.title")}
            description={t("invest.form.sections.identity.description")}
          >
            <Field
              error={errors.name?.message}
              label={t("invest.form.fields.investmentName")}
              htmlFor={FORM_FIELD_IDS.name}
            >
              <Input
                id={FORM_FIELD_IDS.name}
                placeholder={t("invest.form.placeholders.investmentName")}
                {...getFieldAccessibilityProps(
                  FORM_FIELD_IDS.name,
                  errors.name?.message,
                )}
                {...register("name")}
              />
            </Field>

            <Field
              error={errors.institutionName?.message}
              label={t("invest.form.fields.institution")}
              htmlFor={FORM_FIELD_IDS.institutionName}
            >
              <Controller
                control={control}
                name="institutionName"
                render={({ field: institutionNameField }) => (
                  <AutocompleteField
                    id={FORM_FIELD_IDS.institutionName}
                    name={institutionNameField.name}
                    placeholder={t("invest.form.placeholders.institution")}
                    suggestions={institutionSuggestions}
                    value={institutionNameField.value ?? ""}
                    onBlur={institutionNameField.onBlur}
                    onValueChange={institutionNameField.onChange}
                    {...getFieldAccessibilityProps(
                      FORM_FIELD_IDS.institutionName,
                      errors.institutionName?.message,
                    )}
                  />
                )}
              />
            </Field>
          </FormSection>

          <FormSection
            title={t("invest.form.sections.terms.title")}
            description={t("invest.form.sections.terms.description")}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field
                error={errors.investmentType?.message}
                label={t("invest.form.fields.type")}
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
                              ? t("invest.form.select.investmentType")
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
                error={errors.currency?.message}
                label={t("invest.form.fields.currency")}
                htmlFor={FORM_FIELD_IDS.currency}
              >
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: currencyField }) => (
                    <Select
                      name={currencyField.name}
                      value={currencyField.value}
                      onValueChange={currencyField.onChange}
                    >
                      <SelectTrigger
                        id={FORM_FIELD_IDS.currency}
                        className="w-full"
                        {...getFieldAccessibilityProps(
                          FORM_FIELD_IDS.currency,
                          errors.currency?.message,
                        )}
                      >
                        <SelectValue>
                          {(value: Currency | null) =>
                            value === null
                              ? t("invest.form.select.currency")
                              : currencyLabels[value]
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {currencyLabels[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                error={errors.contributionAmount?.message}
                label={t("invest.form.fields.contributionAmount")}
                htmlFor={FORM_FIELD_IDS.contributionAmount}
              >
                <Input
                  id={FORM_FIELD_IDS.contributionAmount}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="10000"
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.contributionAmount,
                    errors.contributionAmount?.message,
                  )}
                  {...register("contributionAmount", { valueAsNumber: true })}
                />
              </Field>

              <Field
                error={errors.annualRate?.message}
                label={t("invest.form.fields.annualRate")}
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

            {isStartDateEditable ? (
              <Field
                error={errors.startDate?.message}
                label={t("invest.form.fields.startDate")}
                htmlFor={FORM_FIELD_IDS.startDate}
              >
                <Input
                  id={FORM_FIELD_IDS.startDate}
                  type="date"
                  max={toDateString(new Date())}
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.startDate,
                    errors.startDate?.message,
                  )}
                  {...register("startDate")}
                />
              </Field>
            ) : (
              <input type="hidden" {...register("startDate")} />
            )}

            {investmentType === INVESTMENT_TYPES.fixedTerm ? (
              <Field
                error={errors.endDate?.message}
                label={t("invest.form.fields.endDate")}
                htmlFor={FORM_FIELD_IDS.endDate}
              >
                <Input
                  id={FORM_FIELD_IDS.endDate}
                  type="date"
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.endDate,
                    errors.endDate?.message,
                  )}
                  {...register("endDate")}
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  {t("invest.form.endDateRequired")}
                </p>
              </Field>
            ) : null}
          </FormSection>

          <FormSection
            title={t("invest.form.sections.returns.title")}
            description={t("invest.form.sections.returns.description")}
          >
            <Field
              error={errors.paymentFrequency?.message}
              label={t("invest.form.fields.paymentFrequency")}
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
                            ? t("invest.form.select.paymentFrequency")
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
              label={t("invest.form.fields.reinvestment")}
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
                            ? t("invest.form.select.reinvestment")
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

          <InvestmentFormPreview investment={previewInvestment} />

          <FormSection
            title={t("invest.form.sections.notes.title")}
            description={t("invest.form.sections.notes.description")}
            optionalLabel={t("invest.form.optional")}
            isOptional
          >
            <Field
              htmlFor={FORM_FIELD_IDS.notes}
              label={t("invest.form.fields.notes")}
            >
              <Textarea
                id={FORM_FIELD_IDS.notes}
                placeholder={t("invest.form.placeholders.notes")}
                {...register("notes")}
              />
            </Field>
          </FormSection>
        </div>

        <div className="space-y-3">
          {submitGuidance === undefined ? null : (
            <p className="rounded-lg border border-border/70 bg-card/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
              {submitGuidance}
            </p>
          )}

          <Button
            type="submit"
            className="w-full disabled:border-border disabled:bg-muted/45 disabled:text-muted-foreground disabled:shadow-none"
            disabled={!isValid}
          >
            {submitLabel ?? t("invest.form.actions.saveInvestment")}
          </Button>

          {onCancel === undefined ? null : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCancelRequest}
            >
              {cancelLabel ?? t("common.actions.cancel")}
            </Button>
          )}
        </div>

        {isSubmitSuccessful ? (
          <p className="text-center text-sm font-medium text-primary">
            {successMessage ?? t("invest.form.savedDraft")}
          </p>
        ) : null}
      </form>

      <ConfirmDialog
        open={isDiscardDialogOpen}
        title={t("invest.form.discard.title")}
        description={t("invest.form.discard.description")}
        confirmLabel={t("invest.form.discard.confirm")}
        variant="destructive"
        onRequestOpenChange={setIsDiscardDialogOpen}
        onConfirm={() => onCancel?.()}
      />
    </>
  )
}

function FormSection({
  children,
  description,
  isOptional = false,
  optionalLabel,
  title,
}: {
  children: ReactNode
  description: string
  isOptional?: boolean
  optionalLabel?: string
  title: string
}) {
  return (
    <section
      className={cn(
        "space-y-4 border-t border-border/70 py-5 first:border-t-0",
        isOptional && "pb-4",
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-tight text-foreground">
            {title}
          </h2>
          {isOptional ? (
            <span className="rounded-full border border-border/70 px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
              {optionalLabel}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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
        // Accessibility: aria-describedby points each field to this message.
        <p id={errorId} className="text-xs leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function getFieldAccessibilityProps(fieldId: string, error?: string) {
  // Accessibility: links invalid fields to their validation message.
  return {
    "aria-describedby": error === undefined ? undefined : `${fieldId}-error`,
    "aria-invalid": error !== undefined,
  }
}

function getSubmitGuidance(
  values: Partial<InvestmentFormValues>,
  investmentType: InvestmentType | undefined,
  t: TFunction,
) {
  const missingFields = SAVE_REQUIREMENTS.filter((requirement) =>
    isRequirementMissing(requirement, values, investmentType),
  ).map((requirement) => t(`invest.form.fields.${requirement.label}`))

  if (missingFields.length > 0) {
    return t("invest.form.guidance.completeFields", {
      fields: formatInlineList(missingFields, t("invest.form.guidance.and")),
    })
  }

  return t("invest.form.guidance.reviewFields")
}

function isRequirementMissing(
  requirement: SaveRequirement,
  values: Partial<InvestmentFormValues>,
  investmentType: InvestmentType | undefined,
) {
  if (
    requirement.investmentType !== undefined &&
    requirement.investmentType !== investmentType
  ) {
    return false
  }

  const value = values[requirement.field]

  if (typeof value === "number") {
    return !Number.isFinite(value)
  }

  return typeof value !== "string" || value.trim() === ""
}

function formatInlineList(items: string[], conjunction: string) {
  if (items.length === 1) {
    return items[0]
  }

  if (items.length === 2) {
    return `${items[0]} ${conjunction} ${items[1]}`
  }

  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items.at(-1)}`
}
