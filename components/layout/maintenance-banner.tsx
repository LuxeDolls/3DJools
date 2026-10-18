import { Wrench } from "lucide-react"

export function MaintenanceBanner({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-foreground text-background" role="status">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm leading-6">
        <Wrench className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="text-pretty">
          <span className="font-semibold">{label}.</span> {text}
        </p>
      </div>
    </div>
  )
}
