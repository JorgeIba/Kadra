import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedListSurfaceProps {
  children: ReactNode
  className?: string
  transitionKey: string
}

export function AnimatedListSurface({
  children,
  className,
  transitionKey,
}: AnimatedListSurfaceProps) {
  return (
    <div key={transitionKey} className={cn("motion-list-surface", className)}>
      {children}
    </div>
  )
}
