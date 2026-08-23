import type { TFunction } from "i18next"
import {
  INVESTMENT_TYPES,
  getInvestmentBalanceState,
  type InvestmentContributionEvent,
  type InvestmentLifecycleEvent,
  type InvestmentRateEvent,
  type Investment,
} from "@/domain/investments"
import {
  createInvestmentFormSchema,
  type InvestmentFormValues,
} from "@/app/screens/invest/investment-form-schema"

interface InvestmentFormAdapterMetadata {
  id: string
  now: string
}

interface BuildInvestmentFromFormOptions {
  asOfDate: Date
  id: string
}

interface InvestmentFormPreviewOptions {
  t: TFunction
  asOfDate?: Date
}

const PREVIEW_INVESTMENT_ID = "investment-preview"

export function buildInvestmentFromFormValues(
  values: InvestmentFormValues,
  options: BuildInvestmentFromFormOptions,
): Investment {
  return mapInvestmentFormToInvestment(values, {
    id: options.id,
    now: options.asOfDate.toISOString(),
  })
}

export function buildUpdatedInvestmentFromFormValues(
  values: InvestmentFormValues,
  investment: Investment,
  options: { asOfDate: Date },
): Investment {
  const now = options.asOfDate.toISOString()
  const latestContributionEvent = getLatestContributionEventOrThrow(investment)
  const latestRateEvent = getLatestRateEventOrThrow(investment)
  const latestLifecycleEvent = getLatestLifecycleEventOrThrow(investment)
  const editableStartDate = canEditInvestmentStartDate(investment)
    ? values.startDate
    : undefined

  return {
    ...investment,
    currency: values.currency,
    institutionName: values.institutionName,
    name: values.name,
    notes: values.notes === "" ? undefined : values.notes,
    updatedAt: now,
    contributionEvents: replaceLastHistoryEntry(investment.contributionEvents, {
      ...latestContributionEvent,
      amount: values.contributionAmount,
      effectiveDate: editableStartDate ?? latestContributionEvent.effectiveDate,
    }),
    rateEvents: replaceLastHistoryEntry(investment.rateEvents, {
      ...latestRateEvent,
      annualRate: values.annualRate,
      effectiveDate: editableStartDate ?? latestRateEvent.effectiveDate,
    }),
    lifecycleEvents: replaceLastHistoryEntry(
      investment.lifecycleEvents,
      buildUpdatedLifecycleEvent(values, latestLifecycleEvent, {
        effectiveDate: editableStartDate ?? latestLifecycleEvent.effectiveDate,
      }),
    ),
  }
}

export function mapInvestmentToFormValues(
  investment: Investment,
): InvestmentFormValues {
  const latestContributionEvent = getLatestContributionEventOrThrow(investment)
  const latestRateEvent = getLatestRateEventOrThrow(investment)
  const latestLifecycleEvent = getLatestLifecycleEventOrThrow(investment)
  const commonFormValues = {
    annualRate: latestRateEvent.annualRate,
    currency: investment.currency,
    institutionName: investment.institutionName,
    investmentType: latestLifecycleEvent.type,
    name: investment.name,
    notes: investment.notes ?? "",
    startDate: latestLifecycleEvent.effectiveDate,
    contributionAmount: latestContributionEvent.amount,
    paymentFrequency: latestLifecycleEvent.paymentFrequency,
    reinvestmentBehavior: latestLifecycleEvent.reinvestmentBehavior,
  }

  if (latestLifecycleEvent.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonFormValues,
      endDate: latestLifecycleEvent.maturityDate,
      investmentType: INVESTMENT_TYPES.fixedTerm,
    }
  }

  return {
    ...commonFormValues,
    investmentType: INVESTMENT_TYPES.openEnded,
  }
}

export function canEditInvestmentStartDate(investment: Investment): boolean {
  if (
    investment.contributionEvents.length !== 1 ||
    investment.rateEvents.length !== 1 ||
    investment.lifecycleEvents.length !== 1
  ) {
    return false
  }

  const contributionStartDate = investment.contributionEvents[0]?.effectiveDate
  const rateStartDate = investment.rateEvents[0]?.effectiveDate
  const lifecycleStartDate = investment.lifecycleEvents[0]?.effectiveDate

  return (
    contributionStartDate !== undefined &&
    contributionStartDate === rateStartDate &&
    contributionStartDate === lifecycleStartDate
  )
}

