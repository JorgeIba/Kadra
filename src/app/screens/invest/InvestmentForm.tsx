import { useState, type ReactNode } from "react"
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
  originalAmount: "original-amount",
  paymentFrequency: "payment-frequency",
  reinvestmentBehavior: "reinvestment",
} as const

interface InvestmentFormProps {
  initialValues?: InvestmentFormValues
  onCancel?: () => void
  cancelLabel?: string
  onSubmit: (values: InvestmentFormValues) => void
  submitLabel?: string
  successMessage?: string
}

export function InvestmentForm({
  initialValues,
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

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(handleValidSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>
              Name the investment and where the money lives.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Input
                id={FORM_FIELD_IDS.institutionName}
                placeholder="CETES Directo"
                {...getFieldAccessibilityProps(
                  FORM_FIELD_IDS.institutionName,
                  errors.institutionName?.message,
                )}
                {...register("institutionName")}
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
                error={errors.originalAmount?.message}
                label="Original amount"
                htmlFor={FORM_FIELD_IDS.originalAmount}
              >
                <Input
                  id={FORM_FIELD_IDS.originalAmount}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="10000"
                  {...getFieldAccessibilityProps(
                    FORM_FIELD_IDS.originalAmount,
                    errors.originalAmount?.message,
                  )}
                  {...register("originalAmount", { valueAsNumber: true })}
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

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Optional context for future you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: rate renewal expected after maturity."
              {...register("notes")}
            />
          </CardContent>
        </Card>

        <InvestmentFormPreview investment={previewInvestment} />

        <div className="grid gap-2">
          <Button type="submit" className="w-full" disabled={!isValid}>
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
