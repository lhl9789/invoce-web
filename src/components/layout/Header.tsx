import Link from "next/link"
import { FileText } from "lucide-react"
import { ROUTES } from "@/constants/routes"

interface HeaderProps {
  showNav?: boolean
}

// 공통 헤더 컴포넌트
export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 font-bold">
          <FileText className="h-5 w-5" />
          Invoce
        </Link>
        {/* TODO: 인증 상태에 따른 네비게이션 렌더링 */}
        {showNav && (
          <nav className="flex items-center gap-2">
            {/* TODO: useAuth 훅으로 인증 상태 확인 후 렌더링 */}
          </nav>
        )}
      </div>
    </header>
  )
}
