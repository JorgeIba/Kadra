import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardActionHintProps {
  ariaLabel?: string
  children?: string
  className?: string
  iconClassName?: string
}

export function DashboardActionHint({
  ariaLabel,
  children,
  className,
  iconClassName,
}: DashboardActionHintProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary",
        className,
      )}
    >
      {children ?? <span className="sr-only">{ariaLabel}</span>}
      <ArrowRight
        className={cn(
          "size-4 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none",
          iconClassName,
        )}
        aria-hidden="true"
      />
    </span>
  )
}
