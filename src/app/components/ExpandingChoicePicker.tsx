import { useId } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { type PickerStage } from "@/app/components/expanding-choice-picker-machine"
import { useExpandingChoicePickerController } from "@/app/components/use-expanding-choice-picker-controller"
import {
  type PickerAnimationSpeed,
  type PickerLayoutTransitions,
} from "@/app/components/expanding-choice-picker-animations"
import { cn } from "@/lib/utils"

export interface ExpandingChoicePickerOption<T extends string> {
  /** Optional shorter copy used while the open selection view is visible. */
  compactDescription?: string
  description: string
  icon: LucideIcon
  label: string
  summary: string
  value: T
}

interface ExpandingChoicePickerProps<T extends string> {
  ariaLabel: string
  animationSpeed?: PickerAnimationSpeed
  canStartPendingOpening?: boolean
  legend: string
  onCloseComplete?: () => void
  onOpenRequest?: () => void
  onValueChange?: (value: T) => void
  onValueCommit?: (value: T) => void
  options: readonly ExpandingChoicePickerOption<T>[]
  value: T
}

type PickerSurfaceAction = "none" | "request-open" | "choose-option"

interface PickerPresentation {
  deck: "single-row" | "stacked" | "expanded"
  availableAction: PickerSurfaceAction
  areBackCardsVisible: boolean
  selectionVisible: boolean
  surface: "single-row" | "card"
}

/** Named render recipes shared by one or more choreography stages. */
const PICKER_PRESENTATIONS = {
  singleRowReadyToOpen: {
    availableAction: "request-open",
    areBackCardsVisible: false,
    deck: "single-row",
    selectionVisible: false,
    surface: "single-row",
  },
  singleRowLocked: {
    availableAction: "none",
    areBackCardsVisible: false,
    deck: "single-row",
    selectionVisible: false,
    surface: "single-row",
  },
  singleRowWithBackCards: {
    availableAction: "none",
    areBackCardsVisible: true,
    deck: "single-row",
    selectionVisible: false,
    surface: "single-row",
  },
  stackedCardsContentHidden: {
    availableAction: "none",
    areBackCardsVisible: true,
    deck: "stacked",
    selectionVisible: false,
    surface: "card",
  },
  stackedCardsSelectionVisible: {
    availableAction: "none",
    areBackCardsVisible: true,
    deck: "stacked",
    selectionVisible: true,
    surface: "card",
  },
  expandedCardsLocked: {
    availableAction: "none",
    areBackCardsVisible: true,
    deck: "expanded",
    selectionVisible: false,
    surface: "card",
  },
  expandedCardsReadyToChoose: {
    availableAction: "choose-option",
    areBackCardsVisible: true,
    deck: "expanded",
    selectionVisible: true,
    surface: "card",
  },
  expandedCardsSelectionMoving: {
    availableAction: "none",
    areBackCardsVisible: true,
    deck: "expanded",
    selectionVisible: true,
    surface: "card",
  },
} satisfies Record<string, PickerPresentation>

/** Maps behavioral stages to visual arrangements that stages can share. */
const PICKER_PRESENTATION_BY_STAGE = {
  collapsed: PICKER_PRESENTATIONS.singleRowReadyToOpen,
  "awaiting-open-readiness": PICKER_PRESENTATIONS.singleRowLocked,
  "opening-content-hide": PICKER_PRESENTATIONS.singleRowLocked,
  "opening-row-to-card": PICKER_PRESENTATIONS.stackedCardsContentHidden,
  "opening-content-show": PICKER_PRESENTATIONS.stackedCardsContentHidden,
  "opening-deck-expand": PICKER_PRESENTATIONS.expandedCardsLocked,
  expanded: PICKER_PRESENTATIONS.expandedCardsReadyToChoose,
  "moving-selection": PICKER_PRESENTATIONS.expandedCardsSelectionMoving,
  "closing-deck-stack": PICKER_PRESENTATIONS.stackedCardsSelectionVisible,
  "closing-content-hide": PICKER_PRESENTATIONS.stackedCardsContentHidden,
  "closing-card-to-row": PICKER_PRESENTATIONS.singleRowWithBackCards,
  "closing-content-show": PICKER_PRESENTATIONS.singleRowLocked,
} satisfies Record<PickerStage, PickerPresentation>

