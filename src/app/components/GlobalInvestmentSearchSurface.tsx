import { type ReactNode, type Ref } from "react"
import { Search } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  GLOBAL_INVESTMENT_SEARCH_BOUNCE_SCALE,
  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
  GLOBAL_INVESTMENT_SEARCH_ORB_SIZE,
  GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
  GLOBAL_INVESTMENT_SEARCH_SPLIT_OVERSHOOT_LEFT,
  GLOBAL_INVESTMENT_SEARCH_MOTION,
} from "@/app/components/global-investment-search-motion"
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
  const surfaceTransition = {
    duration: prefersReducedMotion
      ? 0
      : isOpen
        ? GLOBAL_INVESTMENT_SEARCH_MOTION.openDuration
        : GLOBAL_INVESTMENT_SEARCH_MOTION.closeDuration,
    ease: GLOBAL_INVESTMENT_SEARCH_MOTION.easing,
  }
  const searchSurfaceTransition = {
    ...surfaceTransition,
    times: GLOBAL_INVESTMENT_SEARCH_MOTION.phaseTimes,
  }
  const searchLayoutTransition = {
    duration: prefersReducedMotion
      ? 0
      : isOpen
        ? GLOBAL_INVESTMENT_SEARCH_MOTION.openDuration
        : GLOBAL_INVESTMENT_SEARCH_MOTION.closeDuration,
    ease: GLOBAL_INVESTMENT_SEARCH_MOTION.easing,
  }
  const inputVisibilityTransition = {
    duration: prefersReducedMotion ? 0 : 0.24,
    delay: prefersReducedMotion
      ? 0
      : isOpen
        ? surfaceTransition.duration * 0.48
        : 0,
    ease: GLOBAL_INVESTMENT_SEARCH_MOTION.easing,
  }
  const bounceScale = isOpen
    ? [1, GLOBAL_INVESTMENT_SEARCH_BOUNCE_SCALE, 1, 1]
    : [1, 1, GLOBAL_INVESTMENT_SEARCH_BOUNCE_SCALE, 1]

  return (
    <motion.div
      ref={searchSurfaceRef}
      initial={false}
      layout
      animate={{
        flexGrow: isOpen ? [0, 0, 0, 1] : [1, 0, 0, 0],
        width: isOpen
          ? [
              GLOBAL_INVESTMENT_SEARCH_ORB_SIZE,
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
            ]
          : [
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
              GLOBAL_INVESTMENT_SEARCH_SEPARATED_WIDTH,
              GLOBAL_INVESTMENT_SEARCH_ORB_SIZE,
            ],
      }}
      transition={{
        layout: searchLayoutTransition,
        flexGrow: searchSurfaceTransition,
        width: searchSurfaceTransition,
      }}
      className="relative flex h-10 min-w-0 shrink-0 items-center"
      onKeyDownCapture={(event) => {
        if (isOpen && event.key === "Escape") {
          event.preventDefault()
          event.stopPropagation()
          onRequestClose()
        }
      }}
    >
      {/*
       * Keep the two background surfaces explicit while we validate the
       * sequence: shared origin, separation, then expansion. The gooey filter
       * belongs in the next pass, after this geometry reads correctly.
       */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        animate={{
          scaleY: bounceScale,
        }}
        transition={searchSurfaceTransition}
      >
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-card"
          animate={{ scale: bounceScale }}
          transition={searchSurfaceTransition}
          style={{
            width: GLOBAL_INVESTMENT_SEARCH_ORB_SIZE,
            transformOrigin: "center",
          }}
        />
        <motion.span
          className="absolute inset-y-0 right-0 rounded-full bg-card"
          initial={false}
          animate={{
            left: isOpen
              ? [
                  0,
                  0,
                  GLOBAL_INVESTMENT_SEARCH_SPLIT_OVERSHOOT_LEFT,
                  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
                ]
              : [
                  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
                  GLOBAL_INVESTMENT_SEARCH_SPLIT_OVERSHOOT_LEFT,
                  0,
                  0,
                ],
            scaleX: bounceScale,
          }}
          transition={searchSurfaceTransition}
          style={{ transformOrigin: "left center" }}
        />
      </motion.div>

      <div className="relative z-20 h-10 min-w-0 flex-1">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close search" : "Search investments"}
          className={cn(
            "absolute inset-y-0 left-0 z-20 flex size-10 items-center justify-center rounded-full border text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            isOpen
              ? "border-border/80 bg-card"
              : "border-border/80 bg-secondary/70 hover:bg-secondary hover:text-primary",
          )}
          onClick={() => {
            if (isOpen) {
              onRequestClose()
              return
            }

            onOpenChange(true)
          }}
        >
          <Search className="size-5" aria-hidden="true" />
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              key="open-search-input"
              className="absolute inset-y-0 right-0 min-w-0 overflow-hidden rounded-full bg-card"
              initial={{ left: 0, opacity: 0 }}
              animate={{
                left: [
                  0,
                  0,
                  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
                  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
                ],
                opacity: 1,
              }}
              exit={{
                left: [
                  GLOBAL_INVESTMENT_SEARCH_EXPANDED_BAR_LEFT,
                  GLOBAL_INVESTMENT_SEARCH_SPLIT_OVERSHOOT_LEFT,
                  0,
                  0,
                ],
                opacity: 0,
              }}
              transition={{
                left: searchSurfaceTransition,
                opacity: inputVisibilityTransition,
              }}
            >
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
