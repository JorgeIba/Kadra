import {
  INVESTMENT_TYPES,
  compareCalendarDatesAscending,
  getContributionStateAtDate,
  toDateString,
  type CalendarDateString,
  type Investment,
  type InvestmentContributionEvent,
  type InvestmentLifecycleEvent,
  type InvestmentRateEvent,
  getInvestmentBalanceState,
  parseCalendarDate,
} from "@/domain/investments"
import {
  getRecordChangeEffectiveDateError,
  type RecordChangeFormValues,
} from "@/app/screens/record-change/record-change-form-schema"

interface BuildInvestmentWithRecordedChangeOptions {
  asOfDate: Date
}

export function buildInvestmentWithRecordedChangeFromFormValues(
  values: RecordChangeFormValues,
  investment: Investment,
  options: BuildInvestmentWithRecordedChangeOptions,
): Investment {
  const now = options.asOfDate.toISOString()
  const effectiveDate = values.effectiveDate
  const today = toDateString(options.asOfDate)
  const latestEventDate = getLatestInvestmentEventDate(investment)
  const effectiveDateError = getRecordChangeEffectiveDateError(effectiveDate, {
    latestEventDate,
    today,
  })

  if (effectiveDateError !== null) {
    throw new Error(effectiveDateError)
  }

  const activeRateEvent = getLatestRateEventAtOrBeforeDateOrThrow(
    investment,
    effectiveDate,
  )
  const activeLifecycleEvent = getLatestLifecycleEventAtOrBeforeDateOrThrow(
    investment,
    effectiveDate,
  )
  const contributionEvents = hasMoneyMovement(values)
    ? [
        ...investment.contributionEvents,
        buildContributionEvent(values, investment, now),
      ]
    : investment.contributionEvents
  const rateEvents =
    values.annualRate === activeRateEvent.annualRate
      ? investment.rateEvents
      : [...investment.rateEvents, buildRateEvent(values, investment, now)]
  const lifecycleEvents = isSameLifecycleFact(values, activeLifecycleEvent)
    ? investment.lifecycleEvents
    : [
        ...investment.lifecycleEvents,
        buildLifecycleEvent(values, investment, now),
      ]

  if (
    contributionEvents === investment.contributionEvents &&
    rateEvents === investment.rateEvents &&
    lifecycleEvents === investment.lifecycleEvents
  ) {
    throw new Error("Record at least one change before saving.")
  }

  return {
    ...investment,
    updatedAt: now,
    contributionEvents,
    rateEvents,
    lifecycleEvents,
  }
}

export function mapInvestmentToRecordChangeFormValues(
  investment: Investment,
  options: { effectiveDate?: CalendarDateString; asOfDate?: Date } = {},
): RecordChangeFormValues {
  const effectiveDate =
    options.effectiveDate ?? toDateString(options.asOfDate ?? new Date())
  const activeRateEvent = getLatestRateEventAtOrBeforeDateOrThrow(
    investment,
    effectiveDate,
  )
  const activeLifecycleEvent = getLatestLifecycleEventAtOrBeforeDateOrThrow(
    investment,
    effectiveDate,
  )
  const commonValues = {
    effectiveDate,
    transactionType: "none" as const,
    annualRate: activeRateEvent.annualRate,
    investmentType: activeLifecycleEvent.type,
    paymentFrequency: activeLifecycleEvent.paymentFrequency,
    reinvestmentBehavior: activeLifecycleEvent.reinvestmentBehavior,
  }

  if (activeLifecycleEvent.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonValues,
      investmentType: INVESTMENT_TYPES.fixedTerm,
      maturityDate: activeLifecycleEvent.maturityDate,
    }
  }

  return {
    ...commonValues,
    investmentType: INVESTMENT_TYPES.openEnded,
  }
}

export function getAvailableContributionAmountAtDate(
  investment: Investment,
  effectiveDate: CalendarDateString,
): number {
  return getContributionStateAtDate(investment, effectiveDate)
    .totalContributedAmount
}

export function getActiveBalanceAtDate(
  investment: Investment,
  effectiveDate: CalendarDateString,
): number {
  return getInvestmentBalanceState(investment, parseCalendarDate(effectiveDate))
    .currentInvestedAmount
}

export function getLatestInvestmentEventDate(
  investment: Investment,
): CalendarDateString {
  const latestEventDate = [
    ...investment.contributionEvents,
    ...investment.rateEvents,
    ...investment.lifecycleEvents,
  ]
    .map((event) => event.effectiveDate)
    .sort(compareCalendarDatesAscending)
    .at(-1)

  if (latestEventDate === undefined) {
    throw new Error(`Investment ${investment.id} has no history events.`)
  }

  return latestEventDate
}

