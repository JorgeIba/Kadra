import {
  type MorphBarSide,
  type MorphInspectionFrame,
} from "@/app/components/search-morph-motion"

export type SearchMorphLabBarSide = MorphBarSide

export type SearchMorphLabPhase = "closed" | "pressure" | "split" | "open"

const LAB_PHASE_TO_MORPH_FRAME: Record<
  SearchMorphLabPhase,
  MorphInspectionFrame
> = {
  closed: "closed",
  pressure: "pressure",
  split: "split",
  open: "expanded",
}

export function getSearchMorphLabInspectionFrame(
  phase: SearchMorphLabPhase,
): MorphInspectionFrame {
  return LAB_PHASE_TO_MORPH_FRAME[phase]
}
