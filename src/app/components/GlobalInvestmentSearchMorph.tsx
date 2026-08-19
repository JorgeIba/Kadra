import {
  type ReactNode,
  type Ref,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Search } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  createGlobalInvestmentSearchMorphFrame,
  createGlobalInvestmentSearchMorphMotion,
  getGlobalInvestmentSearchMorphPlayback,
  GLOBAL_INVESTMENT_SEARCH_MORPH_GAP,
  GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
  GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_STAGE_WIDTH,
  GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
  type GlobalInvestmentSearchMorphAnimationPhase,
  type GlobalInvestmentSearchMorphBarSide,
  type GlobalInvestmentSearchMorphInspectionFrame,
  type GlobalInvestmentSearchMorphVisualModel,
} from "@/app/components/global-investment-search-morph-motion"

interface GlobalInvestmentSearchMorphSharedProps {
  barSide?: GlobalInvestmentSearchMorphBarSide
  children: ReactNode
  className?: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  reducedMotion?: boolean
  surfaceRef?: Ref<HTMLDivElement>
  triggerAriaLabel: string
  triggerRef?: Ref<HTMLButtonElement>
}

export type GlobalInvestmentSearchMorphProps =
  GlobalInvestmentSearchMorphSharedProps

export interface GlobalInvestmentSearchMorphInspectionProps extends GlobalInvestmentSearchMorphSharedProps {
  frame: GlobalInvestmentSearchMorphInspectionFrame
}

interface GlobalInvestmentSearchMorphStageProps extends GlobalInvestmentSearchMorphSharedProps {
  inspectionFrame?: GlobalInvestmentSearchMorphInspectionFrame
}

interface GlobalInvestmentSearchMorphVisualProps {
  children: ReactNode
  isContentVisible: boolean
  isTriggerExpanded: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onMorphAnimationComplete: () => void
  onMorphAnimationStart: () => void
  triggerAriaLabel: string
  triggerRef?: Ref<HTMLButtonElement>
  visualModel: GlobalInvestmentSearchMorphVisualModel
}

