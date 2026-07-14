import { useLayoutEffect, useState } from "react"
import { Outlet, useLocation, useNavigationType } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { parsePortfolioBackupText } from "@/app/backup/portfolio-backup"
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
import type { Investment } from "@/domain/investments"

const MAX_PORTFOLIO_BACKUP_FILE_BYTES = 5 * 1024 * 1024

interface AppShellProps {
  onExportBackup: () => void
  onResetLocalData: () => void
  onRestoreInvestments: (investments: Investment[]) => boolean
}

interface RestoreCandidate {
  fileName: string
  investments: Investment[]
}

type AppDialog =
  | { kind: "none" }
  | { kind: "reset" }
  | { kind: "restore-confirmation"; backup: RestoreCandidate }
  | { kind: "restore-error"; description: string }
  | { kind: "update" }

const RESTORE_ERROR_DESCRIPTIONS = {
  cannotRead:
    "Kadra could not read this file. Your current investments were not changed.",
  invalid:
    "This file is not a valid Kadra portfolio backup. Your current investments were not changed.",
  tooLarge:
    "This backup is larger than 5 MB. Choose a smaller Kadra backup file. Your current investments were not changed.",
  cannotSave:
    "Kadra could not save this backup. Your current investments were not changed.",
} as const

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

export function AppShell({
  onExportBackup,
  onResetLocalData,
  onRestoreInvestments,
}: AppShellProps) {
  const location = useLocation()
  const navigateBackOrFallback = useBackOrFallbackNavigation()
  const activeSection = useActiveAppSection()
  const fallbackPath = getFallbackPathFromLocation(location)
  const shouldHideBackButton = shouldHideBackButtonFromLocation(location)
  const [activeDialog, setActiveDialog] = useState<AppDialog>({ kind: "none" })
  const {
    applyUpdate,
    checkForUpdates,
    isCheckingForUpdate,
    isUpdateAvailable,
  } = usePwaUpdate({
    onUpdateAvailable() {
      setActiveDialog((currentDialog) => {
        return currentDialog.kind === "none"
          ? { kind: "update" }
          : currentDialog
      })
    },
  })

  async function handleCheckForUpdates() {
    if (isUpdateAvailable) {
      setActiveDialog({ kind: "update" })
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

  async function handleImportBackup(file: File) {
    if (file.size > MAX_PORTFOLIO_BACKUP_FILE_BYTES) {
      setActiveDialog({
        kind: "restore-error",
        description: RESTORE_ERROR_DESCRIPTIONS.tooLarge,
      })
      return
    }

    try {
      const backup = parsePortfolioBackupText(await file.text())

      if (backup === null) {
        setActiveDialog({
          kind: "restore-error",
          description: RESTORE_ERROR_DESCRIPTIONS.invalid,
        })
        return
      }

      setActiveDialog({
        kind: "restore-confirmation",
        backup: { fileName: file.name, investments: backup.investments },
      })
    } catch {
      setActiveDialog({
        kind: "restore-error",
        description: RESTORE_ERROR_DESCRIPTIONS.cannotRead,
      })
    }
  }

  function handleConfirmRestore() {
    if (activeDialog.kind !== "restore-confirmation") {
      return false
    }

    if (!onRestoreInvestments(activeDialog.backup.investments)) {
      setActiveDialog({
        kind: "restore-error",
        description: RESTORE_ERROR_DESCRIPTIONS.cannotSave,
      })
      return false
    }
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
            onExportBackup={onExportBackup}
            onImportBackup={handleImportBackup}
            onResetLocalData={() => setActiveDialog({ kind: "reset" })}
          />
          <main className="app-main flex-1 px-5 pb-28">
            <RouteAnimationBoundary />
          </main>
          <BottomNav activeSection={activeSection} />
        </div>
        <ConfirmDialog
          open={activeDialog.kind === "reset"}
          title="Clear local data?"
          description="This removes every investment from your local Kadra portfolio."
          confirmLabel="Clear local data"
          variant="destructive"
          onRequestOpenChange={(open) =>
            setActiveDialog(open ? { kind: "reset" } : { kind: "none" })
          }
          onConfirm={onResetLocalData}
        />
        <ConfirmDialog
          open={activeDialog.kind === "restore-confirmation"}
          title="Restore portfolio?"
          description={
            activeDialog.kind === "restore-confirmation"
              ? `This will replace your current portfolio with ${activeDialog.backup.investments.length} ${activeDialog.backup.investments.length === 1 ? "investment" : "investments"} from ${activeDialog.backup.fileName}. This cannot be undone.`
              : ""
          }
          confirmLabel="Restore portfolio"
          variant="destructive"
          onRequestOpenChange={(open) => {
            if (!open) {
              setActiveDialog({ kind: "none" })
            }
          }}
          onConfirm={handleConfirmRestore}
        />
        <ConfirmDialog
          open={activeDialog.kind === "restore-error"}
          title="Unable to restore backup"
          description={
            activeDialog.kind === "restore-error"
              ? activeDialog.description
              : ""
          }
          confirmLabel="Close"
          showCancel={false}
          onRequestOpenChange={(open) => {
            if (!open) {
              setActiveDialog({ kind: "none" })
            }
          }}
          onConfirm={() => undefined}
        />
        <ConfirmDialog
          open={activeDialog.kind === "update"}
          title="Update app?"
          description="A new version of Kadra is ready. Updating will reload the app so the latest changes can take over."
          confirmLabel="Update now"
          onRequestOpenChange={(open) =>
            setActiveDialog(open ? { kind: "update" } : { kind: "none" })
          }
          onConfirm={applyUpdate}
        />
      </div>
    </MoneyPrivacyProvider>
  )
}
