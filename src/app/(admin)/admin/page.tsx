import { redirect } from "next/navigation"

/** /admin 단독 접근 시 견적서 목록으로 리디렉션 (로그인 여부는 proxy.ts가 먼저 처리) */
export default function AdminRootPage() {
  redirect("/admin/invoices")
}
