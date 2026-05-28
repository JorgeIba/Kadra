import { useState } from "react"
import { Outlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

interface AppShellProps {
  onResetLocalData: () => void
}

export function AppShell({ onResetLocalData }: AppShellProps) {
  const activeSection = useActiveAppSection()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  return (
    <div className="app-background">
      <div className="app-frame">
        <TopBar onResetLocalData={() => setIsResetDialogOpen(true)} />
        <main className="flex-1 px-5 pb-28 pt-5">
          <Outlet />
        </main>
        <BottomNav activeSection={activeSection} />
      </div>
      <ConfirmDialog
        open={isResetDialogOpen}
        title="Reset local data?"
        description="This replaces your current local investments with the sample investments."
        confirmLabel="Reset data"
        variant="destructive"
        onRequestOpenChange={setIsResetDialogOpen}
        onConfirm={onResetLocalData}
      />
    </div>
  )
}
