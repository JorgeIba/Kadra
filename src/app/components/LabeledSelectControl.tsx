import type { ReactNode } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface LabeledSelectControlProps<TOption extends string> {
  ariaLabel: string
  className?: string
  fallbackLabel: string
  label: string
  options: ReadonlyArray<TOption>
  value: TOption
  getOptionLabel: (option: TOption) => string
  icon?: ReactNode
  triggerClassName?: string
  onValueChange: (value: TOption) => void
}

export function LabeledSelectControl<TOption extends string>({
  ariaLabel,
  className,
  fallbackLabel,
  getOptionLabel,
  icon,
  label,
  onValueChange,
  options,
  triggerClassName,
  value,
}: LabeledSelectControlProps<TOption>) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <span className="flex items-center gap-1.5 text-[0.68rem] leading-[1.35] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {icon === undefined ? null : (
          <span className="grid size-3.5 shrink-0 place-items-center text-muted-foreground">
            {icon}
          </span>
        )}
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null && isOption(nextValue, options)) {
            onValueChange(nextValue)
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "w-full min-w-0 border-border/80 bg-background/35 px-2.5 text-foreground hover:border-primary/25 hover:bg-muted/45 data-[popup-open]:border-primary/35 data-[popup-open]:bg-muted/55",
            triggerClassName,
          )}
          size="lg"
          aria-label={ariaLabel}
        >
          <SelectValue className="text-sm leading-tight font-normal tracking-normal">
            {(nextValue: TOption | null) =>
              nextValue === null ? fallbackLabel : getOptionLabel(nextValue)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent sideOffset={6}>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="min-h-11">
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function isOption<TOption extends string>(
  value: string,
  options: ReadonlyArray<TOption>,
): value is TOption {
  return options.some((option) => {
    return option === value
  })
}
