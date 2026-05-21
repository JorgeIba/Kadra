import { parseStoredInvestments } from "@/app/storage/investments-storage-schema"
import type { Investment } from "@/domain/investments"

type InvestmentStorage = Pick<Storage, "getItem" | "setItem">

const INVESTMENTS_STORAGE_KEY = "trafin.investments.v1"

export function loadInvestmentsFromStorage(
  fallbackInvestments: Investment[],
  storage = getBrowserStorage(),
): Investment[] {
  if (storage === null) {
    return fallbackInvestments
  }

  try {
    const rawInvestments = storage.getItem(INVESTMENTS_STORAGE_KEY)

    if (rawInvestments === null) {
      return fallbackInvestments
    }

    const parsedInvestments = parseStoredInvestments(JSON.parse(rawInvestments))

    return parsedInvestments ?? fallbackInvestments
  } catch {
    return fallbackInvestments
  }
}

export function saveInvestmentsToStorage(
  investments: Investment[],
  storage = getBrowserStorage(),
): boolean {
  if (storage === null) {
    return false
  }

  try {
    storage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments))

    return true
  } catch {
    return false
  }
}

function getBrowserStorage(): InvestmentStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}
