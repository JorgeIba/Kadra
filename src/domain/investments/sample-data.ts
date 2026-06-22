import type { Investment } from "@/domain/investments/types"
import {
  CURRENCIES,
  INVESTMENT_TYPES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
} from "@/domain/investments/constants"

export const sampleInvestments: Investment[] = [
  {
    id: "investment-nu-90",
    name: "Nu congelada 90 dias",
    institutionName: "Nu",
    currency: CURRENCIES.mxn,
    notes: "Sample fixed-term SOFIPO-style investment with a later top-up.",
    createdAt: "2026-05-03T12:00:00.000Z",
    updatedAt: "2026-06-02T09:15:00.000Z",
    contributionEvents: [
      {
        id: "contribution-nu-90-1",
        amount: 50000,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:00:00.000Z",
      },
      {
        id: "contribution-nu-90-2",
        amount: 10000,
        effectiveDate: "2026-06-02",
        notes: "Additional funds after first payout estimate review.",
        createdAt: "2026-06-02T09:15:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: "rate-event-nu-90-1",
        annualRate: 14.25,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:00:00.000Z",
      },
      {
        id: "rate-event-nu-90-2",
        annualRate: 13.9,
        effectiveDate: "2026-06-15",
        createdAt: "2026-06-15T08:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-event-nu-90-1",
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-05-03",
        maturityDate: "2026-08-01",
        createdAt: "2026-05-03T12:00:00.000Z",
      },
    ],
  },
  {
    id: "investment-cetes-28",
    name: "CETES 28 dias",
    institutionName: "CETES Directo",
    currency: CURRENCIES.mxn,
    createdAt: "2026-05-03T12:05:00.000Z",
    updatedAt: "2026-05-31T11:00:00.000Z",
    contributionEvents: [
      {
        id: "contribution-cetes-28-1",
        amount: 35000,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:05:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: "rate-event-cetes-28-1",
        annualRate: 10.15,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:05:00.000Z",
      },
      {
        id: "rate-event-cetes-28-2",
        annualRate: 9.95,
        effectiveDate: "2026-05-17",
        createdAt: "2026-05-17T08:30:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-event-cetes-28-1",
        type: INVESTMENT_TYPES.fixedTerm,
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.toCash,
        effectiveDate: "2026-05-03",
        maturityDate: "2026-05-31",
        createdAt: "2026-05-03T12:05:00.000Z",
      },
    ],
  },
  {
    id: "investment-klar-flex",
    name: "Klar flexible",
    institutionName: "Klar",
    currency: CURRENCIES.mxn,
    notes: "Sample flexible account with promotional rate changes over time.",
    createdAt: "2026-05-03T12:10:00.000Z",
    updatedAt: "2026-06-20T08:00:00.000Z",
    contributionEvents: [
      {
        id: "contribution-klar-flex-1",
        amount: 25000,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
      {
        id: "contribution-klar-flex-2",
        amount: 5000,
        effectiveDate: "2026-05-20",
        createdAt: "2026-05-20T10:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: "rate-event-klar-flex-1",
        annualRate: 12,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
      {
        id: "rate-event-klar-flex-2",
        annualRate: 11.4,
        effectiveDate: "2026-06-10",
        createdAt: "2026-06-10T08:45:00.000Z",
      },
      {
        id: "rate-event-klar-flex-3",
        annualRate: 10.8,
        effectiveDate: "2026-06-20",
        createdAt: "2026-06-20T08:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-event-klar-flex-1",
        type: INVESTMENT_TYPES.openEnded,
        paymentFrequency: PAYMENT_FREQUENCIES.daily,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-05-03",
        createdAt: "2026-05-03T12:10:00.000Z",
      },
    ],
  },
]
