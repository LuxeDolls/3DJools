import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

type Row = {
  id: number
  applicationRef: string
  status: string
  firstName: string
  lastName: string
  email: string
  country: string
  totalAmountCents: number
  downPaymentCents: number
  currency: string
  createdAt: Date | string
}

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
}

export function ApplicationsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
        No installment applications yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Country</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Down payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link href={`/admin/applications/${r.id}`} className="font-mono font-medium text-primary hover:underline">
                  {r.applicationRef}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">
                  {r.firstName} {r.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.country}</td>
              <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(r.totalAmountCents, "en")}</td>
              <td className="px-4 py-3 tabular-nums">{formatPrice(r.downPaymentCents, "en")}</td>
              <td className="px-4 py-3">
                <Badge className={`${STATUS_TONE[r.status] ?? ""} border-0`}>{r.status}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
