import { useState } from "react"
import {
  SearchMorphLabPreview,
  type SearchMorphLabBarSide,
  type SearchMorphLabPhase,
} from "@/app/lab/SearchMorphLabPreview"

export const SEARCH_MORPH_MOTION_LAB_PATH = "/__lab/global-search"

export function SearchMorphMotionLab() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isReducedMotionPreview, setIsReducedMotionPreview] = useState(false)
  const [searchBarSide, setSearchBarSide] =
    useState<SearchMorphLabBarSide>("right")
  const [inspectionPhase, setInspectionPhase] =
    useState<SearchMorphLabPhase | null>(null)

  function setLiveSearchState(isOpen: boolean) {
    setInspectionPhase(null)
    setIsSearchOpen(isOpen)
  }

  function showInspectionPhase(phase: SearchMorphLabPhase) {
    setInspectionPhase(phase)
    setIsSearchOpen(phase !== "closed")
  }

  function changeSearchBarSide(side: SearchMorphLabBarSide) {
    setSearchBarSide(side)
    setInspectionPhase(null)
    setIsSearchOpen(false)
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl flex-col justify-center gap-8">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Motion lab
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Global investment search
          </h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            A focused stage for reviewing the gooey orb-to-search-bar
            choreography before it is placed back in the top bar.
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Preview
          </p>
          <div className="flex min-h-36 w-full items-center justify-center rounded-2xl border border-border/80 bg-card/40 px-4">
            <SearchMorphLabPreview
              barSide={searchBarSide}
              isOpen={isSearchOpen}
              manualPhase={inspectionPhase ?? undefined}
              onOpenChange={setLiveSearchState}
              reducedMotion={isReducedMotionPreview}
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Controls
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSearchOpen}
              onClick={() => setLiveSearchState(true)}
            >
              Open
            </button>
            <button
              type="button"
              className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isSearchOpen}
              onClick={() => setLiveSearchState(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
              onClick={() => setLiveSearchState(false)}
            >
              Reset
            </button>
            <button
              type="button"
              className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
              aria-pressed={isReducedMotionPreview}
              onClick={() =>
                setIsReducedMotionPreview((isReduced) => !isReduced)
              }
            >
              Reduced motion: {isReducedMotionPreview ? "on" : "off"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Expel bar:</span>
            {(
              [
                ["left", "Left"],
                ["right", "Right"],
              ] as const
            ).map(([direction, label]) => (
              <button
                key={direction}
                type="button"
                className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                aria-pressed={searchBarSide === direction}
                onClick={() => changeSearchBarSide(direction)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["closed", "Closed"],
                ["pressure", "Pressure"],
                ["split", "Split"],
                ["open", "Expanded"],
              ] as const
            ).map(([phase, label]) => (
              <button
                key={phase}
                type="button"
                className="rounded-full border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                aria-pressed={inspectionPhase === phase}
                onClick={() => showInspectionPhase(phase)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Current state: {isSearchOpen ? "open" : "closed"}. Preview:{" "}
            {inspectionPhase ?? "live animation"}. Motion mode:{" "}
            {isReducedMotionPreview ? "reduced" : "animated"}. You can also use
            the search orb itself to toggle the preview.
          </p>
        </section>
      </div>
    </main>
  )
}