/**
 * Converts the machine's behavioral stage into the visual recipe the React
 * tree should render.
 */
function getPickerPresentation(
  stage: PickerStage,
  isCloseSettlementPending: boolean,
): PickerPresentation {
  // The close geometry has settled, but React has not delivered the close to
  // the parent yet. Keep the single-row control locked so a new session
  // cannot overlap it.
  if (isCloseSettlementPending) {
    return PICKER_PRESENTATIONS.singleRowLocked
  }

  return PICKER_PRESENTATION_BY_STAGE[stage]
}

export function ExpandingChoicePicker<T extends string>({
  ariaLabel,
  animationSpeed = "standard",
  canStartPendingOpening,
  legend,
  onCloseComplete,
  onOpenRequest,
  onValueChange,
  onValueCommit,
  options,
  value,
}: ExpandingChoicePickerProps<T>) {
  const pickerId = useId()
  const {
    choreography,
    chooseOption,
    displayedValue,
    isCloseSettlementPending,
    requestOpen,
    stage,
  } = useExpandingChoicePickerController({
    animationSpeed,
    canStartPendingOpening,
    onCloseComplete,
    onOpenRequest,
    onValueChange,
    onValueCommit,
    value,
  })
  const {
    choiceContentAnimationScope,
    layoutTransitions,
    reportLayoutAnimationComplete,
  } = choreography
  const presentation = getPickerPresentation(stage, isCloseSettlementPending)
  const selectedOption = options.find((option) => {
    return option.value === displayedValue
  })

  if (selectedOption === undefined) {
    return null
  }

  return (
    <fieldset ref={choiceContentAnimationScope} className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <LayoutGroup id={pickerId}>
        <ChoiceDeck
          layoutTransitions={layoutTransitions}
          options={options}
          presentation={presentation}
          selectedValue={displayedValue}
          selectionLayoutId={`${pickerId}-selection`}
          stage={stage}
          onChoose={chooseOption}
          onLayoutAnimationComplete={reportLayoutAnimationComplete}
          onOpen={requestOpen}
        />
      </LayoutGroup>

      <p className="sr-only" role="status" aria-atomic="true">
        {presentation.availableAction === "none"
          ? `${ariaLabel} is updating.`
          : `${ariaLabel} updated: ${selectedOption.summary}.`}
      </p>
    </fieldset>
  )
}

/**
 * The container for every choice surface. It arranges the same option buttons
 * as one single-row control, a stack, or an expanded card deck without
 * replacing their DOM.
 */
function ChoiceDeck<T extends string>({
  layoutTransitions,
  onChoose,
  onLayoutAnimationComplete,
  onOpen,
  options,
  presentation,
  selectedValue,
  selectionLayoutId,
  stage,
}: {
  layoutTransitions: PickerLayoutTransitions
  onChoose: (value: T) => void
  onLayoutAnimationComplete: (stage: PickerStage) => void
  onOpen: () => void
  options: readonly ExpandingChoicePickerOption<T>[]
  presentation: PickerPresentation
  selectedValue: T
  selectionLayoutId: string
  stage: PickerStage
}) {
  const selectedIndex = options.findIndex((option) => {
    return option.value === selectedValue
  })
  const motionModel = {
    layoutTransitions,
    selectionLayoutId,
  }

  function performAvailableAction(action: PickerSurfaceAction, value: T) {
    if (action === "request-open") {
      onOpen()
    } else if (action === "choose-option") {
      onChoose(value)
    }
    // "none" is a no-op, so we don't need to handle it here.
  }

  // Capture the stage rendered with this element. If Motion fires after the
  // machine has advanced, it still reports its original stage, allowing the
  // machine to reject that stale completion instead of advancing the current one.
  function reportCurrentStageLayoutAnimationComplete() {
    onLayoutAnimationComplete(stage)
  }

  return (
    <motion.div
      layout
      transition={{ layout: layoutTransitions.deckArrangement }}
      className={cn(
        "relative grid gap-2 overflow-hidden",
        presentation.deck === "single-row" ? "h-11" : "h-26",
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option, optionIndex) => {
        const isSelected = option.value === selectedValue
        const view = createChoiceSurfaceViewModel({
          isSelected,
          optionCount: options.length,
          optionIndex,
          picker: presentation,
          selectedIndex,
        })

        return (
          <ChoiceSurface
            key={option.value}
            motionModel={motionModel}
            option={option}
            stage={stage}
            view={view}
            onPerformAction={performAvailableAction}
            onLayoutAnimationComplete={
              reportCurrentStageLayoutAnimationComplete
            }
          />
        )
      })}
    </motion.div>
  )
}

