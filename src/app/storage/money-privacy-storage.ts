type MoneyPrivacyStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">

const MONEY_PRIVACY_STORAGE_KEY = "kadra.moneyPrivacyHidden"
const LEGACY_MONEY_PRIVACY_STORAGE_KEY = "trafin.moneyPrivacyHidden"

export function readMoneyPrivacyState(storage = getBrowserStorage()) {
  if (storage === null) {
    return false
  }

  try {
    const currentValue = storage.getItem(MONEY_PRIVACY_STORAGE_KEY)

    if (currentValue !== null) {
      return currentValue === "true"
    }

    const legacyValue = storage.getItem(LEGACY_MONEY_PRIVACY_STORAGE_KEY)

    if (legacyValue === null) {
      return false
    }

    storage.setItem(MONEY_PRIVACY_STORAGE_KEY, legacyValue)

    try {
      storage.removeItem(LEGACY_MONEY_PRIVACY_STORAGE_KEY)
    } catch {
      // The active Kadra key is already written; retry legacy cleanup later.
    }

    return legacyValue === "true"
  } catch {
    return false
  }
}

export function saveMoneyPrivacyState(
  isMoneyHidden: boolean,
  storage = getBrowserStorage(),
) {
  if (storage === null) {
    return
  }

  try {
    storage.setItem(MONEY_PRIVACY_STORAGE_KEY, isMoneyHidden ? "true" : "false")
  } catch {
    // Privacy mode still works for the current session if persistence fails.
  }
}

function getBrowserStorage(): MoneyPrivacyStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}
