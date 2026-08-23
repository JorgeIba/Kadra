import { z } from "zod"
import type { TFunction } from "i18next"
import {
  CALENDAR_DATE_FORMAT_LABEL,
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  compareCalendarDatesAscending,
  isCalendarDateString,
  toDateString,
} from "@/domain/investments"

export function createInvestmentFormSchema(t: TFunction) {
  const dateOnlySchema = z.string().refine(isCalendarDateString, {
    message: t("invest.form.errors.invalidDate", {
      format: CALENDAR_DATE_FORMAT_LABEL,
    }),
  })

  const commonInvestmentFormSchema = z.object({
    name: z.string().trim().min(1, t("invest.form.errors.nameRequired")),
    institutionName: z
      .string()
      .trim()
      .min(1, t("invest.form.errors.institutionRequired")),
    startDate: dateOnlySchema,
    contributionAmount: z
      .number()
      .positive(t("invest.form.errors.contributionPositive")),
    annualRate: z.number().min(0, t("invest.form.errors.annualRateNegative")),
    currency: z.literal(CURRENCIES.mxn),
    paymentFrequency: z.enum([
      PAYMENT_FREQUENCIES.daily,
      PAYMENT_FREQUENCIES.weekly,
      PAYMENT_FREQUENCIES.monthly,
      PAYMENT_FREQUENCIES.atMaturity,
    ]),
    reinvestmentBehavior: z.enum([
      REINVESTMENT_BEHAVIORS.automatic,
      REINVESTMENT_BEHAVIORS.toCash,
    ]),
    notes: z.string().trim().optional(),
  })

  return z
    .discriminatedUnion("investmentType", [
      commonInvestmentFormSchema.extend({
        investmentType: z.literal(INVESTMENT_TYPES.fixedTerm),
        endDate: dateOnlySchema,
      }),
      commonInvestmentFormSchema.extend({
        investmentType: z.literal(INVESTMENT_TYPES.openEnded),
        endDate: z.string().optional(),
      }),
    ])
    .superRefine((values, context) => {
      if (
        compareCalendarDatesAscending(
          values.startDate,
          toDateString(new Date()),
        ) > 0
      ) {
        context.addIssue({
          code: "custom",
          message: t("invest.form.errors.startDateFuture"),
          path: ["startDate"],
        })
      }

      if (
        values.investmentType === INVESTMENT_TYPES.fixedTerm &&
        compareCalendarDatesAscending(values.endDate, values.startDate) <= 0
      ) {
        context.addIssue({
          code: "custom",
          message: t("invest.form.errors.endDateAfterStart"),
          path: ["endDate"],
        })
      }

      if (
        values.investmentType === INVESTMENT_TYPES.openEnded &&
        values.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
      ) {
        context.addIssue({
          code: "custom",
          message: t("invest.form.errors.atMaturityFixedTermOnly"),
          path: ["paymentFrequency"],
        })
      }
    })
}

export type InvestmentFormValues = z.infer<
  ReturnType<typeof createInvestmentFormSchema>
>
