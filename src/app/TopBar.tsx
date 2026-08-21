import { useCallback, useRef, useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { KadraMark } from "@/app/components/KadraMark"
import { GlobalInvestmentSearch } from "@/app/components/GlobalInvestmentSearch"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { Button, buttonVariants } from "@/components/ui/button"
import type { Investment } from "@/domain/investments"
import { cn } from "@/lib/utils"

const TOP_BAR_LEADING_CONTENT_TRANSITION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const
const TOP_BAR_LEADING_CONTENT_HIDE_DELAY = 0.12
const TOP_BAR_LEADING_CONTENT_HIDE_OFFSET = 12

interface TopBarProps {
  hasAppUpdate: boolean
  isCheckingForUpdate: boolean
  onBack?: () => void
  onCheckForUpdates: () => void
  onExportBackup: () => void
  onGlobalSearchResultSelect: (investmentId: string) => void
  onImportBackup: (file: File) => void
  onResetLocalData: () => void
  searchableInvestments: readonly Investment[]
}

export function TopBar({
  hasAppUpdate,
  isCheckingForUpdate,
  onBack,
  onCheckForUpdates,
  onExportBackup,
  onGlobalSearchResultSelect,
  onImportBackup,
  onResetLocalData,
  searchableInvestments,
}: TopBarProps) {
  const backupInputRef = useRef<HTMLInputElement>(null)
  const [isGlobalInvestmentSearchOpen, setIsGlobalInvestmentSearchOpen] =
    useState(false)
  const [isGlobalSearchSurfaceActive, setIsGlobalSearchSurfaceActive] =
    useState(false)
  const { isMoneyHidden, toggleMoneyVisibility } = useMoneyPrivacy()
  const MoneyVisibilityIcon = isMoneyHidden ? EyeOff : Eye
  const prefersReducedMotion = useReducedMotion() ?? false
  const shouldHideLeadingContent = isGlobalSearchSurfaceActive
  const handleGlobalSearchOpenChange = useCallback((nextIsOpen: boolean) => {
    setIsGlobalInvestmentSearchOpen(nextIsOpen)

    if (nextIsOpen) {
      setIsGlobalSearchSurfaceActive(true)
    }
  }, [])
  const handleGlobalSearchClosed = useCallback(() => {
    setIsGlobalSearchSurfaceActive(false)
  }, [])
  const leadingContentTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        ...TOP_BAR_LEADING_CONTENT_TRANSITION,
        delay: shouldHideLeadingContent
          ? TOP_BAR_LEADING_CONTENT_HIDE_DELAY
          : 0,
      }

  return (
    <header className="fixed inset-x-0 top-0 z-20 mx-auto min-h-[var(--app-top-bar-height)] w-full max-w-md bg-background/75 px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-[32px]">
      <input
        ref={backupInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const [file] = Array.from(event.target.files ?? [])

          event.target.value = ""

          if (file !== undefined) {
            onImportBackup(file)
          }
        }}
      />
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="relative min-w-0">
          <motion.div
            initial={false}
            aria-hidden={shouldHideLeadingContent ? true : undefined}
            animate={{
              opacity: shouldHideLeadingContent ? 0 : 1,
              x: shouldHideLeadingContent
                ? -TOP_BAR_LEADING_CONTENT_HIDE_OFFSET
                : 0,
            }}
            transition={leadingContentTransition}
            className={cn(
              "relative z-20 flex h-10 w-max items-center",
              shouldHideLeadingContent && "pointer-events-none",
            )}
          >
            {onBack === undefined ? (
              <div className="flex items-center gap-0">
                <KadraMark className="size-8 shrink-0 text-primary" />
                <p className="font-brand text-[1.625rem] leading-[0.9] tracking-[-0.04em] text-foreground">
                  kadra
                </p>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 rounded-full border border-border/80 bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Button>
            )}
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-10">
            <GlobalInvestmentSearch
              isOpen={isGlobalInvestmentSearchOpen}
              onOpenChange={handleGlobalSearchOpenChange}
              onSearchClosed={handleGlobalSearchClosed}
              searchableInvestments={searchableInvestments}
              onSearchResultSelect={onGlobalSearchResultSelect}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasAppUpdate || isCheckingForUpdate ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isCheckingForUpdate
                  ? "Checking for updates"
                  : "App update available"
              }
              className="relative rounded-full border border-primary/70 bg-primary/10 text-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_14%,transparent)] hover:bg-primary/15 hover:text-primary"
              onClick={onCheckForUpdates}
              disabled={isCheckingForUpdate}
            >
              <RefreshCw
                className={cn("size-5", isCheckingForUpdate && "animate-spin")}
                aria-hidden="true"
              />
              {hasAppUpdate && !isCheckingForUpdate ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
              ) : null}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              isMoneyHidden ? "Show money amounts" : "Hide money amounts"
            }
            aria-pressed={isMoneyHidden}
            className={cn(
              "rounded-full border border-border/80 bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
              isMoneyHidden &&
                "border-primary/55 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            )}
            onClick={toggleMoneyVisibility}
          >
            <MoneyVisibilityIcon className="size-5" aria-hidden="true" />
          </Button>

          <Menu.Root modal={false}>
            <Menu.Trigger
              aria-label="Open app menu"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className:
                  "rounded-full border border-border/80 bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
              })}
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </Menu.Trigger>

            <Menu.Portal>
              <Menu.Positioner
                sideOffset={8}
                align="end"
                className="z-50 outline-none"
              >
                <Menu.Popup className="w-56 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-none outline-none">
                  {hasAppUpdate ? null : (
                    <Menu.Item
                      nativeButton
                      disabled={isCheckingForUpdate}
                      onClick={onCheckForUpdates}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                      render={<button type="button" />}
                    >
                      <RefreshCw
                        className={cn(
                          "size-4 text-muted-foreground",
                          isCheckingForUpdate && "animate-spin",
                        )}
                        aria-hidden="true"
                      />
                      Check for updates
                    </Menu.Item>
                  )}

                  <Menu.Item
                    nativeButton
                    onClick={onExportBackup}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50"
                    render={<button type="button" />}
                  >
                    <Download
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Export backup
                  </Menu.Item>

                  <Menu.Item
                    nativeButton
                    onClick={() => backupInputRef.current?.click()}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50"
                    render={<button type="button" />}
                  >
                    <Upload
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Restore backup
                  </Menu.Item>

                  <Menu.Item
                    nativeButton
                    onClick={onResetLocalData}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-destructive outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-destructive/10 focus:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/20"
                    render={<button type="button" />}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Clear local data
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
  )
}
