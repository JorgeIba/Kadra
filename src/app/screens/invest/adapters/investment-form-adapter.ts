import {
  INVESTMENT_TYPES,
  toDateString,
  type InvestmentContribution,
  type InvestmentLifecyclePeriod,
  type InvestmentRatePeriod,
  type Investment,
} from "@/domain/investments"
import {
  investmentFormSchema,
  type InvestmentFormValues,
} from "@/app/screens/invest/investment-form-schema"

interface InvestmentFormAdapterMetadata {
  id: string
  now: string
  startDate: string
}

interface BuildInvestmentFromFormOptions {
  asOfDate: Date
  id: string
}

interface InvestmentFormPreviewOptions {
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
    startDate: toDateString(options.asOfDate),
  })
}

export function buildUpdatedInvestmentFromFormValues(
  values: InvestmentFormValues,
  investment: Investment,
  options: { asOfDate: Date },
): Investment {
  const now = options.asOfDate.toISOString()
  const latestContribution = getLatestContributionOrThrow(investment)
  const latestRatePeriod = getLatestRatePeriodOrThrow(investment)
  const latestLifecyclePeriod = getLatestLifecyclePeriodOrThrow(investment)

  return {
    ...investment,
    currency: values.currency,
    institutionName: values.institutionName,
    name: values.name,
    notes: values.notes === "" ? undefined : values.notes,
    updatedAt: now,
    contributions: replaceLastHistoryEntry(investment.contributions, {
      ...latestContribution,
      amount: values.originalAmount,
    }),
    ratePeriods: replaceLastHistoryEntry(investment.ratePeriods, {
      ...latestRatePeriod,
      annualRate: values.annualRate,
    }),
    lifecyclePeriods: replaceLastHistoryEntry(
      investment.lifecyclePeriods,
      buildUpdatedLifecyclePeriod(values, latestLifecyclePeriod),
    ),
  }
}

export function mapInvestmentToFormValues(
  investment: Investment,
): InvestmentFormValues {
  const latestContribution = getLatestContributionOrThrow(investment)
  const latestRatePeriod = getLatestRatePeriodOrThrow(investment)
  const latestLifecyclePeriod = getLatestLifecyclePeriodOrThrow(investment)
  const commonFormValues = {
    annualRate: latestRatePeriod.annualRate,
    currency: investment.currency,
    institutionName: investment.institutionName,
    investmentType: latestLifecyclePeriod.type,
    name: investment.name,
    notes: investment.notes ?? "",
    originalAmount: latestContribution.amount,
    paymentFrequency: latestLifecyclePeriod.paymentFrequency,
    reinvestmentBehavior: latestLifecyclePeriod.reinvestmentBehavior,
  }

  if (latestLifecyclePeriod.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonFormValues,
      endDate: latestLifecyclePeriod.endDate,
      investmentType: INVESTMENT_TYPES.fixedTerm,
    }
  }

  return {
    ...commonFormValues,
    investmentType: INVESTMENT_TYPES.openEnded,
  }
}

export function getInvestmentFormPreview(
  values: unknown,
  options: InvestmentFormPreviewOptions = {},
): Investment | null {
  const parsedValues = investmentFormSchema.safeParse(values)

  if (!parsedValues.success) {
    return null
  }

  const asOfDate = options.asOfDate ?? new Date()
  return buildInvestmentFromFormValues(parsedValues.data, {
    asOfDate,
    id: PREVIEW_INVESTMENT_ID,
  })
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
    contributions: [
      {
        id: `${metadata.id}-contribution-1`,
        amount: values.originalAmount,
        contributionDate: metadata.startDate,
        createdAt: metadata.now,
      },
    ],
    name: values.name,
    ratePeriods: [
      {
        id: `${metadata.id}-rate-period-1`,
        annualRate: values.annualRate,
        startDate: metadata.startDate,
        createdAt: metadata.now,
      },
    ],
    lifecyclePeriods: [buildInitialLifecyclePeriod(values, metadata)],
    updatedAt: metadata.now,
    ...(notes === undefined ? {} : { notes }),
  }

  return investment
}

function buildInitialLifecyclePeriod(
  values: InvestmentFormValues,
  metadata: InvestmentFormAdapterMetadata,
): InvestmentLifecyclePeriod {
  const baseLifecyclePeriod = {
    id: `${metadata.id}-lifecycle-period-1`,
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    startDate: metadata.startDate,
    createdAt: metadata.now,
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...baseLifecyclePeriod,
      type: INVESTMENT_TYPES.fixedTerm,
      endDate: values.endDate,
    }
  }

  return {
    ...baseLifecyclePeriod,
    type: INVESTMENT_TYPES.openEnded,
  }
}

function buildUpdatedLifecyclePeriod(
  values: InvestmentFormValues,
  latestLifecyclePeriod: InvestmentLifecyclePeriod,
): InvestmentLifecyclePeriod {
  const baseLifecyclePeriod = {
    id: latestLifecyclePeriod.id,
    createdAt: latestLifecyclePeriod.createdAt,
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    startDate: latestLifecyclePeriod.startDate,
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...baseLifecyclePeriod,
      type: INVESTMENT_TYPES.fixedTerm,
      endDate: values.endDate,
    }
  }

  return {
    ...baseLifecyclePeriod,
    type: INVESTMENT_TYPES.openEnded,
  }
}
function getLatestContributionOrThrow(
  investment: Investment,
): InvestmentContribution {
  const latestContribution = investment.contributions.at(-1)

  if (latestContribution === undefined) {
    throw new Error(`Investment ${investment.id} has no contributions`)
  }

  return latestContribution
}

function getLatestRatePeriodOrThrow(investment: Investment): InvestmentRatePeriod {
  const latestRatePeriod = investment.ratePeriods.at(-1)

  if (latestRatePeriod === undefined) {
    throw new Error(`Investment ${investment.id} has no rate periods`)
  }

  return latestRatePeriod
}

function getLatestLifecyclePeriodOrThrow(
  investment: Investment,
): InvestmentLifecyclePeriod {
  const latestLifecyclePeriod = investment.lifecyclePeriods.at(-1)

  if (latestLifecyclePeriod === undefined) {
    throw new Error(`Investment ${investment.id} has no lifecycle periods`)
  }

  return latestLifecyclePeriod
}

function replaceLastHistoryEntry<TEntry>(
  historyEntries: TEntry[],
  nextEntry: TEntry,
): TEntry[] {
  return [...historyEntries.slice(0, -1), nextEntry]
}
