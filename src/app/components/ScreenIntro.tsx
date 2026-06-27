import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScreenIntroProps {
  action?: ReactNode
  className?: string
  description?: string
  eyebrow?: string
  title: string
}

export function ScreenIntro({
  action,
  className,
  description,
  eyebrow,
  title,
}: ScreenIntroProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        action === undefined && "block",
        className,
      )}
    >
      <div className="space-y-1">
        {eyebrow === undefined ? null : (
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance font-ledger text-3xl font-normal tracking-normal">
          {title}
        </h1>
        {description === undefined ? null : (
          <p className="max-w-sm text-pretty text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action === undefined ? null : action}
    </div>
  )
}
