import { useState, type ReactNode } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  CURRENCIES,
  CURRENCY_LABELS,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  PAYMENT_FREQUENCY_LABELS,
  REINVESTMENT_BEHAVIORS,
  REINVESTMENT_BEHAVIOR_LABELS,
  toDateString,
  type Currency,
  type InvestmentType,
  type PaymentFrequency,
  type ReinvestmentBehavior,
} from "@/domain/investments"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { getInvestmentFormPreview } from "@/app/screens/invest/adapters/investment-form-adapter"
import { InvestmentFormPreview } from "@/app/screens/invest/InvestmentFormPreview"
import {
  investmentFormSchema,
  type InvestmentFormValues,
} from "@/app/screens/invest/investment-form-schema"
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
  { field: "name", label: "name" },
  { field: "institutionName", label: "institution" },
  { field: "contributionAmount", label: "amount" },
  { field: "annualRate", label: "annual rate" },
  { field: "startDate", label: "start date" },
  {
    field: "endDate",
    investmentType: INVESTMENT_TYPES.fixedTerm,
    label: "end date",
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
  cancelLabel = "Cancel",
  onSubmit,
  submitLabel = "Save investment",
  successMessage = "Draft is valid. Saving comes next.",
}: InvestmentFormProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const {
    control,
    formState: { errors, isDirty, isSubmitSuccessful, isValid },
    handleSubmit,
    register,
    setValue,
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
    resolver: zodResolver(investmentFormSchema),
    shouldUnregister: true,
  })

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
  const previewInvestment = getInvestmentFormPreview(previewValues)
  const paymentFrequencyOptions =
    investmentType === INVESTMENT_TYPES.openEnded
      ? PAYMENT_FREQUENCY_OPTIONS.filter((frequency) => {
          return frequency !== PAYMENT_FREQUENCIES.atMaturity
        })
      : PAYMENT_FREQUENCY_OPTIONS
  const submitGuidance = isValid
    ? undefined
    : getSubmitGuidance(previewValues, investmentType)

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="border-y border-border/70">
          <FormSection
            title="Identity"
            description="Name the investment and where the money lives."
          >
            <Field
              error={errors.name?.message}
              label="Investment name"
              htmlFor={FORM_FIELD_IDS.name}
            >
              <Input
                id={FORM_FIELD_IDS.name}
                placeholder="CETES 6 months"
                {...getFieldAccessibilityProps(
                  FORM_FIELD_IDS.name,
                  errors.name?.message,
                )}
                {...register("name")}
              />
            </Field>

            <Field
              error={errors.institutionName?.message}
              label="Institution"
              htmlFor={FORM_FIELD_IDS.institutionName}
            >
              <Controller
                control={control}
                name="institutionName"
                render={({ field: institutionNameField }) => (
                  <InstitutionCombobox
                    id={FORM_FIELD_IDS.institutionName}
                    name={institutionNameField.name}
                    placeholder="CETES Directo"
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
            title="Terms"
            description="These values drive the future projection."
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
                error={errors.currency?.message}
                label="Currency"
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
                              ? "Select currency"
                              : CURRENCY_LABELS[value]
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {CURRENCY_LABELS[option]}
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
                label="Contribution amount"
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

            {isStartDateEditable ? (
              <Field
                error={errors.startDate?.message}
                label="Start date"
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
                label="End date"
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
                  Required for fixed-term investments.
                </p>
              </Field>
            ) : null}
          </FormSection>

          <FormSection
            title="Returns"
            description="Define how often returns are paid and where they go."
          >
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

          <FormSection
            title="Notes"
            description="Optional context for future you."
            isOptional
          >
            <Field htmlFor={FORM_FIELD_IDS.notes} label="Private note">
              <Textarea
                id={FORM_FIELD_IDS.notes}
                placeholder="Example: rate renewal expected after maturity."
                {...register("notes")}
              />
            </Field>
          </FormSection>
        </div>

        <InvestmentFormPreview investment={previewInvestment} />

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
            {submitLabel}
          </Button>

          {onCancel === undefined ? null : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCancelRequest}
            >
              {cancelLabel}
            </Button>
          )}
        </div>

        {isSubmitSuccessful ? (
          <p className="text-center text-sm font-medium text-primary">
            {successMessage}
          </p>
        ) : null}
      </form>

      <ConfirmDialog
        open={isDiscardDialogOpen}
        title="Discard changes?"
        description="You have unsaved changes. If you leave now, those changes will be lost."
        confirmLabel="Discard changes"
        variant="destructive"
        onRequestOpenChange={setIsDiscardDialogOpen}
        onConfirm={() => onCancel?.()}
      />
    </>
  )
}

function InstitutionCombobox({
  id,
  name,
  onBlur,
  onValueChange,
  placeholder,
  suggestions,
  value,
  ...accessibilityProps
}: {
  id: string
  name: string
  placeholder: string
  suggestions: string[]
  value: string
  onBlur: () => void
  onValueChange: (value: string) => void
  "aria-describedby"?: string
  "aria-invalid"?: boolean
}) {
  return (
    <Autocomplete.Root
      items={suggestions}
      value={value}
      onValueChange={onValueChange}
      limit={6}
      autoHighlight
      filter={(suggestion, query) => {
        return suggestion
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      }}
    >
      <Autocomplete.Input
        id={id}
        name={name}
        placeholder={placeholder}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        )}
        value={value}
        onBlur={onBlur}
        {...accessibilityProps}
      />

      <Autocomplete.Portal>
        <Autocomplete.Positioner
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <Autocomplete.Popup className="relative isolate z-50 max-h-48 w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Autocomplete.List>
              {(suggestion: string) => (
                <Autocomplete.Item
                  key={suggestion}
                  value={suggestion}
                  className="block w-full cursor-default rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:bg-accent data-selected:text-accent-foreground"
                >
                  {suggestion}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

function FormSection({
  children,
  description,
  isOptional = false,
  title,
}: {
  children: ReactNode
  description: string
  isOptional?: boolean
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
              Optional
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
) {
  const missingFields = SAVE_REQUIREMENTS.filter((requirement) =>
    isRequirementMissing(requirement, values, investmentType),
  ).map((requirement) => requirement.label)

  if (missingFields.length > 0) {
    return `Complete ${formatInlineList(missingFields)} to save this investment.`
  }

  return "Review the highlighted fields to save this investment."
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

function formatInlineList(items: string[]) {
  if (items.length === 1) {
    return items[0]
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`
}
