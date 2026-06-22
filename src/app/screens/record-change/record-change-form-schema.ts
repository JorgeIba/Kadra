import { z } from "zod"
import {
  CALENDAR_DATE_FORMAT_LABEL,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  compareCalendarDatesAscending,
  isCalendarDateString,
  toDateString,
  type CalendarDateString,
} from "@/domain/investments"

interface RecordChangeFormSchemaOptions {
  latestEventDate?: CalendarDateString
  today?: CalendarDateString
}

interface RecordChangeEffectiveDateValidationOptions {
  latestEventDate?: CalendarDateString
  today: CalendarDateString
}

export function getRecordChangeEffectiveDateError(
  effectiveDate: CalendarDateString,
  { latestEventDate, today }: RecordChangeEffectiveDateValidationOptions,
): string | null {
  if (compareCalendarDatesAscending(effectiveDate, today) > 0) {
    return "Effective date cannot be in the future."
  }

  if (
    latestEventDate !== undefined &&
    compareCalendarDatesAscending(effectiveDate, latestEventDate) < 0
  ) {
    return `Choose ${latestEventDate} or later. Record change can only append to existing history for now.`
  }

  return null
}

const dateOnlySchema = z.string().refine(isCalendarDateString, {
  message: `Use a valid date in ${CALENDAR_DATE_FORMAT_LABEL} format.`,
})

const commonRecordChangeFormSchema = z.object({
  effectiveDate: dateOnlySchema,
  hasContribution: z.boolean(),
  contributionAmount: z.number().optional(),
  annualRate: z.number().min(0, "Annual rate cannot be negative."),
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
})

export function createRecordChangeFormSchema({
  latestEventDate,
  today = toDateString(new Date()),
}: RecordChangeFormSchemaOptions = {}) {
  return z
    .discriminatedUnion("investmentType", [
      commonRecordChangeFormSchema.extend({
        investmentType: z.literal(INVESTMENT_TYPES.fixedTerm),
        maturityDate: dateOnlySchema,
      }),
      commonRecordChangeFormSchema.extend({
        investmentType: z.literal(INVESTMENT_TYPES.openEnded),
        maturityDate: dateOnlySchema.optional(),
      }),
    ])
    .superRefine((values, context) => {
      const effectiveDateError = getRecordChangeEffectiveDateError(
        values.effectiveDate,
        {
          latestEventDate,
          today,
        },
      )

      if (effectiveDateError !== null) {
        context.addIssue({
          code: "custom",
          message: effectiveDateError,
          path: ["effectiveDate"],
        })
      }

      if (
        values.hasContribution &&
        (values.contributionAmount === undefined ||
          values.contributionAmount <= 0)
      ) {
        context.addIssue({
          code: "custom",
          message: "Added amount must be greater than zero.",
          path: ["contributionAmount"],
        })
      }

      if (!values.hasContribution && values.contributionAmount !== undefined) {
        context.addIssue({
          code: "custom",
          message: "Added amount is only available when adding money.",
          path: ["contributionAmount"],
        })
      }

      if (
        values.investmentType === INVESTMENT_TYPES.fixedTerm &&
        compareCalendarDatesAscending(
          values.maturityDate,
          values.effectiveDate,
        ) <= 0
      ) {
        context.addIssue({
          code: "custom",
          message: "Maturity date must be after the effective date.",
          path: ["maturityDate"],
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
}

export const recordChangeFormSchema = createRecordChangeFormSchema()

export type RecordChangeFormValues = z.infer<typeof recordChangeFormSchema>
