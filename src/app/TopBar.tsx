import { Menu } from "@base-ui/react/menu"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { KadraMark } from "@/app/components/KadraMark"
import { useMoneyPrivacy } from "@/app/context/money-privacy-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopBarProps {
  hasAppUpdate: boolean
  isCheckingForUpdate: boolean
  onBack?: () => void
  onCheckForUpdates: () => void
  onResetLocalData: () => void
}

export function TopBar({
  hasAppUpdate,
  isCheckingForUpdate,
  onBack,
  onCheckForUpdates,
  onResetLocalData,
}: TopBarProps) {
  const { isMoneyHidden, toggleMoneyVisibility } = useMoneyPrivacy()
  const MoneyVisibilityIcon = isMoneyHidden ? EyeOff : Eye

  return (
    <header className="fixed inset-x-0 top-0 z-20 mx-auto min-h-[var(--app-top-bar-height)] w-full max-w-md bg-background/75 px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-[32px]">
      <div className="flex items-center justify-between gap-3">
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

        <div className="flex items-center gap-2">
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
