import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { InvestmentPreview } from "@/app/components/investments/InvestmentPreview"
import { Card, CardContent } from "@/components/ui/card"
import type { Investment } from "@/domain/investments"

interface InvestmentFormPreviewProps {
  investment: Investment | null
}

export function InvestmentFormPreview({
  investment,
}: InvestmentFormPreviewProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const transition = {
    duration: prefersReducedMotion ? 0 : 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {investment === null ? (
        <motion.div
          key="preview-guidance"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -3 }}
          transition={transition}
        >
          <Card className="border-dashed border-border/80 bg-card/45">
            <CardContent className="space-y-2">
              <p className="text-sm font-bold">Projection preview</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Add the required terms and Kadra will estimate value, return,
                and maturity progress before you save.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="investment-preview"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -3 }}
          transition={transition}
        >
          <InvestmentPreview investment={investment} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
