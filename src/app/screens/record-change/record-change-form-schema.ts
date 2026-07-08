import { z } from "zod"
import {
  CALENDAR_DATE_FORMAT_LABEL,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  compareCalendarDatesAscending,
  isCalendarDateString,
  type CalendarDateString,
} from "@/domain/investments"

interface RecordChangeFormSchemaOptions {
  latestEventDate?: CalendarDateString
  today: CalendarDateString
  activeBalance?: number
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
  transactionType: z.enum(["none", "contribution", "withdrawal"]),
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
  today,
  activeBalance,
}: RecordChangeFormSchemaOptions) {
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
        values.transactionType === "contribution" &&
        (values.contributionAmount === undefined ||
          values.contributionAmount <= 0)
      ) {
        context.addIssue({
          code: "custom",
          message: "Added amount must be greater than zero.",
          path: ["contributionAmount"],
        })
      }

      if (
        values.transactionType === "withdrawal" &&
        (values.contributionAmount === undefined ||
          values.contributionAmount <= 0)
      ) {
        context.addIssue({
          code: "custom",
          message: "Withdrawn amount must be greater than zero.",
          path: ["contributionAmount"],
        })
      }

      if (
        values.transactionType === "withdrawal" &&
        values.contributionAmount !== undefined &&
        values.contributionAmount > 0 &&
        activeBalance === undefined
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Cannot validate a withdrawal without an active balance for this date.",
          path: ["contributionAmount"],
        })
      }

      if (
        values.transactionType === "withdrawal" &&
        values.contributionAmount !== undefined &&
        activeBalance !== undefined &&
        values.contributionAmount > activeBalance
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Withdrawn amount cannot exceed the active balance on this date.",
          path: ["contributionAmount"],
        })
      }

      if (
        values.transactionType === "none" &&
        values.contributionAmount !== undefined
      ) {
        context.addIssue({
          code: "custom",
          message: "Amount is only available when moving money.",
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
export type RecordChangeFormValues = z.infer<
  ReturnType<typeof createRecordChangeFormSchema>
>
