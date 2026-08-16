import { type ReactNode, type Ref } from "react"
import { Search } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  GLOBAL_INVESTMENT_SEARCH_GOOEY_FILTER_ID,
  GLOBAL_INVESTMENT_SEARCH_FINAL_GAP,
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
  const capsuleTransition = {
    ...surfaceTransition,
    delay: prefersReducedMotion
      ? 0
      : isOpen
        ? surfaceTransition.duration * 0.2
        : 0,
  }
  const gooeyTransition = {
    duration: prefersReducedMotion
      ? 0
      : GLOBAL_INVESTMENT_SEARCH_MOTION.gooeyDuration,
    ease: surfaceTransition.ease,
    times: [0, 0.25, 0.7, 1],
  }

  return (
    <motion.div
      ref={searchSurfaceRef}
      initial={false}
      animate={{ flexGrow: isOpen ? 1 : 0 }}
      transition={{ flexGrow: surfaceTransition }}
      className="relative flex h-10 min-w-0 shrink-0 basis-10 items-center overflow-hidden"
      onKeyDownCapture={(event) => {
        if (isOpen && event.key === "Escape") {
          event.preventDefault()
          event.stopPropagation()
          onRequestClose()
        }
      }}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <filter
            id={GLOBAL_INVESTMENT_SEARCH_GOOEY_FILTER_ID}
            x="-30%"
            y="-40%"
            width="160%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/*
       * The filter is limited to solid background shapes. The icon, input,
       * and result popup stay outside it so their edges and text stay crisp.
       */}
      <AnimatePresence initial={false}>
        <motion.div
          key={isOpen ? "open-search-goo" : "closed-search-goo"}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={gooeyTransition}
          style={{
            filter: `url(#${GLOBAL_INVESTMENT_SEARCH_GOOEY_FILTER_ID})`,
          }}
        >
          <span className="absolute inset-y-0 left-0 size-10 rounded-full bg-card" />
          <motion.span
            className="absolute inset-y-0 right-0 rounded-full bg-card"
            initial={{
              left: isOpen ? 32 : 40 + GLOBAL_INVESTMENT_SEARCH_FINAL_GAP,
            }}
            animate={{
              left: isOpen
                ? [32, 40, 40, 40 + GLOBAL_INVESTMENT_SEARCH_FINAL_GAP]
                : [40 + GLOBAL_INVESTMENT_SEARCH_FINAL_GAP, 40, 40, 32],
            }}
            transition={gooeyTransition}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-10 min-w-0 flex-1 items-center">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close search" : "Search investments"}
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-full border text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
              className="relative flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-full bg-card focus-within:ring-1 focus-within:ring-inset focus-within:ring-primary/20"
              initial={{ marginLeft: 0, opacity: 0 }}
              animate={{
                marginLeft: GLOBAL_INVESTMENT_SEARCH_FINAL_GAP,
                opacity: 1,
              }}
              exit={{ marginLeft: 0, opacity: 0 }}
              transition={capsuleTransition}
            >
              <motion.div
                className="relative size-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.18,
                  delay: prefersReducedMotion
                    ? 0
                    : surfaceTransition.duration * 0.2,
                  ease: GLOBAL_INVESTMENT_SEARCH_MOTION.easing,
                }}
              >
                {children}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