function GlobalInvestmentSearchMorphVisual({
  children,
  isContentVisible,
  isTriggerExpanded,
  isOpen,
  onOpenChange,
  onMorphAnimationComplete,
  onMorphAnimationStart,
  triggerAriaLabel,
  triggerRef,
  visualModel,
}: GlobalInvestmentSearchMorphVisualProps) {
  const reactId = useId()
  const filterId = `kadra-global-investment-search-morph-gooey-${reactId.replace(/:/g, "")}`
  const { bar, connectorGeometry, content, orb, transition } = visualModel

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute size-px opacity-0"
      >
        <defs>
          <filter
            id={filterId}
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
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Only the temporary neck uses the filter; both finished bodies stay crisp. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          filter: `url(#${filterId})`,
          WebkitFilter: `url(#${filterId})`,
        }}
      >
        <motion.div
          initial={false}
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-secondary"
          animate={connectorGeometry}
          transition={transition}
          style={{
            left: 0,
            opacity: 0,
            scaleY: 0.4,
            transformOrigin: "center",
            width: 0,
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-11"
      >
        <motion.div
          initial={false}
          className="absolute top-0 size-10 rounded-full bg-secondary"
          animate={orb.motion}
          transition={transition}
          style={{ left: orb.left, transformOrigin: "center" }}
        />

        <motion.div
          initial={false}
          className="absolute inset-y-0 rounded-full bg-secondary"
          animate={bar.geometry}
          transition={transition}
          onAnimationStart={onMorphAnimationStart}
          onAnimationComplete={onMorphAnimationComplete}
          style={{
            left: 0,
            width: GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE,
            transformOrigin:
              bar.side === "right" ? "left center" : "right center",
          }}
        />
      </motion.div>

      <motion.button
        ref={triggerRef}
        initial={false}
        type="button"
        aria-expanded={isTriggerExpanded}
        aria-label={triggerAriaLabel}
        className="absolute inset-y-0 z-30 flex size-10 items-center justify-center rounded-full bg-transparent text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        animate={orb.motion}
        transition={transition}
        style={{ left: orb.left }}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Search className="size-5" strokeWidth={2.25} aria-hidden="true" />
      </motion.button>

      <motion.div
        initial={false}
        aria-hidden={!isContentVisible}
        inert={!isContentVisible}
        className="absolute inset-y-0 z-20 overflow-hidden rounded-full"
        animate={{
          opacity: isContentVisible ? 1 : 0,
          y: isContentVisible ? 0 : 2,
        }}
        transition={content.transition}
        style={{
          ...content.position,
          pointerEvents: isContentVisible ? "auto" : "none",
        }}
      >
        <motion.div
          initial={false}
          className="flex h-full items-center overflow-hidden whitespace-nowrap"
          animate={{ width: content.width }}
          transition={transition}
          style={{ width: 0 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  )
}

/**
 * Owns the morph layout, lifecycle, and visual model. Search state, result
 * data, and autocomplete behavior remain in the caller supplied as children.
 */
function GlobalInvestmentSearchMorphStage({
  barSide = "right",
  children,
  className,
  inspectionFrame,
  isOpen,
  onOpenChange,
  reducedMotion,
  surfaceRef,
  triggerAriaLabel,
  triggerRef,
}: GlobalInvestmentSearchMorphStageProps) {
  const surfaceElementRef = useRef<HTMLDivElement>(null)
  const [stageWidth, setStageWidth] = useState(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_STAGE_WIDTH,
  )
  const systemPrefersReducedMotion = useReducedMotion() ?? false
  const prefersReducedMotion = reducedMotion ?? systemPrefersReducedMotion
  const [animationPhase, setAnimationPhase] =
    useState<GlobalInvestmentSearchMorphAnimationPhase>(() => {
      return isOpen ? "open" : "initial-closed"
    })

  useImperativeHandle(surfaceRef, () => surfaceElementRef.current!, [])

  useLayoutEffect(() => {
    const surfaceElement = surfaceElementRef.current

    if (surfaceElement === null) {
      return undefined
    }

    function updateStageWidth() {
      const nextWidth = surfaceElementRef.current?.getBoundingClientRect().width

      if (nextWidth === undefined) {
        return
      }

      setStageWidth((currentWidth) => {
        return currentWidth === nextWidth ? currentWidth : nextWidth
      })
    }

    updateStageWidth()

    const resizeObserver = new ResizeObserver(updateStageWidth)
    resizeObserver.observe(surfaceElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const layoutWidth = Math.max(
    stageWidth,
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_STAGE_WIDTH,
  )
  const orbLeft =
    barSide === "right"
      ? 0
      : Math.max(0, layoutWidth - GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE)
  const searchBarFinalWidth = Math.max(
    GLOBAL_INVESTMENT_SEARCH_MORPH_MIN_BAR_WIDTH,
    layoutWidth -
      GLOBAL_INVESTMENT_SEARCH_MORPH_ORB_SIZE -
      GLOBAL_INVESTMENT_SEARCH_MORPH_GAP,
  )
  const playback = getGlobalInvestmentSearchMorphPlayback({
    animationPhase,
    isOpen,
    prefersReducedMotion,
  })
  const visualModel = useMemo(() => {
    if (inspectionFrame !== undefined) {
      return createGlobalInvestmentSearchMorphFrame({
        barSide,
        frame: inspectionFrame,
        orbLeft,
        searchBarFinalWidth,
      })
    }

    if (playback === "closed" || playback === "open") {
      return createGlobalInvestmentSearchMorphFrame({
        barSide,
        frame: playback === "open" ? "expanded" : "closed",
        orbLeft,
        searchBarFinalWidth,
      })
    }

    return createGlobalInvestmentSearchMorphMotion({
      barSide,
      isOpen: playback === "opening",
      orbLeft,
      prefersReducedMotion,
      searchBarFinalWidth,
    })
  }, [
    barSide,
    inspectionFrame,
    orbLeft,
    playback,
    prefersReducedMotion,
    searchBarFinalWidth,
  ])
  const isInspectionMode = inspectionFrame !== undefined
  const isTriggerExpanded = isInspectionMode
    ? isOpen && inspectionFrame === "expanded"
    : isOpen
  const isContentVisible = isInspectionMode
    ? isTriggerExpanded
    : isOpen && (prefersReducedMotion || playback === "open")
  const isLiveMorphTransition =
    !isInspectionMode && (playback === "opening" || playback === "closing")

  return (
    <div
      ref={surfaceElementRef}
      className={cn("relative h-10 min-w-[128px] w-full", className)}
    >
      <GlobalInvestmentSearchMorphVisual
        isContentVisible={isContentVisible}
        isTriggerExpanded={isTriggerExpanded}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onMorphAnimationStart={() => {
          if (isLiveMorphTransition) {
            setAnimationPhase(isOpen ? "opening" : "closing")
          }
        }}
        onMorphAnimationComplete={() => {
          if (isLiveMorphTransition) {
            setAnimationPhase(isOpen ? "open" : "closed")
          }
        }}
        triggerAriaLabel={triggerAriaLabel}
        triggerRef={triggerRef}
        visualModel={visualModel}
      >
        {children}
      </GlobalInvestmentSearchMorphVisual>
    </div>
  )
}

export function GlobalInvestmentSearchMorph(
  props: GlobalInvestmentSearchMorphProps,
) {
  return <GlobalInvestmentSearchMorphStage {...props} />
}

/**
 * Static inspection entry point for the isolated motion Lab. Keeping this
 * separate prevents Lab-only frames from becoming part of the live search API.
 */
export function GlobalInvestmentSearchMorphInspection({
  frame,
  ...props
}: GlobalInvestmentSearchMorphInspectionProps) {
  return <GlobalInvestmentSearchMorphStage {...props} inspectionFrame={frame} />
}
