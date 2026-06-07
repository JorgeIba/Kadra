import { useCallback, useEffect, useRef, useState } from "react"
import { registerSW } from "virtual:pwa-register"

type UpdateServiceWorker = ReturnType<typeof registerSW>

const PWA_UPDATE_CHECK_TIMEOUT_MS = 5_000

interface UsePwaUpdateOptions {
  onUpdateAvailable?: () => void
}

export function usePwaUpdate({ onUpdateAvailable }: UsePwaUpdateOptions = {}) {
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const onUpdateAvailableRef = useRef(onUpdateAvailable)
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(
    undefined,
  )
  const updateServiceWorkerRef = useRef<UpdateServiceWorker | null>(null)

  useEffect(() => {
    onUpdateAvailableRef.current = onUpdateAvailable
  }, [onUpdateAvailable])

  useEffect(() => {
    // Register the service worker once and keep update/apply functions for later
    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      // Call this callback when there's an update
      onNeedRefresh() {
        setIsUpdateAvailable(true)
        onUpdateAvailableRef.current?.()
      },
      // Save this registration in our ref so we can check for updates manually later
      onRegisteredSW(_serviceWorkerUrl, registration) {
        registrationRef.current = registration
      },
    })
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    setIsCheckingForUpdate(true)

    try {
      await Promise.race([
        checkServiceWorkerForUpdates(registrationRef.current),
        wait(PWA_UPDATE_CHECK_TIMEOUT_MS),
      ])
    } finally {
      setIsCheckingForUpdate(false)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    void updateServiceWorkerRef.current?.(true)
  }, [])

  return {
    applyUpdate,
    checkForUpdates,
    isCheckingForUpdate,
    isUpdateAvailable,
  }
}

async function checkServiceWorkerForUpdates(
  registeredServiceWorker: ServiceWorkerRegistration | undefined,
): Promise<void> {
  const registration =
    registeredServiceWorker ?? (await navigator.serviceWorker.ready)

  await registration.update()
}

async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}
