import { Controller, useController } from "react-hook-form"
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form"
import { ArrowDownLeft, ArrowUpRight, Ban } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ExpandingChoicePicker,
  type ExpandingChoicePickerOption,
} from "@/app/components/ExpandingChoicePicker"
import { MoneyAmount } from "@/app/components/MoneyAmount"
import { usePickerWithDependentContent } from "@/app/components/use-picker-with-dependent-content"
import {
  Field,
  FormSection,
  InlineNotice,
} from "@/app/screens/record-change/RecordChangeFormPrimitives"
import { getFieldAccessibilityProps } from "@/app/screens/record-change/record-change-form-field-accessibility"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"
import { Input } from "@/components/ui/input"

type MoneyMovementType = RecordChangeFormValues["transactionType"]

const MONEY_MOVEMENT_OPTIONS = [
  {
    compactDescription: "No change",
    description: "Only record rate or term changes.",
    icon: Ban,
    label: "No movement",
    summary: "No money movement",
    value: "none",
  },
  {
    compactDescription: "Add capital",
    description: "Add new capital to this investment.",
    icon: ArrowDownLeft,
    label: "Deposit",
    summary: "Deposit money",
    value: "contribution",
  },
  {
    compactDescription: "Cash out",
    description: "Take capital out of this investment.",
    icon: ArrowUpRight,
    label: "Withdrawal",
    summary: "Withdraw money",
    value: "withdrawal",
  },
] as const satisfies readonly ExpandingChoicePickerOption<MoneyMovementType>[]

const MONEY_MOVEMENT_DETAILS_REFLOW_TRANSITION = {
  bounce: 0.04,
  duration: 0.3,
  type: "spring",
} as const

const MONEY_MOVEMENT_DETAILS_CONTENT_TRANSITION = {
  bounce: 0.02,
  duration: 0.22,
  type: "spring",
} as const

const MONEY_MOVEMENT_FIELD_IDS = {
  contributionAmount: "record-change-contribution-amount",
} as const

interface MoneyMovementDetailsView {
  amount: number
  amountLabel: string
  notice: string
  tone: "success" | "destructive"
}

interface MoneyMovementSectionProps {
  availableContribution: number
  activeBalance: number
  control: Control<RecordChangeFormValues>
  errors: FieldErrors<RecordChangeFormValues>
  setValue: UseFormSetValue<RecordChangeFormValues>
}

