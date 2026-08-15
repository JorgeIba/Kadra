import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { Search, X } from "lucide-react"
import { GlobalInvestmentSearchSurface } from "@/app/components/GlobalInvestmentSearchSurface"
import { getInvestmentsMatchingQuery } from "@/app/shared/investment-search"
import {
  DERIVED_STATUS_LABELS,
  INVESTMENT_TYPE_LABELS,
  resolveInvestment,
  type Investment,
  type ResolvedInvestment,
} from "@/domain/investments"

const MAX_SEARCH_RESULT_COUNT = 6

interface GlobalInvestmentSearchProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  searchableInvestments: readonly Investment[]
  onSearchResultSelect: (investmentId: string) => void
}

export function GlobalInvestmentSearch({
  isOpen,
  onOpenChange,
  searchableInvestments,
  onSearchResultSelect,
}: GlobalInvestmentSearchProps) {
  const searchSurfaceRef = useRef<HTMLDivElement>(null)
  const searchResultsRegionRef = useRef<HTMLDivElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreSearchTriggerFocusRef = useRef(false)

  // Explicit close actions wait for the closed trigger to mount before restoring focus.
  // Outside presses intentionally skip this so the clicked control keeps its focus.
  useEffect(() => {
    if (isOpen || !shouldRestoreSearchTriggerFocusRef.current) {
      return
    }

    searchTriggerRef.current?.focus()
    shouldRestoreSearchTriggerFocusRef.current = false
  }, [isOpen])

  // Treat the inline capsule and portaled results positioner as one search boundary.
  // Capture-phase listeners still observe outside interactions that stop bubbling.
  useEffect(() => {
    const searchSurface = searchSurfaceRef.current

    if (!isOpen || searchSurface === null) {
      return undefined
    }

    const ownerDocument = searchSurface.ownerDocument
    let didPrimaryPointerDownStartOutsideSearch = false

    function isInsideSearch(event: Event) {
      const eventPath = event.composedPath()
      const currentSearchSurface = searchSurfaceRef.current
      const currentSearchResultsRegion = searchResultsRegionRef.current

      return (
        (currentSearchSurface !== null &&
          eventPath.includes(currentSearchSurface)) ||
        (currentSearchResultsRegion !== null &&
          eventPath.includes(currentSearchResultsRegion))
      )
    }

    function handlePointerDown(event: PointerEvent) {
      didPrimaryPointerDownStartOutsideSearch =
        event.isPrimary && event.button === 0 && !isInsideSearch(event)
    }

    function handleClick(event: MouseEvent) {
      const shouldClose =
        didPrimaryPointerDownStartOutsideSearch && !isInsideSearch(event)

      didPrimaryPointerDownStartOutsideSearch = false

      if (shouldClose) {
        onOpenChange(false)
      }
    }

    ownerDocument.addEventListener("pointerdown", handlePointerDown, true)
    ownerDocument.addEventListener("click", handleClick, true)

    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown, true)
      ownerDocument.removeEventListener("click", handleClick, true)
    }
  }, [isOpen, onOpenChange])

  function closeSearchSurface() {
    shouldRestoreSearchTriggerFocusRef.current = true
    onOpenChange(false)
  }

  function handleSearchResultSelect(investmentId: string) {
    closeSearchSurface()
    onSearchResultSelect(investmentId)
  }

  return (
    <GlobalInvestmentSearchSurface
      ref={searchSurfaceRef}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onRequestClose={closeSearchSurface}
      triggerRef={searchTriggerRef}
    >
      {isOpen ? (
        <InvestmentSearchAutocomplete
          onRequestClose={closeSearchSurface}
          onSearchResultSelect={handleSearchResultSelect}
          searchResultsRegionRef={searchResultsRegionRef}
          searchableInvestments={searchableInvestments}
        />
      ) : null}
    </GlobalInvestmentSearchSurface>
  )
}

interface InvestmentSearchAutocompleteProps {
  onRequestClose: () => void
  onSearchResultSelect: (investmentId: string) => void
  searchResultsRegionRef: RefObject<HTMLDivElement | null>
  searchableInvestments: readonly Investment[]
}

