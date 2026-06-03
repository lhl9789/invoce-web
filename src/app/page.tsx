import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"

// 루트 경로 접근 시 로그인 페이지로 리디렉션
export default function HomePage() {
  redirect(ROUTES.LOGIN)
}
