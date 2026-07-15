import { Link } from "react-router"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import {
  APP_NAV_ITEMS,
  APP_SECTIONS,
  type AppSection,
} from "@/app/routing/navigation"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeSection: AppSection
}

export function BottomNav({ activeSection }: BottomNavProps) {
  const prefersReducedMotion = useReducedMotion() ?? false

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border/60 bg-background/75 px-3 pb-4 pt-2 backdrop-blur-[32px]">
      <LayoutGroup id="bottom-navigation">
        <div className="grid grid-cols-3 gap-2">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = item.value === activeSection
            const Icon = item.icon

            return (
              <Link
                key={item.value}
                to={item.path}
                state={
                  item.value === APP_SECTIONS.invest
                    ? { activeNavSection: activeSection }
                    : undefined
                }
                className={cn(
                  "group/nav-item relative flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-[0.7rem] font-medium text-muted-foreground transition-[transform,color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px active:text-foreground motion-reduce:transform-none motion-reduce:transition-none",
                  isActive && "text-primary",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive ? (
                  <motion.span
                    layoutId="bottom-navigation-active-indicator"
                    className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ) : null}
                <Icon
                  className={cn(
                    "relative size-5 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nav-item:scale-105 motion-reduce:transform-none",
                    isActive && "scale-105",
                  )}
                  aria-hidden="true"
                />
                <span className="relative">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </LayoutGroup>
    </nav>
  )
}
