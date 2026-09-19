import { Database, FileArchive, FileJson, ShieldAlert } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const exports = [
  {
    href: "/api/admin/backup/database",
    icon: Database,
    title: "Database JSON",
    description: "All public and neon_auth tables, columns, and rows in a portable JSON export.",
    action: "Download database",
  },
  {
    href: "/api/admin/backup/storage-archive",
    icon: FileArchive,
    title: "Storage ZIP",
    description: "All private Blob files downloaded into a single ZIP archive.",
    action: "Download storage",
  },
  {
    href: "/api/admin/backup/storage-manifest",
    icon: FileJson,
    title: "Storage manifest",
    description: "A lightweight inventory with paths, sizes, timestamps, ETags, and download URLs.",
    action: "Download manifest",
  },
]

export default function AdminBackupsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Data protection</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight">Backups</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Export the database and storage separately. Keep downloaded backups encrypted and outside the project repository.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {exports.map(({ href, icon: Icon, title, description, action }) => (
          <Link
            key={href}
            href={href}
            className="group flex min-h-52 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
            <h2 className="mt-6 font-sans text-base font-semibold">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
            <span className="mt-5 text-sm font-semibold text-primary">{action} →</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-foreground">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p>
          The database export includes authentication records, including password hashes and active session data. Store it securely, encrypt it, and never commit it to GitHub.
        </p>
      </div>
    </div>
  )
}
