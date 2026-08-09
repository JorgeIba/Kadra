import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  MoneyPrivacyContext,
  type MoneyPrivacyContextValue,
} from "@/app/context/money-privacy-context"
import {
  readMoneyPrivacyState,
  saveMoneyPrivacyState,
} from "@/app/storage/money-privacy-storage"
import { formatHiddenMoney, formatMxn } from "@/lib/formatters"

export function MoneyPrivacyProvider({ children }: { children: ReactNode }) {
  const [isMoneyHidden, setIsMoneyHidden] = useState(readMoneyPrivacyState)

  useEffect(() => {
    saveMoneyPrivacyState(isMoneyHidden)
  }, [isMoneyHidden])

  const value = useMemo<MoneyPrivacyContextValue>(
    () => ({
      formatMoney(value) {
        return isMoneyHidden ? formatHiddenMoney(value) : formatMxn(value)
      },
      isMoneyHidden,
      toggleMoneyVisibility() {
        setIsMoneyHidden((currentValue) => !currentValue)
      },
    }),
    [isMoneyHidden],
  )

  return (
    <MoneyPrivacyContext.Provider value={value}>
      {children}
    </MoneyPrivacyContext.Provider>
  )
}
