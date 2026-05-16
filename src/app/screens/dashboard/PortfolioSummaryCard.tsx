import { WalletCards } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatMxn } from "@/lib/formatters"

interface PortfolioSummaryCardProps {
  totalValue: number
  dailyCashFlow: number
}

export function PortfolioSummaryCard({
  totalValue,
  dailyCashFlow,
}: PortfolioSummaryCardProps) {
  return (
    <Card className="border-none bg-primary text-primary-foreground shadow-xl shadow-emerald-950/10 ring-0">
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary-foreground/70">Total value</p>
            <p className="mt-2 text-4xl font-semibold tracking-normal">
              {formatMxn(totalValue)}
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-lg bg-primary-foreground/10">
            <WalletCards className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg bg-primary-foreground/10 px-4 py-3">
          <p className="text-xs font-medium uppercase text-primary-foreground/60">
            Estimated daily cash flow
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {formatMxn(dailyCashFlow)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
