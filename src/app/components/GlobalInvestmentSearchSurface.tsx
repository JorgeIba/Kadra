import { type ReactNode, type Ref } from "react"
import { Search } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { GLOBAL_INVESTMENT_SEARCH_MOTION } from "@/app/components/global-investment-search-motion"
import { cn } from "@/lib/utils"

interface GlobalInvestmentSearchSurfaceProps {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onRequestClose: () => void
  ref: Ref<HTMLDivElement>
  triggerRef: Ref<HTMLButtonElement>
}

export function GlobalInvestmentSearchSurface({
  children,
  isOpen,
  onOpenChange,
  onRequestClose,
  ref: searchSurfaceRef,
  triggerRef,
}: GlobalInvestmentSearchSurfaceProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const layoutTransition = {
    layout: {
      duration: prefersReducedMotion
        ? 0
        : isOpen
          ? GLOBAL_INVESTMENT_SEARCH_MOTION.openDuration
          : GLOBAL_INVESTMENT_SEARCH_MOTION.closeDuration,
      ease: GLOBAL_INVESTMENT_SEARCH_MOTION.easing,
    },
  }

  return (
    <motion.div
      ref={searchSurfaceRef}
      layout
      transition={layoutTransition}
      className={cn(
        "relative flex h-10 min-w-0 items-center overflow-hidden rounded-full border",
        isOpen
          ? "flex-1 border-primary/25 bg-card focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/12"
          : "size-10 shrink-0 border-border/80 bg-secondary/70",
      )}
      onKeyDownCapture={(event) => {
        if (isOpen && event.key === "Escape") {
          event.preventDefault()
          event.stopPropagation()
          onRequestClose()
        }
      }}
    >
      {isOpen ? <div className="absolute inset-0">{children}</div> : null}

      {!isOpen ? (
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={false}
          aria-label="Search investments"
          className="absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center rounded-full text-primary outline-none hover:bg-secondary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => onOpenChange(true)}
        >
          <Search className="size-4.5" aria-hidden="true" />
        </button>
      ) : null}
    </motion.div>
  )
}