/** The transaction picker and its dependent notice-and-amount form region. */
export function MoneyMovementSection({
  availableContribution,
  activeBalance,
  control,
  errors,
  setValue,
}: MoneyMovementSectionProps) {
  // The picker replaces native radios, so this controller keeps the form field
  // registered while the form opts into unregistering absent fields.
  const { field: transactionTypeField } = useController({
    control,
    name: "transactionType",
  })
  const transactionType = transactionTypeField.value
  const pickerInteraction = usePickerWithDependentContent({
    hasVisibleDependentContent: transactionType !== "none",
  })

  function handlePickerValueChange(value: MoneyMovementType) {
    transactionTypeField.onChange(value)

    if (value === "none") {
      setValue("contributionAmount", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  return (
    <FormSection
      title="Money movement"
      description="Optional. Record a deposit or withdrawal on this date."
    >
      <ExpandingChoicePicker
        ariaLabel="Money movement"
        animationSpeed="quick"
        canStartPendingOpening={pickerInteraction.canStartPendingPickerOpening}
        legend="Choose a money movement"
        onCloseComplete={pickerInteraction.onPickerCloseComplete}
        onOpenRequest={pickerInteraction.onPickerOpenRequest}
        onValueChange={handlePickerValueChange}
        options={MONEY_MOVEMENT_OPTIONS}
        value={transactionType}
      />

      <MoneyMovementDetails
        activeBalance={activeBalance}
        availableContribution={availableContribution}
        amountError={errors.contributionAmount?.message}
        control={control}
        isVisible={pickerInteraction.shouldRenderDependentContent}
        onExitComplete={pickerInteraction.onDependentContentExitComplete}
        transactionType={transactionType}
      />
    </FormSection>
  )
}

/**
 * The conditional notice-and-input region below the picker. Its controller
 * stays mounted while the visible content exits, so opening the picker cannot
 * unregister a typed amount before the user makes a final selection.
 */
function MoneyMovementDetails({
  activeBalance,
  amountError,
  availableContribution,
  control,
  isVisible,
  onExitComplete,
  transactionType,
}: {
  activeBalance: number
  amountError: string | undefined
  availableContribution: number
  control: Control<RecordChangeFormValues>
  isVisible: boolean
  onExitComplete: () => void
  transactionType: MoneyMovementType
}) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const containerTransition = prefersReducedMotion
    ? { duration: 0 }
    : MONEY_MOVEMENT_DETAILS_REFLOW_TRANSITION
  const contentTransition = prefersReducedMotion
    ? { duration: 0 }
    : MONEY_MOVEMENT_DETAILS_CONTENT_TRANSITION

  let detailsForTransaction: MoneyMovementDetailsView | undefined

  switch (transactionType) {
    case "none":
      detailsForTransaction = undefined
      break
    case "contribution":
      detailsForTransaction = {
        amount: availableContribution,
        amountLabel: "Added amount",
        notice: "Net capital contributed on this date:",
        tone: "success",
      }
      break
    case "withdrawal":
      detailsForTransaction = {
        amount: activeBalance,
        amountLabel: "Withdrawn amount",
        notice: "Available active balance to withdraw on this date:",
        tone: "destructive",
      }
      break
  }

  const visibleDetails = isVisible ? detailsForTransaction : undefined
  const shouldRenderDetails = visibleDetails !== undefined

  return (
    <Controller
      control={control}
      name="contributionAmount"
      render={({ field: contributionAmountField }) => {
        const amountInputValue =
          typeof contributionAmountField.value === "number" &&
          Number.isFinite(contributionAmountField.value)
            ? contributionAmountField.value
            : ""

        return (
          <motion.div
            layout
            aria-live={shouldRenderDetails ? "polite" : undefined}
            transition={{ layout: containerTransition }}
          >
            <AnimatePresence initial={false} onExitComplete={onExitComplete}>
              {visibleDetails !== undefined ? (
                <motion.div
                  key={transactionType}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={contentTransition}
                  className="space-y-4"
                >
                  <InlineNotice tone={visibleDetails.tone}>
                    {visibleDetails.notice}{" "}
                    <span className="font-semibold text-foreground">
                      <MoneyAmount value={visibleDetails.amount} />
                    </span>
                  </InlineNotice>

                  <Field
                    error={amountError}
                    label={visibleDetails.amountLabel}
                    htmlFor={MONEY_MOVEMENT_FIELD_IDS.contributionAmount}
                  >
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 border-r py-1 pr-3 text-xs font-semibold text-muted-foreground select-none">
                        MXN $
                      </span>
                      <Input
                        id={MONEY_MOVEMENT_FIELD_IDS.contributionAmount}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        placeholder="2500"
                        className="h-12 pl-20 text-lg font-semibold"
                        name={contributionAmountField.name}
                        value={amountInputValue}
                        onBlur={contributionAmountField.onBlur}
                        onChange={(event) => {
                          const nextAmount = event.currentTarget.valueAsNumber
                          contributionAmountField.onChange(
                            Number.isNaN(nextAmount) ? undefined : nextAmount,
                          )
                        }}
                        ref={contributionAmountField.ref}
                        {...getFieldAccessibilityProps(
                          MONEY_MOVEMENT_FIELD_IDS.contributionAmount,
                          amountError,
                        )}
                      />
                    </div>
                  </Field>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )
      }}
    />
  )
}
