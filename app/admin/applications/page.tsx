import { listApplications } from "@/lib/actions/admin"
import { ApplicationsTable } from "@/components/admin/applications-table"

export const dynamic = "force-dynamic"

export default async function AdminApplicationsPage() {
  const rows = await listApplications()
  const pending = rows.filter((r) => r.status === "pending").length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Installment applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} total · {pending} awaiting review
        </p>
      </div>
      <ApplicationsTable rows={rows} />
    </div>
  )
}
