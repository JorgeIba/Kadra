import { createContext, useContext } from "react"
import type { Investment } from "@/domain/investments"

export interface InvestmentsContextState {
  investments: Investment[]
  addInvestment: (investment: Investment) => void
  deleteInvestment: (investmentId: string) => void
  exportPortfolioBackup: () => void
  resetLocalData: () => void
  restoreInvestments: (investments: Investment[]) => boolean
  updateInvestment: (investment: Investment) => void
}

export const InvestmentsContext = createContext<InvestmentsContextState | null>(
  null,
)

export function useInvestments() {
  const value = useContext(InvestmentsContext)

  if (value === null) {
    throw new Error("useInvestments must be used within an InvestmentsProvider")
  }

  return value
}
