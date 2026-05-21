import { z } from "zod"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  isCalendarDateString,
  type Investment,
} from "@/domain/investments"

const calendarDateSchema = z.string().refine(isCalendarDateString)
const timestampSchema = z.string().refine((value) => {
  return !Number.isNaN(Date.parse(value))
})
const commonInvestmentShape = {
  annualRate: z.number().min(0),
  createdAt: timestampSchema,
  currency: z.literal(CURRENCIES.mxn),
  id: z.string().min(1),
  institutionName: z.string().min(1),
  name: z.string().min(1),
  notes: z.string().optional(),
  originalAmount: z.number().positive(),
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
  updatedAt: timestampSchema,
}

const investmentsStorageSchema = z.array(
  z.discriminatedUnion("type", [
    z.strictObject({
      ...commonInvestmentShape,
      endDate: calendarDateSchema,
      type: z.literal(INVESTMENT_TYPES.fixedTerm),
    }),
    z.strictObject({
      ...commonInvestmentShape,
      type: z.literal(INVESTMENT_TYPES.openEnded),
    }),
  ]),
)

export function parseStoredInvestments(value: unknown): Investment[] | null {
  const parsedInvestments = investmentsStorageSchema.safeParse(value)

  return parsedInvestments.success ? parsedInvestments.data : null
}
