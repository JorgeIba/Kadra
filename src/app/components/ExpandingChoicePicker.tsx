import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown, type LucideIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface ExpandingChoicePickerOption<T extends string> {
  description: string
  icon: LucideIcon
  label: string
  summary: string
  value: T
}

interface ExpandingChoicePickerProps<T extends string> {
  ariaLabel: string
  legend: string
  isOpeningAuthorized?: boolean
  onCloseComplete?: () => void
  onOpenRequest?: () => void
  onValueCommit: (value: T) => void
  options: readonly ExpandingChoicePickerOption<T>[]
  value: T
}

/**
 * Keeps a provisional choice inside the picker until its closing animation
 * finishes. Resting and opening states cannot accidentally carry one.
 */
type PickerInteractionState<T extends string> =
  | { phase: "collapsed"; valueToCommit: null }
  | { phase: "open-requested"; valueToCommit: null }
  | { phase: "closing"; valueToCommit: T | null }

export function ExpandingChoicePicker<T extends string>({
  ariaLabel,
  legend,
  isOpeningAuthorized = true,
  onCloseComplete,
  onOpenRequest,
  onValueCommit,
  options,
  value,
}: ExpandingChoicePickerProps<T>) {
  const radioGroupName = useId()
  const [interaction, setInteraction] = useState<PickerInteractionState<T>>({
    phase: "collapsed",
    valueToCommit: null,
  })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedRadioRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  // User intent and parent authorization are separate so a sibling can finish
  // exiting while the picker remains visibly collapsed.
  const isOpen = interaction.phase === "open-requested" && isOpeningAuthorized
  const isWaitingForOpeningAuthorization =
    interaction.phase === "open-requested" && !isOpeningAuthorized
  const isBusy =
    isWaitingForOpeningAuthorization || interaction.phase === "closing"

  // Focus the selected radio when the picker opens.
  useEffect(() => {
    if (!isOpen) {
      return
    }

    selectedRadioRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  const displayedValue = interaction.valueToCommit ?? value
  const selectedOption = options.find(
    (option) => option.value === displayedValue,
  )

  if (selectedOption === undefined) {
    return null
  }

  const visibleOptions = isOpen ? options : [selectedOption]

  function requestOpen() {
    if (interaction.phase !== "collapsed") {
      return
    }

    // The parent may authorize immediately or wait for a prerequisite animation.
    setInteraction({ phase: "open-requested", valueToCommit: null })
    onOpenRequest?.()
  }

  function chooseOptionAndStartClosing(chosenValue: T) {
    setInteraction({
      phase: "closing",
      valueToCommit: chosenValue === value ? null : chosenValue,
    })
  }

  // The picker container owns layout completion so semantic settlement does not
  // depend on any individual option card's Motion lifecycle.
  function finishCloseAfterLayoutAnimation() {
    if (interaction.phase !== "closing") {
      return
    }

    const { valueToCommit } = interaction
    setInteraction({ phase: "collapsed", valueToCommit: null })

    if (valueToCommit !== null) {
      onValueCommit(valueToCommit)
    }

    onCloseComplete?.()
    requestAnimationFrame(() =>
      triggerRef.current?.focus({ preventScroll: true }),
    )
  }

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <motion.div
        layout
        aria-label={ariaLabel}
        className={cn(
          "relative grid gap-2",
          isOpen ? "grid-cols-3" : "grid-cols-1",
        )}
        transition={{
          layout: prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
        }}
        onLayoutAnimationComplete={finishCloseAfterLayoutAnimation}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleOptions.map((option) => {
            const Icon = option.icon
            const isSelected = option.value === displayedValue

            return (
              <motion.div
                key={option.value}
                layout
                className={cn(
                  "min-w-0 overflow-hidden rounded-lg border transition-[background-color,border-color,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "min-h-26" : "h-11",
                  isSelected
                    ? "border-primary/60 bg-accent/50 text-foreground"
                    : "border-border/75 bg-background/35 text-muted-foreground hover:border-primary/30 hover:bg-muted/40",
                )}
                exit={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.98 }
                }
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  layout: prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                  opacity: prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
                  scale: prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {isOpen ? (
                  <label
                    className="flex h-full min-h-26 cursor-pointer flex-col justify-between p-3 focus-within:ring-3 focus-within:ring-ring/50 active:scale-[0.98] motion-reduce:transform-none"
                    onClick={(event) => {
                      if (isSelected) {
                        event.preventDefault()
                        chooseOptionAndStartClosing(option.value)
                      }
                    }}
                  >
                    <input
                      ref={isSelected ? selectedRadioRef : undefined}
                      checked={isSelected}
                      className="sr-only"
                      name={radioGroupName}
                      type="radio"
                      value={option.value}
                      aria-label={`${option.label}: ${option.description}`}
                      onChange={() => chooseOptionAndStartClosing(option.value)}
                    />
                    <span className="flex items-center justify-between gap-2">
                      <Icon
                        className={cn(
                          "size-4",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                      <Check
                        className={cn(
                          "size-4 transition-opacity duration-180 motion-reduce:transition-none",
                          isSelected ? "opacity-100 text-primary" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-sm leading-5 text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ) : (
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-expanded={isOpen}
                    aria-busy={isBusy}
                    aria-label={`${ariaLabel}: ${selectedOption.summary}`}
                    disabled={interaction.phase !== "collapsed"}
                    className="flex h-full w-full items-center gap-3 px-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={requestOpen}
                  >
                    <Icon
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {selectedOption.summary}
                    </span>
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      <p className="sr-only" role="status" aria-atomic="true">
        {isBusy
          ? `${ariaLabel} is updating.`
          : `${ariaLabel} updated: ${selectedOption.summary}.`}
      </p>
    </fieldset>
  )
}