interface ChoiceSurfaceViewModel {
  usesSingleRowLayout: boolean
  isExpandedDeck: boolean
  hidden: boolean
  availableAction: PickerSurfaceAction
  selectionIndicatorVisible: boolean
  style: React.CSSProperties
}

interface ChoiceSurfaceMotionModel {
  layoutTransitions: PickerLayoutTransitions
  selectionLayoutId: string
}

/**
 * Derives one option's geometry and available action from the deck recipe and
 * its position relative to the selected option.
 */
function createChoiceSurfaceViewModel({
  isSelected,
  optionCount,
  optionIndex,
  picker,
  selectedIndex,
}: {
  isSelected: boolean
  optionCount: number
  optionIndex: number
  picker: PickerPresentation
  selectedIndex: number
}): ChoiceSurfaceViewModel {
  const isExpandedDeck = picker.deck === "expanded"
  // Stacked cards share the selected column. Keep the selected surface in
  // front and preserve option order for the cards underneath it; otherwise
  // the last DOM child (Exclude) becomes the visual top card.
  // Expanded: each option gets its own column. Row: the selected surface
  // spans the deck. Stacked: every surface shares the selected option's column.
  const gridColumn = isExpandedDeck
    ? optionIndex + 1
    : isSelected && picker.deck === "single-row"
      ? `1 / span ${optionCount}`
      : selectedIndex + 1
  const zIndex = isSelected ? optionCount + 1 : optionCount - optionIndex

  return {
    usesSingleRowLayout: picker.surface === "single-row" && isSelected,
    isExpandedDeck,
    hidden: !isSelected && !picker.areBackCardsVisible,
    availableAction:
      picker.availableAction === "request-open" && !isSelected
        ? "none"
        : picker.availableAction,
    selectionIndicatorVisible: isSelected && picker.selectionVisible,
    style: {
      gridColumn,
      gridRow: 1,
      zIndex,
    },
  }
}

/**
 * One physical Motion button for an option. It morphs between the selected
 * single-row control and a card, which lets Motion animate a continuous
 * surface instead of a disappearing control and newly mounted card.
 */
