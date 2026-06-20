import { z } from "zod"
import {
  CURRENCIES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  isCalendarDateString,
  type Investment,
} from "@/domain/investments"

const calendarDateSchema = z.string().refine(isCalendarDateString)
const timestampSchema = z.string().refine((value) => {
  return !Number.isNaN(Date.parse(value))
})

const contributionEventSchema = z.strictObject({
  createdAt: timestampSchema,
  id: z.string().min(1),
  amount: z.number().positive(),
  effectiveDate: calendarDateSchema,
  notes: z.string().optional(),
})

const rateEventSchema = z.strictObject({
  annualRate: z.number().min(0),
  createdAt: timestampSchema,
  id: z.string().min(1),
  effectiveDate: calendarDateSchema,
})

const lifecycleEventBaseShape = {
  createdAt: timestampSchema,
  id: z.string().min(1),
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
  effectiveDate: calendarDateSchema,
}

const lifecycleEventSchema = z.discriminatedUnion("type", [
  z
    .strictObject({
      ...lifecycleEventBaseShape,
      maturityDate: calendarDateSchema,
      type: z.literal("fixed-term"),
    })
    .refine(
      (event) => event.maturityDate > event.effectiveDate,
      "Fixed-term lifecycle events must mature after they become effective",
    ),
  z.strictObject({
    ...lifecycleEventBaseShape,
    type: z.literal("open-ended"),
  }),
])

const investmentSchema = z.strictObject({
  createdAt: timestampSchema,
  currency: z.literal(CURRENCIES.mxn),
  id: z.string().min(1),
  institutionName: z.string().min(1),
  name: z.string().min(1),
  notes: z.string().optional(),
  updatedAt: timestampSchema,
  contributionEvents: z.array(contributionEventSchema).min(1),
  rateEvents: z.array(rateEventSchema).min(1),
  lifecycleEvents: z.array(lifecycleEventSchema).min(1),
})

const investmentsStorageSchema = z.array(investmentSchema)

export function parseStoredInvestments(value: unknown): Investment[] | null {
  const parsedInvestments = investmentsStorageSchema.safeParse(value)

  return parsedInvestments.success ? parsedInvestments.data : null
}
