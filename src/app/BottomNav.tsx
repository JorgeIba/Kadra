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
              state={
                item.value === APP_SECTIONS.invest
                  ? { fromSection: activeSection }
                  : undefined
              }
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.7rem] font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
