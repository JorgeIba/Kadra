import { useLayoutEffect, useState } from "react"
import { Outlet, useLocation, useNavigationType } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { MoneyPrivacyProvider } from "@/app/context/MoneyPrivacyProvider"
import { usePwaUpdate } from "@/app/pwa/usePwaUpdate"
import {
  getFallbackPathFromLocation,
  shouldHideBackButtonFromLocation,
} from "@/app/routing/active-section"
import { RouteEntryAnimationContext } from "@/app/routing/navigation-animation"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"
import { useBackOrFallbackNavigation } from "@/app/routing/useBackOrFallbackNavigation"

interface AppShellProps {
  onResetLocalData: () => void
}

type ActiveDialog = "reset" | "update" | null

function RouteAnimationBoundary() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const shouldAnimateRouteEntry = navigationType !== "POP"

  useLayoutEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0)
    }
  }, [location.key, navigationType])

  return (
    <RouteEntryAnimationContext.Provider value={shouldAnimateRouteEntry}>
      <div
        key={location.key}
        className={shouldAnimateRouteEntry ? "route-entry-surface" : undefined}
      >
        <Outlet />
      </div>
    </RouteEntryAnimationContext.Provider>
  )
}

export function AppShell({ onResetLocalData }: AppShellProps) {
  const location = useLocation()
  const navigateBackOrFallback = useBackOrFallbackNavigation()
  const activeSection = useActiveAppSection()
  const fallbackPath = getFallbackPathFromLocation(location)
  const shouldHideBackButton = shouldHideBackButtonFromLocation(location)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const {
    applyUpdate,
    checkForUpdates,
    isCheckingForUpdate,
    isUpdateAvailable,
  } = usePwaUpdate({
    onUpdateAvailable() {
      setActiveDialog((currentDialog) => currentDialog ?? "update")
    },
  })

  async function handleCheckForUpdates() {
    if (isUpdateAvailable) {
      setActiveDialog("update")
      return
    }

    await checkForUpdates()
  }

  function handleBack() {
    if (shouldHideBackButton) {
      return
    }

    navigateBackOrFallback(fallbackPath)
  }

  return (
    <MoneyPrivacyProvider>
      <div className="app-background">
        <div className="app-frame">
          <TopBar
            hasAppUpdate={isUpdateAvailable}
            isCheckingForUpdate={isCheckingForUpdate}
            onBack={shouldHideBackButton ? undefined : handleBack}
            onCheckForUpdates={handleCheckForUpdates}
            onResetLocalData={() => setActiveDialog("reset")}
          />
          <main className="app-main flex-1 px-5 pb-28">
            <RouteAnimationBoundary />
          </main>
          <BottomNav activeSection={activeSection} />
        </div>
        <ConfirmDialog
          open={activeDialog === "reset"}
          title="Clear local data?"
          description="This removes every investment from your local Kadra portfolio."
          confirmLabel="Clear local data"
          variant="destructive"
          onRequestOpenChange={(open) => setActiveDialog(open ? "reset" : null)}
          onConfirm={onResetLocalData}
        />
        <ConfirmDialog
          open={activeDialog === "update"}
          title="Update app?"
          description="A new version of Kadra is ready. Updating will reload the app so the latest changes can take over."
          confirmLabel="Update now"
          onRequestOpenChange={(open) =>
            setActiveDialog(open ? "update" : null)
          }
          onConfirm={applyUpdate}
        />
      </div>
    </MoneyPrivacyProvider>
  )
}
