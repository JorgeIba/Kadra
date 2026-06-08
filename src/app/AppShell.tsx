import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useLocation, useOutlet } from "react-router"
import { BottomNav } from "@/app/BottomNav"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { usePwaUpdate } from "@/app/pwa/usePwaUpdate"
import { TopBar } from "@/app/TopBar"
import { useActiveAppSection } from "@/app/routing/useActiveAppSection"

interface AppShellProps {
  onResetLocalData: () => void
}

function getScreenMotionProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    }
  }

  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  }
}

function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  const prefersReducedMotion = useReducedMotion() ?? false
  const screenMotionProps = getScreenMotionProps(prefersReducedMotion)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="w-full"
        {...screenMotionProps}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
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
  )
}
