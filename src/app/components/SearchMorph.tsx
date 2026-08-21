import { type ReactNode, type Ref, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  createMorphFrame,
  createMorphMotion,
  type MorphBarSide,
} from "@/app/components/search-morph-motion"
import { SearchMorphVisual } from "@/app/components/SearchMorphVisual"
import { useSearchMorphChoreography } from "@/app/components/use-search-morph-choreography"
import { useSearchMorphController } from "@/app/components/use-search-morph-controller"
import { useSearchMorphLayout } from "@/app/components/use-search-morph-layout"

interface SearchMorphCommonProps {
  barSide?: MorphBarSide
  children: ReactNode
  className?: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onBeforeClose?: () => void
  onClosed?: () => void
  reducedMotion?: boolean
  containerRef?: Ref<HTMLDivElement>
  triggerAriaLabel: string
  triggerRef?: Ref<HTMLButtonElement>
}

export type SearchMorphProps = SearchMorphCommonProps

/**
 * Owns the live production morph: controlled state, choreography, layout, and
 * the visual model used by the shared renderer.
 */
export function SearchMorph({
  barSide = "right",
  children,
  className,
  isOpen,
  onOpenChange,
  onBeforeClose,
  onClosed,
  reducedMotion,
  containerRef,
  triggerAriaLabel,
  triggerRef,
}: SearchMorphProps) {
  const { containerElementRef, expandedBarWidth, orbLeft } =
    useSearchMorphLayout({
      barSide,
      containerRef,
    })
  const controller = useSearchMorphController({
    isOpen,
  })
  const choreography = useSearchMorphChoreography({
    onTransitionSequenceFastForwarded: controller.fastForwardTransitionSequence,
    onTransitionStepCompleted: controller.completeTransitionStep,
    reducedMotion,
    stage: controller.stage,
  })

  // Let consumers restore adjacent UI only after the closing morph is complete.
  useEffect(() => {
    if (controller.stage === "closed") {
      onClosed?.()
    }
  }, [controller.stage, onClosed])

  const visualModel = useMemo(() => {
    if (controller.stage === "closed" || controller.stage === "open") {
      return createMorphFrame({
        barSide,
        frame: controller.stage === "open" ? "expanded" : "closed",
        orbLeft,
        expandedBarWidth,
      })
    }

    return createMorphMotion({
      barSide,
      target: controller.stage === "opening" ? "open" : "closed",
      orbLeft,
      expandedBarWidth,
    })
  }, [barSide, controller.stage, expandedBarWidth, orbLeft])

  function requestClose() {
    onBeforeClose?.()
    onOpenChange(false)
  }

  return (
    <div
      ref={containerElementRef}
      className={cn("relative h-10 min-w-0 w-full", className)}
      onKeyDownCapture={(event) => {
        if (!isOpen || event.key !== "Escape") {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        requestClose()
      }}
    >
      <SearchMorphVisual
        isContentVisible={controller.isContentVisible}
        isTriggerExpanded={controller.isTriggerExpanded}
        onTransitionStepComplete={choreography.reportTransitionStepComplete}
        onToggle={() => {
          if (!isOpen) {
            onOpenChange(true)
            return
          }

          requestClose()
        }}
        stage={controller.stage}
        triggerAriaLabel={triggerAriaLabel}
        triggerRef={triggerRef}
        visualModel={visualModel}
      >
        {children}
      </SearchMorphVisual>
    </div>
  )
}
