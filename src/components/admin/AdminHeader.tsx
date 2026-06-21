"use client"

import Link from "next/link"
import { FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch {
      toast.error("로그아웃 중 오류가 발생했습니다.")
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* 로고 */}
        <Link href="/admin/invoices" className="flex items-center gap-1.5 shrink-0">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight">Invoce</span>
          <span className="text-xs text-muted-foreground ml-1">관리자</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-4">
          <Link
            href="/admin/invoices"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            견적서 목록
          </Link>
          <Link
            href="/admin/invoices/new"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            견적서 작성
          </Link>
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
