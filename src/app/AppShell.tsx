import { useLayoutEffect, useState } from "react"
import { useLocation, useNavigationType, useOutlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { MoneyPrivacyProvider } from "@/app/context/MoneyPrivacyProvider"
import { usePwaUpdate } from "@/app/pwa/usePwaUpdate"
import { NavigationAnimationContext } from "@/app/routing/navigation-animation"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

interface AppShellProps {
  onResetLocalData: () => void
}

function AnimatedOutlet() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const outlet = useOutlet()
  const shouldAnimateOnMount = navigationType !== "POP"

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <NavigationAnimationContext.Provider value={shouldAnimateOnMount}>
      <div className="w-full">{outlet}</div>
    </NavigationAnimationContext.Provider>
  )
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
    <MoneyPrivacyProvider>
      <div className="app-background">
        <div className="app-frame">
          <TopBar
            hasAppUpdate={isUpdateAvailable}
            isCheckingForUpdate={isCheckingForUpdate}
            onCheckForUpdates={handleCheckForUpdates}
            onResetLocalData={() => setIsResetDialogOpen(true)}
          />
          <main className="flex-1 px-5 pb-28 pt-6">
            <AnimatedOutlet />
          </main>
          <BottomNav activeSection={activeSection} />
        </div>
        <ConfirmDialog
          open={isResetDialogOpen}
          title="Clear local data?"
          description="This removes every investment from your local Trafin portfolio."
          confirmLabel="Clear local data"
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
    </MoneyPrivacyProvider>
  )
}
