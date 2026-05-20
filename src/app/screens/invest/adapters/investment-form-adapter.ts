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

interface CreateInvestmentFromFormOptions {
  asOfDate: Date
  id: string
}

interface InvestmentFormPreviewOptions {
  asOfDate?: Date
}

const PREVIEW_INVESTMENT_ID = "investment-preview"

export function createInvestmentFromFormValues(
  values: InvestmentFormValues,
  options: CreateInvestmentFromFormOptions,
): Investment {
  return mapInvestmentFormToInvestment(values, {
    id: options.id,
    now: options.asOfDate.toISOString(),
    startDate: toDateString(options.asOfDate),
  })
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
  return createInvestmentFromFormValues(parsedValues.data, {
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
