import { APP_NAV_ITEMS, type AppSection } from "@/app/navigation"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-border/80 bg-background/95 px-3 pb-3 pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {APP_NAV_ITEMS.map((item) => {
          const isActive = item.value === activeSection
          const Icon = item.icon

          return (
            <button
              key={item.value}
              type="button"
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground transition-colors",
                isActive && "bg-primary text-primary-foreground shadow-sm",
              )}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSectionChange(item.value)}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
