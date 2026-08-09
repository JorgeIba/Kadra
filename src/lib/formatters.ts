const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
})

const percentageFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

const wholePercentageFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

interface FormatPercentageOptions {
  maximumFractionDigits?: number
}

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const HIDDEN_MONEY_MASK = "$••••••"

export function formatMxn(value: number): string {
  return mxnFormatter.format(value)
}

export function formatHiddenMoney(value: number): string {
  return value < 0 ? `-${HIDDEN_MONEY_MASK}` : HIDDEN_MONEY_MASK
}

export function formatPercentage(
  value: number,
  options?: FormatPercentageOptions,
): string {
  if (options?.maximumFractionDigits === 0) {
    return `${wholePercentageFormatter.format(value)}%`
  }

  return `${percentageFormatter.format(value)}%`
}

export function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number)

  return displayDateFormatter.format(new Date(year, month - 1, day))
}
