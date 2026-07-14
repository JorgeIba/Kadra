import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  InvestmentsContext,
  type InvestmentsContextState,
} from "@/app/context/investments-context"
import { downloadPortfolioBackup } from "@/app/backup/download-portfolio-backup"
import {
  loadInvestmentsFromStorage,
  saveInvestmentsToStorage,
} from "@/app/storage/investments-storage"
import type { Investment } from "@/domain/investments"

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>(() => {
    return loadInvestmentsFromStorage([])
  })

  // Save investments to storage whenever they change
  useEffect(() => {
    saveInvestmentsToStorage(investments)
  }, [investments])

  const addInvestment = useCallback((investment: Investment) => {
    setInvestments((currentInvestments) => {
      return [investment, ...currentInvestments]
    })
  }, [])

  const deleteInvestment = useCallback((investmentId: string) => {
    setInvestments((currentInvestments) => {
      return currentInvestments.filter((investment) => {
        return investment.id !== investmentId
      })
    })
  }, [])

  const updateInvestment = useCallback((updatedInvestment: Investment) => {
    setInvestments((currentInvestments) => {
      return currentInvestments.map((investment) => {
        if (investment.id !== updatedInvestment.id) {
          return investment
        }

        return updatedInvestment
      })
    })
  }, [])

  const resetLocalData = useCallback(() => {
    setInvestments([])
  }, [])

  const exportPortfolioBackup = useCallback(() => {
    downloadPortfolioBackup(investments)
  }, [investments])

  const restoreInvestments = useCallback(
    (restoredInvestments: Investment[]) => {
      if (!saveInvestmentsToStorage(restoredInvestments)) {
        return false
      }

      setInvestments(restoredInvestments)

      return true
    },
    [],
  )

  const contextValue = useMemo<InvestmentsContextState>(() => {
    return {
      investments,
      addInvestment,
      deleteInvestment,
      exportPortfolioBackup,
      resetLocalData,
      restoreInvestments,
      updateInvestment,
    }
  }, [
    investments,
    addInvestment,
    deleteInvestment,
    exportPortfolioBackup,
    resetLocalData,
    restoreInvestments,
    updateInvestment,
  ])

  return (
    <InvestmentsContext.Provider value={contextValue}>
      {children}
    </InvestmentsContext.Provider>
  )
}