function buildContributionEvent(
  values: RecordChangeFormValues & {
    transactionType: "contribution" | "withdrawal"
    contributionAmount: number
  },
  investment: Investment,
  now: string,
): InvestmentContributionEvent {
  return {
    id: getNextEventId(
      investment.id,
      "contribution-event",
      investment.contributionEvents.length,
    ),
    amount: values.contributionAmount,
    effectiveDate: values.effectiveDate,
    kind: values.transactionType,
    createdAt: now,
  }
}

function hasMoneyMovement(
  values: RecordChangeFormValues,
): values is RecordChangeFormValues & {
  transactionType: "contribution" | "withdrawal"
  contributionAmount: number
} {
  return (
    values.transactionType !== "none" && values.contributionAmount !== undefined
  )
}

function buildRateEvent(
  values: RecordChangeFormValues,
  investment: Investment,
  now: string,
): InvestmentRateEvent {
  return {
    id: getNextEventId(
      investment.id,
      "rate-event",
      investment.rateEvents.length,
    ),
    annualRate: values.annualRate,
    effectiveDate: values.effectiveDate,
    createdAt: now,
  }
}

function buildLifecycleEvent(
  values: RecordChangeFormValues,
  investment: Investment,
  now: string,
): InvestmentLifecycleEvent {
  const baseLifecycleEvent = {
    id: getNextEventId(
      investment.id,
      "lifecycle-event",
      investment.lifecycleEvents.length,
    ),
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    effectiveDate: values.effectiveDate,
    createdAt: now,
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...baseLifecycleEvent,
      type: INVESTMENT_TYPES.fixedTerm,
      maturityDate: values.maturityDate,
    }
  }

  return {
    ...baseLifecycleEvent,
    type: INVESTMENT_TYPES.openEnded,
  }
}

function isSameLifecycleFact(
  values: RecordChangeFormValues,
  lifecycleEvent: InvestmentLifecycleEvent,
): boolean {
  if (
    values.investmentType !== lifecycleEvent.type ||
    values.paymentFrequency !== lifecycleEvent.paymentFrequency ||
    values.reinvestmentBehavior !== lifecycleEvent.reinvestmentBehavior
  ) {
    return false
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return (
      lifecycleEvent.type === INVESTMENT_TYPES.fixedTerm &&
      values.maturityDate === lifecycleEvent.maturityDate
    )
  }

  return lifecycleEvent.type === INVESTMENT_TYPES.openEnded
}

function getLatestRateEventAtOrBeforeDateOrThrow(
  investment: Investment,
  effectiveDate: CalendarDateString,
): InvestmentRateEvent {
  const event = getLatestEventAtOrBeforeDate(
    investment.rateEvents,
    effectiveDate,
  )

  if (event === null) {
    throw new Error(
      `Investment ${investment.id} has no rate event at or before ${effectiveDate}`,
    )
  }

  return event
}

function getLatestLifecycleEventAtOrBeforeDateOrThrow(
  investment: Investment,
  effectiveDate: CalendarDateString,
): InvestmentLifecycleEvent {
  const event = getLatestEventAtOrBeforeDate(
    investment.lifecycleEvents,
    effectiveDate,
  )

  if (event === null) {
    throw new Error(
      `Investment ${investment.id} has no lifecycle event at or before ${effectiveDate}`,
    )
  }

  return event
}

function getLatestEventAtOrBeforeDate<
  TEvent extends {
    effectiveDate: CalendarDateString
    createdAt: string
    id: string
  },
>(events: TEvent[], effectiveDate: CalendarDateString): TEvent | null {
  return (
    events
      .filter((event) => {
        return (
          compareCalendarDatesAscending(event.effectiveDate, effectiveDate) <= 0
        )
      })
      .sort((leftEvent, rightEvent) => {
        const effectiveDateComparison = compareCalendarDatesAscending(
          leftEvent.effectiveDate,
          rightEvent.effectiveDate,
        )

        if (effectiveDateComparison !== 0) {
          return effectiveDateComparison
        }

        const createdAtComparison = leftEvent.createdAt.localeCompare(
          rightEvent.createdAt,
        )

        if (createdAtComparison !== 0) {
          return createdAtComparison
        }

        return leftEvent.id.localeCompare(rightEvent.id)
      })
      .at(-1) ?? null
  )
}

function getNextEventId(
  investmentId: string,
  eventName: string,
  eventCount: number,
): string {
  return `${investmentId}-${eventName}-${eventCount + 1}`
}
