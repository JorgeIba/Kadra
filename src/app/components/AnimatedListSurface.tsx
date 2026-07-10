import { useState, type ReactNode } from "react"
import { useShouldAnimateRouteEntry } from "@/app/routing/navigation-animation"
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
  const shouldAnimateRouteEntry = useShouldAnimateRouteEntry()
  const [initialTransitionKey] = useState(transitionKey)
  const shouldAnimateTransition =
    shouldAnimateRouteEntry || transitionKey !== initialTransitionKey

  return (
    <div
      key={transitionKey}
      className={cn("motion-list-surface", className)}
      data-route-entry-animation={
        shouldAnimateTransition ? "enabled" : "disabled"
      }
    >
      {children}
    </div>
  )
}
