import { Plus, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyInvestmentsStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function EmptyInvestmentsState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyInvestmentsStateProps) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-5 py-8 text-center text-card-foreground">
      <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <WalletCards className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Button type="button" className="mt-5" onClick={onAction}>
        <Plus className="size-4" aria-hidden="true" />
        {actionLabel}
      </Button>
    </div>
  )
}
