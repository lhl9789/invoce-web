import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  // 세션 쿠키 삭제 후 로그인 페이지로 리디렉션
  const cookieOptions = deleteSession()
  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  )
  response.cookies.set(cookieOptions)
  return response
}
