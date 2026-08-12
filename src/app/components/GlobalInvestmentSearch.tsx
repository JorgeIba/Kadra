import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { Search, X } from "lucide-react"
import { getInvestmentsMatchingQuery } from "@/app/shared/investment-search"
import { Button } from "@/components/ui/button"
import {
  DERIVED_STATUS_LABELS,
  INVESTMENT_TYPE_LABELS,
  resolveInvestment,
  type Investment,
  type ResolvedInvestment,
} from "@/domain/investments"

const MAX_SEARCH_RESULT_COUNT = 6

interface GlobalInvestmentSearchProps {
  searchableInvestments: readonly Investment[]
  onSearchResultSelect: (investmentId: string) => void
}

export function GlobalInvestmentSearch({
  searchableInvestments,
  onSearchResultSelect,
}: GlobalInvestmentSearchProps) {
  const [isSearchSurfaceOpen, setIsSearchSurfaceOpen] = useState(false)

  function openSearchSurface() {
    setIsSearchSurfaceOpen(true)
  }

  function closeSearchSurface() {
    setIsSearchSurfaceOpen(false)
  }

  function handleSearchResultSelect(investmentId: string) {
    closeSearchSurface()
    onSearchResultSelect(investmentId)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        aria-label="Search investments"
        className="size-10 rounded-full border border-border/80 bg-secondary/70 text-primary hover:bg-secondary hover:text-primary"
        onClick={openSearchSurface}
      >
        <Search className="size-4.5" aria-hidden="true" />
      </Button>

      {isSearchSurfaceOpen
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-20 cursor-default bg-transparent"
                aria-hidden="true"
                onClick={closeSearchSurface}
              />
              <div className="fixed inset-x-0 top-[max(1.25rem,env(safe-area-inset-top))] z-30 mx-auto flex w-full max-w-md justify-end px-5">
                <InvestmentSearchAutocomplete
                  searchableInvestments={searchableInvestments}
                  onClose={closeSearchSurface}
                  onSearchResultSelect={handleSearchResultSelect}
                />
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  )
}

interface InvestmentSearchAutocompleteProps {
  searchableInvestments: readonly Investment[]
  onClose: () => void
  onSearchResultSelect: (investmentId: string) => void
}

function InvestmentSearchAutocomplete({
  searchableInvestments,
  onClose,
  onSearchResultSelect,
}: InvestmentSearchAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isResultsPopupOpen, setIsResultsPopupOpen] = useState(false)
  const [searchAsOfDate] = useState(() => new Date())

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

  return (
    <Autocomplete.Root
      autoHighlight="always"
      filter={null}
      filteredItems={searchResults}
      itemToStringValue={(searchResult) => searchResult.name}
      items={resolvedSearchableInvestments}
      open={isResultsPopupOpen && hasSearchQuery}
      value={searchQuery}
      onOpenChange={(isOpen, eventDetails) => {
        setIsResultsPopupOpen(isOpen)

        if (!isOpen && eventDetails.reason === "escape-key") {
          onClose()
        }
      }}
      onValueChange={(nextSearchQuery, eventDetails) => {
        if (eventDetails.reason !== "item-press") {
          setSearchQuery(nextSearchQuery)
          setIsResultsPopupOpen(nextSearchQuery.trim() !== "")
        }
      }}
    >
      <div className="mr-20 w-[calc(100%-5rem)] max-w-70">
        <Autocomplete.InputGroup className="relative flex h-10 items-center rounded-full border border-primary/25 bg-card pl-10 pr-10 focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/12">
          <Search
            className="pointer-events-none absolute left-3.5 size-4 text-primary"
            aria-hidden="true"
          />
          <Autocomplete.Input
            autoFocus
            aria-label="Search investments"
            placeholder="Search investments"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onClose()
              }
            }}
          />
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-secondary/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </Autocomplete.InputGroup>
      </div>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={6} align="end" className="z-50">
          <Autocomplete.Popup className="max-h-[min(22rem,var(--available-height))] w-(--anchor-width) overflow-y-auto rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-[0_6px_8px_rgb(0_0_0/0.32)] outline-none">
            <Autocomplete.List>
              {(searchResult: ResolvedInvestment, resultIndex: number) => (
                <Autocomplete.Item
                  key={searchResult.id}
                  value={searchResult}
                  index={resultIndex}
                  className="flex min-h-14 w-full cursor-default flex-col justify-center rounded-lg px-3 py-2 text-left outline-none data-highlighted:bg-secondary/80"
                  onClick={() => onSearchResultSelect(searchResult.id)}
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
            <Autocomplete.Empty className="px-3 py-5 text-center text-sm text-muted-foreground">
              No investments found.
            </Autocomplete.Empty>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}