function InvestmentSearchAutocomplete({
  onRequestClose,
  onSearchResultSelect,
  searchResultsRegionRef,
  searchableInvestments,
}: InvestmentSearchAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isResultsPopupOpen, setIsResultsPopupOpen] = useState(false)
  const [searchAsOfDate] = useState(() => new Date())
  const highlightedSearchResultRef = useRef<ResolvedInvestment | undefined>(
    undefined,
  )

  const resolvedSearchableInvestments = useMemo(() => {
    return searchableInvestments.map((investment) => {
      return resolveInvestment(investment, searchAsOfDate)
    })
  }, [searchableInvestments, searchAsOfDate])

  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "") {
      return []
    }

    return getInvestmentsMatchingQuery(
      resolvedSearchableInvestments,
      searchQuery,
    ).slice(0, MAX_SEARCH_RESULT_COUNT)
  }, [resolvedSearchableInvestments, searchQuery])

  const hasSearchQuery = searchQuery.trim() !== ""

  function selectHighlightedSearchResult() {
    const highlightedSearchResult =
      highlightedSearchResultRef.current ?? searchResults[0]

    if (highlightedSearchResult === undefined) {
      return false
    }

    onSearchResultSelect(highlightedSearchResult.id)
    return true
  }

  return (
    <Autocomplete.Root
      autoHighlight="always"
      filter={null}
      filteredItems={searchResults}
      itemToStringValue={(searchResult) => searchResult.name}
      items={resolvedSearchableInvestments}
      open={isResultsPopupOpen && hasSearchQuery}
      value={searchQuery}
      onOpenChange={(isOpen) => {
        setIsResultsPopupOpen(isOpen)
      }}
      onItemHighlighted={(highlightedSearchResult) => {
        highlightedSearchResultRef.current = highlightedSearchResult
      }}
      onValueChange={(nextSearchQuery, eventDetails) => {
        if (eventDetails.reason === "item-press") {
          selectHighlightedSearchResult()
          return
        }

        highlightedSearchResultRef.current = undefined
        setSearchQuery(nextSearchQuery)
        setIsResultsPopupOpen(nextSearchQuery.trim() !== "")
      }}
    >
      <Autocomplete.InputGroup className="relative flex h-10 w-full items-center bg-transparent pl-10 pr-10">
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-primary"
          aria-hidden="true"
        />
        <Autocomplete.Input
          autoFocus
          aria-label="Search investments"
          placeholder="Search investments"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
          onKeyDownCapture={(event) => {
            if (event.key !== "Enter") {
              return
            }

            event.preventDefault()
            event.stopPropagation()
            selectHighlightedSearchResult()
          }}
        />
        <button
          type="button"
          aria-label="Close search"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={onRequestClose}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner
          ref={searchResultsRegionRef}
          sideOffset={6}
          align="end"
          className="z-50"
        >
          <Autocomplete.Popup
            initialFocus={false}
            className="max-h-[min(22rem,var(--available-height))] w-(--anchor-width) overflow-y-auto rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-[0_6px_8px_rgb(0_0_0/0.32)] outline-none"
          >
            <Autocomplete.List>
              {(searchResult: ResolvedInvestment, resultIndex: number) => (
                <Autocomplete.Item
                  key={searchResult.id}
                  value={searchResult}
                  index={resultIndex}
                  className="flex min-h-14 w-full cursor-default flex-col justify-center rounded-lg px-3 py-2 text-left outline-none data-highlighted:bg-secondary/80"
                >
                  <span className="truncate text-sm font-medium text-foreground">
                    {searchResult.name}
                  </span>
                  <span className="mt-0.5 truncate text-xs text-muted-foreground">
                    {searchResult.institutionName} ·{" "}
                    {INVESTMENT_TYPE_LABELS[searchResult.type]} ·{" "}
                    {DERIVED_STATUS_LABELS[searchResult.derivedStatus]}
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
            {searchResults.length === 0 ? (
              <Autocomplete.Empty className="px-3 py-5 text-center text-sm text-muted-foreground">
                No investments found.
              </Autocomplete.Empty>
            ) : null}
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}
