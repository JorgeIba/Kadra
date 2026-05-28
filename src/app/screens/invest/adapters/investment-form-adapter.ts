import {
  INVESTMENT_TYPES,
  toDateString,
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
  return {
    ...mapInvestmentFormToInvestment(values, {
      id: investment.id,
      now: options.asOfDate.toISOString(),
      startDate: investment.startDate,
    }),
    createdAt: investment.createdAt,
  }
}

export function mapInvestmentToFormValues(
  investment: Investment,
): InvestmentFormValues {
  const commonFormValues = {
    annualRate: investment.annualRate,
    currency: investment.currency,
    institutionName: investment.institutionName,
    investmentType: investment.type,
    name: investment.name,
    notes: investment.notes ?? "",
    originalAmount: investment.originalAmount,
    paymentFrequency: investment.paymentFrequency,
    reinvestmentBehavior: investment.reinvestmentBehavior,
  }

  if (investment.type === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonFormValues,
      endDate: investment.endDate,
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
  const commonInvestmentFields = {
    annualRate: values.annualRate,
    createdAt: metadata.now,
    currency: values.currency,
    id: metadata.id,
    institutionName: values.institutionName,
    name: values.name,
    originalAmount: values.originalAmount,
    paymentFrequency: values.paymentFrequency,
    reinvestmentBehavior: values.reinvestmentBehavior,
    startDate: metadata.startDate,
    updatedAt: metadata.now,
    ...(notes === undefined ? {} : { notes }),
  }

  if (values.investmentType === INVESTMENT_TYPES.fixedTerm) {
    return {
      ...commonInvestmentFields,
      endDate: values.endDate,
      type: INVESTMENT_TYPES.fixedTerm,
    }
  }

  return {
    ...commonInvestmentFields,
    type: INVESTMENT_TYPES.openEnded,
  }
}
