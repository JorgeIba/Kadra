import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Shared layout and field primitives for Record Change form sections. */
export function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="space-y-4 border-t border-border/70 py-5 first:border-t-0">
      <div className="space-y-1.5">
        <h2 className="text-base font-bold leading-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function InlineNotice({
  children,
  tone,
}: {
  children: ReactNode
  tone: "success" | "destructive"
}) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-xs leading-5",
        tone === "success" &&
          "border-success-border bg-success-surface text-success",
        tone === "destructive" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </p>
  )
}

export function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
}) {
  const errorId = `${htmlFor}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error === undefined ? null : (
        <p id={errorId} className="text-sm leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
