import { useState } from "react"
import { AppShell } from "@/app/AppShell"
import { APP_SECTIONS, type AppSection } from "@/app/navigation"
import { sampleInvestments } from "@/domain/investments"

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(
    APP_SECTIONS.dashboard,
  )

  return (
    <AppShell
      activeSection={activeSection}
      investmentCount={sampleInvestments.length}
      onSectionChange={setActiveSection}
    />
  )
}

export default App
