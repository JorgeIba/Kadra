import { z } from "zod"
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

const dateOnlySchema = z.string().refine(isCalendarDateString, {
  message: `Use a valid date in ${CALENDAR_DATE_FORMAT_LABEL} format.`,
})

const commonInvestmentFormSchema = z.object({
  name: z.string().trim().min(1, "Investment name is required."),
  institutionName: z.string().trim().min(1, "Institution is required."),
  startDate: dateOnlySchema,
  contributionAmount: z
    .number()
    .positive("Contribution amount must be greater than zero."),
  annualRate: z.number().min(0, "Annual rate cannot be negative."),
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

export const investmentFormSchema = z
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
        message: "Start date cannot be in the future.",
        path: ["startDate"],
      })
    }

    if (
      values.investmentType === INVESTMENT_TYPES.fixedTerm &&
      compareCalendarDatesAscending(values.endDate, values.startDate) <= 0
    ) {
      context.addIssue({
        code: "custom",
        message: "End date must be after the start date.",
        path: ["endDate"],
      })
    }

    if (
      values.investmentType === INVESTMENT_TYPES.openEnded &&
      values.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
    ) {
      context.addIssue({
        code: "custom",
        message: "At maturity is only available for fixed-term investments.",
        path: ["paymentFrequency"],
      })
    }
  })

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>
