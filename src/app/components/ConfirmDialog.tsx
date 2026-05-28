import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onRequestOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  onConfirm,
  onRequestOpenChange,
  open,
  title,
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog === null) {
      return
    }

    // Should be opened
    if (open && !dialog.open) {
      dialog.showModal()
      return
    }

    // Should be closed
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleConfirm() {
    onConfirm()
    onRequestOpenChange(false)
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/30"
      onCancel={() => onRequestOpenChange(false)}
      onClose={() => onRequestOpenChange(false)}
    >
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h2
            className={cn(
              "text-lg font-semibold",
              variant === "destructive" && "text-destructive",
            )}
          >
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onRequestOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
