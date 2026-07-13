import type { ComponentPropsWithoutRef } from "react"

export function KadraMark({ ...props }: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <rect x="21" y="22" width="20" height="58" fill="currentColor" />
      <path d="M43 50 55 30l25 50H59z" fill="currentColor" />
    </svg>
  )
}
