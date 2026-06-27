import { motion, useReducedMotion } from "motion/react"

interface AnimatedProgressBarProps {
  value: number
}

export function AnimatedProgressBar({ value }: AnimatedProgressBarProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const boundedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full origin-left rounded-full bg-primary/70"
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
