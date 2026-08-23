import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useTranslation } from "react-i18next"
import { InvestmentPreview } from "@/app/components/investments/InvestmentPreview"
import { Card, CardContent } from "@/components/ui/card"
import type { Investment } from "@/domain/investments"

interface InvestmentFormPreviewProps {
  investment: Investment | null
}

const PREVIEW_STATE_TRANSITION = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const

export function InvestmentFormPreview({
  investment,
}: InvestmentFormPreviewProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion() ?? false
  const previewState = investment === null ? "awaiting-terms" : "calculated"

  return (
    <motion.div
      layout
      className="border-t border-border/70 py-5"
      transition={{
        layout: prefersReducedMotion
          ? { duration: 0 }
          : PREVIEW_STATE_TRANSITION,
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={previewState}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : PREVIEW_STATE_TRANSITION
          }
        >
          {investment === null ? (
            <Card className="border-dashed border-border/80 bg-card/45">
              <CardContent className="space-y-2">
                <p className="text-sm font-bold">
                  {t("investment.preview.projectionPreview")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("invest.formPreview.description")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <InvestmentPreview investment={investment} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
