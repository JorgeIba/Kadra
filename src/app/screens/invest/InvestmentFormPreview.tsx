import { Card, CardContent } from "@/components/ui/card"

export function InvestmentFormPreview() {
  return (
    <Card className="border-dashed bg-secondary/40">
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">Projection preview</p>
        <p className="text-sm leading-6 text-muted-foreground">
          Once the form has state, this card will show estimated current value,
          periodic return, and projected maturity value.
        </p>
      </CardContent>
    </Card>
  )
}
