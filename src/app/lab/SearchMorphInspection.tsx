import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { SearchMorphVisual } from "@/app/components/SearchMorphVisual"
import type { SearchMorphProps } from "@/app/components/SearchMorph"
import {
  createMorphFrame,
  type MorphInspectionFrame,
} from "@/app/components/search-morph-motion"
import { useSearchMorphLayout } from "@/app/components/use-search-morph-layout"

export interface SearchMorphInspectionProps extends Omit<
  SearchMorphProps,
  "reducedMotion"
> {
  frame: MorphInspectionFrame
}

/**
 * Lab-only static inspection wrapper. It selects a named pose and reuses the
 * production visual renderer without creating the live state machine.
 */
export function SearchMorphInspection({
  barSide = "right",
  children,
  className,
  frame,
  isOpen,
  onOpenChange,
  containerRef,
  triggerAriaLabel,
  triggerRef,
}: SearchMorphInspectionProps) {
  const { containerElementRef, expandedBarWidth, orbLeft } =
    useSearchMorphLayout({
      barSide,
      containerRef,
    })
  const visualModel = useMemo(
    () =>
      createMorphFrame({
        barSide,
        frame,
        orbLeft,
        expandedBarWidth,
      }),
    [barSide, expandedBarWidth, frame, orbLeft],
  )
  const isTriggerExpanded = isOpen && frame === "expanded"

  return (
    <div
      ref={containerElementRef}
      className={cn("relative h-10 min-w-0 w-full", className)}
    >
      <SearchMorphVisual
        isContentVisible={isTriggerExpanded}
        isTriggerExpanded={isTriggerExpanded}
        onToggle={() => onOpenChange(!isOpen)}
        triggerAriaLabel={triggerAriaLabel}
        triggerRef={triggerRef}
        visualModel={visualModel}
      >
        {children}
      </SearchMorphVisual>
    </div>
  )
}
