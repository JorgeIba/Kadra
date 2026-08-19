import {
  GlobalInvestmentSearchMorph,
  GlobalInvestmentSearchMorphInspection,
} from "@/app/components/GlobalInvestmentSearchMorph"
import {
  getGlobalInvestmentSearchLabInspectionFrame,
  type GlobalInvestmentSearchLabBarSide,
  type GlobalInvestmentSearchLabPhase,
} from "@/app/lab/global-investment-search-lab-motion"

export type {
  GlobalInvestmentSearchLabBarSide,
  GlobalInvestmentSearchLabPhase,
} from "@/app/lab/global-investment-search-lab-motion"

interface GlobalInvestmentSearchMorphLabPreviewProps {
  barSide?: GlobalInvestmentSearchLabBarSide
  isOpen: boolean
  manualPhase?: GlobalInvestmentSearchLabPhase
  onOpenChange: (isOpen: boolean) => void
  reducedMotion?: boolean
}

export function GlobalInvestmentSearchMorphLabPreview({
  barSide = "right",
  isOpen,
  manualPhase,
  onOpenChange,
  reducedMotion,
}: GlobalInvestmentSearchMorphLabPreviewProps) {
  const inspectionFrame =
    manualPhase === undefined
      ? undefined
      : getGlobalInvestmentSearchLabInspectionFrame(manualPhase)

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
    reducedMotion,
    triggerAriaLabel: isOpen ? "Close search" : "Open search",
  }

  if (inspectionFrame !== undefined) {
    return (
      <GlobalInvestmentSearchMorphInspection
        {...sharedProps}
        frame={inspectionFrame}
      >
        {searchSurfaceContent}
      </GlobalInvestmentSearchMorphInspection>
    )
  }

  return (
    <GlobalInvestmentSearchMorph {...sharedProps}>
      {searchSurfaceContent}
    </GlobalInvestmentSearchMorph>
  )
}
