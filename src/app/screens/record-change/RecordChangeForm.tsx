import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import {
  isCalendarDateString,
  toDateString,
  type Investment,
} from "@/domain/investments"
import {
  getAvailableContributionAmountAtDate,
  getLatestInvestmentEventDate,
  mapInvestmentToRecordChangeFormValues,
} from "@/app/screens/record-change/adapters/record-change-adapter"
import {
  CurrentTermsSection,
  EffectiveDateSection,
  MoneyMovementSection,
  RecordChangeFormActions,
} from "@/app/screens/record-change/RecordChangeFormSections"
import {
  createRecordChangeFormSchema,
  type RecordChangeFormValues,
} from "@/app/screens/record-change/record-change-form-schema"

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
  const latestEventDate = getLatestInvestmentEventDate(investment)
  const today = toDateString(new Date())
  const formSchema = useMemo(() => {
    return createRecordChangeFormSchema({ latestEventDate, today })
  }, [latestEventDate, today])
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    setValue,
    subscribe,
  } = useForm<RecordChangeFormValues>({
    defaultValues: mapInvestmentToRecordChangeFormValues(investment),
    mode: "onChange",
    resolver: zodResolver(formSchema),
    shouldUnregister: true,
  })

  const effectiveDate = useWatch({ control, name: "effectiveDate" })
  const hasContribution = useWatch({ control, name: "hasContribution" })
  const investmentType = useWatch({ control, name: "investmentType" })
  const paymentFrequency = useWatch({ control, name: "paymentFrequency" })
  const availableContribution =
    isCalendarDateString(effectiveDate) === true
      ? getAvailableContributionAmountAtDate(investment, effectiveDate)
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

  const canSubmit = isValid && investmentStateAtEffectiveDate !== null

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <EffectiveDateSection
        maxEffectiveDate={today}
        errors={errors}
        register={register}
      />

      <MoneyMovementSection
        availableContribution={availableContribution}
        errors={errors}
        hasContribution={hasContribution}
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

      {errorMessage === undefined ? null : (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
          {errorMessage}
        </p>
      )}

      <RecordChangeFormActions isValid={canSubmit} onCancel={onCancel} />
    </form>
  )
}
