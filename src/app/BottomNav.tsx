import { Link } from "react-router"
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
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border/60 bg-background/95 px-3 pb-4 pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {APP_NAV_ITEMS.map((item) => {
          const isActive = item.value === activeSection
          const Icon = item.icon

          return (
            <Link
              key={item.value}
              to={item.path}
              viewTransition
              state={
                item.value === APP_SECTIONS.invest
                  ? { fromSection: activeSection }
                  : undefined
              }
              className={cn(
                "group/nav-item flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-[0.7rem] font-medium text-muted-foreground transition-[transform,color,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-primary/10 hover:bg-secondary/55 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px active:border-primary/10 active:bg-secondary/70 active:text-foreground motion-reduce:transform-none motion-reduce:transition-none",
                isActive &&
                  "border-primary/20 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nav-item:scale-105 motion-reduce:transform-none",
                  isActive && "scale-105",
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
