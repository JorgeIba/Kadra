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
      <Card className="border-dashed border-border/80 bg-card/45">
        <CardContent className="space-y-2">
          <p className="text-sm font-bold">Projection preview</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Add the required terms and Kadra will estimate value, return, and
            maturity progress before you save.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <InvestmentPreview investment={investment} />
}
