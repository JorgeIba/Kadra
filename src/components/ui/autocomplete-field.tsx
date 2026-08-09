import type { FocusEventHandler } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const AUTOCOMPLETE_SUGGESTION_LIMIT = 6
const DEFAULT_CLEAR_BUTTON_LABEL = "Clear input"
const EMPTY_SUGGESTIONS: readonly string[] = []
const DEFAULT_INPUT_CLASS_NAME =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

interface AutocompleteFieldProps {
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  "aria-label"?: string
  className?: string
  clearButtonLabel?: string
  clearable?: boolean
  disabled?: boolean
  filterSuggestion?: (suggestion: string, query: string) => boolean
  id?: string
  name?: string
  onBlur?: FocusEventHandler<HTMLInputElement>
  onValueChange: (value: string) => void
  placeholder?: string
  suggestions?: readonly string[]
  value: string
}

export function AutocompleteField({
  className,
  clearButtonLabel = DEFAULT_CLEAR_BUTTON_LABEL,
  clearable = false,
  disabled,
  filterSuggestion,
  id,
  name,
  onBlur,
  onValueChange,
  placeholder,
  suggestions = EMPTY_SUGGESTIONS,
  value,
  ...accessibilityProps
}: AutocompleteFieldProps) {
  const filter = filterSuggestion ?? defaultFilterSuggestion

  return (
    <Autocomplete.Root
      autoHighlight
      disabled={disabled}
      filter={filter}
      items={suggestions}
      limit={AUTOCOMPLETE_SUGGESTION_LIMIT}
      value={value}
      onValueChange={onValueChange}
    >
      <Autocomplete.InputGroup className="relative w-full">
        <Autocomplete.Input
          id={id}
          name={name}
          placeholder={placeholder}
          className={cn(
            DEFAULT_INPUT_CLASS_NAME,
            clearable && "pr-9",
            className,
          )}
          value={value}
          onBlur={onBlur}
          {...accessibilityProps}
        />

        {clearable ? (
          <Autocomplete.Clear
            type="button"
            aria-label={clearButtonLabel}
            className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X className="size-3.5" aria-hidden="true" />
          </Autocomplete.Clear>
        ) : null}
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <Autocomplete.Popup className="relative isolate z-50 max-h-48 w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Autocomplete.List>
              {(suggestion: string) => (
                <Autocomplete.Item
                  key={suggestion}
                  value={suggestion}
                  className="block w-full cursor-default rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:bg-accent data-selected:text-accent-foreground"
                >
                  {suggestion}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

function defaultFilterSuggestion(suggestion: string, query: string) {
  return suggestion
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase())
}
