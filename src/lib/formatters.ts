const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
})

const percentageFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatMxn(value: number): string {
  return mxnFormatter.format(value)
}

export function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`
}

export function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number)

  return displayDateFormatter.format(new Date(year, month - 1, day))
}
