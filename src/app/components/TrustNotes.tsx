import { Popover } from "@base-ui/react/popover"
import { Info } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface TrustNotesProps {
  className?: string
  notes: string[]
}

export function TrustNotes({ className, notes }: TrustNotesProps) {
  const { t } = useTranslation()

  return (
    <dl
      className={cn(
        "grid gap-2 text-xs leading-5 text-muted-foreground",
        className,
      )}
    >
      {notes.map((note) => (
        <div key={note} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <dt className="mt-2 size-1.5 rounded-full bg-primary/70">
            <span className="sr-only">
              {t("common.accessibility.assumption")}
            </span>
          </dt>
          <dd>{note}</dd>
        </div>
      ))}
    </dl>
  )
}

interface TrustNotesPopoverProps {
  label: string
  notes: string[]
}

export function TrustNotesPopover({ label, notes }: TrustNotesPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={label}
        className="inline-grid size-6 place-items-center rounded-full text-muted-foreground outline-none transition-[color,opacity] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:text-primary active:opacity-70 motion-reduce:transition-none"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup
            initialFocus={false}
            className="z-50 max-w-72 rounded-lg border border-border bg-popover px-3 py-3 text-popover-foreground shadow-none ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <p className="mb-2 text-xs font-medium text-foreground">{label}</p>
            <TrustNotes notes={notes} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
