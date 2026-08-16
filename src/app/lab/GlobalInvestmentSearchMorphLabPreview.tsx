import { useLayoutEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import {
  createGlobalInvestmentSearchLabMotion,
  GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE,
  GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP,
  GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_MIN_WIDTH,
  type GlobalInvestmentSearchLabBarDirection,
  type GlobalInvestmentSearchLabPhase,
} from "@/app/lab/global-investment-search-lab-motion"

export type {
  GlobalInvestmentSearchLabBarDirection,
  GlobalInvestmentSearchLabPhase,
} from "@/app/lab/global-investment-search-lab-motion"

export const GLOBAL_INVESTMENT_SEARCH_LAB_GOOEY_FILTER_ID =
  "kadra-global-investment-search-lab-gooey"

const LAB_STAGE_MAX_WIDTH = 360
const PLACEHOLDER_SETTLE_DURATION = 0.18

interface GlobalInvestmentSearchMorphLabPreviewProps {
  barDirection?: GlobalInvestmentSearchLabBarDirection
  isOpen: boolean
  manualPhase?: GlobalInvestmentSearchLabPhase
  onOpenChange: (isOpen: boolean) => void
  reducedMotion?: boolean
}

export function GlobalInvestmentSearchMorphLabPreview({
  barDirection = "right",
  isOpen,
  manualPhase,
  onOpenChange,
  reducedMotion,
}: GlobalInvestmentSearchMorphLabPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stageWidth, setStageWidth] = useState(LAB_STAGE_MAX_WIDTH)
  const [hasSearchInteraction, setHasSearchInteraction] = useState(isOpen)
  const [isSearchBarSettled, setIsSearchBarSettled] = useState(false)
  const systemPrefersReducedMotion = useReducedMotion() ?? false
  const isManualPhase = manualPhase !== undefined
  const prefersReducedMotion = isManualPhase
    ? true
    : (reducedMotion ?? systemPrefersReducedMotion)

  // Measure the lab stage before painting so the morph stays inside narrow viewports.
  useLayoutEffect(() => {
    const stageElement = stageRef.current

    if (stageElement === null) {
      return undefined
    }

    function updateStageWidth() {
      const nextWidth = stageRef.current?.getBoundingClientRect().width

      if (nextWidth === undefined) {
        return
      }

      setStageWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth,
      )
    }

    updateStageWidth()

    const resizeObserver = new ResizeObserver(updateStageWidth)
    resizeObserver.observe(stageElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const orbLeft =
    barDirection === "right"
      ? 0
      : Math.max(0, stageWidth - GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE)
  const searchBarFinalWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_MIN_WIDTH,
    stageWidth -
      GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE -
      GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP,
  )
  const { barGeometry, connectorGeometry, inputWidth, orbMotion, transition } =
    createGlobalInvestmentSearchLabMotion({
      barDirection,
      isOpen,
      manualPhase,
      orbLeft,
      prefersReducedMotion,
      searchBarFinalWidth,
    })
  const isInitialClosedState =
    !isOpen && !hasSearchInteraction && !isManualPhase
  const renderedBarGeometry = isInitialClosedState
    ? { x: orbLeft, width: GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE, scaleY: 1 }
    : barGeometry
  const initialConnectorLeft =
    barDirection === "right"
      ? orbLeft + 32
      : orbLeft + GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE - 32
  const renderedConnectorGeometry = isInitialClosedState
    ? { x: initialConnectorLeft, width: 0, scaleY: 0.4, opacity: 0 }
    : connectorGeometry
  const renderedInputWidth = isInitialClosedState ? "0%" : inputWidth
  const renderedOrbMotion = isInitialClosedState
    ? { scale: 1, x: 0, y: 0, rotate: 0 }
    : orbMotion
  const renderedTransition = isInitialClosedState ? { duration: 0 } : transition
  const shouldShowPlaceholder = isManualPhase
    ? manualPhase === "open"
    : isSearchBarSettled || (prefersReducedMotion && isOpen)
  const placeholderTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        opacity: {
          duration: PLACEHOLDER_SETTLE_DURATION,
          ease: "easeOut",
        },
        y: {
          duration: PLACEHOLDER_SETTLE_DURATION,
          ease: "easeOut",
        },
      }

  return (
    <div ref={stageRef} className="relative h-10 w-full max-w-[360px]">
      {/*
       * The SVG only supplies the gooey neck layer. The Orb and bar bodies
       * stay in a crisp layer so their edges do not inherit the blur.
       */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute size-px opacity-0"
      >
        <defs>
          <filter
            id={GLOBAL_INVESTMENT_SEARCH_LAB_GOOEY_FILTER_ID}
            x="-35%"
            y="-90%"
            width="170%"
            height="280%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          filter: `url(#${GLOBAL_INVESTMENT_SEARCH_LAB_GOOEY_FILTER_ID})`,
          WebkitFilter: `url(#${GLOBAL_INVESTMENT_SEARCH_LAB_GOOEY_FILTER_ID})`,
        }}
      >
        <motion.div
          initial={false}
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-secondary"
          animate={renderedConnectorGeometry}
          transition={renderedTransition}
          style={{ transformOrigin: "center" }}
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[11]"
      >
        <motion.div
          initial={false}
          className="absolute top-0 size-10 rounded-full bg-secondary"
          animate={renderedOrbMotion}
          transition={renderedTransition}
          style={{ left: orbLeft, transformOrigin: "center" }}
        />

        <motion.div
          initial={false}
          className="absolute inset-y-0 rounded-full bg-secondary"
          animate={renderedBarGeometry}
          transition={renderedTransition}
          onAnimationStart={() => {
            // Hide the placeholder again whenever a new morph begins.
            if (!isManualPhase) {
              setIsSearchBarSettled(false)

              if (isOpen) {
                setHasSearchInteraction(true)
              }
            }
          }}
          onAnimationComplete={() => {
            // Reveal it only after the bar reaches its final open geometry.
            if (!isManualPhase && isOpen) {
              setIsSearchBarSettled(true)
            }
          }}
          style={{
            transformOrigin:
              barDirection === "right" ? "left center" : "right center",
          }}
        />
      </motion.div>

      <motion.button
        initial={false}
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close search" : "Open search"}
        className="absolute top-0 z-30 flex size-10 items-center justify-center rounded-full bg-transparent text-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
        animate={renderedOrbMotion}
        transition={renderedTransition}
        style={{ left: orbLeft }}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Search className="size-5" strokeWidth={2.25} aria-hidden="true" />
      </motion.button>

      <motion.div
        initial={false}
        aria-hidden={!shouldShowPlaceholder}
        className="pointer-events-none absolute inset-y-0 z-20 overflow-hidden rounded-full"
        animate={{
          opacity: shouldShowPlaceholder ? 1 : 0,
          y: shouldShowPlaceholder ? 0 : 2,
        }}
        transition={placeholderTransition}
        style={{
          left:
            barDirection === "right"
              ? orbLeft +
                GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE +
                GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP
              : 0,
          right:
            barDirection === "right"
              ? 0
              : GLOBAL_INVESTMENT_SEARCH_LAB_ORB_SIZE +
                GLOBAL_INVESTMENT_SEARCH_LAB_SEARCH_BAR_GAP,
        }}
      >
        <motion.div
          initial={false}
          className="flex h-full items-center overflow-hidden whitespace-nowrap pl-5 pr-4"
          animate={{ width: renderedInputWidth }}
          transition={renderedTransition}
        >
          <span className="text-base text-muted-foreground">
            Search investments
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}
