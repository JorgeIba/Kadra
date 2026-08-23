const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
})

interface FormatPercentageOptions {
  maximumFractionDigits?: number
}

const HIDDEN_MONEY_MASK = "$••••••"

export function formatMxn(value: number): string {
  return mxnFormatter.format(value)
}

export function formatHiddenMoney(value: number): string {
  return value < 0 ? `-${HIDDEN_MONEY_MASK}` : HIDDEN_MONEY_MASK
}

export function formatPercentage(
  value: number,
  locale: string,
  options?: FormatPercentageOptions,
): string {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    minimumFractionDigits: 0,
  })

  return `${formatter.format(value)}%`
}

export function formatDisplayDate(date: string, locale: string): string {
  const [year, month, day] = date.split("-").map(Number)

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}