export function getInvestmentFormPreview(
  values: unknown,
  { asOfDate, t }: InvestmentFormPreviewOptions,
): Investment | null {
  const parsedValues = createInvestmentFormSchema(t).safeParse(values)

  if (!parsedValues.success) {
    return null
  }

  const previewDate = asOfDate ?? new Date()
  const previewInvestment = buildInvestmentFromFormValues(parsedValues.data, {
    asOfDate: previewDate,
    id: PREVIEW_INVESTMENT_ID,
  })

  if (!canResolveInvestmentPreview(previewInvestment, previewDate)) {
    return null
  }

  return previewInvestment
}

export function mapInvestmentFormToInvestment(
  values: InvestmentFormValues,
  metadata: InvestmentFormAdapterMetadata,
): Investment {
  const notes = values.notes === "" ? undefined : values.notes
  const investment: Investment = {
    createdAt: metadata.now,
    currency: values.currency,
    id: metadata.id,
    institutionName: values.institutionName,
    contributionEvents: [
      {
        id: `${metadata.id}-contribution-event-1`,
        amount: values.contributionAmount,
        effectiveDate: values.startDate,
        createdAt: metadata.now,
      },
    ],
    name: values.name,
    rateEvents: [
      {
        id: `${metadata.id}-rate-event-1`,
        annualRate: values.annualRate,
        effectiveDate: values.startDate,
        createdAt: metadata.now,
      },
    ],
    lifecycleEvents: [buildInitialLifecycleEvent(values, metadata)],
    updatedAt: metadata.now,
    ...(notes === undefined ? {} : { notes }),
  }

  return investment
}

function buildInitialLifecycleEvent(
  values: InvestmentFormValues,
  metadata: InvestmentFormAdapterMetadata,
): InvestmentLifecycleEvent {
  const baseLifecycleEvent = {
    id: `${metadata.id}-lifecycle-event-1`,
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    effectiveDate: values.startDate,
    createdAt: metadata.now,
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...baseLifecycleEvent,
      type: INVESTMENT_TYPES.fixedTerm,
      maturityDate: values.endDate,
    }
  }

  return {
    ...baseLifecycleEvent,
    type: INVESTMENT_TYPES.openEnded,
  }
}

function buildUpdatedLifecycleEvent(
  values: InvestmentFormValues,
  latestLifecycleEvent: InvestmentLifecycleEvent,
  options: { effectiveDate: string },
): InvestmentLifecycleEvent {
  const baseLifecycleEvent = {
    id: latestLifecycleEvent.id,
    createdAt: latestLifecycleEvent.createdAt,
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    effectiveDate: options.effectiveDate,
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...baseLifecycleEvent,
      type: INVESTMENT_TYPES.fixedTerm,
      maturityDate: values.endDate,
    }
  }

  return {
    ...baseLifecycleEvent,
    type: INVESTMENT_TYPES.openEnded,
  }
}
function getLatestContributionEventOrThrow(
  investment: Investment,
): InvestmentContributionEvent {
  const latestContributionEvent = investment.contributionEvents.at(-1)

  if (latestContributionEvent === undefined) {
    throw new Error(`Investment ${investment.id} has no contribution events`)
  }

  return latestContributionEvent
}

function getLatestRateEventOrThrow(
  investment: Investment,
): InvestmentRateEvent {
  const latestRateEvent = investment.rateEvents.at(-1)

  if (latestRateEvent === undefined) {
    throw new Error(`Investment ${investment.id} has no rate events`)
  }

  return latestRateEvent
}

function getLatestLifecycleEventOrThrow(
  investment: Investment,
): InvestmentLifecycleEvent {
  const latestLifecycleEvent = investment.lifecycleEvents.at(-1)

  if (latestLifecycleEvent === undefined) {
    throw new Error(`Investment ${investment.id} has no lifecycle events`)
  }

  return latestLifecycleEvent
}

function replaceLastHistoryEntry<TEntry>(
  historyEntries: TEntry[],
  nextEntry: TEntry,
): TEntry[] {
  return [...historyEntries.slice(0, -1), nextEntry]
}

function canResolveInvestmentPreview(
  investment: Investment,
  asOfDate: Date,
): boolean {
  const balanceState = getInvestmentBalanceState(investment, asOfDate)

  return (
    balanceState.currentLifecyclePeriod !== null &&
    balanceState.currentBalanceSegment !== null
  )
}
