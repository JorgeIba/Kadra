import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router"
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
import { getInvestmentDetailPath } from "@/app/routing/navigation"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"
import { useBackOrFallbackNavigation } from "@/app/routing/useBackOrFallbackNavigation"
import type { Investment } from "@/domain/investments"

const MAX_PORTFOLIO_BACKUP_FILE_BYTES = 5 * 1024 * 1024

interface AppShellProps {
  onExportBackup: () => void
  onResetLocalData: () => void
  onRestoreInvestments: (investments: Investment[]) => boolean
  searchableInvestments: readonly Investment[]
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
  searchableInvestments,
}: AppShellProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
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

  function handleGlobalSearchResultSelect(investmentId: string) {
    navigate(getInvestmentDetailPath(investmentId), {
      state: { activeNavSection: activeSection },
    })
  }

  async function handleImportBackup(file: File) {
    if (file.size > MAX_PORTFOLIO_BACKUP_FILE_BYTES) {
      setActiveDialog({
        kind: "restore-error",
        description: t("appShell.restoreErrors.tooLarge"),
      })
      return
    }

    try {
      const backup = parsePortfolioBackupText(await file.text())

      if (backup === null) {
        setActiveDialog({
          kind: "restore-error",
          description: t("appShell.restoreErrors.invalid"),
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
        description: t("appShell.restoreErrors.cannotRead"),
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
        description: t("appShell.restoreErrors.cannotSave"),
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
            onGlobalSearchResultSelect={handleGlobalSearchResultSelect}
            onImportBackup={handleImportBackup}
            onResetLocalData={() => setActiveDialog({ kind: "reset" })}
            searchableInvestments={searchableInvestments}
          />
          <main className="app-main flex-1 px-5 pb-28">
            <RouteAnimationBoundary />
          </main>
          <BottomNav activeSection={activeSection} />
        </div>
        <ConfirmDialog
          open={activeDialog.kind === "reset"}
          title={t("appShell.dialogs.clearLocalData.title")}
          description={t("appShell.dialogs.clearLocalData.description")}
          confirmLabel={t("appShell.dialogs.clearLocalData.confirm")}
          variant="destructive"
          onRequestOpenChange={(open) =>
            setActiveDialog(open ? { kind: "reset" } : { kind: "none" })
          }
          onConfirm={onResetLocalData}
        />
        <ConfirmDialog
          open={activeDialog.kind === "restore-confirmation"}
          title={t("appShell.dialogs.restorePortfolio.title")}
          description={
            activeDialog.kind === "restore-confirmation"
              ? t("appShell.dialogs.restorePortfolio.description", {
                  count: activeDialog.backup.investments.length,
                  fileName: activeDialog.backup.fileName,
                })
              : ""
          }
          confirmLabel={t("appShell.dialogs.restorePortfolio.confirm")}
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
          title={t("appShell.dialogs.restoreError.title")}
          description={
            activeDialog.kind === "restore-error"
              ? activeDialog.description
              : ""
          }
          confirmLabel={t("appShell.dialogs.restoreError.close")}
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
          title={t("appShell.dialogs.update.title")}
          description={t("appShell.dialogs.update.description")}
          confirmLabel={t("common.actions.updateNow")}
          onRequestOpenChange={(open) =>
            setActiveDialog(open ? { kind: "update" } : { kind: "none" })
          }
          onConfirm={applyUpdate}
        />
      </div>
    </MoneyPrivacyProvider>
  )
}
