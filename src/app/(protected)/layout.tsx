// 로그인 필수 레이아웃 — 미인증 사용자는 미들웨어에서 /login으로 리다이렉트

import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 앱 헤더 */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5" />
            Invoce
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.SETTINGS_NOTION}>Notion 연동</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.DASHBOARD}>내 견적서</Link>
            </Button>
            {/* TODO: 로그아웃 버튼 (인증 구현 후 추가) */}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
