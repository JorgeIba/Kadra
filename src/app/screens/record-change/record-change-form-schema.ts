import { z } from "zod"
import type { TFunction } from "i18next"
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
  t: TFunction
}

interface RecordChangeEffectiveDateValidationOptions {
  latestEventDate?: CalendarDateString
  today: CalendarDateString
  t: TFunction
}

export function getRecordChangeEffectiveDateError(
  effectiveDate: CalendarDateString,
  { latestEventDate, t, today }: RecordChangeEffectiveDateValidationOptions,
): string | null {
  if (compareCalendarDatesAscending(effectiveDate, today) > 0) {
    return t("recordChange.errors.effectiveDateFuture")
  }

  if (
    latestEventDate !== undefined &&
    compareCalendarDatesAscending(effectiveDate, latestEventDate) < 0
  ) {
    return t("recordChange.errors.chooseDateOrLater", {
      date: latestEventDate,
    })
  }

  return null
}

export function createRecordChangeFormSchema({
  latestEventDate,
  today,
  activeBalance,
  t,
}: RecordChangeFormSchemaOptions) {
  const dateOnlySchema = z.string().refine(isCalendarDateString, {
    message: t("recordChange.errors.invalidDate", {
      format: CALENDAR_DATE_FORMAT_LABEL,
    }),
  })

  const commonRecordChangeFormSchema = z.object({
    effectiveDate: dateOnlySchema,
    transactionType: z.enum(["none", "contribution", "withdrawal"]),
    contributionAmount: z.number().optional(),
    annualRate: z.number().min(0, t("recordChange.errors.annualRateNegative")),
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
          t,
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
          message: t("recordChange.errors.addedAmountPositive"),
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
          message: t("recordChange.errors.withdrawnAmountPositive"),
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
          message: t("recordChange.errors.withdrawalBalanceUnavailable"),
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
          message: t("recordChange.errors.withdrawalExceedsBalance"),
          path: ["contributionAmount"],
        })
      }

      if (
        values.transactionType === "none" &&
        values.contributionAmount !== undefined
      ) {
        context.addIssue({
          code: "custom",
          message: t("recordChange.errors.amountOnlyWhenMovingMoney"),
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
          message: t("recordChange.errors.maturityAfterEffectiveDate"),
          path: ["maturityDate"],
        })
      }

      if (
        values.investmentType === INVESTMENT_TYPES.openEnded &&
        values.paymentFrequency === PAYMENT_FREQUENCIES.atMaturity
      ) {
        context.addIssue({
          code: "custom",
          message: t("recordChange.errors.atMaturityFixedTermOnly"),
          path: ["paymentFrequency"],
        })
      }
    })
}
export type RecordChangeFormValues = z.infer<
  ReturnType<typeof createRecordChangeFormSchema>
>
