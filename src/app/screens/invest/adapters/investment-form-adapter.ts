import { INVESTMENT_TYPES, type Investment } from "@/domain/investments"
import type { InvestmentFormValues } from "@/app/screens/invest/investment-form-schema"

interface InvestmentFormAdapterMetadata {
  id: string
  now: string
  startDate: string
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
