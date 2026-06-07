import { useState } from "react"
import { Outlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { usePwaUpdate } from "@/app/pwa/usePwaUpdate"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

interface AppShellProps {
  onResetLocalData: () => void
}

export function AppShell({ onResetLocalData }: AppShellProps) {
  const activeSection = useActiveAppSection()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const {
    applyUpdate,
    checkForUpdates,
    isCheckingForUpdate,
    isUpdateAvailable,
  } = usePwaUpdate({
    onUpdateAvailable() {
      setIsUpdateDialogOpen(true)
    },
  })

  async function handleCheckForUpdates() {
    if (isUpdateAvailable) {
      setIsUpdateDialogOpen(true)
      return
    }

    await checkForUpdates()
  }

  return (
    <div className="app-background">
      <div className="app-frame">
        <TopBar
          hasAppUpdate={isUpdateAvailable}
          isCheckingForUpdate={isCheckingForUpdate}
          onCheckForUpdates={handleCheckForUpdates}
          onResetLocalData={() => setIsResetDialogOpen(true)}
        />
        <main className="flex-1 px-5 pb-28 pt-6">
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
      <ConfirmDialog
        open={isUpdateDialogOpen}
        title="Update app?"
        description="A new version of Trafin is ready. Updating will reload the app so the latest changes can take over."
        confirmLabel="Update now"
        onRequestOpenChange={setIsUpdateDialogOpen}
        onConfirm={applyUpdate}
      />
    </div>
  )
}
