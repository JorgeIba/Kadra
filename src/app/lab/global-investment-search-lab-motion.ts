import {
  type GlobalInvestmentSearchMorphBarSide,
  type GlobalInvestmentSearchMorphInspectionFrame,
} from "@/app/components/global-investment-search-morph-motion"

export type GlobalInvestmentSearchLabBarSide =
  GlobalInvestmentSearchMorphBarSide

export type GlobalInvestmentSearchLabPhase =
  | "closed"
  | "pressure"
  | "split"
  | "open"

const LAB_PHASE_TO_MORPH_FRAME: Record<
  GlobalInvestmentSearchLabPhase,
  GlobalInvestmentSearchMorphInspectionFrame
> = {
  closed: "closed",
  pressure: "pressure",
  split: "split",
  open: "expanded",
}

export function getGlobalInvestmentSearchLabInspectionFrame(
  phase: GlobalInvestmentSearchLabPhase,
): GlobalInvestmentSearchMorphInspectionFrame {
  return LAB_PHASE_TO_MORPH_FRAME[phase]
}
