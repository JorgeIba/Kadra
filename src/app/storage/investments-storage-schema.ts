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

const contributionSchema = z.strictObject({
  createdAt: timestampSchema,
  id: z.string().min(1),
  amount: z.number().positive(),
  contributionDate: calendarDateSchema,
  notes: z.string().optional(),
})

const ratePeriodSchema = z.strictObject({
  annualRate: z.number().min(0),
  createdAt: timestampSchema,
  id: z.string().min(1),
  startDate: calendarDateSchema,
  endDate: calendarDateSchema.optional(),
})

const lifecyclePeriodBaseShape = {
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
  startDate: calendarDateSchema,
}

const lifecyclePeriodSchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...lifecyclePeriodBaseShape,
    endDate: calendarDateSchema,
    type: z.literal("fixed-term"),
  }),
  z.strictObject({
    ...lifecyclePeriodBaseShape,
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
  contributions: z.array(contributionSchema).min(1),
  ratePeriods: z.array(ratePeriodSchema).min(1),
  lifecyclePeriods: z.array(lifecyclePeriodSchema).min(1),
})

const investmentsStorageSchema = z.array(investmentSchema)

export function parseStoredInvestments(value: unknown): Investment[] | null {
  const parsedInvestments = investmentsStorageSchema.safeParse(value)

  return parsedInvestments.success ? parsedInvestments.data : null
}
