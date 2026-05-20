import { Card, CardContent } from "@/components/ui/card"

interface InvestmentFormPreviewProps {
  isValid: boolean
}

export function InvestmentFormPreview({ isValid }: InvestmentFormPreviewProps) {
  return (
    <Card className="border-dashed bg-secondary/40">
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">Projection preview</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {isValid
            ? "Draft is valid. Live projection values will appear here next."
            : "Complete the required fields to unlock projection values."}
        </p>
      </CardContent>
    </Card>
  )
}
