import {
  INVESTMENT_TYPES,
  isCalendarDateString,
  type InvestmentType,
} from "@/domain/investments"
import type { RecordChangeFormValues } from "@/app/screens/record-change/record-change-form-schema"

export interface RecordChangeDraft {
  annualRate: number | undefined
  contributionAmount: number | undefined
  effectiveDate: string | undefined
  investmentType: InvestmentType | undefined
  maturityDate: string | undefined
  paymentFrequency: RecordChangeFormValues["paymentFrequency"] | undefined
  reinvestmentBehavior:
    | RecordChangeFormValues["reinvestmentBehavior"]
    | undefined
  transactionType: RecordChangeFormValues["transactionType"] | undefined
}

export interface RecordChangeSaveState {
  canSave: boolean
  guidance: RecordChangeGuidance
}

export type RecordChangeGuidance =
  | { key: "changeSomething" }
  | { key: "chooseAppendableDate" }
  | { key: "chooseEffectiveDate" }
  | { key: "enterDepositAmount" }
  | { key: "enterWithdrawalAmount" }
  | { key: "ready" }

export function getRecordChangeSaveState({
  baseline,
  draft,
}: {
  baseline: RecordChangeFormValues | null
  draft: RecordChangeDraft
}): RecordChangeSaveState {
  if (
    typeof draft.effectiveDate !== "string" ||
    !isCalendarDateString(draft.effectiveDate)
  ) {
    return {
      canSave: false,
      guidance: { key: "chooseEffectiveDate" },
    }
  }

  if (baseline === null) {
    return {
      canSave: false,
      guidance: { key: "chooseAppendableDate" },
    }
  }

  if (requiresMoneyAmount(draft) && !hasPositiveAmount(draft)) {
    return {
      canSave: false,
      guidance:
        draft.transactionType === "contribution"
          ? { key: "enterDepositAmount" }
          : { key: "enterWithdrawalAmount" },
    }
  }

  if (!hasRecordableChange(draft, baseline)) {
    return {
      canSave: false,
      guidance: { key: "changeSomething" },
    }
  }

  return {
    canSave: true,
    guidance: { key: "ready" },
  }
}

function hasRecordableChange(
  draft: RecordChangeDraft,
  baseline: RecordChangeFormValues,
) {
  if (draft.transactionType !== undefined && draft.transactionType !== "none") {
    return true
  }

  if (draft.annualRate !== baseline.annualRate) {
    return true
  }

  if (draft.investmentType !== baseline.investmentType) {
    return true
  }

  if (draft.paymentFrequency !== baseline.paymentFrequency) {
    return true
  }

  if (draft.reinvestmentBehavior !== baseline.reinvestmentBehavior) {
    return true
  }

  if (
    draft.investmentType === INVESTMENT_TYPES.fixedTerm &&
    baseline.investmentType === INVESTMENT_TYPES.fixedTerm
  ) {
    return draft.maturityDate !== baseline.maturityDate
  }

  return false
}

function requiresMoneyAmount(draft: RecordChangeDraft) {
  return draft.transactionType !== undefined && draft.transactionType !== "none"
}

function hasPositiveAmount(draft: RecordChangeDraft) {
  return (
    typeof draft.contributionAmount === "number" &&
    Number.isFinite(draft.contributionAmount) &&
    draft.contributionAmount > 0
  )
}
