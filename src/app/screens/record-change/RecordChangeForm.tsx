import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import {
  isCalendarDateString,
  toDateString,
  type Investment,
} from "@/domain/investments"
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
    formState: { errors, isValid },
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

  const [effectiveDate, transactionType, investmentType, paymentFrequency] =
    useWatch({
      control,
      name: [
        "effectiveDate",
        "transactionType",
        "investmentType",
        "paymentFrequency",
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

      {errorMessage === undefined ? null : (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
          {errorMessage}
        </p>
      )}

      <RecordChangeFormActions isValid={canSubmit} onCancel={onCancel} />
    </form>
  )
}
