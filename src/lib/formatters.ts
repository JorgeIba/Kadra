const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
})

const percentageFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function formatMxn(value: number): string {
  return mxnFormatter.format(value)
}

export function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`
}
