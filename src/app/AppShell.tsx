import { BottomNav } from "@/app/BottomNav"
import { ScreenPlaceholder } from "@/app/ScreenPlaceholder"
import { TopBar } from "@/app/TopBar"
import type { Investment } from "@/domain/investments"
import type { AppSection } from "@/app/navigation"

interface AppShellProps {
  activeSection: AppSection
  investments: Investment[]
  onSectionChange: (section: AppSection) => void
}

export function AppShell({
  activeSection,
  investments,
  onSectionChange,
}: AppShellProps) {
  return (
    <div className="app-background">
      <div className="app-frame">
        <TopBar />
        <main className="flex-1 px-5 pb-28 pt-5">
          <ScreenPlaceholder
            activeSection={activeSection}
            investments={investments}
          />
        </main>
        <BottomNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </div>
    </div>
  )
}
