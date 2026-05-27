import { Button } from "@/components/ui/button"

interface TopBarProps {
  onResetLocalData: () => void
}

export function TopBar({ onResetLocalData }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            T
          </div>
          <div>
            <p className="text-base font-semibold leading-none">Trafin</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Local investment tracker
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetLocalData}
        >
          Reset
        </Button>
      </div>
    </header>
  )
}
