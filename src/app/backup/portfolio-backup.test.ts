import { describe, expect, it } from "vitest"
import {
  PORTFOLIO_BACKUP_FORMAT,
  PORTFOLIO_BACKUP_VERSION,
  createPortfolioBackup,
  getPortfolioBackupFileName,
  parsePortfolioBackup,
  parsePortfolioBackupText,
  serializePortfolioBackup,
} from "@/app/backup/portfolio-backup"
import {
  CURRENCIES,
  PAYMENT_FREQUENCIES,
  REINVESTMENT_BEHAVIORS,
  type Investment,
} from "@/domain/investments"

const investments: Investment[] = [
  {
    id: "investment-1",
    name: "Cetes",
    institutionName: "Cetesdirecto",
    currency: CURRENCIES.mxn,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
    contributionEvents: [
      {
        id: "contribution-1",
        amount: 10_000,
        kind: "contribution",
        effectiveDate: "2026-07-13",
        createdAt: "2026-07-13T12:00:00.000Z",
      },
    ],
    rateEvents: [
      {
        id: "rate-1",
        annualRate: 8.5,
        effectiveDate: "2026-07-13",
        createdAt: "2026-07-13T12:00:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lifecycle-1",
        type: "fixed-term",
        paymentFrequency: PAYMENT_FREQUENCIES.atMaturity,
        reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
        effectiveDate: "2026-07-13",
        maturityDate: "2026-10-13",
        createdAt: "2026-07-13T12:00:00.000Z",
      },
    ],
  },
]

describe("portfolio backups", () => {
  it("creates a versioned backup with the complete investment history", () => {
    const exportedAt = new Date("2026-07-13T12:00:00.000Z")

    expect(createPortfolioBackup(investments, exportedAt)).toEqual({
      format: PORTFOLIO_BACKUP_FORMAT,
      version: PORTFOLIO_BACKUP_VERSION,
      exportedAt: "2026-07-13T12:00:00.000Z",
      investments,
    })
  })

  it("serializes and restores a valid backup", () => {
    const text = serializePortfolioBackup(
      investments,
      new Date("2026-07-13T12:00:00.000Z"),
    )

    expect(parsePortfolioBackupText(text)?.investments).toEqual(investments)
  })

  it("preserves every event in a multi-event investment history", () => {
    const investmentWithHistory: Investment = {
      ...investments[0],
      contributionEvents: [
        ...investments[0].contributionEvents,
        {
          id: "contribution-2",
          amount: 2_500,
          kind: "contribution",
          effectiveDate: "2026-08-13",
          createdAt: "2026-08-13T12:00:00.000Z",
        },
      ],
      rateEvents: [
        ...investments[0].rateEvents,
        {
          id: "rate-2",
          annualRate: 7.8,
          effectiveDate: "2026-09-13",
          createdAt: "2026-09-13T12:00:00.000Z",
        },
      ],
      lifecycleEvents: [
        ...investments[0].lifecycleEvents,
        {
          id: "lifecycle-2",
          type: "open-ended",
          paymentFrequency: PAYMENT_FREQUENCIES.monthly,
          reinvestmentBehavior: REINVESTMENT_BEHAVIORS.automatic,
          effectiveDate: "2026-10-13",
          createdAt: "2026-10-13T12:00:00.000Z",
        },
      ],
    }
    const text = serializePortfolioBackup(
      [investmentWithHistory],
      new Date("2026-10-13T12:00:00.000Z"),
    )

    expect(parsePortfolioBackupText(text)?.investments).toEqual([
      investmentWithHistory,
    ])
  })

  it("rejects malformed, unsupported, and invalid portfolio data", () => {
    expect(parsePortfolioBackupText("not json")).toBeNull()
    expect(
      parsePortfolioBackup({
        format: PORTFOLIO_BACKUP_FORMAT,
        version: 2,
        exportedAt: "2026-07-13T12:00:00.000Z",
        investments,
      }),
    ).toBeNull()
    expect(
      parsePortfolioBackup({
        format: PORTFOLIO_BACKUP_FORMAT,
        version: PORTFOLIO_BACKUP_VERSION,
        exportedAt: "2026-07-13T12:00:00.000Z",
        investments: [{ ...investments[0], contributionEvents: [] }],
      }),
    ).toBeNull()
  })

  it("rejects duplicate IDs within their identity scope", () => {
    expect(
      parsePortfolioBackup({
        format: PORTFOLIO_BACKUP_FORMAT,
        version: PORTFOLIO_BACKUP_VERSION,
        exportedAt: "2026-07-13T12:00:00.000Z",
        investments: [investments[0], { ...investments[0] }],
      }),
    ).toBeNull()

    expect(
      parsePortfolioBackup({
        format: PORTFOLIO_BACKUP_FORMAT,
        version: PORTFOLIO_BACKUP_VERSION,
        exportedAt: "2026-07-13T12:00:00.000Z",
        investments: [
          {
            ...investments[0],
            contributionEvents: [
              investments[0].contributionEvents[0],
              {
                ...investments[0].contributionEvents[0],
                effectiveDate: "2026-07-14",
              },
            ],
          },
        ],
      }),
    ).toBeNull()
  })

  it("allows event IDs to repeat in different investments", () => {
    const secondInvestment: Investment = {
      ...investments[0],
      id: "investment-2",
      contributionEvents: [
        {
          ...investments[0].contributionEvents[0],
          id: "contribution-1",
        },
      ],
      rateEvents: [
        {
          ...investments[0].rateEvents[0],
          id: "rate-1",
        },
      ],
      lifecycleEvents: [
        {
          ...investments[0].lifecycleEvents[0],
          id: "lifecycle-1",
        },
      ],
    }

    expect(
      parsePortfolioBackup({
        format: PORTFOLIO_BACKUP_FORMAT,
        version: PORTFOLIO_BACKUP_VERSION,
        exportedAt: "2026-07-13T12:00:00.000Z",
        investments: [investments[0], secondInvestment],
      })?.investments,
    ).toEqual([investments[0], secondInvestment])
  })

  it("uses a recognizable date-based filename", () => {
    expect(
      getPortfolioBackupFileName(new Date("2026-07-13T12:00:00.000Z")),
    ).toBe("kadra-backup-2026-07-13.json")
  })
})
