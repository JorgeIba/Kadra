import { Dialog } from "@base-ui/react/dialog"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  showCancel?: boolean
  variant?: "default" | "destructive"
  onRequestOpenChange: (open: boolean) => void
  onConfirm: () => boolean | void
}

function getDialogMotionProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      surface: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      },
      backdrop: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      },
    }
  }

  return {
    surface: {
      initial: { opacity: 0, y: 10, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 6, scale: 0.985 },
      transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
    },
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
    },
  }
}

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  onConfirm,
  onRequestOpenChange,
  open,
  showCancel = true,
  title,
  variant = "default",
}: ConfirmDialogProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const { backdrop, surface } = getDialogMotionProps(prefersReducedMotion)

  function handleConfirm() {
    if (onConfirm() !== false) {
      onRequestOpenChange(false)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onRequestOpenChange}
      disablePointerDismissal // avoid dismissing the dialog by clicking outside.
    >
      <AnimatePresence>
        {open ? (
          <Dialog.Portal keepMounted>
            <Dialog.Backdrop
              render={<motion.div {...backdrop} />}
              className="fixed inset-0 z-40 bg-[rgb(11_17_19_/_0.52)]"
            />
            <Dialog.Popup
              render={<motion.div {...surface} />}
              className="fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl"
            >
              <div className="space-y-5 p-5">
                <div className="space-y-2">
                  <Dialog.Title
                    className={cn(
                      "text-lg font-semibold",
                      variant === "destructive" && "text-destructive",
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </Dialog.Description>
                </div>

                <div className="flex justify-end gap-2">
                  {showCancel ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onRequestOpenChange(false)}
                    >
                      {cancelLabel}
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant={
                      variant === "destructive" ? "destructive" : "default"
                    }
                    onClick={handleConfirm}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}
