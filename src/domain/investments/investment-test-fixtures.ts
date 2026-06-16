import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"
import type { Investment } from "@/domain/investments/types"

export const fixedInvestment = {
  id: "investment-1",
  name: "Fixed test",
  institutionName: "Test institution",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 36_500,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 10,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: INVESTMENT_TYPES.fixedTerm,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

export const openEndedInvestment = {
  id: "investment-2",
  name: "Open test",
  institutionName: "Test institution",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 10_000,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 7.3,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.daily,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
} satisfies Investment

export const evolvingInvestment = {
  id: "investment-3",
  name: "Evolving test",
  institutionName: "Test institution",
  currency: CURRENCIES.mxn,
  createdAt: "2026-01-01T18:00:00.000Z",
  updatedAt: "2026-01-01T18:00:00.000Z",
  contributions: [
    {
      id: "contribution-1",
      amount: 10_000,
      contributionDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
    {
      id: "contribution-2",
      amount: 5_000,
      contributionDate: "2026-02-01",
      createdAt: "2026-02-01T18:00:00.000Z",
    },
  ],
  ratePeriods: [
    {
      id: "rate-period-1",
      annualRate: 10,
      startDate: "2026-01-01",
      endDate: "2026-03-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
    {
      id: "rate-period-2",
      annualRate: 12,
      startDate: "2026-03-01",
      createdAt: "2026-03-01T18:00:00.000Z",
    },
  ],
  lifecyclePeriods: [
    {
      id: "lifecycle-period-1",
      type: INVESTMENT_TYPES.openEnded,
      paymentFrequency: PAYMENT_FREQUENCIES.monthly,
      reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
      startDate: "2026-01-01",
      createdAt: "2026-01-01T18:00:00.000Z",
    },
  ],
} satisfies Investment
