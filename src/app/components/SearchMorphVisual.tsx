/**
 * Renders the orb, temporary connector, search surface, and projected content.
 *
 * This is the Motion/DOM boundary: it receives resolved state and geometry,
 * renders them, and reports completed transitions to the controller.
 */
import { type ReactNode, type Ref, useId } from "react"
import { Search } from "lucide-react"
import { motion } from "motion/react"
import { SEARCH_MORPH_ORB_SIZE } from "@/app/components/search-morph-animations"
import type { MorphStage } from "@/app/components/search-morph-machine"
import { type MorphVisualModel } from "@/app/components/search-morph-motion"

interface SearchMorphVisualProps {
  children: ReactNode
  isContentVisible: boolean
  isTriggerExpanded: boolean
  onTransitionStepComplete?: (stage: MorphStage) => void
  onToggle: () => void
  stage?: MorphStage
  triggerAriaLabel: string
  triggerRef?: Ref<HTMLButtonElement>
  visualModel: MorphVisualModel
}

export function SearchMorphVisual({
  children,
  isContentVisible,
  isTriggerExpanded,
  onTransitionStepComplete,
  onToggle,
  stage,
  triggerAriaLabel,
  triggerRef,
  visualModel,
}: SearchMorphVisualProps) {
  const instanceId = useId()
  const filterId = `kadra-search-morph-gooey-${instanceId.replace(/:/g, "")}`
  const contentId = `kadra-search-morph-content-${instanceId.replace(/:/g, "")}`
  const { bar, connectorGeometry, content, orb, transition } = visualModel

  // Capture the stage rendered with this visual tree for stale completion checks.
  function reportCurrentStageTransitionComplete() {
    if (stage !== undefined && onTransitionStepComplete !== undefined) {
      onTransitionStepComplete(stage)
    }
  }

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
          onAnimationComplete={reportCurrentStageTransitionComplete}
          style={{
            left: 0,
            width: SEARCH_MORPH_ORB_SIZE,
            transformOrigin:
              bar.side === "right" ? "left center" : "right center",
          }}
        />
      </motion.div>

      <motion.button
        ref={triggerRef}
        initial={false}
        type="button"
        aria-controls={contentId}
        aria-expanded={isTriggerExpanded}
        aria-label={triggerAriaLabel}
        className="absolute inset-y-0 z-30 flex size-10 items-center justify-center rounded-full bg-transparent text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        animate={orb.motion}
        transition={transition}
        style={{ left: orb.left }}
        onClick={onToggle}
      >
        <Search className="size-5" strokeWidth={2.25} aria-hidden="true" />
      </motion.button>

      <motion.div
        id={contentId}
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
