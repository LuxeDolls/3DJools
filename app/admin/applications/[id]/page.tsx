import Link from "next/link"
import { notFound } from "next/navigation"
import { getApplicationDetail } from "@/lib/actions/admin"
import { ApplicationDetail } from "@/components/admin/application-detail"
import { ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = Number(id)
  if (!Number.isFinite(numId)) notFound()

  const app = await getApplicationDetail(numId)
  if (!app) notFound()

  return (
    <div>
      <Link
        href="/admin/applications"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All applications
      </Link>
      <ApplicationDetail app={app} />
    </div>
  )
}
