import { AdminHeader } from "@/components/admin/AdminHeader"

/** 관리자 라우트 그룹 레이아웃 — 공개 견적서 레이아웃과 완전 분리 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </>
  )
}
