export function DashboardSectionHeader({
  description,
  eyebrow,
  title,
}: {
  description?: string
  eyebrow?: string
  title: string
}) {
  return (
    <div className="space-y-2">
      {eyebrow === undefined ? null : (
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <div className="space-y-1">
        <h2 className="text-balance text-base font-bold leading-tight text-foreground">
          {title}
        </h2>
        {description === undefined ? null : (
          <p className="text-pretty text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
