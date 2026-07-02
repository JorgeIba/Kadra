import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import {
  isCalendarDateString,
  toDateString,
  type Investment,
} from "@/domain/investments"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import {
  getAvailableContributionAmountAtDate,
  getActiveBalanceAtDate,
  getLatestInvestmentEventDate,
  mapInvestmentToRecordChangeFormValues,
} from "@/app/screens/record-change/adapters/record-change-adapter"
import {
  CurrentTermsSection,
  EffectiveDateSection,
  MoneyMovementSection,
  RecordChangeFormActions,
  RecordChangeSummary,
} from "@/app/screens/record-change/RecordChangeFormSections"
import {
  createRecordChangeFormSchema,
  type RecordChangeFormValues,
} from "@/app/screens/record-change/record-change-form-schema"
import { getRecordChangeSaveState } from "@/app/screens/record-change/record-change-form-view-model"

interface RecordChangeFormProps {
  investment: Investment
  errorMessage?: string
  onCancel: () => void
  onChange?: () => void
  onSubmit: (values: RecordChangeFormValues) => void
}

export function RecordChangeForm({
  investment,
  errorMessage,
  onCancel,
  onChange,
  onSubmit,
}: RecordChangeFormProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const latestEventDate = getLatestInvestmentEventDate(investment)
  const today = toDateString(new Date())

  const resolver: Resolver<RecordChangeFormValues> = useMemo(() => {
    return (values, context, options) => {
      const activeBalance =
        isCalendarDateString(values.effectiveDate) === true
          ? getActiveBalanceAtDate(investment, values.effectiveDate)
          : 0

      return zodResolver(
        createRecordChangeFormSchema({
          latestEventDate,
          today,
          activeBalance,
        }),
      )(values, context, options)
    }
  }, [investment, latestEventDate, today])

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    register,
    setValue,
    subscribe,
  } = useForm<RecordChangeFormValues>({
    defaultValues: mapInvestmentToRecordChangeFormValues(investment),
    mode: "onChange",
    resolver,
    shouldUnregister: true,
  })

  const [
    effectiveDate,
    transactionType,
    contributionAmount,
    investmentType,
    annualRate,
    maturityDate,
    paymentFrequency,
    reinvestmentBehavior,
  ] = useWatch({
    control,
    name: [
      "effectiveDate",
      "transactionType",
      "contributionAmount",
      "investmentType",
      "annualRate",
      "maturityDate",
      "paymentFrequency",
      "reinvestmentBehavior",
    ],
  })

  const availableContribution =
    isCalendarDateString(effectiveDate) === true
      ? getAvailableContributionAmountAtDate(investment, effectiveDate)
      : 0

  const activeBalance =
    isCalendarDateString(effectiveDate) === true
      ? getActiveBalanceAtDate(investment, effectiveDate)
      : 0

  // Resolve the investment state at this date so the form starts from the
  // facts that were active before or on the selected effective date.
  const investmentStateAtEffectiveDate = useMemo(() => {
    if (!isCalendarDateString(effectiveDate)) {
      return null
    }

    try {
      return mapInvestmentToRecordChangeFormValues(investment, {
        effectiveDate,
      })
    } catch {
      return null
    }
  }, [effectiveDate, investment])

  const saveState = getRecordChangeSaveState({
    baseline: investmentStateAtEffectiveDate,
    draft: {
      annualRate,
      contributionAmount,
      effectiveDate,
      investmentType,
      maturityDate,
      paymentFrequency,
      reinvestmentBehavior,
      transactionType,
    },
  })
  const canSubmit = isValid && saveState.canSave
  const submitGuidance = getSubmitGuidance({
    isValid,
    saveState,
  })

  function handleCancelRequest() {
    if (!isDirty) {
      onCancel()
      return
    }

    setIsDiscardDialogOpen(true)
  }

  useEffect(() => {
    if (onChange === undefined) {
      return
    }

    return subscribe({
      formState: { values: true },
      callback: () => {
        onChange()
      },
    })
  }, [onChange, subscribe])

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="border-y border-border/70">
          <EffectiveDateSection
            maxEffectiveDate={today}
            errors={errors}
            register={register}
          />

          <MoneyMovementSection
            availableContribution={availableContribution}
            activeBalance={activeBalance}
            errors={errors}
            transactionType={transactionType}
            register={register}
          />

          <CurrentTermsSection
            control={control}
            errors={errors}
            investmentType={investmentType}
            paymentFrequency={paymentFrequency}
            register={register}
            setValue={setValue}
          />
        </div>

        <RecordChangeSummary
          activeBalance={activeBalance}
          annualRate={annualRate}
          contributionAmount={contributionAmount}
          effectiveDate={effectiveDate}
          investmentType={investmentType}
          maturityDate={maturityDate}
          paymentFrequency={paymentFrequency}
          transactionType={transactionType}
        />

        {errorMessage === undefined ? null : (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
            {errorMessage}
          </p>
        )}

        <RecordChangeFormActions
          isValid={canSubmit}
          submitGuidance={submitGuidance}
          onCancelRequest={handleCancelRequest}
        />
      </form>

      <ConfirmDialog
        open={isDiscardDialogOpen}
        title="Discard record?"
        description="You have unsaved changes. If you leave now, this record will not be saved."
        confirmLabel="Discard record"
        variant="destructive"
        onRequestOpenChange={setIsDiscardDialogOpen}
        onConfirm={onCancel}
      />
    </>
  )
}

function getSubmitGuidance({
  isValid,
  saveState,
}: {
  isValid: boolean
  saveState: ReturnType<typeof getRecordChangeSaveState>
}) {
  if (!saveState.canSave) {
    return saveState.guidance
  }

  if (!isValid) {
    return "Review the highlighted fields to save this record."
  }

  return saveState.guidance
}
