import { InvestmentPreview } from "@/app/components/investments/InvestmentPreview"
import { Card, CardContent } from "@/components/ui/card"
import type { Investment } from "@/domain/investments"

interface InvestmentFormPreviewProps {
  investment: Investment | null
}

export function InvestmentFormPreview({
  investment,
}: InvestmentFormPreviewProps) {
  if (investment === null) {
    return (
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardContent className="space-y-2">
          <p className="text-sm font-bold">Projection preview</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Complete the required fields to unlock projection values.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <InvestmentPreview investment={investment} />
}
