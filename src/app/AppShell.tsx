import { Outlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

interface AppShellProps {
  onResetLocalData: () => void
}

export function AppShell({ onResetLocalData }: AppShellProps) {
  const activeSection = useActiveAppSection()

  function handleResetLocalData() {
    const shouldReset = window.confirm(
      "Reset local investment data and return to the sample investments?",
    )

    if (!shouldReset) {
      return
    }

    onResetLocalData()
  }

  return (
    <div className="app-background">
      <div className="app-frame">
        <TopBar onResetLocalData={handleResetLocalData} />
        <main className="flex-1 px-5 pb-28 pt-5">
          <Outlet />
        </main>
        <BottomNav activeSection={activeSection} />
      </div>
    </div>
  )
}
