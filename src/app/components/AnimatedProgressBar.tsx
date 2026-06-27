import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const PROGRESS_TONE_CLASSES = {
  info: "bg-info/80",
  neutral: "bg-status-neutral/80",
  primary: "bg-primary/70",
  success: "bg-success/80",
  warning: "bg-warning/80",
} as const

export type ProgressTone = keyof typeof PROGRESS_TONE_CLASSES

interface AnimatedProgressBarProps {
  tone?: ProgressTone
  value: number
}

export function AnimatedProgressBar({
  tone = "primary",
  value,
}: AnimatedProgressBarProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const boundedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn(
          "h-full origin-left rounded-full",
          PROGRESS_TONE_CLASSES[tone],
        )}
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: boundedValue / 100 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  )
}
