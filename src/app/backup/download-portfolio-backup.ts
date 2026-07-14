import {
  getPortfolioBackupFileName,
  serializePortfolioBackup,
} from "@/app/backup/portfolio-backup"
import type { Investment } from "@/domain/investments"

export function downloadPortfolioBackup(
  investments: Investment[],
  exportedAt = new Date(),
) {
  // Serialization only creates text in memory. A Blob makes that text a file
  // the browser can hand to the user for safe keeping outside Kadra storage.
  const file = new Blob([serializePortfolioBackup(investments, exportedAt)], {
    type: "application/json",
  })
  const objectUrl = URL.createObjectURL(file)
  const link = document.createElement("a")

  // Browsers start a download from a link click; the object URL points that
  // temporary link at our in-memory file without uploading it anywhere.
  link.href = objectUrl
  link.download = getPortfolioBackupFileName(exportedAt)
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()

  // The browser has received the file, so release the temporary URL's memory.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}