function ChoiceSurface<T extends string>({
  motionModel,
  onLayoutAnimationComplete,
  onPerformAction,
  option,
  stage,
  view,
}: {
  motionModel: ChoiceSurfaceMotionModel
  onLayoutAnimationComplete: () => void
  onPerformAction: (action: PickerSurfaceAction, value: T) => void
  option: ExpandingChoicePickerOption<T>
  stage: PickerStage
  view: ChoiceSurfaceViewModel
}) {
  const Icon = option.icon
  const canChoose = view.availableAction === "choose-option"
  const canOpen = view.availableAction === "request-open"

  return (
    <motion.button
      layout
      type="button"
      aria-expanded={canOpen ? view.isExpandedDeck : undefined}
      aria-label={
        canChoose ? `${option.label}. ${option.description}` : undefined
      }
      aria-hidden={view.hidden || undefined}
      aria-disabled={!canOpen && !canChoose}
      tabIndex={view.hidden || (!canOpen && !canChoose) ? -1 : undefined}
      style={{
        borderRadius: 8,
        // Keep hidden surfaces mounted so Motion can interpolate their layout.
        visibility: view.hidden ? "hidden" : undefined,
        ...view.style,
      }}
      transition={{ layout: motionModel.layoutTransitions.choiceSurfaceMorph }}
      className={cn(
        "relative min-w-0 overflow-hidden bg-border/75 text-left text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        view.usesSingleRowLayout ? "h-11" : "h-26 self-start",
      )}
      onClick={() => {
        onPerformAction(view.availableAction, option.value)
      }}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
    >
      <span className="absolute inset-px bg-card" style={{ borderRadius: 7 }} />
      <ChoiceSelectionIndicator
        selectionLayoutId={motionModel.selectionLayoutId}
        transition={motionModel.layoutTransitions.selectionIndicatorMove}
        visible={view.selectionIndicatorVisible}
        onLayoutAnimationComplete={onLayoutAnimationComplete}
      />
      <ChoiceContent
        icon={
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        }
        stage={stage}
        usesSingleRowLayout={view.usesSingleRowLayout}
        option={option}
      />
    </motion.button>
  )
}

/** Moves one shared selected-state background between option surfaces. */
function ChoiceSelectionIndicator({
  onLayoutAnimationComplete,
  selectionLayoutId,
  transition,
  visible,
}: {
  onLayoutAnimationComplete: () => void
  selectionLayoutId: string
  transition: PickerLayoutTransitions["selectionIndicatorMove"]
  visible: boolean
}) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.span
          layoutId={selectionLayoutId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          onLayoutAnimationComplete={onLayoutAnimationComplete}
          className="pointer-events-none absolute inset-px bg-accent/50 ring-1 ring-inset ring-primary/60"
          style={{ borderRadius: 7 }}
        />
      ) : null}
    </AnimatePresence>
  )
}

/**
 * The copy changes only after opening content has hidden and before closing
 * content is revealed, so visible text remains stable during layout morphs.
 */
const PICKER_SHORT_DESCRIPTION_STAGES: ReadonlySet<PickerStage> = new Set([
  "opening-row-to-card",
  "opening-content-show",
  "opening-deck-expand",
  "expanded",
  "moving-selection",
  "closing-deck-stack",
  "closing-content-hide",
])

/**
 * The icon and copy inside a choice surface. Choreography targets
 * `data-choice-content` to hide it before surfaces move and reveal it after.
 */
function ChoiceContent<T extends string>({
  icon,
  option,
  stage,
  usesSingleRowLayout,
}: {
  icon: React.ReactNode
  option: ExpandingChoicePickerOption<T>
  stage: PickerStage
  usesSingleRowLayout: boolean
}) {
  const descriptionForCurrentLayout = PICKER_SHORT_DESCRIPTION_STAGES.has(stage)
    ? (option.compactDescription ?? option.description)
    : option.description

  return (
    <span
      data-choice-content
      style={{ transformOrigin: "center" }}
      className={cn(
        "relative grid h-full w-full p-3",
        usesSingleRowLayout
          ? "grid-cols-[1rem_minmax(0,1fr)_1rem] grid-rows-1 items-center gap-x-3"
          : "grid-cols-[1rem_minmax(0,1fr)] grid-rows-[1rem_minmax(0,1fr)] gap-x-2",
      )}
    >
      <span className="col-start-1 row-start-1 self-start">{icon}</span>
      <span
        className={cn(
          "min-w-0",
          usesSingleRowLayout
            ? "col-start-2 row-start-1 flex items-baseline gap-2"
            : "col-span-2 col-start-1 row-start-2 self-end space-y-1",
        )}
      >
        <span className="block text-sm font-medium text-foreground">
          {option.label}
        </span>
        <span className="block truncate text-sm leading-5 text-muted-foreground">
          {descriptionForCurrentLayout}
        </span>
      </span>
      {usesSingleRowLayout ? (
        <span className="col-start-3 row-start-1 justify-self-end">
          <ChevronDown className="size-4" aria-hidden="true" />
        </span>
      ) : null}
    </span>
  )
}
