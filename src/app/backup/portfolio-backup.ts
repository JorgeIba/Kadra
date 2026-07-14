import { z } from "zod"
import { parseStoredInvestments } from "@/app/storage/investments-storage-schema"
import type { Investment } from "@/domain/investments"

export const PORTFOLIO_BACKUP_FORMAT = "kadra.portfolio-backup"
export const PORTFOLIO_BACKUP_VERSION = 1

export interface PortfolioBackup {
  format: typeof PORTFOLIO_BACKUP_FORMAT
  version: typeof PORTFOLIO_BACKUP_VERSION
  exportedAt: string
  investments: Investment[]
}

const portfolioBackupEnvelopeSchema = z.strictObject({
  format: z.literal(PORTFOLIO_BACKUP_FORMAT),
  version: z.literal(PORTFOLIO_BACKUP_VERSION),
  exportedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  investments: z.unknown(),
})

export function createPortfolioBackup(
  investments: Investment[],
  exportedAt = new Date(),
): PortfolioBackup {
  return {
    format: PORTFOLIO_BACKUP_FORMAT,
    version: PORTFOLIO_BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    investments,
  }
}

export function serializePortfolioBackup(
  investments: Investment[],
  exportedAt = new Date(),
): string {
  return JSON.stringify(createPortfolioBackup(investments, exportedAt), null, 2)
}

export function parsePortfolioBackup(value: unknown): PortfolioBackup | null {
  const parsedEnvelope = portfolioBackupEnvelopeSchema.safeParse(value)

  if (!parsedEnvelope.success) {
    return null
  }

  const investments = parseStoredInvestments(parsedEnvelope.data.investments)

  if (investments === null) {
    return null
  }

  if (!hasUniquePortfolioIds(investments)) {
    return null
  }

  return {
    ...parsedEnvelope.data,
    investments,
  }
}

export function parsePortfolioBackupText(text: string): PortfolioBackup | null {
  try {
    return parsePortfolioBackup(JSON.parse(text))
  } catch {
    return null
  }
}

export function getPortfolioBackupFileName(exportedAt = new Date()): string {
  return `kadra-backup-${exportedAt.toISOString().slice(0, 10)}.json`
}

function hasUniquePortfolioIds(investments: Investment[]): boolean {
  return (
    hasUniqueIds(investments) &&
    investments.every((investment) => {
      return (
        hasUniqueIds(investment.contributionEvents) &&
        hasUniqueIds(investment.rateEvents) &&
        hasUniqueIds(investment.lifecycleEvents)
      )
    })
  )
}

function hasUniqueIds(items: ReadonlyArray<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size === items.length
}
