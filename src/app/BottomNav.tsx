import { Link } from "react-router"
import { APP_NAV_ITEMS, type AppSection } from "@/app/routing/navigation"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeSection: AppSection
}

export function BottomNav({ activeSection }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border/80 bg-background/95 px-3 pb-3 pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {APP_NAV_ITEMS.map((item) => {
          const isActive = item.value === activeSection
          const Icon = item.icon

          return (
            <Link
              key={item.value}
              to={item.path}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground transition-colors",
                isActive && "bg-primary text-primary-foreground shadow-sm",
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
