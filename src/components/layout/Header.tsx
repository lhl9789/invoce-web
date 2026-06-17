import Link from "next/link"
import { FileText } from "lucide-react"
import { ROUTES } from "@/constants/routes"

interface HeaderProps {
  showNav?: boolean
}

// 공통 헤더 컴포넌트
// NOTE: 새 아키텍처(ROADMAP.md)에서는 인증·계정 시스템이 없으며,
// 유일한 라우트인 `/invoice/[id]`는 헤더·푸터 없는 단독 레이아웃을 사용합니다.
// 이 컴포넌트는 현재 어디에서도 import되지 않으며, 향후 필요 여부를 재검토해야 합니다.
export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold">
          <FileText className="h-5 w-5" />
          Invoce
        </Link>
        {showNav && <nav className="flex items-center gap-2" />}
      </div>
    </header>
  )
}
