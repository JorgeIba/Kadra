import { Shield, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  onResetLocalData: () => void
}

export function TopBar({ onResetLocalData }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-primary" aria-hidden="true" />
          <p className="font-ledger text-2xl leading-none text-foreground">
            Trafin
          </p>
        </div>

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
    </header>
  )
}
