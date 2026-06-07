import { RefreshCw, Shield, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopBarProps {
  hasAppUpdate: boolean
  isCheckingForUpdate: boolean
  onCheckForUpdates: () => void
  onResetLocalData: () => void
}

export function TopBar({
  hasAppUpdate,
  isCheckingForUpdate,
  onCheckForUpdates,
  onResetLocalData,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-primary" aria-hidden="true" />
          <p className="font-ledger text-2xl leading-none text-foreground">
            Trafin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              hasAppUpdate ? "App update available" : "Check for app updates"
            }
            className={cn(
              "relative rounded-full border border-border/80 bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
              hasAppUpdate &&
                "border-primary/70 bg-primary/10 text-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_14%,transparent)]",
            )}
            onClick={onCheckForUpdates}
            disabled={isCheckingForUpdate}
          >
            <RefreshCw
              className={cn("size-5", isCheckingForUpdate && "animate-spin")}
              aria-hidden="true"
            />
            {hasAppUpdate ? (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
            ) : null}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reset local data"
            className="rounded-full border border-border/80 bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={onResetLocalData}
          >
            <UserCircle className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
