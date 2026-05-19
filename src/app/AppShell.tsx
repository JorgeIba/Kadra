import { Outlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

export function AppShell() {
  const activeSection = useActiveAppSection()

  return (
    <div className="app-background">
      <div className="app-frame">
        <TopBar />
        <main className="flex-1 px-5 pb-28 pt-5">
          <Outlet />
        </main>
        <BottomNav activeSection={activeSection} />
      </div>
    </div>
  )
}
