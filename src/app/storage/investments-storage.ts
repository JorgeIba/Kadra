import { parseStoredInvestments } from "@/app/storage/investments-storage-schema"
import type { Investment } from "@/domain/investments"

type InvestmentStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">

const INVESTMENTS_STORAGE_KEY = "kadra.investments.v1"
const LEGACY_INVESTMENTS_STORAGE_KEY = "trafin.investments.v1"

export function loadInvestmentsFromStorage(
  fallbackInvestments: Investment[],
  storage = getBrowserStorage(),
): Investment[] {
  if (storage === null) {
    return fallbackInvestments
  }

  try {
    const rawInvestments = storage.getItem(INVESTMENTS_STORAGE_KEY)

    if (rawInvestments !== null) {
      const parsedInvestments = parseStoredInvestments(
        JSON.parse(rawInvestments),
      )

      return parsedInvestments ?? fallbackInvestments
    }

    const legacyRawInvestments = storage.getItem(LEGACY_INVESTMENTS_STORAGE_KEY)

    if (legacyRawInvestments === null) {
      return fallbackInvestments
    }

    const parsedInvestments = parseStoredInvestments(
      JSON.parse(legacyRawInvestments),
    )

    if (parsedInvestments === null) {
      return fallbackInvestments
    }

    try {
      storage.setItem(INVESTMENTS_STORAGE_KEY, legacyRawInvestments)
    } catch {
      return parsedInvestments
    }

    try {
      storage.removeItem(LEGACY_INVESTMENTS_STORAGE_KEY)
    } catch {
      // The active Kadra key is already written; retry legacy cleanup later.
    }

    return parsedInvestments
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

export function clearInvestmentsFromStorage(
  storage = getBrowserStorage(),
): boolean {
  if (storage === null) {
    return false
  }

  try {
    storage.removeItem(INVESTMENTS_STORAGE_KEY)
    storage.removeItem(LEGACY_INVESTMENTS_STORAGE_KEY)

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
