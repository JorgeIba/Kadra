import { SearchMorph } from "@/app/components/SearchMorph"
import { SearchMorphInspection } from "@/app/lab/SearchMorphInspection"
import {
  getSearchMorphLabInspectionFrame,
  type SearchMorphLabBarSide,
  type SearchMorphLabPhase,
} from "@/app/lab/search-morph-lab-motion"

export type {
  SearchMorphLabBarSide,
  SearchMorphLabPhase,
} from "@/app/lab/search-morph-lab-motion"

interface SearchMorphLabPreviewProps {
  barSide?: SearchMorphLabBarSide
  isOpen: boolean
  manualPhase?: SearchMorphLabPhase
  onOpenChange: (isOpen: boolean) => void
  reducedMotion?: boolean
}

export function SearchMorphLabPreview({
  barSide = "right",
  isOpen,
  manualPhase,
  onOpenChange,
  reducedMotion,
}: SearchMorphLabPreviewProps) {
  const inspectionFrame =
    manualPhase === undefined
      ? undefined
      : getSearchMorphLabInspectionFrame(manualPhase)

  const searchSurfaceContent = (
    <div className="flex h-full items-center overflow-hidden whitespace-nowrap pl-5 pr-4">
      <span className="text-base text-muted-foreground">
        Search investments
      </span>
    </div>
  )
  const sharedProps = {
    barSide,
    className: "max-w-[360px]",
    isOpen,
    onOpenChange,
    triggerAriaLabel: isOpen ? "Close search" : "Open search",
  }

  if (inspectionFrame !== undefined) {
    return (
      <SearchMorphInspection {...sharedProps} frame={inspectionFrame}>
        {searchSurfaceContent}
      </SearchMorphInspection>
    )
  }

  return (
    <SearchMorph {...sharedProps} reducedMotion={reducedMotion}>
      {searchSurfaceContent}
    </SearchMorph>
  )
}
